import express from 'express';
import { pdfReportService } from '../services/pdfReport.service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate PDF report for a session
 */
router.get('/:sessionId/pdf', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const pdfBuffer = await pdfReportService.generateSessionReport(sessionId, userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="interview-report-${sessionId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    next(error);
  }
});

export default router;


