// socketClient.js — Socket.io client singleton
// We create ONE socket instance and reuse it everywhere
// A new socket is created when the user logs in, destroyed on logout

import { io } from 'socket.io-client';
import useAuthStore from '@/store/authStore';

let socket = null;

export const getSocket = () => {
  // Return existing socket if connected
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io('/', {
    // Send JWT token for authentication
    auth: { token },
    // Reconnect automatically if connection drops
    reconnection:       true,
    reconnectionDelay:  1000,
    reconnectionAttempts: 10,
    // Use WebSockets first, fall back to polling
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};