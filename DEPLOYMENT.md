# 🚀 Deployment Guide - Live URL Setup

This guide will help you deploy your AI Interview Coach application to get a live URL.

## 📋 Prerequisites

- GitHub account (for version control)
- Vercel account (free) - for frontend
- Render account (free) - for backend + database
- OpenAI API key

---

## 🎯 Quick Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - **RECOMMENDED**

**Best for:** Full-stack apps with PostgreSQL
**Cost:** Free tier available
**Time:** ~30 minutes

### Option 2: Vercel (Frontend + Backend)

**Best for:** Simpler deployments
**Cost:** Free tier available
**Time:** ~20 minutes

### Option 3: Railway (Full Stack)

**Best for:** One-click deployments
**Cost:** Free tier available
**Time:** ~15 minutes

---

## 🚀 Option 1: Vercel + Render (Recommended)

### Step 1: Prepare Your Code

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ai-interview-coach.git
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render

1. **Go to Render:** https://render.com
2. **Sign up/Login** (free account)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name:** `ai-interview-coach-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** Leave empty (or set to `backend` if needed)

6. **Add Environment Variables:**
   ```
   PORT=10000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   DATABASE_URL=<will be provided by Render PostgreSQL>
   JWT_SECRET=<generate a random secret>
   OPENAI_API_KEY=sk-your-openai-key
   REDIS_URL=<optional, can skip for now>
   ```

7. **Click "Create Web Service"**
8. **Copy your backend URL** (e.g., `https://ai-interview-coach-backend.onrender.com`)

### Step 3: Set Up PostgreSQL on Render

1. **In Render Dashboard:** Click "New +" → "PostgreSQL"
2. **Configure:**
   - **Name:** `ai-interview-coach-db`
   - **Database:** `interview_coach`
   - **User:** Auto-generated
   - **Region:** Choose closest to you

3. **Copy the Internal Database URL**
4. **Update Backend Environment Variables:**
   - Go to your backend service → Environment
   - Update `DATABASE_URL` with the PostgreSQL URL

5. **Run Migrations:**
   - Go to backend service → Shell
   - Run: `cd backend && npm run migrate`

### Step 4: Deploy Frontend to Vercel

1. **Go to Vercel:** https://vercel.com
2. **Sign up/Login** (use GitHub)
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

7. **Click "Deploy"**
8. **Copy your frontend URL** (e.g., `https://ai-interview-coach.vercel.app`)

### Step 5: Update CORS Settings

1. **Go back to Render backend service**
2. **Update Environment Variables:**
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Redeploy backend** (Render will auto-redeploy)

---

## 🚀 Option 2: Vercel Full Stack (Simpler)

### Deploy Frontend

1. Follow **Step 4** from Option 1

### Deploy Backend as Vercel Serverless Functions

1. **Create `vercel.json` in root:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "backend/src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/src/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "frontend/$1"
       }
     ]
   }
   ```

2. **Note:** This requires converting Express routes to serverless functions (more complex)

---

## 🚀 Option 3: Railway (Easiest)

### Deploy Full Stack

1. **Go to Railway:** https://railway.app
2. **Sign up/Login** (use GitHub)
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "PostgreSQL"
6. **Add Redis (optional):**
   - Click "+ New" → "Database" → "Redis"
7. **Configure Backend Service:**
   - Click "+ New" → "GitHub Repo"
   - Select your repo
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
8. **Add Environment Variables:**
   ```
   PORT=${{PORT}}
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=<your-secret>
   OPENAI_API_KEY=sk-your-key
   FRONTEND_URL=https://your-app.railway.app
   ```
9. **Deploy Frontend:**
   - Add another service
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run preview`
   - **Environment Variable:**
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```

---

## 🔧 Post-Deployment Checklist

### ✅ Backend Health Check

Visit: `https://your-backend-url.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### ✅ Frontend Check

1. Visit your frontend URL
2. Try registering a new user
3. Check browser console for errors

### ✅ Database Connection

1. Check backend logs for: `✅ PostgreSQL connected`
2. If error, verify `DATABASE_URL` is correct

### ✅ CORS Issues

If you see CORS errors:
1. Update `FRONTEND_URL` in backend environment variables
2. Redeploy backend

---

## 🔐 Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=10000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app

# Database (provided by hosting service)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key

# Redis (optional)
REDIS_URL=redis://host:6379

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🐛 Troubleshooting

### Issue: Backend not connecting to database

**Solution:**
- Check `DATABASE_URL` is correct
- Ensure database is accessible (not blocked by firewall)
- Run migrations: `npm run migrate`

### Issue: CORS errors

**Solution:**
- Update `FRONTEND_URL` in backend env vars
- Ensure URL matches exactly (no trailing slash)
- Redeploy backend

### Issue: Frontend can't reach backend

**Solution:**
- Check `VITE_API_URL` is correct
- Ensure backend is deployed and running
- Check backend health endpoint

### Issue: Build fails

**Solution:**
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **PostgreSQL Setup:** https://www.postgresql.org/docs/

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live frontend URL (e.g., `https://ai-interview-coach.vercel.app`)
- ✅ Live backend URL (e.g., `https://ai-interview-coach-backend.onrender.com`)
- ✅ Production database
- ✅ HTTPS enabled
- ✅ Auto-deploy on git push

**Share your live URL and start using your app! 🚀**

