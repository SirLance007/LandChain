// Script to clear all lands from database for fresh start
require('dotenv').config();
const mongoose = require('mongoose');
const Land = require('./models/Land');
const PropertyTransfer = require('./models/PropertyTransfer');

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database for fresh start...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Count existing records
    const landCount = await Land.countDocuments();
    const transferCount = await PropertyTransfer.countDocuments();
    
    console.log(`📊 Current database state:`);
    console.log(`   Lands: ${landCount}`);
    console.log(`   Transfers: ${transferCount}`);
    
    if (landCount === 0 && transferCount === 0) {
      console.log('✅ Database is already clean!');
      process.exit(0);
    }
    
    console.log('\n🗑️ Removing all records...');
    
    // Remove all lands
    const landResult = await Land.deleteMany({});
    console.log(`✅ Removed ${landResult.deletedCount} lands`);
    
    // Remove all transfers
    const transferResult = await PropertyTransfer.deleteMany({});
    console.log(`✅ Removed ${transferResult.deletedCount} transfers`);
    
    // Verify cleanup
    const finalLandCount = await Land.countDocuments();
    const finalTransferCount = await PropertyTransfer.countDocuments();
    
    console.log(`\n📊 Final database state:`);
    console.log(`   Lands: ${finalLandCount}`);
    console.log(`   Transfers: ${finalTransferCount}`);
    
    if (finalLandCount === 0 && finalTransferCount === 0) {
      console.log('\n🎉 Database cleared successfully!');
      console.log('✨ Ready for fresh land registration with new contract');
      console.log(`🔗 Contract Address: ${process.env.CONTRACT_ADDRESS}`);
    } else {
      console.log('\n❌ Database cleanup incomplete');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

clearDatabase();