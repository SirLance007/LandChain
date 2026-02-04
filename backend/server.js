// File: backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config(); // Load env first

const passport = require('./config/passport'); // Then load passport
const { blockchainService } = require('./utils/blockchain');

const app = express();

// Trust proxy for Render/Heroku (required for secure cookies and correct protocol detection)
app.set('trust proxy', 1);

// Middleware
// Middleware
const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
// Add Render frontend URL if available (handling both full URL and host-only)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  if (!process.env.FRONTEND_URL.startsWith('http')) {
    allowedOrigins.push(`https://${process.env.FRONTEND_URL}`);
  }
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
// Session configuration
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

app.use(session({
  secret: process.env.SESSION_SECRET || 'landchain-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // true for HTTPS
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  proxy: true // Required for Render
}));

// Debug Middleware for Sessions
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - SessionID: ${req.sessionID} - User: ${req.session?.passport?.user || 'Guest'}`);
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/upload', require('./routes/uploadRoute'));
app.use('/api/land', require('./routes/landRoute'));
app.use('/api/documents', require('./routes/documentRoute'));
app.use('/api/transfer', require('./routes/transferRoute'));
app.use('/api/signature-transfer', require('./routes/signatureTransferRoute')); // Signature transfers
app.use('/api', require('./debug-nft-ownership')); // Debug routes

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