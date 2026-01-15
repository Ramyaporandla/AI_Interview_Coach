import express from 'express';
import { 
  uploadResume, 
  scanATS, 
  matchJD, 
  generateInterviewQuestions,
  getUserResumes,
  upload 
} from '../controllers/resume.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Get user's resumes
router.get('/', authenticateToken, getUserResumes);

// Upload resume (multipart/form-data)
router.post('/upload', authenticateToken, upload.single('resume'), uploadResume);

// ATS scan
router.post('/ats-scan', authenticateToken, [
  body('resumeId').notEmpty().withMessage('resumeId is required'),
], scanATS);

// JD match
router.post('/jd-match', authenticateToken, [
  body('resumeId').notEmpty().withMessage('resumeId is required'),
  body('jdText').notEmpty().withMessage('jdText is required'),
], matchJD);

// Generate interview questions
router.post('/interview-questions', authenticateToken, [
  body('resumeId').notEmpty().withMessage('resumeId is required'),
  body('role').notEmpty().withMessage('role is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('difficulty must be easy, medium, or hard'),
], generateInterviewQuestions);

export default router;

