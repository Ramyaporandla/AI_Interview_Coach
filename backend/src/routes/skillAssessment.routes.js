import express from 'express';
import * as skillAssessmentController from '../controllers/skillAssessment.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/roles', skillAssessmentController.getAvailableRoles);
router.get('/companies', skillAssessmentController.getFAANGCompanies);
router.get('/domains/:role', skillAssessmentController.getSkillDomains);
router.post('/start', skillAssessmentController.startAssessment);
router.post('/answer', skillAssessmentController.submitAnswer);
router.post('/complete', skillAssessmentController.completeAssessment);

export default router;

