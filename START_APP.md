# 🚀 How to Start the Application

## ⚠️ Important: You Need TWO Terminals!

The application has **separate backend and frontend** - you need to run them in **different terminals**.

---

## Step-by-Step: Starting the App

### Terminal 1: Start Backend

```bash
# Navigate to backend folder
cd AI_Interview_Coach/backend

# Start the backend server
npm run dev
```

**You should see:**
```
🚀 AI Interview Coach API running on port 5001
📊 Environment: development
🔗 Health check: http://localhost:5001/health
✅ PostgreSQL connected
✅ Redis connected
```

**✅ Keep this terminal open!**

---

### Terminal 2: Start Frontend (NEW TERMINAL WINDOW)

**Open a NEW terminal window** (keep Terminal 1 running!)

```bash
# Navigate to frontend folder
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

## ✅ Verify It's Working

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Open Browser:**
   Go to: **http://localhost:5173**

---

## 🛑 Common Mistake

**❌ DON'T DO THIS:**
```bash
cd AI_Interview_Coach
npm run dev  # ❌ This won't work - no package.json here!
```

**✅ DO THIS INSTEAD:**
```bash
# Terminal 1
cd AI_Interview_Coach/backend
npm run dev

# Terminal 2 (NEW WINDOW)
cd AI_Interview_Coach/frontend
npm run dev
```

---

## 📋 Quick Reference

| What | Command | Terminal |
|------|---------|----------|
| Start Backend | `cd backend && npm run dev` | Terminal 1 |
| Start Frontend | `cd frontend && npm run dev` | Terminal 2 |
| Stop Backend | Press `Ctrl+C` | Terminal 1 |
| Stop Frontend | Press `Ctrl+C` | Terminal 2 |

---

## 🔧 If You Get Errors

### "Cannot find module"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Port already in use"
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill
```

### "Database connection failed"
```bash
# Make sure PostgreSQL is running
brew services start postgresql@14

# Make sure Redis is running
brew services start redis
```

---

## 🎯 Summary

1. **Terminal 1:** `cd backend && npm run dev` → Backend runs on port 5001
2. **Terminal 2:** `cd frontend && npm run dev` → Frontend runs on port 5173
3. **Browser:** Open http://localhost:5173

**Both terminals must stay open while using the app!**

---

**That's it! Follow these steps and your app will start correctly.** 🎉


