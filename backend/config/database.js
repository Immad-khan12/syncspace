// database.js — MongoDB connection using Mongoose
// This module exports a single function: connectDB()
// It's called once at server startup.

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options prevent deprecation warnings and improve performance
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error; // Re-throw so server.js can catch it and exit
  }
};