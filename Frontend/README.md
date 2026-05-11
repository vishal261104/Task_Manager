# Task Manager Frontend

React + Vite frontend for the Task Manager app. It handles authentication, task and habit flows, and the UI shell.

## Quick Start

1. Install dependencies:
	```bash
	npm install
	```

2. Create a `.env` file (optional):
	```env
	VITE_API_ORIGIN=http://localhost:4000
	# VITE_API_BASE=http://localhost:4000/api
	```

3. Start the dev server:
	```bash
	npm run dev
	```

The app runs at `http://localhost:5173` by default.

## Tech Stack

- React 19.1 + React Router DOM
- Vite (rolldown-vite)
- Tailwind CSS
- Axios
- Zustand (auth, tasks, habits)
- Lucide React + React Toastify
- date-fns

## State Management

Zustand stores:
- [src/store/authStore.js](src/store/authStore.js) for auth session
- [src/store/tasksStore.js](src/store/tasksStore.js) for tasks data
- [src/store/habitsStore.js](src/store/habitsStore.js) for daily habits data

Other UI state remains local to components.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- The backend base URL defaults to `http://localhost:4000` if no env var is set.
- For full project setup, see the root [README.md](../README.md).
