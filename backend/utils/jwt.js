// jwt.js — JWT token generation and verification
//
// WHY TWO TOKENS?
// Access token  → short-lived (15 min). Used on every API request.
// Refresh token → long-lived (7 days). Used ONLY to get a new access token.
//
// This pattern means: even if someone steals an access token,
// it expires in 15 minutes. Much safer than one long-lived token.

import jwt from 'jsonwebtoken';

// Generate a short-lived access token
// Payload contains only the user ID — minimal data in tokens
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

// Generate a long-lived refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

// Verify an access token — returns the decoded payload or throws
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// Verify a refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Send both tokens to the client
// Access token → JSON body (stored in memory)
// Refresh token → httpOnly cookie (can't be read by JavaScript — XSS protection)
export const sendTokens = (res, user, statusCode = 200) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // httpOnly cookie — JavaScript cannot read this, protecting against XSS attacks
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: user.toJSON(),
  });
};