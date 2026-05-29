// authStore.js — Global authentication state using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ✅ FIXED IMPORT
import api from '../services/api';

const useAuthStore = create(

  persist(

    (set, get) => ({

      // ─────────────────────────────────────────
      // STATE
      // ─────────────────────────────────────────
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      // ─────────────────────────────────────────
      // COMPUTED
      // ─────────────────────────────────────────
      isAuthenticated: () =>
        !!get().accessToken && !!get().user,

      // ─────────────────────────────────────────
      // INITIALIZE USER
      // ─────────────────────────────────────────
      initialize: async () => {

        const token = get().accessToken;

        if (!token) return;

        try {

          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${token}`;

          const { data } = await api.get('/auth/me');

          set({
            user: data.user,
          });

        } catch {

          get().refreshTokens();

        }
      },

      // ─────────────────────────────────────────
      // REGISTER
      // ─────────────────────────────────────────
      register: async (name, email, password) => {

        set({
          isLoading: true,
          error: null,
        });

        try {

          const { data } = await api.post(
            '/auth/register',
            {
              name,
              email,
              password,
            }
          );

          // Save token to axios headers
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${data.accessToken}`;

          // Save token to localStorage
          localStorage.setItem(
            'accessToken',
            data.accessToken
          );

          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
          });

          return {
            success: true,
          };

        } catch (err) {

          const message =
            err.response?.data?.message ||
            'Registration failed';

          set({
            error: message,
            isLoading: false,
          });

          return {
            success: false,
            message,
          };
        }
      },

      // ─────────────────────────────────────────
      // LOGIN
      // ─────────────────────────────────────────
      login: async (email, password) => {

        set({
          isLoading: true,
          error: null,
        });

        try {

          const { data } = await api.post(
            '/auth/login',
            {
              email,
              password,
            }
          );

          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${data.accessToken}`;

          localStorage.setItem(
            'accessToken',
            data.accessToken
          );

          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
          });

          return {
            success: true,
          };

        } catch (err) {

          const message =
            err.response?.data?.message ||
            'Login failed';

          set({
            error: message,
            isLoading: false,
          });

          return {
            success: false,
            message,
          };
        }
      },

      // ─────────────────────────────────────────
      // LOGOUT
      // ─────────────────────────────────────────
      logout: async () => {

        try {

          await api.post('/auth/logout');

        } catch {

          // Ignore logout errors

        }

        delete api.defaults.headers.common[
          'Authorization'
        ];

        localStorage.removeItem('accessToken');

        set({
          user: null,
          accessToken: null,
          error: null,
        });
      },

      // ─────────────────────────────────────────
      // REFRESH TOKENS
      // ─────────────────────────────────────────
      refreshTokens: async () => {

        try {

          const { data } = await api.post(
            '/auth/refresh'
          );

          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${data.accessToken}`;

          localStorage.setItem(
            'accessToken',
            data.accessToken
          );

          set({
            accessToken: data.accessToken,
          });

          return data.accessToken;

        } catch {

          get().logout();

          return null;
        }
      },

      // ─────────────────────────────────────────
      // CLEAR ERROR
      // ─────────────────────────────────────────
      clearError: () => set({
        error: null,
      }),

    }),

    {
      name: 'syncspace-auth',

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }

  )

);

export default useAuthStore;