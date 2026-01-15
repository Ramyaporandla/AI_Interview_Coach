import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

// Routes
router.get('/dashboard', analyticsController.getDashboard);
router.get('/progress', analyticsController.getProgress);
router.get('/skills', analyticsController.getSkillsAnalysis);
router.get('/sessions', analyticsController.getSessionHistory);

export default router;

