
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import pool from './config/db.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import claimRoutes from './routes/claims.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const SESSION_DURATION = 1000 * 60 * 60 * 8;

// Required configuration: never use insecure fallback secrets.
const requiredVariables = [
  'SESSION_SECRET',
  'ADMIN_SETUP_KEY',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
];

const missingVariables = requiredVariables.filter(
  (name) => !process.env[name]?.trim()
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(', ')}`
  );
}

const FRONTEND_ORIGIN = new URL(
  process.env.FRONTEND_URL || 'http://localhost:5173'
).origin;

// Trust the hosting proxy only in production.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Apply security middleware.
app.use(helmet());

// General rate limit: 100 requests per IP every 15 minutes.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Stricter limits for sensitive authentication endpoints.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Try again later.',
  },
});

const adminSetupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many administrator setup attempts. Try again later.',
  },
});

// Configure CORS.
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Protect cookie-authenticated browser requests against cross-origin actions.
// Requests without Origin/Referer remain available to API clients such as Postman.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const requestOrigin = req.get('origin');
  const referer = req.get('referer');

  try {
    const suppliedOrigin = requestOrigin
      ? new URL(requestOrigin).origin
      : referer
        ? new URL(referer).origin
        : null;

    if (suppliedOrigin && suppliedOrigin !== FRONTEND_ORIGIN) {
      return res.status(403).json({
        message: 'Request origin is not allowed.',
      });
    }
  } catch {
    return res.status(403).json({
      message: 'Invalid request origin.',
    });
  }

  return next();
});

app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Use the existing MySQL pool for persistent sessions.
const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore(
  {
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: SESSION_DURATION,
    createDatabaseTable: false,
    endConnectionOnClose: false,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  },
  pool
);

// Configure persistent sessions.
app.use(
  session({
    name: 'ucu.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION,
    },
  })
);

// Database health check.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    return res.status(200).json({
      status: 'ok',
      message: 'UCU Lost and Found API is running.',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check database query failed:', error.message);

    return res.status(503).json({
      status: 'error',
      message: 'The service is temporarily unavailable.',
      database: 'disconnected',
    });
  }
});

// Apply specific rate limits before mounting authentication routes.
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/auth/setup-admin', adminSetupLimiter);

// Register application routes.
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler.
app.use((err, req, res, next) => {
  console.error('Request error:', err);

  const requestedStatus = Number(err.statusCode);
  const statusCode =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus < 500
      ? requestedStatus
      : 500;

  const message =
    statusCode === 500
      ? 'An unexpected server error occurred.'
      : err.message || 'The request could not be completed.';

  return res.status(statusCode).json({ message });
});

// Start only after the persistent session store is ready.
let server;

async function startServer() {
  try {
    await sessionStore.onReady();

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('MySQL database connection configured.');
      console.log('Persistent MySQL session store ready.');
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    await sessionStore.close().catch(() => {});
    await pool.end().catch(() => {});
    process.exitCode = 1;
  }
}

// Gracefully close the HTTP server, session store and database pool.
async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await sessionStore.close();
    await pool.end();

    console.log('Backend shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('Shutdown error:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
