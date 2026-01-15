# 🔧 Fix Your Errors - Quick Guide

## Issues Found & Fixed

### ✅ Fixed Issues:

1. **Frontend .env file** - ✅ Created
2. **Frontend node_modules** - ✅ Installing now

### ⚠️ Issues You Need to Fix:

1. **OpenAI API Key** - You have a placeholder key
2. **Port mismatch** - Backend uses port 5000, make sure frontend matches

---

## Quick Fixes

### Fix 1: Update OpenAI API Key

**Edit `backend/.env` file:**

Find this line:
```env
OPENAI_API_KEY=sk-PASTE_YOUR_REAL_KEY_HERE
```

Replace with your real key:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

**Get your key from:** https://platform.openai.com/api-keys

---

### Fix 2: Verify Port Configuration

**Backend .env has:**
```env
PORT=5000
```

**Frontend .env should match:**
```env
VITE_API_URL=http://localhost:5000/api
```

✅ Already fixed! Frontend .env now points to port 5000.

---

## Now Try Running Again

### Terminal 1 - Backend:
```bash
cd AI_Interview_Coach/backend
npm run dev
```

**Expected output:**
```
🚀 AI Interview Coach API running on port 5000
✅ PostgreSQL connected
✅ Redis connected
```

### Terminal 2 - Frontend:
```bash
cd AI_Interview_Coach/frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## If You Still Get Errors

### Error: "Cannot connect to database"

**Fix:**
```bash
# Test database connection
psql -U interview_user -d interview_coach -c "SELECT 1;"
```

If this fails, the database user might not have permissions. Run:
```bash
psql -U ramyaporandla -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE interview_coach TO interview_user;"
```

---

### Error: "Redis connection failed"

**Fix:**
```bash
# Check Redis
redis-cli ping
# Should return: PONG

# If not, start it
brew services start redis
```

---

### Error: "OpenAI API error"

**Fix:**
1. Make sure you updated `OPENAI_API_KEY` in `backend/.env`
2. Key should start with `sk-`
3. Check you have credits: https://platform.openai.com/account/usage

---

### Error: "Module not found"

**Fix:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Current Status

✅ **Working:**
- PostgreSQL running
- Redis running
- Database exists
- Database user exists
- Backend .env configured
- Frontend .env created
- Backend node_modules installed
- Frontend node_modules installing...

⚠️ **Needs Action:**
- Update OpenAI API key in `backend/.env`

---

## Test Everything

After fixing the OpenAI key, test:

```bash
# 1. Test backend
cd backend
npm run dev
# Should see: ✅ PostgreSQL connected, ✅ Redis connected

# 2. Test frontend (new terminal)
cd frontend
npm run dev
# Should see: VITE ready on http://localhost:5173/

# 3. Open browser
# Go to: http://localhost:5173
```

---

**Most common error:** Missing or invalid OpenAI API key. Make sure to update it in `backend/.env`!



