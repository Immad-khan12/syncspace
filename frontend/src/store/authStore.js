// authStore.js — Global authentication state using Zustand
//
// WHY ZUSTAND instead of useState or Context?
// - No Provider wrapper needed
// - Access state from anywhere without prop drilling
// - Simpler than Redux, more powerful than Context
// - Persists across page refreshes when combined with localStorage

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api/axios';

const useAuthStore = create(
  // persist middleware automatically saves/restores state from localStorage
  persist(
    (set, get) => ({
      // ── State ──
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      // ── Computed ──
      isAuthenticated: () => !!get().accessToken && !!get().user,

      // ── Actions ──

      // Called when the app loads — checks if the stored token is still valid
      initialize: async () => {
        const token = get().accessToken;
        if (!token) return;

        try {
          // Verify token by fetching current user
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          // Token is invalid or expired — try to refresh silently
          get().refreshTokens();
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          // Attach token to all future axios requests
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch { /* ignore errors on logout */ }
        // Clear the axios auth header
        delete api.defaults.headers.common['Authorization'];
        // Clear state — persist middleware will also clear localStorage
        set({ user: null, accessToken: null, error: null });
      },

      // Silent token refresh — called automatically when access token expires
      refreshTokens: async () => {
        try {
          const { data } = await api.post('/auth/refresh');
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          set({ accessToken: data.accessToken });
          return data.accessToken;
        } catch {
          // Refresh also failed — log out completely
          get().logout();
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'syncspace-auth', // localStorage key
      // Only persist these fields — don't persist loading/error states
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;