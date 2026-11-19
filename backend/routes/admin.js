import express from 'express';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/reports', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, u.full_name AS reporter_name
       FROM item_reports r
       JOIN users u ON u.id = r.reporter_id
       ORDER BY r.created_at DESC`
    );

    return res.json({ reports: rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/claims', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, r.title AS item_title, r.item_type, r.status AS report_status,
              claimant.full_name AS claimant_name, reporter.full_name AS reporter_name,
              reviewer.full_name AS reviewer_name
       FROM claims c
       JOIN item_reports r ON r.id = c.item_report_id
       JOIN users claimant ON claimant.id = c.claimant_id
       JOIN users reporter ON reporter.id = r.reporter_id
       LEFT JOIN users reviewer ON reviewer.id = c.reviewed_by
       ORDER BY c.created_at DESC`
    );

    return res.json({ claims: rows });
  } catch (error) {
    return next(error);
  }
});


router.patch('/claims/:id', async (req, res, next) => {
  let connection;
  let transactionActive = false;

  try {
    const claimId = Number(req.params.id);
    const status = String(req.body.status || '').trim().toUpperCase();
    const adminResponse = String(req.body.adminResponse || '').trim();

    if (!Number.isSafeInteger(claimId) || claimId <= 0) {
      return res.status(400).json({ message: 'Invalid claim id.' });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        message: 'Claim status must be APPROVED or REJECTED.',
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionActive = true;

    const rejectRequest = async (statusCode, message) => {
      await connection.rollback();
      transactionActive = false;
      return res.status(statusCode).json({ message });
    };

    // Read the report ID without locking the claim.
    const [initialRows] = await connection.execute(
      'SELECT item_report_id FROM claims WHERE id = ?',
      [claimId]
    );

    if (!initialRows.length) {
      return await rejectRequest(404, 'Claim not found.');
    }

    const reportId = initialRows[0].item_report_id;

    // Lock the report first, matching claim submission and return workflows.
    const [reportRows] = await connection.execute(
      'SELECT * FROM item_reports WHERE id = ? FOR UPDATE',
      [reportId]
    );

    if (!reportRows.length) {
      return await rejectRequest(404, 'Related report not found.');
    }

    // Lock the claim second.
    const [claimRows] = await connection.execute(
      'SELECT * FROM claims WHERE id = ? AND item_report_id = ? FOR UPDATE',
      [claimId, reportId]
    );

    if (!claimRows.length) {
      return await rejectRequest(404, 'Claim not found.');
    }

    const claim = claimRows[0];
    const report = reportRows[0];

    if (claim.status !== 'PENDING') {
      return await rejectRequest(
        409,
        'This claim has already been reviewed and cannot be changed.'
      );
    }

    if (report.status === 'RETURNED') {
      return await rejectRequest(
        409,
        'Claims cannot be reviewed after the item has been returned.'
      );
    }

    if (status === 'APPROVED') {
      const [existingApproved] = await connection.execute(
        `SELECT id
         FROM claims
         WHERE item_report_id = ?
           AND status = 'APPROVED'
           AND id != ?
         LIMIT 1`,
        [reportId, claimId]
      );

      if (existingApproved.length) {
        return await rejectRequest(
          409,
          'Only one claim may be approved for a particular item.'
        );
      }
    }

    await connection.execute(
      `UPDATE claims
       SET status = ?, admin_response = ?, reviewed_by = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, adminResponse || null, req.session.userId, claimId]
    );

    await connection.commit();
    transactionActive = false;

    return res.json({ message: 'Claim reviewed successfully.' });
  } catch (error) {
    if (connection && transactionActive) {
      await connection.rollback().catch(() => {});
      transactionActive = false;
    }

    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


router.patch('/reports/:id/return', async (req, res, next) => {
  let connection;
  let transactionActive = false;

  try {
    const itemId = Number(req.params.id);

    if (!Number.isSafeInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'Invalid report id.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionActive = true;

    const [rows] = await connection.execute(
      'SELECT * FROM item_reports WHERE id = ? FOR UPDATE',
      [itemId]
    );

    if (!rows.length) {
      await connection.rollback();
      transactionActive = false;
      return res.status(404).json({ message: 'Report not found.' });
    }

    const item = rows[0];

    if (item.status === 'RETURNED') {
      await connection.rollback();
      transactionActive = false;
      return res.status(400).json({
        message: 'This item has already been marked as returned.',
      });
    }

    if (item.item_type === 'FOUND') {
      const [approvedClaims] = await connection.execute(
        'SELECT id FROM claims WHERE item_report_id = ? AND status = ? LIMIT 1',
        [itemId, 'APPROVED']
      );

      if (!approvedClaims.length) {
        await connection.rollback();
        transactionActive = false;
        return res.status(400).json({
          message: 'An approved claim is required before the item can be marked as returned.',
        });
      }
    }

    await connection.execute(
      'UPDATE item_reports SET status = ?, updated_at = NOW() WHERE id = ?',
      ['RETURNED', itemId]
    );

    await connection.commit();
    transactionActive = false;

    return res.json({
      message: 'Item returned and collection confirmed.',
    });
  } catch (error) {
    if (connection && transactionActive) {
      await connection.rollback().catch(() => {});
      transactionActive = false;
    }

    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;