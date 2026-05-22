// server.js — The entry point for the entire backend application
// This file boots the Express server, connects to MongoDB,
// and attaches Socket.io for realtime collaboration.

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file FIRST
// This must happen before importing anything that uses process.env
dotenv.config();

import { connectDB } from './config/database.js';

// Initialize Express application
const app = express();

// Create HTTP server (required for Socket.io to attach to)
const httpServer = createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── MIDDLEWARE STACK ────────────────────────────────────────────────────────
// Middleware runs on EVERY request, in the order listed here.

// Security headers — industry standard for any production API
app.use(helmet());

// Cross-Origin Resource Sharing — allows the React frontend to call this API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // allows cookies to be sent
}));

// Request logging — shows each request in your terminal (method, path, status, time)
app.use(morgan('dev'));

// Parse JSON request bodies (so req.body works)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
// A simple route to verify the server is running. 
// Used by deployment platforms (Render, Railway) to monitor server health.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SyncSpace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
// We'll add these in later phases
// app.use('/api/auth', authRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/users', userRoutes);

// ─── SOCKET.IO ───────────────────────────────────────────────────────────────
// We'll set up socket handlers in a later phase
// initializeSocketHandlers(io);

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
// This catches any error thrown in any route and returns a clean JSON response.
// Without this, Express would return an ugly HTML error page.
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
    // Connect to MongoDB first, then start listening
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1); // Exit with error code
  }
};

startServer();

export { io };