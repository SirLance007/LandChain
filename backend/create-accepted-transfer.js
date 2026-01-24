// Create Buyer Accepted Transfer
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const PropertyTransfer = require('./models/PropertyTransfer');
const Land = require('./models/Land');

async function createAcceptedTransfer() {
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

    // Create a transfer that buyer has already accepted
    const transferKey = crypto.randomBytes(32).toString('hex');
    const buyerEmail = 'buyer@example.com';
    
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId: land.tokenId,
      sellerId: land.userId,
      sellerEmail: land.userEmail,
      buyerEmail: buyerEmail,
      buyerId: 'dummy_buyer_id',
      buyerSignature: 'buyer_signature_123',
      buyerSignedAt: new Date(),
      price: 3500000,
      status: 'buyer_accepted', // Already accepted by buyer
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await transfer.save();
    console.log(`✅ Buyer accepted transfer created!`);
    console.log(`🔑 Transfer Key: ${transferKey}`);
    console.log(`📧 Buyer Email: ${buyerEmail}`);
    console.log(`💰 Price: ₹${transfer.price.toLocaleString()}`);
    console.log(`📊 Status: ${transfer.status}`);
    console.log(`🌐 Seller URL: http://localhost:3001/transfer/${transferKey}`);
    console.log(`\n🔔 Seller should see notification in My Lands page!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAcceptedTransfer();