import skillAssessmentService from '../services/skillAssessment.service.js';

/**
 * Process promises in batches with concurrency limit
 */
async function processInBatches(items, batchSize, processor) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Get available roles for skill assessment
 */
export const getAvailableRoles = async (req, res, next) => {
  try {
    const roles = [
      { id: 'software-engineer', name: 'Software Engineer', description: 'Technical interviews, coding challenges, system design' },
      { id: 'data-scientist', name: 'Data Scientist', description: 'ML algorithms, statistics, data analysis' },
      { id: 'product-manager', name: 'Product Manager', description: 'Product strategy, prioritization, stakeholder management' },
      { id: 'designer', name: 'UX/UI Designer', description: 'Design thinking, user research, portfolio reviews' },
      { id: 'data-engineer', name: 'Data Engineer', description: 'Data pipelines, ETL, infrastructure' },
      { id: 'security-engineer', name: 'Security Engineer', description: 'Security protocols, threat analysis, compliance' },
      { id: 'marketing', name: 'Marketing Professional', description: 'Campaign strategy, analytics, brand management' },
      { id: 'sales', name: 'Sales Professional', description: 'Sales techniques, negotiation, client relations' },
      { id: 'hr', name: 'HR Professional', description: 'Talent acquisition, organizational behavior, HR strategy' },
    ];

    res.json({ roles });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available FAANG companies
 */
export const getFAANGCompanies = async (req, res, next) => {
  try {
    const companies = skillAssessmentService.getFAANGCompanies();
    res.json({ companies });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a new skill assessment
 * Public endpoint - no authentication required
 */
export const startAssessment = async (req, res, next) => {
  try {
    const { role, difficulty = 'medium', questionCount = 10, company = null } = req.body;

    if (!role) {
      return res.status(400).json({ 
        error: 'Role is required',
        availableRoles: [
          'software-engineer', 'data-scientist', 'product-manager', 
          'designer', 'data-engineer', 'security-engineer', 
          'marketing', 'sales', 'hr'
        ]
      });
    }

    // Validate question count
    const validQuestionCount = Math.min(Math.max(parseInt(questionCount) || 10, 5), 20);
    const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    
    // Validate company if provided
    const validCompany = company && ['google', 'amazon', 'meta', 'apple', 'netflix', 'microsoft'].includes(company.toLowerCase()) 
      ? company.toLowerCase() 
      : null;

    // Generate assessment questions
    const questions = await skillAssessmentService.generateAssessmentQuestions(
      role,
      validDifficulty,
      validQuestionCount,
      validCompany
    );

    // Create assessment session (in-memory, no DB storage for public assessments)
    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      assessmentId,
      role,
      difficulty: validDifficulty,
      company: validCompany,
      questionCount: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        domain: q.domain,
        skill: q.skill,
        difficulty: q.difficulty,
        company: q.company || null
      })),
      startedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    next(error);
  }
};

/**
 * Submit an answer for evaluation
 * Public endpoint - no authentication required
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const { assessmentId, questionId, answer } = req.body;

    if (!questionId || !answer) {
      return res.status(400).json({ 
        error: 'questionId and answer are required' 
      });
    }

    // Find the question (in a real implementation, you'd store this in session/cache)
    // For now, we'll reconstruct from the request
    const question = {
      id: questionId,
      text: req.body.questionText || 'Skill assessment question',
      domain: req.body.domain || 'General',
      difficulty: req.body.difficulty || 'medium',
      role: req.body.role || 'general'
    };

    // Evaluate the answer
    const evaluation = await skillAssessmentService.evaluateAnswer(
      question,
      answer,
      question.role
    );

    res.json({
      questionId,
      evaluation: {
        score: evaluation.score,
        clarityScore: evaluation.clarityScore,
        structureScore: evaluation.structureScore,
        relevanceScore: evaluation.relevanceScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        domain: evaluation.domain,
        skill: evaluation.skill
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    next(error);
  }
};

/**
 * Complete assessment and get summary
 * Public endpoint - no authentication required
 */
export const completeAssessment = async (req, res, next) => {
  try {
    const { assessmentId, role, answers } = req.body;

    if (!role || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        error: 'role and answers array are required' 
      });
    }

    // Filter valid answers
    const validAnswers = answers.filter(answerData => answerData.questionId && answerData.answer);
    
    // Process evaluations in batches of 5 to avoid rate limits while still being fast
    // This processes 5 evaluations concurrently, then moves to the next batch
    const evaluations = await processInBatches(
      validAnswers,
      5, // Process 5 at a time (adjust based on your OpenAI rate limits)
      async (answerData) => {
        try {
          const question = {
            id: answerData.questionId,
            text: answerData.questionText || 'Skill assessment question',
            domain: answerData.domain || 'General',
            difficulty: answerData.difficulty || 'medium',
            role: role
          };

          // Add timeout wrapper (30 seconds per evaluation)
          const evaluationPromise = skillAssessmentService.evaluateAnswer(
            question,
            answerData.answer,
            role
          );

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Evaluation timeout')), 30000)
          );

          const evaluation = await Promise.race([evaluationPromise, timeoutPromise]);

          return {
            ...evaluation,
            questionId: answerData.questionId
          };
        } catch (error) {
          console.error(`Error evaluating answer for question ${answerData.questionId}:`, error);
          // Return a default evaluation for failed answers
          return {
            questionId: answerData.questionId,
            score: 0,
            clarityScore: 0,
            structureScore: 0,
            relevanceScore: 0,
            feedback: 'Unable to evaluate this answer. Please try again.',
            strengths: [],
            improvements: ['Ensure your answer is complete and relevant to the question'],
            domain: answerData.domain || 'General',
            skill: answerData.domain || 'General',
            error: true
          };
        }
      }
    );

    // Calculate skill scores
    const skillScores = skillAssessmentService.calculateSkillScores(evaluations);

    // Generate summary
    const summary = skillAssessmentService.generateSummary(
      role,
      skillScores,
      answers.length,
      evaluations.length
    );

    res.json({
      assessmentId,
      summary,
      evaluations: evaluations.map(e => ({
        questionId: e.questionId,
        score: e.score,
        domain: e.domain,
        skill: e.skill,
        feedback: e.feedback
      }))
    });
  } catch (error) {
    console.error('Error completing assessment:', error);
    next(error);
  }
};

/**
 * Get skill domains for a role
 */
export const getSkillDomains = async (req, res, next) => {
  try {
    const { role } = req.params;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const domains = skillAssessmentService.getRoleSkillDomains(role);

    res.json({
      role,
      domains: domains.map(domain => ({
        name: domain,
        id: domain.toLowerCase().replace(/\s+/g, '-')
      }))
    });
  } catch (error) {
    next(error);
  }
};

