import { create } from 'zustand';
import axios from 'axios';
import { API_BASE, getAuthHeaders } from '../utils/api';

const BASE = `${API_BASE}/persistent-reminders`;
const MAX_VISIBLE = 3;

/** Fisher-Yates shuffle — returns a new array */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Pick up to 3 reminders that are not currently snoozed */
const pickVisible = (all) => {
  const now = Date.now();
  const active = all.filter(
    (r) => !r.snoozedUntil || new Date(r.snoozedUntil).getTime() <= now
  );
  return shuffle(active).slice(0, MAX_VISIBLE);
};

export const usePersistentRemindersStore = create((set, get) => ({
  all: [],           // every reminder (including snoozed)
  visible: [],       // up to 3 randomly chosen active ones
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(BASE, { headers: getAuthHeaders() });
      if (data.success) {
        const all = data.data;
        set({ all, visible: pickVisible(all), loading: false });
      }
    } catch (err) {
      set({ error: err?.message, loading: false });
    }
  },

  add: async (text) => {
    const { data } = await axios.post(BASE, { text }, { headers: getAuthHeaders() });
    if (data.success) {
      const all = [data.data, ...get().all];
      set({ all, visible: pickVisible(all) });
    }
    return data;
  },

  edit: async (id, text) => {
    const { data } = await axios.put(`${BASE}/${id}`, { text }, { headers: getAuthHeaders() });
    if (data.success) {
      const all = get().all.map((r) => (r.id === id ? data.data : r));
      set({ all, visible: pickVisible(all) });
    }
    return data;
  },

  remove: async (id) => {
    // Optimistic
    const prev = get().all;
    const all = prev.filter((r) => r.id !== id);
    set({ all, visible: pickVisible(all) });
    try {
      await axios.delete(`${BASE}/${id}`, { headers: getAuthHeaders() });
    } catch {
      set({ all: prev, visible: pickVisible(prev) });
    }
  },

  snooze: async (id) => {
    // Optimistic — hide immediately
    const prev = get().all;
    const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const all = prev.map((r) => (r.id === id ? { ...r, snoozedUntil } : r));
    set({ all, visible: pickVisible(all) });
    try {
      await axios.post(`${BASE}/${id}/snooze`, {}, { headers: getAuthHeaders() });
    } catch {
      set({ all: prev, visible: pickVisible(prev) });
    }
  },
}));
