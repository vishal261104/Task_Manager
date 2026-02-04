import { getPool } from '../config/db.js';

const normalizeTaskRow = (row) => {
  if (!row) return row;
  const {
    due_date,
    created_at,
    updated_at,
    ...rest
  } = row;

  return {
    ...rest,
    dueDate: due_date,
    createdAt: created_at,
    updatedAt: updated_at,
  };
};

const Task = {
  async create(taskData) {
    const { title, description, priority, dueDate, completed, owner } = taskData;
    const result = await getPool().query(
      `INSERT INTO tasks (title, description, priority, due_date, completed, owner) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, description || '', priority || 'Medium', dueDate, completed || false, owner]
    );
    return normalizeTaskRow(result.rows[0]);
  },

  async save() {
    return await Task.create(this);
  },

  async find({ owner }) {
    const result = await getPool().query(
      'SELECT * FROM tasks WHERE owner = $1 ORDER BY created_at DESC',
      [owner]
    );
    return result.rows.map(normalizeTaskRow);
  },

  async findOne({ _id, id, owner }) {
    const taskId = id || _id;
    const result = await getPool().query(
      'SELECT * FROM tasks WHERE id = $1 AND owner = $2',
      [taskId, owner]
    );
    return normalizeTaskRow(result.rows[0]);
  },

  async findOneAndUpdate({ _id, id, owner }, updates, options = {}) {
    const taskId = id || _id;
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedKeys = new Set([
      'title',
      'description',
      'priority',
      'dueDate',
      'completed',
      'status',
    ]);

    Object.entries(updates).forEach(([key, value]) => {
      if (!allowedKeys.has(key)) return;

      const dbKey = key === 'dueDate' ? 'due_date' : 
                    key === 'updatedAt' ? 'updated_at' : key;
      fields.push(`${dbKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (fields.length === 0) {
      return Task.findOne({ id: taskId, owner });
    }

    values.push(taskId);
    values.push(owner);

    const result = await getPool().query(
      `UPDATE tasks SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND owner = $${paramCount + 1} 
       RETURNING *`,
      values
    );
    return normalizeTaskRow(result.rows[0]);
  },

  async findOneAndDelete({ _id, id, owner }) {
    const taskId = id || _id;
    const result = await getPool().query(
      'DELETE FROM tasks WHERE id = $1 AND owner = $2 RETURNING *',
      [taskId, owner]
    );
    return normalizeTaskRow(result.rows[0]);
  },

  sort() {
    return this;
  }
};

export default Task;
