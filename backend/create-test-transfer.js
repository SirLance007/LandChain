// Create Test Transfer
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const PropertyTransfer = require('./models/PropertyTransfer');
const Land = require('./models/Land');

async function createTestTransfer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a verified land
    const land = await Land.findOne({ status: 'verified' });
    if (!land) {
      console.log('❌ No verified land found');
      return;
    }

    console.log(`🏠 Using Property #${land.tokenId} owned by ${land.ownerName}`);

    // Create a test transfer
    const transferKey = crypto.randomBytes(32).toString('hex');
    
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId: land.tokenId,
      sellerId: land.userId,
      sellerEmail: land.userEmail,
      buyerEmail: 'buyer@test.com',
      price: 1000000,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await transfer.save();
    console.log(`✅ Test transfer created!`);
    console.log(`🔑 Transfer Key: ${transferKey}`);
    console.log(`🌐 Test URL: http://localhost:3001/transfer/${transferKey}`);
    console.log(`🔗 API URL: http://localhost:5001/api/transfer/${transferKey}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestTransfer();