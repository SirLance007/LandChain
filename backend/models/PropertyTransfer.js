// Property Transfer Model
const mongoose = require('mongoose');

const propertyTransferSchema = new mongoose.Schema({
  transferKey: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  propertyId: {
    type: Number,
    required: true,
    ref: 'Land'
  },
  
  // Seller Info
  sellerId: {
    type: String,
    required: true
  },
  sellerEmail: {
    type: String,
    required: true
  },
  sellerSignature: String,
  sellerSignedAt: Date,
  sellerWalletAddress: String,
  
  // Buyer Info
  buyerId: String,
  buyerEmail: String,
  buyerSignature: String,
  buyerSignedAt: Date,
  buyerWalletAddress: String,
  
  // Transfer Details
  price: Number,
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Status & Timing
  status: {
    type: String,
    enum: ['pending', 'buyer_accepted', 'both_signed', 'completed', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: Date,
  
  // Blockchain
  transactionHash: String,
  blockNumber: Number,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-expire transfers
propertyTransferSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PropertyTransfer', propertyTransferSchema);