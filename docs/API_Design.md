# 📡 AI Interview Coach - API Design

## Overview

This document describes the RESTful API for the AI Interview Coach application. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.interviewcoach.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained through the `/api/auth/login` or `/api/auth/register` endpoints and expire after 7 days.

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": { ... } // if applicable
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "errors": [ ... ] // validation errors if applicable
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `202` - Accepted (async operation)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address. Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

**Validation:**
- Email must be valid email format
- Password must be at least 8 characters
- Name is required

---

#### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

**Errors:**
- `401` - Invalid credentials

---

#### Get Current User

```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Interview Sessions

#### Start Interview

```http
POST /api/interviews/start
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "technical",
  "duration": 45,
  "difficulty": "medium"
}
```

**Parameters:**
- `type`: `"technical" | "behavioral" | "system-design"`
- `duration`: `30 | 45 | 60` (minutes)
- `difficulty`: `"easy" | "medium" | "hard"` (optional, default: "medium")

**Response (201):**
```json
{
  "session": {
    "id": "uuid",
    "type": "technical",
    "duration": 45,
    "difficulty": "medium",
    "status": "in_progress",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "currentQuestion": {
    "id": "uuid",
    "text": "Implement a function to reverse a string.",
    "type": "technical",
    "difficulty": "medium",
    "metadata": { ... }
  }
}
```

---

#### Get Interview Session

```http
GET /api/interviews/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "type": "technical",
    "duration": 45,
    "difficulty": "medium",
    "status": "in_progress",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "questions": [
    {
      "id": "uuid",
      "question_text": "Question text...",
      "question_type": "technical",
      "difficulty": "medium",
      "question_data": { ... },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "answers": [
    {
      "id": "uuid",
      "answer_text": "Answer text...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Errors:**
- `404` - Interview session not found

---

#### Submit Answer

```http
POST /api/interviews/:id/answer
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "questionId": "uuid",
  "answer": "My answer to the question..."
}
```

**Response (200):**
```json
{
  "message": "Answer submitted successfully",
  "answerId": "uuid",
  "evaluationPending": true
}
```

**Validation:**
- `answer` is required
- `questionId` must be valid UUID

**Note:** Evaluation is processed asynchronously. Use the feedback endpoint to check status.

---

#### Get Feedback

```http
GET /api/interviews/:id/feedback?questionId=uuid
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `questionId` (required) - UUID of the question

**Response (200):**
```json
{
  "evaluation": {
    "score": 7.5,
    "feedback": "Your answer demonstrates good understanding...",
    "strengths": [
      "Clear problem-solving approach",
      "Good code structure"
    ],
    "improvements": [
      "Consider edge cases",
      "Optimize time complexity"
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Response (202) - Pending:**
```json
{
  "status": "pending",
  "message": "Evaluation is still being processed"
}
```

**Errors:**
- `404` - Interview session or question not found

---

#### Complete Interview

```http
POST /api/interviews/:id/complete
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Interview completed successfully",
  "session": {
    "id": "uuid",
    "status": "completed",
    "completed_at": "2024-01-01T00:00:00Z"
  },
  "overallScore": 7.8
}
```

---

#### Get User Interviews

```http
GET /api/interviews?limit=20&offset=0
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional, default: 20) - Number of results
- `offset` (optional, default: 0) - Pagination offset

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "type": "technical",
      "difficulty": "medium",
      "status": "completed",
      "overall_score": 7.8,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 5
  }
}
```

---

### Analytics

#### Get Dashboard

```http
GET /api/analytics/dashboard
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "stats": {
    "totalSessions": 15,
    "averageScore": 7.2,
    "bestScore": 9.5,
    "completedSessions": 12
  },
  "recentSessions": [
    {
      "id": "uuid",
      "type": "technical",
      "difficulty": "medium",
      "overall_score": 7.8,
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "skills": [
    {
      "type": "technical",
      "averageScore": 7.5,
      "questionCount": 25
    },
    {
      "type": "behavioral",
      "averageScore": 8.2,
      "questionCount": 15
    }
  ]
}
```

---

#### Get Progress

```http
GET /api/analytics/progress?days=30
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to include

**Response (200):**
```json
{
  "progress": [
    {
      "date": "2024-01-01",
      "averageScore": 7.2,
      "sessionCount": 3
    },
    {
      "date": "2024-01-02",
      "averageScore": 7.8,
      "sessionCount": 2
    }
  ]
}
```

---

#### Get Skills Analysis

```http
GET /api/analytics/skills
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "skills": [
    {
      "type": "technical",
      "difficulty": "medium",
      "averageScore": 7.5,
      "count": 10,
      "maxScore": 9.0,
      "minScore": 6.0
    }
  ]
}
```

---

#### Get Session History

```http
GET /api/analytics/sessions?limit=50&offset=0
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "type": "technical",
      "difficulty": "medium",
      "overall_score": 7.8,
      "status": "completed",
      "question_count": 5,
      "answer_count": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "completed_at": "2024-01-01T00:45:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

---

### Questions

#### Get Question Categories

```http
GET /api/questions/categories
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "categories": [
    {
      "id": "technical",
      "name": "Technical",
      "description": "Algorithm and coding questions"
    },
    {
      "id": "behavioral",
      "name": "Behavioral",
      "description": "STAR method and soft skills"
    },
    {
      "id": "system-design",
      "name": "System Design",
      "description": "Architecture and scalability"
    }
  ]
}
```

---

#### Get Question

```http
GET /api/questions/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "question": {
    "id": "uuid",
    "text": "Question text...",
    "type": "technical",
    "difficulty": "medium",
    "data": { ... },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:**
- `404` - Question not found

---

## Error Handling

### Validation Errors

When validation fails, the API returns a `400` status with detailed error information:

```json
{
  "error": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Authentication Errors

```json
{
  "error": "Unauthorized",
  "message": "Authentication token required"
}
```

### Not Found Errors

```json
{
  "error": "Not Found",
  "message": "Route GET /api/interviews/invalid-id not found"
}
```

---

## Best Practices

### Request Headers

Always include:
- `Content-Type: application/json` for POST/PUT requests
- `Authorization: Bearer <token>` for protected endpoints

### Pagination

Use `limit` and `offset` for list endpoints:
- Default `limit`: 20
- Maximum `limit`: 100
- Always include pagination metadata in responses

### Error Handling

- Always check response status codes
- Handle network errors gracefully
- Implement retry logic for transient failures
- Show user-friendly error messages

### Rate Limiting

- Respect rate limit headers
- Implement exponential backoff for 429 responses
- Cache responses when possible to reduce API calls

---

## Webhooks (Future)

Future versions may support webhooks for:
- Interview completion notifications
- Evaluation completion events
- Progress milestone alerts

---

**Last Updated**: 2024-01-01

