import express from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const validItemTypes = ['LOST', 'FOUND'];
const validStatuses = ['OPEN', 'RETURNED'];

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.reporter_id, r.item_type, r.title, r.category, r.public_description,
              r.item_date, r.campus_location, r.image_url, r.status, r.created_at,
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
      return res.status(400).json({ message: 'Item type must be LOST or FOUND.' });
    }

    if (!title || !category || !publicDescription || !itemDate || !campusLocation) {
      return res.status(400).json({ message: 'Title, category, description, date and campus location are required.' });
    }

    if (itemType === 'FOUND' && !privateDetails) {
      return res.status(400).json({ message: 'Found items must include private identifying details.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO item_reports
       (reporter_id, item_type, title, category, public_description, private_details, item_date, campus_location, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [reporterId, itemType, title, category, publicDescription, privateDetails || null, itemDate, campusLocation, imageUrl || null]
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
    const isOwner = req.session?.userId === report.reporter_id;
    const isAdmin = req.session?.user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      delete report.private_details;
    }

    return res.json({ report });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const reportId = Number(req.params.id);
    const [rows] = await pool.execute('SELECT * FROM item_reports WHERE id = ?', [reportId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const report = rows[0];
    if (report.reporter_id !== req.session.userId) {
      return res.status(403).json({ message: 'You may only edit your own reports.' });
    }

    const title = String(req.body.title || report.title).trim();
    const category = String(req.body.category || report.category).trim();
    const publicDescription = String(req.body.publicDescription || report.public_description).trim();
    const privateDetails = String(req.body.privateDetails ?? report.private_details ?? '').trim();
    const itemDate = String(req.body.itemDate || report.item_date).trim();
    const campusLocation = String(req.body.campusLocation || report.campus_location).trim();
    const imageUrl = String(req.body.imageUrl ?? report.image_url ?? '').trim();

    if (!title || !category || !publicDescription || !itemDate || !campusLocation) {
      return res.status(400).json({ message: 'Title, category, description, date and campus location are required.' });
    }

    if (report.item_type === 'FOUND' && !privateDetails) {
      return res.status(400).json({ message: 'Found items must include private identifying details.' });
    }

    await pool.execute(
      `UPDATE item_reports
       SET title = ?, category = ?, public_description = ?, private_details = ?, item_date = ?, campus_location = ?, image_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, category, publicDescription, privateDetails || null, itemDate, campusLocation, imageUrl || null, reportId]
    );

    return res.json({ message: 'Report updated successfully.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
