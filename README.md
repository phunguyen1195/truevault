# VoteApp - Prediction Market Voting Platform

A modern web application for creating and voting on Yes/No prediction markets with user authentication, points system, and leaderboards.

## Features

### Core Features
- 🔐 **Authentication**: Email/password registration and Google OAuth login
- 👤 **User Roles**: Admin and regular user roles with different permissions
- 📊 **Markets**: Create Yes/No prediction markets with clear rules and close times
- 🗳️ **Voting**: One vote per market per user, no edits after casting
- 📈 **Live Totals**: Optional live vote counts or hidden until market closes
- ⏰ **Auto-Close**: Markets automatically close at scheduled time
- ✅ **Resolution**: Admin-resolved markets with automatic point awards
- 🏆 **Points System**: Earn 10 points for each correct prediction
- 🎖️ **Badges**: Unlock achievements based on votes, accuracy, and streaks
- 📱 **Portfolio**: View your voting history and accuracy statistics
- 🏅 **Leaderboard**: Compete with other users for top rankings

### Technical Features
- Modern React frontend with Tailwind CSS
- Node.js/Express backend API
- SQLite database (easily upgradeable to PostgreSQL)
- JWT authentication
- Responsive and beautiful UI
- Real-time market status updates

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Zustand (state management)
- Axios
- Lucide React (icons)
- date-fns

**Backend:**
- Node.js
- Express
- better-sqlite3
- Passport.js (OAuth)
- bcryptjs
- jsonwebtoken
- node-cron (auto-close markets)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd voteapp
```

2. **Install all dependencies**
```bash
npm run install:all
```

This will install dependencies for the root, backend, and frontend.

### Configuration

#### Backend Configuration

The backend uses environment variables. A `.env` file is already created in the `backend` directory with development defaults.

For **Google OAuth** (optional):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy your Client ID and Client Secret
7. Update `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

**Note:** The app works fine without Google OAuth - users can still register with email/password.

### Database Initialization

Initialize the database with sample users:

```bash
cd backend
npm run init-db
```

This creates:
- **Admin user**: `admin@example.com` / `admin123`
- **Regular user**: `user@example.com` / `user123`
- Default badges

### Running the Application

From the root directory, run both frontend and backend:

```bash
npm run dev
```

Or run them separately:

**Backend** (runs on http://localhost:5000):
```bash
cd backend
npm run dev
```

**Frontend** (runs on http://localhost:5173):
```bash
cd frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Usage Guide

### For Regular Users

1. **Register/Login**
   - Create an account with email/password
   - Or use Google OAuth to sign in

2. **Browse Markets**
   - View all open, closed, and resolved markets
   - Filter by status
   - See live vote counts (if enabled)

3. **Vote**
   - Click YES or NO on open markets
   - You can only vote once per market
   - No edits after voting

4. **Track Performance**
   - View your portfolio to see all your votes
   - Check accuracy statistics
   - Track earned badges

5. **Compete**
   - View the leaderboard
   - Compare your points and accuracy with others

### For Admin Users

In addition to regular user features:

1. **Create Markets**
   - Click "Create Market" button
   - Enter question (Yes/No format)
   - Add description and resolution rules
   - Set close time
   - Choose whether to show live totals

2. **Resolve Markets**
   - After a market closes, resolve it as YES or NO
   - Points are automatically awarded to correct voters
   - Badges are automatically updated

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Markets
- `GET /api/markets` - Get all markets
- `GET /api/markets/:id` - Get single market
- `POST /api/markets` - Create market (admin only)
- `POST /api/markets/:id/resolve` - Resolve market (admin only)

### Votes
- `POST /api/votes` - Cast vote
- `GET /api/votes/market/:marketId` - Get user's vote for market
- `GET /api/votes/my-votes` - Get user's voting history

### Users
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/badges` - Get user's badges

## Project Structure

```
voteapp/
├── backend/
│   ├── config/          # Configuration (Passport, etc.)
│   ├── db/              # Database setup and SQLite file
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic (badges, market close)
│   ├── scripts/         # Utility scripts (init DB)
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management (Zustand)
│   │   ├── lib/         # Utilities (API client)
│   │   └── App.jsx      # Main app component
│   ├── index.html
│   └── vite.config.js
└── package.json
```

## Database Schema

### Tables
- **users**: User accounts with email, password (hashed), OAuth info, points, role
- **markets**: Prediction markets with title, description, rules, status, resolution
- **votes**: User votes on markets (one per user per market)
- **badges**: Achievement definitions
- **user_badges**: User-earned badges

## Badge System

Users can earn badges for:
- **First Vote**: Cast your first vote
- **Vote Enthusiast**: Cast 10 votes
- **Vote Master**: Cast 50 votes
- **Predictor**: Get 5 correct predictions
- **Oracle**: Get 20 correct predictions
- **Winning Streak**: Get 5 correct predictions in a row
- **Points Hunter**: Earn 100 points
- **Points Champion**: Earn 500 points

## Security Features

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected admin routes
- SQL injection prevention with prepared statements
- CORS configured
- Input validation with express-validator

## Future Enhancements

Possible improvements:
- WebSocket for real-time updates
- More complex market types (multiple choice, ranges)
- User profiles with avatars
- Market comments and discussions
- Market categories/tags
- Email notifications
- Mobile app
- PostgreSQL for production
- Redis for caching
- Docker deployment

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000 or 5173
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Database issues:**
```bash
# Delete and reinitialize database
rm backend/db/voteapp.db
cd backend && npm run init-db
```

**Dependencies issues:**
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json
npm run install:all
```

## 🌐 Deployment

Ready to deploy your app online? See:
- **[DEPLOY-QUICKSTART.md](DEPLOY-QUICKSTART.md)** - 5-minute deployment guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment instructions

**Recommended**: Railway (backend) + Vercel (frontend) = 100% free for personal projects!

## License

ISC

## Contributing

Feel free to submit issues and pull requests!

