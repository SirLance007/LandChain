// File: backend/config/passport.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true // Required for Render/Heroku to correctly detect https
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName || 'Unknown User',
        picture: profile.photos?.[0]?.value || ''
      });

      await user.save();
      console.log(`✅ New user registered: ${user.name} (${user.email})`);

      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth Strategy Error:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      // console.log('🔍 Deserializing User ID:', id); // Optional debug
      const user = await User.findById(id);
      if (user) {
        // console.log('✅ User found:', user.email);
        done(null, user);
      } else {
        console.warn('⚠️ Deserialize: User not found for ID:', id);
        done(null, null);
      }
    } catch (error) {
      console.error('❌ Deserialize Error:', error);
      done(error, null);
    }
  });

  console.log('✅ Google OAuth configured successfully');
} else {
  console.log('⚠️ Google OAuth not configured - missing credentials in .env');
}

module.exports = passport;