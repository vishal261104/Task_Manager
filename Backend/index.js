import express from 'express';
import mongoose from 'mongoose';
import { connectDB }  from './config/db.js';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';
import dailyHabitRouter from './routes/dailyHabitRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRouter);
app.use('/api/daily-habits', dailyHabitRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();