// Simple Transfer Test
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const PropertyTransfer = require('./models/PropertyTransfer');
const Land = require('./models/Land');

async function testTransfer() {
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
    console.log(`   User ID: ${land.userId}`);

    // Create a test transfer
    const transferKey = crypto.randomBytes(32).toString('hex');
    
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId: land.tokenId,
      sellerId: land.userId, // Use the actual userId from land
      sellerEmail: land.userEmail,
      buyerEmail: 'buyer@test.com',
      price: 1000000,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await transfer.save();
    console.log(`✅ Transfer created with key: ${transferKey.substring(0, 16)}...`);

    // Test getting transfer details
    const transferDetails = await PropertyTransfer.findOne({ transferKey });
    console.log(`✅ Transfer found: ${transferDetails.status}`);

    // Test the API endpoint logic
    const property = await Land.findOne({ tokenId: transferDetails.propertyId });
    console.log(`✅ Property found: ${property.ownerName}`);

    console.log(`\n🌐 Test URL: http://localhost:3001/transfer/${transferKey}`);

    // Cleanup
    await PropertyTransfer.deleteOne({ transferKey });
    console.log('🧹 Cleaned up test transfer');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

testTransfer();