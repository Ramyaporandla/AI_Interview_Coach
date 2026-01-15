import express from 'express';
import { body, validationResult } from 'express-validator';
import * as interviewController from '../controllers/interview.controller.js';

const router = express.Router();

// Validation middleware
const validateStartInterview = [
  body('type').isIn(['technical', 'behavioral', 'system-design']).withMessage('Invalid interview type'),
  body('duration').isInt({ min: 30, max: 60 }).withMessage('Duration must be between 30 and 60 minutes'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
];

const validateSubmitAnswer = [
  body('answer').notEmpty().withMessage('Answer is required'),
  body('questionId').isUUID().withMessage('Valid question ID is required'),
];

// Routes
router.post('/start', validateStartInterview, interviewController.startInterview);
router.get('/:id', interviewController.getInterview);
router.post('/:id/answer', validateSubmitAnswer, interviewController.submitAnswer);
router.post('/:id/improve-answer', [
  body('questionId').isUUID().withMessage('Valid question ID is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('improvementType').isIn(['improve', 'star', 'senior', 'metrics']).withMessage('Valid improvement type is required'),
], interviewController.improveAnswer);
router.get('/:id/feedback', interviewController.getFeedback);
router.post('/:id/complete', interviewController.completeInterview);
router.get('/', interviewController.getUserInterviews);

export default router;

