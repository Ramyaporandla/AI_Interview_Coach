import mammoth from 'mammoth';
import { db } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resume parsing service
 */
class ResumeService {
  /**
   * Parse PDF resume
   */
  async parsePDF(buffer) {
    try {
      console.log('[ResumeService] Starting PDF parsing, buffer size:', buffer?.length);
      console.log('[ResumeService] Buffer type:', buffer?.constructor?.name);
      
      // Convert Buffer to Uint8Array (pdf-parse requires Uint8Array, not Buffer)
      let uint8Array;
      if (Buffer.isBuffer(buffer)) {
        // Node.js Buffer - convert to Uint8Array
        // Use the buffer's underlying ArrayBuffer for efficiency
        if (buffer.buffer instanceof ArrayBuffer) {
          uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        } else {
          // Fallback: create new Uint8Array from buffer values
          uint8Array = new Uint8Array(buffer);
        }
        console.log('[ResumeService] Converted Buffer to Uint8Array, length:', uint8Array.length);
      } else if (buffer instanceof Uint8Array) {
        // Already a Uint8Array
        uint8Array = buffer;
        console.log('[ResumeService] Buffer is already Uint8Array');
      } else if (buffer instanceof ArrayBuffer) {
        // ArrayBuffer - convert to Uint8Array
        uint8Array = new Uint8Array(buffer);
        console.log('[ResumeService] Converted ArrayBuffer to Uint8Array');
      } else {
        throw new Error(`Unsupported buffer type: ${buffer?.constructor?.name || typeof buffer}`);
      }
      
      // Use dynamic import for pdf-parse due to ESM compatibility
      const pdfParseModule = await import('pdf-parse');
      
      // pdf-parse v2.4.5 exports both default and named exports
      // Try default export first (most common)
      let pdfParse;
      if (pdfParseModule.default) {
        pdfParse = pdfParseModule.default;
      } else if (pdfParseModule.pdfParse) {
        pdfParse = pdfParseModule.pdfParse;
      } else {
        // Fallback: try using PDFParse class if available
        if (pdfParseModule.PDFParse) {
          const PDFParse = pdfParseModule.PDFParse;
          const parser = new PDFParse(uint8Array, {});
          await parser.load();
          let fullText = parser.getText();
          
          // Ensure fullText is a string
          if (typeof fullText !== 'string') {
            if (Array.isArray(fullText)) {
              fullText = fullText.join(' ');
            } else if (fullText && typeof fullText === 'object') {
              fullText = fullText.text || JSON.stringify(fullText);
            } else {
              fullText = String(fullText || '');
            }
          }
          
          fullText = fullText.replace(/\0/g, '').trim();
          
          if (!fullText || fullText.length === 0) {
            throw new Error('No text could be extracted from the PDF');
          }
          return this.normalizeText(fullText);
        }
        throw new Error('pdf-parse module not properly imported');
      }
      
      // Parse PDF using the function directly with Uint8Array
      console.log('[ResumeService] Calling pdfParse with Uint8Array...');
      const data = await pdfParse(uint8Array);
      
      console.log('[ResumeService] pdfParse response type:', typeof data);
      console.log('[ResumeService] pdfParse response keys:', data ? Object.keys(data) : 'null');
      
      // Handle different response formats from pdf-parse
      let extractedText = '';
      
      if (typeof data === 'string') {
        // If data is directly a string
        extractedText = data;
      } else if (data && typeof data === 'object') {
        // If data is an object, try different possible properties
        if (typeof data.text === 'string') {
          extractedText = data.text;
        } else if (Array.isArray(data.text)) {
          // If text is an array, join it
          extractedText = data.text.join(' ');
        } else if (data.content && typeof data.content === 'string') {
          extractedText = data.content;
        } else if (data.pages && Array.isArray(data.pages)) {
          // If pages array exists, extract text from each page
          extractedText = data.pages
            .map(page => {
              if (typeof page === 'string') return page;
              if (page && typeof page.text === 'string') return page.text;
              if (page && Array.isArray(page.text)) return page.text.join(' ');
              return '';
            })
            .filter(text => text.length > 0)
            .join('\n');
        } else {
          // Try to stringify the object as last resort
          console.warn('[ResumeService] Unexpected data format, attempting to extract text');
          extractedText = JSON.stringify(data);
        }
      } else {
        throw new Error('Unexpected response format from pdf-parse');
      }
      
      // Ensure extractedText is a string
      if (typeof extractedText !== 'string') {
        extractedText = String(extractedText || '');
      }
      
      // Remove any null/undefined characters and trim
      extractedText = extractedText.replace(/\0/g, '').trim();
      
      if (!extractedText || extractedText.length === 0) {
        throw new Error('No text could be extracted from the PDF');
      }
      
      console.log('[ResumeService] PDF parsed successfully, extracted', extractedText.length, 'characters');
      
      return this.normalizeText(extractedText);
    } catch (error) {
      console.error('[ResumeService] PDF parsing error:', error);
      console.error('[ResumeService] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        bufferType: buffer?.constructor?.name
      });
      throw new Error(`Failed to parse PDF file: ${error.message}`);
    }
  }

  /**
   * Parse DOCX resume
   */
  async parseDOCX(buffer) {
    try {
      console.log('[ResumeService] Starting DOCX parsing, buffer size:', buffer?.length);
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result || !result.value) {
        throw new Error('No text could be extracted from the DOCX file');
      }
      
      console.log('[ResumeService] DOCX parsed successfully, extracted', result.value.length, 'characters');
      return this.normalizeText(result.value);
    } catch (error) {
      console.error('[ResumeService] DOCX parsing error:', error);
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  }

  /**
   * Normalize extracted text
   */
  normalizeText(text) {
    if (!text) return '';
    
    // Ensure text is a string
    if (typeof text !== 'string') {
      if (Array.isArray(text)) {
        text = text.join(' ');
      } else if (text && typeof text === 'object') {
        text = text.text || JSON.stringify(text);
      } else {
        text = String(text || '');
      }
    }
    
    return text
      .replace(/\0/g, '') // Remove null characters
      .trim()
      .replace(/\s+/g, ' ') // Collapse multiple whitespace to single space
      .replace(/\n\s*\n/g, '\n') // Collapse multiple newlines
      .trim();
  }

  /**
   * Save resume to database
   */
  async saveResume(userId, extractedText, fileName, fileType, fileSize) {
    try {
      console.log('[ResumeService] Saving resume to database for user:', userId);
      const resumeId = uuidv4();
      
      const result = await db.query(
        `INSERT INTO resumes (id, user_id, extracted_text, file_name, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, file_name, file_type, file_size`,
        [resumeId, userId, extractedText, fileName, fileType, fileSize]
      );

      console.log('[ResumeService] Resume saved successfully with ID:', resumeId);

      return {
        id: resumeId,
        extractedText,
        fileName: result.rows[0]?.file_name || fileName,
        fileType: result.rows[0]?.file_type || fileType,
        fileSize: result.rows[0]?.file_size || fileSize,
      };
    } catch (error) {
      console.error('[ResumeService] Error saving resume:', error);
      throw new Error(`Failed to save resume: ${error.message}`);
    }
  }

  /**
   * Get resume by ID
   */
  async getResume(resumeId, userId) {
    const result = await db.query(
      `SELECT * FROM resumes WHERE id = $1 AND user_id = $2`,
      [resumeId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get user's resumes
   */
  async getUserResumes(userId) {
    const result = await db.query(
      `SELECT id, file_name, file_type, file_size, created_at 
       FROM resumes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }
}

export const resumeService = new ResumeService();

