import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

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
    const rawConnectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
    const connectionString = (rawConnectionString || '').trim();

    if (!connectionString) {
      logger.error('Database connection failed', {
        reason: 'Missing MONGODB_URI/DATABASE_URL',
        hasMongodbUri: Boolean(process.env.MONGODB_URI),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        nodeEnv: process.env.NODE_ENV,
      });
      throw new Error('Missing MONGODB_URI (or DATABASE_URL) environment variable');
    }

    await mongoose.connect(connectionString);

    const source = process.env.MONGODB_URI ? 'MONGODB_URI' : (process.env.DATABASE_URL ? 'DATABASE_URL' : 'unknown');
    logger.info('Database connected', { source });

    return mongoose.connection;
  } catch (error) {
    logger.error('Database connection failed', {
      message: error?.message || String(error),
      connectionString: redactConnectionString((process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim()),
      nodeEnv: process.env.NODE_ENV,
    });
    throw error;
  }
};

export const getConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return mongoose.connection;
};
