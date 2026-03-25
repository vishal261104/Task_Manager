import mongoose from 'mongoose';
import 'dotenv/config';

async function setupDatabase() {
  const rawConnectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
  const connectionString = (rawConnectionString || '').trim();

  if (!connectionString) {
    console.error('Failed to connect to database: Missing MONGODB_URI (or DATABASE_URL).');
    process.exitCode = 1;
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionString);
    console.log('MongoDB connection successful.');
    console.log('Database is ready. Collections will be auto-created when data is inserted.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setupDatabase();
