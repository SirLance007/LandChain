// File: backend/controllers/landController.js

const Land = require('../models/Land');
const { blockchainService } = require('../utils/blockchain');

exports.registerLand = async (req, res) => {
  try {
    const {
      owner,
      ownerName,
      ownerPhone,
      ipfsHash,
      latitude,
      longitude,
      area,
      documents,
      transactionHash
    } = req.body;

    // Generate next tokenId automatically
    const lastLand = await Land.findOne({}, {}, { sort: { tokenId: -1 } });
    const nextTokenId = lastLand ? lastLand.tokenId + 1 : 1;

    const land = new Land({
      tokenId: nextTokenId,
      owner,
      ownerName,
      ownerPhone,
      ipfsHash,
      latitude,
      longitude,
      area,
      documents: documents || [],
      transactionHash
    });

    await land.save();

    console.log(`✅ Land registered successfully with Token ID: ${nextTokenId}`);

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

    // Convert tokenId to number
    const numericTokenId = parseInt(tokenId);
    if (isNaN(numericTokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tokenId. Must be a number.'
      });
    }

    const land = await Land.findOne({ tokenId: numericTokenId });

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

exports.updateLandStatus = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status } = req.body;

    console.log('Status update request:', { tokenId, status, tokenIdType: typeof tokenId });

    // Convert tokenId to number
    const numericTokenId = parseInt(tokenId);
    if (isNaN(numericTokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tokenId. Must be a number.'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: pending, verified, or rejected'
      });
    }

    const land = await Land.findOne({ tokenId: numericTokenId });
    if (!land) {
      return res.status(404).json({
        success: false,
        error: 'Land not found'
      });
    }

    // If approving (verified), mint NFT on blockchain
    let blockchainResult = null;
    if (status === 'verified' && land.status !== 'verified') {
      try {
        console.log('🔗 Attempting to mint NFT on blockchain...');
        
        // Check if blockchain service is available
        if (blockchainService.isConnected()) {
          blockchainResult = await blockchainService.mintLandNFT({
            owner: land.owner,
            ipfsHash: land.ipfsHash,
            latitude: land.latitude,
            longitude: land.longitude,
            area: land.area
          });
          
          console.log('✅ NFT minted successfully:', blockchainResult);
        } else {
          console.log('⚠️ Blockchain service not available, updating database only');
        }
      } catch (blockchainError) {
        console.error('❌ Blockchain minting failed:', blockchainError.message);
        // Continue with database update even if blockchain fails
        console.log('📝 Continuing with database update...');
      }
    }

    // Update database
    const updatedLand = await Land.findOneAndUpdate(
      { tokenId: numericTokenId },
      { 
        status,
        ...(blockchainResult && {
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber
        })
      },
      { new: true }
    );

    console.log(`✅ Property #${numericTokenId} status updated to: ${status}`);

    res.json({
      success: true,
      land: updatedLand,
      blockchain: blockchainResult,
      message: `Property status updated to ${status}${blockchainResult ? ' and NFT minted on blockchain' : ''}`
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// New endpoint to get blockchain info
exports.getBlockchainInfo = async (req, res) => {
  try {
    const isConnected = blockchainService.isConnected();
    const networkInfo = blockchainService.getNetworkInfo();
    const totalSupply = await blockchainService.getTotalSupply();

    res.json({
      success: true,
      blockchain: {
        connected: isConnected,
        network: networkInfo,
        totalNFTs: totalSupply,
        contractAddress: blockchainService.getContractAddress()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};