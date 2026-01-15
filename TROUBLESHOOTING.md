# 🔧 Troubleshooting Guide - Common Errors & Solutions

## Quick Error Fixes

### ❌ Error: "role 'postgres' does not exist"

**Problem:** On macOS, PostgreSQL doesn't create a 'postgres' user by default.

**Solution:**

Use your macOS username instead:

```bash
# Check your username
whoami

# Use your username to connect
psql -U YOUR_USERNAME -d postgres

# Then create the database and user:
CREATE DATABASE interview_coach;
CREATE USER interview_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE interview_coach TO interview_user;
\q
```

**Or update your .env to use your username:**
```env
DATABASE_URL=postgresql://YOUR_USERNAME:password123@localhost:5432/interview_coach
```

---

### ❌ Error: "Cannot find module" or "npm install errors"

**Solution:**
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Error: "Port 3000 already in use" or "Port 5000 already in use"

**Solution:**
```bash
# Find what's using the port
lsof -ti:3000
lsof -ti:5000

# Kill the process
lsof -ti:3000 | xargs kill
lsof -ti:5000 | xargs kill

# Or change PORT in backend/.env
```

---

### ❌ Error: "Database 'interview_coach' does not exist"

**Solution:**
```bash
# Connect with your username
psql -U YOUR_USERNAME -d postgres

# Create database
CREATE DATABASE interview_coach;
CREATE USER interview_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE interview_coach TO interview_user;
\q
```

---

### ❌ Error: "Redis connection failed"

**Check Redis:**
```bash
redis-cli ping
# Should return: PONG
```

**If not running:**
```bash
brew services start redis
```

**If still failing, check your .env:**
```env
REDIS_URL=redis://localhost:6379
# OR
REDIS_URL=redis://127.0.0.1:6379
```

---

### ❌ Error: "OPENAI_API_KEY is missing" or "Invalid API key"

**Solution:**
1. Get your API key from: https://platform.openai.com/api-keys
2. Update `backend/.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```
3. Make sure it starts with `sk-`
4. Check you have credits: https://platform.openai.com/account/usage

---

### ❌ Error: "Frontend can't connect to backend"

**Check:**
1. Backend is running (check terminal 1)
2. Backend .env has: `FRONTEND_URL=http://localhost:5173`
3. Frontend .env exists with: `VITE_API_URL=http://localhost:3000/api`
4. Ports match (backend PORT in .env matches frontend API URL)

**Create frontend/.env:**
```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

---

### ❌ Error: "JWT_SECRET is too short"

**Solution:**
Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `backend/.env`:
```env
JWT_SECRET=paste-generated-secret-here
```

---

### ❌ Error: "Migration failed" or "Table already exists"

**Solution:**
```bash
# Drop and recreate database
psql -U YOUR_USERNAME -d postgres -c "DROP DATABASE interview_coach;"
psql -U YOUR_USERNAME -d postgres -c "CREATE DATABASE interview_coach;"

# Re-run migrations
cd backend
npm run migrate
```

---

### ❌ Error: "Module not found" in backend

**Solution:**
```bash
cd backend
npm install
# Make sure all dependencies are installed
```

---

### ❌ Error: "CORS error" in browser

**Solution:**
Check `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

Make sure it matches your frontend URL exactly.

---

## Step-by-Step Fix for Common Setup Issues

### Fix 1: PostgreSQL User Issue

```bash
# 1. Find your username
whoami

# 2. Connect with your username
psql -U $(whoami) -d postgres

# 3. Create database and user
CREATE DATABASE interview_coach;
CREATE USER interview_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE interview_coach TO interview_user;
ALTER USER interview_user CREATEDB;
\q

# 4. Update backend/.env
DATABASE_URL=postgresql://interview_user:password123@localhost:5432/interview_coach
```

### Fix 2: Missing Frontend .env

```bash
cd frontend
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF
```

### Fix 3: Verify All Services

```bash
# Check PostgreSQL
psql -U interview_user -d interview_coach -c "SELECT 1;"

# Check Redis
redis-cli ping

# Check Node
node --version
npm --version
```

---

## Complete Reset (If Nothing Works)

```bash
# 1. Stop everything
brew services stop postgresql
brew services stop redis

# 2. Clean database
psql -U $(whoami) -d postgres -c "DROP DATABASE IF EXISTS interview_coach;"
psql -U $(whoami) -d postgres -c "DROP USER IF EXISTS interview_user;"

# 3. Clean node modules
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json

# 4. Restart services
brew services start postgresql
brew services start redis

# 5. Follow QUICK_START.md from the beginning
```

---

## Getting Help

If you're still stuck:

1. **Check the error message** - Copy the full error
2. **Check which step failed** - Backend setup? Frontend setup? Database?
3. **Check terminal output** - Look for red error messages
4. **Verify .env files** - Make sure both exist and have correct values
5. **Check services** - PostgreSQL and Redis must be running

**Common things to verify:**
- ✅ PostgreSQL is running: `brew services list | grep postgresql`
- ✅ Redis is running: `redis-cli ping`
- ✅ Backend .env exists and has all values
- ✅ Frontend .env exists
- ✅ Database exists: `psql -U interview_user -d interview_coach`
- ✅ Node modules installed: `ls backend/node_modules`

---

**Share the specific error message and I can help fix it!**



