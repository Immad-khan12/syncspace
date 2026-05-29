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
import User from '../models/User.js';

const router = express.Router();

// Public routes — no auth required
router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);
router.post('/refresh',  refreshAccessToken);

// Protected route — requires valid JWT
router.get('/me', protect, getMe);

// ✅ NEW — Members page ke liye sab registered users
router.get('/users', protect, async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      'name email cursorColor role lastSeen createdAt'
    ).lean();
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

export default router;