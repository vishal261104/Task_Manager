import { create } from "zustand";
import axios from "axios";
import { API_BASE as API_ROOT, getAuthHeaders as getStoredAuthHeaders } from "../utils/api";
import { logger } from "../utils/logger";
import { useAuthStore } from "./authStore";

const HABITS_API_BASE = `${API_ROOT}/daily-habits`;

const getHeaders = () => {
  const headers = getStoredAuthHeaders();
  if (!headers.Authorization) throw new Error("No auth token found");
  return headers;
};

export const useHabitsStore = create((set, get) => ({
  habits: [],
  loading: true,
  error: null,
  progress: { total: 0, completed: 0, percentage: 0, streak: 0 },
  todayDate: null,
  fetchHabits: async () => {
    set({ loading: true, error: null });
    try {
      const progressRes = await axios.get(`${HABITS_API_BASE}/progress`, { headers: getHeaders() });
      const serverToday = progressRes?.data?.data?.date;
      const effectiveToday = serverToday || new Date().toISOString().split("T")[0];

      const { data } = await axios.get(`${HABITS_API_BASE}/gp`, { headers: getHeaders() });
      const habitsWithStatus = (data?.data || []).map((habit) => ({
        ...habit,
        completedToday: habit.completions?.includes(effectiveToday) || false,
      }));

      const completedCount = habitsWithStatus.filter((h) => h.completedToday).length;
      const totalCount = habitsWithStatus.length;
      const backendStreak = progressRes?.data?.data?.streak || 0;

      set({
        habits: habitsWithStatus,
        todayDate: serverToday || null,
        progress: {
          total: totalCount,
          completed: completedCount,
          percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          streak: backendStreak,
        },
      });
    } catch (error) {
      logger.warn("Failed to fetch daily habits", {
        status: error?.response?.status,
        message: error?.message,
      });
      set({ error: error?.message || "Could not load habits." });
      if (error?.response?.status === 401) {
        useAuthStore.getState().logout();
      }
    } finally {
      set({ loading: false });
    }
  },
  deleteHabit: async (id) => {
    try {
      await axios.delete(`${HABITS_API_BASE}/${id}/gp`, { headers: getHeaders() });
      await get().fetchHabits();
    } catch (error) {
      logger.warn("Failed to delete daily habit", {
        status: error?.response?.status,
        message: error?.message,
        habitId: id,
      });
      if (error?.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
}));
