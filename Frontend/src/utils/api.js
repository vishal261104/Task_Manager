export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000';

// Convenience: typical REST base is `${API_ORIGIN}/api`
export const API_BASE = import.meta.env.VITE_API_BASE || `${API_ORIGIN}/api`;

export const getToken = () => localStorage.getItem('token');

export const getAuthHeaders = () => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};
