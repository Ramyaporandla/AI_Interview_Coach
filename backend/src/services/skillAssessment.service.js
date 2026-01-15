import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { evaluationService } from './evaluation.service.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Skill Assessment Service
 * Generates interactive skill assessments for all roles
 */
class SkillAssessmentService {
  /**
   * Role-specific skill domains
   */
  getRoleSkillDomains(role) {
    const roleDomains = {
      'software-engineer': [
        'Algorithms & Data Structures',
        'System Design',
        'Coding & Problem Solving',
        'Software Architecture',
        'Testing & Debugging',
        'Version Control & Collaboration'
      ],
      'data-scientist': [
        'Machine Learning',
        'Statistics & Probability',
        'Data Analysis',
        'Data Visualization',
        'Python/R Programming',
        'Model Evaluation'
      ],
      'product-manager': [
        'Product Strategy',
        'Prioritization',
        'Stakeholder Management',
        'User Research',
        'Roadmap Planning',
        'Metrics & Analytics'
      ],
      'designer': [
        'Design Thinking',
        'User Research',
        'UI/UX Design',
        'Prototyping',
        'Design Systems',
        'User Testing'
      ],
      'data-engineer': [
        'Data Pipelines',
        'ETL Processes',
        'Database Design',
        'Big Data Technologies',
        'Data Warehousing',
        'Data Quality'
      ],
      'security-engineer': [
        'Security Protocols',
        'Threat Analysis',
        'Penetration Testing',
        'Cryptography',
        'Compliance & Governance',
        'Incident Response'
      ],
      'marketing': [
        'Campaign Strategy',
        'Digital Marketing',
        'Analytics & Metrics',
        'Brand Management',
        'Content Marketing',
        'SEO/SEM'
      ],
      'sales': [
        'Sales Techniques',
        'Negotiation',
        'Client Relations',
        'CRM Management',
        'Lead Generation',
        'Closing Strategies'
      ],
      'hr': [
        'Talent Acquisition',
        'Organizational Behavior',
        'HR Strategy',
        'Employee Relations',
        'Compensation & Benefits',
        'Performance Management'
      ]
    };

    return roleDomains[role] || [
      'Technical Skills',
      'Problem Solving',
      'Communication',
      'Collaboration',
      'Leadership',
      'Adaptability'
    ];
  }

  /**
   * Get available FAANG companies
   */
  getFAANGCompanies() {
    return [
      { id: 'google', name: 'Google', description: 'Search, Cloud, AI/ML' },
      { id: 'amazon', name: 'Amazon', description: 'E-commerce, AWS, Alexa' },
      { id: 'meta', name: 'Meta (Facebook)', description: 'Social Media, VR/AR' },
      { id: 'apple', name: 'Apple', description: 'iOS, Hardware, Services' },
      { id: 'netflix', name: 'Netflix', description: 'Streaming, Recommendations' },
      { id: 'microsoft', name: 'Microsoft', description: 'Azure, Office, Windows' }
    ];
  }

  /**
   * Get FAANG company-specific question bank
   */
  getFAANGQuestionBank(company, role, difficulty) {
    const faangQuestions = {
      google: {
        'software-engineer': {
          easy: [
            'Given two sorted arrays, merge them into one sorted array in O(n) time.',
            'Implement a function to check if a binary tree is balanced.',
            'Find the longest common prefix among an array of strings.',
            'Explain how Google Search indexes billions of web pages.',
            'What data structures would you use to implement Google Maps routing?'
          ],
          medium: [
            'Design a system to efficiently store and query billions of web pages for Google Search.',
            'How would you design Google Maps to handle real-time traffic updates for millions of users?',
            'Implement a thread-safe LRU cache similar to what Google uses for caching search results.',
            'Design an algorithm to rank search results based on relevance and popularity.',
            'How would you optimize Google Drive\'s file synchronization across millions of devices?'
          ],
          hard: [
            'Design Google\'s distributed search index that can handle petabytes of data with sub-second query latency.',
            'How would you design Google\'s autocomplete feature to handle millions of queries per second?',
            'Design a system to detect and prevent spam in Gmail at Google scale.',
            'How would you implement Google\'s PageRank algorithm at scale?',
            'Design Google Cloud\'s load balancer to distribute traffic across global data centers.'
          ]
        },
        'data-scientist': {
          easy: [
            'How does Google use machine learning in search ranking?',
            'Explain how Google Ads determines ad relevance.',
            'What metrics would you use to measure search quality?'
          ],
          medium: [
            'Design a recommendation system for YouTube that handles billions of videos.',
            'How would you detect clickbait content using ML?',
            'Design an A/B testing framework for Google Search features.'
          ],
          hard: [
            'How would you build a real-time ML system for Google Ads bidding?',
            'Design a system to detect deepfakes in YouTube videos at scale.',
            'How would you optimize Google\'s translation model for low-resource languages?'
          ]
        }
      },
      amazon: {
        'software-engineer': {
          easy: [
            'How would you design Amazon\'s shopping cart system?',
            'Implement a function to find the top K most frequently purchased items.',
            'Explain how Amazon handles inventory management.',
            'What data structures would you use for Amazon\'s product catalog?'
          ],
          medium: [
            'Design Amazon\'s product recommendation system that handles millions of products and users.',
            'How would you design Amazon\'s order fulfillment system to optimize warehouse operations?',
            'Design a system to handle Amazon Prime Day traffic spikes.',
            'How would you implement Amazon\'s "Customers who bought this also bought" feature?',
            'Design Amazon\'s payment processing system for millions of transactions per day.'
          ],
          hard: [
            'Design Amazon\'s distributed order processing system with guaranteed delivery times.',
            'How would you design AWS S3 to handle exabytes of data with 99.999999999% durability?',
            'Design Amazon\'s real-time inventory tracking system across thousands of warehouses.',
            'How would you implement Amazon\'s dynamic pricing algorithm?',
            'Design AWS Lambda\'s serverless compute platform to handle millions of concurrent executions.'
          ]
        },
        'data-engineer': {
          easy: [
            'How does Amazon process order data in real-time?',
            'What data pipeline would you design for Amazon\'s analytics?'
          ],
          medium: [
            'Design Amazon\'s data warehouse for analyzing billions of transactions.',
            'How would you build a real-time analytics system for Amazon\'s operations?'
          ],
          hard: [
            'Design Amazon\'s data lake architecture for storing petabytes of customer data.',
            'How would you implement Amazon\'s real-time recommendation data pipeline?'
          ]
        }
      },
      meta: {
        'software-engineer': {
          easy: [
            'How would you design Facebook\'s news feed?',
            'Implement a function to find mutual friends between two users.',
            'What data structures would you use for Facebook\'s social graph?'
          ],
          medium: [
            'Design Facebook\'s news feed algorithm to rank and display relevant content for billions of users.',
            'How would you design Instagram\'s story feature to handle millions of concurrent viewers?',
            'Design a system to handle viral content on Facebook without crashing.',
            'How would you implement Facebook\'s friend suggestion algorithm?',
            'Design WhatsApp\'s end-to-end encryption system for billions of messages.'
          ],
          hard: [
            'Design Facebook\'s distributed social graph database to handle trillions of connections.',
            'How would you design Instagram\'s photo storage system for billions of images?',
            'Design Meta\'s VR platform to handle real-time multiplayer interactions.',
            'How would you implement Facebook\'s real-time notification system for billions of users?',
            'Design Meta\'s content moderation system using AI at scale.'
          ]
        },
        'data-scientist': {
          easy: [
            'How does Facebook determine what content to show in news feed?',
            'What metrics would you use to measure engagement on Instagram?'
          ],
          medium: [
            'Design a recommendation system for Facebook Groups.',
            'How would you detect fake accounts using ML?'
          ],
          hard: [
            'Design Meta\'s ad targeting system using ML for billions of users.',
            'How would you build a content moderation ML system for Facebook?'
          ]
        }
      },
      apple: {
        'software-engineer': {
          easy: [
            'How would you design iCloud\'s photo sync system?',
            'What architecture would you use for Apple Music streaming?',
            'Explain how Siri processes voice commands.'
          ],
          medium: [
            'Design iCloud\'s photo storage system to sync photos across millions of devices.',
            'How would you design Siri\'s voice recognition system to handle millions of requests per second?',
            'Design Apple Pay\'s secure payment processing system.',
            'How would you implement Apple Music\'s recommendation algorithm?',
            'Design iOS\'s app store search and ranking system.'
          ],
          hard: [
            'Design Apple\'s distributed iCloud infrastructure for billions of devices.',
            'How would you design Apple\'s Face ID system for secure authentication?',
            'Design Apple\'s App Store review system to handle millions of app submissions.',
            'How would you implement Apple\'s Core ML framework for on-device AI?',
            'Design Apple\'s AirDrop system for peer-to-peer file sharing.'
          ]
        }
      },
      netflix: {
        'software-engineer': {
          easy: [
            'How would you design Netflix\'s video streaming system?',
            'What architecture would you use for Netflix\'s recommendation system?',
            'Explain how Netflix handles video encoding.'
          ],
          medium: [
            'Design Netflix\'s video streaming system to deliver content to millions of concurrent viewers.',
            'How would you design Netflix\'s recommendation algorithm to personalize content for each user?',
            'Design a system to handle Netflix\'s global content delivery.',
            'How would you implement Netflix\'s A/B testing framework for UI changes?',
            'Design Netflix\'s content encoding pipeline for multiple quality levels.'
          ],
          hard: [
            'Design Netflix\'s distributed video streaming infrastructure for global scale.',
            'How would you design Netflix\'s recommendation system using deep learning?',
            'Design Netflix\'s content delivery network (CDN) to minimize buffering.',
            'How would you implement Netflix\'s real-time analytics for viewing patterns?',
            'Design Netflix\'s system to handle simultaneous releases for millions of users.'
          ]
        },
        'data-scientist': {
          easy: [
            'How does Netflix determine what to recommend?',
            'What features would you use for Netflix\'s recommendation model?'
          ],
          medium: [
            'Design Netflix\'s recommendation system using collaborative filtering.',
            'How would you measure the success of Netflix\'s recommendations?'
          ],
          hard: [
            'Design Netflix\'s deep learning recommendation system at scale.',
            'How would you build a real-time recommendation system for Netflix?'
          ]
        }
      },
      microsoft: {
        'software-engineer': {
          easy: [
            'How would you design Office 365\'s document collaboration?',
            'What architecture would you use for Azure\'s cloud services?',
            'Explain how Microsoft Teams handles video calls.'
          ],
          medium: [
            'Design Azure\'s load balancer to distribute traffic across thousands of servers.',
            'How would you design Office 365\'s real-time collaboration feature for document editing?',
            'Design Microsoft Teams\' video conferencing system for millions of users.',
            'How would you implement Azure\'s auto-scaling for cloud resources?',
            'Design Xbox Live\'s multiplayer gaming infrastructure.'
          ],
          hard: [
            'Design Azure\'s global cloud infrastructure for enterprise scale.',
            'How would you design Microsoft\'s distributed database system (Cosmos DB)?',
            'Design Office 365\'s real-time collaboration system with conflict resolution.',
            'How would you implement Azure\'s serverless computing platform?',
            'Design Microsoft\'s AI platform (Azure Cognitive Services) at scale.'
          ]
        }
      }
    };

    const companyQuestions = faangQuestions[company]?.[role];
    if (!companyQuestions) {
      return null;
    }

    const difficultyQuestions = companyQuestions[difficulty] || companyQuestions.medium || [];
    if (difficultyQuestions.length === 0) {
      return null;
    }

    return difficultyQuestions[Math.floor(Math.random() * difficultyQuestions.length)];
  }

  /**
   * Generate skill assessment questions for a role
   * Optimized for speed: prioritizes FAANG questions, parallelizes AI generation
   */
  async generateAssessmentQuestions(role, difficulty = 'medium', questionCount = 10, company = null) {
    const skillDomains = this.getRoleSkillDomains(role);
    const questionsPerDomain = Math.ceil(questionCount / skillDomains.length);
    const questions = [];

    // If company is specified, try to use FAANG questions (instant, no API calls)
    const useFAANG = company && ['google', 'amazon', 'meta', 'apple', 'netflix', 'microsoft'].includes(company.toLowerCase());

    // Step 1: Collect FAANG questions first (instant, no API calls)
    if (useFAANG) {
      for (const domain of skillDomains) {
        const domainQuestions = Math.min(questionsPerDomain, questionCount - questions.length);
        
        for (let i = 0; i < domainQuestions && questions.length < questionCount; i++) {
          const faangQuestion = this.getFAANGQuestionBank(company.toLowerCase(), role, difficulty);
          if (faangQuestion && !this.isDuplicate(faangQuestion, questions)) {
            questions.push({
              id: uuidv4(),
              text: faangQuestion,
              domain,
              difficulty,
              role,
              company: company.toLowerCase(),
              type: this.getQuestionType(domain, role),
              skill: domain
            });
          }
        }
      }
    }

    // Step 2: Generate remaining questions in parallel batches
    const remainingCount = questionCount - questions.length;
    if (remainingCount > 0) {
      // Determine which domains need questions
      const domainNeeds = [];
      const domainCounts = {};
      
      // Count questions per domain
      questions.forEach(q => {
        domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
      });

      // Determine how many questions each domain still needs
      skillDomains.forEach(domain => {
        const currentCount = domainCounts[domain] || 0;
        const needed = Math.max(0, questionsPerDomain - currentCount);
        for (let i = 0; i < needed && domainNeeds.length < remainingCount; i++) {
          domainNeeds.push(domain);
        }
      });

      // Fill remaining slots with domains
      while (domainNeeds.length < remainingCount) {
        const domain = skillDomains[domainNeeds.length % skillDomains.length];
        domainNeeds.push(domain);
      }

      // Generate questions in parallel batches (3 at a time to avoid rate limits)
      const batchSize = 3;
      const domainsToProcess = domainNeeds.slice(0, remainingCount);
      
      // Process domains in batches
      for (let i = 0; i < domainsToProcess.length; i += batchSize) {
        const batch = domainsToProcess.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (domain, batchIndex) => {
          try {
            const globalIndex = i + batchIndex;
            // Use fallback question for speed (no API call) if we have enough questions
            // Only generate AI questions for first few to ensure quality
            if (globalIndex < Math.min(5, remainingCount)) {
              // Try AI generation with timeout
              const generatePromise = this.generateDomainQuestion(role, domain, difficulty, questions, company);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Question generation timeout')), 5000)
              );
              
              try {
                const question = await Promise.race([generatePromise, timeoutPromise]);
                if (question && !this.isDuplicate(question.text, questions)) {
                  return {
                    ...question,
                    domain,
                    skill: domain
                  };
                }
              } catch (error) {
                console.log(`AI generation failed or timed out for ${domain}, using fallback`);
              }
            }
            
            // Use fallback question (instant, no API call)
            return this.getFallbackQuestion(role, domain, difficulty);
          } catch (error) {
            console.error(`Error generating question for domain ${domain}:`, error);
            return this.getFallbackQuestion(role, domain, difficulty);
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validQuestions = batchResults.filter(q => q && !this.isDuplicate(q.text, questions));
        questions.push(...validQuestions);
        
        // Stop if we have enough questions
        if (questions.length >= questionCount) break;
      }
    }

    // Step 3: Fill any remaining slots with fallback questions (instant)
    while (questions.length < questionCount) {
      const domain = skillDomains[questions.length % skillDomains.length];
      const fallbackQuestion = this.getFallbackQuestion(role, domain, difficulty);
      if (!this.isDuplicate(fallbackQuestion.text, questions)) {
        questions.push(fallbackQuestion);
      }
    }

    return questions.slice(0, questionCount);
  }

  /**
   * Generate a question for a specific domain
   */
  async generateDomainQuestion(role, domain, difficulty, existingQuestions = [], company = null) {
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    const companyContext = company ? `\nCompany: ${company.charAt(0).toUpperCase() + company.slice(1)} (FAANG company)` : '';
    const companyStyle = company ? `\nStyle: Use ${company}-style interview questions focusing on scale, distributed systems, and real-world product challenges.` : '';
    
    const prompt = `You are an expert interviewer creating skill assessment questions.

Role: ${role}
Skill Domain: ${domain}
Difficulty: ${difficulty}${companyContext}${companyStyle}

Generate a single, clear, and specific skill assessment question that:
1. Tests practical knowledge in ${domain} for a ${role} role
2. Is appropriate for ${difficulty} difficulty level
3. Can be answered in 2-3 minutes
4. Is unique and different from these existing questions: ${existingQuestions.map(q => q.text).join('; ').substring(0, 500)}
${company ? '5. Reflects the interview style and technical challenges of ' + company : ''}

Return ONLY the question text, nothing else.`;

    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer. Generate clear, concise skill assessment questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const questionText = completion.choices[0].message.content.trim();
      
      return {
        id: uuidv4(),
        text: questionText,
        domain,
        difficulty,
        role,
        type: this.getQuestionType(domain, role)
      };
    } catch (error) {
      console.error('Error generating domain question:', error);
      return this.getFallbackQuestion(role, domain, difficulty);
    }
  }

  /**
   * Get question type based on domain and role
   */
  getQuestionType(domain, role) {
    const technicalRoles = ['software-engineer', 'data-engineer', 'security-engineer', 'data-scientist'];
    const behavioralRoles = ['product-manager', 'designer', 'marketing', 'sales', 'hr'];
    
    if (technicalRoles.includes(role)) {
      if (domain.toLowerCase().includes('system') || domain.toLowerCase().includes('architecture')) {
        return 'system-design';
      }
      return 'technical';
    }
    
    return 'behavioral';
  }

  /**
   * Check if question is duplicate
   */
  isDuplicate(questionText, existingQuestions) {
    const normalized = questionText.toLowerCase().trim();
    return existingQuestions.some(q => 
      q.text.toLowerCase().trim() === normalized
    );
  }

  /**
   * Get fallback question for a domain
   */
  getFallbackQuestion(role, domain, difficulty) {
    const fallbacks = {
      'software-engineer': {
        'Algorithms & Data Structures': {
          easy: 'Explain the difference between an array and a linked list. When would you use each?',
          medium: 'Design an algorithm to find the longest increasing subsequence in an array.',
          hard: 'Implement a thread-safe data structure that supports concurrent insertions and deletions efficiently.'
        },
        'System Design': {
          easy: 'How would you design a simple URL shortener?',
          medium: 'Design a distributed cache system that can handle millions of requests.',
          hard: 'Design a real-time analytics system processing billions of events per day.'
        }
      },
      'data-scientist': {
        'Machine Learning': {
          easy: 'Explain the difference between supervised and unsupervised learning.',
          medium: 'How would you handle overfitting in a machine learning model?',
          hard: 'Design a recommendation system that can scale to millions of users.'
        },
        'Statistics & Probability': {
          easy: 'Explain the difference between mean, median, and mode.',
          medium: 'How would you test if a sample is statistically significant?',
          hard: 'Design an A/B testing framework for a product feature.'
        }
      },
      'product-manager': {
        'Product Strategy': {
          easy: 'How do you prioritize features for a product roadmap?',
          medium: 'Describe your approach to defining product success metrics.',
          hard: 'How would you pivot a product strategy based on market feedback?'
        },
        'Stakeholder Management': {
          easy: 'How do you handle conflicting priorities from different stakeholders?',
          medium: 'Describe a time when you had to say no to a feature request.',
          hard: 'How would you align engineering, design, and business teams on a product vision?'
        }
      }
    };

    const roleFallbacks = fallbacks[role] || {};
    const domainFallbacks = roleFallbacks[domain] || {};
    const question = domainFallbacks[difficulty] || 
      `Tell me about your experience with ${domain} in the context of ${role}.`;

    return {
      id: uuidv4(),
      text: question,
      domain,
      difficulty,
      role,
      type: this.getQuestionType(domain, role)
    };
  }

  /**
   * Validate answer before evaluation
   */
  validateAnswer(answer, question) {
    if (!answer || typeof answer !== 'string') {
      return { isValid: false, reason: 'Answer is empty or invalid', score: 0 };
    }
    
    const answerText = answer.trim();
    const answerLower = answerText.toLowerCase();
    
    // Check for empty or very short answers
    if (answerText.length < 10) {
      return { isValid: false, reason: 'Answer is too short', score: 0 };
    }
    
    // Check for common random text patterns - STRICT detection
    const randomPatterns = [
      /^(asdf|qwerty|test|random|hello|hi|yes|no|ok|okay|lorem|ipsum|dummy|sample|example)[\s\.,!]*$/i,
      /^[a-z]\s+[a-z]\s+[a-z]\s+[a-z]/i, // Single letters separated
      /^[0-9\s]+$/, // Only numbers
      /^(.)\1{8,}$/, // Repeated characters (8+ times)
      /^[^a-z0-9\s]{8,}$/i, // Only special characters
      /^(.)\1{3,}\s+(.)\2{3,}/i, // Multiple repeated patterns
    ];
    
    for (const pattern of randomPatterns) {
      if (pattern.test(answerText)) {
        return { isValid: false, reason: 'Answer appears to be random text', score: 0 };
      }
    }
    
    // Check for gibberish (repeated short patterns)
    if (/(.)\1{4,}/.test(answerLower)) {
      return { isValid: false, reason: 'Answer contains random character patterns', score: 0 };
    }
    
    // Check for keyboard mashing / gibberish (random character sequences like "uhdjwef;ofjker")
    const words = answerLower.split(/[\s\.,;:!?]+/).filter(w => w.length > 0);
    if (words.length > 0) {
      // Common English words (most frequent 100 words) - if answer has none of these, likely gibberish
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
        // Remove punctuation for checking
        const cleanWord = word.replace(/[^a-z]/gi, '');
        if (cleanWord.length === 0) continue;
        
        // Check if it's a common English word
        if (commonWords.has(cleanWord)) {
          realWordCount++;
          continue;
        }
        
        // Check for gibberish patterns
        if (cleanWord.length >= 4) {
          const vowelCount = (cleanWord.match(vowels) || []).length;
          const consonantClusters = cleanWord.match(/[bcdfghjklmnpqrstvwxyz]{3,}/gi);
          
          // Very few or no vowels in longer words = likely gibberish
          if (cleanWord.length > 5 && vowelCount === 0) {
            gibberishWordCount++;
          }
          // Unusual consonant clusters (3+ consonants) = likely gibberish
          else if (consonantClusters && consonantClusters.length > 0 && cleanWord.length > 4) {
            gibberishWordCount++;
          }
          // Very unusual patterns that don't match English word structure
          else if (cleanWord.length > 6 && /^[bcdfghjklmnpqrstvwxyz]{3,}[aeiou][bcdfghjklmnpqrstvwxyz]{3,}$/i.test(cleanWord)) {
            gibberishWordCount++;
          }
        }
      }
      
      // If answer has no real words and has gibberish words, it's random text
      if (realWordCount === 0 && gibberishWordCount > 0) {
        return { isValid: false, reason: 'Answer appears to be random text or gibberish', score: 0 };
      }
      
      // If more than 60% of words are gibberish, treat as random text
      const totalWords = realWordCount + gibberishWordCount;
      if (totalWords > 0 && gibberishWordCount / totalWords > 0.6) {
        return { isValid: false, reason: 'Answer appears to be random text or gibberish', score: 0 };
      }
      
      // If answer is short and contains mostly gibberish words, reject it
      if (answerText.length < 50 && gibberishWordCount >= 2 && realWordCount === 0) {
        return { isValid: false, reason: 'Answer appears to be random text or gibberish', score: 0 };
      }
    }
    
    // Check for relevance - extract key terms from question
    const questionText = (typeof question === 'string' ? question : question?.text || '').toLowerCase();
    const questionKeywords = questionText
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 8);
    
    // If answer is short and has no relevant keywords, it's likely random
    if (answerText.length < 50 && questionKeywords.length > 0) {
      const relevantKeywords = questionKeywords.filter(keyword => 
        answerLower.includes(keyword)
      );
      
      if (relevantKeywords.length === 0) {
        return { isValid: false, reason: 'Answer does not address the question', score: 0 };
      }
    }
    
    // Check for nonsensical word combinations (very short average word length)
    const wordsForLength = answerLower.split(/\s+/).filter(w => w.length > 0);
    if (wordsForLength.length > 3) {
      const avgWordLength = wordsForLength.reduce((sum, w) => sum + w.length, 0) / wordsForLength.length;
      // If average word length is very short, might be random
      if (avgWordLength < 2.5) {
        return { isValid: false, reason: 'Answer appears nonsensical', score: 0 };
      }
    }
    
    // Check for very common random phrases
    const commonRandomPhrases = [
      'asdf', 'qwerty', 'test test', 'random random', 'hello hello',
      'lorem ipsum', 'dummy text', 'sample answer', 'just testing'
    ];
    
    const answerLowerNoSpaces = answerLower.replace(/\s+/g, ' ');
    for (const phrase of commonRandomPhrases) {
      if (answerLowerNoSpaces.includes(phrase)) {
        // Check if it's a significant portion of the answer
        if (answerLowerNoSpaces.length < 100 || answerLowerNoSpaces.split(phrase).length > 2) {
          return { isValid: false, reason: 'Answer contains random text patterns', score: 0 };
        }
      }
    }
    
    return { isValid: true };
  }

  /**
   * Evaluate an answer for skill assessment
   */
  async evaluateAnswer(question, answer, role) {
    try {
      // Pre-validate answer
      const validation = this.validateAnswer(answer, question.text);
      if (!validation.isValid) {
        return {
          score: validation.score || 0,
          clarityScore: 0,
          structureScore: 0,
          relevanceScore: 0,
          feedback: `This answer appears to be ${validation.reason.toLowerCase()}. Please provide a relevant, detailed response that addresses the question: "${question.text}"`,
          strengths: [],
          improvements: [
            'Provide a detailed answer that directly addresses the question',
            'Include specific examples and technical details',
            'Ensure your answer is relevant to the topic'
          ],
          domain: question.domain,
          skill: question.domain,
          isInvalid: true
        };
      }
      
      const evaluation = await evaluationService.evaluateAnswer({
        sessionId: `skill_assessment_${Date.now()}`,
        questionId: question.id,
        answerId: `answer_${Date.now()}`,
        answer,
        question: question.text,
        coachMode: 'friendly'
      });

      // Ensure scores are reasonable - if relevance is very low, cap the overall score
      let finalScore = evaluation.score || 0;
      const relevanceScore = evaluation.relevanceScore || evaluation.relevance_score || 0;
      
      // If relevance is very low (0-2), cap overall score at 3
      if (relevanceScore <= 2 && finalScore > 3) {
        finalScore = 3;
      }
      
      // If relevance is low (3-4), cap overall score at 5
      if (relevanceScore <= 4 && relevanceScore > 2 && finalScore > 5) {
        finalScore = Math.min(finalScore, 5);
      }

      return {
        score: finalScore,
        clarityScore: evaluation.clarityScore || evaluation.clarity_score || 0,
        structureScore: evaluation.structureScore || evaluation.structure_score || 0,
        relevanceScore: relevanceScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        domain: question.domain,
        skill: question.domain
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Return strict evaluation for errors
      return {
        score: 0,
        clarityScore: 0,
        structureScore: 0,
        relevanceScore: 0,
        feedback: 'Unable to evaluate answer. Please ensure your answer is relevant and addresses the question.',
        strengths: [],
        improvements: [
          'Provide a detailed answer that directly addresses the question',
          'Include specific examples and explanations',
          'Ensure your answer is relevant to the topic'
        ],
        domain: question.domain,
        skill: question.domain
      };
    }
  }

  /**
   * Calculate overall skill scores by domain
   */
  calculateSkillScores(assessments) {
    const domainScores = {};
    
    assessments.forEach(assessment => {
      const domain = assessment.domain || assessment.skill || 'General';
      if (!domainScores[domain]) {
        domainScores[domain] = {
          totalScore: 0,
          count: 0,
          maxScore: 0,
          minScore: 10
        };
      }
      
      domainScores[domain].totalScore += assessment.score || 0;
      domainScores[domain].count += 1;
      domainScores[domain].maxScore = Math.max(domainScores[domain].maxScore, assessment.score || 0);
      domainScores[domain].minScore = Math.min(domainScores[domain].minScore, assessment.score || 0);
    });

    const result = Object.entries(domainScores).map(([domain, data]) => ({
      skill: domain,
      value: Math.round((data.totalScore / data.count) * 10), // Convert to 0-100 scale
      averageScore: data.totalScore / data.count,
      maxScore: data.maxScore,
      minScore: data.minScore,
      count: data.count
    }));

    return result;
  }

  /**
   * Generate assessment summary
   */
  generateSummary(role, skillScores, totalQuestions, answeredQuestions) {
    const averageScore = skillScores.reduce((sum, s) => sum + s.value, 0) / skillScores.length;
    const topSkill = skillScores.reduce((max, s) => s.value > max.value ? s : max, skillScores[0]);
    const improvementArea = skillScores.reduce((min, s) => s.value < min.value ? s : min, skillScores[0]);

    return {
      role,
      overallScore: Math.round(averageScore),
      completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
      topSkill: {
        name: topSkill.skill,
        score: topSkill.value
      },
      improvementArea: {
        name: improvementArea.skill,
        score: improvementArea.value
      },
      skillBreakdown: skillScores,
      recommendations: this.generateRecommendations(role, skillScores, improvementArea)
    };
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(role, skillScores, improvementArea) {
    const recommendations = [];
    
    if (improvementArea.value < 60) {
      recommendations.push({
        priority: 'high',
        skill: improvementArea.skill,
        action: `Focus on improving your ${improvementArea.skill} skills. Consider taking courses or practicing more in this area.`
      });
    }

    const averageScore = skillScores.reduce((sum, s) => sum + s.value, 0) / skillScores.length;
    if (averageScore < 70) {
      recommendations.push({
        priority: 'medium',
        skill: 'Overall',
        action: 'Continue practicing across all skill domains. Regular practice will help improve your overall performance.'
      });
    }

    recommendations.push({
      priority: 'low',
      skill: 'Practice',
      action: 'Take more assessments to track your progress over time and identify areas of improvement.'
    });

    return recommendations;
  }
}

export default new SkillAssessmentService();

