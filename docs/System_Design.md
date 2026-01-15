# 🏗️ AI Interview Coach - System Design

## Overview

AI Interview Coach is a full-stack web application that provides AI-powered mock interview experiences for software engineers. This document outlines the system architecture, design decisions, and technical implementation details.

## Table of Contents

- [System Requirements](#system-requirements)
- [Architecture](#architecture)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [Technology Choices](#technology-choices)
- [Design Decisions](#design-decisions)

## System Requirements

### Functional Requirements

1. **User Management**
   - User registration and authentication
   - Secure session management
   - User profile and preferences

2. **Interview Sessions**
   - Start customizable interview sessions (type, duration, difficulty)
   - Generate AI-powered questions dynamically
   - Submit and track answers
   - Real-time feedback generation

3. **AI Integration**
   - Question generation using OpenAI GPT-4
   - Answer evaluation and scoring
   - Personalized feedback generation

4. **Analytics & Progress**
   - Track performance over time
   - Identify strengths and weaknesses
   - Visualize progress with charts and graphs

### Non-Functional Requirements

- **Performance**: API response time < 200ms (excluding AI calls)
- **Scalability**: Support 1000+ concurrent users
- **Availability**: 99.9% uptime
- **Security**: Secure authentication, rate limiting, input validation
- **Cost Efficiency**: Optimize AI API usage with caching

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (SPA)                      │
│              Vite + React + TailwindCSS                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
        ┌──────────────────────────────────────┐
        │         API Gateway / Load Balancer  │
        │    (Rate Limiting, CORS, SSL)        │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │         Express.js Backend           │
        │    (RESTful API, JWT Auth)          │
        └──────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ PostgreSQL   │    │    Redis     │    │  OpenAI API  │
│  (Primary)   │    │   (Cache)    │    │   (AI)       │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Component Architecture

#### Frontend Components

1. **Authentication Layer**
   - Login/Register components
   - JWT token management
   - Protected route wrapper

2. **Dashboard**
   - Overview statistics
   - Recent sessions
   - Progress charts
   - Skills radar

3. **Interview Session**
   - Question display
   - Code editor (for technical questions)
   - Answer submission
   - Real-time feedback

#### Backend Services

1. **Auth Service**
   - User registration/login
   - JWT token generation/validation
   - Password hashing (bcrypt)

2. **Interview Service**
   - Session management
   - Question flow control
   - Answer submission handling

3. **Question Service**
   - AI question generation
   - Question caching
   - Fallback question handling

4. **Evaluation Service**
   - AI-powered answer evaluation
   - Score calculation
   - Feedback generation

5. **Analytics Service**
   - Performance aggregation
   - Progress tracking
   - Skills analysis

## Component Design

### Database Schema

**Users Table**
- Stores user credentials and profile information
- Indexed on email for fast lookups

**Interview Sessions Table**
- Tracks interview sessions with metadata
- Links to user and aggregates scores

**Interview Questions Table**
- Stores generated questions per session
- JSONB for flexible question data storage

**Interview Answers Table**
- Stores user answers
- Links to questions and sessions

**Answer Evaluations Table**
- Stores AI-generated evaluations
- Includes scores, feedback, strengths, improvements

### Caching Strategy

**Redis Usage:**
1. **Question Caching**: Cache generated questions by type/difficulty (1 hour TTL)
2. **Session State**: Store active session state (1 hour TTL)
3. **Rate Limiting**: Track API request counts per user/IP

**Cache Invalidation:**
- Questions: Time-based expiration (1 hour)
- Session state: Deleted on session completion
- User data: Cache-aside pattern with manual invalidation

### API Design

**RESTful Principles:**
- Resource-based URLs
- HTTP methods for actions (GET, POST, PUT, DELETE)
- Consistent error responses
- Pagination for list endpoints

**Response Format:**
```json
{
  "data": { ... },
  "message": "Success",
  "pagination": { ... } // if applicable
}
```

**Error Format:**
```json
{
  "error": "Error message",
  "message": "Detailed description"
}
```

## Data Flow

### Interview Session Flow

```
1. User starts interview
   ↓
2. Backend creates session record
   ↓
3. Question Service generates first question
   ├─ Check Redis cache
   ├─ If cached: Return cached question
   └─ If not: Call OpenAI API → Cache result
   ↓
4. Frontend displays question
   ↓
5. User submits answer
   ↓
6. Backend saves answer
   ↓
7. Evaluation Service processes answer (async)
   ├─ Call OpenAI API for evaluation
   ├─ Parse evaluation response
   └─ Save to database
   ↓
8. Frontend polls for feedback
   ↓
9. Display feedback to user
   ↓
10. Generate next question (repeat from step 3)
```

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend validates credentials
   ├─ Hash comparison (bcrypt)
   └─ User lookup
   ↓
3. Generate JWT token
   ↓
4. Return token to frontend
   ↓
5. Frontend stores token (localStorage)
   ↓
6. Include token in subsequent requests (Authorization header)
   ↓
7. Backend validates token on protected routes
```

## Technology Choices

### Frontend

**React 18**
- Component-based architecture
- Hooks for state management
- Large ecosystem

**Vite**
- Fast development server
- Optimized production builds
- Modern tooling

**TailwindCSS**
- Utility-first CSS
- Rapid UI development
- Consistent design system

**Framer Motion**
- Smooth animations
- Enhanced UX
- Performance optimized

### Backend

**Node.js + Express**
- JavaScript across stack
- Fast development
- Large ecosystem
- Async I/O for AI API calls

**PostgreSQL**
- ACID compliance
- JSONB support for flexible data
- Strong relational capabilities
- Excellent performance

**Redis**
- Fast in-memory caching
- Session state management
- Rate limiting support

**OpenAI API (GPT-4)**
- High-quality question generation
- Natural language evaluation
- Contextual feedback

### Security

**JWT Authentication**
- Stateless authentication
- Scalable across instances
- Secure token storage

**bcrypt**
- Industry-standard password hashing
- Configurable cost factor
- Protection against rainbow tables

**Helmet.js**
- Security headers
- XSS protection
- Content Security Policy

**Rate Limiting**
- Prevent API abuse
- DDoS protection
- Fair resource usage

## Design Decisions

### 1. Async Evaluation Processing

**Decision**: Evaluate answers asynchronously after submission

**Rationale**:
- OpenAI API calls can take 2-5 seconds
- Better UX - don't block user from continuing
- Allows for retry logic if evaluation fails
- Can batch evaluations if needed

**Trade-offs**:
- Requires polling mechanism on frontend
- Slightly more complex state management
- Eventual consistency for feedback

### 2. Question Caching

**Decision**: Cache generated questions in Redis

**Rationale**:
- Reduce OpenAI API costs
- Faster response times
- Similar questions can be reused
- 1-hour TTL balances freshness vs. cost

**Trade-offs**:
- Questions may be less unique
- Cache storage overhead
- Need cache invalidation strategy

### 3. PostgreSQL JSONB for Question Data

**Decision**: Store flexible question metadata in JSONB

**Rationale**:
- Different question types have different structures
- Easy to extend without schema changes
- PostgreSQL JSONB is performant
- Supports querying within JSON

**Trade-offs**:
- Less type safety
- Harder to validate structure
- Potential for inconsistent data

### 4. RESTful API Design

**Decision**: Use RESTful principles over GraphQL

**Rationale**:
- Simpler to implement and understand
- Better caching support
- Standard HTTP methods
- Easier documentation

**Trade-offs**:
- More endpoints to manage
- Potential over-fetching
- Multiple round trips for complex data

### 5. Single Page Application (SPA)

**Decision**: Build React SPA instead of server-rendered

**Rationale**:
- Better user experience
- Faster navigation
- Modern development workflow
- Easier to deploy (static hosting)

**Trade-offs**:
- SEO challenges (not critical for this app)
- Initial load time
- Requires client-side routing

## Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: All instances can handle any request
- **Database Connection Pooling**: Efficient connection management
- **Redis for Shared State**: Session state accessible across instances
- **Load Balancing**: Distribute traffic across instances

### Database Optimization

- **Indexes**: Strategic indexes on frequently queried columns
- **Read Replicas**: Scale read operations
- **Query Optimization**: Efficient queries with proper joins
- **Connection Pooling**: Reuse database connections

### Caching Strategy

- **Multi-Level Caching**: Redis + application-level caching
- **Cache Warming**: Pre-populate common questions
- **Cache Invalidation**: Smart invalidation policies

### AI API Optimization

- **Question Caching**: Reduce API calls
- **Batch Processing**: Group evaluations when possible
- **Fallback Questions**: Reduce dependency on external API
- **Rate Limiting**: Respect API limits

## Monitoring & Observability

### Metrics to Track

- API response times
- Error rates
- OpenAI API usage and costs
- Database query performance
- Cache hit rates
- Active user sessions

### Logging

- Structured logging with context
- Error tracking and alerting
- Request/response logging (dev only)
- Performance logging

### Health Checks

- Database connectivity
- Redis connectivity
- OpenAI API availability
- Overall system health endpoint

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live feedback
2. **Video Recording**: Record interview sessions for review
3. **Peer Review**: Allow users to review each other's answers
4. **Question Bank**: Pre-generated question database
5. **Multi-language Support**: Support for different programming languages
6. **Mobile App**: Native mobile application
7. **Advanced Analytics**: ML-based insights and recommendations

---

**Note**: This system design balances functionality, performance, and cost while maintaining code simplicity and developer experience.

