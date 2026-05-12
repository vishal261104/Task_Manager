import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: { type: Date, default: null },
  reminderSentAt: { type: Date, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Completed'],
    default: 'Pending'
  }
}, { timestamps: true });

const TaskModel = mongoose.model('Task', taskSchema);

const normalizeTaskRow = (doc) => {
  if (!doc) return doc;
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    priority: doc.priority,
    dueDate: doc.dueDate,
    reminderSentAt: doc.reminderSentAt,
    owner: doc.owner,
    completed: doc.completed,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const Task = {
  async create(taskData) {
    const { title, description, priority, dueDate, completed, owner } = taskData;
    const task = new TaskModel({
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      completed: completed || false,
      owner
    });
    const saved = await task.save();
    return normalizeTaskRow(saved);
  },

  async save() {
    return await Task.create(this);
  },

  async find({ owner }) {
    const tasks = await TaskModel.find({ owner }).sort({ createdAt: -1 });
    return tasks.map(normalizeTaskRow);
  },

  async findDueForDate({ owner, start, end }) {
    const tasks = await TaskModel.find({
      owner,
      completed: false,
      dueDate: { $gte: start, $lte: end },
      $or: [
        { reminderSentAt: null },
        { reminderSentAt: { $exists: false } },
        { reminderSentAt: { $lt: start } }
      ]
    }).sort({ dueDate: 1 });
    return tasks.map(normalizeTaskRow);
  },

  async findDueForDateAny({ owner, start, end }) {
    const tasks = await TaskModel.find({
      owner,
      completed: false,
      dueDate: { $gte: start, $lte: end }
    }).sort({ dueDate: 1 });
    return tasks.map(normalizeTaskRow);
  },

  async markReminded(taskIds) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return;
    await TaskModel.updateMany(
      { _id: { $in: taskIds } },
      { $set: { reminderSentAt: new Date() } }
    );
  },

  async findOne({ _id, id, owner }) {
    const taskId = id || _id;
    const task = await TaskModel.findOne({ _id: taskId, owner });
    return normalizeTaskRow(task);
  },

  async findOneAndUpdate({ _id, id, owner }, updates, options = {}) {
    const taskId = id || _id;
    const allowedKeys = new Set([
      'title',
      'description',
      'priority',
      'dueDate',
      'completed',
      'status',
    ]);

    const filteredUpdates = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedKeys.has(key)) {
        filteredUpdates[key] = value;
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return Task.findOne({ id: taskId, owner });
    }

    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, owner },
      filteredUpdates,
      { new: true }
    );
    return normalizeTaskRow(task);
  },

  async findOneAndDelete({ _id, id, owner }) {
    const taskId = id || _id;
    const task = await TaskModel.findOneAndDelete({ _id: taskId, owner });
    return normalizeTaskRow(task);
  },

  sort() {
    return this;
  }
};

export default Task;
