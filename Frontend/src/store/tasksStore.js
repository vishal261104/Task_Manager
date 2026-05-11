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
    set({ loading: true, error: null });
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
}));
