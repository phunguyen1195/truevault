# Deployment Guide

## Quick Deploy (Railway + Vercel)

### Backend Deployment (Railway)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select your repository
   - Select the `backend` folder as the root directory

3. **Add PostgreSQL Database** (Optional but recommended)
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create and connect the database

4. **Set Environment Variables**
   
   In Railway project settings, add these variables:
   ```
   PORT=5001
   JWT_SECRET=your-secure-jwt-secret-change-this
   SESSION_SECRET=your-secure-session-secret-change-this
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```

   Optional (for Google OAuth):
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.railway.app/api/auth/google/callback
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

6. **Initialize Database**
   - After deployment, run the init script via Railway's terminal or locally:
   ```bash
   # Point to your Railway backend
   curl -X POST https://your-backend.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123","name":"Admin User"}'
   ```

### Frontend Deployment (Vercel)

1. **Update API URL**
   
   Edit `frontend/src/lib/api.js`:
   ```javascript
   export const api = axios.create({
     baseURL: process.env.VITE_API_URL || 'https://your-backend.railway.app/api',
     headers: {
       'Content-Type': 'application/json',
     },
   })
   ```

2. **Sign up at [vercel.com](https://vercel.com)**

3. **Deploy**
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `frontend`
   - Framework Preset: Vite
   - Add Environment Variable:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```
   - Click "Deploy"

4. **Update Backend CORS**
   - Go back to Railway
   - Update `CLIENT_URL` to your Vercel URL
   - Redeploy backend

---

## Option 2: Render (All-in-One)

Both backend and frontend can be deployed on Render's free tier.

### Backend on Render

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add PostgreSQL**
   - Dashboard → New → PostgreSQL
   - Copy the Internal Database URL

4. **Set Environment Variables**
   ```
   PORT=5001
   JWT_SECRET=your-secret
   SESSION_SECRET=your-secret
   CLIENT_URL=https://your-frontend.onrender.com
   NODE_ENV=production
   DATABASE_URL=your-postgres-url (if using PostgreSQL)
   ```

### Frontend on Render

1. **Create Static Site**
   - New → Static Site
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Add Environment Variable**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

---

## Option 3: Fly.io (Backend) + Vercel (Frontend)

Fly.io offers excellent free tier for backend apps.

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Deploy**
   ```bash
   cd backend
   fly launch
   fly secrets set JWT_SECRET=your-secret SESSION_SECRET=your-secret CLIENT_URL=your-frontend-url
   fly deploy
   ```

3. **Deploy frontend to Vercel** (same as Option 1)

---

## Database Migration (SQLite → PostgreSQL)

If you want to use PostgreSQL in production:

1. **Install pg package**
   ```bash
   cd backend
   npm install pg
   ```

2. **Update database.js** to support both SQLite (dev) and PostgreSQL (production)

3. **I can help you with this migration if needed!**

---

## Quick Start Commands

### Railway Deployment
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main

# 2. Deploy on Railway (via web UI)
# 3. Deploy frontend on Vercel (via web UI)
```

### Environment Variables Summary

**Backend (.env for Railway/Render):**
```
PORT=5001
JWT_SECRET=generate-a-secure-random-string
SESSION_SECRET=generate-another-secure-random-string
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

**Frontend (Vercel Environment Variables):**
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

---

## Free Tier Limits

- **Railway**: $5/month credit (enough for small apps)
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Render**: Free tier with 750 hours/month
- **Fly.io**: 3 small VMs free

---

## Post-Deployment Checklist

- [ ] Test login with admin@example.com
- [ ] Create a test market
- [ ] Vote on a market
- [ ] Check leaderboard
- [ ] Update Google OAuth callback URLs (if using)
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic on most platforms)

---

## Need Help?

Run into issues? Common fixes:
- **CORS errors**: Update CLIENT_URL in backend env vars
- **API not connecting**: Check VITE_API_URL in frontend
- **Database errors**: Make sure database is connected and initialized
- **Port issues**: Railway/Render will set PORT automatically

---

## Recommended: Railway + Vercel

**Why?**
- ✅ Easiest setup
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL
- ✅ Automatic deployments from GitHub
- ✅ Generous free tier
- ✅ Great for MVPs

**Cost:** Free for development, ~$5-10/month for production usage

