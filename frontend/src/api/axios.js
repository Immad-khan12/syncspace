// axios.js — Pre-configured Axios instance
//
// WHY a custom instance instead of plain fetch?
// - Base URL configured once
// - Interceptors automatically attach JWT and handle 401 errors
// - Automatic token refresh on expiry — the user never sees an error

import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
  baseURL: '/api',          // proxied to http://localhost:5000/api by Vite
  withCredentials: true,    // sends cookies (for the refresh token)
  timeout: 10000,           // 10 second timeout — don't hang forever
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Runs before every request — attaches the current access token
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
// Runs after every response.
// On 401 (token expired): silently refresh and retry the original request.
// This is what makes the "seamless session" experience possible.

let isRefreshing = false;
let failedQueue  = []; // queue of requests waiting for the new token

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // pass through successful responses

  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.code === 'TOKEN_EXPIRED'
    ) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one
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