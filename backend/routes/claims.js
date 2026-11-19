
import express from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  let connection;
  let transactionActive = false;

  try {
    const itemReportId = Number(req.body.itemReportId);
    const evidence = String(req.body.evidence || '').trim();

    if (!Number.isSafeInteger(itemReportId) || itemReportId <= 0 || !evidence) {
      return res.status(400).json({
        message: 'A valid item id and ownership evidence are required.',
      });
    }

    if (evidence.length > 5000) {
      return res.status(400).json({
        message: 'Ownership evidence must not exceed 5000 characters.',
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

    // Lock the report to coordinate concurrent claims and admin actions.
    const [reportRows] = await connection.execute(
      'SELECT id, reporter_id, item_type, status FROM item_reports WHERE id = ? FOR UPDATE',
      [itemReportId]
    );

    if (!reportRows.length) {
      return await rejectRequest(404, 'Report not found.');
    }

    const report = reportRows[0];

    if (Number(report.reporter_id) === Number(req.session.userId)) {
      return await rejectRequest(
        400,
        'You cannot claim an item you reported as found.'
      );
    }

    if (report.item_type !== 'FOUND') {
      return await rejectRequest(
        400,
        'Ownership claims are only allowed for found items.'
      );
    }

    if (report.status === 'RETURNED') {
      return await rejectRequest(
        400,
        'This item has already been returned and no more claims may be submitted.'
      );
    }

    const [claimRows] = await connection.execute(
      'SELECT id FROM claims WHERE item_report_id = ? AND claimant_id = ? LIMIT 1',
      [itemReportId, req.session.userId]
    );

    if (claimRows.length) {
      return await rejectRequest(
        409,
        'You have already submitted a claim for this item.'
      );
    }

    const [approvedRows] = await connection.execute(
      'SELECT id FROM claims WHERE item_report_id = ? AND status = ? LIMIT 1',
      [itemReportId, 'APPROVED']
    );

    if (approvedRows.length) {
      return await rejectRequest(
        409,
        'Only one claim may be approved for this item.'
      );
    }

    const [result] = await connection.execute(
      'INSERT INTO claims (item_report_id, claimant_id, evidence, status) VALUES (?, ?, ?, ?)',
      [itemReportId, req.session.userId, evidence, 'PENDING']
    );

    await connection.commit();
    transactionActive = false;

    return res.status(201).json({
      message: 'Claim submitted successfully.',
      claimId: result.insertId,
    });
  } catch (error) {
    if (connection && transactionActive) {
      await connection.rollback().catch(() => {});
      transactionActive = false;
    }

    // Handle duplicate claims enforced by the database unique index.
    if (
      error.code === 'ER_DUP_ENTRY' &&
      error.message?.includes('uq_claims_item_claimant')
    ) {
      return res.status(409).json({
        message: 'You have already submitted a claim for this item.',
      });
    }

    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         c.id,
         c.item_report_id,
         c.claimant_id,
         c.status,
         c.admin_response,
         c.reviewed_by,
         c.created_at,
         c.updated_at,
         r.title AS item_title,
         r.item_type,
         r.status AS report_status,
         u.full_name AS claimant_name,
         fr.full_name AS reporter_name
       FROM claims c
       JOIN item_reports r ON r.id = c.item_report_id
       JOIN users u ON u.id = c.claimant_id
       JOIN users fr ON fr.id = r.reporter_id
       WHERE c.claimant_id = ?
       ORDER BY c.created_at DESC`,
      [req.session.userId]
    );

    return res.json({ claims: rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/evidence', requireAuth, async (req, res, next) => {
  try {
    const claimId = Number(req.params.id);

    if (!Number.isSafeInteger(claimId) || claimId <= 0) {
      return res.status(400).json({ message: 'Invalid claim id.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, claimant_id, evidence FROM claims WHERE id = ?',
      [claimId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const claim = rows[0];
    const isOwner =
      Number(claim.claimant_id) === Number(req.session.userId);

    // Claimants can access their own evidence.
    if (isOwner) {
      return res.json({ evidence: claim.evidence });
    }

    // Verify the current role in the database.
    const [userRows] = await pool.execute(
      'SELECT role FROM users WHERE id = ? LIMIT 1',
      [req.session.userId]
    );

    if (!userRows.length) {
      req.session.destroy(() => {});

      return res.status(401).json({
        message: 'Your session is no longer valid. Please log in again.',
      });
    }

    if (userRows[0].role !== 'ADMIN') {
      return res.status(403).json({
        message: 'You may only access your own claim evidence or administrator review data.',
      });
    }

    return res.json({ evidence: claim.evidence });
  } catch (error) {
    return next(error);
  }
});

export default router;
