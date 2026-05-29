// axios.js — Pre-configured Axios instance
//
// WHY a custom instance instead of plain fetch?
// - Base URL configured once
// - Interceptors automatically attach JWT and handle 401 errors
// - Automatic token refresh on expiry — the user never sees an error

import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // ✅ FIXED
  withCredentials: true,
  timeout: 60000, // ✅ 60s — Render cold start ke liye
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ✅ Render cold start retry — network timeout pe dobara try karo
    if (
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      return api(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.code === 'TOKEN_EXPIRED'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry  = true;
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshTokens();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;