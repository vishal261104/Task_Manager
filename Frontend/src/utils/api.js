const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

const configuredOrigin = import.meta.env.VITE_API_ORIGIN;

export const API_ORIGIN = (configuredOrigin && (!isProduction || !configuredOrigin.includes('localhost')))
  ? configuredOrigin
  : (isProduction ? 'https://task-manager-55lx.onrender.com' : 'http://localhost:4000');

// Convenience: typical REST base is `${API_ORIGIN}/api`
export const API_BASE = import.meta.env.VITE_API_BASE || `${API_ORIGIN}/api`;

export const getToken = () => localStorage.getItem('token');

export const getAuthHeaders = () => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};
