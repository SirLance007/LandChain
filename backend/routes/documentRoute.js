// Document Access Routes with Encryption Support
const express = require('express');
const router = express.Router();
const {
  getDocument,
  generateAccessToken,
  getDocumentMetadata
} = require('../controllers/documentController');

// Get document with decryption (requires access control)
router.get('/property/:propertyId/document/:documentHash', getDocument);

// Generate access token for document viewing
router.post('/property/:propertyId/access-token', generateAccessToken);

// Get document metadata without downloading
router.get('/property/:propertyId/metadata', getDocumentMetadata);

module.exports = router;