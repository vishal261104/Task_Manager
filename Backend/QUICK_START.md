# Quick Start - PostgreSQL Setup

## 🚀 Fast Setup (5 Minutes)

### 1. Install PostgreSQL

**Windows**: 
- Download and install from https://www.postgresql.org/download/windows/
- During installation, set a password for the `postgres` user

**Mac**: 
```bash
brew install postgresql
brew services start postgresql
```

**Linux**: 
```bash
sudo apt-get install postgresql
sudo service postgresql start
```

### 2. Create Database

Open terminal/command prompt:

```bash
# Login to PostgreSQL
psql -U postgres

# In psql, run these commands:
CREATE DATABASE task_manager;
CREATE USER taskmanager_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE task_manager TO taskmanager_user;
\c task_manager
GRANT ALL ON SCHEMA public TO taskmanager_user;
\q
```

### 3. Run Database Schema

```bash
# Navigate to Backend directory
cd Backend

# Run schema file
psql -U taskmanager_user -d task_manager -f config/schema.sql
# Enter password: password123
```

### 4. Update .env File

Create or edit `Backend/.env`:

```env
DATABASE_URL=postgresql://taskmanager_user:password123@localhost:5432/task_manager
JWT_SECRET=your_jwt_secret_here
PORT=4000
NODE_ENV=development
# Optional: timezone used for streak day boundaries
STREAK_TIMEZONE=UTC
```

### 5. Start Server

```bash
npm start
```

### 6. Test It

Open browser: http://localhost:4000/health

Should see:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "..."
}
```

## ✅ Done!

Your Task Manager is now running on PostgreSQL!

## Troubleshooting

**Can't connect?**
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL in .env
- Check password is correct

**Permission denied?**
```sql
-- Run in psql:
\c task_manager
GRANT ALL ON SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskmanager_user;
```

**Tables missing?**
```bash
# Run schema file again
psql -U taskmanager_user -d task_manager -f config/schema.sql
```

For more detailed help, see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
