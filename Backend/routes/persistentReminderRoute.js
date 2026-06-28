import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  snoozeReminder,
} from '../controller/persistentReminderController.js';

const persistentReminderRouter = express.Router();

persistentReminderRouter.use(authMiddleware);

persistentReminderRouter.route('/').get(getReminders).post(createReminder);
persistentReminderRouter.route('/:id').put(updateReminder).delete(deleteReminder);
persistentReminderRouter.route('/:id/snooze').post(snoozeReminder);

export default persistentReminderRouter;
