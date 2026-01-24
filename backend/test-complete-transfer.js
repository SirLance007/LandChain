// Test Complete Ownership Transfer
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const PropertyTransfer = require('./models/PropertyTransfer');
const Land = require('./models/Land');
const User = require('./models/User');

async function testCompleteTransfer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a verified land
    const land = await Land.findOne({ status: 'verified' });
    if (!land) {
      console.log('❌ No verified land found');
      return;
    }

    console.log(`🏠 Original Property #${land.tokenId}:`);
    console.log(`   Owner: ${land.ownerName} (${land.userEmail})`);
    console.log(`   User ID: ${land.userId}`);

    // Find or create a buyer user
    let buyer = await User.findOne({ email: 'buyer@test.com' });
    if (!buyer) {
      buyer = new User({
        googleId: 'test_buyer_123',
        email: 'buyer@test.com',
        name: 'Test Buyer',
        picture: 'https://example.com/buyer.jpg'
      });
      await buyer.save();
      console.log('✅ Created test buyer user');
    }

    console.log(`👤 Buyer: ${buyer.name} (${buyer.email})`);
    console.log(`   Buyer ID: ${buyer._id}`);

    // Create a transfer that's ready for seller confirmation
    const transferKey = crypto.randomBytes(32).toString('hex');
    
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId: land.tokenId,
      sellerId: land.userId,
      sellerEmail: land.userEmail,
      buyerEmail: buyer.email,
      buyerId: buyer._id.toString(),
      buyerSignature: 'buyer_signature_123',
      buyerSignedAt: new Date(),
      price: 5000000,
      status: 'buyer_accepted', // Ready for seller confirmation
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await transfer.save();
    console.log(`\n🔄 Transfer created and ready for seller confirmation:`);
    console.log(`   Transfer Key: ${transferKey.substring(0, 16)}...`);
    console.log(`   Status: ${transfer.status}`);
    console.log(`   Price: ₹${transfer.price.toLocaleString()}`);

    console.log(`\n🌐 Seller can confirm at: http://localhost:3001/transfer/${transferKey}`);
    console.log(`\n📋 After confirmation:`);
    console.log(`   - Property will be removed from seller's My Lands`);
    console.log(`   - Property will appear in buyer's My Lands`);
    console.log(`   - Ownership will be transferred in database`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCompleteTransfer();