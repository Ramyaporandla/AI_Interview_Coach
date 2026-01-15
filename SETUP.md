# 🚀 AI Interview Coach - Setup Guide

Complete setup instructions for running the AI Interview Coach application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Redis** 6+ ([Download](https://redis.io/download))
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Verify Installations

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
psql --version    # Should be 14.0 or higher
redis-cli --version  # Should be 6.0 or higher
```

## Step 1: Clone and Navigate

```bash
cd AI_Interview_Coach
```

## Step 2: Database Setup

### Create PostgreSQL Database

1. **Start PostgreSQL service:**
   ```bash
   # macOS (Homebrew)
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows (via Services)
   ```

2. **Create database:**
   ```bash
   psql -U postgres
   ```
   
   Then in PostgreSQL:
   ```sql
   CREATE DATABASE interview_coach;
   CREATE USER interview_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE interview_coach TO interview_user;
   \q
   ```

3. **Test connection:**
   ```bash
   psql -U interview_user -d interview_coach
   ```

### Run Database Migrations

```bash
cd backend
npm install
npm run migrate
```

This will create all necessary tables and indexes.

## Step 3: Redis Setup

### Start Redis Server

```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows
redis-server
```

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

## Step 4: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file:**
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Database - Update with your credentials
   DATABASE_URL=postgresql://interview_user:your_password@localhost:5432/interview_coach
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT - Generate a strong random secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   
   # OpenAI API - Get from https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

5. **Generate JWT Secret (optional but recommended):**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Start backend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 AI Interview Coach API running on port 3000
   📊 Environment: development
   🔗 Health check: http://localhost:3000/health
   ✅ PostgreSQL connected
   ✅ Redis connected
   ```

7. **Test backend:**
   ```bash
   curl http://localhost:3000/health
   ```

## Step 5: Frontend Setup

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   ```

4. **Start frontend development server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Open in browser:**
   Navigate to `http://localhost:5173`

## Step 6: Verify Installation

### Test the Application

1. **Register a new user:**
   - Go to `http://localhost:5173/register`
   - Fill in email, password, and name
   - Click "Register"

2. **Login:**
   - Go to `http://localhost:5173/login`
   - Enter your credentials
   - You should be redirected to the dashboard

3. **Start an interview:**
   - Click "Start New Interview"
   - Select type, duration, and difficulty
   - Answer questions and view feedback

### Check Backend Logs

You should see API requests in the backend terminal:
```
POST /api/auth/register 201
POST /api/auth/login 200
POST /api/interviews/start 201
```

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Ensure PostgreSQL is running: `brew services list` or `sudo systemctl status postgresql`
- Check connection string in `.env`
- Verify database exists: `psql -U interview_user -d interview_coach`

**Error: "password authentication failed"**
- Verify username and password in `DATABASE_URL`
- Check PostgreSQL user permissions

### Redis Connection Issues

**Error: "Redis connection failed"**
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`
- Try: `redis-cli` to test connection

### OpenAI API Issues

**Error: "Invalid API key"**
- Verify API key in `.env` starts with `sk-`
- Check API key is active at https://platform.openai.com/api-keys
- Ensure you have credits in your OpenAI account

**Error: "Rate limit exceeded"**
- OpenAI has rate limits on free tier
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan

### Port Already in Use

**Error: "Port 3000 already in use"**
- Change `PORT` in backend `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill`

**Error: "Port 5173 already in use"**
- Vite will automatically use the next available port
- Or specify: `npm run dev -- --port 5174`

### Frontend Can't Connect to Backend

**Error: "Network Error" or CORS issues**
- Verify `VITE_API_URL` in frontend `.env`
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Ensure backend is running on correct port

## Development Workflow

### Running Both Services

**Option 1: Two Terminals**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Use a Process Manager (Recommended)**
```bash
# Install concurrently
npm install -g concurrently

# From project root
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### Database Migrations

After schema changes:
```bash
cd backend
npm run migrate
```

### Resetting Database

```bash
# Drop and recreate
psql -U interview_user -d postgres -c "DROP DATABASE interview_coach;"
psql -U interview_user -d postgres -c "CREATE DATABASE interview_coach;"
cd backend
npm run migrate
```

## Production Setup

For production deployment, see the [Scalability Documentation](./docs/Scalability.md) and consider:

1. **Environment Variables:**
   - Use strong, unique secrets
   - Enable HTTPS
   - Configure proper CORS origins

2. **Database:**
   - Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
   - Enable SSL connections
   - Set up backups

3. **Redis:**
   - Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
   - Enable authentication
   - Configure persistence

4. **Security:**
   - Review [Security Documentation](./docs/Security.md)
   - Enable rate limiting
   - Set up monitoring and alerts

## Next Steps

- Read the [System Design](./docs/System_Design.md) documentation
- Review [API Design](./docs/API_Design.md) for endpoint details
- Check [Database Schema](./docs/Database_Schema.md) for data structure
- Understand [Security](./docs/Security.md) considerations
- Plan for [Scalability](./docs/Scalability.md)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in terminal/logs
3. Verify all prerequisites are installed correctly
4. Ensure environment variables are set correctly
5. Check that all services (PostgreSQL, Redis) are running

---

**Happy Coding! 🎉**

