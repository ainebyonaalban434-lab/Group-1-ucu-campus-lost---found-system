import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

// Trust the hosting proxy only in production.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

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

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      message: 'UCU Lost and Found API is running.',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check database query failed:', error.message);

    res.status(503).json({
      status: 'error',
      message: 'The service is temporarily unavailable.',
      database: 'disconnected',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler.
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';
  res.status(statusCode).json({ message });
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
