// authController.js — Handles all authentication logic
// Each function is an Express route handler: (req, res, next) => {}

import User from '../models/User.js';
import { sendTokens, verifyRefreshToken, generateAccessToken } from '../utils/jwt.js';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — password gets hashed automatically by the pre-save hook
    const user = await User.create({ name, email, password });

    // Log the registration (you'd also send a welcome email here in production)
    console.log(`✅ New user registered: ${email}`);

    // Send back tokens + user data
    sendTokens(res, user, 201);

  } catch (error) {
    // Mongoose validation errors (e.g. email format, min length)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    next(error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic validation — don't hit the database if fields are empty
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user — we need to explicitly select password because select:false hides it
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // SECURITY: Don't reveal whether the email exists or not
      // "Invalid credentials" is intentionally vague
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare the plain-text password against the stored hash
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokens(res, user, 200);

  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  // Clear the httpOnly cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────────────────────
// When the 15-minute access token expires, the frontend silently calls this
// endpoint using the httpOnly refresh token cookie to get a new access token.
// The user never sees a "please log in again" prompt.
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token.' });
    }

    const decoded  = verifyRefreshToken(refreshToken);
    const user     = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({ success: true, accessToken: newAccessToken });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// ─── GET CURRENT USER ────────────────────────────────────────────────────────
// Called on app load to check if the stored token is still valid
// and to get the current user's data
export const getMe = async (req, res) => {
  // req.user is attached by the protect middleware
  res.status(200).json({ success: true, user: req.user });
};
