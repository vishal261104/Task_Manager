import mongoose from 'mongoose';
import 'dotenv/config';
import Task from '../model/taskModel.js';
import dailyHabit from '../model/dailyHabitModel.js';
import { VaultItem } from '../model/vaultModel.js';
import PersistentReminder from '../model/persistentReminderModel.js';
import User from '../model/usermodel.js';

async function analyzeQueries() {
  const connectionString = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
  if (!connectionString) {
    console.error('Missing MONGODB_URI/DATABASE_URL');
    process.exit(1);
  }

  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB. Running explain("executionStats") on critical queries...\n');

    const dummyUserId = new mongoose.Types.ObjectId();

    // 1. Task query
    console.log('--- 1. Task Query: find({ owner }).sort({ createdAt: -1 }) ---');
    const taskModel = mongoose.model('Task');
    const taskExplain = await taskModel.find({ owner: dummyUserId }).sort({ createdAt: -1 }).explain('executionStats');
    console.log(`Winning Plan Stage: ${taskExplain.queryPlanner?.winningPlan?.stage || taskExplain.queryPlanner?.winningPlan?.inputStage?.stage}`);
    console.log(`Index Used: ${taskExplain.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Total Docs Examined: ${taskExplain.executionStats?.totalDocsExamined}`);
    console.log(`Execution Time: ${taskExplain.executionStats?.executionTimeMillis}ms\n`);

    // 2. VaultItem query
    console.log('--- 2. VaultItem Query: find({ owner }).sort({ createdAt: -1 }) ---');
    const vaultExplain = await VaultItem.find({ owner: dummyUserId }).sort({ createdAt: -1 }).explain('executionStats');
    console.log(`Winning Plan Stage: ${vaultExplain.queryPlanner?.winningPlan?.stage || vaultExplain.queryPlanner?.winningPlan?.inputStage?.stage}`);
    console.log(`Index Used: ${vaultExplain.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Total Docs Examined: ${vaultExplain.executionStats?.totalDocsExamined}`);
    console.log(`Execution Time: ${vaultExplain.executionStats?.executionTimeMillis}ms\n`);

    // 3. DailyHabit query
    console.log('--- 3. DailyHabit Query: find({ owner }).sort({ createdAt: -1 }) ---');
    const habitModel = mongoose.model('DailyHabit');
    const habitExplain = await habitModel.find({ owner: dummyUserId }).sort({ createdAt: -1 }).explain('executionStats');
    console.log(`Winning Plan Stage: ${habitExplain.queryPlanner?.winningPlan?.stage || habitExplain.queryPlanner?.winningPlan?.inputStage?.stage}`);
    console.log(`Index Used: ${habitExplain.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Total Docs Examined: ${habitExplain.executionStats?.totalDocsExamined}`);
    console.log(`Execution Time: ${habitExplain.executionStats?.executionTimeMillis}ms\n`);

    // 4. PersistentReminder query
    console.log('--- 4. PersistentReminder Query: find({ owner }).sort({ createdAt: -1 }) ---');
    const reminderModel = mongoose.model('PersistentReminder');
    const reminderExplain = await reminderModel.find({ owner: dummyUserId }).sort({ createdAt: -1 }).explain('executionStats');
    console.log(`Winning Plan Stage: ${reminderExplain.queryPlanner?.winningPlan?.stage || reminderExplain.queryPlanner?.winningPlan?.inputStage?.stage}`);
    console.log(`Index Used: ${reminderExplain.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Total Docs Examined: ${reminderExplain.executionStats?.totalDocsExamined}`);
    console.log(`Execution Time: ${reminderExplain.executionStats?.executionTimeMillis}ms\n`);

    console.log('Query explain analysis complete.');
  } catch (err) {
    console.error('Explain analysis error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeQueries();

