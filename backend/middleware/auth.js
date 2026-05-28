// auth.js — Middleware that protects routes
//
// WHAT IS MIDDLEWARE?
// A function that runs between the HTTP request arriving and your route handler running.
// If the token is invalid, it stops the request here and returns 401.
// If valid, it attaches the user to req.user and calls next().

import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Extract token from the Authorization header
    // Frontend sends: "Authorization: Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1]; // Get the part after "Bearer "

    // 2. Verify the token — this throws if expired or tampered with
    const decoded = verifyAccessToken(token);

    // 3. Find the user — confirms the user still exists in the database
    // We use .select('-password') to explicitly exclude the password field
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    // 4. Attach user to the request object — available in all downstream handlers
    req.user = user;
    next();

  } catch (error) {
    // JWT throws specific errors we can give useful messages for
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    next(error);
  }
};

// Role-based access control
// Usage: router.delete('/doc', protect, restrictTo('admin'), deleteDoc)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};