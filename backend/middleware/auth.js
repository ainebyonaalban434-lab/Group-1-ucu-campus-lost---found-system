
import pool from '../config/db.js';

// Retrieve the current user from the database.
async function getSessionUser(req) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, role
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [req.session.userId]
  );

  return rows[0] || null;
}

// Invalidate sessions belonging to deleted accounts.
function rejectInvalidSession(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error('Session destruction failed:', error.message);
    }
  });

  return res.status(401).json({
    message: 'Your session is no longer valid. Please log in again.',
  });
}

// Verify that the user is authenticated and still exists.
export async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  try {
    const user = await getSessionUser(req);

    if (!user) {
      return rejectInvalidSession(req, res);
    }

    // Refresh session information using the current database record.
    req.session.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
}

// Verify that the authenticated user currently has administrator privileges.
export async function requireAdmin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  try {
    const user = await getSessionUser(req);

    if (!user) {
      return rejectInvalidSession(req, res);
    }

    // Never trust an old role stored in the session.
    req.session.user = user;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Administrator access required.',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
