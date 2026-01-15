import { db } from '../db/connection.js';

/**
 * Get dashboard analytics
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get overall stats
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        AVG(overall_score) as avg_score,
        MAX(overall_score) as best_score,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions
       FROM interview_sessions 
       WHERE user_id = $1`,
      [userId]
    );

    // Get recent sessions
    const recentSessionsResult = await db.query(
      `SELECT id, type, difficulty, overall_score, status, created_at
       FROM interview_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Get skill breakdown
    const skillsResult = await db.query(
      `SELECT 
        q.question_type,
        AVG(e.score) as avg_score,
        COUNT(*) as question_count
       FROM answer_evaluations e
       JOIN interview_questions q ON e.question_id = q.id
       JOIN interview_sessions s ON e.session_id = s.id
       WHERE s.user_id = $1
       GROUP BY q.question_type`,
      [userId]
    );

    res.json({
      stats: {
        totalSessions: parseInt(statsResult.rows[0]?.total_sessions || 0),
        averageScore: parseFloat(statsResult.rows[0]?.avg_score || 0),
        bestScore: parseFloat(statsResult.rows[0]?.best_score || 0),
        completedSessions: parseInt(statsResult.rows[0]?.completed_sessions || 0),
      },
      recentSessions: recentSessionsResult.rows,
      skills: skillsResult.rows.map(row => ({
        type: row.question_type,
        averageScore: parseFloat(row.avg_score || 0),
        questionCount: parseInt(row.question_count || 0),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get progress over time
 */
export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    const result = await db.query(
      `SELECT 
        DATE(created_at) as date,
        AVG(overall_score) as avg_score,
        COUNT(*) as session_count
       FROM interview_sessions 
       WHERE user_id = $1 
         AND status = 'completed'
         AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    res.json({
      progress: result.rows.map(row => ({
        date: row.date,
        averageScore: parseFloat(row.avg_score || 0),
        sessionCount: parseInt(row.session_count || 0),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get skills analysis
 */
export const getSkillsAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT 
        q.question_type,
        q.difficulty,
        AVG(e.score) as avg_score,
        COUNT(*) as count,
        MAX(e.score) as max_score,
        MIN(e.score) as min_score
       FROM answer_evaluations e
       JOIN interview_questions q ON e.question_id = q.id
       JOIN interview_sessions s ON e.session_id = s.id
       WHERE s.user_id = $1
       GROUP BY q.question_type, q.difficulty
       ORDER BY q.question_type, q.difficulty`,
      [userId]
    );

    res.json({
      skills: result.rows.map(row => ({
        type: row.question_type,
        difficulty: row.difficulty,
        averageScore: parseFloat(row.avg_score || 0),
        count: parseInt(row.count || 0),
        maxScore: parseFloat(row.max_score || 0),
        minScore: parseFloat(row.min_score || 0),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session history
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT 
        s.id,
        s.type,
        s.difficulty,
        s.overall_score,
        s.status,
        s.created_at,
        s.completed_at,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT a.id) as answer_count
       FROM interview_sessions s
       LEFT JOIN interview_questions q ON s.id = q.session_id
       LEFT JOIN interview_answers a ON s.id = a.session_id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      sessions: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

