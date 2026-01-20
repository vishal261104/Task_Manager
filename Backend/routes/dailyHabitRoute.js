import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createDailyHabit, getDailyHabits, getDailyHabitById, updateDailyHabitById, deleteDailyHabitById ,toggleCompletion, getHabitProgress } from '../controller/dailyHabitController.js';

const dailyHabitRouter = express.Router();

dailyHabitRouter.route('/gp').get(authMiddleware, getDailyHabits).post(authMiddleware, createDailyHabit);
dailyHabitRouter.route('/progress').get(authMiddleware, getHabitProgress);
dailyHabitRouter.route('/:id/toggle').post(authMiddleware, toggleCompletion);
dailyHabitRouter.route('/:id/gp').get(authMiddleware, getDailyHabitById).put(authMiddleware, updateDailyHabitById).delete(authMiddleware, deleteDailyHabitById);

export default dailyHabitRouter;