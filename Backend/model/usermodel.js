import { getPool } from '../config/db.js';

const User = {
  async create({ name, email, password }) {
    const result = await getPool().query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, streak, last_streak_date, created_at',
      [name, email, password]
    );
    return result.rows[0];
  },

  async findOne({ email, _id }) {
    if (_id) {
      const result = await getPool().query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [email, _id.$ne]
      );
      return result.rows[0];
    }
    const result = await getPool().query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(userId) {
    const result = await getPool().query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  },

  async findByIdAndUpdate(userId, updates, options = {}) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(userId);
    const result = await getPool().query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, name, email, streak, last_streak_date`,
      values
    );
    return result.rows[0];
  },

  async updatePassword(userId, newPassword) {
    const result = await getPool().query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [newPassword, userId]
    );
    return result.rows[0];
  },

  async findByIdWithBadges(userId) {
    const userResult = await getPool().query(
      'SELECT id, name, email, streak, last_streak_date, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) return null;
    
    const badgesResult = await getPool().query(
      'SELECT name, earned_at, streak_required FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC',
      [userId]
    );
    
    const user = userResult.rows[0];
    user.badges = badgesResult.rows;
    return user;
  },

  async updateStreak(userId, streak, lastStreakDate) {
    const result = await getPool().query(
      'UPDATE users SET streak = $1, last_streak_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [streak, lastStreakDate, userId]
    );
    return result.rows[0];
  },

  async addBadge(userId, badge) {
    await getPool().query(
      'INSERT INTO user_badges (user_id, name, streak_required) VALUES ($1, $2, $3)',
      [userId, badge.name, badge.streakRequired]
    );
  },

  select(fields) {
    return this;
  }
};

export default User;
