# 🔄 How to Restart Backend Properly

## Current Issue
Port 5001 is in use, preventing backend from starting.

## Quick Fix

### Step 1: Kill All Processes on Port 5001

```bash
# Find and kill processes
lsof -ti:5001 | xargs kill -9

# Or kill all node processes
pkill -9 node

# Verify port is free
lsof -ti:5001
# Should return nothing
```

### Step 2: Start Backend Fresh

```bash
cd AI_Interview_Coach/backend
npm run dev
```

### Step 3: Verify It's Running

You should see:
```
🚀 AI Interview Coach API running on port 5001
✅ PostgreSQL connected
✅ Redis connected
```

---

## If Port Still Won't Free

### Option 1: Change Port

Edit `backend/.env`:
```env
PORT=5002
```

Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5002/api
```

### Option 2: Restart Computer
Sometimes processes get stuck and need a full restart.

---

## Complete Clean Restart

```bash
# 1. Kill all node processes
pkill -9 node

# 2. Wait a moment
sleep 2

# 3. Start backend
cd AI_Interview_Coach/backend
npm run dev
```

---

**After restarting, the new evaluation code will be active and you'll get different feedback for different answers!**


