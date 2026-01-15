# Backend Connection Error - Troubleshooting Guide

## Error Message
"Unable to connect to server. Please ensure the backend is running on http://localhost:5001"

## Common Causes & Solutions

### 1. **Backend Server Not Running** ⚠️ MOST COMMON

**Check if backend is running:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 AI Interview Coach API running on port 5001
📊 Environment: development
🔗 Health check: http://localhost:5001/health
✅ PostgreSQL connected
```

**If you see errors:**
- Check database connection (see #2)
- Check environment variables (see #3)
- Check if port is already in use (see #4)

---

### 2. **Port 5001 Already in Use** 🔴 CURRENT ISSUE

**Check what's using port 5001:**
```bash
lsof -i:5001
```

**Kill processes using port 5001:**
```bash
# Find the process ID (PID)
lsof -ti:5001

# Kill the process(es)
kill -9 $(lsof -ti:5001)

# Or kill specific PIDs (replace with actual PIDs from lsof output)
kill -9 3151 92458
```

**Then restart backend:**
```bash
cd backend
npm run dev
```

---

### 3. **Database Connection Error**

**Required environment variables:**
Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret (required for auth)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional
PORT=5001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Redis (optional, only if using Redis)
REDIS_URL=redis://localhost:6379

# Email (optional, only if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OpenAI (optional, only if using AI features)
OPENAI_API_KEY=your-openai-api-key
```

**Check PostgreSQL is running:**
```bash
# macOS (using Homebrew)
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql

# Or check if it's running
ps aux | grep postgres
```

**Test database connection:**
```bash
cd backend
node -e "import('./src/db/connection.js').then(() => console.log('DB OK')).catch(e => console.error('DB Error:', e))"
```

---

### 4. **Frontend Proxy Configuration**

**Check `frontend/vite.config.js`:**
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    },
  },
}
```

**If proxy doesn't work, use direct URL:**
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

### 5. **CORS Issues**

**Backend CORS is configured in `backend/src/server.js`:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**If you're using a different frontend URL, set:**
```env
FRONTEND_URL=http://localhost:5173
```

---

### 6. **Network/Firewall Issues**

**Test backend directly:**
```bash
# In browser or terminal
curl http://localhost:5001/health

# Should return:
# {"status":"healthy","timestamp":"...","service":"AI Interview Coach API"}
```

**If curl fails:**
- Backend is not running or not accessible
- Check firewall settings
- Check if port 5001 is blocked

---

## Step-by-Step Fix

### Quick Fix (Most Common Issue)

1. **Kill processes on port 5001:**
   ```bash
   kill -9 $(lsof -ti:5001)
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify backend is running:**
   ```bash
   curl http://localhost:5001/health
   ```

4. **Start frontend (in new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Test in browser:**
   - Open http://localhost:5173
   - Try logging in or making an API call
   - Check browser console for errors

---

## Complete Startup Checklist

- [ ] PostgreSQL is running
- [ ] Database schema is created (run `npm run migrate` in backend)
- [ ] `.env` file exists in `backend/` with `DATABASE_URL` and `JWT_SECRET`
- [ ] Port 5001 is not in use (check with `lsof -i:5001`)
- [ ] Backend starts without errors (`npm run dev` in backend)
- [ ] Health check works (`curl http://localhost:5001/health`)
- [ ] Frontend starts without errors (`npm run dev` in frontend)
- [ ] Browser can access frontend (http://localhost:5173)
- [ ] Network requests in browser DevTools show `/api/*` calls

---

## Debugging Commands

**Check if backend is running:**
```bash
ps aux | grep "node.*server.js"
```

**Check port usage:**
```bash
lsof -i:5001
netstat -an | grep 5001
```

**Test backend health:**
```bash
curl http://localhost:5001/health
```

**Check backend logs:**
Look at the terminal where you ran `npm run dev` - it should show:
- Server startup message
- Database connection status
- Request logs (if using morgan)

**Check frontend network requests:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try making an API call
4. Check if request shows:
   - Status: Failed / ERR_CONNECTION_REFUSED → Backend not running
   - Status: 404 → Route not found (check backend routes)
   - Status: 500 → Backend error (check backend logs)
   - Status: 200 → Success! ✅

---

## Common Error Messages & Solutions

### "ECONNREFUSED" or "ERR_CONNECTION_REFUSED"
- **Cause:** Backend is not running
- **Fix:** Start backend with `npm run dev` in backend directory

### "Port 5001 is already in use"
- **Cause:** Another process is using port 5001
- **Fix:** Kill the process: `kill -9 $(lsof -ti:5001)`

### "Database connection error"
- **Cause:** PostgreSQL not running or wrong DATABASE_URL
- **Fix:** 
  1. Start PostgreSQL: `brew services start postgresql`
  2. Check DATABASE_URL in `.env` file
  3. Test connection

### "JWT_SECRET is not defined"
- **Cause:** Missing JWT_SECRET in `.env`
- **Fix:** Add `JWT_SECRET=your-secret-key` to `.env`

### CORS errors in browser console
- **Cause:** Frontend URL not allowed in CORS
- **Fix:** Set `FRONTEND_URL=http://localhost:5173` in backend `.env`

---

## Still Having Issues?

1. **Check backend terminal for errors**
2. **Check browser console for detailed error messages**
3. **Verify all environment variables are set**
4. **Ensure both frontend and backend are running**
5. **Try restarting both servers**

---

## Quick Test Script

Run this to check everything:

```bash
#!/bin/bash
echo "Checking backend connection..."

# Check if port is in use
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port 5001 is in use (backend might be running)"
    # Test health endpoint
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ Backend is responding"
    else
        echo "❌ Backend is not responding - kill and restart"
        kill -9 $(lsof -ti:5001)
    fi
else
    echo "❌ Port 5001 is not in use - backend is not running"
    echo "Start backend with: cd backend && npm run dev"
fi
```


