// Document.js — MongoDB schema for collaborative documents
// Every document has content, metadata, collaborators, and version history

import mongoose from 'mongoose';

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['viewer', 'editor', 'admin'],
    default: 'editor',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Untitled Document',
    },

    yjsState: {
      type: Buffer,
      default: null,
    },

    content: {
      type: String,
      default: '',
    },

    icon: {
      type: String,
      default: '📄',
    },

    coverImage: {
      type: String,
      default: null,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    collaborators: [collaboratorSchema],

    // ✅ FIXED — ab har document by default public hoga
    isPublic: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    lastEditedAt: {
      type: Date,
      default: Date.now,
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── INDEXES ─────────────────────────────────────────────────────────────────
documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ 'collaborators.user': 1 });
documentSchema.index({ title: 'text', content: 'text' });

const Document = mongoose.model('Document', documentSchema);
export default Document;