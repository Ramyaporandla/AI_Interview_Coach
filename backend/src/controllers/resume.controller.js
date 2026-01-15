import multer from 'multer';
import { validationResult } from 'express-validator';
import { resumeService } from '../services/resume.service.js';
import { questionService } from '../services/question.service.js';
import { atsService } from '../services/ats.service.js';
import { jdMatchService } from '../services/jdMatch.service.js';
import { jdService } from '../services/jd.service.js';
import { db } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
  },
});

/**
 * Upload resume and extract text
 */
export const uploadResume = async (req, res, next) => {
  try {
    console.log('[ResumeController] Upload request received');
    const userId = req.user?.userId;
    
    if (!userId) {
      console.error('[ResumeController] No user ID found in request');
      return res.status(401).json({ error: 'Unauthorized - please log in' });
    }
    
    if (!req.file) {
      console.error('[ResumeController] No file in request');
      return res.status(400).json({ error: 'No file uploaded. Please select a PDF or DOCX file.' });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    console.log('[ResumeController] File received:', {
      fileName: originalname,
      mimeType: mimetype,
      size: size,
      bufferLength: buffer?.length
    });

    let extractedText = '';

    // Parse based on file type
    if (mimetype === 'application/pdf') {
      console.log('[ResumeController] Parsing PDF...');
      extractedText = await resumeService.parsePDF(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      console.log('[ResumeController] Parsing DOCX...');
      extractedText = await resumeService.parseDOCX(buffer);
    } else {
      console.error('[ResumeController] Unsupported file type:', mimetype);
      return res.status(400).json({ 
        error: `Unsupported file type: ${mimetype}. Please upload a PDF or DOCX file.` 
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      console.error('[ResumeController] No text extracted from file');
      return res.status(400).json({ 
        error: 'Could not extract text from file. The file may be corrupted, image-based, or password-protected.' 
      });
    }

    console.log('[ResumeController] Text extracted successfully, length:', extractedText.length);

    // Save resume
    const resume = await resumeService.saveResume(
      userId,
      extractedText,
      originalname,
      mimetype,
      size
    );

    // Return preview (first 500 chars)
    const extractedTextPreview = extractedText.substring(0, 500) + 
      (extractedText.length > 500 ? '...' : '');

    console.log('[ResumeController] Upload successful, resumeId:', resume.id);

    res.status(201).json({
      resumeId: resume.id,
      extractedText: extractedText,
      extractedTextPreview,
      fileName: resume.fileName,
    });
  } catch (error) {
    console.error('[ResumeController] Upload error:', error);
    next(error);
  }
};

/**
 * Generate interview questions from resume
 */
export const generateFromResume = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { resumeId, role, type, difficulty } = req.body;

    // Validate input
    if (!resumeId || !role || !type || !difficulty) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeId, role, type, difficulty' 
      });
    }

    // Get resume
    const resume = await resumeService.getResume(resumeId, userId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Generate questions based on resume content with deduplication
    const questions = [];
    const uniqueTexts = new Set(); // Track normalized question texts
    const questionCount = 5; // Generate exactly 5 unique questions
    const maxAttempts = 10; // Max attempts to ensure uniqueness
    let attempts = 0;

    while (questions.length < questionCount && attempts < maxAttempts) {
      attempts++;
      
      try {
        const question = await questionService.generateQuestion({
          type,
          difficulty,
          role,
          context: resume.extracted_text, // Pass resume context
          previousQuestions: questions.map(q => q.text),
        });
        
        // Check for duplicates using normalized text
        const normalizedText = questionService.normalizeQuestionText(question.text);
        
        if (!uniqueTexts.has(normalizedText) && normalizedText.length > 10) {
          uniqueTexts.add(normalizedText);
          questions.push(question);
        } else {
          console.log(`[ResumeController] Duplicate question detected, regenerating... (attempt ${attempts})`);
        }
      } catch (error) {
        console.error(`[ResumeController] Error generating question (attempt ${attempts}):`, error);
        // Continue to next attempt
      }
    }
    
    // Fill remaining slots with fallback questions if needed
    if (questions.length < questionCount) {
      console.log(`[ResumeController] Only generated ${questions.length} unique questions, filling with fallback...`);
      const fallbackQuestions = questionService.getGenericFallbackQuestions(role, difficulty);
      
      for (const fallback of fallbackQuestions) {
        if (questions.length >= questionCount) break;
        
        const normalizedText = questionService.normalizeQuestionText(fallback.text);
        if (!uniqueTexts.has(normalizedText)) {
          uniqueTexts.add(normalizedText);
          questions.push(fallback);
        }
      }
    }
    
    // Ensure we have at least 5 questions
    const finalQuestions = questions.slice(0, Math.max(questionCount, questions.length));
    console.log(`[ResumeController] Generated ${finalQuestions.length} unique questions out of ${attempts} attempts`);

    res.json({
      questions,
      resumeId,
      role,
      type,
      difficulty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Run ATS scan on resume (optionally with JD for keyword matching)
 */
export const scanATS = async (req, res, next) => {
  try {
    console.log('[ResumeController] ATS scan request received');
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[ResumeController] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user?.userId;
    const { resumeId, jdText, jobTitle, company } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - please log in' });
    }

    console.log('[ResumeController] Fetching resume:', resumeId);

    // Get resume
    const resume = await resumeService.getResume(resumeId, userId);
    if (!resume) {
      console.error('[ResumeController] Resume not found:', resumeId);
      return res.status(404).json({ error: 'Resume not found' });
    }

    console.log('[ResumeController] Running ATS scan on resume text length:', resume.extracted_text?.length);
    if (jdText) {
      console.log('[ResumeController] JD text provided, length:', jdText.length);
    }

    // Run ATS scan
    const atsResult = await atsService.scanResume(resume.extracted_text);

    // If JD is provided, enhance with JD matching
    let missingKeywords = [];
    let improvements = [];
    let readyStatus = 'ready';
    let readyMessage = '';

    if (jdText && jdText.trim()) {
      console.log('[ResumeController] Enhancing ATS scan with JD matching');
      const jdMatchResult = await jdMatchService.matchResume(resume.extracted_text, jdText);
      
      // Extract missing keywords from JD match
      missingKeywords = jdMatchResult.missingKeywords || [];
      
      // Combine ATS suggestions with JD recommendations
      improvements = [
        ...(atsResult.criticalFixes || []),
        ...(atsResult.suggestions || []),
        ...(jdMatchResult.recommendedEdits || [])
      ];

      // Determine ready status based on combined scores
      const combinedScore = (atsResult.atsScore + jdMatchResult.matchScore) / 2;
      
      if (combinedScore >= 80) {
        readyStatus = 'ready';
        readyMessage = 'Your resume is ready! It has strong ATS compatibility and matches well with the job description.';
      } else if (combinedScore >= 60) {
        readyStatus = 'almost-ready';
        readyMessage = 'Your resume is almost ready. Consider making a few improvements for better results.';
      } else {
        readyStatus = 'not-ready';
        readyMessage = 'Your resume needs improvements. Focus on the critical fixes and missing keywords below.';
      }
    } else {
      // No JD provided, use ATS score only
      improvements = [
        ...(atsResult.criticalFixes || []),
        ...(atsResult.suggestions || [])
      ];

      if (atsResult.atsScore >= 80) {
        readyStatus = 'ready';
        readyMessage = 'Your resume has good ATS compatibility. For better results, add a job description to get keyword matching.';
      } else if (atsResult.atsScore >= 60) {
        readyStatus = 'almost-ready';
        readyMessage = 'Your resume is decent but could be improved. Address the suggestions below.';
      } else {
        readyStatus = 'not-ready';
        readyMessage = 'Your resume needs significant improvements. Focus on the critical fixes below.';
      }
    }

    console.log('[ResumeController] ATS scan completed, score:', atsResult.atsScore, 'readyStatus:', readyStatus);

    res.json({
      ...atsResult,
      missingKeywords: missingKeywords.slice(0, 20), // Top 20 missing keywords
      improvements: improvements.slice(0, 15), // Top 15 improvements
      readyStatus,
      readyMessage,
    });
  } catch (error) {
    console.error('[ResumeController] ATS scan error:', error);
    next(error);
  }
};

/**
 * Match resume against job description
 */
export const matchJD = async (req, res, next) => {
  try {
    console.log('[ResumeController] JD match request received');
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[ResumeController] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user?.userId;
    const { resumeId, jdText, jobTitle, company } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - please log in' });
    }

    // Get resume
    const resume = await resumeService.getResume(resumeId, userId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Save JD if provided
    let jdId = null;
    if (jdText) {
      const savedJD = await jdService.saveJD(userId, jdText, resumeId, jobTitle, company);
      jdId = savedJD.id;
    }

    // Run JD match
    const matchResult = await jdMatchService.matchResume(
      resume.extracted_text,
      jdText
    );

    res.json({
      ...matchResult,
      jdId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate interview questions from resume and JD
 */
export const generateInterviewQuestions = async (req, res, next) => {
  try {
    console.log('[ResumeController] Generate interview questions request received');
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[ResumeController] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user?.userId;
    const { resumeId, jdText, role, difficulty } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - please log in' });
    }

    // Get resume
    const resume = await resumeService.getResume(resumeId, userId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Generate questions
    const result = await questionService.generateResumeBasedQuestions(
      resume.extracted_text,
      jdText || '',
      role,
      difficulty
    );

    res.json({
      ...result,
      resumeId,
      jdText: jdText || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's resumes
 */
export const getUserResumes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const resumes = await resumeService.getUserResumes(userId);
    
    res.json({
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

// Export multer middleware
export { upload };

