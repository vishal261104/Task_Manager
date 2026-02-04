import pg from "pg";
const { Pool } = pg;
import { logger } from "../utils/logger.js";

let pool;

const redactConnectionString = (connectionString) => {
  if (!connectionString) return '';
  try {
    const url = new URL(connectionString);
    if (url.password) url.password = '***';
    return url.toString();
  } catch {
    return '[unparseable connection string]';
  }
};

export const connectDB = async () => {
  try {
    const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URI;
    const connectionString = (rawConnectionString || '').trim();

    if (!connectionString) {
      logger.error('Database connection failed', {
        reason: 'Missing DATABASE_URL/POSTGRES_URI',
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasPostgresUri: Boolean(process.env.POSTGRES_URI),
        nodeEnv: process.env.NODE_ENV,
      });
      throw new Error('Missing DATABASE_URL (or POSTGRES_URI) environment variable');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    client.release();

    const source = process.env.DATABASE_URL ? 'DATABASE_URL' : (process.env.POSTGRES_URI ? 'POSTGRES_URI' : 'unknown');
    logger.info('Database connected', { source });
    
    return pool;
  } catch (error) {
    let parsed = {};
    try {
      const url = new URL((process.env.DATABASE_URL || process.env.POSTGRES_URI || '').trim());
      parsed = { host: url.hostname, port: url.port, database: url.pathname?.replace(/^\//, '') };
    } catch {
      parsed = {};
    }

    logger.error('Database connection failed', {
      message: error?.message || String(error),
      code: error?.code,
      errno: error?.errno,
      address: error?.address,
      port: error?.port,
      ...parsed,
      connectionString: redactConnectionString((process.env.DATABASE_URL || process.env.POSTGRES_URI || '').trim()),
      nodeEnv: process.env.NODE_ENV,
    });
    throw error;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error("Database pool not initialized. Call connectDB first.");
  }
  return pool;
};

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};
