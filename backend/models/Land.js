// File: backend/models/Land.js

const mongoose = require('mongoose');

const documentMetadataSchema = new mongoose.Schema({
  ipfsHash: String,
  fileName: String,
  mimeType: String,
  fileSize: Number,
  isEncrypted: { type: Boolean, default: false },
  encryptionMethod: String,
  verificationHash: String,
  originalFileHash: String,
  uploadedAt: { type: Date, default: Date.now }
});

const landSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true // Add index for faster queries
  },
  userEmail: {
    type: String,
    required: true,
    index: true // Add index for email-based queries
  },
  userGoogleId: {
    type: String,
    required: true,
    index: true // Add index for googleId-based queries
  },
  owner: {
    type: String,
    required: true
  },
  ownerName: String,
  ownerPhone: String,
  ipfsHash: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  area: Number,
  documents: [String],
  documentMetadata: [documentMetadataSchema], // New: Encryption metadata
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  transactionHash: String,
  blockNumber: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Land', landSchema);