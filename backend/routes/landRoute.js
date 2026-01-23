// File: backend/routes/landRoutes.js

const express = require('express');
const router = express.Router();
const {
  registerLand,
  getLand,
  getAllLands
} = require('../controllers/landController');

router.post('/register', registerLand);
router.get('/:tokenId', getLand);
router.get('/', getAllLands);

module.exports = router;