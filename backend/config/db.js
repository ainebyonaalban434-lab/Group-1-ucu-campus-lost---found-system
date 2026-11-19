import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Require explicit database configuration.
// Never fall back to root or an empty database password.
const requiredDatabaseVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
];

const missingVariables = requiredDatabaseVariables.filter(
  (name) => !process.env[name]?.trim()
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingVariables.join(', ')}`
  );
}

const databasePort = Number(process.env.DB_PORT);

if (
  !Number.isInteger(databasePort) ||
  databasePort < 1 ||
  databasePort > 65535
) {
  throw new Error('DB_PORT must be a valid port number between 1 and 65535.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: databasePort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
});

export default pool;
