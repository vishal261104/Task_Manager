import { create } from "zustand";
import axios from "axios";
import { API_BASE, getToken } from "../utils/api";
import { useAuthStore } from "./authStore";

const normalizeTasks = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const useTasksStore = create((set) => ({
  tasks: [],
  loading: true,
  error: null,
  setTasks: (tasks) => set({ tasks }),
  setError: (error) => set({ error }),
  fetchTasks: async () => {
    const isFirstLoad = useTasksStore.getState().tasks.length === 0;
    if (isFirstLoad) set({ loading: true, error: null });
    try {
      const token = getToken();
      if (!token) {
        useAuthStore.getState().logout();
        set({ loading: false, tasks: [] });
        return;
      }

      const { data } = await axios.get(`${API_BASE}/tasks/gp`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ tasks: normalizeTasks(data) });
    } catch (err) {
      set({ error: err?.message || "Could not load tasks." });
      if (err?.response?.status === 401) {
        useAuthStore.getState().logout();
      }
    } finally {
      set({ loading: false });
    }
  },

  optimisticUpdateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => ((t.id || t._id) === id ? { ...t, ...updates } : t)),
    }));
  },

  optimisticDeleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => (t.id || t._id) !== id),
    }));
  },

  addTaskLocally: (task) => {
    set((state) => ({
      tasks: [task, ...state.tasks],
    }));
  },
}));
