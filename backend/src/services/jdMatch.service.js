/**
 * Job Description Match Service
 * Analyzes resume against job description and provides matching feedback
 */
class JDMatchService {
  /**
   * Match resume against job description
   */
  async matchResume(resumeText, jdText) {
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();
    
    // Extract keywords from JD
    const jdKeywords = this.extractKeywords(jdText);
    const resumeKeywords = this.extractKeywords(resumeText);
    
    // Find matched and missing keywords
    const matchedKeywords = [];
    const missingKeywords = [];
    
    jdKeywords.forEach(keyword => {
      if (resumeLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });
    
    // Calculate match score
    const matchScore = this.calculateMatchScore(
      jdKeywords.length,
      matchedKeywords.length,
      resumeText,
      jdText
    );
    
    // Generate recommendations
    const recommendedEdits = this.generateRecommendations(
      missingKeywords,
      jdText,
      resumeText
    );
    
    // Generate tailored summary
    const tailoredSummary = this.generateTailoredSummary(
      resumeText,
      jdText,
      matchedKeywords
    );
    
    return {
      matchScore: Math.max(0, Math.min(100, matchScore)),
      missingKeywords: missingKeywords.slice(0, 20), // Top 20 missing
      matchedKeywords: matchedKeywords.slice(0, 20), // Top 20 matched
      recommendedEdits,
      tailoredSummary,
      keywordStats: {
        totalJDKeywords: jdKeywords.length,
        matchedCount: matchedKeywords.length,
        missingCount: missingKeywords.length,
        matchPercentage: jdKeywords.length > 0 
          ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
          : 0
      }
    };
  }
  
  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why',
      'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through',
      'during', 'including', 'against', 'among', 'throughout', 'despite'
    ]);
    
    // Extract words (alphanumeric + hyphens, min 3 chars)
    const words = text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopWords.has(word));
    
    // Count frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Extract technical terms (capitalized words, acronyms)
    const techTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const acronyms = text.match(/\b[A-Z]{2,}\b/g) || [];
    
    // Combine and deduplicate
    const keywords = new Set();
    
    // Add high-frequency words (appears 2+ times)
    Object.entries(wordFreq)
      .filter(([word, freq]) => freq >= 2)
      .forEach(([word]) => keywords.add(word));
    
    // Add technical terms
    techTerms.forEach(term => keywords.add(term.toLowerCase()));
    
    // Add acronyms
    acronyms.forEach(acronym => keywords.add(acronym.toLowerCase()));
    
    // Extract skills/technologies (common patterns)
    const skillPatterns = [
      /\b(java|python|javascript|typescript|react|node|sql|aws|docker|kubernetes|git|agile|scrum)\b/gi,
      /\b(machine learning|data science|cloud computing|web development|software engineering)\b/gi,
      /\b(api|rest|graphql|microservices|ci\/cd|devops)\b/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => keywords.add(match.toLowerCase()));
    });
    
    return Array.from(keywords).slice(0, 50); // Top 50 keywords
  }
  
  /**
   * Calculate match score
   */
  calculateMatchScore(totalJDKeywords, matchedCount, resumeText, jdText) {
    if (totalJDKeywords === 0) {
      return 50; // Neutral score if no keywords extracted
    }
    
    // Base score from keyword matching (60% weight)
    const keywordMatchRatio = matchedCount / totalJDKeywords;
    let score = keywordMatchRatio * 60;
    
    // Bonus for skill overlap (20% weight)
    const skillOverlap = this.calculateSkillOverlap(resumeText, jdText);
    score += skillOverlap * 20;
    
    // Bonus for experience alignment (20% weight)
    const experienceAlignment = this.calculateExperienceAlignment(resumeText, jdText);
    score += experienceAlignment * 20;
    
    return Math.round(score);
  }
  
  /**
   * Calculate skill overlap
   */
  calculateSkillOverlap(resumeText, jdText) {
    const resumeSkills = this.extractSkills(resumeText);
    const jdSkills = this.extractSkills(jdText);
    
    if (jdSkills.length === 0) return 0.5;
    
    const matched = resumeSkills.filter(skill => 
      jdSkills.some(jdSkill => 
        skill.toLowerCase().includes(jdSkill.toLowerCase()) ||
        jdSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return matched.length / jdSkills.length;
  }
  
  /**
   * Extract skills from text
   */
  extractSkills(text) {
    const commonSkills = [
      'java', 'python', 'javascript', 'typescript', 'react', 'angular', 'vue',
      'node', 'express', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins',
      'agile', 'scrum', 'machine learning', 'data science', 'ai', 'nlp',
      'rest', 'graphql', 'microservices', 'ci/cd', 'devops', 'terraform',
      'ansible', 'linux', 'unix', 'html', 'css', 'sass', 'less'
    ];
    
    const found = [];
    const textLower = text.toLowerCase();
    
    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        found.push(skill);
      }
    });
    
    return found;
  }
  
  /**
   * Calculate experience alignment
   */
  calculateExperienceAlignment(resumeText, jdText) {
    // Extract years of experience from JD
    const jdYearsMatch = jdText.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
    const jdYears = jdYearsMatch ? parseInt(jdYearsMatch[1]) : null;
    
    if (!jdYears) return 0.5; // Can't determine, neutral score
    
    // Extract years from resume
    const resumeYearsMatch = resumeText.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
    const resumeYears = resumeYearsMatch ? parseInt(resumeYearsMatch[1]) : null;
    
    if (!resumeYears) return 0.3; // No experience mentioned
    
    // Score based on how close resume years are to JD requirement
    const diff = Math.abs(resumeYears - jdYears);
    if (diff === 0) return 1.0;
    if (diff <= 1) return 0.8;
    if (diff <= 2) return 0.6;
    if (diff <= 3) return 0.4;
    return 0.2;
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations(missingKeywords, jdText, resumeText) {
    const recommendations = [];
    
    // Top missing keywords
    const topMissing = missingKeywords.slice(0, 5);
    if (topMissing.length > 0) {
      recommendations.push(
        `Add these keywords from the job description: ${topMissing.join(', ')}`
      );
    }
    
    // Skills to add
    const jdSkills = this.extractSkills(jdText);
    const resumeSkills = this.extractSkills(resumeText);
    const missingSkills = jdSkills.filter(skill => 
      !resumeSkills.some(rs => 
        rs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(rs.toLowerCase())
      )
    );
    
    if (missingSkills.length > 0) {
      recommendations.push(
        `Consider adding these technical skills: ${missingSkills.slice(0, 5).join(', ')}`
      );
    }
    
    // Experience keywords
    const jdLower = jdText.toLowerCase();
    if (jdLower.includes('lead') && !resumeText.toLowerCase().includes('lead')) {
      recommendations.push('Highlight leadership experience if applicable');
    }
    if (jdLower.includes('team') && !resumeText.toLowerCase().includes('team')) {
      recommendations.push('Emphasize teamwork and collaboration examples');
    }
    
    return recommendations;
  }
  
  /**
   * Generate tailored summary
   */
  generateTailoredSummary(resumeText, jdText, matchedKeywords) {
    // Extract key requirements from JD
    const jdLower = jdText.toLowerCase();
    const requirements = [];
    
    if (jdLower.includes('experience')) {
      requirements.push('experience');
    }
    if (jdLower.includes('skills') || jdLower.includes('technologies')) {
      requirements.push('technical skills');
    }
    if (jdLower.includes('lead') || jdLower.includes('manage')) {
      requirements.push('leadership');
    }
    if (jdLower.includes('team') || jdLower.includes('collaborat')) {
      requirements.push('teamwork');
    }
    
    // Extract resume summary if exists
    const summaryMatch = resumeText.match(/(summary|profile|objective)[\s\S]{0,300}/i);
    let baseSummary = summaryMatch ? summaryMatch[0].substring(summaryMatch[0].indexOf('\n') + 1) : '';
    
    if (!baseSummary) {
      // Use first 200 chars as base
      baseSummary = resumeText.substring(0, 200).replace(/\n/g, ' ');
    }
    
    // Build tailored summary
    let tailored = baseSummary.trim();
    
    if (matchedKeywords.length > 0) {
      tailored += ` Proficient in ${matchedKeywords.slice(0, 5).join(', ')}.`;
    }
    
    if (requirements.includes('leadership') && resumeText.toLowerCase().includes('lead')) {
      tailored += ' Demonstrated leadership experience.';
    }
    
    if (requirements.includes('teamwork') && resumeText.toLowerCase().includes('team')) {
      tailored += ' Strong collaborator with proven teamwork skills.';
    }
    
    return tailored.substring(0, 500); // Limit length
  }
}

export const jdMatchService = new JDMatchService();


