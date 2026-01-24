// Complete Transfer Flow Test
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const PropertyTransfer = require('./models/PropertyTransfer');
const Land = require('./models/Land');
const User = require('./models/User');

async function testTransferFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Find a verified land
    const verifiedLand = await Land.findOne({ status: 'verified' });
    if (!verifiedLand) {
      console.log('❌ No verified land found');
      return;
    }

    console.log(`\n🏠 Found Property #${verifiedLand.tokenId}`);
    console.log(`   Owner: ${verifiedLand.ownerName}`);
    console.log(`   Area: ${verifiedLand.area} sq ft`);
    console.log(`   Status: ${verifiedLand.status}`);

    // Step 2: Generate transfer key (simulate seller action)
    const transferKey = crypto.randomBytes(32).toString('hex');
    const buyerEmail = 'buyer@example.com';
    const price = 5000000;

    console.log(`\n🔑 Generated Transfer Key: ${transferKey.substring(0, 16)}...`);
    console.log(`💰 Price: ₹${price.toLocaleString()}`);
    console.log(`📧 Buyer Email: ${buyerEmail}`);

    // Step 3: Create transfer record
    const transfer = new PropertyTransfer({
      transferKey,
      propertyId: verifiedLand.tokenId,
      sellerId: 'seller_user_id',
      sellerEmail: 'seller@example.com',
      buyerEmail,
      price,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await transfer.save();
    console.log(`\n✅ Transfer record created`);
    console.log(`   Status: ${transfer.status}`);
    console.log(`   Expires: ${transfer.expiresAt.toLocaleDateString()}`);

    // Step 4: Simulate buyer accessing transfer URL
    console.log(`\n🌐 Transfer URL: http://localhost:3001/transfer/${transferKey}`);
    
    // Step 5: Simulate buyer acceptance
    transfer.buyerId = 'buyer_user_id';
    transfer.buyerEmail = buyerEmail;
    transfer.buyerSignature = `buyer_signature_${Date.now()}`;
    transfer.buyerSignedAt = new Date();
    transfer.buyerWalletAddress = '0x1234567890abcdef';
    transfer.status = 'buyer_accepted';
    
    await transfer.save();
    console.log(`\n✅ Buyer accepted transfer`);
    console.log(`   New Status: ${transfer.status}`);
    console.log(`   Buyer Signed At: ${transfer.buyerSignedAt.toLocaleString()}`);

    // Step 6: Show final transfer details
    console.log(`\n📋 Final Transfer Details:`);
    console.log(`   Transfer Key: ${transferKey.substring(0, 16)}...`);
    console.log(`   Property: #${transfer.propertyId}`);
    console.log(`   Seller: ${transfer.sellerEmail}`);
    console.log(`   Buyer: ${transfer.buyerEmail}`);
    console.log(`   Price: ₹${transfer.price?.toLocaleString()}`);
    console.log(`   Status: ${transfer.status}`);
    console.log(`   Created: ${transfer.createdAt.toLocaleString()}`);
    console.log(`   Expires: ${transfer.expiresAt.toLocaleDateString()}`);

    // Cleanup - remove test transfer
    await PropertyTransfer.deleteOne({ transferKey });
    console.log(`\n🧹 Cleaned up test transfer record`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testTransferFlow();