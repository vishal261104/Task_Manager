import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  streakRequired: { type: Number, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },
  last_streak_date: { type: String, default: null },
  badges: [badgeSchema]
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

const User = {
  async create({ name, email, password }) {
    const user = new UserModel({ name, email, password });
    const saved = await user.save();
    return {
      id: saved._id,
      name: saved.name,
      email: saved.email,
      streak: saved.streak,
      last_streak_date: saved.last_streak_date,
      created_at: saved.createdAt
    };
  },

  async findOne({ email, _id }) {
    if (_id) {
      const user = await UserModel.findOne({ email, _id: { $ne: _id.$ne } });
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        streak: user.streak,
        last_streak_date: user.last_streak_date
      };
    }
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      streak: user.streak,
      last_streak_date: user.last_streak_date
    };
  },

  async findById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) return null;
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      streak: user.streak,
      last_streak_date: user.last_streak_date
    };
  },

  async findByIdAndUpdate(userId, updates, options = {}) {
    const user = await UserModel.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return null;
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      last_streak_date: user.last_streak_date
    };
  },

  async updatePassword(userId, newPassword) {
    const user = await UserModel.findByIdAndUpdate(userId, { password: newPassword }, { new: true });
    if (!user) return null;
    return { id: user._id };
  },

  async findByIdWithBadges(userId) {
    const user = await UserModel.findById(userId);
    if (!user) return null;
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      last_streak_date: user.last_streak_date,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      badges: user.badges.map(b => ({
        name: b.name,
        earned_at: b.earnedAt,
        streak_required: b.streakRequired
      }))
    };
  },

  async updateStreak(userId, streak, lastStreakDate) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { streak, last_streak_date: lastStreakDate },
      { new: true }
    );
    if (!user) return null;
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      last_streak_date: user.last_streak_date
    };
  },

  async addBadge(userId, badge) {
    await UserModel.findByIdAndUpdate(
      userId,
      { $push: { badges: { name: badge.name, streakRequired: badge.streakRequired } } }
    );
  },

  select(fields) {
    return this;
  }
};

export default User;
