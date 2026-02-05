// File: backend/routes/authRoute.js

const express = require('express');
const passport = require('passport');
const router = express.Router();

// Debug session endpoint
router.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    hasSession: !!req.session,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'unknown',
    user: req.user ? { id: req.user._id, name: req.user.name } : null,
    cookie: req.session ? req.session.cookie : null,
    headers: {
      cookie: req.headers.cookie ? 'present' : 'missing',
      origin: req.headers.origin,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent']
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      isSecure: req.secure,
      protocol: req.protocol
    }
  });
});

// Google OAuth login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
// Google OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    // Normalize frontend URL (ensure it starts with http/https)
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }

    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('❌ Google OAuth Callback Error:', err);
        return res.redirect(`${frontendUrl}/login?error=server_error&details=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        console.warn('⚠️ Google OAuth: No user returned');
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('❌ Passport Login Error:', loginErr);
          return res.redirect(`${frontendUrl}/login?error=login_failed`);
        }
        // Successful authentication
        return res.redirect(`${frontendUrl}/dashboard?auth=success`);
      });
    })(req, res, next);
  }
);

// Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        googleId: req.user.googleId,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
        walletAddress: req.user.walletAddress,
        role: req.user.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Update wallet address
router.put('/wallet', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  try {
    const { walletAddress } = req.body;
    const User = require('../models/User');

    await User.findByIdAndUpdate(req.user._id, { walletAddress });

    res.json({
      success: true,
      message: 'Wallet address updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

module.exports = router;