# ⚡ Quick Start - Execute AI Interview Coach

## 🎯 Simple Execution Guide

Follow these steps **in order**. Each step must complete successfully before moving to the next.

---

## STEP 1: Check Prerequisites

Open terminal and check if you have everything:

```bash
node --version    # Should show v18 or higher
npm --version     # Should show version number
psql --version    # Should show PostgreSQL version
redis-cli --version  # Should show Redis version
```

**If something is missing:**
- **Node.js**: Download from https://nodejs.org/
- **PostgreSQL**: Install with `brew install postgresql@14` (macOS)
- **Redis**: Install with `brew install redis` (macOS)
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys

---

## STEP 2: Start PostgreSQL Database

```bash
# Start PostgreSQL service
brew services start postgresql
```

**Verify it's running:**
```bash
psql -U postgres -c "SELECT version();"
```

---

## STEP 3: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres
```

**Then copy and paste these commands one by one:**

```sql
CREATE DATABASE interview_coach;
CREATE USER interview_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE interview_coach TO interview_user;
\q
```

**Verify database was created:**
```bash
psql -U interview_user -d interview_coach -c "SELECT current_database();"
```

---

## STEP 4: Start Redis

```bash
# Start Redis service
brew services start redis
```

**Verify it's running:**
```bash
redis-cli ping
```
Should return: `PONG`

---

## STEP 5: Setup Backend

```bash
# Navigate to backend folder
cd AI_Interview_Coach/backend

# Install dependencies (this may take a minute)
npm install
```

**Create `.env` file:**

Create a file named `.env` in the `backend/` folder with this content:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://interview_user:password123@localhost:5432/interview_coach
REDIS_URL=redis://localhost:6379

JWT_SECRET=change-this-to-a-random-secret-key-at-least-32-characters-long
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Important:** 
- Replace `JWT_SECRET` with a random string (or generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Replace `OPENAI_API_KEY` with your actual OpenAI API key (starts with `sk-`)

---

## STEP 6: Create Database Tables

```bash
# Make sure you're in backend folder
cd AI_Interview_Coach/backend

# Run migrations to create tables
npm run migrate
```

**You should see:** `✅ Database migrations completed successfully`

---

## STEP 7: Start Backend Server

```bash
# Make sure you're in backend folder
cd AI_Interview_Coach/backend

# Start the server
npm run dev
```

**You should see:**
```
🚀 AI Interview Coach API running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/health
✅ PostgreSQL connected
✅ Redis connected
```

**✅ Keep this terminal window open!** The backend must keep running.

---

## STEP 8: Setup Frontend (NEW TERMINAL WINDOW)

**Open a NEW terminal window** (keep the backend terminal running!)

```bash
# Navigate to frontend folder
cd AI_Interview_Coach/frontend

# Install dependencies
npm install
```

**Create `.env` file:**

Create a file named `.env` in the `frontend/` folder with this content:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## STEP 9: Start Frontend Server

```bash
# Make sure you're in frontend folder
cd AI_Interview_Coach/frontend

# Start the frontend server
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## STEP 10: Open Application in Browser

Open your web browser and go to:

**http://localhost:5173**

You should see the login/register page!

---

## ✅ Verify Everything Works

1. **Test Backend:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Test Frontend:**
   - Go to http://localhost:5173
   - You should see login/register page

3. **Test Registration:**
   - Click "Register"
   - Enter email, password, name
   - Click "Register"
   - You should be redirected to dashboard

---

## 🛑 How to Stop

1. **Stop Frontend:** In frontend terminal, press `Ctrl+C`
2. **Stop Backend:** In backend terminal, press `Ctrl+C`
3. **Stop Services (optional):**
   ```bash
   brew services stop postgresql
   brew services stop redis
   ```

---

## 🔧 Common Problems & Solutions

### Problem: "Port 3000 already in use"
**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill
# Then try starting backend again
```

### Problem: "Cannot connect to database"
**Solution:**
1. Check PostgreSQL is running: `brew services list | grep postgresql`
2. Verify database exists: `psql -U interview_user -d interview_coach`
3. Check your `.env` file has correct `DATABASE_URL`

### Problem: "Redis connection failed"
**Solution:**
1. Check Redis is running: `redis-cli ping` (should return PONG)
2. If not running: `brew services start redis`

### Problem: "OpenAI API error"
**Solution:**
1. Verify API key in `backend/.env` starts with `sk-`
2. Check you have credits: https://platform.openai.com/account/usage
3. Make sure API key is correct (no extra spaces)

### Problem: Frontend shows "Network Error"
**Solution:**
1. Make sure backend is running (check terminal 1)
2. Verify `VITE_API_URL` in `frontend/.env` is `http://localhost:3000/api`
3. Check backend terminal for any errors

---

## 📋 Quick Checklist

Before starting, make sure you have:
- [ ] Node.js installed
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] OpenAI API key
- [ ] Database created
- [ ] Backend `.env` file created
- [ ] Frontend `.env` file created
- [ ] Database migrations run

---

## 🎯 What You Should See

**Terminal 1 (Backend):**
```
🚀 AI Interview Coach API running on port 3000
✅ PostgreSQL connected
✅ Redis connected
```

**Terminal 2 (Frontend):**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Browser:**
- Login/Register page at http://localhost:5173

---

## 💡 Tips

1. **Keep both terminals open** - Backend and Frontend must run simultaneously
2. **Check terminal output** - Errors will show in the terminal
3. **Start services first** - PostgreSQL and Redis must be running before starting backend
4. **Check .env files** - Make sure both `.env` files exist and have correct values

---

**Need more help?** See [SETUP.md](./SETUP.md) for detailed instructions.

**Happy Coding! 🚀**
