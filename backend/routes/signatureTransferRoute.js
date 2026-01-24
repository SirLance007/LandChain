// Signature-based Transfer Routes
const express = require('express');
const router = express.Router();
const { 
  generateTransferSignature, 
  executeSignatureTransfer, 
  getSignatureTransferDetails 
} = require('../controllers/signatureTransferController');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Authentication required'
  });
};

// Generate transfer signature (seller creates)
router.post('/generate-signature', isAuthenticated, generateTransferSignature);

// Execute signature transfer (buyer submits)
router.post('/execute-signature', isAuthenticated, executeSignatureTransfer);

// Get signature transfer details
router.get('/signature/:transferKey', getSignatureTransferDetails);

module.exports = router;