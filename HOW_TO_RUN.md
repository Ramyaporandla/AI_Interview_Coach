# 🚀 How to Run AI Interview Coach - Simple Guide

## Visual Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│                    START HERE                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Start Services                                  │
│                                                          │
│ Terminal:                                                │
│   brew services start postgresql                         │
│   brew services start redis                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Create Database                                  │
│                                                          │
│ Terminal:                                                │
│   psql -U postgres                                       │
│                                                          │
│ Then run:                                                │
│   CREATE DATABASE interview_coach;                      │
│   CREATE USER interview_user WITH PASSWORD 'password123';│
│   GRANT ALL PRIVILEGES ON DATABASE interview_coach...;  │
│   \q                                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Setup Backend                                    │
│                                                          │
│ Terminal:                                                │
│   cd backend                                             │
│   npm install                                            │
│                                                          │
│ Create: backend/.env file                                │
│   (Copy from QUICK_START.md)                             │
│                                                          │
│ Then:                                                    │
│   npm run migrate                                        │
│   npm run dev                                            │
│                                                          │
│ ✅ Keep this terminal open!                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Setup Frontend (NEW TERMINAL)                   │
│                                                          │
│ Open NEW Terminal:                                       │
│   cd frontend                                            │
│   npm install                                            │
│                                                          │
│ Create: frontend/.env file                               │
│   VITE_API_URL=http://localhost:3000/api                 │
│                                                          │
│ Then:                                                    │
│   npm run dev                                            │
│                                                          │
│ ✅ Keep this terminal open too!                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Open Browser                                     │
│                                                          │
│ Go to: http://localhost:5173                            │
│                                                          │
│ ✅ You should see the login page!                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Commands

### Terminal 1: Backend Setup

```bash
# 1. Navigate to backend
cd AI_Interview_Coach/backend

# 2. Install packages
npm install

# 3. Create .env file (see below)

# 4. Create database tables
npm run migrate

# 5. Start backend server
npm run dev
```

**Create `backend/.env`:**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://interview_user:password123@localhost:5432/interview_coach
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-random-secret-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

---

### Terminal 2: Frontend Setup

```bash
# 1. Navigate to frontend
cd AI_Interview_Coach/frontend

# 2. Install packages
npm install

# 3. Create .env file (see below)

# 4. Start frontend server
npm run dev
```

**Create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ✅ Success Indicators

### Backend Terminal Should Show:
```
🚀 AI Interview Coach API running on port 3000
✅ PostgreSQL connected
✅ Redis connected
```

### Frontend Terminal Should Show:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Browser Should Show:
- Login/Register page at http://localhost:5173

---

## 🔴 Common Mistakes

1. **❌ Forgetting to start PostgreSQL/Redis first**
   - ✅ Always start services before backend

2. **❌ Not creating .env files**
   - ✅ Both backend and frontend need .env files

3. **❌ Running everything in one terminal**
   - ✅ Backend and frontend need separate terminals

4. **❌ Closing terminals while app is running**
   - ✅ Keep both terminals open

5. **❌ Wrong folder paths**
   - ✅ Make sure you're in the right directory

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `lsof -ti:3000 | xargs kill` |
| Database error | Check PostgreSQL is running: `brew services list` |
| Redis error | Check Redis: `redis-cli ping` (should return PONG) |
| Frontend can't connect | Check backend is running and check .env files |

---

## 📚 More Help

- **Detailed Setup**: See [SETUP.md](./SETUP.md)
- **Quick Reference**: See [QUICK_START.md](./QUICK_START.md)
- **Project Info**: See [README.md](./README.md)

---

**That's it! Follow the steps above and you'll have it running! 🎉**



