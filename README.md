# Task Manager Application

A full-stack task management application that allows users to create, manage, and track their daily tasks. Features user authentication, task categorization by status, and a responsive UI.

## 🎯 Features

- **User Authentication**
  - Sign up and login with secure password hashing
  - JWT token-based authentication
  - User profile management

- **Task Management**
  - Create, read, update, and delete tasks
  - Mark tasks as completed or pending
  - Organize tasks by status (Pending/Completed)
  - Task dashboard with quick overview

- **User Interface**
  - Responsive design with Tailwind CSS
  - Intuitive navigation with sidebar
  - Real-time feedback with toast notifications
  - Clean and modern UI with Lucide icons

## 📁 Project Structure

```
Task_Manager/
├── Backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controller/
│   │   ├── userController.js     # User authentication logic
│   │   └── taskController.js     # Task CRUD operations
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── model/
│   │   ├── userModel.js          # User schema
│   │   └── taskModel.js          # Task schema
│   ├── routes/
│   │   ├── userRoute.js          # Auth endpoints
│   │   └── taskRoute.js          # Task endpoints
│   ├── index.js                  # Express server entry point
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AddTask.jsx        # Task creation form
    │   │   ├── CompletedTasks.jsx # Completed tasks display
    │   │   ├── Dashboard.jsx      # Main dashboard
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
- MongoDB (local or MongoDB Atlas)
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
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
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
   VITE_API_URL=http://localhost:4000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## 🔧 Tech Stack

### Backend
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose 8.19
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: bcryptjs for password hashing
- **Validation**: validator.js
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Framework**: React 19.1
- **Build Tool**: Vite
- **Routing**: React Router DOM 7.9
- **Styling**: Tailwind CSS 4.1 with Vite plugin
- **HTTP Client**: Axios 1.12
- **UI Icons**: Lucide React 0.545
- **Notifications**: React Toastify 11.0
- **Date Handling**: date-fns 4.1

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - Register a new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (requires authentication)

### Task Routes (`/api/tasks`)
- `GET /` - Get all tasks for the user
- `POST /` - Create a new task
- `PUT /:id` - Update a task
- `DELETE /:id` - Delete a task
- `PATCH /:id/toggle` - Toggle task completion status

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
- **MongoDB connection failed**: Check your connection string in `.env`
- **Port already in use**: Change the PORT in `.env` or kill the process using the port

### Frontend issues
- **API calls failing**: Ensure the backend server is running and CORS is properly configured
- **Module not found**: Run `npm install` to ensure all dependencies are installed

## 📝 Environment Variables

### Backend (.env)
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/task_manager
JWT_SECRET=your_secure_secret_key_here
NODE_ENV=development
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:4000/api
```

## 🤝 Contributing

Feel free to fork the project and submit pull requests for any improvements.

## 📄 License

ISC License

## 📧 Contact & Support

For issues, questions, or suggestions, please open an issue on the project repository.

---

**Happy Task Managing!** ✅
