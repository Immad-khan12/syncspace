// server.js — The entry point for the entire backend application
// Updated: Phase 4 — Socket.io + Document routes fully wired

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables FIRST — before anything uses process.env
dotenv.config();

import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { initializeSocketHandlers } from './sockets/socketHandlers.js';

const app = express();
const httpServer = createServer(app);

// ─── SOCKET.IO SETUP ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── MIDDLEWARE STACK ─────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SyncSpace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    activeConnections: io.engine.clientsCount,
  });
});

// ─── REST ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/documents', documentRoutes);

// ─── SOCKET.IO HANDLERS ───────────────────────────────────────────────────────
initializeSocketHandlers(io);

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Socket.io ready for realtime connections`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export { io };