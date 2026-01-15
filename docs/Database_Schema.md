# 🗄️ AI Interview Coach - Database Schema

## Overview

The database uses PostgreSQL with a relational schema designed for scalability and performance. This document describes the database structure, relationships, and design decisions.

## Database: `interview_coach`

## Tables

### 1. `users`

Stores user account information and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email` (implicit from UNIQUE constraint)

**Relationships:**
- One-to-many with `interview_sessions`

---

### 2. `interview_sessions`

Tracks interview sessions created by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique session identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) | Owner of the session |
| `type` | VARCHAR(50) | NOT NULL, CHECK IN ('technical', 'behavioral', 'system-design') | Interview type |
| `duration_minutes` | INTEGER | NOT NULL, CHECK BETWEEN 30 AND 60 | Session duration |
| `difficulty` | VARCHAR(20) | NOT NULL, CHECK IN ('easy', 'medium', 'hard') | Difficulty level |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'in_progress', CHECK IN ('in_progress', 'completed', 'abandoned') | Session status |
| `overall_score` | DECIMAL(5,2) | CHECK BETWEEN 0 AND 10 | Average score across all questions |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Session creation timestamp |
| `completed_at` | TIMESTAMP WITH TIME ZONE | NULL | Session completion timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_sessions_user_id` on user_id`
- `idx_sessions_status` on `status`
- `idx_sessions_created_at` on `created_at`

**Relationships:**
- Many-to-one with `users`
- One-to-many with `interview_questions`
- One-to-many with `interview_answers`
- One-to-many with `answer_evaluations`

---

### 3. `interview_questions`

Stores questions generated for each interview session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique question identifier |
| `session_id` | UUID | NOT NULL, FOREIGN KEY → interview_sessions(id) | Parent session |
| `question_text` | TEXT | NOT NULL | The question text |
| `question_type` | VARCHAR(50) | NOT NULL | Type of question (matches session type) |
| `difficulty` | VARCHAR(20) | NOT NULL | Difficulty level |
| `question_data` | JSONB | NULL | Flexible metadata (hints, examples, etc.) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Question creation timestamp |

**Indexes:**
- `idx_questions_session_id` on `session_id`

**Relationships:**
- Many-to-one with `interview_sessions`
- One-to-many with `interview_answers`
- One-to-many with `answer_evaluations`

**JSONB Structure Example:**
```json
{
  "hints": ["Consider time complexity", "Think about edge cases"],
  "examples": ["Input: [1,2,3], Output: [3,2,1]"],
  "metadata": {
    "generatedAt": "2024-01-01T00:00:00Z",
    "isFallback": false
  }
}
```

---

### 4. `interview_answers`

Stores user answers to interview questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique answer identifier |
| `session_id` | UUID | NOT NULL, FOREIGN KEY → interview_sessions(id) | Parent session |
| `question_id` | UUID | NOT NULL, FOREIGN KEY → interview_questions(id) | The question being answered |
| `answer_text` | TEXT | NOT NULL | User's answer text |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Answer submission timestamp |

**Indexes:**
- `idx_answers_session_id` on `session_id`
- `idx_answers_question_id` on `question_id`

**Relationships:**
- Many-to-one with `interview_sessions`
- Many-to-one with `interview_questions`
- One-to-one with `answer_evaluations`

---

### 5. `answer_evaluations`

Stores AI-generated evaluations and feedback for answers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique evaluation identifier |
| `session_id` | UUID | NOT NULL, FOREIGN KEY → interview_sessions(id) | Parent session |
| `question_id` | UUID | NOT NULL, FOREIGN KEY → interview_questions(id) | The question evaluated |
| `answer_id` | UUID | NOT NULL, FOREIGN KEY → interview_answers(id) | The answer evaluated |
| `score` | DECIMAL(5,2) | NOT NULL, CHECK BETWEEN 0 AND 10 | Numerical score (0-10) |
| `feedback_text` | TEXT | NOT NULL | Detailed feedback text |
| `strengths` | JSONB | NULL | Array of identified strengths |
| `improvements` | JSONB | NULL | Array of suggested improvements |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Evaluation timestamp |

**Indexes:**
- `idx_evaluations_session_id` on `session_id`
- `idx_evaluations_question_id` on `question_id`
- `idx_evaluations_answer_id` on `answer_id`

**Relationships:**
- Many-to-one with `interview_sessions`
- Many-to-one with `interview_questions`
- One-to-one with `interview_answers`

**JSONB Structure Examples:**

`strengths`:
```json
["Clear problem-solving approach", "Good code structure", "Handles edge cases"]
```

`improvements`:
```json
["Consider time complexity optimization", "Add more comments", "Handle null inputs"]
```

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ name        │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌─────────────────────┐
│ interview_sessions  │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │──┐
│ type                │  │
│ duration_minutes    │  │
│ difficulty          │  │
│ status              │  │
│ overall_score       │  │
└──────┬──────────────┘  │
       │                 │
       │ 1:N             │ 1:N
       │                 │
       ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│interview_questions│  │ interview_answers│
│──────────────────│  │──────────────────│
│ id (PK)          │  │ id (PK)          │
│ session_id (FK)  │  │ session_id (FK)  │
│ question_text    │  │ question_id (FK) │
│ question_type    │◄─┤ answer_text      │
│ difficulty       │  └──────┬───────────┘
│ question_data    │         │
└──────────────────┘         │ 1:1
                              │
                              ▼
                    ┌─────────────────────┐
                    │answer_evaluations   │
                    │─────────────────────│
                    │ id (PK)            │
                    │ session_id (FK)    │
                    │ question_id (FK)   │
                    │ answer_id (FK)     │
                    │ score              │
                    │ feedback_text      │
                    │ strengths          │
                    │ improvements       │
                    └─────────────────────┘
```

## Design Decisions

### 1. UUID Primary Keys

**Decision**: Use UUIDs instead of auto-incrementing integers

**Rationale**:
- Globally unique identifiers
- Better for distributed systems
- No sequential ID exposure
- Easier to merge data from multiple sources

**Trade-offs**:
- Slightly larger storage (16 bytes vs 4-8 bytes)
- Slightly slower index performance
- Not human-readable

### 2. JSONB for Flexible Data

**Decision**: Use JSONB for `question_data`, `strengths`, and `improvements`

**Rationale**:
- Different question types have different structures
- Easy to extend without schema changes
- PostgreSQL JSONB is performant and queryable
- Supports nested data structures

**Trade-offs**:
- Less type safety
- Harder to validate structure
- Potential for inconsistent data

### 3. Separate Tables for Questions, Answers, and Evaluations

**Decision**: Normalize into separate tables

**Rationale**:
- Clear separation of concerns
- Easy to query each entity independently
- Supports one-to-many relationships (multiple evaluations per answer in future)
- Better data integrity

**Trade-offs**:
- More joins required for complete data
- Slightly more complex queries

### 4. Timestamps with Time Zone

**Decision**: Use `TIMESTAMP WITH TIME ZONE`

**Rationale**:
- Handles timezone conversions automatically
- Important for global applications
- PostgreSQL best practice
- Accurate timestamp storage

### 5. Check Constraints

**Decision**: Use CHECK constraints for enums

**Rationale**:
- Data integrity at database level
- Prevents invalid values
- Self-documenting schema
- Better than application-level validation alone

### 6. Cascading Deletes

**Decision**: Use `ON DELETE CASCADE` for foreign keys

**Rationale**:
- Automatic cleanup of related data
- Prevents orphaned records
- Simplifies deletion logic

**Trade-offs**:
- Must be careful with deletions
- Could accidentally delete more than intended

## Indexes Strategy

### Primary Indexes
- All primary keys are automatically indexed

### Foreign Key Indexes
- All foreign keys are indexed for join performance

### Query Optimization Indexes
- `interview_sessions(user_id)` - Fast user session lookup
- `interview_sessions(status)` - Filter by status
- `interview_sessions(created_at)` - Time-based queries
- `interview_questions(session_id)` - Session questions lookup
- `interview_answers(session_id, question_id)` - Answer lookup
- `answer_evaluations(session_id, question_id)` - Evaluation lookup

## Query Patterns

### Common Queries

**Get user's recent sessions:**
```sql
SELECT * FROM interview_sessions 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20;
```

**Get session with questions and answers:**
```sql
SELECT 
  s.*,
  json_agg(DISTINCT q.*) as questions,
  json_agg(DISTINCT a.*) as answers
FROM interview_sessions s
LEFT JOIN interview_questions q ON s.id = q.session_id
LEFT JOIN interview_answers a ON s.id = a.session_id
WHERE s.id = $1
GROUP BY s.id;
```

**Calculate average score by question type:**
```sql
SELECT 
  q.question_type,
  AVG(e.score) as avg_score,
  COUNT(*) as count
FROM answer_evaluations e
JOIN interview_questions q ON e.question_id = q.id
JOIN interview_sessions s ON e.session_id = s.id
WHERE s.user_id = $1
GROUP BY q.question_type;
```

## Migration Strategy

### Version Control
- Schema changes are tracked in migration files
- Each migration is idempotent (can be run multiple times safely)
- Migrations are versioned and timestamped

### Example Migration
```sql
-- Migration: 001_initial_schema.sql
-- Creates all tables and indexes
```

## Performance Considerations

### Connection Pooling
- Use connection pooling (pg-pool) to manage database connections
- Default pool size: 20 connections
- Idle timeout: 30 seconds

### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Monitor query performance
- Add indexes based on query patterns
- Use prepared statements for repeated queries

### Data Archival
- Consider archiving old sessions (> 1 year) to separate table
- Maintain active data in primary tables
- Archive strategy: Move to `interview_sessions_archive` table

## Backup & Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Backup retention: 30 days

### Recovery Procedures
1. Restore from latest backup
2. Apply any pending migrations
3. Verify data integrity
4. Test application functionality

---

**Last Updated**: 2024-01-01

