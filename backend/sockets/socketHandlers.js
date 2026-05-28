// socketHandlers.js — Complete realtime collaboration engine
// Handles: document rooms, Yjs CRDT sync, cursors, presence, autosave

import * as Y from 'yjs';
import { saveDocumentState } from '../controllers/documentController.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Document from '../models/Document.js';

// In-memory store of active document rooms
// Map<documentId, Map<socketId, userData>>
const documentRooms = new Map();

// In-memory Yjs documents — one per open document
// Map<documentId, Y.Doc>
const yjsDocs = new Map();

// Autosave timers — debounced, one per document
// Map<documentId, NodeJS.Timeout>
const saveTimers = new Map();

// ─── AUTOSAVE ─────────────────────────────────────────────────────────────────
// Waits 2 seconds after the last edit before saving to MongoDB
// This prevents hammering the database on every keystroke
const scheduleAutosave = (documentId, yjsDoc, userId) => {
  // Clear existing timer if one is pending
  if (saveTimers.has(documentId)) {
    clearTimeout(saveTimers.get(documentId));
  }

  const timer = setTimeout(async () => {
    try {
      // Encode the full Yjs document state as binary
      const yjsState = Buffer.from(Y.encodeStateAsUpdate(yjsDoc));

      // Extract plain text for search indexing
      const text = yjsDoc.getText('content');
      const content = text ? text.toString() : '';

      await saveDocumentState(documentId, yjsState, content, userId);
      console.log(`💾 Autosaved document: ${documentId}`);
    } catch (err) {
      console.error('Autosave failed:', err.message);
    } finally {
      saveTimers.delete(documentId);
    }
  }, 2000); // 2 second debounce

  saveTimers.set(documentId, timer);
};

export const initializeSocketHandlers = (io) => {

  // ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────
  // Verify JWT on every socket connection before allowing any events
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      const user    = await User.findById(decoded.userId).select('-password');

      if (!user) return next(new Error('User not found'));

      // Attach user to socket for use in all event handlers
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id} — User: ${socket.user.name}`);

    // ── JOIN DOCUMENT ROOM ──────────────────────────────────────────────────
    socket.on('document:join', async ({ documentId }) => {
      try {
        // Verify user has access to this document
        const doc = await Document.findById(documentId);
        if (!doc) return socket.emit('error', { message: 'Document not found' });

        const userId      = socket.user._id.toString();
        const isOwner     = doc.owner.toString() === userId;
        const isCollab    = doc.collaborators.some(c => c.user.toString() === userId);

        if (!isOwner && !isCollab && !doc.isPublic) {
          return socket.emit('error', { message: 'Access denied' });
        }

        // Join Socket.io room
        socket.join(documentId);

        // Initialize Yjs doc for this document if not already in memory
        if (!yjsDocs.has(documentId)) {
          const yjsDoc = new Y.Doc();

          // If there's a saved state in MongoDB, restore it
          if (doc.yjsState && doc.yjsState.length > 0) {
            Y.applyUpdate(yjsDoc, doc.yjsState);
          }

          yjsDocs.set(documentId, yjsDoc);
        }

        // Track user in room
        if (!documentRooms.has(documentId)) {
          documentRooms.set(documentId, new Map());
        }

        documentRooms.get(documentId).set(socket.id, {
          userId:  socket.user._id,
          name:    socket.user.name,
          color:   socket.user.cursorColor || '#6366F1',
          cursor:  null,
        });

        // Send the current Yjs state to the new user so they're in sync
        const yjsDoc        = yjsDocs.get(documentId);
        const currentState  = Y.encodeStateAsUpdate(yjsDoc);

        socket.emit('document:load', {
          documentId,
          yjsState: Array.from(currentState), // convert Buffer to array for JSON
          document: {
            _id:          doc._id,
            title:        doc.title,
            icon:         doc.icon,
            lastEditedAt: doc.lastEditedAt,
          },
        });

        // Tell everyone else a new user joined
        socket.to(documentId).emit('user:joined', {
          socketId: socket.id,
          user: {
            userId: socket.user._id,
            name:   socket.user.name,
            color:  socket.user.cursorColor,
          },
        });

        // Send the new user the current presence list
        const presence = [];
        documentRooms.get(documentId).forEach((userData, sid) => {
          if (sid !== socket.id) presence.push({ socketId: sid, ...userData });
        });
        socket.emit('room:presence', { users: presence });

        console.log(`👥 ${socket.user.name} joined document: ${documentId}`);
      } catch (err) {
        console.error('document:join error:', err.message);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // ── YJS UPDATE ───────────────────────────────────────────────────────────
    // Core of the collaboration: receive a Yjs update, apply it, broadcast it
    socket.on('document:update', ({ documentId, update }) => {
      const yjsDoc = yjsDocs.get(documentId);
      if (!yjsDoc) return;

      // Apply the update to our server-side Yjs document
      // This keeps the server as the source of truth
      const updateArray = new Uint8Array(update);
      Y.applyUpdate(yjsDoc, updateArray);

      // Broadcast to all OTHER users in the room
      socket.to(documentId).emit('document:update', { update });

      // Schedule autosave
      scheduleAutosave(documentId, yjsDoc, socket.user._id);
    });

    // ── CURSOR TRACKING ──────────────────────────────────────────────────────
    socket.on('cursor:update', ({ documentId, cursor }) => {
      const room = documentRooms.get(documentId);
      if (room?.has(socket.id)) {
        room.get(socket.id).cursor = cursor;
      }

      socket.to(documentId).emit('cursor:update', {
        socketId: socket.id,
        name:     socket.user.name,
        color:    socket.user.cursorColor,
        cursor,
      });
    });

    // ── TYPING INDICATOR ────────────────────────────────────────────────────
    socket.on('user:typing', ({ documentId, isTyping }) => {
      socket.to(documentId).emit('user:typing', {
        socketId: socket.id,
        name:     socket.user.name,
        color:    socket.user.cursorColor,
        isTyping,
      });
    });

    // ── TITLE CHANGE ─────────────────────────────────────────────────────────
    // When a user changes the document title, broadcast to everyone
    socket.on('document:title', ({ documentId, title }) => {
      socket.to(documentId).emit('document:title', { title });
    });

    // ── LEAVE DOCUMENT ───────────────────────────────────────────────────────
    socket.on('document:leave', ({ documentId }) => {
      handleLeaveRoom(socket, io, documentId);
    });

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Remove from all rooms
      documentRooms.forEach((users, documentId) => {
        if (users.has(socket.id)) {
          handleLeaveRoom(socket, io, documentId);
        }
      });
      console.log(`❌ Disconnected: ${socket.id} — ${socket.user.name}`);
    });
  });
};

// ─── HELPER: LEAVE ROOM ───────────────────────────────────────────────────────
function handleLeaveRoom(socket, io, documentId) {
  const room = documentRooms.get(documentId);
  if (!room) return;

  room.delete(socket.id);
  socket.leave(documentId);

  // If room is now empty, clean up Yjs doc from memory
  // (it's already persisted to MongoDB via autosave)
  if (room.size === 0) {
    documentRooms.delete(documentId);
    yjsDocs.delete(documentId);
    console.log(`🧹 Cleaned up empty room: ${documentId}`);
  }

  // Tell remaining users this person left
  io.to(documentId).emit('user:left', { socketId: socket.id });
}