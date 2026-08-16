import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure unique tag names per user
tagSchema.index({ name: 1, owner: 1 }, { unique: true });

const vaultItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['NOTE', 'IMAGE', 'PDF'],
    required: true
  },
  content: { type: mongoose.Schema.Types.Mixed, default: null }, // Store Tiptap JSON
  description: { type: String, default: '' },
  fileUrl: { type: String, default: null }, // For signed URLs or direct links
  filePath: { type: String, default: null }, // Supabase Storage path
  fileName: { type: String, default: null },
  fileSize: { type: Number, default: null },
  isFavorite: { type: Boolean, default: false },
  isInbox: { type: Boolean, default: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

vaultItemSchema.index({ owner: 1, type: 1 });
vaultItemSchema.index({ owner: 1, isFavorite: 1 });
vaultItemSchema.index({ owner: 1, isInbox: 1 });

export const Tag = mongoose.model('Tag', tagSchema);
export const VaultItem = mongoose.model('VaultItem', vaultItemSchema);
