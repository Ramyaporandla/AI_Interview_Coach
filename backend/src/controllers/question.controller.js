import { db } from '../db/connection.js';
import { questionService } from '../services/question.service.js';

/**
 * Get question categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'technical', name: 'Technical', description: 'Algorithm and coding questions' },
      { id: 'behavioral', name: 'Behavioral', description: 'STAR method and soft skills' },
      { id: 'system-design', name: 'System Design', description: 'Architecture and scalability' },
    ];

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Get question bank with filters
 */
export const getQuestionBank = async (req, res, next) => {
  try {
    const { role, type, difficulty, company, limit = 50, offset = 0 } = req.query;
    const userId = req.user.userId;

    let query = `
      SELECT DISTINCT 
        iq.id,
        iq.question_text,
        iq.question_type,
        iq.difficulty,
        iq.question_data,
        iq.created_at,
        COUNT(DISTINCT ia.id) as practice_count
      FROM interview_questions iq
      LEFT JOIN interview_answers ia ON iq.id = ia.question_id
      LEFT JOIN interview_sessions isess ON iq.session_id = isess.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND isess.type = $${paramCount}`;
      params.push(role);
    }

    if (type) {
      paramCount++;
      query += ` AND iq.question_type = $${paramCount}`;
      params.push(type);
    }

    if (difficulty) {
      paramCount++;
      query += ` AND iq.difficulty = $${paramCount}`;
      params.push(difficulty);
    }

    query += ` GROUP BY iq.id, iq.question_text, iq.question_type, iq.difficulty, iq.question_data, iq.created_at
               ORDER BY iq.created_at DESC
               LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Map database questions
    let questions = result.rows.map(q => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type,
      difficulty: q.difficulty,
      data: q.question_data,
      practiceCount: parseInt(q.practice_count) || 0,
      createdAt: q.created_at,
    }));

    // If no questions found, provide sample questions
    if (questions.length === 0) {
      const sampleQuestions = [];
      const typesToShow = type ? [type] : ['technical', 'behavioral', 'system-design'];
      const difficultiesToShow = difficulty ? [difficulty] : ['easy', 'medium', 'hard'];
      
      // Generate sample questions based on filters
      for (const t of typesToShow.slice(0, 2)) {
        for (const d of difficultiesToShow.slice(0, 2)) {
          const sampleQ = questionService.getFAANGQuestionBank(role || null, t, d, company || 'general');
          sampleQuestions.push({
            id: sampleQ.id,
            text: sampleQ.text,
            type: sampleQ.type,
            difficulty: sampleQ.difficulty,
            data: { company: sampleQ.company || 'general', ...sampleQ.metadata },
            practiceCount: 0,
            createdAt: new Date().toISOString(),
          });
        }
      }
      
      questions = sampleQuestions.slice(0, 15); // Show up to 15 sample questions
    }
    // Add FAANG-style questions if company filter is used and we have few results
    else if (company && result.rows.length < 5) {
      const faangQuestions = [];
      const types = type ? [type] : ['technical', 'behavioral', 'system-design'];
      const difficulties = difficulty ? [difficulty] : ['easy', 'medium', 'hard'];
      
      for (const t of types.slice(0, 2)) {
        for (const d of difficulties.slice(0, 2)) {
          const faangQ = questionService.getFAANGQuestionBank(role, t, d, company);
          faangQuestions.push({
            id: faangQ.id,
            text: faangQ.text,
            type: faangQ.type,
            difficulty: faangQ.difficulty,
            data: { company: faangQ.company, ...faangQ.metadata },
            practiceCount: 0,
            createdAt: new Date().toISOString(),
          });
        }
      }
      
      questions = [...questions, ...faangQuestions.slice(0, 10)];
    }

    res.json({
      questions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: questions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific question
 */
export const getQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM interview_questions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = result.rows[0];

    res.json({
      question: {
        id: question.id,
        text: question.question_text,
        type: question.question_type,
        difficulty: question.difficulty,
        data: question.question_data,
        createdAt: question.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

