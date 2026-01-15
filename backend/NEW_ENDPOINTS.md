# New API Endpoints Documentation

## Overview
This document describes all the new endpoints added to the AI Interview Coach backend API.

## Interview Endpoints

### POST /api/interview/ask
Generate or use a provided interview question.

**Request Body:**
```json
{
  "question": "optional - if provided, uses this question",
  "context": "optional - additional context",
  "mode": "standard|mock|practice",
  "role": "software-engineer|data-scientist|...",
  "type": "technical|behavioral|system-design",
  "difficulty": "easy|medium|hard"
}
```

**Response:**
```json
{
  "question": {
    "id": "uuid",
    "text": "question text",
    "type": "technical",
    "difficulty": "medium"
  }
}
```

### POST /api/interview/score
Score an answer to an interview question.

**Request Body:**
```json
{
  "question": "question text or object",
  "answer": "answer text",
  "mode": "friendly|strict|faang|hr",
  "rubric": "optional - custom rubric"
}
```

**Response:**
```json
{
  "score": 8.5,
  "clarityScore": 9.0,
  "structureScore": 8.0,
  "relevanceScore": 8.5,
  "confidenceScore": 8.0,
  "feedback": "detailed feedback text",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}
```

### POST /api/interview/improve
Improve an answer using various transformation types.

**Request Body:**
```json
{
  "question": "question text or object",
  "answer": "answer text",
  "transformType": "STAR|senior|metrics|concise"
}
```

**Response:**
```json
{
  "improvedAnswer": "improved answer text",
  "transformType": "STAR",
  "originalAnswer": "original answer"
}
```

**Transform Types:**
- `STAR`: Structure answer using Situation, Task, Action, Result format
- `senior`: Rewrite as senior-level professional would respond
- `metrics`: Add specific metrics, numbers, and quantifiable results
- `concise`: Make answer more concise while retaining key information

### POST /api/interview/generate-from-resume
Generate interview questions based on uploaded resume.

**Request Body:**
```json
{
  "resumeId": "uuid",
  "role": "software-engineer",
  "type": "technical|behavioral|system-design",
  "difficulty": "easy|medium|hard"
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "uuid",
      "text": "question text",
      "type": "technical",
      "difficulty": "medium"
    }
  ],
  "resumeId": "uuid",
  "role": "software-engineer",
  "type": "technical",
  "difficulty": "medium"
}
```

## Questions Endpoint

### GET /api/questions
Get question bank with filters. Supports FAANG-style questions.

**Query Parameters:**
- `role`: Filter by role (software-engineer, data-scientist, etc.)
- `type`: Filter by type (technical, behavioral, system-design)
- `difficulty`: Filter by difficulty (easy, medium, hard)
- `company`: Filter by company (google, amazon, meta, apple, netflix, microsoft)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "questions": [
    {
      "id": "uuid",
      "text": "question text",
      "type": "technical",
      "difficulty": "medium",
      "data": {},
      "practiceCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}
```

## Resume Endpoints

### POST /api/resume/upload
Upload a resume file (PDF or DOCX) and extract text.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Field name: `resume`
- Max file size: 5MB
- Allowed types: PDF, DOCX

**Response:**
```json
{
  "resumeId": "uuid",
  "extractedText": "extracted text from resume",
  "fileName": "resume.pdf"
}
```

**Security:**
- File size limit: 5MB
- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Text normalization: whitespace collapsed, trimmed

## Session Endpoints

### POST /api/sessions/save
Save a session summary with questions, answers, and scores.

**Request Body:**
```json
{
  "role": "software-engineer",
  "type": "technical",
  "difficulty": "medium",
  "mode": "mock",
  "questions": ["question1", "question2"],
  "answers": ["answer1", "answer2"],
  "scores": [8.5, 9.0]
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "session": {
    "id": "uuid",
    "role": "software-engineer",
    "type": "technical",
    "difficulty": "medium",
    "mode": "mock",
    "overallScore": 8.75,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "questions": [...],
  "answers": [...]
}
```

### GET /api/sessions
List all sessions for the authenticated user.

**Query Parameters:**
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "type": "technical",
      "difficulty": "medium",
      "status": "completed",
      "overall_score": 8.5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 50
  }
}
```

### GET /api/sessions/:id
Get a specific session with all questions, answers, and evaluations.

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "type": "technical",
    "duration": 60,
    "difficulty": "medium",
    "status": "completed",
    "overallScore": 8.5,
    "createdAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T01:00:00Z"
  },
  "questions": [...],
  "answers": [...],
  "evaluations": [...]
}
```

## Report Endpoints

### GET /api/report/:sessionId/pdf
Generate and download a PDF report for a session.

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="interview-report-{sessionId}.pdf"

**PDF Contents:**
- Session metadata (ID, type, difficulty, status, dates, overall score)
- Questions and answers
- Detailed evaluations with scores (overall, clarity, structure, relevance, confidence)
- Feedback, strengths, and improvements
- Summary tips based on performance

## Database Schema Updates

### Resumes Table
```sql
CREATE TABLE resumes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    extracted_text TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Security Features

1. **File Upload Security:**
   - File size limit: 5MB
   - MIME type validation (PDF, DOCX only)
   - File content validation

2. **Input Validation:**
   - Express-validator for request validation
   - Type checking for all parameters
   - Required field validation

3. **Authentication:**
   - All endpoints (except /api/resume/upload) require authentication token
   - User ownership verification for sessions and resumes

## FAANG-Style Questions

The system includes a comprehensive question bank with FAANG-style questions:

- **Technical:** Algorithm and data structure questions at various difficulty levels
- **Behavioral:** STAR method questions with role-specific scenarios
- **System Design:** Scalability and architecture questions for large-scale systems
- **Company-Specific:** Questions tailored for Google, Amazon, Meta, Apple, Netflix, Microsoft

Questions are generated using OpenAI with fallback to curated FAANG-style questions.

## Error Handling

All endpoints include proper error handling:
- 400: Bad Request (validation errors, missing fields)
- 401: Unauthorized (missing or invalid token)
- 404: Not Found (session, resume, or question not found)
- 500: Internal Server Error (server-side errors)

## Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all IDs
- Text extraction normalizes whitespace (collapses multiple spaces, trims)
- PDF reports are generated using PDFKit and streamed to the client
- Resume parsing supports both PDF (pdf-parse) and DOCX (mammoth) formats


