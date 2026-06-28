import PersistentReminder from '../model/persistentReminderModel.js';
import { logger } from '../utils/logger.js';

const MAX_TEXT_LENGTH = 500;

export const getReminders = async (req, res) => {
  try {
    const all = await PersistentReminder.findByOwner(req.user.id);
    res.json({ success: true, data: all });
  } catch (error) {
    logger.error('getReminders failed', { message: error?.message, userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
  }
};

export const createReminder = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }
    if (text.trim().length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ success: false, message: `text must be at most ${MAX_TEXT_LENGTH} characters` });
    }
    const reminder = await PersistentReminder.create({ text: text.trim(), owner: req.user.id });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    logger.error('createReminder failed', { message: error?.message, userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Failed to create reminder' });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (text !== undefined) {
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ success: false, message: 'text cannot be empty' });
      }
      if (text.trim().length > MAX_TEXT_LENGTH) {
        return res.status(400).json({ success: false, message: `text must be at most ${MAX_TEXT_LENGTH} characters` });
      }
    }
    const updated = await PersistentReminder.update(
      { _id: req.params.id, owner: req.user.id },
      { text: text?.trim() }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('updateReminder failed', { message: error?.message, userId: req.user?.id, id: req.params?.id });
    res.status(500).json({ success: false, message: 'Failed to update reminder' });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const deleted = await PersistentReminder.delete({ _id: req.params.id, owner: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    logger.error('deleteReminder failed', { message: error?.message, userId: req.user?.id, id: req.params?.id });
    res.status(500).json({ success: false, message: 'Failed to delete reminder' });
  }
};

export const snoozeReminder = async (req, res) => {
  try {
    const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updated = await PersistentReminder.update(
      { _id: req.params.id, owner: req.user.id },
      { snoozedUntil }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('snoozeReminder failed', { message: error?.message, userId: req.user?.id, id: req.params?.id });
    res.status(500).json({ success: false, message: 'Failed to snooze reminder' });
  }
};
