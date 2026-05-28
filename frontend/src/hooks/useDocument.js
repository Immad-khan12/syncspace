// useDocument.js — The brain of the collaborative editor
// Manages: document data, Yjs doc, socket events, cursors, presence

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { getSocket } from '@/sockets/socketClient';
import api from '@/api/axios';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function useDocument(documentId) {
  const { user }              = useAuthStore();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError]   = useState(null);

  // Yjs document ref — stable across renders
  const yjsDocRef = useRef(null);
  const socketRef = useRef(null);

  // ── INITIALIZE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!documentId || !user) return;

    // Create the Yjs document
    const yjsDoc  = new Y.Doc();
    yjsDocRef.current = yjsDoc;

    // Get socket connection
    const socket  = getSocket();
    socketRef.current = socket;

    // ── SOCKET EVENTS ─────────────────────────────────────────────────────────

    // Server sends the current document state when we join
    socket.on('document:load', ({ document: doc, yjsState }) => {
      setDocument(doc);
      setIsLoading(false);

      // Apply the server's Yjs state to our local doc
      if (yjsState && yjsState.length > 0) {
        Y.applyUpdate(yjsDoc, new Uint8Array(yjsState));
      }
    });

    // Receive Yjs updates from other users and apply them
    socket.on('document:update', ({ update }) => {
      Y.applyUpdate(yjsDoc, new Uint8Array(update));
    });

    // Someone changed the title
    socket.on('document:title', ({ title }) => {
      setDocument((prev) => prev ? { ...prev, title } : prev);
    });

    // Presence: list of users already in the room
    socket.on('room:presence', ({ users }) => {
      setOnlineUsers(users);
    });

    // A new user joined
    socket.on('user:joined', ({ socketId, user: joinedUser }) => {
      setOnlineUsers((prev) => {
        if (prev.find((u) => u.socketId === socketId)) return prev;
        return [...prev, { socketId, ...joinedUser }];
      });
      toast(`${joinedUser.name} joined`, { icon: '👋', duration: 2000 });
    });

    // A user left
    socket.on('user:left', ({ socketId }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    // Error from server
    socket.on('error', ({ message }) => {
      setError(message);
      setIsLoading(false);
      toast.error(message);
    });

    // ── LISTEN FOR LOCAL YJS CHANGES ──────────────────────────────────────────
    // When the user types, Yjs fires this event
    // We send the update to the server, which relays it to other users
    const handleUpdate = (update, origin) => {
      // origin === null means this update came from the local user
      // We don't re-broadcast updates that came FROM the server
      if (origin === null) {
        socket.emit('document:update', {
          documentId,
          update: Array.from(update),
        });

        // Show saving indicator
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
      }
    };

    yjsDoc.on('update', handleUpdate);

    // ── JOIN THE ROOM ──────────────────────────────────────────────────────────
    socket.emit('document:join', { documentId });

    // ── CLEANUP ───────────────────────────────────────────────────────────────
    return () => {
      socket.emit('document:leave', { documentId });
      socket.off('document:load');
      socket.off('document:update');
      socket.off('document:title');
      socket.off('room:presence');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('error');
      yjsDoc.off('update', handleUpdate);
      yjsDoc.destroy();
      yjsDocRef.current = null;
    };
  }, [documentId, user]);

  // ── UPDATE TITLE ────────────────────────────────────────────────────────────
  const updateTitle = useCallback(async (title) => {
    if (!document) return;
    setDocument((prev) => ({ ...prev, title }));
    socketRef.current?.emit('document:title', { documentId, title });

    try {
      await api.patch(`/documents/${documentId}`, { title });
    } catch {
      toast.error('Failed to save title');
    }
  }, [documentId, document]);

  return {
    document,
    isLoading,
    isSaving,
    error,
    onlineUsers,
    yjsDoc: yjsDocRef.current,
    socket: socketRef.current,
    updateTitle,
  };
}