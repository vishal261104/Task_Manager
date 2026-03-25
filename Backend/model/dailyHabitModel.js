import mongoose from 'mongoose';

const dailyHabitSchema = new mongoose.Schema({
  habitName: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  color: { type: String, default: 'purple' },
  icon: { type: String, default: 'star' },
  completions: [{ type: String }]
}, { timestamps: true });

const DailyHabitModel = mongoose.model('DailyHabit', dailyHabitSchema);

const normalizeHabitRow = (doc) => {
  if (!doc) return doc;
  return {
    id: doc._id,
    habitName: doc.habitName,
    description: doc.description,
    owner: doc.owner,
    color: doc.color,
    icon: doc.icon,
    completions: doc.completions || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const DailyHabit = {
  async create(habitData) {
    const { habitName, description, color, icon, owner } = habitData;
    const habit = new DailyHabitModel({
      habitName,
      description: description || '',
      color: color || 'purple',
      icon: icon || 'star',
      owner,
      completions: []
    });
    const saved = await habit.save();
    return normalizeHabitRow(saved);
  },

  async save() {
    return await DailyHabit.create(this);
  },

  async find({ owner }) {
    const habits = await DailyHabitModel.find({ owner }).sort({ createdAt: -1 });
    return habits.map(normalizeHabitRow);
  },

  async findOne({ _id, owner }) {
    const habit = await DailyHabitModel.findOne({ _id, owner });
    return normalizeHabitRow(habit);
  },

  async findById(habitId) {
    const habit = await DailyHabitModel.findById(habitId);
    return normalizeHabitRow(habit);
  },

  async updateHabit(habitId, updates) {
    const { habitName, description, color, icon, completions } = updates;

    const updateData = {};
    if (habitName !== undefined) updateData.habitName = habitName;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (completions !== undefined) updateData.completions = completions;

    const habit = await DailyHabitModel.findByIdAndUpdate(
      habitId,
      updateData,
      { new: true }
    );
    return normalizeHabitRow(habit);
  },

  async findOneAndDelete({ _id, owner }) {
    const habit = await DailyHabitModel.findOneAndDelete({ _id, owner });
    return normalizeHabitRow(habit);
  },

  sort() {
    return this;
  }
};

export default DailyHabit;
