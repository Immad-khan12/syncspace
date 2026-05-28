// documentRoutes.js — Document API endpoints
// All routes are protected — require valid JWT

import express from 'express';
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  inviteCollaborator,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to ALL routes in this file
router.use(protect);

router.get('/',           getDocuments);
router.post('/',          createDocument);
router.get('/:id',        getDocument);
router.patch('/:id',      updateDocument);
router.delete('/:id',     deleteDocument);
router.post('/:id/invite', inviteCollaborator);

export default router;