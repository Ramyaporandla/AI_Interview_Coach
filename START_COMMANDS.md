# 🚀 Correct Commands to Start the App

## ⚠️ DON'T Run From Root Directory!

**❌ WRONG:**
```bash
cd AI_Interview_Coach
npm run dev  # ❌ This fails - no package.json here!
```

## ✅ CORRECT: Run From Backend/Frontend Folders

You need **TWO separate terminals** - one for backend, one for frontend.

---

## Terminal 1: Backend

```bash
cd AI_Interview_Coach/backend
npm run dev
```

**Expected Output:**
```
🚀 AI Interview Coach API running on port 5001
📊 Environment: development
🔗 Health check: http://localhost:5001/health
✅ PostgreSQL connected
✅ Redis connected
```

**✅ Keep this terminal open!**

---

## Terminal 2: Frontend (NEW TERMINAL WINDOW)

**Open a NEW terminal window** (keep Terminal 1 running!)

```bash
cd AI_Interview_Coach/frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## ✅ Verify Both Are Running

1. **Backend:** http://localhost:5001/health
   - Should show: `{"status":"healthy"}`

2. **Frontend:** http://localhost:5173
   - Should show: Login page or landing page

---

## 📋 Quick Copy-Paste Commands

### Start Backend:
```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach/backend && npm run dev
```

### Start Frontend (in NEW terminal):
```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach/frontend && npm run dev
```

---

## 🎯 Summary

- **Backend** = `backend/` folder → Runs on port 5001
- **Frontend** = `frontend/` folder → Runs on port 5173
- **Root** = No `package.json` → Don't run npm commands here!

**Both must run simultaneously for the app to work!**


