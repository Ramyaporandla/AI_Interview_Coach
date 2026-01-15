# Resume Analyzer + ATS Scan + Job Description Match Feature

## Overview
Complete implementation of Resume Analyzer with ATS scanning, Job Description matching, and Resume-based Interview question generation.

## Files Changed

### Backend Files

#### Database Schema
- **`backend/src/db/schema.sql`**
  - Added `job_descriptions` table
  - Stores JD text, job title, company, linked to resumes

#### Services
1. **`backend/src/services/ats.service.js`** (NEW)
   - ATS scan service with comprehensive scoring
   - Checks sections, keywords, bullets, length, formatting, consistency
   - Returns scores, strengths, critical fixes, suggestions, risks

2. **`backend/src/services/jdMatch.service.js`** (NEW)
   - Job description matching service
   - Extracts keywords, calculates match score
   - Provides missing/matched keywords, recommendations, tailored summary

3. **`backend/src/services/jd.service.js`** (NEW)
   - Job description storage service
   - Save, retrieve JDs linked to resumes

4. **`backend/src/services/question.service.js`** (UPDATED)
   - Added `generateResumeBasedQuestions()` method
   - Generates 10 questions: 4 project-specific, 3 skills/tech, 2 behavioral, 1 deep dive
   - Includes rationale for each question

5. **`backend/src/services/resume.service.js`** (UPDATED)
   - Fixed PDF parsing (Buffer → Uint8Array conversion)
   - Already handles resume storage

#### Controllers
- **`backend/src/controllers/resume.controller.js`** (UPDATED)
  - `uploadResume()` - Returns `extractedTextPreview`
  - `scanATS()` - Runs ATS scan on resume
  - `matchJD()` - Matches resume against JD
  - `generateInterviewQuestions()` - Generates resume-based questions

#### Routes
- **`backend/src/routes/resume.routes.js`** (UPDATED)
  - `POST /api/resume/upload` - Upload resume (existing)
  - `POST /api/resume/ats-scan` - Run ATS scan
  - `POST /api/resume/jd-match` - Match resume with JD
  - `POST /api/resume/interview-questions` - Generate interview questions

### Frontend Files

#### Components
1. **`frontend/src/components/Resume/ResumeATSPage.jsx`** (NEW)
   - Main page for Resume ATS feature
   - Resume upload (drag & drop)
   - Job description input (text area + optional title/company)
   - Three action buttons: ATS Scan, JD Match, Generate Questions
   - Results panels showing scores and feedback

2. **`frontend/src/components/Resume/InterviewFromResumePage.jsx`** (NEW)
   - Interview session page
   - Shows generated questions one by one
   - Answer input for each question
   - Navigation between questions
   - Progress tracking
   - Submit interview

#### Services
- **`frontend/src/services/api.js`** (UPDATED)
  - Added `resumeService.scanATS()`
  - Added `resumeService.matchJD()`
  - Added `resumeService.generateInterviewQuestions()`

#### Routes
- **`frontend/src/App.jsx`** (UPDATED)
  - Added route `/resume-ats` → `ResumeATSPage`
  - Added route `/interview-from-resume` → `InterviewFromResumePage`

#### Navigation
- **`frontend/src/components/common/Navbar.jsx`** (UPDATED)
  - Changed "Resume" link to "Resume ATS" pointing to `/resume-ats`

## API Endpoints

### POST /api/resume/upload
**Request:** multipart/form-data with `resume` file
**Response:**
```json
{
  "resumeId": "uuid",
  "extractedText": "full text",
  "extractedTextPreview": "first 500 chars...",
  "fileName": "resume.pdf"
}
```

### POST /api/resume/ats-scan
**Request:**
```json
{
  "resumeId": "uuid"
}
```
**Response:**
```json
{
  "atsScore": 85,
  "strengths": ["Has summary section", "Includes metrics"],
  "criticalFixes": ["Add skills section", "Remove tables"],
  "suggestions": ["Add more bullet points", "Include certifications"],
  "detectedSections": {
    "summary": true,
    "skills": false,
    "experience": true,
    "projects": true,
    "education": true
  },
  "risks": {
    "missingSkills": "No skills section found",
    "hasTables": "Tables detected"
  },
  "metrics": {
    "wordCount": 650,
    "charCount": 3500,
    "estimatedPages": 2
  }
}
```

### POST /api/resume/jd-match
**Request:**
```json
{
  "resumeId": "uuid",
  "jdText": "Full job description text...",
  "jobTitle": "Software Engineer" (optional),
  "company": "Google" (optional)
}
```
**Response:**
```json
{
  "matchScore": 78,
  "missingKeywords": ["kubernetes", "microservices"],
  "matchedKeywords": ["python", "react", "aws"],
  "recommendedEdits": [
    "Add these keywords: kubernetes, microservices",
    "Consider adding technical skills: Docker, CI/CD"
  ],
  "tailoredSummary": "Tailored summary text...",
  "jdId": "uuid",
  "keywordStats": {
    "totalJDKeywords": 45,
    "matchedCount": 35,
    "missingCount": 10,
    "matchPercentage": 78
  }
}
```

### POST /api/resume/interview-questions
**Request:**
```json
{
  "resumeId": "uuid",
  "jdText": "Job description..." (optional),
  "role": "software-engineer",
  "difficulty": "medium"
}
```
**Response:**
```json
{
  "questions": [
    {
      "id": "uuid",
      "text": "Question text",
      "category": "project-specific",
      "rationale": "Based on your project: ..."
    },
    // ... 9 more questions
  ],
  "sessionConfig": {
    "role": "software-engineer",
    "difficulty": "medium",
    "totalQuestions": 10,
    "categories": {
      "projectSpecific": 4,
      "skillsTech": 3,
      "behavioral": 2,
      "deepDive": 1
    }
  },
  "resumeId": "uuid",
  "jdText": "..."
}
```

## Features Implemented

### ✅ 1. Resume Upload + Text Extraction
- UI: Drag & drop or click to upload
- Backend: PDF (pdf-parse) and DOCX (mammoth) parsing
- Returns resumeId and extractedTextPreview

### ✅ 2. Job Description Input
- UI: Text area for pasting JD
- Optional: Job title and company fields
- Backend: Saves JD with jdId

### ✅ 3. ATS-Friendly Scan
- Comprehensive scoring (0-100)
- Section presence checks
- Keyword density analysis
- Bullet quality (action verbs, metrics)
- Length heuristics
- Formatting risk detection
- Consistency checks
- Raw, actionable feedback

### ✅ 4. JD Match Rating
- Match score (0-100)
- Keyword extraction and comparison
- Missing/matched keywords
- Recommended edits
- Tailored summary generation

### ✅ 5. Resume-based Interview Questions
- 10 questions total:
  - 4 project-specific
  - 3 skills/tech stack
  - 2 behavioral (tied to resume)
  - 1 deep dive follow-up
- Question rationale for each
- Uses resume + JD context

### ✅ 6. UI Pages
- **ResumeATSPage**: Upload, JD input, scan buttons, results
- **InterviewFromResumePage**: Question-by-question interview

### ✅ 7. API Endpoints
- All endpoints created and routed
- Input validation
- Error handling

### ✅ 8. Implementation Details
- Uses PostgreSQL (existing storage)
- File validation (5MB limit, PDF/DOCX only)
- Works without OpenAI (heuristic-based)
- Clean module structure

### ✅ 9. Output Format
- Color-coded scores
- Critical fixes (high priority)
- Missing keywords (exact list)
- Suggested edits
- Tailored summary

## How to Run

### 1. Database Migration
```bash
cd AI_Interview_Coach/backend
npm run migrate
```
This adds the `job_descriptions` table.

### 2. Start Backend
```bash
cd AI_Interview_Coach/backend
npm run dev
```
Backend runs on `http://localhost:3000`

### 3. Start Frontend
```bash
cd AI_Interview_Coach/frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Access Feature
1. Log in to your account
2. Click "Resume ATS" in the navbar
3. Or navigate to `http://localhost:5173/resume-ats`

## Usage Flow

1. **Upload Resume**
   - Drag & drop or select PDF/DOCX file
   - Wait for upload and text extraction

2. **Paste Job Description** (Optional)
   - Paste JD text in the text area
   - Optionally add job title and company

3. **Run ATS Scan**
   - Click "ATS Scan" button
   - View score, strengths, critical fixes, suggestions

4. **Check JD Match** (if JD provided)
   - Click "JD Match" button
   - View match score, keywords, recommendations

5. **Generate Interview Questions**
   - Click "Generate Questions" button
   - View 10 personalized questions

6. **Start Interview**
   - Click "Start Interview" button
   - Answer questions one by one
   - Submit when complete

## Scoring Details

### ATS Score Components
- **Section Presence (25%)**: Summary, Skills, Experience, Education
- **Keywords (20%)**: Action verbs, technical terms density
- **Bullets (20%)**: Action verbs, metrics presence
- **Length (15%)**: Optimal 400-800 words
- **Formatting (10%)**: Tables, images, columns detection
- **Consistency (10%)**: Date formats, tense consistency

### JD Match Score Components
- **Keyword Matching (60%)**: Resume keywords vs JD keywords
- **Skill Overlap (20%)**: Technical skills alignment
- **Experience Alignment (20%)**: Years of experience match

## Technical Notes

- **PDF Parsing**: Uses pdf-parse library with Uint8Array conversion
- **Text Extraction**: Normalized (whitespace collapsed, trimmed)
- **Storage**: PostgreSQL for resumes and job descriptions
- **No OpenAI Required**: Core features work with heuristics
- **Error Handling**: Comprehensive error messages
- **Dark Mode**: All components support dark/light themes

## Testing

1. Upload a resume PDF
2. Run ATS scan - should return score and feedback
3. Paste a job description
4. Run JD match - should return match score and keywords
5. Generate interview questions - should return 10 questions
6. Start interview - should navigate to interview page

## Future Enhancements

- Add role/difficulty selection for interview generation
- Save ATS scan results to database
- Compare multiple resumes
- Export tailored resume
- AI-powered suggestions (optional, if OpenAI available)


