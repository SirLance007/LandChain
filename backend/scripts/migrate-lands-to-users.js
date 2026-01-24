// Migration script to link existing lands to users based on email/name matching

require('dotenv').config();
const mongoose = require('mongoose');
const Land = require('../models/Land');
const User = require('../models/User');

async function migrateLandsToUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📋 Found ${users.length} users`);

    // Get all lands without userId
    const landsWithoutUser = await Land.find({ userId: { $exists: false } });
    console.log(`📋 Found ${landsWithoutUser.length} lands without userId`);

    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const land of landsWithoutUser) {
      // Try to match by owner name with user name
      const matchingUser = users.find(user => {
        const userName = user.name.toLowerCase();
        const landOwnerName = land.ownerName.toLowerCase();
        
        // Check if names match (partial or full)
        return userName.includes(landOwnerName) || landOwnerName.includes(userName);
      });

      if (matchingUser) {
        await Land.findByIdAndUpdate(land._id, { userId: matchingUser._id });
        console.log(`✅ Linked Land #${land.tokenId} (${land.ownerName}) → User: ${matchingUser.name} (${matchingUser.email})`);
        matchedCount++;
      } else {
        console.log(`⚠️  No matching user found for Land #${land.tokenId} (${land.ownerName})`);
        unmatchedCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Matched and linked: ${matchedCount} lands`);
    console.log(`⚠️  Unmatched: ${unmatchedCount} lands`);

    // Show final stats
    const totalLandsWithUser = await Land.countDocuments({ userId: { $exists: true } });
    console.log(`📈 Total lands with userId: ${totalLandsWithUser}`);

    await mongoose.disconnect();
    console.log('✅ Migration completed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateLandsToUsers();