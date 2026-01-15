import express from 'express';
import * as sessionController from '../controllers/session.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Save session summary
router.post('/save', authenticateToken, sessionController.saveSession);

// List sessions
router.get('/', authenticateToken, sessionController.listSessions);

// Get session by ID
router.get('/:id', authenticateToken, sessionController.getSession);

export default router;


