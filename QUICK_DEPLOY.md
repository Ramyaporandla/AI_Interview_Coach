# ⚡ Quick Deploy Guide - Get Live URL in 15 Minutes

## 🎯 Fastest Way: Render (Backend) + Vercel (Frontend)

### Step 1: Push to GitHub (2 min)

```bash
cd /Users/ramyaporandla/Cursor/Portifolio/AI_Interview_Coach

# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-interview-coach.git
git push -u origin main
```

### Step 2: Deploy Backend to Render (5 min)

1. **Go to:** https://render.com → Sign up (free)

2. **New → Web Service → Connect GitHub → Select your repo**

3. **Settings:**
   - **Name:** `ai-interview-coach-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   ```
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=<generate-random-string-32-chars>
   OPENAI_API_KEY=sk-your-openai-key
   FRONTEND_URL=https://your-app.vercel.app (update after frontend deploy)
   ```

5. **Add PostgreSQL:**
   - New → PostgreSQL
   - Name: `ai-interview-coach-db`
   - Copy the **Internal Database URL**

6. **Update Backend Env:**
   - Add `DATABASE_URL` = Internal Database URL from step 5

7. **Deploy!** Copy the backend URL (e.g., `https://ai-interview-coach-api.onrender.com`)

8. **Run Migrations:**
   - Go to backend service → Shell
   - Run: `npm run migrate`

### Step 3: Deploy Frontend to Vercel (5 min)

1. **Go to:** https://vercel.com → Sign up (free, use GitHub)

2. **Add New Project → Import GitHub repo**

3. **Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)

4. **Add Environment Variable:**
   ```
   VITE_API_URL=https://ai-interview-coach-api.onrender.com/api
   ```
   (Use your actual backend URL from Step 2)

5. **Deploy!** Copy the frontend URL (e.g., `https://ai-interview-coach.vercel.app`)

### Step 4: Update CORS (2 min)

1. **Go back to Render backend**
2. **Update Environment Variable:**
   ```
   FRONTEND_URL=https://ai-interview-coach.vercel.app
   ```
   (Use your actual frontend URL)

3. **Redeploy backend** (auto-redeploys when env changes)

### Step 5: Test (1 min)

1. Visit your frontend URL
2. Try registering a new user
3. Check backend health: `https://your-backend.onrender.com/health`

---

## ✅ Done! You now have:

- 🌐 **Frontend:** `https://your-app.vercel.app`
- 🔌 **Backend:** `https://your-api.onrender.com`
- 🗄️ **Database:** Managed PostgreSQL on Render
- 🔒 **HTTPS:** Enabled automatically
- 🚀 **Auto-deploy:** On every git push

---

## 🐛 Quick Fixes

**Backend not working?**
- Check logs in Render dashboard
- Verify `DATABASE_URL` is correct
- Ensure migrations ran: `npm run migrate`

**Frontend can't connect?**
- Check `VITE_API_URL` matches backend URL
- Verify backend is running (check health endpoint)
- Check browser console for errors

**CORS errors?**
- Update `FRONTEND_URL` in backend env vars
- Ensure no trailing slash in URLs
- Redeploy backend

---

## 📝 Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET`.

---

**Need more help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.

