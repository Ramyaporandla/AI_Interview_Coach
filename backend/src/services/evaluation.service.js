import OpenAI from 'openai';
import { db } from '../db/connection.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Answer evaluation service using OpenAI
 */
class EvaluationService {
  /**
   * Validate answer quality and detect random/nonsensical text
   */
  validateAnswer(answer, question) {
    const answerText = answer.trim().toLowerCase();
    const questionText = (typeof question === 'string' ? question : question?.text || '').toLowerCase();
    
    // Check for empty or very short answers
    if (!answerText || answerText.length < 10) {
      return { isValid: false, reason: 'Answer is too short or empty', score: 0 };
    }
    
    // Check for random character patterns (repeated characters, gibberish)
    const repeatedChars = /(.)\1{4,}/.test(answerText);
    const randomPatterns = /[^a-z0-9\s]{5,}/.test(answerText);
    
    // Check for common random text patterns
    const randomTextPatterns = [
      /^[a-z]\s+[a-z]\s+[a-z]\s+[a-z]/, // Single letters separated
      /^(asdf|qwerty|test|random|hello|hi|yes|no|ok|okay)[\s\.,!]*$/i, // Common random words
      /^(lorem|ipsum|dolor|sit|amet)/i, // Lorem ipsum
      /^[0-9\s]+$/, // Only numbers
      /^[^a-z0-9]+$/i, // Only special characters
    ];
    
    if (repeatedChars || randomPatterns) {
      return { isValid: false, reason: 'Answer contains random character patterns', score: 0.5 };
    }
    
    for (const pattern of randomTextPatterns) {
      if (pattern.test(answerText)) {
        return { isValid: false, reason: 'Answer appears to be random text', score: 0.5 };
      }
    }
    
    // Check for relevance - extract key terms from question
    const questionKeywords = questionText
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 5);
    
    // Check if answer contains any relevant keywords (at least 1-2 should match)
    if (questionKeywords.length > 0) {
      const relevantKeywords = questionKeywords.filter(keyword => 
        answerText.includes(keyword)
      );
      
      // If answer is very short and has no relevant keywords, it's likely random
      if (answerText.length < 50 && relevantKeywords.length === 0) {
        return { isValid: false, reason: 'Answer does not address the question', score: 1.0 };
      }
    }
    
    // Check for nonsensical word combinations (very short words, no structure)
    const words = answerText.split(/\s+/).filter(w => w.length > 0);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / (words.length || 1);
    
    // If average word length is too short, might be random
    if (words.length > 5 && avgWordLength < 2.5) {
      return { isValid: false, reason: 'Answer appears nonsensical', score: 1.0 };
    }
    
    return { isValid: true };
  }

  /**
   * Evaluate an answer and provide feedback
   */
  async evaluateAnswer({ sessionId, questionId, answerId, answer, question, coachMode = 'friendly' }) {
    try {
      console.log('Starting evaluation for question:', questionId);
      
      // Handle different question formats
      let questionText = '';
      if (typeof question === 'string') {
        questionText = question;
      } else if (question && typeof question === 'object') {
        questionText = question.text || question.question_text || JSON.stringify(question);
      } else {
        questionText = 'Interview question';
      }
      
      // Validate answer before evaluation
      const validation = this.validateAnswer(answer, questionText);
      if (!validation.isValid) {
        console.log('Answer validation failed:', validation.reason);
        return {
          score: validation.score || 0,
          clarityScore: 0,
          structureScore: 0,
          relevanceScore: 0,
          confidenceScore: 0,
          feedback: `This answer appears to be ${validation.reason.toLowerCase()}. Please provide a relevant, detailed response to the question.`,
          strengths: [],
          improvements: [
            'Provide a detailed answer that directly addresses the question',
            'Include specific examples and explanations',
            'Ensure your answer is relevant to the topic asked'
          ],
          isInvalid: true
        };
      }
      
      const prompt = this.buildEvaluationPrompt(questionText, answer, coachMode);

      // Use gpt-3.5-turbo as default (more accessible)
      // Can be overridden with OPENAI_MODEL env variable
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      
      console.log(`Using OpenAI model: ${model}`);
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: coachMode === 'strict' 
              ? 'You are a rigorous interviewer providing critical, no-nonsense feedback.'
              : coachMode === 'faang'
              ? 'You are a FAANG-level interviewer expecting excellence and depth.'
              : coachMode === 'hr'
              ? 'You are an HR interviewer focusing on soft skills and cultural fit.'
              : 'You are a supportive mentor providing encouraging feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 800,
      });

      const evaluationText = completion.choices[0].message.content;
      console.log('Received evaluation from OpenAI');
      let evaluation = this.parseEvaluation(evaluationText);
      console.log('Parsed evaluation:', { score: evaluation.score });

      // Post-process: Strictly penalize random/irrelevant answers
      evaluation = this.applyStrictScoring(evaluation, answer, questionText);

      // Save evaluation to database with detailed scores
      await db.query(
        `INSERT INTO answer_evaluations 
         (id, session_id, question_id, answer_id, score, clarity_score, structure_score, relevance_score, confidence_score, feedback_text, strengths, improvements, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
        [
          sessionId,
          questionId,
          answerId,
          evaluation.score || 0,
          evaluation.clarityScore || evaluation.clarity_score || null,
          evaluation.structureScore || evaluation.structure_score || null,
          evaluation.relevanceScore || evaluation.relevance_score || null,
          evaluation.confidenceScore || evaluation.confidence_score || null,
          evaluation.feedback,
          JSON.stringify(evaluation.strengths || []),
          JSON.stringify(evaluation.improvements || []),
        ]
      );

      console.log('Evaluation saved successfully');
      return evaluation;
    } catch (error) {
      console.error('Evaluation error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // Handle model access errors - try with gpt-3.5-turbo if specified model fails
      if (error.message && error.message.includes('does not exist') && model !== 'gpt-3.5-turbo') {
        console.log(`${model} not available, retrying with gpt-3.5-turbo...`);
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert technical interviewer. Evaluate answers objectively and provide constructive feedback.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 800,
          });

          const evaluationText = completion.choices[0].message.content;
          let evaluation = this.parseEvaluation(evaluationText);
          
          // Post-process: Strictly penalize random/irrelevant answers
          evaluation = this.applyStrictScoring(evaluation, answer, questionText);

          await db.query(
            `INSERT INTO answer_evaluations 
             (id, session_id, question_id, answer_id, score, feedback_text, strengths, improvements, created_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
              sessionId,
              questionId,
              answerId,
              evaluation.score,
              evaluation.feedback,
              JSON.stringify(evaluation.strengths),
              JSON.stringify(evaluation.improvements),
            ]
          );

          console.log('Evaluation saved successfully with gpt-3.5-turbo');
          return evaluation;
        } catch (retryError) {
          console.error('Retry with gpt-3.5-turbo also failed:', retryError);
          // Fall through to default error handling
        }
      }
      
      // Handle quota/billing errors - provide helpful feedback
      if (error.message && (error.message.includes('quota') || error.message.includes('billing'))) {
        console.error('OpenAI quota exceeded - using fallback evaluation');
        return this.generateFallbackEvaluation(sessionId, questionId, answerId, answer);
      }
      
      // Handle rate limiting
      if (error.message && error.message.includes('rate_limit')) {
        console.error('OpenAI rate limit hit, using fallback evaluation');
        return this.generateFallbackEvaluation(sessionId, questionId, answerId, answer);
      }
      
      // For other errors, use fallback evaluation
      console.error('OpenAI API error, using fallback evaluation:', error.message);
      return this.generateFallbackEvaluation(sessionId, questionId, answerId, answer);
    }
  }

  /**
   * Build evaluation prompt
   */
  buildEvaluationPrompt(question, answer, coachMode = 'friendly') {
    const coachPrompts = {
      friendly: 'You are a supportive mentor providing encouraging feedback.',
      strict: 'You are a rigorous interviewer providing critical, no-nonsense feedback.',
      faang: 'You are a FAANG-level interviewer expecting excellence and depth.',
      hr: 'You are an HR interviewer focusing on soft skills and cultural fit.',
    };

    return `${coachPrompts[coachMode] || coachPrompts.friendly}

Evaluate the following interview answer STRICTLY:

QUESTION:
${question}

ANSWER:
${answer}

CRITICAL EVALUATION RULES:
1. If the answer is random text, gibberish, completely irrelevant, or does not address the question AT ALL, give a score of 0-1 (NOT 0-2)
2. If the answer is very short (less than 20 words) and doesn't address the question, give a score of 0-2 (NOT 1-3)
3. Relevance is CRITICAL - answers that don't relate to the question should receive relevanceScore of 0-1 (NOT 0-2)
4. Be EXTREMELY strict - random text like "asdf", "qwerty", "test", "hello", "random", repeated characters, or nonsensical responses MUST score 0 (zero)
5. Only give scores above 5 if the answer actually attempts to address the question meaningfully AND is relevant
6. If you detect ANY pattern of random text, gibberish, or complete irrelevance, the score MUST be 0-1, never higher

Provide your evaluation in the following JSON format:
{
  "score": <overall number between 0-10, be STRICT about relevance>,
  "clarityScore": <number 0-10 for clarity and communication>,
  "structureScore": <number 0-10 for organization and structure>,
  "relevanceScore": <number 0-10 for relevance to question - CRITICAL, penalize heavily if irrelevant>,
  "confidenceScore": <number 0-10 for confidence and assertiveness>,
  "feedback": "<detailed feedback text explaining why the score was given>",
  "strengths": ["<strength1>", "<strength2>"] or [] if answer is irrelevant,
  "improvements": ["<improvement1>", "<improvement2>"]
}

Consider:
- RELEVANCE FIRST: Does this answer actually address the question? If not, score 0-2
- Technical accuracy (for technical questions) - only if answer is relevant
- Clarity and communication - only if answer makes sense
- Problem-solving approach - only if answer attempts to solve the problem
- Code quality (if applicable) - only if code is provided and relevant
- Completeness of answer - only if answer is relevant
- STAR method structure (for behavioral questions) - only if answer is relevant
- Confidence level and assertiveness - only if answer is relevant

IMPORTANT: If the answer is random text, gibberish, or completely irrelevant, you MUST:
- Give score of 0 (zero) or maximum 1, NEVER higher
- Set relevanceScore to 0 (zero)
- Set clarityScore, structureScore, and confidenceScore to 0 (zero)
- Explain clearly in feedback that the answer does not address the question and appears to be random text
- Do NOT give any strengths if answer is irrelevant
- Examples of random text that MUST score 0: "asdf", "qwerty", "test test", "random random", "hello hello", repeated characters, single letters, only numbers, gibberish`;
  }

  /**
   * Apply strict scoring rules to penalize random/irrelevant answers
   */
  applyStrictScoring(evaluation, answer, question) {
    const answerText = answer.trim().toLowerCase();
    const questionText = (typeof question === 'string' ? question : question?.text || '').toLowerCase();
    
    // Check for random text patterns
    const randomPatterns = [
      /^(asdf|qwerty|test|random|hello|hi|yes|no|ok|okay|lorem|ipsum|dummy|sample)[\s\.,!]*$/i,
      /^[a-z]\s+[a-z]\s+[a-z]\s+[a-z]/i,
      /^[0-9\s]+$/,
      /^(.)\1{8,}$/,
      /^[^a-z0-9\s]{8,}$/i,
    ];
    
    let isRandomText = false;
    for (const pattern of randomPatterns) {
      if (pattern.test(answer.trim())) {
        isRandomText = true;
        break;
      }
    }
    
    // Check for repeated characters
    if (/(.)\1{4,}/.test(answerText)) {
      isRandomText = true;
    }
    
    // Check for keyboard mashing / gibberish (like "uhdjwef;ofjker")
    if (!isRandomText) {
      const words = answerText.split(/[\s\.,;:!?]+/).filter(w => w.length > 0);
      if (words.length > 0) {
        const commonWords = new Set([
          'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
          'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
          'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
          'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
          'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
          'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
          'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
          'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had', 'did', 'does', 'doing', 'done'
        ]);
        
        let realWordCount = 0;
        let gibberishWordCount = 0;
        const vowels = /[aeiou]/gi;
        
        for (const word of words) {
          const cleanWord = word.replace(/[^a-z]/gi, '');
          if (cleanWord.length === 0) continue;
          
          if (commonWords.has(cleanWord)) {
            realWordCount++;
            continue;
          }
          
          if (cleanWord.length >= 4) {
            const vowelCount = (cleanWord.match(vowels) || []).length;
            const consonantClusters = cleanWord.match(/[bcdfghjklmnpqrstvwxyz]{3,}/gi);
            
            if (cleanWord.length > 5 && vowelCount === 0) {
              gibberishWordCount++;
            } else if (consonantClusters && consonantClusters.length > 0 && cleanWord.length > 4) {
              gibberishWordCount++;
            } else if (cleanWord.length > 6 && /^[bcdfghjklmnpqrstvwxyz]{3,}[aeiou][bcdfghjklmnpqrstvwxyz]{3,}$/i.test(cleanWord)) {
              gibberishWordCount++;
            }
          }
        }
        
        const totalWords = realWordCount + gibberishWordCount;
        if ((realWordCount === 0 && gibberishWordCount > 0) || 
            (totalWords > 0 && gibberishWordCount / totalWords > 0.6) ||
            (answerText.length < 50 && gibberishWordCount >= 2 && realWordCount === 0)) {
          isRandomText = true;
        }
      }
    }
    
    // Check relevance - if answer has no relevant keywords from question
    if (!isRandomText && questionText) {
      const questionKeywords = questionText
        .split(/\s+/)
        .filter(word => word.length > 4)
        .slice(0, 8);
      
      if (questionKeywords.length > 0 && answerText.length < 100) {
        const relevantKeywords = questionKeywords.filter(keyword => 
          answerText.includes(keyword)
        );
        
        if (relevantKeywords.length === 0) {
          // Answer is likely irrelevant
          const relevanceScore = evaluation.relevanceScore || evaluation.relevance_score || 10;
          if (relevanceScore <= 2) {
            // If relevance is very low, treat as random
            isRandomText = true;
          }
        }
      }
    }
    
    // Apply strict penalties for random/irrelevant text
    if (isRandomText) {
      evaluation.score = 0;
      evaluation.relevanceScore = 0;
      evaluation.relevance_score = 0;
      evaluation.clarityScore = 0;
      evaluation.clarity_score = 0;
      evaluation.structureScore = 0;
      evaluation.structure_score = 0;
      evaluation.confidenceScore = 0;
      evaluation.confidence_score = 0;
      evaluation.strengths = [];
      evaluation.feedback = 'This answer appears to be random text or does not address the question. Please provide a relevant, detailed response that directly answers the question.';
      evaluation.improvements = [
        'Provide a detailed answer that directly addresses the question',
        'Include specific examples and explanations',
        'Ensure your answer is relevant to the topic asked'
      ];
    } else {
      // Still cap scores if relevance is very low
      const relevanceScore = evaluation.relevanceScore || evaluation.relevance_score || 10;
      if (relevanceScore <= 2) {
        // Cap overall score at 2 if relevance is very low
        if (evaluation.score > 2) {
          evaluation.score = 2;
        }
      } else if (relevanceScore <= 4) {
        // Cap overall score at 4 if relevance is low
        if (evaluation.score > 4) {
          evaluation.score = Math.min(evaluation.score, 4);
        }
      }
    }
    
    return evaluation;
  }

  /**
   * Parse evaluation response
   */
  parseEvaluation(evaluationText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse evaluation JSON:', error);
    }

    // Fallback parsing
    return {
      score: 5.0,
      feedback: evaluationText,
      strengths: [],
      improvements: [],
    };
  }

  /**
   * Generate fallback evaluation when OpenAI is unavailable
   * Provides dynamic feedback based on answer content, length, and structure
   */
  async generateFallbackEvaluation(sessionId, questionId, answerId, answer) {
    console.log('Generating fallback evaluation');
    
    // Get question type from database to tailor feedback
    let questionType = 'behavioral';
    try {
      const questionResult = await db.query(
        'SELECT question_type FROM interview_questions WHERE id = $1',
        [questionId]
      );
      if (questionResult.rows.length > 0) {
        questionType = questionResult.rows[0].question_type || 'behavioral';
      }
    } catch (err) {
      console.error('Could not fetch question type:', err);
    }
    
    const answerText = answer.trim();
    const answerLength = answerText.length;
    const wordCount = answerText.split(/\s+/).filter(w => w.length > 0).length;
    const sentences = answerText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const answerLower = answerText.toLowerCase();
    
    // FIRST: Check for random text patterns - if detected, return score of 0
    const randomPatterns = [
      /^(asdf|qwerty|test|random|hello|hi|yes|no|ok|okay|lorem|ipsum|dummy|sample)[\s\.,!]*$/i,
      /^[a-z]\s+[a-z]\s+[a-z]\s+[a-z]/i,
      /^[0-9\s]+$/,
      /^(.)\1{8,}$/,
      /^[^a-z0-9\s]{8,}$/i,
    ];
    
    let isRandomText = false;
    for (const pattern of randomPatterns) {
      if (pattern.test(answerText)) {
        isRandomText = true;
        break;
      }
    }
    
    // Check for repeated characters
    if (/(.)\1{4,}/.test(answerLower)) {
      isRandomText = true;
    }
    
    // Check for keyboard mashing / gibberish (like "uhdjwef;ofjker")
    if (!isRandomText) {
      const words = answerLower.split(/[\s\.,;:!?]+/).filter(w => w.length > 0);
      if (words.length > 0) {
        const commonWords = new Set([
          'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
          'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
          'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
          'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
          'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
          'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
          'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
          'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had', 'did', 'does', 'doing', 'done'
        ]);
        
        let realWordCount = 0;
        let gibberishWordCount = 0;
        const vowels = /[aeiou]/gi;
        
        for (const word of words) {
          const cleanWord = word.replace(/[^a-z]/gi, '');
          if (cleanWord.length === 0) continue;
          
          if (commonWords.has(cleanWord)) {
            realWordCount++;
            continue;
          }
          
          if (cleanWord.length >= 4) {
            const vowelCount = (cleanWord.match(vowels) || []).length;
            const consonantClusters = cleanWord.match(/[bcdfghjklmnpqrstvwxyz]{3,}/gi);
            
            if (cleanWord.length > 5 && vowelCount === 0) {
              gibberishWordCount++;
            } else if (consonantClusters && consonantClusters.length > 0 && cleanWord.length > 4) {
              gibberishWordCount++;
            } else if (cleanWord.length > 6 && /^[bcdfghjklmnpqrstvwxyz]{3,}[aeiou][bcdfghjklmnpqrstvwxyz]{3,}$/i.test(cleanWord)) {
              gibberishWordCount++;
            }
          }
        }
        
        const totalWords = realWordCount + gibberishWordCount;
        if ((realWordCount === 0 && gibberishWordCount > 0) || 
            (totalWords > 0 && gibberishWordCount / totalWords > 0.6) ||
            (answerText.length < 50 && gibberishWordCount >= 2 && realWordCount === 0)) {
          isRandomText = true;
        }
      }
    }
    
    // If random text detected, return score of 0 immediately
    if (isRandomText) {
      return {
        score: 0,
        clarityScore: 0,
        structureScore: 0,
        relevanceScore: 0,
        confidenceScore: 0,
        feedback: 'This answer appears to be random text or does not address the question. Please provide a relevant, detailed response that directly answers the question.',
        strengths: [],
        improvements: [
          'Provide a detailed answer that directly addresses the question',
          'Include specific examples and explanations',
          'Ensure your answer is relevant to the topic asked'
        ],
      };
    }
    
    // Score based on multiple factors
    let score = 4.0; // Start with base score
    const strengths = [];
    const improvements = [];
    
    // Length analysis (more detailed = better)
    if (answerLength > 300) {
      score += 2.0;
      strengths.push('Comprehensive and detailed answer');
    } else if (answerLength > 200) {
      score += 1.5;
      strengths.push('Good level of detail');
    } else if (answerLength > 100) {
      score += 0.5;
      strengths.push('Adequate length');
    } else if (answerLength < 50) {
      score -= 1.0;
      improvements.push('Answer is too brief. Aim for at least 100-200 words with specific examples');
    } else {
      improvements.push('Consider expanding your answer with more detail and context');
    }
    
    // Structure analysis
    if (sentences.length > 5) {
      score += 0.5;
      strengths.push('Well-structured with multiple points');
    } else if (sentences.length < 3) {
      score -= 0.5;
      improvements.push('Break down your answer into clearer sections or bullet points');
    }
    
    // STAR method analysis (for behavioral questions)
    let starScores = {};
    let starCount = 0;
    
    if (questionType === 'behavioral') {
      const starKeywords = {
        situation: ['situation', 'context', 'background', 'when', 'where'],
        task: ['task', 'goal', 'objective', 'challenge', 'problem'],
        action: ['action', 'did', 'implemented', 'created', 'developed', 'worked'],
        result: ['result', 'outcome', 'achieved', 'learned', 'impact', 'improved']
      };
      
      Object.keys(starKeywords).forEach(component => {
        starScores[component] = starKeywords[component].some(keyword => 
          answerLower.includes(keyword)
        );
      });
      
      starCount = Object.values(starScores).filter(Boolean).length;
      
      if (starCount === 4) {
        score += 2.0;
        strengths.push('Excellent STAR method structure - covers Situation, Task, Action, and Result');
      } else if (starCount === 3) {
        score += 1.0;
        strengths.push('Good STAR structure - covers most components');
        improvements.push('Ensure you clearly address all STAR components (Situation, Task, Action, Result)');
      } else if (starCount === 2) {
        score += 0.5;
        improvements.push('Structure your answer using the STAR method: Situation (context), Task (goal), Action (what you did), Result (outcome)');
      } else {
        score -= 0.5;
        improvements.push('Use the STAR method: Describe the Situation, Task, Action you took, and Result achieved');
      }
    }
    
    // Technical question analysis
    if (questionType === 'technical' || questionType === 'system-design') {
      // Check for technical terms
      const technicalIndicators = ['algorithm', 'complexity', 'optimize', 'efficient', 'data structure', 'design', 'scale', 'system'];
      const hasTechnicalTerms = technicalIndicators.some(term => answerLower.includes(term));
      
      if (hasTechnicalTerms) {
        score += 1.0;
        strengths.push('Uses appropriate technical terminology');
      } else {
        improvements.push('Include relevant technical terms and concepts');
      }
      
      // Check for code/implementation details
      if (answerLower.includes('code') || answerLower.includes('implement') || answerLower.includes('function')) {
        score += 0.5;
        strengths.push('Mentions implementation details');
      }
    }
    
    // Content quality indicators
    const qualityIndicators = {
      examples: ['example', 'for instance', 'specifically', 'such as', 'like when'],
      metrics: ['percent', '%', 'number', 'increased', 'decreased', 'improved'],
      actionVerbs: ['achieved', 'implemented', 'created', 'developed', 'solved', 'improved'],
      problemSolving: ['problem', 'challenge', 'issue', 'obstacle', 'difficulty', 'overcame']
    };
    
    // Examples
    if (qualityIndicators.examples.some(ind => answerLower.includes(ind))) {
      score += 1.0;
      strengths.push('Includes concrete examples and specifics');
    } else {
      improvements.push('Add specific examples or scenarios to illustrate your points');
    }
    
    // Metrics/quantifiable results
    if (qualityIndicators.metrics.some(ind => answerLower.includes(ind))) {
      score += 0.5;
      strengths.push('Includes quantifiable results or metrics');
    } else if (questionType === 'behavioral') {
      improvements.push('Include specific numbers or metrics to quantify your impact');
    }
    
    // Action verbs (shows proactivity)
    const actionVerbCount = qualityIndicators.actionVerbs.filter(verb => 
      answerLower.includes(verb)
    ).length;
    if (actionVerbCount >= 3) {
      score += 0.5;
      strengths.push('Demonstrates proactive approach with action-oriented language');
    }
    
    // Problem-solving
    if (qualityIndicators.problemSolving.some(ind => answerLower.includes(ind))) {
      score += 0.5;
      strengths.push('Addresses challenges and problem-solving');
    }
    
    // Grammar and clarity (basic check)
    const hasPunctuation = /[.!?]/.test(answerText);
    const hasCapitalization = /[A-Z]/.test(answerText);
    
    if (hasPunctuation && hasCapitalization) {
      score += 0.5;
      strengths.push('Clear writing with proper punctuation');
    } else {
      improvements.push('Improve grammar and punctuation for better clarity');
    }
    
    // Normalize score to 0-10 range
    score = Math.min(10, Math.max(0, Math.round(score * 10) / 10));
    
    // Generate personalized feedback
    let feedback = '';
    
    if (score >= 8) {
      feedback = `Excellent answer! Your response demonstrates strong understanding and clear communication. `;
      if (questionType === 'behavioral') {
        feedback += `You've effectively used the STAR method and provided concrete examples. `;
      }
      feedback += `Continue building on these strengths.`;
    } else if (score >= 6) {
      feedback = `Good answer with solid fundamentals. `;
      if (answerLength < 200) {
        feedback += `Consider adding more detail and specific examples to strengthen your response. `;
      }
      if (questionType === 'behavioral' && !starScores.result) {
        feedback += `Make sure to clearly articulate the results and impact of your actions. `;
      }
      feedback += `With a bit more refinement, this could be an outstanding answer.`;
    } else {
      feedback = `Your answer shows understanding but needs more development. `;
      if (answerLength < 100) {
        feedback += `Significantly expand your answer with more detail. `;
      }
      if (questionType === 'behavioral') {
        feedback += `Structure your response using the STAR method: describe the Situation, Task, Action, and Result. `;
      }
      feedback += `Include specific examples and quantify your impact where possible.`;
    }
    
    // Add question-specific feedback
    if (questionType === 'behavioral') {
      feedback += ` For behavioral questions, focus on specific situations, your actions, and measurable outcomes.`;
    } else if (questionType === 'technical') {
      feedback += ` For technical questions, explain your approach, time/space complexity considerations, and trade-offs.`;
    } else if (questionType === 'system-design') {
      feedback += ` For system design, discuss scalability, reliability, and key architectural decisions.`;
    }
    
    // Ensure we have at least some strengths or improvements
    if (strengths.length === 0) {
      strengths.push('Clear communication');
    }
    if (improvements.length === 0) {
      improvements.push('Continue practicing to refine your answers');
    }
    
    // Calculate detailed scores from fallback analysis
    const clarityScore = answerLength > 200 && hasPunctuation ? Math.min(8, score + 1) : score
    const structureScore = sentences.length > 5 ? Math.min(8, score + 0.5) : score - 0.5
    const relevanceScore = wordCount > 50 ? Math.min(8, score + 0.5) : score - 1
    const confidenceScore = actionVerbCount >= 3 ? Math.min(8, score + 0.5) : score

    // Save fallback evaluation
    await db.query(
      `INSERT INTO answer_evaluations 
       (id, session_id, question_id, answer_id, score, clarity_score, structure_score, relevance_score, confidence_score, feedback_text, strengths, improvements, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        sessionId,
        questionId,
        answerId,
        score,
        clarityScore,
        structureScore,
        relevanceScore,
        confidenceScore,
        feedback,
        JSON.stringify(strengths),
        JSON.stringify(improvements),
      ]
    );
    
    console.log('Fallback evaluation saved successfully', { score, strengthsCount: strengths.length, improvementsCount: improvements.length });
    
    return {
      score,
      clarityScore,
      structureScore,
      relevanceScore,
      confidenceScore,
      feedback,
      strengths,
      improvements,
    };
  }
}

export const evaluationService = new EvaluationService();

