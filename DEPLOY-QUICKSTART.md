# 🚀 Quick Deploy Guide (5 Minutes)

Follow these steps to deploy your VoteApp to the internet!

## Prerequisites
- GitHub account
- Your code pushed to a GitHub repository

## Step 1: Deploy Backend to Railway (2 minutes)

1. Go to **[railway.app](https://railway.app)** and sign in with GitHub

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select your repository and choose **"backend"** as the root directory

4. Click **"Add variables"** and add:
   ```
   JWT_SECRET=your-random-secret-key-here
   SESSION_SECRET=another-random-secret-key
   CLIENT_URL=https://voteapp.vercel.app
   NODE_ENV=production
   ```
   (Replace `voteapp` with your app name in step 2)

5. **Copy your Railway URL** (looks like: `https://yourapp.up.railway.app`)

6. **Optional**: Add PostgreSQL database
   - Click "New" → "Database" → "PostgreSQL"
   - Railway connects it automatically

## Step 2: Deploy Frontend to Vercel (2 minutes)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub

2. Click **"New Project"** → Import your repository

3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://yourapp.up.railway.app/api` (your Railway URL + /api)

5. Click **"Deploy"**

6. **Copy your Vercel URL** (looks like: `https://voteapp.vercel.app`)

## Step 3: Update Backend CORS (1 minute)

1. Go back to **Railway** project settings

2. Update environment variable:
   ```
   CLIENT_URL=https://voteapp.vercel.app
   ```
   (Use your actual Vercel URL)

3. Save and wait for Railway to redeploy (~30 seconds)

## Step 4: Test Your App! 🎉

1. Open your Vercel URL in browser

2. Register a new account or login with:
   - Email: `admin@example.com`
   - Password: `admin123`

3. Create markets, vote, and test all features!

---

## 🎯 That's It!

Your app is now live and accessible to anyone on the internet!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.railway.app/api`

---

## 💰 Cost

- **100% FREE** for personal/demo projects
- Railway: $5/month credit (more than enough)
- Vercel: Unlimited deployments, 100GB bandwidth

---

## 🔧 Troubleshooting

**Can't login?**
- Check backend logs on Railway dashboard
- Make sure `CLIENT_URL` matches your Vercel URL exactly

**API not connecting?**
- Verify `VITE_API_URL` in Vercel is correct
- Check Railway backend is running (green status)

**Markets not showing?**
- Database might need initialization
- Login as admin and create a test market

---

## 🚀 Auto-Deploy

Both platforms will automatically deploy when you push to GitHub:
```bash
git add .
git commit -m "Update app"
git push
```

Railway and Vercel will detect changes and redeploy automatically!

---

## 📝 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure Google OAuth for production
- [ ] Upgrade to PostgreSQL database
- [ ] Add monitoring/analytics

Need help? See full `DEPLOYMENT.md` for detailed instructions!

