import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pending from './pages/Pending';
import Complete from './pages/Complete';
import DailyHabits from './pages/DailyHabits';
import Badges from './pages/Badges';
import Profile from './components/Profile';
import Login from './components/Login';
import SignUp from './components/SignUp';
import './index.css';
import axios from 'axios';
import { API_BASE } from './utils/api';

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [authChecking, setAuthChecking] = useState(true);

  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token && currentUser);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (!cancelled) {
          setCurrentUser(null);
          setAuthChecking(false);
        }
        return;
      }

      // Token exists: if we already have a user, we're done.
      if (currentUser) {
        if (!cancelled) setAuthChecking(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE}/user/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!cancelled && data?.success && data?.user) {
          setCurrentUser(prev => prev ?? {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name || 'User')}&background=random`,
          });
        }
      } catch {
        // Invalid/expired token
        localStorage.removeItem('token');
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSubmit = data => {
    const resolved = data?.user ?? data ?? {};
    const name = resolved?.name || data?.name || 'User';
    const email = resolved?.email || data?.email || '';

    const user = {
      id: resolved?.id ?? data?.id ?? data?.userId,
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    };
    setCurrentUser(user);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  const ProtectedLayout = () => (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
          </div>
        }
      />
      <Route
        path="/signup"
        element={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
          </div>
        }
      />

      <Route
        element={
          authChecking
            ? <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
            : (isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />)
        }>

        <Route index element={<Dashboard />} />
        <Route path="pending" element={<Pending />} />
        <Route path="complete" element={<Complete />} />
        <Route path="daily-habits" element={<DailyHabits />} />
        <Route path="badges" element={<Badges />} />
        <Route
          path="profile"
          element={<Profile user={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout} />}
        />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default App;