import { create } from 'zustand';
import axios from 'axios';
import { API_BASE } from '../utils/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const useVaultStore = create((set, get) => ({
  vaultItems: [],
  tags: [],
  loading: false,
  error: null,

  fetchVaultItems: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_BASE}/vault?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ vaultItems: response.data.data, loading: false });
      } else {
        set({ error: 'Failed to fetch Vault items', loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createVaultItem: async (formData) => {
    set({ loading: true, error: null });
    try {
      // formData should be passed directly to support file uploads
      const response = await axios.post(`${API_BASE}/vault`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        const newItem = response.data.data;
        set((state) => ({
          vaultItems: [newItem, ...state.vaultItems],
          loading: false,
        }));
        return newItem;
      } else {
        set({ error: 'Failed to create item', loading: false });
        throw new Error('Failed to create item');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateVaultItem: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_BASE}/vault/${id}`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        const updatedItem = response.data.data;
        set((state) => ({
          vaultItems: state.vaultItems.map((item) =>
            item._id === id ? updatedItem : item
          ),
          loading: false,
        }));
        return updatedItem;
      } else {
        set({ error: 'Failed to update item', loading: false });
        throw new Error('Failed to update item');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVaultItem: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`${API_BASE}/vault/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set((state) => ({
          vaultItems: state.vaultItems.filter((item) => item._id !== id),
          loading: false,
        }));
      } else {
        set({ error: 'Failed to delete item', loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTags: async () => {
    try {
      const response = await axios.get(`${API_BASE}/vault/tags`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ tags: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  },

  createTag: async (name) => {
    try {
      const response = await axios.post(`${API_BASE}/vault/tags`, { name }, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        const newTag = response.data.data;
        set((state) => ({
          tags: [...state.tags, newTag].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        return newTag;
      }
    } catch (error) {
      console.error('Failed to create tag', error);
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/vault/tags/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set((state) => ({
          tags: state.tags.filter((tag) => tag._id !== id),
          // Optionally refetch Vault items or remove the tag locally from items
        }));
      }
    } catch (error) {
      console.error('Failed to delete tag', error);
    }
  },
}));
