// Check current NFT ownership on blockchain
require('dotenv').config();
const { blockchainService } = require('./utils/blockchain');

async function checkNFTOwnership() {
  console.log('🔍 Checking NFT Ownership on Blockchain\n');
  
  try {
    // Initialize blockchain service
    const initialized = await blockchainService.initialize();
    if (!initialized) {
      console.log('❌ Blockchain initialization failed');
      return;
    }
    
    // Check total NFTs
    const totalSupply = await blockchainService.getTotalSupply();
    console.log(`📊 Total NFTs in contract: ${totalSupply}\n`);
    
    // Check ownership of each NFT
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      try {
        console.log(`🏠 NFT #${tokenId}:`);
        const landData = await blockchainService.getLandFromBlockchain(tokenId);
        console.log(`   Owner: ${landData.owner}`);
        console.log(`   IPFS: ${landData.ipfsHash}`);
        console.log(`   Area: ${landData.area}`);
        console.log(`   Registered: ${landData.registeredAt}`);
        console.log('');
      } catch (error) {
        console.log(`❌ Error checking NFT #${tokenId}:`, error.message);
      }
    }
    
    console.log('🔑 Admin wallet address:', '0x1d524D361EF86057dF3583c87D1815032fdb8dba');
    console.log('💡 If admin wallet is not the owner, transfers will fail!');
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkNFTOwnership();