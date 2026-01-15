import { db } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Save session summary
 */
export const saveSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { role, type, difficulty, mode, questions, answers, scores } = req.body;

    // Validate input
    if (!role || !type || !difficulty) {
      return res.status(400).json({ 
        error: 'Missing required fields: role, type, difficulty' 
      });
    }

    // Create session
    const sessionId = uuidv4();
    const result = await db.query(
      `INSERT INTO interview_sessions (id, user_id, type, duration_minutes, difficulty, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', NOW())
       RETURNING *`,
      [sessionId, userId, role || type, 60, difficulty]
    );

    const session = result.rows[0];

    // Save questions
    const savedQuestions = [];
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        const questionId = uuidv4();
        await db.query(
          `INSERT INTO interview_questions (id, session_id, question_text, question_type, difficulty, question_data, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            questionId,
            sessionId,
            typeof question === 'string' ? question : question.text || question.question_text,
            type,
            difficulty,
            JSON.stringify(question)
          ]
        );
        savedQuestions.push({ id: questionId, ...question });
      }
    }

    // Save answers
    const savedAnswers = [];
    if (answers && Array.isArray(answers)) {
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        const questionId = savedQuestions[i]?.id || questions[i]?.id;
        
        if (questionId && answer) {
          const answerId = uuidv4();
          await db.query(
            `INSERT INTO interview_answers (id, session_id, question_id, answer_text, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [answerId, sessionId, questionId, typeof answer === 'string' ? answer : answer.text || answer]
          );
          savedAnswers.push({ id: answerId, answer });
        }
      }
    }

    // Save scores/evaluations
    if (scores && Array.isArray(scores)) {
      for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        const questionId = savedQuestions[i]?.id;
        const answerId = savedAnswers[i]?.id;

        if (questionId && answerId && score) {
          await db.query(
            `INSERT INTO answer_evaluations 
             (id, session_id, question_id, answer_id, score, feedback_text, created_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
            [
              sessionId,
              questionId,
              answerId,
              typeof score === 'number' ? score : score.score || 0,
              typeof score === 'object' && score.feedback ? score.feedback : 'No feedback provided'
            ]
          );
        }
      }
    }

    // Calculate overall score
    const avgScore = scores && scores.length > 0
      ? scores.reduce((sum, s) => sum + (typeof s === 'number' ? s : s.score || 0), 0) / scores.length
      : null;

    if (avgScore !== null) {
      await db.query(
        `UPDATE interview_sessions SET overall_score = $1 WHERE id = $2`,
        [avgScore, sessionId]
      );
    }

    res.status(201).json({
      sessionId,
      session: {
        id: session.id,
        role: session.type,
        type,
        difficulty,
        mode,
        overallScore: avgScore,
        createdAt: session.created_at,
      },
      questions: savedQuestions,
      answers: savedAnswers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List user sessions
 */
export const listSessions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT * FROM interview_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM interview_sessions WHERE user_id = $1`,
      [userId]
    );

    res.json({
      sessions: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: parseInt(countResult.rows[0].total),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session by ID
 */
export const getSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const sessionResult = await db.query(
      `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionResult.rows[0];

    // Get questions
    const questionsResult = await db.query(
      `SELECT * FROM interview_questions WHERE session_id = $1 ORDER BY created_at`,
      [id]
    );

    // Get answers
    const answersResult = await db.query(
      `SELECT * FROM interview_answers WHERE session_id = $1 ORDER BY created_at`,
      [id]
    );

    // Get evaluations
    const evaluationsResult = await db.query(
      `SELECT * FROM answer_evaluations WHERE session_id = $1 ORDER BY created_at`,
      [id]
    );

    res.json({
      session: {
        id: session.id,
        type: session.type,
        duration: session.duration_minutes,
        difficulty: session.difficulty,
        status: session.status,
        overallScore: session.overall_score,
        createdAt: session.created_at,
        completedAt: session.completed_at,
      },
      questions: questionsResult.rows,
      answers: answersResult.rows,
      evaluations: evaluationsResult.rows,
    });
  } catch (error) {
    next(error);
  }
};


