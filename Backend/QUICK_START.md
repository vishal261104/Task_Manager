# Quick Start - MongoDB Setup

## 🚀 Fast Setup (5 Minutes)

### 1. Get MongoDB Connection String

Choose one option:

**Option A: MongoDB Atlas (Free Cloud Database - Recommended)**
1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a new project and cluster (M0 is free)
4. Click "Connect" and copy the connection string
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

**Option B: Local MongoDB**
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux:
sudo apt-get install mongodb
sudo service mongod start
```
Connection string: `mongodb://localhost:27017/task_manager`

### 2. Update .env File

Create or edit `Backend/.env`:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/task_manager?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=4000
NODE_ENV=development
# Optional: timezone used for streak day boundaries
STREAK_TIMEZONE=UTC
```

**Note**: If your MongoDB password contains special characters (@, #, $, %), URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

### 3. Install Dependencies

```bash
cd Backend
npm install
```

### 4. Start Server

```bash
npm start
```

### 5. Test It

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

Your Task Manager is now running on MongoDB!

Collections will be automatically created when you first use the app.

## Troubleshooting

**Can't connect?**
- Check your MongoDB connection string is correct
- Verify username and password (URL-encode special characters)
- For MongoDB Atlas: Check IP whitelist allows your IP (0.0.0.0/0 for anywhere)
- Test connection: `npm run setup-db`

**Authentication failed?**
- Verify MongoDB Atlas credentials are correct
- Check username and password in connection string
- Ensure special characters are URL-encoded

**Collections not created?**
- They're created automatically on first use
- If needed, manual creation: Collections are created when data is inserted

## More Info

For more detailed help, see [MONGODB_SETUP.md](./MONGODB_SETUP.md) or the main [README.md](../README.md)
