// File: backend/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadDocument } = require('../controllers/uploadController');

router.post('/', upload.single('file'), uploadDocument);

module.exports = router;