// File: backend/controllers/landController.js

const Land = require('../models/Land');
const { blockchainService } = require('../utils/blockchain');

exports.registerLand = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userGoogleId,
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
      userId,
      userEmail,
      userGoogleId,
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

    console.log(`✅ Land registered successfully with Token ID: ${nextTokenId} for User: ${userId}`);

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
    const { owner, userId, email, googleId } = req.query;
    
    // Build query filter - PRIORITY ORDER: email > googleId > userId > owner
    let filter = {};
    let filterDescription = 'All lands';
    
    if (email) {
      // HIGHEST PRIORITY: Find user by email and get their lands
      const User = require('../models/User');
      const user = await User.findOne({ email });
      if (user) {
        filter.userId = user._id;
        filterDescription = `Filtered by email: ${email}`;
        console.log(`🔍 Email-based filtering for: ${email} → userId: ${user._id}`);
      } else {
        // No user found with this email, return empty
        console.log(`⚠️ No user found with email: ${email}`);
        return res.json({
          success: true,
          count: 0,
          lands: [],
          filter: `No user found with email: ${email}`
        });
      }
    } else if (googleId) {
      // SECOND PRIORITY: Find user by googleId and get their lands
      const User = require('../models/User');
      const user = await User.findOne({ googleId });
      if (user) {
        filter.userId = user._id;
        filterDescription = `Filtered by googleId: ${googleId}`;
        console.log(`🔍 GoogleId-based filtering for: ${googleId} → userId: ${user._id}`);
      } else {
        console.log(`⚠️ No user found with googleId: ${googleId}`);
        return res.json({
          success: true,
          count: 0,
          lands: [],
          filter: `No user found with googleId: ${googleId}`
        });
      }
    } else if (userId) {
      // THIRD PRIORITY: Direct userId filtering
      filter.userId = userId;
      filterDescription = `Filtered by userId: ${userId}`;
      console.log(`🔍 UserId-based filtering: ${userId}`);
    } else if (owner) {
      // LOWEST PRIORITY: Wallet address filtering (only for admin/fallback)
      filter.owner = new RegExp(`^${owner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      filterDescription = `Filtered by owner: ${owner}`;
      console.log(`⚠️ Wallet-based filtering (should be avoided): ${owner}`);
    }

    const lands = await Land.find(filter).sort({ createdAt: -1 });

    console.log(`📋 Fetched ${lands.length} lands - ${filterDescription}`);

    res.json({
      success: true,
      count: lands.length,
      lands: lands,
      filter: filterDescription
    });

  } catch (error) {
    console.error('❌ Error in getAllLands:', error);
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
          // Step 1: Mint to admin wallet
          blockchainResult = await blockchainService.mintLandNFT({
            owner: land.owner, // This will be ignored, mints to admin
            ipfsHash: land.ipfsHash,
            latitude: land.latitude,
            longitude: land.longitude,
            area: land.area
          });
          
          console.log('✅ NFT minted to admin wallet:', blockchainResult);
          
          // Step 2: Immediately transfer to actual user if user has wallet
          if (blockchainResult.success && land.owner && land.owner !== blockchainResult.adminWallet) {
            try {
              console.log('🔄 Transferring NFT from admin to user...');
              console.log(`   From: Admin wallet`);
              console.log(`   To: ${land.owner}`);
              console.log(`   Token ID: ${blockchainResult.tokenId}`);
              
              const transferResult = await blockchainService.transferLandNFTViaAdmin(
                blockchainResult.tokenId,
                land.owner
              );
              
              if (transferResult.success && transferResult.uniqueTransfer) {
                console.log('✅ NFT transferred to user successfully!');
                console.log('🔗 New transfer transaction:', transferResult.transactionHash);
                
                // Update with transfer transaction hash instead of mint hash
                blockchainResult.transactionHash = transferResult.transactionHash;
                blockchainResult.blockNumber = transferResult.blockNumber;
                blockchainResult.transferHash = transferResult.transferHash;
                blockchainResult.finalOwner = land.owner;
                blockchainResult.transferredToUser = true;
              } else {
                console.log('⚠️ Transfer to user failed, NFT remains with admin');
                blockchainResult.transferredToUser = false;
                blockchainResult.finalOwner = 'admin';
              }
              
            } catch (transferError) {
              console.error('❌ Transfer to user failed:', transferError.message);
              blockchainResult.transferredToUser = false;
              blockchainResult.finalOwner = 'admin';
            }
          } else {
            console.log('⚠️ No user wallet provided, NFT remains with admin');
            blockchainResult.transferredToUser = false;
            blockchainResult.finalOwner = 'admin';
          }
          
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
      message: `Property status updated to ${status}${
        blockchainResult 
          ? blockchainResult.transferredToUser 
            ? ' and NFT minted & transferred to user on blockchain' 
            : ' and NFT minted on blockchain (admin managed)'
          : ''
      }`
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