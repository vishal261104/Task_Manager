import mongoose from 'mongoose';
import 'dotenv/config';
import Task from './model/taskModel.js';
import User from './model/usermodel.js';
import dailyHabit from './model/dailyHabitModel.js';
import { VaultItem, Tag } from './model/vaultModel.js';
import PersistentReminder from './model/persistentReminderModel.js';

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
    console.log('Syncing indexes for optimal query performance...');
    await Promise.all([
      mongoose.model('Task').syncIndexes(),
      mongoose.model('User').syncIndexes(),
      mongoose.model('DailyHabit').syncIndexes(),
      VaultItem.syncIndexes(),
      Tag.syncIndexes(),
      mongoose.model('PersistentReminder').syncIndexes(),
    ]);
    console.log('All collection indexes successfully verified and synced.');
  } catch (error) {
    console.error('Failed to setup MongoDB indexes:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setupDatabase();
