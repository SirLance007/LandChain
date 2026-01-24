// Signature-based Property Transfer Controller
const crypto = require('crypto');
const PropertyTransfer = require('../models/PropertyTransfer');
const Land = require('../models/Land');
const User = require('../models/User');
const { blockchainService } = require('../utils/blockchain');

// Generate transfer signature (seller creates signature)
const generateTransferSignature = async (req, res) => {
  try {
    console.log('🔏 Signature generation request:', {
      user: req.user ? req.user.email : 'No user',
      body: req.body
    });

    const { propertyId, buyerEmail, price, buyerWalletAddress } = req.body;
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const sellerId = req.user._id.toString();
    
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
    
    // Check if property is verified
    if (property.status !== 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Only verified properties can be transferred'
      });
    }

    // Get seller's wallet address (should be the current NFT owner)
    const sellerWalletAddress = property.owner;
    
    if (!sellerWalletAddress || !buyerWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Both seller and buyer wallet addresses are required'
      });
    }

    // Generate signature deadline (24 hours from now)
    const deadline = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

    // For demo purposes, we'll use a dummy private key
    // In production, this should be done client-side with user's actual private key
    const dummyPrivateKey = process.env.PRIVATE_KEY; // This is just for demo
    
    console.log('🔏 Generating signature with blockchain service...');
    const signatureData = await blockchainService.generateTransferSignature(
      propertyId,
      sellerWalletAddress,
      buyerWalletAddress,
      dummyPrivateKey,
      deadline
    );

    // Generate unique transfer key for tracking
    const transferKey = crypto.randomBytes(32).toString('hex');
    
    // Create transfer record with signature data
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId,
      sellerId: sellerId,
      sellerEmail: req.user.email,
      buyerEmail,
      price,
      sellerWalletAddress,
      buyerWalletAddress,
      signatureData: {
        signature: signatureData.signature,
        authHash: signatureData.authHash,
        nonce: signatureData.auth.nonce,
        deadline: signatureData.auth.deadline
      },
      expiresAt: new Date(deadline * 1000),
      status: 'signature_generated'
    });
    
    await transfer.save();
    
    console.log(`🔏 Transfer signature generated for Property #${propertyId}: ${transferKey}`);
    
    res.json({
      success: true,
      transferKey,
      signatureData: {
        auth: signatureData.auth,
        signature: signatureData.signature,
        authHash: signatureData.authHash
      },
      transferUrl: `${process.env.FRONTEND_URL}/signature-transfer/${transferKey}`,
      expiresAt: new Date(deadline * 1000),
      message: 'Transfer signature generated successfully'
    });
    
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Execute signature transfer (buyer submits signature)
const executeSignatureTransfer = async (req, res) => {
  try {
    const { transferKey } = req.body;
    const buyerId = req.user._id.toString();
    
    console.log('🔏 Executing signature transfer:', {
      transferKey,
      buyerId,
      buyerEmail: req.user.email
    });
    
    const transfer = await PropertyTransfer.findOne({ 
      transferKey,
      status: 'signature_generated'
    });
    
    if (!transfer || transfer.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired transfer signature'
      });
    }

    // Verify buyer email matches
    if (transfer.buyerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to execute this transfer'
      });
    }

    console.log('📋 Transfer found:', {
      propertyId: transfer.propertyId,
      sellerId: transfer.sellerId,
      signatureData: transfer.signatureData
    });

    // Execute blockchain signature transfer
    let blockchainResult = null;
    let transferSuccess = false;
    
    if (blockchainService.isConnected()) {
      try {
        console.log('🔗 Executing blockchain signature transfer...');
        
        blockchainResult = await blockchainService.executeSignatureTransfer(
          transfer.propertyId,
          transfer.sellerWalletAddress,
          transfer.buyerWalletAddress,
          transfer.signatureData.signature,
          transfer.signatureData.nonce,
          transfer.signatureData.deadline
        );
        
        console.log('✅ Blockchain signature transfer successful:', blockchainResult);
        transferSuccess = true;
        
      } catch (blockchainError) {
        console.error('❌ Blockchain signature transfer failed:', blockchainError.message);
        return res.status(400).json({
          success: false,
          error: `Blockchain transfer failed: ${blockchainError.message}`
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: 'Blockchain service not available'
      });
    }

    // Update database ownership if blockchain transfer succeeded
    if (transferSuccess) {
      const buyer = await User.findById(buyerId);
      const property = await Land.findOne({ tokenId: transfer.propertyId });
      
      if (buyer && property) {
        // Update property ownership
        const oldOwner = {
          userId: property.userId,
          userEmail: property.userEmail,
          ownerName: property.ownerName
        };
        
        property.userId = buyerId;
        property.userEmail = buyer.email;
        property.userGoogleId = buyer.googleId;
        property.owner = transfer.buyerWalletAddress;
        property.ownerName = buyer.name;
        property.transactionHash = blockchainResult.transactionHash;
        property.blockNumber = blockchainResult.blockNumber;
        
        // Add to transfer history
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
          transferHash: blockchainResult.transferHash,
          signatureHash: blockchainResult.signatureHash,
          price: transfer.price,
          blockchainTransfer: true,
          signatureTransfer: true
        });
        
        await property.save();
      }
    }

    // Update transfer status
    transfer.status = 'completed';
    transfer.buyerId = buyerId;
    transfer.completedAt = new Date();
    transfer.transactionHash = blockchainResult.transactionHash;
    transfer.blockNumber = blockchainResult.blockNumber;
    transfer.transferHash = blockchainResult.transferHash;
    transfer.signatureHash = blockchainResult.signatureHash;
    
    await transfer.save();
    
    console.log(`✅ Signature transfer completed for: ${transferKey}`);
    
    res.json({
      success: true,
      message: 'Signature transfer completed successfully! Property ownership has been transferred.',
      blockchainResult: {
        transactionHash: blockchainResult.transactionHash,
        transferHash: blockchainResult.transferHash,
        signatureHash: blockchainResult.signatureHash,
        blockNumber: blockchainResult.blockNumber
      }
    });
    
  } catch (error) {
    console.error('Execute signature transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get signature transfer details
const getSignatureTransferDetails = async (req, res) => {
  try {
    const { transferKey } = req.params;
    console.log('🔍 Getting signature transfer details for key:', transferKey);
    
    const transfer = await PropertyTransfer.findOne({ transferKey });
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Invalid transfer key'
      });
    }
    
    // Get property details
    const property = await Land.findOne({ tokenId: transfer.propertyId });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Get seller details
    const seller = await User.findById(transfer.sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    res.json({
      success: true,
      transfer: {
        key: transfer.transferKey,
        status: transfer.status,
        price: transfer.price,
        expiresAt: transfer.expiresAt,
        sellerWalletAddress: transfer.sellerWalletAddress,
        buyerWalletAddress: transfer.buyerWalletAddress,
        signatureData: transfer.signatureData,
        transactionHash: transfer.transactionHash,
        transferHash: transfer.transferHash,
        signatureHash: transfer.signatureHash
      },
      buyerEmail: transfer.buyerEmail,
      property: {
        tokenId: property.tokenId,
        ownerName: property.ownerName,
        area: property.area,
        latitude: property.latitude,
        longitude: property.longitude
      },
      seller: {
        name: seller.name,
        email: seller.email
      }
    });
    
  } catch (error) {
    console.error('Get signature transfer details error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  generateTransferSignature,
  executeSignatureTransfer,
  getSignatureTransferDetails
};