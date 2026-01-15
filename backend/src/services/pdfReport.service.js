import PDFDocument from 'pdfkit';
import { db } from '../db/connection.js';

/**
 * PDF Report Generation Service
 */
class PDFReportService {
  /**
   * Generate PDF report for a session
   */
  async generateSessionReport(sessionId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Verify session ownership
        const sessionResult = await db.query(
          `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
          [sessionId, userId]
        );

        if (sessionResult.rows.length === 0) {
          reject(new Error('Session not found'));
          return;
        }

        const session = sessionResult.rows[0];

        // Get questions
        const questionsResult = await db.query(
          `SELECT * FROM interview_questions WHERE session_id = $1 ORDER BY created_at`,
          [sessionId]
        );

        // Get answers
        const answersResult = await db.query(
          `SELECT * FROM interview_answers WHERE session_id = $1 ORDER BY created_at`,
          [sessionId]
        );

        // Get evaluations
        const evaluationsResult = await db.query(
          `SELECT * FROM answer_evaluations WHERE session_id = $1 ORDER BY created_at`,
          [sessionId]
        );

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('Interview Session Report', { align: 'center' });
        doc.moveDown();

        // Session metadata
        doc.fontSize(14).text('Session Information', { underline: true });
        doc.fontSize(10);
        doc.text(`Session ID: ${session.id}`);
        doc.text(`Type: ${session.type}`);
        doc.text(`Difficulty: ${session.difficulty}`);
        doc.text(`Status: ${session.status}`);
        doc.text(`Created: ${new Date(session.created_at).toLocaleString()}`);
        if (session.completed_at) {
          doc.text(`Completed: ${new Date(session.completed_at).toLocaleString()}`);
        }
        if (session.overall_score) {
          doc.text(`Overall Score: ${session.overall_score.toFixed(2)}/10`);
        }
        doc.moveDown();

        // Questions and Answers
        doc.fontSize(14).text('Questions & Answers', { underline: true });
        doc.moveDown();

        const questions = questionsResult.rows;
        const answers = answersResult.rows;
        const evaluations = evaluationsResult.rows;

        questions.forEach((question, index) => {
          const questionNum = index + 1;
          
          // Question
          doc.fontSize(12).fillColor('black').text(`Question ${questionNum}:`, { continued: false });
          doc.fontSize(10).fillColor('black');
          doc.text(question.question_text, { indent: 20 });
          doc.moveDown(0.5);

          // Answer
          const answer = answers.find(a => a.question_id === question.id);
          if (answer) {
            doc.fontSize(11).fillColor('blue').text('Your Answer:', { indent: 20 });
            doc.fontSize(10).fillColor('black');
            const answerLines = answer.answer_text.split('\n');
            answerLines.forEach(line => {
              doc.text(line, { indent: 30 });
            });
            doc.moveDown(0.5);
          }

          // Evaluation
          const evaluation = evaluations.find(e => e.question_id === question.id);
          if (evaluation) {
            doc.fontSize(11).fillColor('green').text('Evaluation:', { indent: 20 });
            doc.fontSize(10).fillColor('black');
            doc.text(`Score: ${evaluation.score.toFixed(2)}/10`, { indent: 30 });
            
            if (evaluation.clarity_score) {
              doc.text(`Clarity: ${evaluation.clarity_score.toFixed(2)}/10`, { indent: 30 });
            }
            if (evaluation.structure_score) {
              doc.text(`Structure: ${evaluation.structure_score.toFixed(2)}/10`, { indent: 30 });
            }
            if (evaluation.relevance_score) {
              doc.text(`Relevance: ${evaluation.relevance_score.toFixed(2)}/10`, { indent: 30 });
            }
            if (evaluation.confidence_score) {
              doc.text(`Confidence: ${evaluation.confidence_score.toFixed(2)}/10`, { indent: 30 });
            }

            doc.moveDown(0.5);
            doc.text('Feedback:', { indent: 30, underline: true });
            const feedbackLines = evaluation.feedback_text.split('\n');
            feedbackLines.forEach(line => {
              doc.text(line, { indent: 35 });
            });

            if (evaluation.strengths && Array.isArray(evaluation.strengths)) {
              doc.moveDown(0.3);
              doc.text('Strengths:', { indent: 30 });
              evaluation.strengths.forEach(strength => {
                doc.text(`• ${strength}`, { indent: 35 });
              });
            }

            if (evaluation.improvements && Array.isArray(evaluation.improvements)) {
              doc.moveDown(0.3);
              doc.text('Areas for Improvement:', { indent: 30 });
              evaluation.improvements.forEach(improvement => {
                doc.text(`• ${improvement}`, { indent: 35 });
              });
            }
          }

          doc.moveDown(1);
          
          // Add page break if needed
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        // Summary Tips
        doc.addPage();
        doc.fontSize(14).text('Summary & Tips', { underline: true });
        doc.moveDown();

        const avgScore = session.overall_score || 
          (evaluations.length > 0 
            ? evaluations.reduce((sum, e) => sum + parseFloat(e.score), 0) / evaluations.length 
            : 0);

        doc.fontSize(10);
        doc.text(`Overall Performance: ${avgScore.toFixed(2)}/10`);
        doc.moveDown();

        doc.text('Key Takeaways:', { underline: true });
        doc.moveDown(0.5);

        if (avgScore >= 8) {
          doc.text('• Excellent performance! Continue building on your strengths.');
          doc.text('• Maintain this level of detail and clarity in your answers.');
          doc.text('• Consider practicing more challenging questions to push your limits.');
        } else if (avgScore >= 6) {
          doc.text('• Good performance with room for improvement.');
          doc.text('• Focus on adding more specific examples and metrics.');
          doc.text('• Practice structuring answers more clearly.');
          doc.text('• Work on articulating technical concepts more precisely.');
        } else {
          doc.text('• Continue practicing to improve your interview skills.');
          doc.text('• Focus on providing more detailed and structured answers.');
          doc.text('• Use the STAR method for behavioral questions.');
          doc.text('• Include specific examples and quantifiable results.');
          doc.text('• Practice explaining technical concepts clearly.');
        }

        doc.moveDown();
        doc.text('General Tips:', { underline: true });
        doc.moveDown(0.5);
        doc.text('• Always structure your answers clearly.');
        doc.text('• Include specific examples and metrics when possible.');
        doc.text('• Practice explaining complex concepts simply.');
        doc.text('• Review your answers and identify areas for improvement.');
        doc.text('• Continue practicing with different question types.');

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const pdfReportService = new PDFReportService();


