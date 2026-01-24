// Test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI);
    
    // Connect with timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Test the Land model
    const Land = require('./models/Land');
    
    console.log('📋 Fetching lands...');
    const lands = await Land.find({}).limit(5);
    
    console.log(`✅ Found ${lands.length} lands:`);
    lands.forEach(land => {
      console.log(`  - Token ID: ${land.tokenId}, Owner: ${land.ownerName}, Status: ${land.status}`);
    });
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('💡 Suggestion: Check internet connection or MongoDB cluster status');
    }
    
    if (error.message.includes('authentication')) {
      console.log('💡 Suggestion: Check MongoDB credentials');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();