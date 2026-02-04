# PostgreSQL Setup Guide

Your Task Manager application has been successfully converted from MongoDB to PostgreSQL!

## Prerequisites

1. Install PostgreSQL on your system:
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **Mac**: `brew install postgresql` or download from https://www.postgresql.org/download/macosx/
   - **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian) or check your distro's package manager

## Setup Steps

### 1. Start PostgreSQL Service

**Windows:**
```powershell
# PostgreSQL should start automatically after installation
# Or start it manually from Services app
```

**Mac:**
```bash
brew services start postgresql
# or
pg_ctl -D /usr/local/var/postgres start
```

**Linux:**
```bash
sudo service postgresql start
# or
sudo systemctl start postgresql
```

### 2. Create Database and User

Open PostgreSQL command line (psql):

**Windows**: Open "SQL Shell (psql)" from Start Menu
**Mac/Linux**: Run `psql postgres` in terminal

```sql
-- Create a new database
CREATE DATABASE task_manager;

-- Create a user (change username and password)
CREATE USER taskmanager_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE task_manager TO taskmanager_user;

-- Connect to the database
\c task_manager

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskmanager_user;
```

### 3. Run Database Schema

Run the schema file to create all tables:

```bash
# From the Backend directory
psql -U taskmanager_user -d task_manager -f config/schema.sql
```

Or manually in psql:
```sql
\c task_manager
\i config/schema.sql
```

### 4. Configure Environment Variables

Create or update your `.env` file in the Backend directory:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://taskmanager_user:your_secure_password@localhost:5432/task_manager
# or
POSTGRES_URI=postgresql://taskmanager_user:your_secure_password@localhost:5432/task_manager

# JWT Secret (keep your existing one or generate new)
JWT_SECRET=your_jwt_secret_here

# Server Port
PORT=4000

# Environment
NODE_ENV=development
```

**Connection String Format:**
```
postgresql://username:password@host:port/database_name
```

For production with SSL:
```
postgresql://username:password@host:port/database_name?sslmode=require
```

### 5. Verify Database Connection

Test the connection:

```bash
psql "postgresql://taskmanager_user:your_secure_password@localhost:5432/task_manager"
```

If successful, you should see:
```
task_manager=>
```

Check tables:
```sql
\dt
```

You should see:
- users
- tasks
- daily_habits
- daily_habit_completions
- user_badges

### 6. Start Your Application

```bash
npm start
```

Test the health endpoint:
```bash
curl http://localhost:4000/health
```

Should return:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2026-02-01T..."
}
```

## Important Changes from MongoDB to PostgreSQL

### Field Name Changes
- `_id` → `id` (auto-increment integer)
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `lastStreakDate` → `last_streak_date`
- `habitName` → `habit_name`
- `dueDate` → `due_date`

### Data Type Changes
- MongoDB ObjectId → PostgreSQL Serial (integer)
- Arrays are now separate tables:
  - `user.badges[]` → `user_badges` table
  - `habit.completions[]` → `daily_habit_completions` table

### Query Changes
All Mongoose queries have been converted to PostgreSQL queries using the `pg` library. The API endpoints remain the same!

## Troubleshooting

### Connection Issues

**Error: "password authentication failed"**
- Verify your username and password in DATABASE_URL
- Check PostgreSQL user exists: `\du` in psql

**Error: "database does not exist"**
- Create the database: `CREATE DATABASE task_manager;`

**Error: "could not connect to server"**
- Ensure PostgreSQL service is running
- Check the port (default is 5432)
- On Windows: Check Windows Services

### Permission Issues

**Error: "permission denied for schema public"**
```sql
GRANT ALL ON SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskmanager_user;
```

### Schema Issues

**Tables not found:**
- Run the schema file: `psql -U taskmanager_user -d task_manager -f config/schema.sql`

## Migration from Existing MongoDB Data

If you have existing data in MongoDB that you want to migrate:

1. Export MongoDB data:
```bash
mongoexport --uri="your_mongo_uri" --collection=users --out=users.json
mongoexport --uri="your_mongo_uri" --collection=tasks --out=tasks.json
mongoexport --uri="your_mongo_uri" --collection=dailyhabits --out=habits.json
```

2. Create a migration script (contact developer for custom migration script based on your data structure)

## Database Management

### View all tables:
```sql
\dt
```

### View table structure:
```sql
\d users
\d tasks
\d daily_habits
```

### View data:
```sql
SELECT * FROM users;
SELECT * FROM tasks;
SELECT * FROM daily_habits;
```

### Backup database:
```bash
pg_dump -U taskmanager_user task_manager > backup.sql
```

### Restore database:
```bash
psql -U taskmanager_user task_manager < backup.sql
```

## Production Deployment

For production (e.g., Heroku, Railway, Render):

1. Most platforms provide PostgreSQL as an add-on
2. They will provide a DATABASE_URL automatically
3. Set NODE_ENV=production in your environment variables
4. The connection will automatically use SSL in production mode

Example for Heroku:
```bash
heroku addons:create heroku-postgresql:hobby-dev
# DATABASE_URL is automatically set
heroku run npm run migrate # if you create migration scripts
```

## Support

For issues or questions about the PostgreSQL setup, check:
- PostgreSQL documentation: https://www.postgresql.org/docs/
- pg (node-postgres) docs: https://node-postgres.com/
