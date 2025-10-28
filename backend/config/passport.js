const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db/database');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-oauth-client-id' &&
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_SECRET !== 'your-google-oauth-client-secret') {
  
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const existingUser = db.prepare(
          'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?'
        ).get('google', profile.id);

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `google_${profile.id}@oauth.local`;
        const name = profile.displayName || 'Google User';

        const result = db.prepare(`
          INSERT INTO users (email, name, oauth_provider, oauth_id)
          VALUES (?, ?, ?, ?)
        `).run(email, name, 'google', profile.id);

        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
  
  console.log('Google OAuth configured');
} else {
  console.log('Google OAuth not configured - using placeholder credentials. Email/password login is available.');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

