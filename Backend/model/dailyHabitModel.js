import { getPool } from '../config/db.js';

const normalizeHabitRow = (row) => {
  if (!row) return row;
  const {
    habit_name,
    created_at,
    updated_at,
    ...rest
  } = row;

  return {
    ...rest,
    habitName: habit_name,
    createdAt: created_at,
    updatedAt: updated_at,
  };
};


const formatDateToString = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    // Use CA locale to get YYYY-MM-DD format consistently
    try {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    } catch (e) {
        return date.toISOString().split('T')[0];
    }
};

const DailyHabit = {
  async create(habitData) {
    const { habitName, description, color, icon, owner } = habitData;
    const result = await getPool().query(
      `INSERT INTO daily_habits (habit_name, description, color, icon, owner) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [habitName, description || '', color || 'purple', icon || 'star', owner]
    );
    return normalizeHabitRow(result.rows[0]);
  },

  async save() {
    return await DailyHabit.create(this);
  },

  async find({ owner }) {
    const habitsResult = await getPool().query(
      'SELECT * FROM daily_habits WHERE owner = $1 ORDER BY created_at DESC',
      [owner]
    );
    
    const habits = await Promise.all(habitsResult.rows.map(async (habitRow) => {
      const habit = normalizeHabitRow(habitRow);
      const completionsResult = await getPool().query(
        'SELECT completion_date FROM daily_habit_completions WHERE habit_id = $1 ORDER BY completion_date DESC',
        [habit.id]
      );
      habit.completions = completionsResult.rows.map(row => formatDateToString(row.completion_date));
      return habit;
    }));
    
    return habits;
  },

  async findOne({ _id, owner }) {
    const habitResult = await getPool().query(
      'SELECT * FROM daily_habits WHERE id = $1 AND owner = $2',
      [_id, owner]
    );
    
    if (habitResult.rows.length === 0) return null;
    
    const habit = normalizeHabitRow(habitResult.rows[0]);
    const completionsResult = await getPool().query(
      'SELECT completion_date FROM daily_habit_completions WHERE habit_id = $1 ORDER BY completion_date DESC',
      [habit.id]
    );
    habit.completions = completionsResult.rows.map(row => formatDateToString(row.completion_date));
    
    return habit;
  },

  async findById(habitId) {
    const habitResult = await getPool().query(
      'SELECT * FROM daily_habits WHERE id = $1',
      [habitId]
    );
    
    if (habitResult.rows.length === 0) return null;
    
    const habit = normalizeHabitRow(habitResult.rows[0]);
    const completionsResult = await getPool().query(
      'SELECT completion_date FROM daily_habit_completions WHERE habit_id = $1 ORDER BY completion_date DESC',
      [habit.id]
    );
    habit.completions = completionsResult.rows.map(row => formatDateToString(row.completion_date));
    
    return habit;
  },

  async updateHabit(habitId, updates) {
    const { habitName, description, color, icon, completions } = updates;
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (habitName !== undefined) {
      fields.push(`habit_name = $${paramCount}`);
      values.push(habitName);
      paramCount++;
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (color !== undefined) {
      fields.push(`color = $${paramCount}`);
      values.push(color);
      paramCount++;
    }
    if (icon !== undefined) {
      fields.push(`icon = $${paramCount}`);
      values.push(icon);
      paramCount++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(habitId);

    const result = await getPool().query(
      `UPDATE daily_habits SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (completions !== undefined) {
      await getPool().query(
        'DELETE FROM daily_habit_completions WHERE habit_id = $1',
        [habitId]
      );
      
      if (completions.length > 0) {
        const completionValues = completions.map((date, idx) => 
          `($1, $${idx + 2})`
        ).join(', ');
        
        await getPool().query(
          `INSERT INTO daily_habit_completions (habit_id, completion_date) VALUES ${completionValues}`,
          [habitId, ...completions]
        );
      }
    }

    return await DailyHabit.findById(habitId);
  },

  async findOneAndDelete({ _id, owner }) {
    const result = await getPool().query(
      'DELETE FROM daily_habits WHERE id = $1 AND owner = $2 RETURNING *',
      [_id, owner]
    );
    return normalizeHabitRow(result.rows[0]);
  },

  sort() {
    return this;
  }
};

export default DailyHabit;