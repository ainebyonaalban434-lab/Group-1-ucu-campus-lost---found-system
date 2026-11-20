
import express from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const validItemTypes = ['LOST', 'FOUND'];

function isValidCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1000 || year > 9999) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateReportFields({
  title,
  category,
  publicDescription,
  privateDetails,
  itemDate,
  campusLocation,
  imageUrl,
  itemType,
}) {
  if (!title || !category || !publicDescription || !itemDate || !campusLocation) {
    return 'Title, category, description, date and campus location are required.';
  }

  if (title.length > 150) {
    return 'Title must not exceed 150 characters.';
  }

  if (category.length > 80) {
    return 'Category must not exceed 80 characters.';
  }

  if (publicDescription.length > 5000) {
    return 'Public description must not exceed 5000 characters.';
  }

  if (privateDetails.length > 5000) {
    return 'Private details must not exceed 5000 characters.';
  }

  if (campusLocation.length > 120) {
    return 'Campus location must not exceed 120 characters.';
  }

  if (itemType === 'FOUND' && !privateDetails) {
    return 'Found items must include private identifying details.';
  }

  if (!isValidCalendarDate(itemDate)) {
    return 'Enter a valid item date in YYYY-MM-DD format.';
  }

  if (imageUrl.length > 255) {
    return 'Image URL must not exceed 255 characters.';
  }

  if (imageUrl) {
    try {
      const parsedUrl = new URL(imageUrl);

      if (
        !['http:', 'https:'].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        return 'Image URL must be a valid HTTP or HTTPS address.';
      }
    } catch {
      return 'Image URL must be a valid HTTP or HTTPS address.';
    }
  }

  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.reporter_id, r.item_type, r.title, r.category,
              r.public_description, DATE_FORMAT(r.item_date, '%Y-%m-%d') AS item_date,
              r.campus_location, r.image_url, r.status, r.created_at,
              u.full_name AS reporter_name
       FROM item_reports r
       JOIN users u ON u.id = r.reporter_id
       WHERE r.status = 'OPEN'
       ORDER BY r.created_at DESC`
    );

    return res.json({ reports: rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const reporterId = req.session.userId;
    const itemType = String(req.body.itemType || '').trim().toUpperCase();
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '').trim();
    const publicDescription = String(req.body.publicDescription || '').trim();
    const privateDetails = String(req.body.privateDetails || '').trim();
    const itemDate = String(req.body.itemDate || '').trim();
    const campusLocation = String(req.body.campusLocation || '').trim();
    const imageUrl = String(req.body.imageUrl || '').trim();

    if (!validItemTypes.includes(itemType)) {
      return res.status(400).json({
        message: 'Item type must be LOST or FOUND.',
      });
    }

    const validationError = validateReportFields({
      title,
      category,
      publicDescription,
      privateDetails,
      itemDate,
      campusLocation,
      imageUrl,
      itemType,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const [result] = await pool.execute(
      `INSERT INTO item_reports
       (reporter_id, item_type, title, category, public_description,
        private_details, item_date, campus_location, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        reporterId,
        itemType,
        title,
        category,
        publicDescription,
        privateDetails || null,
        itemDate,
        campusLocation,
        imageUrl || null,
      ]
    );

    return res.status(201).json({
      message: 'Report created successfully.',
      reportId: result.insertId,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, u.full_name AS reporter_name
       FROM item_reports r
       JOIN users u ON u.id = r.reporter_id
       WHERE r.reporter_id = ?
       ORDER BY r.created_at DESC`,
      [req.session.userId]
    );

    return res.json({ reports: rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid report id.' });
    }

    const [rows] = await pool.execute(
      `SELECT r.*, u.full_name AS reporter_name
       FROM item_reports r
       JOIN users u ON u.id = r.reporter_id
       WHERE r.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const report = rows[0];

    const isOwner =
      Number(req.session?.userId) === Number(report.reporter_id);

    let isAdmin = false;

    if (req.session?.userId && !isOwner) {
      const [adminRows] = await pool.execute(
        'SELECT role FROM users WHERE id = ? LIMIT 1',
        [req.session.userId]
      );

      isAdmin =
        adminRows.length > 0 && adminRows[0].role === 'ADMIN';
    }

    if (!isOwner && !isAdmin) {
      delete report.private_details;
    }

    return res.json({ report });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  let connection;
  let transactionActive = false;

  try {
    const reportId = Number(req.params.id);

    if (!Number.isSafeInteger(reportId) || reportId <= 0) {
      return res.status(400).json({ message: 'Invalid report id.' });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionActive = true;

    const [rows] = await connection.execute(
      `SELECT *,
              DATE_FORMAT(item_date, '%Y-%m-%d') AS item_date_formatted
       FROM item_reports
       WHERE id = ?
       FOR UPDATE`,
      [reportId]
    );

    if (!rows.length) {
      await connection.rollback();
      transactionActive = false;

      return res.status(404).json({ message: 'Report not found.' });
    }

    const report = rows[0];

    if (Number(report.reporter_id) !== Number(req.session.userId)) {
      await connection.rollback();
      transactionActive = false;

      return res.status(403).json({
        message: 'You may only edit your own reports.',
      });
    }

    if (report.status === 'RETURNED') {
      await connection.rollback();
      transactionActive = false;

      return res.status(409).json({
        message: 'Returned reports cannot be edited.',
      });
    }

    const title = String(req.body.title ?? report.title).trim();
    const category = String(req.body.category ?? report.category).trim();
    const publicDescription = String(
      req.body.publicDescription ?? report.public_description
    ).trim();
    const privateDetails = String(
      req.body.privateDetails ?? report.private_details ?? ''
    ).trim();
    const itemDate = String(
      req.body.itemDate ?? report.item_date_formatted
    ).trim();
    const campusLocation = String(
      req.body.campusLocation ?? report.campus_location
    ).trim();
    const imageUrl = String(
      req.body.imageUrl ?? report.image_url ?? ''
    ).trim();

    const validationError = validateReportFields({
      title,
      category,
      publicDescription,
      privateDetails,
      itemDate,
      campusLocation,
      imageUrl,
      itemType: report.item_type,
    });

    if (validationError) {
      await connection.rollback();
      transactionActive = false;

      return res.status(400).json({ message: validationError });
    }

    await connection.execute(
      `UPDATE item_reports
       SET title = ?, category = ?, public_description = ?, private_details = ?,
           item_date = ?, campus_location = ?, image_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        category,
        publicDescription,
        privateDetails || null,
        itemDate,
        campusLocation,
        imageUrl || null,
        reportId,
      ]
    );

    await connection.commit();
    transactionActive = false;

    return res.json({ message: 'Report updated successfully.' });
  } catch (error) {
    if (connection && transactionActive) {
      try {
        await connection.rollback();
      } catch {
        // Preserve the original error if rollback also fails.
      }

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
