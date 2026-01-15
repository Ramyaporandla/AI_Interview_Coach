# 🔧 Troubleshooting Common Errors

## Quick Error Fixes

### 1. "Cannot find module" or Import Errors

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend  
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### 2. "Port already in use"

**Solution:**
```bash
# Find and kill process using port
lsof -ti:5001 | xargs kill
# Or change PORT in backend/.env
```

---

### 3. "Database connection failed"

**Check:**
```bash
# Verify PostgreSQL is running
brew services list | grep postgresql

# Test connection
psql -U interview_user -d interview_coach -c "SELECT 1;"

# If fails, restart PostgreSQL
brew services restart postgresql@14
```

---

### 4. "Redis connection failed"

**Solution:**
```bash
# Check Redis
redis-cli ping
# Should return: PONG

# If not, start Redis
brew services start redis
```

---

### 5. "OpenAI API Error" or "Quota Exceeded"

**Good News:** The app now has a **fallback evaluation system** that works without OpenAI!

**What happens:**
- If OpenAI fails, it automatically uses rule-based evaluation
- You still get scores, feedback, strengths, and improvements
- No API credits needed for demo/portfolio

**To fix OpenAI (optional):**
1. Go to https://platform.openai.com/account/billing
2. Add payment method and credits
3. Restart backend

---

### 6. "Evaluation error" or "Evaluation pending"

**Check backend terminal** for specific errors:
- Look for error messages
- Check if fallback evaluation is being used
- Verify database is working

**Solution:**
- Restart backend: `cd backend && npm run dev`
- The fallback system should work automatically

---

### 7. Frontend Build Errors

**Solution:**
```bash
cd frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

---

### 8. "Route not found" or 404 Errors

**Check:**
- Backend is running on correct port (check `.env`)
- Frontend `.env` has correct `VITE_API_URL`
- Routes match between frontend and backend

---

### 9. Authentication Errors

**Solution:**
```bash
# Clear browser localStorage
# Or in browser console:
localStorage.clear()
# Then refresh and login again
```

---

### 10. Syntax Errors in Code

**Check:**
```bash
# Backend syntax check
cd backend
node -c src/services/evaluation.service.js

# Frontend - check browser console (F12)
```

---

## Most Common Issues

### Issue: Backend won't start

**Check:**
1. Node.js version: `node --version` (need 18+)
2. Dependencies installed: `cd backend && npm install`
3. Environment variables: Check `.env` file exists
4. Port available: `lsof -ti:5001`

### Issue: Frontend won't start

**Check:**
1. Dependencies: `cd frontend && npm install`
2. Port available: Vite will auto-use next port
3. Backend running: Frontend needs backend to be up

### Issue: Database errors

**Check:**
1. PostgreSQL running: `brew services list`
2. Database exists: `psql -U interview_user -d interview_coach`
3. Migrations run: `cd backend && npm run migrate`

---

## Quick Reset (Nuclear Option)

If nothing works:

```bash
# 1. Stop everything
brew services stop postgresql
brew services stop redis

# 2. Clean node modules
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json

# 3. Restart services
brew services start postgresql@14
brew services start redis

# 4. Reinstall
cd backend && npm install
cd ../frontend && npm install

# 5. Run migrations
cd backend && npm run migrate

# 6. Start servers
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

---

## Getting Help

**To get help, please provide:**
1. **Exact error message** (copy/paste)
2. **Where it happens** (backend terminal, browser console, UI)
3. **What you were doing** when error occurred
4. **Backend terminal output** (last 20 lines)

**Check these locations:**
- Backend terminal (for API errors)
- Browser console (F12 → Console tab)
- Network tab (F12 → Network tab) for failed requests

---

**Most errors are fixed by:**
1. Restarting backend
2. Restarting frontend  
3. Checking .env files
4. Verifying services are running


