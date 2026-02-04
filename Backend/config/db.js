import pg from "pg";
const { Pool } = pg;
import { logger } from "../utils/logger.js";

let pool;

export const connectDB = async () => {
  try {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URI;
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
    logger.error('Database connection failed', { message: error?.message });
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
