// File: backend/routes/landRoutes.js

const express = require('express');
const router = express.Router();
const {
  registerLand,
  getLand,
  getAllLands,
  updateLandStatus,
  getBlockchainInfo
} = require('../controllers/landController');

router.post('/register', registerLand);
router.get('/blockchain-info', getBlockchainInfo);
router.get('/:tokenId', getLand);
router.get('/', getAllLands);
router.put('/:tokenId/status', updateLandStatus);

module.exports = router;