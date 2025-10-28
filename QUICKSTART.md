# Quick Start Guide

Get your VoteApp up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm run install:all
```

## 2. Initialize Database

```bash
cd backend
npm run init-db
cd ..
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Regular user: `user@example.com` / `user123`

## 3. Start the Application

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173).

## 4. Open in Browser

Navigate to: http://localhost:5173

## 5. Login & Test

**As Admin:**
1. Login with `admin@example.com` / `admin123`
2. Click "Create Market" to create a prediction market
3. Set a close time (e.g., 5 minutes from now)
4. Logout

**As User:**
1. Login with `user@example.com` / `user123`
2. Vote YES or NO on the market
3. Check your Portfolio
4. View the Leaderboard

**Resolve Market (as Admin):**
1. Wait for market to close (or change system time)
2. Login as admin again
3. Click "Resolve YES" or "Resolve NO"
4. Check that points were awarded

## Features to Test

✅ Email/password registration and login
✅ Google OAuth (needs setup in README)
✅ Create markets (admin only)
✅ Vote on markets (one vote per market)
✅ View live totals (if enabled)
✅ Markets auto-close at scheduled time
✅ Resolve markets (admin only)
✅ Earn 10 points for correct predictions
✅ Unlock badges
✅ View portfolio and stats
✅ View leaderboard

## Common Commands

**Install everything:**
```bash
npm run install:all
```

**Run both servers:**
```bash
npm run dev
```

**Run backend only:**
```bash
cd backend && npm run dev
```

**Run frontend only:**
```bash
cd frontend && npm run dev
```

**Reset database:**
```bash
rm backend/db/voteapp.db
cd backend && npm run init-db
```

## Troubleshooting

**Port in use:**
```bash
lsof -ti:5000 | xargs kill -9   # Backend
lsof -ti:5173 | xargs kill -9   # Frontend
```

**Clean install:**
```bash
rm -rf node_modules */node_modules
npm run install:all
```

## Next Steps

- Customize the UI colors in `frontend/tailwind.config.js`
- Add more badges in `backend/db/database.js`
- Configure Google OAuth (see README.md)
- Deploy to production (Vercel + Railway/Render)

Enjoy your prediction market app! 🎯

