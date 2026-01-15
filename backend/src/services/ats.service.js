/**
 * ATS (Applicant Tracking System) Scan Service
 * Analyzes resume quality and provides ATS-friendly feedback
 */
class ATSService {
  /**
   * Scan resume for ATS compatibility
   */
  async scanResume(resumeText) {
    const text = resumeText.toLowerCase();
    const words = text.split(/\s+/);
    const wordCount = words.length;
    const charCount = text.length;
    
    // Calculate scores
    const sectionScore = this.checkSections(text);
    const keywordScore = this.analyzeKeywords(text);
    const bulletScore = this.analyzeBullets(text);
    const lengthScore = this.checkLength(wordCount);
    const formattingScore = this.checkFormatting(text);
    const consistencyScore = this.checkConsistency(text);
    
    // Weighted ATS Score (0-100)
    const atsScore = Math.round(
      sectionScore * 0.25 +
      keywordScore * 0.20 +
      bulletScore * 0.20 +
      lengthScore * 0.15 +
      formattingScore * 0.10 +
      consistencyScore * 0.10
    );
    
    // Detect sections
    const detectedSections = this.detectSections(text);
    
    // Identify risks
    const risks = this.identifyRisks(text, detectedSections);
    
    // Generate feedback
    const strengths = this.getStrengths(text, detectedSections, atsScore);
    const criticalFixes = this.getCriticalFixes(text, detectedSections, risks);
    const suggestions = this.getSuggestions(text, detectedSections, bulletScore);
    
    return {
      atsScore: Math.max(0, Math.min(100, atsScore)),
      strengths,
      criticalFixes,
      suggestions,
      detectedSections,
      risks,
      metrics: {
        wordCount,
        charCount,
        estimatedPages: Math.ceil(wordCount / 500), // ~500 words per page
      }
    };
  }
  
  /**
   * Check for required sections
   */
  checkSections(text) {
    const requiredSections = {
      summary: /(summary|profile|objective|about|overview)/i,
      skills: /(skills|technical skills|competencies|expertise)/i,
      experience: /(experience|work history|employment|professional experience)/i,
      education: /(education|academic|qualifications|degree)/i,
    };
    
    let found = 0;
    const foundSections = {};
    
    for (const [section, pattern] of Object.entries(requiredSections)) {
      if (pattern.test(text)) {
        found++;
        foundSections[section] = true;
      } else {
        foundSections[section] = false;
      }
    }
    
    return (found / Object.keys(requiredSections).length) * 100;
  }
  
  /**
   * Analyze keyword density and presence
   */
  analyzeKeywords(text) {
    // Common resume keywords
    const importantKeywords = [
      'achieved', 'improved', 'increased', 'decreased', 'managed', 'led',
      'developed', 'created', 'implemented', 'designed', 'optimized',
      'collaborated', 'delivered', 'executed', 'analyzed', 'resolved'
    ];
    
    let foundKeywords = 0;
    const foundList = [];
    
    for (const keyword of importantKeywords) {
      const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
      if (regex.test(text)) {
        foundKeywords++;
        foundList.push(keyword);
      }
    }
    
    // Check keyword density (should be 2-5% of text)
    const totalWords = text.split(/\s+/).length;
    const keywordDensity = (foundKeywords / totalWords) * 100;
    
    let score = (foundKeywords / importantKeywords.length) * 50;
    
    if (keywordDensity >= 2 && keywordDensity <= 5) {
      score += 50; // Good density
    } else if (keywordDensity > 0 && keywordDensity < 2) {
      score += 30; // Low density
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Analyze bullet points quality
   */
  analyzeBullets(text) {
    // Find bullet points (lines starting with •, -, *, or numbered)
    const bulletPattern = /^[\s]*[•\-\*\d+\.]\s+(.+)$/gm;
    const bullets = [];
    let match;
    
    while ((match = bulletPattern.exec(text)) !== null) {
      bullets.push(match[1]);
    }
    
    if (bullets.length === 0) {
      return 30; // Low score if no bullets found
    }
    
    // Action verbs
    const actionVerbs = [
      'achieved', 'improved', 'increased', 'decreased', 'managed', 'led',
      'developed', 'created', 'implemented', 'designed', 'optimized',
      'collaborated', 'delivered', 'executed', 'analyzed', 'resolved',
      'built', 'launched', 'reduced', 'enhanced', 'streamlined'
    ];
    
    // Check for metrics (numbers, percentages, $, time)
    const metricPattern = /(\d+%|\$\d+|\d+\s*(years?|months?|days?|hours?|users?|customers?|%|times?|x))/i;
    
    let actionVerbCount = 0;
    let metricCount = 0;
    
    bullets.forEach(bullet => {
      const bulletLower = bullet.toLowerCase();
      
      // Check for action verbs
      for (const verb of actionVerbs) {
        if (bulletLower.includes(verb)) {
          actionVerbCount++;
          break;
        }
      }
      
      // Check for metrics
      if (metricPattern.test(bullet)) {
        metricCount++;
      }
    });
    
    const actionVerbRatio = actionVerbCount / bullets.length;
    const metricRatio = metricCount / bullets.length;
    
    // Score: 40% action verbs, 40% metrics, 20% bullet count
    const actionScore = actionVerbRatio * 40;
    const metricScore = metricRatio * 40;
    const countScore = Math.min(20, (bullets.length / 10) * 20); // Optimal: 10+ bullets
    
    return Math.min(100, actionScore + metricScore + countScore);
  }
  
  /**
   * Check resume length
   */
  checkLength(wordCount) {
    // Ideal: 400-800 words (1-2 pages)
    if (wordCount >= 400 && wordCount <= 800) {
      return 100;
    } else if (wordCount >= 300 && wordCount < 400) {
      return 80;
    } else if (wordCount > 800 && wordCount <= 1200) {
      return 70; // Slightly long
    } else if (wordCount > 1200) {
      return 40; // Too long
    } else {
      return 50; // Too short
    }
  }
  
  /**
   * Check formatting issues
   */
  checkFormatting(text) {
    let score = 100;
    const risks = [];
    
    // Check for tables (common ATS issue)
    if (/\|\s*\|/.test(text) || /\+-+\+/.test(text)) {
      score -= 20;
      risks.push('Tables detected - may not parse correctly in ATS');
    }
    
    // Check for images/icons (text like [IMAGE] or special chars)
    if (/\[image\]|\[icon\]|📊|📈|⭐|✓|✗/i.test(text)) {
      score -= 15;
      risks.push('Images or icons detected - ATS cannot read visual elements');
    }
    
    // Check for headers/footers
    if (/page \d+ of \d+|confidential|page \d+/i.test(text)) {
      score -= 10;
      risks.push('Page numbers detected - may indicate header/footer issues');
    }
    
    // Check for columns (multiple spaces suggesting columns)
    const lines = text.split('\n');
    let columnLikeLines = 0;
    lines.forEach(line => {
      if (/\s{5,}/.test(line)) {
        columnLikeLines++;
      }
    });
    
    if (columnLikeLines > lines.length * 0.3) {
      score -= 15;
      risks.push('Column-like formatting detected - may not parse correctly');
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Check consistency (dates, tenses)
   */
  checkConsistency(text) {
    let score = 100;
    
    // Check date formats (should be consistent)
    const dateFormats = [
      /\d{4}-\d{2}-\d{2}/g, // YYYY-MM-DD
      /\d{2}\/\d{2}\/\d{4}/g, // MM/DD/YYYY
      /\d{2}-\d{2}-\d{4}/g, // MM-DD-YYYY
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}/gi, // Month YYYY
    ];
    
    const foundFormats = [];
    dateFormats.forEach((pattern, index) => {
      if (pattern.test(text)) {
        foundFormats.push(index);
      }
    });
    
    if (foundFormats.length > 1) {
      score -= 15; // Multiple date formats
    }
    
    // Check tense consistency in experience section
    const experienceSection = text.match(/(experience|work history)[\s\S]{0,500}/i);
    if (experienceSection) {
      const pastTense = /(worked|developed|managed|led|created|built|achieved)/gi;
      const presentTense = /(work|develop|manage|lead|create|build|achieve)/gi;
      
      const pastCount = (experienceSection[0].match(pastTense) || []).length;
      const presentCount = (experienceSection[0].match(presentTense) || []).length;
      
      if (pastCount > 0 && presentCount > pastCount) {
        score -= 10; // Mixed tenses
      }
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Detect sections in resume
   */
  detectSections(text) {
    return {
      summary: /(summary|profile|objective|about|overview)/i.test(text),
      skills: /(skills|technical skills|competencies|expertise)/i.test(text),
      experience: /(experience|work history|employment|professional experience)/i.test(text),
      projects: /(projects|project experience|key projects)/i.test(text),
      education: /(education|academic|qualifications|degree)/i.test(text),
      certifications: /(certifications|certificates|certified)/i.test(text),
      achievements: /(achievements|awards|honors|recognition)/i.test(text),
    };
  }
  
  /**
   * Identify risks
   */
  identifyRisks(text, detectedSections) {
    const risks = {};
    
    // Missing critical sections
    if (!detectedSections.summary) {
      risks.missingSummary = 'No summary/profile section found';
    }
    if (!detectedSections.skills) {
      risks.missingSkills = 'No skills section found';
    }
    if (!detectedSections.experience) {
      risks.missingExperience = 'No experience section found';
    }
    
    // Formatting risks
    if (/\|\s*\|/.test(text)) {
      risks.hasTables = 'Tables detected - may cause parsing issues';
    }
    
    if (/\[image\]|\[icon\]|📊|📈/i.test(text)) {
      risks.hasImages = 'Images/icons detected - ATS cannot read these';
    }
    
    // Length risks
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 1200) {
      risks.tooLong = 'Resume exceeds 2 pages - may be too long for ATS';
    } else if (wordCount < 300) {
      risks.tooShort = 'Resume is very short - may lack detail';
    }
    
    return risks;
  }
  
  /**
   * Get strengths
   */
  getStrengths(text, detectedSections, atsScore) {
    const strengths = [];
    
    if (detectedSections.summary) {
      strengths.push('Has a professional summary section');
    }
    if (detectedSections.skills) {
      strengths.push('Includes a dedicated skills section');
    }
    if (detectedSections.experience) {
      strengths.push('Contains detailed experience section');
    }
    
    const bulletPattern = /^[\s]*[•\-\*\d+\.]\s+/gm;
    const bulletCount = (text.match(bulletPattern) || []).length;
    if (bulletCount >= 8) {
      strengths.push(`Well-structured with ${bulletCount} bullet points`);
    }
    
    const metricPattern = /(\d+%|\$\d+|\d+\s*(years?|months?|users?|customers?|%|times?|x))/i;
    if (metricPattern.test(text)) {
      strengths.push('Includes quantifiable metrics and achievements');
    }
    
    if (atsScore >= 80) {
      strengths.push('Overall strong ATS compatibility');
    }
    
    return strengths;
  }
  
  /**
   * Get critical fixes
   */
  getCriticalFixes(text, detectedSections, risks) {
    const fixes = [];
    
    if (!detectedSections.summary) {
      fixes.push('Add a professional summary section at the top');
    }
    if (!detectedSections.skills) {
      fixes.push('Create a dedicated skills section listing key technologies');
    }
    
    if (risks.hasTables) {
      fixes.push('Remove tables - convert to plain text format');
    }
    
    if (risks.hasImages) {
      fixes.push('Remove images and icons - use text instead');
    }
    
    const bulletPattern = /^[\s]*[•\-\*\d+\.]\s+/gm;
    const bulletCount = (text.match(bulletPattern) || []).length;
    if (bulletCount < 5) {
      fixes.push('Add more bullet points to describe achievements (aim for 8-12)');
    }
    
    const metricPattern = /(\d+%|\$\d+|\d+\s*(years?|months?|users?|customers?|%|times?|x))/i;
    if (!metricPattern.test(text)) {
      fixes.push('Add quantifiable metrics (percentages, numbers, timeframes) to achievements');
    }
    
    return fixes;
  }
  
  /**
   * Get suggestions
   */
  getSuggestions(text, detectedSections, bulletScore) {
    const suggestions = [];
    
    if (bulletScore < 70) {
      suggestions.push('Start bullet points with strong action verbs (achieved, improved, developed)');
      suggestions.push('Include specific metrics: "Increased revenue by 25%" instead of "Increased revenue"');
    }
    
    if (!detectedSections.projects && detectedSections.experience) {
      suggestions.push('Consider adding a projects section to highlight key work');
    }
    
    if (!detectedSections.certifications) {
      suggestions.push('Add certifications section if you have relevant credentials');
    }
    
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 800) {
      suggestions.push('Consider condensing to 1-2 pages for better ATS compatibility');
    }
    
    return suggestions;
  }
}

export const atsService = new ATSService();


