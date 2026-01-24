// Property Transfer Routes
const express = require('express');
const router = express.Router();
const {
  initiateTransfer,
  getTransferDetails,
  acceptTransfer,
  confirmTransfer,
  getPendingTransfers
} = require('../controllers/transferController');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

// Routes
router.post('/initiate', requireAuth, initiateTransfer);
router.get('/pending', requireAuth, getPendingTransfers);
router.get('/:transferKey', getTransferDetails);
router.post('/accept', requireAuth, acceptTransfer);
router.post('/confirm', requireAuth, confirmTransfer);

module.exports = router;