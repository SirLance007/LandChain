// File: backend/models/Land.js

const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    unique: true
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
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  transactionHash: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Land', landSchema);