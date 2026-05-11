# Task Manager Application

A full-stack task management application that allows users to create, manage, and track their daily tasks and habits. Features user authentication, task categorization, daily habit tracking with streaks, and achievement badges.

## 🎯 Features

- **User Authentication**
  - Sign up and login with secure password hashing (bcrypt)
  - JWT token-based authentication
  - User profile management

- **Task Management**
  - Create, read, update, and delete tasks
  - Mark tasks as completed or pending
  - Organize tasks by status (Pending/In-Progress/Completed)
  - Task priority levels (Low/Medium/High)
  - Due date tracking

- **Daily Habits & Streaks** 
  - Track daily habits with custom icons and colors
  - Mark habits complete/incomplete each day
  - Build streaks by completing all habits daily
  - Visual progress tracking

- **Achievement System**
  - Earn badges for maintaining streaks
  - Multiple milestone badges (3-day, 7-day, 30-day, etc.)
  - Badge gallery with progress tracking

- **User Interface**
  - Responsive design with Tailwind CSS
  - Intuitive navigation with sidebar
  - Real-time feedback with toast notifications
  - Clean and modern UI with Lucide icons

## 🗄️ Database

**MongoDB** - Document database with:
- Flexible schemas for tasks and habits
- Simple scaling for growth
- Mongoose models for validation

## 📁 Project Structure

```
Task_Manager/
├── Backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection (Mongoose)
│   │   └── badges.js             # Badge definitions
│   ├── controller/
│   │   ├── userController.js     # User authentication logic
│   │   ├── taskController.js     # Task CRUD operations
│   │   ├── dailyHabitController.js # Habit tracking & streaks
│   │   └── badgeController.js    # Badge retrieval
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── model/
│   │   ├── usermodel.js          # User data access
│   │   ├── taskModel.js          # Task data access
│   │   └── dailyHabitModel.js    # Habit data access
│   ├── routes/
│   │   ├── userRoute.js          # Auth endpoints
│   │   ├── taskRoute.js          # Task endpoints
│   │   ├── dailyHabitRoute.js    # Habit endpoints
│   │   └── badgeRoute.js         # Badge endpoints
│   ├── index.js                  # Express server entry point
│   ├── QUICK_START.md            # Fast setup guide
│   ├── MONGO_SETUP.md            # Detailed MongoDB setup
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AddTask.jsx        # Task creation form
    │   │   ├── AddDailyHabit.jsx  # Habit creation form
    │   │   ├── CompletedTasks.jsx # Completed tasks display
    │   │   ├── PendingTasks.jsx   # Pending tasks display
    │   │   ├── DailyHabitsList.jsx # Habits display
    │   │   ├── DailyHabitItem.jsx  # Individual habit
    │   │   ├── StreakBadges.jsx    # Badge display (if exists)
    │   │   ├── Layout.jsx         # Main layout wrapper
    │   │   ├── Login.jsx          # Login form
    │   │   ├── Navbar.jsx         # Navigation bar
    │   │   ├── PendingTasks.jsx   # Pending tasks display
    │   │   ├── Profile.jsx        # User profile page
    │   │   ├── Sidebar.jsx        # Side navigation
    │   │   ├── SignUp.jsx         # Registration form
    │   │   └── TaskItem.jsx       # Individual task component
    │   ├── pages/
    │   │   ├── Complete.jsx       # Completed tasks page
    │   │   ├── Dashboard.jsx      # Dashboard page
    │   │   └── Pending.jsx        # Pending tasks page
   │   ├── store/
   │   │   ├── authStore.js        # Auth state (Zustand)
   │   │   ├── tasksStore.js       # Tasks state (Zustand)
   │   │   └── habitsStore.js      # Habits state (Zustand)
    │   ├── App.jsx                # Root component
    │   ├── main.jsx               # React entry point
    │   └── index.css
    ├── vite.config.js
    ├── package.json
    └── index.html
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local) or MongoDB Atlas
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task_manager?retryWrites=true&w=majority
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   # Optional: timezone used for streak "day" boundaries
   STREAK_TIMEZONE=UTC
   ```

4. Start the server:
   ```bash
   npm start
   ```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Frontend directory (if needed):
   ```env
   # Either set API origin OR the full base. Most deployments only need API origin.
   VITE_API_ORIGIN=http://localhost:4000
   # VITE_API_BASE=http://localhost:4000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## 🔧 Tech Stack

### Backend
- **Framework**: Express.js 5.1
- **Database**: MongoDB (mongoose 8.x)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: bcryptjs for password hashing
- **Validation**: validator.js
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Framework**: React 19.1
- **Build Tool**: Vite
- **Routing**: React Router DOM 7.9
- **Styling**: Tailwind CSS 4.1 with Vite plugin
- **State**: Zustand 5.x (auth, tasks, habits)
- **HTTP Client**: Axios 1.12
- **UI Icons**: Lucide React 0.545
- **Notifications**: React Toastify 11.0
- **Date Handling**: date-fns 4.1

## 📚 API Endpoints

### Authentication Routes (`/api/user`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user (requires `Authorization: Bearer <token>`)
- `PUT /profile` - Update name/email (requires auth)
- `PUT /password` - Change password (requires auth)

### Task Routes (`/api/tasks`)
- `GET /gp` - Get all tasks for the user
- `POST /gp` - Create a new task
- `GET /:id/gp` - Get a single task
- `PUT /:id/gp` - Update a task
- `DELETE /:id/gp` - Delete a task

### Daily Habit Routes (`/api/daily-habits`)
- `GET /gp` - List habits
- `POST /gp` - Create habit
- `GET /progress` - Progress summary (total/completed/streak)
- `POST /:id/toggle` - Toggle completion for a date (body: `{ "date": "YYYY-MM-DD" }`)
- `GET /:id/gp` - Get habit
- `PUT /:id/gp` - Update habit
- `DELETE /:id/gp` - Delete habit

### Badges (`/api/badges`)
- `GET /user` - Get user badges (requires auth)
- `GET /mapping` - Get badge milestones mapping

### Health Check
- `GET /health` - Server health and database connection status

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. After login, the token is stored in the browser's local storage and sent with each request to protected routes via the Authorization header.

## 🎨 Styling

The frontend uses Tailwind CSS for styling, providing:
- Responsive design that works on mobile, tablet, and desktop
- Dark mode support (can be configured)
- Pre-built utility classes for rapid development
- Custom components with Lucide icons

## 📦 Available Scripts

### Backend
- `npm start` - Start the development server with nodemon (auto-reload)

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint to check code quality

## 🚢 Deployment

### Backend
Deploy to services like:
- Heroku
- Railway
- Render
- AWS EC2

### Frontend
Deploy to:
- Vercel (configuration included)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🐛 Troubleshooting

### Backend issues
- **MongoDB connection failed**: Check `MONGODB_URI` in `Backend/.env` and confirm MongoDB is reachable
- **Port already in use**: Change the PORT in `.env` or kill the process using the port

### Frontend issues
- **API calls failing**: Ensure the backend server is running and CORS is properly configured
- **Module not found**: Run `npm install` to ensure all dependencies are installed

## 📝 Environment Variables

### Backend (.env)
```
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task_manager?retryWrites=true&w=majority
JWT_SECRET=your_secure_secret_key_here
NODE_ENV=development
STREAK_TIMEZONE=UTC
```

### Frontend (.env.local)
```
VITE_API_ORIGIN=http://localhost:4000
# VITE_API_BASE=http://localhost:4000/api
```

## ▶️ How to Run

- Backend: `cd Backend` then `npm install` then `npm start`
- Frontend: `cd Frontend` then `npm install` then `npm run dev`

Note: there is no root-level `package.json`, so running `npm start` in the project root will fail.

## 🤝 Contributing

Feel free to fork the project and submit pull requests for any improvements.

## 📄 License

ISC License

## 📧 Contact & Support

For issues, questions, or suggestions, please open an issue on the project repository.

---

**Happy Task Managing!** ✅
