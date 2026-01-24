// File: backend/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadDocument } = require('../controllers/uploadController');

// Add debugging middleware
router.use((req, res, next) => {
  console.log(`📤 Upload route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

router.post('/', upload.single('file'), uploadDocument);

module.exports = router;