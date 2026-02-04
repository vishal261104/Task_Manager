-- Task Manager Database Schema for PostgreSQL

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS daily_habit_completions CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS daily_habits CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    streak INTEGER DEFAULT 0,
    last_streak_date VARCHAR(10) DEFAULT NULL, -- Format: YYYY-MM-DD
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges table
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    streak_required INTEGER NOT NULL
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    due_date TIMESTAMP DEFAULT NULL,
    owner INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In-Progress', 'Completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily habits table
CREATE TABLE daily_habits (
    id SERIAL PRIMARY KEY,
    habit_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    owner INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    color VARCHAR(50) DEFAULT 'purple',
    icon VARCHAR(50) DEFAULT 'star',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily habit completions table (to handle array of completion dates)
CREATE TABLE daily_habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES daily_habits(id) ON DELETE CASCADE,
    completion_date VARCHAR(10) NOT NULL, -- Format: YYYY-MM-DD
    UNIQUE(habit_id, completion_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_owner ON tasks(owner);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_daily_habits_owner ON daily_habits(owner);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_daily_habit_completions_habit_id ON daily_habit_completions(habit_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_habits_updated_at BEFORE UPDATE ON daily_habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
