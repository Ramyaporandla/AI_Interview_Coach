# Question Deduplication Fix - Summary

## Problem
Generated interview questions were not checked for duplicates, leading to repeated questions in the same session.

## Solution Implemented

### 1. Added Deduplication Helper Methods (`question.service.js`)

**New Methods:**
- `normalizeQuestionText(text)` - Normalizes question text (trim + lowercase) for comparison
- `isDuplicate(question, existingQuestions)` - Checks if a question is a duplicate
- `getGenericFallbackQuestions(role, difficulty)` - Returns 10 generic fallback questions

### 2. Updated `generateResumeBasedQuestions` Method

**Changes:**
- Changed from generating 10 questions to exactly **5 unique questions**
- Added deduplication using `Set` to track normalized question texts
- Added retry logic: up to 8 attempts to generate 5 unique questions
- Fills remaining slots with fallback questions if needed
- Ensures minimum 5 questions are always returned

**Key Features:**
- Normalizes question text before comparison (trim + lowercase)
- Regenerates questions if duplicates are detected
- Uses fallback questions if generation fails or produces duplicates
- Logs attempts and final count for debugging

### 3. Updated `generateFromResume` Controller (`resume.controller.js`)

**Changes:**
- Added deduplication logic for the 5-question generation flow
- Uses `Set` to track unique normalized question texts
- Retries up to 10 times to ensure 5 unique questions
- Falls back to generic questions if needed

### 4. Updated `startInterview` Controller (`interview.controller.js`)

**Changes:**
- Added deduplication for standard interview question generation
- Ensures unique questions per session
- Uses same normalization and fallback logic

## Files Changed

### Backend

1. **`backend/src/services/question.service.js`**
   - Added `normalizeQuestionText()` method
   - Added `isDuplicate()` method  
   - Added `getGenericFallbackQuestions()` method
   - Updated `generateResumeBasedQuestions()` to return exactly 5 unique questions with deduplication

2. **`backend/src/controllers/resume.controller.js`**
   - Updated `generateFromResume()` to include deduplication logic
   - Added fallback question filling

3. **`backend/src/controllers/interview.controller.js`**
   - Updated `startInterview()` to include deduplication logic
   - Added fallback question filling

### Frontend
- No changes needed - frontend already displays `questions` array from backend correctly

## Code Changes (Diff Style)

### `backend/src/services/question.service.js`

```diff
+  /**
+   * Normalize question text for comparison (trim + lowercase)
+   */
+  normalizeQuestionText(text) {
+    if (!text || typeof text !== 'string') return '';
+    return text.trim().toLowerCase().replace(/\s+/g, ' ');
+  }
+
+  /**
+   * Get fallback generic questions (10 questions)
+   */
+  getGenericFallbackQuestions(role, difficulty) {
+    const genericQuestions = [
+      'Tell me about yourself and your background.',
+      'Why are you interested in this position?',
+      // ... 8 more questions
+    ];
+    return genericQuestions.map((text, index) => ({
+      id: uuidv4(),
+      text: text,
+      type: 'behavioral',
+      difficulty: difficulty || 'medium',
+      category: 'generic',
+      rationale: 'Generic interview question',
+      metadata: { isFallback: true, index: index }
+    }));
+  }

  async generateResumeBasedQuestions(resumeText, jdText, role, difficulty) {
-    const questions = [];
-    // ... generates 10 questions
-    return { questions: questions.slice(0, 10), ... };
+    const questions = [];
+    const uniqueTexts = new Set(); // Track normalized question texts
+    const maxAttempts = 8;
+    const targetCount = 5; // Changed from 10 to 5
+    
+    // Generate questions with deduplication
+    // ... retry logic with duplicate checking
+    
+    // Fill with fallback if needed
+    if (questions.length < targetCount) {
+      const fallbackQuestions = this.getGenericFallbackQuestions(role, difficulty);
+      // ... add unique fallback questions
+    }
+    
+    return { questions: finalQuestions.slice(0, Math.max(targetCount, questions.length)), ... };
  }
```

### `backend/src/controllers/resume.controller.js`

```diff
  // Generate questions based on resume content
  const questions = [];
+  const uniqueTexts = new Set();
  const questionCount = 5;
+  const maxAttempts = 10;
+  let attempts = 0;

-  for (let i = 0; i < questionCount; i++) {
+  while (questions.length < questionCount && attempts < maxAttempts) {
+    attempts++;
    const question = await questionService.generateQuestion({...});
+    
+    // Check for duplicates
+    const normalizedText = questionService.normalizeQuestionText(question.text);
+    if (!uniqueTexts.has(normalizedText) && normalizedText.length > 10) {
+      uniqueTexts.add(normalizedText);
+      questions.push(question);
+    } else {
+      console.log('Duplicate detected, regenerating...');
+    }
  }
+  
+  // Fill with fallback if needed
+  if (questions.length < questionCount) {
+    const fallbackQuestions = questionService.getGenericFallbackQuestions(role, difficulty);
+    // ... add unique fallback questions
+  }
```

### `backend/src/controllers/interview.controller.js`

```diff
  const questions = [];
  const previousQuestions = [];
+  const uniqueTexts = new Set();
+  const maxAttempts = questionCount * 2;
+  let attempts = 0;

-  for (let i = 0; i < questionCount; i++) {
+  while (questions.length < questionCount && attempts < maxAttempts) {
+    attempts++;
    const question = await questionService.generateQuestion({...});
+    
+    // Check for duplicates
+    const normalizedText = questionService.normalizeQuestionText(question.text);
+    if (!uniqueTexts.has(normalizedText) && normalizedText.length > 10) {
+      uniqueTexts.add(normalizedText);
      questions.push(question);
      previousQuestions.push(question);
+    } else {
+      console.log('Duplicate detected, regenerating...');
+    }
  }
+  
+  // Fill with fallback if needed
+  if (questions.length < questionCount) {
+    // ... add unique fallback questions
+  }
```

## How It Works

1. **Normalization**: Question text is normalized (trimmed, lowercased, whitespace collapsed) before comparison
2. **Deduplication**: Uses a `Set` to track normalized question texts
3. **Retry Logic**: If a duplicate is detected, regenerates the question (up to max attempts)
4. **Fallback**: If unable to generate enough unique questions, fills remaining slots with generic questions
5. **Guarantee**: Always returns at least 5 unique questions (or the requested count)

## Testing

### Commands to Restart

**Backend:**
```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach/backend
npm run dev
```

**Frontend:**
```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach/frontend
npm run dev
```

### How to Test

1. **Test Resume-Based Questions:**
   - Upload a resume
   - Paste a job description
   - Click "Generate Questions"
   - Verify exactly 5 unique questions are displayed
   - Check browser console for logs: `Generated X unique questions out of Y attempts`

2. **Test Standard Interview:**
   - Start a mock interview session
   - Verify all questions are unique
   - Check backend logs for deduplication messages

3. **Test Duplicate Detection:**
   - Generate questions multiple times
   - Verify no duplicates appear
   - Check console logs for "Duplicate question detected" messages

4. **Test Fallback:**
   - If OpenAI API fails or produces many duplicates
   - Verify fallback questions are used
   - Ensure total count is still 5

### Expected Behavior

- ✅ Always returns exactly 5 unique questions (or requested count)
- ✅ No duplicate questions in the same session
- ✅ Questions are normalized before comparison
- ✅ Fallback questions used if generation fails
- ✅ Console logs show deduplication attempts
- ✅ Frontend displays all questions from backend

## Debugging

**Check Backend Logs:**
```
[QuestionService] Duplicate question detected, regenerating... (attempt X)
[QuestionService] Generated 5 unique questions out of 7 attempts
[ResumeController] Generated 5 unique questions out of 6 attempts
```

**Check Frontend:**
- Open browser DevTools Console
- Look for question data in network requests
- Verify `questions` array has 5 unique items

## Notes

- Deduplication is case-insensitive and whitespace-normalized
- Minimum question length is 10 characters (to filter out invalid questions)
- Fallback questions are generic but still unique
- All questions have unique IDs even if text is similar


