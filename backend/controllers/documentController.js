// documentController.js — All document CRUD operations
// Every function is a route handler: async (req, res, next) => {}

import Document from '../models/Document.js';
import mongoose from 'mongoose';

// ─── GET ALL DOCUMENTS ────────────────────────────────────────────────────────
export const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const documents = await Document.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
        { isPublic: true },           // ✅ NEW — public docs bhi dikhein
      ],
      isArchived: false,
    })
      .populate('owner', 'name email cursorColor')
      .populate('collaborators.user', 'name email cursorColor')
      .populate('lastEditedBy', 'name')
      .sort({ lastEditedAt: -1 })
      .lean();

    res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE DOCUMENT ──────────────────────────────────────────────────────
export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid document ID' });
    }

    const document = await Document.findById(id)
      .populate('owner', 'name email cursorColor avatar')
      .populate('collaborators.user', 'name email cursorColor avatar')
      .populate('lastEditedBy', 'name');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const isOwner        = document.owner._id.toString() === userId.toString();
    const isCollaborator = document.collaborators.some(
      (c) => c.user._id.toString() === userId.toString()
    );

    if (!isOwner && !isCollaborator && !document.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE DOCUMENT ──────────────────────────────────────────────────────────
export const createDocument = async (req, res, next) => {
  try {
    const title  = req.body?.title || 'Untitled Document';
    const icon   = req.body?.icon  || '📄';
    const userId = req.user._id;

    const document = await Document.create({
      title,
      icon,
      owner: userId,
      collaborators: [{ user: userId, role: 'admin' }],
    });

    await document.populate('owner', 'name email cursorColor avatar');

    res.status(201).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE DOCUMENT ──────────────────────────────────────────────────────────
export const updateDocument = async (req, res, next) => {
  try {
    const { id }                    = req.params;
    const { title, icon, isPublic } = req.body || {};
    const userId                    = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const isOwner = document.owner.toString() === userId.toString();
    const isAdmin = document.collaborators.some(
      (c) => c.user.toString() === userId.toString() && c.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (title    !== undefined) document.title    = title;
    if (icon     !== undefined) document.icon     = icon;
    if (isPublic !== undefined) document.isPublic = isPublic;

    await document.save();

    res.status(200).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

// ─── SAVE YJS STATE ───────────────────────────────────────────────────────────
export const saveDocumentState = async (documentId, yjsState, content, userId) => {
  try {
    await Document.findByIdAndUpdate(documentId, {
      yjsState,
      content,
      lastEditedAt: new Date(),
      lastEditedBy: userId,
      wordCount: content.trim().split(/\s+/).filter(Boolean).length,
    });
  } catch (error) {
    console.error('Failed to save document state:', error.message);
  }
};

// ─── DELETE DOCUMENT ──────────────────────────────────────────────────────────
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this document',
      });
    }

    document.isArchived = true;
    await document.save();

    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── INVITE COLLABORATOR ──────────────────────────────────────────────────────
export const inviteCollaborator = async (req, res, next) => {
  try {
    const { id }           = req.params;
    const { userId, role } = req.body || {};
    const requesterId      = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const isOwner = document.owner.toString() === requesterId.toString();
    const isAdmin = document.collaborators.some(
      (c) => c.user.toString() === requesterId.toString() && c.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const alreadyAdded = document.collaborators.some(
      (c) => c.user.toString() === userId
    );
    if (alreadyAdded) {
      return res.status(409).json({
        success: false,
        message: 'User is already a collaborator',
      });
    }

    document.collaborators.push({ user: userId, role: role || 'editor' });
    await document.save();

    res.status(200).json({ success: true, message: 'Collaborator added' });
  } catch (error) {
    next(error);
  }
};