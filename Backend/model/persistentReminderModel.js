import mongoose from 'mongoose';

const persistentReminderSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  snoozedUntil: { type: Date, default: null },
}, { timestamps: true });

persistentReminderSchema.index({ owner: 1, createdAt: -1 });
persistentReminderSchema.index({ owner: 1, snoozedUntil: 1 });

const PersistentReminderModel = mongoose.model('PersistentReminder', persistentReminderSchema);

const normalizeRow = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id,
    text: doc.text,
    owner: doc.owner,
    snoozedUntil: doc.snoozedUntil,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const PersistentReminder = {
  async create({ text, owner }) {
    const doc = await PersistentReminderModel.create({ text, owner });
    return normalizeRow(doc);
  },

  async findByOwner(owner) {
    const docs = await PersistentReminderModel.find({ owner }).sort({ createdAt: -1 }).lean();
    return docs.map(normalizeRow);
  },

  async findOne({ _id, owner }) {
    const doc = await PersistentReminderModel.findOne({ _id, owner }).lean();
    return normalizeRow(doc);
  },

  async update({ _id, owner }, updates) {
    const allowed = {};
    if (updates.text !== undefined) allowed.text = updates.text;
    if (updates.snoozedUntil !== undefined) allowed.snoozedUntil = updates.snoozedUntil;
    const doc = await PersistentReminderModel.findOneAndUpdate(
      { _id, owner },
      allowed,
      { new: true }
    );
    return normalizeRow(doc);
  },

  async delete({ _id, owner }) {
    const doc = await PersistentReminderModel.findOneAndDelete({ _id, owner });
    return normalizeRow(doc);
  },
};

export default PersistentReminder;
