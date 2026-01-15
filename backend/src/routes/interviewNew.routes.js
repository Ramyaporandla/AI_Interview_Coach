import express from 'express';
import * as interviewController from '../controllers/interviewNew.controller.js';
import { generateFromResume } from '../controllers/resume.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateAsk = [
  body('type').optional().isIn(['technical', 'behavioral', 'system-design']),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('mode').optional().isIn(['standard', 'mock', 'practice']),
];

const validateScore = [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
];

const validateImprove = [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('transformType').isIn(['STAR', 'senior', 'metrics', 'concise']).withMessage('Invalid transformType'),
];

const validateGenerateFromResume = [
  body('resumeId').notEmpty().withMessage('resumeId is required'),
  body('role').notEmpty().withMessage('role is required'),
  body('type').isIn(['technical', 'behavioral', 'system-design']).withMessage('Invalid type'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
];

// Ask question
router.post('/ask', authenticateToken, validateAsk, interviewController.askQuestion);

// Score answer
router.post('/score', authenticateToken, validateScore, interviewController.scoreAnswer);

// Improve answer
router.post('/improve', authenticateToken, validateImprove, interviewController.improveAnswer);

// Generate questions from resume
router.post('/generate-from-resume', authenticateToken, validateGenerateFromResume, generateFromResume);

export default router;

