import express from 'express';
import { connectDB, getPool }  from './config/db.js';
import cors from 'cors';
import 'dotenv/config';
import { logger } from './utils/logger.js';

import authRoutes from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';
import dailyHabitRouter from './routes/dailyHabitRoute.js';
import badgeRouter from './routes/badgeRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  logger.error('Missing required environment variable', { name: 'JWT_SECRET' });
  process.exit(1);
}

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logger.warn('HTTP request failed', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - start,
      });
    }
  });
  next();
});

app.use('/api/user', authRoutes);
app.use('/api/tasks', taskRouter);
app.use('/api/daily-habits', dailyHabitRouter);
app.use('/api/badges', badgeRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/health', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    logger.error('Healthcheck failed', { message: error?.message });
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message
    });
  }
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info('Server started', { port: PORT, env: process.env.NODE_ENV || 'development' });
    });
  } catch (error) {
    logger.error('Server failed to start', { message: error?.message });
    process.exit(1);
  }
};

startServer();