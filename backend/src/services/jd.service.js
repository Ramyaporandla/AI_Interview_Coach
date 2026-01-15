import { db } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Job Description Service
 */
class JDService {
  /**
   * Save job description
   */
  async saveJD(userId, jdText, resumeId = null, jobTitle = null, company = null) {
    const jdId = uuidv4();
    
    await db.query(
      `INSERT INTO job_descriptions (id, user_id, resume_id, jd_text, job_title, company, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [jdId, userId, resumeId, jdText, jobTitle, company]
    );

    return {
      id: jdId,
      jdText,
      resumeId,
      jobTitle,
      company,
    };
  }

  /**
   * Get JD by ID
   */
  async getJD(jdId, userId) {
    const result = await db.query(
      `SELECT * FROM job_descriptions WHERE id = $1 AND user_id = $2`,
      [jdId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get user's JDs
   */
  async getUserJDs(userId) {
    const result = await db.query(
      `SELECT id, job_title, company, created_at 
       FROM job_descriptions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }
}

export const jdService = new JDService();

