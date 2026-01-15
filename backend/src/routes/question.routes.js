import express from 'express';
import * as questionController from '../controllers/question.controller.js';

const router = express.Router();

// Routes
router.get('/categories', questionController.getCategories);
router.get('/bank', questionController.getQuestionBank);
router.get('/', questionController.getQuestionBank); // GET /api/questions with query params
router.get('/:id', questionController.getQuestion);

export default router;

