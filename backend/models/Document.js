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

    // Yjs stores document content as a binary state vector
    // We store it as a Buffer in MongoDB for efficient sync
    yjsState: {
      type: Buffer,
      default: null,
    },

    // Plain text version — used for search and previews
    content: {
      type: String,
      default: '',
    },

    // Emoji icon for the document
    icon: {
      type: String,
      default: '📄',
    },

    // Cover image URL
    coverImage: {
      type: String,
      default: null,
    },

    // The user who created the document
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // All users who have access — owner is always the first collaborator
    collaborators: [collaboratorSchema],

    // Is this document publicly accessible via link?
    isPublic: {
      type: Boolean,
      default: false,
    },

    // Soft delete — we never hard delete documents
    isArchived: {
      type: Boolean,
      default: false,
    },

    // Last time someone actually edited the content
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Word count — updated on every save
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ─── INDEXES ─────────────────────────────────────────────────────────────────
// Indexes make queries fast — critical for production performance
documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ 'collaborators.user': 1 });
documentSchema.index({ title: 'text', content: 'text' }); // full-text search

const Document = mongoose.model('Document', documentSchema);
export default Document;