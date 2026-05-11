import { create } from "zustand";

const getStoredUser = () => {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
};

const persistUser = (user) => {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
};

export const useAuthStore = create((set) => ({
  currentUser: getStoredUser(),
  authChecking: true,
  setCurrentUser: (user) => {
    persistUser(user);
    set({ currentUser: user });
  },
  setAuthChecking: (value) => set({ authChecking: value }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    persistUser(null);
    set({ currentUser: null });
  },
}));
