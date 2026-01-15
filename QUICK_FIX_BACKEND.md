# Quick Fix: Backend Connection Error

## Problem
"Unable to connect to server. Please ensure the backend is running on http://localhost:5001"

## Root Cause
Port 5001 was already in use by a stuck/crashed Node.js process (PID 92458).

## Solution Applied
✅ Killed the stuck process on port 5001

## Next Steps - Start Backend Properly

### 1. Navigate to Backend Directory
```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach/backend
```

### 2. Check Environment Variables
Make sure you have a `.env` file with at minimum:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-secret-key-here
PORT=5001
```

### 3. Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
🚀 AI Interview Coach API running on port 5001
📊 Environment: development
🔗 Health check: http://localhost:5001/health
✅ PostgreSQL connected
```

### 4. Verify Backend is Running
Open a new terminal and test:
```bash
curl http://localhost:5001/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","service":"AI Interview Coach API"}
```

### 5. Start Frontend (in a new terminal)
```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach/frontend
npm run dev
```

### 6. Test in Browser
- Open http://localhost:5173
- The connection error should be gone
- Try logging in or making an API call

## Why This Happened

**Common reasons:**
1. Backend crashed but process didn't exit
2. Backend was started multiple times
3. Terminal was closed without stopping the server
4. System crash/restart left zombie process

## Prevention

**Always stop backend properly:**
- Press `Ctrl+C` in the terminal running backend
- Or use: `kill $(lsof -ti:5001)` before starting

**Check before starting:**
```bash
# Check if port is in use
lsof -i:5001

# If something is using it, kill it
kill -9 $(lsof -ti:5001)
```

## If Backend Still Won't Start

1. **Check database connection:**
   ```bash
   # Make sure PostgreSQL is running
   brew services list | grep postgresql
   ```

2. **Check for missing dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Check for errors in terminal:**
   - Look for red error messages
   - Common issues: Database connection, missing env vars

4. **See full troubleshooting guide:**
   - Check `BACKEND_CONNECTION_FIX.md` for detailed solutions


