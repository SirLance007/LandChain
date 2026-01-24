// Script to fix NFT ownership - transfer all NFTs to admin wallet for proper management
require('dotenv').config();
const { blockchainService } = require('./utils/blockchain');

async function fixNFTOwnership() {
  console.log('🔧 Fixing NFT Ownership for Transfer Management\n');
  
  try {
    // Initialize blockchain service
    const initialized = await blockchainService.initialize();
    if (!initialized) {
      console.log('❌ Blockchain initialization failed');
      return;
    }
    
    const adminWallet = '0x1d524D361EF86057dF3583c87D1815032fdb8dba';
    console.log('🔑 Admin wallet:', adminWallet);
    
    // Check total NFTs
    const totalSupply = await blockchainService.getTotalSupply();
    console.log(`📊 Total NFTs in contract: ${totalSupply}\n`);
    
    // Check ownership of each NFT and transfer to admin if needed
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      try {
        console.log(`🏠 Checking NFT #${tokenId}:`);
        const landData = await blockchainService.getLandFromBlockchain(tokenId);
        console.log(`   Current Owner: ${landData.owner}`);
        
        if (landData.owner.toLowerCase() === adminWallet.toLowerCase()) {
          console.log('   ✅ Already owned by admin wallet');
        } else {
          console.log('   ⚠️ Not owned by admin wallet');
          console.log('   💡 This NFT needs to be transferred to admin for management');
          console.log('   🔧 Manual transfer required from current owner');
          
          // Note: We can't automatically transfer from other wallets
          // The current owner would need to call transferLand function
          console.log(`   📋 Transfer command for current owner:`);
          console.log(`      Contract: 0x2CfB760420FbD34cf7b769a78D0eF4eA4a89d600`);
          console.log(`      Function: transferLand(${tokenId}, "${adminWallet}")`);
        }
        console.log('');
        
      } catch (error) {
        console.log(`❌ Error checking NFT #${tokenId}:`, error.message);
      }
    }
    
    console.log('💡 Summary:');
    console.log('   - NFTs owned by admin wallet can be transferred automatically');
    console.log('   - NFTs owned by other wallets need manual transfer to admin');
    console.log('   - Once all NFTs are with admin, transfers will work properly');
    console.log('\n🔗 Contract Explorer:');
    console.log('   https://testnet-explorer.monad.xyz/address/0x2CfB760420FbD34cf7b769a78D0eF4eA4a89d600');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixNFTOwnership();