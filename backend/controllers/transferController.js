// Property Transfer Controller
const crypto = require('crypto');
const PropertyTransfer = require('../models/PropertyTransfer');
const Land = require('../models/Land');
const User = require('../models/User');
const { blockchainService } = require('../utils/blockchain');

// Generate transfer key for property
const initiateTransfer = async (req, res) => {
  try {
    console.log('🔄 Transfer initiation request:', {
      user: req.user ? req.user.email : 'No user',
      body: req.body
    });

    const { propertyId, buyerEmail, price } = req.body;
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const sellerId = req.user._id.toString(); // Convert ObjectId to string
    
    // Verify seller owns the property
    const property = await Land.findOne({ tokenId: propertyId, userId: sellerId });
    console.log('🔍 Property search result:', {
      tokenId: propertyId,
      userId: sellerId,
      found: !!property
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found or you are not the owner'
      });
    }
    
    // Check if property is already verified
    if (property.status !== 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Only verified properties can be transferred'
      });
    }
    
    // Generate unique transfer key
    const transferKey = crypto.randomBytes(32).toString('hex');
    
    // Create transfer record
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId,
      sellerId: sellerId, // Already converted to string
      sellerEmail: req.user.email,
      buyerEmail,
      price,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    await transfer.save();
    
    console.log(`🔑 Transfer key generated for Property #${propertyId}: ${transferKey}`);
    
    res.json({
      success: true,
      transferKey,
      transferUrl: `${process.env.FRONTEND_URL}/transfer/${transferKey}`,
      expiresAt: transfer.expiresAt,
      message: 'Transfer key generated successfully'
    });
    
  } catch (error) {
    console.error('Transfer initiation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get transfer details by key
const getTransferDetails = async (req, res) => {
  try {
    const { transferKey } = req.params;
    console.log('🔍 Getting transfer details for key:', transferKey);
    
    const transfer = await PropertyTransfer.findOne({ transferKey });
    
    if (!transfer) {
      console.log('❌ Transfer not found for key:', transferKey);
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired transfer key'
      });
    }
    
    // Check if expired
    if (transfer.expiresAt < new Date()) {
      console.log('❌ Transfer expired:', transfer.expiresAt);
      return res.status(400).json({
        success: false,
        error: 'Transfer key has expired'
      });
    }
    
    // Get property details separately
    console.log('🔍 Looking for property with tokenId:', transfer.propertyId, 'type:', typeof transfer.propertyId);
    const property = await Land.findOne({ tokenId: transfer.propertyId });
    if (!property) {
      console.log('❌ Property not found for tokenId:', transfer.propertyId);
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    console.log('✅ Property found:', property.ownerName);
    
    // Get seller details
    const User = require('../models/User');
    const mongoose = require('mongoose');
    const seller = await User.findById(new mongoose.Types.ObjectId(transfer.sellerId));
    if (!seller) {
      console.log('❌ Seller not found for sellerId:', transfer.sellerId);
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    console.log('✅ Transfer details found successfully');
    
    res.json({
      success: true,
      transfer: {
        key: transfer.transferKey,
        status: transfer.status,
        price: transfer.price,
        expiresAt: transfer.expiresAt,
        sellerWalletAddress: transfer.sellerWalletAddress,
        buyerWalletAddress: transfer.buyerWalletAddress,
        transactionHash: transfer.transactionHash,
        blockNumber: transfer.blockNumber
      },
      buyerEmail: transfer.buyerEmail, // Add buyer email for verification
      property: {
        tokenId: property.tokenId,
        ownerName: property.ownerName,
        area: property.area,
        latitude: property.latitude,
        longitude: property.longitude,
        documents: property.documents,
        transactionHash: property.transactionHash,
        blockNumber: property.blockNumber
      },
      seller: {
        name: seller.name,
        email: seller.email
      }
    });
    
  } catch (error) {
    console.error('Get transfer details error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Buyer accepts transfer
const acceptTransfer = async (req, res) => {
  try {
    const { transferKey, buyerSignature, buyerWalletAddress } = req.body;
    const buyerId = req.user._id.toString(); // Convert to string
    
    console.log('🔄 Buyer accepting transfer:', {
      transferKey,
      buyerId,
      buyerEmail: req.user.email,
      buyerWalletAddress,
      hasSignature: !!buyerSignature
    });
    
    const transfer = await PropertyTransfer.findOne({ transferKey });
    
    if (!transfer || transfer.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired transfer key'
      });
    }
    
    console.log('📋 Transfer found:', {
      propertyId: transfer.propertyId,
      sellerId: transfer.sellerId,
      currentStatus: transfer.status
    });
    
    // Update transfer with buyer info
    transfer.buyerId = buyerId;
    transfer.buyerEmail = req.user.email;
    transfer.buyerSignature = buyerSignature;
    transfer.buyerSignedAt = new Date();
    transfer.buyerWalletAddress = buyerWalletAddress;
    transfer.status = 'buyer_accepted';
    
    await transfer.save();
    
    console.log(`✅ Buyer accepted transfer: ${transferKey}`);
    console.log('💾 Saved buyer wallet address:', buyerWalletAddress);
    
    res.json({
      success: true,
      message: 'Transfer accepted by buyer',
      nextStep: 'Waiting for seller confirmation'
    });
    
  } catch (error) {
    console.error('Accept transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Seller confirms transfer
const confirmTransfer = async (req, res) => {
  try {
    const { transferKey, sellerSignature, sellerWalletAddress } = req.body;
    const sellerId = req.user._id.toString(); // Convert to string
    
    console.log('🔄 Seller confirming transfer:', {
      transferKey,
      sellerId,
      sellerEmail: req.user.email,
      sellerWalletAddress,
      hasSignature: !!sellerSignature
    });
    
    const transfer = await PropertyTransfer.findOne({ 
      transferKey, 
      sellerId,
      status: 'buyer_accepted'
    });
    
    if (!transfer) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transfer or buyer has not accepted yet'
      });
    }
    
    console.log('📋 Transfer ready for confirmation:', {
      propertyId: transfer.propertyId,
      buyerId: transfer.buyerId,
      buyerWalletAddress: transfer.buyerWalletAddress,
      currentStatus: transfer.status
    });
    
    // Update transfer with seller confirmation
    transfer.sellerSignature = sellerSignature;
    transfer.sellerSignedAt = new Date();
    transfer.sellerWalletAddress = sellerWalletAddress;
    transfer.status = 'both_signed';
    
    await transfer.save();
    
    console.log('💾 Seller confirmation saved, executing ownership transfer...');
    
    // Execute actual ownership transfer
    const transferResult = await executeOwnershipTransfer(transfer);
    
    console.log(`✅ Ownership transferred for: ${transferKey}`, transferResult);
    
    res.json({
      success: true,
      message: transferResult.blockchainTransfer 
        ? 'Transfer completed successfully! Property ownership has been transferred on blockchain.' 
        : 'Transfer completed in database! Blockchain transfer pending (NFT ownership needs admin setup).',
      nextStep: 'Property ownership updated',
      blockchainTransfer: transferResult.blockchainTransfer,
      transactionHash: transferResult.transactionHash,
      note: transferResult.blockchainTransfer 
        ? 'New transaction hash generated' 
        : 'Original registration hash retained - blockchain transfer pending'
    });
    
  } catch (error) {
    console.error('Confirm transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Execute actual ownership transfer
const executeOwnershipTransfer = async (transfer) => {
  try {
    console.log(`🔄 Executing ownership transfer for Property #${transfer.propertyId}`);
    
    // Get buyer details
    const User = require('../models/User');
    const mongoose = require('mongoose');
    const buyer = await User.findById(new mongoose.Types.ObjectId(transfer.buyerId));
    
    if (!buyer) {
      throw new Error('Buyer not found');
    }
    
    // Update property ownership in Land model
    const property = await Land.findOne({ tokenId: transfer.propertyId });
    if (!property) {
      throw new Error('Property not found');
    }
    
    console.log(`📋 Transferring ownership:`);
    console.log(`   Property Token ID: ${transfer.propertyId}`);
    console.log(`   From: ${property.ownerName} (${property.userEmail})`);
    console.log(`   To: ${buyer.name} (${buyer.email})`);
    console.log(`   Seller Wallet: ${transfer.sellerWalletAddress || 'Not provided'}`);
    console.log(`   Buyer Wallet: ${transfer.buyerWalletAddress || 'Not provided'}`);
    
    // Execute blockchain transfer
    let blockchainResult = null;
    let transferSuccess = false;
    
    console.log('🔍 Checking blockchain transfer requirements:');
    console.log('   Blockchain connected:', blockchainService.isConnected());
    console.log('   Buyer wallet:', transfer.buyerWalletAddress);
    console.log('   Token ID:', transfer.propertyId);
    console.log('   Transfer object:', {
      transferKey: transfer.transferKey,
      propertyId: transfer.propertyId,
      buyerId: transfer.buyerId,
      sellerId: transfer.sellerId,
      buyerWalletAddress: transfer.buyerWalletAddress,
      sellerWalletAddress: transfer.sellerWalletAddress
    });
    
    if (blockchainService.isConnected() && transfer.buyerWalletAddress) {
      try {
        console.log('🔗 Executing blockchain NFT transfer...');
        console.log(`   Token ID: ${transfer.propertyId}`);
        console.log(`   To: ${transfer.buyerWalletAddress}`);
        
        // Execute blockchain transfer
        blockchainResult = await blockchainService.transferLandNFTViaAdmin(
          transfer.propertyId,
          transfer.buyerWalletAddress
        );
        
        console.log('✅ Blockchain transfer successful:', blockchainResult);
        
        // Check if it was a real blockchain transfer or just database update
        if (blockchainResult.success && 
            blockchainResult.transactionHash !== 'admin-not-owner' && 
            blockchainResult.transactionHash !== 'already-owned' &&
            blockchainResult.uniqueTransfer) {
          transferSuccess = true;
          console.log('🎉 Real blockchain NFT transfer completed!');
          console.log('🔗 Unique transfer hash:', blockchainResult.transferHash);
        } else {
          transferSuccess = false;
          console.log('📝 Database-only transfer (blockchain transfer not possible)');
          console.log('💡 Reason:', blockchainResult.message);
        }
        
      } catch (blockchainError) {
        console.error('❌ Blockchain transfer failed:', blockchainError.message);
        console.error('Full error:', blockchainError);
        
        // Don't fail the entire transfer if blockchain fails
        console.log('📝 Continuing with database update despite blockchain failure...');
        console.log('💡 User can retry blockchain transfer later');
      }
    } else {
      console.log('⚠️ Blockchain transfer skipped:');
      if (!blockchainService.isConnected()) {
        console.log('   - Blockchain service not connected');
      }
      if (!transfer.buyerWalletAddress) {
        console.log('   - Buyer wallet address not provided');
        console.log('   - Available addresses:', {
          buyerWalletAddress: transfer.buyerWalletAddress,
          sellerWalletAddress: transfer.sellerWalletAddress
        });
      }
      console.log('📝 Proceeding with database-only transfer...');
    }
    
    // Transfer ownership - Update all owner fields
    const oldOwner = {
      userId: property.userId,
      userEmail: property.userEmail,
      ownerName: property.ownerName,
      transactionHash: property.transactionHash
    };
    
    property.userId = transfer.buyerId;
    property.userEmail = buyer.email;
    property.userGoogleId = buyer.googleId;
    property.owner = transfer.buyerWalletAddress || buyer.email;
    property.ownerName = buyer.name;
    property.ownerPhone = ''; // Buyer can update later
    
    // Update transaction hash ONLY if blockchain transfer was successful
    if (transferSuccess && blockchainResult && blockchainResult.transactionHash && 
        blockchainResult.transactionHash !== 'already-owned' && 
        blockchainResult.transactionHash !== 'admin-not-owner' &&
        blockchainResult.uniqueTransfer) {
      console.log('📝 Updating property with NEW transaction hash:', blockchainResult.transactionHash);
      console.log('🔗 Unique transfer hash from contract:', blockchainResult.transferHash);
      
      property.transactionHash = blockchainResult.transactionHash;
      property.blockNumber = blockchainResult.blockNumber;
      
      // Add transfer history to property
      if (!property.transferHistory) {
        property.transferHistory = [];
      }
      property.transferHistory.push({
        fromOwner: oldOwner.ownerName,
        fromEmail: oldOwner.userEmail,
        toOwner: buyer.name,
        toEmail: buyer.email,
        transferDate: new Date(),
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        transferHash: blockchainResult.transferHash, // Unique contract-generated hash
        price: transfer.price,
        blockchainTransfer: true
      });
      
    } else {
      console.log('⚠️ Keeping original transaction hash - blockchain transfer not completed');
      console.log('   Original hash:', property.transactionHash);
      console.log('   Reason:', blockchainResult?.message || 'Transfer failed');
      
      // Add database-only transfer to history
      if (!property.transferHistory) {
        property.transferHistory = [];
      }
      property.transferHistory.push({
        fromOwner: oldOwner.ownerName,
        fromEmail: oldOwner.userEmail,
        toOwner: buyer.name,
        toEmail: buyer.email,
        transferDate: new Date(),
        transactionHash: 'database-only',
        blockNumber: 0,
        transferHash: null,
        price: transfer.price,
        blockchainTransfer: false,
        note: blockchainResult?.message || 'Blockchain transfer failed'
      });
    }
    
    await property.save();
    
    // Update transfer status to completed
    transfer.status = 'completed';
    transfer.completedAt = new Date();
    
    // Add blockchain info to transfer record
    if (blockchainResult) {
      transfer.transactionHash = blockchainResult.transactionHash;
      transfer.blockNumber = blockchainResult.blockNumber || 0;
      transfer.blockchainTransferSuccess = transferSuccess;
    } else {
      transfer.transactionHash = 'database-only';
      transfer.blockNumber = 0;
      transfer.blockchainTransferSuccess = false;
    }
    
    await transfer.save();
    
    console.log(`✅ Property #${transfer.propertyId} ownership successfully transferred!`);
    console.log(`   New Owner: ${buyer.name} (${buyer.email})`);
    console.log(`   New Owner Wallet: ${transfer.buyerWalletAddress || 'Not provided'}`);
    console.log(`   Blockchain Transfer: ${transferSuccess ? 'SUCCESS' : 'FAILED/SKIPPED'}`);
    
    if (blockchainResult) {
      console.log(`🔗 Blockchain Result:`, {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        success: transferSuccess
      });
    }
    
    // Return result summary
    return {
      success: true,
      blockchainTransfer: transferSuccess,
      transactionHash: blockchainResult?.transactionHash || 'database-only',
      newOwner: buyer.name,
      newOwnerEmail: buyer.email
    };
    
  } catch (error) {
    console.error('❌ Ownership transfer failed:', error);
    throw error;
  }
};

// Get pending transfers for seller
const getPendingTransfers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const sellerId = req.user._id.toString();
    
    // Find transfers where seller needs to confirm
    const transfers = await PropertyTransfer.find({
      sellerId: sellerId,
      status: 'buyer_accepted'
    }).sort({ createdAt: -1 });

    // Get property details for each transfer
    const transfersWithDetails = await Promise.all(
      transfers.map(async (transfer) => {
        const property = await Land.findOne({ tokenId: transfer.propertyId });
        return {
          transferKey: transfer.transferKey,
          propertyId: transfer.propertyId,
          propertyName: `Property #${transfer.propertyId}`,
          buyerEmail: transfer.buyerEmail,
          price: transfer.price,
          createdAt: transfer.createdAt,
          expiresAt: transfer.expiresAt,
          area: property?.area,
          ownerName: property?.ownerName
        };
      })
    );

    res.json({
      success: true,
      transfers: transfersWithDetails
    });

  } catch (error) {
    console.error('Get pending transfers error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  initiateTransfer,
  getTransferDetails,
  acceptTransfer,
  confirmTransfer,
  getPendingTransfers
};