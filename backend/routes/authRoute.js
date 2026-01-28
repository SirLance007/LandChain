// File: backend/routes/authRoute.js

const express = require('express');
const passport = require('passport');
const router = express.Router();

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

    passport.authenticate('google', {
      failureRedirect: `${frontendUrl}/login?error=auth_failed`
    })(req, res, next);
  },
  (req, res) => {
    // Successful authentication
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    res.redirect(`${frontendUrl}/dashboard?auth=success`);
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