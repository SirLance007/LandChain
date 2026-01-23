// File: backend/controllers/landController.js

const Land = require('../models/Land');

exports.registerLand = async (req, res) => {
  try {
    const {
      tokenId,
      owner,
      ownerName,
      ownerPhone,
      ipfsHash,
      latitude,
      longitude,
      area,
      transactionHash
    } = req.body;

    const land = new Land({
      tokenId,
      owner,
      ownerName,
      ownerPhone,
      ipfsHash,
      latitude,
      longitude,
      area,
      transactionHash
    });

    await land.save();

    res.json({
      success: true,
      land: land,
      message: 'Land registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getLand = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const land = await Land.findOne({ tokenId });

    if (!land) {
      return res.status(404).json({
        success: false,
        error: 'Land not found'
      });
    }

    res.json({
      success: true,
      land: land
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllLands = async (req, res) => {
  try {
    const lands = await Land.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: lands.length,
      lands: lands
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};