import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { getRedisClient } from '../db/connection.js';
import { questionService } from '../services/question.service.js';
import { evaluationService } from '../services/evaluation.service.js';
import { validationResult } from 'express-validator';

/**
 * Start a new interview session
 */
export const startInterview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { type, duration, difficulty = 'medium', role, mode } = req.body;

    // For role-specific interviews, use the role as the type in the database
    // but pass role info to question service for role-specific questions
    const sessionType = role || type;

    // Determine question count based on duration (for mock interviews)
    const questionCounts = {
      30: 5,
      45: 7,
      60: 10,
    };
    const questionCount = mode === 'mock' ? (questionCounts[duration] || 7) : 1;

    // Create interview session
    const sessionId = uuidv4();
    const result = await db.query(
      `INSERT INTO interview_sessions (id, user_id, type, duration_minutes, difficulty, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'in_progress', NOW())
       RETURNING *`,
      [sessionId, userId, sessionType, duration, difficulty]
    );

    const session = result.rows[0];

    // Generate questions
    const questions = [];
    const previousQuestions = [];
    const uniqueTexts = new Set(); // Track normalized question texts
    const maxAttempts = questionCount * 2; // Allow extra attempts for uniqueness
    let attempts = 0;

    while (questions.length < questionCount && attempts < maxAttempts) {
      attempts++;
      
      try {
        const question = await questionService.generateQuestion({
          type: type, // Use the base type (technical, behavioral, system-design)
          difficulty,
          previousQuestions: previousQuestions.map(q => q.text),
          role: role, // Pass role for role-specific question generation
        });

        // Check for duplicates using normalized text
        const normalizedText = questionService.normalizeQuestionText(question.text);
        
        if (!uniqueTexts.has(normalizedText) && normalizedText.length > 10) {
          uniqueTexts.add(normalizedText);
          
          // Store question in session
          await db.query(
            `INSERT INTO interview_questions (id, session_id, question_text, question_type, difficulty, question_data, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [question.id, sessionId, question.text, question.type, difficulty, JSON.stringify(question)]
          );

          questions.push(question);
          previousQuestions.push(question);
        } else {
          console.log(`[InterviewController] Duplicate question detected, regenerating... (attempt ${attempts})`);
        }
      } catch (error) {
        console.error(`[InterviewController] Error generating question (attempt ${attempts}):`, error);
        // Continue to next attempt
      }
    }
    
    // Fill remaining slots with fallback questions if needed
    if (questions.length < questionCount) {
      console.log(`[InterviewController] Only generated ${questions.length} unique questions, filling with fallback...`);
      const fallbackQuestions = questionService.getGenericFallbackQuestions(role, difficulty);
      
      for (const fallback of fallbackQuestions) {
        if (questions.length >= questionCount) break;
        
        const normalizedText = questionService.normalizeQuestionText(fallback.text);
        if (!uniqueTexts.has(normalizedText)) {
          uniqueTexts.add(normalizedText);
          
          // Store fallback question in session
          await db.query(
            `INSERT INTO interview_questions (id, session_id, question_text, question_type, difficulty, question_data, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [fallback.id, sessionId, fallback.text, fallback.type, difficulty, JSON.stringify(fallback)]
          );
          
          questions.push(fallback);
        }
      }
    }
    
    console.log(`[InterviewController] Generated ${questions.length} unique questions out of ${attempts} attempts`);

    // Cache session state in Redis
    const redis = await getRedisClient();
    await redis.setEx(
      `session:${sessionId}`,
      3600, // 1 hour TTL
      JSON.stringify({ 
        currentQuestion: questions[0].id, 
        questionIndex: 0,
        totalQuestions: questions.length,
        mode: mode || 'standard'
      })
    );

    res.status(201).json({
      session: {
        id: session.id,
        type: session.type,
        duration: session.duration_minutes,
        difficulty: session.difficulty,
        status: session.status,
        createdAt: session.created_at,
      },
      currentQuestion: questions[0],
      questions: questions, // Return all questions for mock mode
      totalQuestions: questions.length,
      mode: mode || 'standard',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview session details
 */
export const getInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT * FROM interview_sessions 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const session = result.rows[0];

    // Get questions for this session
    const questionsResult = await db.query(
      `SELECT * FROM interview_questions WHERE session_id = $1 ORDER BY created_at`,
      [id]
    );

    // Get answers
    const answersResult = await db.query(
      `SELECT * FROM interview_answers WHERE session_id = $1 ORDER BY created_at`,
      [id]
    );

    res.json({
      session: {
        id: session.id,
        type: session.type,
        duration: session.duration_minutes,
        difficulty: session.difficulty,
        status: session.status,
        createdAt: session.created_at,
      },
      questions: questionsResult.rows,
      answers: answersResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit an answer
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { answer, questionId } = req.body;

    // Verify session ownership
    const sessionResult = await db.query(
      `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const session = sessionResult.rows[0];

    if (session.status !== 'in_progress') {
      return res.status(400).json({ error: 'Interview session is not active' });
    }

    // Get question
    const questionResult = await db.query(
      `SELECT * FROM interview_questions WHERE id = $1 AND session_id = $2`,
      [questionId, id]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = questionResult.rows[0];

    // Save answer
    const answerId = uuidv4();
    await db.query(
      `INSERT INTO interview_answers (id, session_id, question_id, answer_text, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [answerId, id, questionId, answer]
    );

    // Evaluate answer (async - don't wait, but log errors properly)
    // Use question_text as primary source, fallback to question_data
    const questionForEvaluation = question.question_text || 
                                   (question.question_data && typeof question.question_data === 'string' ? question.question_data : 
                                    (question.question_data && question.question_data.text ? question.question_data.text : 
                                     JSON.stringify(question.question_data || question)));
    
    evaluationService.evaluateAnswer({
      sessionId: id,
      questionId,
      answerId,
      answer,
      question: questionForEvaluation,
      coachMode: 'friendly',
    }).catch(err => {
      console.error('Evaluation error:', err);
      console.error('Error details:', {
        sessionId: id,
        questionId,
        answerId,
        errorMessage: err.message,
        errorStack: err.stack
      });
    });

    res.json({
      message: 'Answer submitted successfully',
      answerId,
      evaluationPending: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback for an answer
 */
export const getFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { questionId } = req.query;

    // Verify session ownership
    const sessionResult = await db.query(
      `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    // Get evaluation
    const evalResult = await db.query(
      `SELECT * FROM answer_evaluations 
       WHERE session_id = $1 AND question_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [id, questionId]
    );

    if (evalResult.rows.length === 0) {
      return res.status(202).json({
        status: 'pending',
        message: 'Evaluation is still being processed',
      });
    }

    const evaluation = evalResult.rows[0];

    res.json({
      evaluation: {
        score: evaluation.score,
        clarityScore: evaluation.clarity_score,
        structureScore: evaluation.structure_score,
        relevanceScore: evaluation.relevance_score,
        confidenceScore: evaluation.confidence_score,
        feedback: evaluation.feedback_text,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        createdAt: evaluation.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete interview session
 */
export const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Update session status
    const result = await db.query(
      `UPDATE interview_sessions 
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    // Calculate overall score
    const scoresResult = await db.query(
      `SELECT AVG(score) as avg_score, COUNT(*) as total_questions
       FROM answer_evaluations WHERE session_id = $1`,
      [id]
    );

    const avgScore = scoresResult.rows[0]?.avg_score || 0;

    // Update session with final score
    await db.query(
      `UPDATE interview_sessions SET overall_score = $1 WHERE id = $2`,
      [avgScore, id]
    );

    res.json({
      message: 'Interview completed successfully',
      session: result.rows[0],
      overallScore: parseFloat(avgScore),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Improve an answer
 */
export const improveAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { questionId, answer, improvementType, coachMode = 'friendly' } = req.body;

    // Verify session ownership
    const sessionResult = await db.query(
      `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    // Get question
    const questionResult = await db.query(
      `SELECT * FROM interview_questions WHERE id = $1 AND session_id = $2`,
      [questionId, id]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = questionResult.rows[0];
    const questionText = question.question_text || 
                        (question.question_data && typeof question.question_data === 'string' ? question.question_data : 
                         (question.question_data && question.question_data.text ? question.question_data.text : 
                          JSON.stringify(question.question_data || question)));

    // Improve answer
    const { evaluationService } = await import('../services/evaluation.service.js');
    const result = await evaluationService.improveAnswer({
      question: questionText,
      originalAnswer: answer,
      improvementType,
      coachMode,
    });

    res.json({
      improvedAnswer: result.improvedAnswer,
      improvementType: result.improvementType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's interview sessions
 */
export const getUserInterviews = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT * FROM interview_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      sessions: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

