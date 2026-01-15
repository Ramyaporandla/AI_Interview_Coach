import { questionService } from '../services/question.service.js';
import { evaluationService } from '../services/evaluation.service.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Ask a question (generate or use provided question)
 */
export const askQuestion = async (req, res, next) => {
  try {
    const { question, context, mode, role, type, difficulty } = req.body;

    // If question is provided, use it; otherwise generate one
    if (question) {
      return res.json({
        question: {
          id: `q_${Date.now()}`,
          text: question,
          type: type || 'technical',
          difficulty: difficulty || 'medium',
          context,
        },
      });
    }

    // Generate question
    const generatedQuestion = await questionService.generateQuestion({
      type: type || 'technical',
      difficulty: difficulty || 'medium',
      role: role || null,
      context: context || null,
      previousQuestions: [],
    });

    res.json({
      question: generatedQuestion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Score an answer
 */
export const scoreAnswer = async (req, res, next) => {
  try {
    const { question, answer, mode, rubric } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ 
        error: 'Missing required fields: question, answer' 
      });
    }

    // Use evaluation service
    const evaluation = await evaluationService.evaluateAnswer({
      sessionId: `temp_${Date.now()}`,
      questionId: `q_${Date.now()}`,
      answerId: `a_${Date.now()}`,
      answer,
      question: typeof question === 'string' ? question : question.text || question.question_text,
      coachMode: mode || 'friendly',
    });

    res.json({
      score: evaluation.score,
      clarityScore: evaluation.clarityScore || evaluation.clarity_score,
      structureScore: evaluation.structureScore || evaluation.structure_score,
      relevanceScore: evaluation.relevanceScore || evaluation.relevance_score,
      confidenceScore: evaluation.confidenceScore || evaluation.confidence_score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
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
    const { question, answer, transformType } = req.body;

    if (!question || !answer || !transformType) {
      return res.status(400).json({ 
        error: 'Missing required fields: question, answer, transformType' 
      });
    }

    const validTransformTypes = ['STAR', 'senior', 'metrics', 'concise'];
    if (!validTransformTypes.includes(transformType)) {
      return res.status(400).json({ 
        error: `Invalid transformType. Must be one of: ${validTransformTypes.join(', ')}` 
      });
    }

    const questionText = typeof question === 'string' 
      ? question 
      : question.text || question.question_text;

    // Build improvement prompt based on transform type
    let improvementPrompt = '';
    
    switch (transformType) {
      case 'STAR':
        improvementPrompt = `Transform this answer to follow the STAR method (Situation, Task, Action, Result). 
        Structure it clearly with each component labeled or clearly separated.`;
        break;
      case 'senior':
        improvementPrompt = `Rewrite this answer as a senior-level professional would respond. 
        Add depth, technical insights, leadership perspective, and strategic thinking. 
        Show expertise and experience.`;
        break;
      case 'metrics':
        improvementPrompt = `Enhance this answer by adding specific metrics, numbers, percentages, 
        and quantifiable results. Include data-driven evidence of impact.`;
        break;
      case 'concise':
        improvementPrompt = `Make this answer more concise while retaining all key information. 
        Remove redundancy and get to the point faster.`;
        break;
    }

    const prompt = `${improvementPrompt}

QUESTION:
${questionText}

ORIGINAL ANSWER:
${answer}

Provide the improved version of the answer:`;

    try {
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach helping candidates improve their answers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const improvedAnswer = completion.choices[0].message.content;

      res.json({
        improvedAnswer,
        transformType,
        originalAnswer: answer,
      });
    } catch (error) {
      console.error('OpenAI error:', error);
      // Fallback improvement
      let improvedAnswer = answer;
      
      if (transformType === 'concise') {
        // Simple conciseness improvement
        improvedAnswer = answer.split('\n').filter(line => line.trim().length > 0).join('. ').substring(0, 500);
      } else if (transformType === 'metrics') {
        improvedAnswer = answer + '\n\n[Add specific metrics: percentages, numbers, timeframes, scale of impact]';
      } else if (transformType === 'STAR') {
        improvedAnswer = `Situation: [Context]\nTask: [Goal]\nAction: ${answer}\nResult: [Outcome]`;
      } else if (transformType === 'senior') {
        improvedAnswer = answer + '\n\n[Add: Strategic thinking, technical depth, leadership perspective]';
      }

      res.json({
        improvedAnswer,
        transformType,
        originalAnswer: answer,
        note: 'Fallback improvement applied due to API error',
      });
    }
  } catch (error) {
    next(error);
  }
};


