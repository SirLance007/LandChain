// File: backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { blockchainService } = require('./utils/blockchain');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Initialize blockchain service
blockchainService.initialize()
  .then((success) => {
    if (success) {
      console.log('🔗 Blockchain service initialized successfully');
    } else {
      console.log('⚠️ Blockchain service initialization failed - running in database-only mode');
    }
  });

// Routes
app.use('/api/upload', require('./routes/uploadRoute'));
app.use('/api/land', require('./routes/landRoute'));
app.use('/api/documents', require('./routes/documentRoute'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    blockchain: blockchainService.isConnected() ? 'Connected' : 'Disconnected'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});