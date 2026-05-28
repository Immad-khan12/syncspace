// authRoutes.js — Maps HTTP endpoints to controller functions
// This file is purely routing — zero business logic lives here

import express from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes — no auth required
router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);
router.post('/refresh',  refreshAccessToken);

// Protected route — requires valid JWT
// protect runs first, then getMe
router.get('/me', protect, getMe);

export default router;