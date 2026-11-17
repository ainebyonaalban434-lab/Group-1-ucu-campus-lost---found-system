import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const router = express.Router();

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();
const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

router.post('/register', async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [fullName, email, passwordHash, 'STUDENT']
    );

    await regenerateSession(req);

    req.session.userId = result.insertId;
    req.session.user = {
      id: result.insertId,
      full_name: fullName,
      email,
      role: 'STUDENT',
    };

    await saveSession(req);

    return res.status(201).json({
      message: 'Student account created successfully.',
      user: req.session.user,
    });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };

    await regenerateSession(req);

    req.session.userId = user.id;
    req.session.user = safeUser;

    await saveSession(req);

    return res.status(200).json({
      message: 'Login successful.',
      user: safeUser,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: 'Unable to end the session.' });
    }

    res.clearCookie('ucu.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

    return res.status(200).json({ message: 'Logged out successfully.' });
  });
});

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.json({ user: null });
    }

    const [rows] = await pool.execute(
      'SELECT id, full_name, email, role FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (!rows.length) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    const user = rows[0];
    req.session.user = user;

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

router.post('/setup-admin', async (req, res, next) => {
  let connection;
  let lockAcquired = false;

  try {
    const providedKey = String(
      req.body.setupKey || req.headers['x-admin-setup-key'] || ''
    );
    const adminSetupKey = process.env.ADMIN_SETUP_KEY;

    if (
      !adminSetupKey ||
      !providedKey ||
      Buffer.byteLength(providedKey) !== Buffer.byteLength(adminSetupKey) ||
      !timingSafeEqual(
        Buffer.from(providedKey),
        Buffer.from(adminSetupKey)
      )
    ) {
      return res.status(403).json({
        message: 'Admin setup key is invalid or missing.',
      });
    }

    const fullName = String(req.body.fullName || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Administrator password must be at least 8 characters long.',
      });
    }

    // Hash before acquiring the database lock.
    const passwordHash = await bcrypt.hash(password, 10);

    connection = await pool.getConnection();

    // Only one setup request can execute this protected section at a time.
    const [lockRows] = await connection.execute(
      'SELECT GET_LOCK(?, 10) AS lockAcquired',
      ['ucu_lost_found_admin_setup']
    );

    if (Number(lockRows[0]?.lockAcquired) !== 1) {
      return res.status(503).json({
        message: 'Administrator setup is busy. Please try again.',
      });
    }

    lockAcquired = true;

    // Refuse setup if any administrator already exists.
    const [admins] = await connection.execute(
      "SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1"
    );

    if (admins.length > 0) {
      return res.status(409).json({
        message: 'An administrator account has already been created.',
      });
    }

    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [fullName, email, passwordHash, 'ADMIN']
    );

    return res.status(201).json({
      message: 'Administrator account created successfully.',
      userId: result.insertId,
    });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    return next(error);
  } finally {
    if (connection) {
      if (lockAcquired) {
        try {
          await connection.execute(
            'SELECT RELEASE_LOCK(?)',
            ['ucu_lost_found_admin_setup']
          );
        } catch (releaseError) {
          console.error('Admin setup lock release failed:', releaseError.message);
        }
      }

      connection.release();
    }
  }
});
export default router;
