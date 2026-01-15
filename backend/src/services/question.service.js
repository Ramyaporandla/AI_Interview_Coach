import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../db/connection.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Question generation service using OpenAI
 */
class QuestionService {
  /**
   * Normalize question text for comparison (trim + lowercase)
   */
  normalizeQuestionText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Check if a question is a duplicate
   */
  isDuplicate(question, existingQuestions) {
    const normalizedText = this.normalizeQuestionText(question.text || question);
    return existingQuestions.some(existing => {
      const existingText = this.normalizeQuestionText(existing.text || existing);
      return normalizedText === existingText;
    });
  }

  /**
   * Get fallback generic questions (20 questions for better coverage)
   */
  getGenericFallbackQuestions(role, difficulty) {
    const genericQuestions = [
      'Tell me about yourself and your background.',
      'Why are you interested in this position?',
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'What are your greatest strengths and how do they apply to this role?',
      'Tell me about a time when you had to learn something new quickly.',
      'How do you handle working under pressure or tight deadlines?',
      'Describe a situation where you had to collaborate with a difficult team member.',
      'What technical skills do you bring to this role?',
      'Tell me about a time when you had to make a difficult technical decision.',
      'How do you stay updated with the latest technologies and industry trends?',
      'Describe a time when you had to debug a complex problem. What was your approach?',
      'Tell me about a project where you had to work with a tight deadline. How did you prioritize?',
      'What is your approach to code review and ensuring code quality?',
      'Describe a time when you had to explain a technical concept to a non-technical stakeholder.',
      'Tell me about a time when you disagreed with a technical decision. How did you handle it?',
      'What is your experience with version control and collaborative development?',
      'Describe a situation where you had to refactor legacy code. What challenges did you face?',
      'Tell me about a time when you had to optimize performance in a system or application.',
      'What is your approach to testing and ensuring reliability in your code?',
      'Describe a time when you had to learn a new technology or framework for a project.'
    ];

    // Return questions with proper structure
    return genericQuestions.map((text, index) => ({
      id: uuidv4(),
      text: text,
      type: 'behavioral',
      difficulty: difficulty || 'medium',
      category: 'generic',
      rationale: 'Generic interview question',
      metadata: {
        isFallback: true,
        index: index
      }
    }));
  }

  /**
   * Generate a question based on type and difficulty
   */
  async generateQuestion({ type, difficulty, previousQuestions = [], role, context }) {
    // Check cache first
    const cacheKey = `question:${type}:${difficulty}:${role || 'default'}`;
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);

    if (cached && !context) {
      const question = JSON.parse(cached);
      return { ...question, id: uuidv4() }; // New ID for each use
    }

    // Generate question using OpenAI
    const prompt = this.buildPrompt(type, difficulty, previousQuestions, role, context);

    try {
      // Use gpt-3.5-turbo as default (more accessible than gpt-4)
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer at a top tech company. Generate realistic interview questions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const questionText = completion.choices[0].message.content;

      // Parse and structure the question
      const question = {
        id: uuidv4(),
        text: questionText,
        type: type,
        difficulty: difficulty,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      };

      // Cache for 1 hour
      await redis.setEx(cacheKey, 3600, JSON.stringify(question));

      return question;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to predefined questions
      return this.getFallbackQuestion(type, difficulty);
    }
  }

  /**
   * Build prompt for question generation
   */
  buildPrompt(type, difficulty, previousQuestions, role, context) {
    const typeDescriptions = {
      technical: 'a technical coding question (algorithms, data structures)',
      behavioral: 'a behavioral interview question using the STAR method',
      'system-design': 'a system design question about building scalable systems',
    };

    const roleDescriptions = {
      'software-engineer': 'for a Software Engineer position',
      'data-scientist': 'for a Data Scientist position (focus on ML, statistics, data analysis)',
      'product-manager': 'for a Product Manager position (focus on product strategy, prioritization, stakeholder management)',
      'designer': 'for a UX/UI Designer position (focus on design thinking, user research, portfolio)',
      'data-engineer': 'for a Data Engineer position (focus on data pipelines, ETL, infrastructure)',
      'security-engineer': 'for a Security Engineer position (focus on security protocols, threat analysis, compliance)',
      'marketing': 'for a Marketing Professional position (focus on campaign strategy, analytics, brand management)',
      'sales': 'for a Sales Professional position (focus on sales techniques, negotiation, client relations)',
      'hr': 'for an HR Professional position (focus on talent acquisition, organizational behavior, HR strategy)',
    };

    const difficultyDescriptions = {
      easy: 'suitable for junior level',
      medium: 'suitable for mid-level',
      hard: 'suitable for senior level',
    };

    let prompt = `Generate ${typeDescriptions[type]} at ${difficultyDescriptions[difficulty]} level`;
    
    if (role && roleDescriptions[role]) {
      prompt += ` ${roleDescriptions[role]}`;
    }

    // Add context if provided (e.g., from resume)
    if (context) {
      prompt += `\n\nUse this context to personalize the question:\n${context.substring(0, 1000)}`;
    }

    // Avoid repeating previous questions
    if (previousQuestions && previousQuestions.length > 0) {
      prompt += `\n\nAvoid these topics that were already asked:\n${previousQuestions.slice(-3).join('\n')}`;
    }

    prompt += `.

Requirements:
- Be specific and realistic (FAANG-level quality)
- Include context if needed
- For technical questions, specify time/space complexity expectations
- For behavioral questions, focus on specific scenarios relevant to the role
- For system design, include scale requirements (millions of users, high throughput)
- Make the question relevant to the specific role when provided
- Style should match top tech companies (Google, Amazon, Meta, Apple, Netflix, Microsoft)

Generate only the question text, no additional explanation.`;

    return prompt;
  }

  /**
   * Fallback questions if API fails - FAANG-style questions
   */
  getFallbackQuestion(type, difficulty) {
    const fallbacks = {
      technical: {
        easy: 'Given an array of integers, find the maximum sum of a contiguous subarray (Kadane\'s algorithm). What is the time and space complexity?',
        medium: 'Design a data structure that supports insert, delete, getRandom, and contains operations all in O(1) average time complexity.',
        hard: 'Given a stream of integers, design an algorithm to find the median at any point in O(log n) time. How would you handle this at scale with millions of elements?',
      },
      behavioral: {
        easy: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
        medium: 'Describe a project where you had to make a trade-off between technical perfection and business deadlines. What was your decision-making process?',
        hard: 'Tell me about a time when you had to lead a technical initiative that required convincing stakeholders with different priorities. How did you align everyone?',
      },
      'system-design': {
        easy: 'Design a distributed rate limiter that can handle 10 million requests per second across multiple data centers. What are the key challenges?',
        medium: 'Design a real-time notification system for a social media platform with 1 billion users. How do you ensure low latency and high reliability?',
        hard: 'Design a distributed search engine that can index and search through petabytes of data with sub-second query latency. How do you handle ranking, caching, and fault tolerance?',
      },
    };

    return {
      id: uuidv4(),
      text: fallbacks[type]?.[difficulty] || fallbacks.technical.medium,
      type: type,
      difficulty: difficulty,
      metadata: {
        isFallback: true,
      },
    };
  }

  /**
   * Get FAANG-style question bank
   */
  getFAANGQuestionBank(role, type, difficulty, company) {
    const questions = {
      technical: {
        easy: [
          'Implement a function to check if a binary tree is balanced.',
          'Given two sorted arrays, merge them into one sorted array in O(n) time.',
          'Find the longest common prefix among an array of strings.',
          'Implement a stack using queues.',
          'Given a string, find the first non-repeating character.',
        ],
        medium: [
          'Design a data structure for a phone directory that supports search, insert, and delete operations efficiently.',
          'Given a matrix of 0s and 1s, find the largest square submatrix of all 1s.',
          'Implement a thread-safe LRU cache with TTL (time-to-live) support.',
          'Design an algorithm to find the kth largest element in an unsorted array in O(n) average time.',
          'Given a graph, find all strongly connected components using Kosaraju\'s algorithm.',
        ],
        hard: [
          'Design a distributed system to count unique visitors in real-time across multiple data centers with 99.99% accuracy.',
          'Implement a concurrent hash map that supports lock-free operations and handles millions of operations per second.',
          'Design an algorithm to find the shortest path in a weighted graph with negative edges (Bellman-Ford optimization).',
          'Given a stream of events, design a system to detect anomalies in real-time using machine learning.',
          'Design a system to efficiently store and query time-series data for millions of metrics.',
        ],
      },
      behavioral: {
        easy: [
          'Tell me about a time when you had to learn a new technology quickly for a project.',
          'Describe a situation where you had to work under pressure to meet a deadline.',
          'Give an example of how you handled conflicting priorities from different stakeholders.',
        ],
        medium: [
          'Tell me about a time when you had to refactor a large codebase. What was your approach and what challenges did you face?',
          'Describe a situation where you had to make a technical decision that affected multiple teams. How did you ensure buy-in?',
          'Tell me about a time when you had to debug a critical production issue. Walk me through your process.',
        ],
        hard: [
          'Describe a time when you had to architect a system that needed to scale from thousands to millions of users. What were the key decisions?',
          'Tell me about a situation where you had to balance technical debt with feature velocity. How did you make the trade-off?',
          'Describe a time when you had to lead a migration of a critical system with zero downtime. What was your strategy?',
        ],
      },
      'system-design': {
        easy: [
          'Design a URL shortener like bit.ly that can handle 100 million URLs per day.',
          'Design a distributed key-value store that can handle 1 million reads/writes per second.',
          'Design a notification system for a mobile app with 10 million users.',
        ],
        medium: [
          'Design a real-time chat system like WhatsApp that supports 500 million users with end-to-end encryption.',
          'Design a distributed file storage system like Dropbox that can handle petabytes of data.',
          'Design a recommendation system for an e-commerce platform with millions of products.',
        ],
        hard: [
          'Design a distributed search engine that can index and search through petabytes of data with sub-second latency.',
          'Design a real-time analytics system that can process billions of events per day and provide insights in real-time.',
          'Design a global content delivery network (CDN) that can serve millions of requests per second with low latency.',
        ],
      },
    };

    // Filter by company if specified
    let filteredQuestions = questions[type]?.[difficulty] || [];
    
    if (company) {
      const companyQuestions = {
        google: [
          'Design a system to efficiently store and query billions of web pages for Google Search.',
          'How would you design Google Maps to handle real-time traffic updates for millions of users?',
        ],
        amazon: [
          'Design Amazon\'s product recommendation system that handles millions of products and users.',
          'How would you design Amazon\'s order fulfillment system to optimize warehouse operations?',
        ],
        meta: [
          'Design Facebook\'s news feed algorithm to rank and display relevant content for billions of users.',
          'How would you design Instagram\'s story feature to handle millions of concurrent viewers?',
        ],
        apple: [
          'Design iCloud\'s photo storage system to sync photos across millions of devices.',
          'How would you design Siri\'s voice recognition system to handle millions of requests per second?',
        ],
        netflix: [
          'Design Netflix\'s video streaming system to deliver content to millions of concurrent viewers.',
          'How would you design Netflix\'s recommendation algorithm to personalize content for each user?',
        ],
        microsoft: [
          'Design Azure\'s load balancer to distribute traffic across thousands of servers.',
          'How would you design Office 365\'s real-time collaboration feature for document editing?',
        ],
      };
      
      const companySpecific = companyQuestions[company.toLowerCase()];
      if (companySpecific && companySpecific.length > 0) {
        filteredQuestions = [...filteredQuestions, ...companySpecific];
      }
    }

    // Return random question from filtered list
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    
    return {
      id: uuidv4(),
      text: randomQuestion || questions[type]?.[difficulty]?.[0] || 'Tell me about yourself.',
      type: type,
      difficulty: difficulty,
      company: company || null,
      metadata: {
        isFromBank: true,
      },
    };
  }

  /**
   * Generate resume-based interview questions
   * Returns at least 15 unique questions
   */
  async generateResumeBasedQuestions(resumeText, jdText, role, difficulty) {
    const questions = [];
    const uniqueTexts = new Set(); // Track normalized question texts
    const targetCount = 15; // Generate at least 15 unique questions
    const maxAttempts = 25; // Allow more attempts to ensure we get 15 unique
    let attempts = 0;
    
    // Extract projects from resume
    const projects = this.extractProjects(resumeText);
    const skills = this.extractSkillsFromResume(resumeText);
    const experiences = this.extractExperiences(resumeText);
    
    // Question generation strategy: diverse mix for 15 questions
    const questionTypes = [
      { type: 'technical', category: 'project-specific', count: 5 }, // 5 project-specific technical questions
      { type: 'technical', category: 'skills-tech', count: 4 }, // 4 skills/tech questions
      { type: 'behavioral', category: 'behavioral', count: 4 }, // 4 behavioral questions
      { type: difficulty === 'hard' ? 'system-design' : 'technical', category: 'deep-dive', count: 2 } // 2 deep-dive questions
    ];
    
    // Generate questions with deduplication
    for (const qType of questionTypes) {
      let generated = 0;
      let typeAttempts = 0;
      const maxTypeAttempts = qType.count * 2; // Allow more attempts per question type
      
      while (generated < qType.count && questions.length < targetCount && attempts < maxAttempts) {
        attempts++;
        typeAttempts++;
        
        try {
          let context = '';
          let rationale = '';
          
          // Build context based on question type with variety
          if (qType.category === 'project-specific' && projects.length > 0) {
            const projectIndex = generated % projects.length;
            const project = projects[projectIndex];
            // Vary context slightly for each question
            const contextVariation = generated > 0 ? ` Focus on different aspects than previous questions.` : '';
            context = `Project: ${project}. ${jdText ? `Job requirements: ${jdText.substring(0, 500)}` : ''}${contextVariation}`;
            rationale = `Based on your project: "${project.substring(0, 100)}..."`;
          } else if (qType.category === 'skills-tech' && skills.length > 0) {
            const skillIndex = generated % Math.max(skills.length, 1);
            const skillSet = skills.slice(skillIndex, Math.min(skillIndex + 2, skills.length)).join(', ') || skills[0];
            const contextVariation = generated > 0 ? ` Ask about different technical aspects.` : '';
            context = `Your skills include: ${skillSet}. ${jdText ? `Job requires: ${jdText.substring(0, 300)}` : ''}${contextVariation}`;
            rationale = `Focusing on your ${skillSet} skills`;
          } else if (qType.category === 'behavioral' && experiences.length > 0) {
            const expIndex = generated % experiences.length;
            const exp = experiences[expIndex];
            const contextVariation = generated > 0 ? ` Focus on different behavioral scenarios.` : '';
            context = `Your experience: ${exp}. ${jdText ? `Job context: ${jdText.substring(0, 300)}` : ''}${contextVariation}`;
            rationale = `Based on your experience: "${exp.substring(0, 80)}..."`;
          } else {
            // Vary context for generic questions
            const contextVariations = [
              'Focus on technical challenges.',
              'Focus on problem-solving approaches.',
              'Focus on collaboration and teamwork.',
              'Focus on leadership and impact.',
              'Focus on innovation and creativity.'
            ];
            const variation = contextVariations[generated % contextVariations.length];
            context = `Resume summary: ${resumeText.substring(0, 500)}. ${jdText ? `Job description: ${jdText.substring(0, 500)}` : ''}. ${variation}`;
            rationale = `Based on your resume and job requirements - ${variation.toLowerCase()}`;
          }
          
          const question = await this.generateQuestion({
            type: qType.type,
            difficulty,
            role,
            context,
            previousQuestions: questions.map(q => q.text),
          });
          
          // Check for duplicates
          const normalizedText = this.normalizeQuestionText(question.text);
          
          if (!uniqueTexts.has(normalizedText) && normalizedText.length > 10) {
            uniqueTexts.add(normalizedText);
            questions.push({
              ...question,
              category: qType.category,
              rationale: rationale || `Question ${questions.length + 1}`
            });
            generated++;
          } else {
            console.log(`[QuestionService] Duplicate question detected, regenerating... (attempt ${typeAttempts}, total: ${attempts})`);
          }
        } catch (error) {
          console.error(`[QuestionService] Error generating question (attempt ${typeAttempts}):`, error);
          // Continue to next attempt
        }
      }
    }
    
    // Fill remaining slots with fallback questions if needed
    if (questions.length < targetCount) {
      console.log(`[QuestionService] Only generated ${questions.length} unique questions, filling with fallback...`);
      const fallbackQuestions = this.getGenericFallbackQuestions(role, difficulty);
      
      // Also get questions from FAANG bank for more variety
      const faangQuestions = [];
      const faangTypes = ['technical', 'behavioral', 'system-design'];
      for (let i = 0; i < 10; i++) {
        const type = faangTypes[i % faangTypes.length];
        const faangQ = this.getFAANGQuestionBank(role, type, difficulty, null);
        faangQuestions.push(faangQ);
      }
      
      // Combine fallback sources
      const allFallbacks = [...fallbackQuestions, ...faangQuestions];
      
      for (const fallback of allFallbacks) {
        if (questions.length >= targetCount) break;
        
        const normalizedText = this.normalizeQuestionText(fallback.text);
        if (!uniqueTexts.has(normalizedText)) {
          uniqueTexts.add(normalizedText);
          // Ensure fallback has proper structure
          const fallbackQuestion = {
            ...fallback,
            category: fallback.category || 'generic',
            rationale: fallback.rationale || 'Interview question'
          };
          questions.push(fallbackQuestion);
        }
      }
    }
    
    // Ensure we have at least targetCount questions
    const finalQuestions = questions.slice(0, Math.max(targetCount, questions.length));
    
    console.log(`[QuestionService] Generated ${finalQuestions.length} unique questions out of ${attempts} attempts`);
    console.log(`[QuestionService] Question breakdown:`, {
      projectSpecific: finalQuestions.filter(q => q.category === 'project-specific').length,
      skillsTech: finalQuestions.filter(q => q.category === 'skills-tech').length,
      behavioral: finalQuestions.filter(q => q.category === 'behavioral').length,
      deepDive: finalQuestions.filter(q => q.category === 'deep-dive').length,
      generic: finalQuestions.filter(q => q.category === 'generic').length
    });
    
    return {
      questions: finalQuestions,
      sessionConfig: {
        role,
        difficulty,
        totalQuestions: finalQuestions.length,
        categories: {
          projectSpecific: finalQuestions.filter(q => q.category === 'project-specific').length,
          skillsTech: finalQuestions.filter(q => q.category === 'skills-tech').length,
          behavioral: finalQuestions.filter(q => q.category === 'behavioral').length,
          deepDive: finalQuestions.filter(q => q.category === 'deep-dive').length,
          generic: finalQuestions.filter(q => q.category === 'generic').length
        }
      }
    };
  }
  
  /**
   * Extract projects from resume text
   */
  extractProjects(text) {
    const projects = [];
    
    // Look for project section
    const projectSection = text.match(/(projects?|project experience|key projects?)[\s\S]{0,2000}/i);
    if (projectSection) {
      // Extract bullet points or lines
      const bullets = projectSection[0].match(/[•\-\*]\s*(.+?)(?=[•\-\*]|$)/g) || [];
      bullets.forEach(bullet => {
        const clean = bullet.replace(/^[•\-\*]\s*/, '').trim();
        if (clean.length > 20) {
          projects.push(clean);
        }
      });
    }
    
    // Also look in experience section for project mentions
    const expSection = text.match(/(experience|work history)[\s\S]{0,3000}/i);
    if (expSection) {
      const projectMentions = expSection[0].match(/(?:built|developed|created|designed|implemented)\s+([^.!?]{20,100})/gi) || [];
      projectMentions.forEach(mention => {
        const clean = mention.replace(/^(built|developed|created|designed|implemented)\s+/i, '').trim();
        if (clean.length > 20 && !projects.some(p => p.includes(clean) || clean.includes(p))) {
          projects.push(clean);
        }
      });
    }
    
    return projects.slice(0, 5); // Top 5 projects
  }
  
  /**
   * Extract skills from resume
   */
  extractSkillsFromResume(text) {
    const skills = [];
    
    // Look for skills section
    const skillsSection = text.match(/(skills?|technical skills?|competencies)[\s\S]{0,500}/i);
    if (skillsSection) {
      // Extract comma or bullet-separated skills
      const skillText = skillsSection[0];
      const skillList = skillText.split(/[,•\-\*\|]/).map(s => s.trim()).filter(s => s.length > 2);
      skills.push(...skillList.slice(0, 10));
    }
    
    // Also extract common tech terms
    const techTerms = text.match(/\b(java|python|javascript|react|node|sql|aws|docker|kubernetes|git|typescript|angular|vue|mongodb|postgresql|redis|terraform|ansible)\b/gi) || [];
    techTerms.forEach(term => {
      if (!skills.some(s => s.toLowerCase().includes(term.toLowerCase()))) {
        skills.push(term);
      }
    });
    
    return skills.slice(0, 15);
  }
  
  /**
   * Extract experiences from resume
   */
  extractExperiences(text) {
    const experiences = [];
    
    // Look for experience section
    const expSection = text.match(/(experience|work history|employment)[\s\S]{0,2000}/i);
    if (expSection) {
      // Extract job entries (lines with dates or company names)
      const lines = expSection[0].split('\n').filter(line => line.trim().length > 10);
      lines.forEach(line => {
        if (/\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line)) {
          experiences.push(line.trim());
        }
      });
    }
    
    return experiences.slice(0, 5);
  }
}

export const questionService = new QuestionService();

