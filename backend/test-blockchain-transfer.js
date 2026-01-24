// Test script to verify blockchain transfer functionality
require('dotenv').config();
const { blockchainService } = require('./utils/blockchain');

async function testBlockchainTransfer() {
  console.log('🧪 Testing Blockchain Transfer Functionality\n');
  
  try {
    // Initialize blockchain service
    console.log('1️⃣ Initializing blockchain service...');
    const initialized = await blockchainService.initialize();
    
    if (!initialized) {
      console.log('❌ Blockchain initialization failed');
      return;
    }
    
    console.log('✅ Blockchain service initialized successfully\n');
    
    // Get network info
    console.log('2️⃣ Network Information:');
    const networkInfo = blockchainService.getNetworkInfo();
    console.log('   RPC URL:', networkInfo.rpcUrl);
    console.log('   Contract:', networkInfo.contractAddress);
    console.log('   Chain ID:', networkInfo.chainId);
    console.log('   Network:', networkInfo.networkName);
    console.log('');
    
    // Get total supply
    console.log('3️⃣ Contract Status:');
    const totalSupply = await blockchainService.getTotalSupply();
    console.log('   Total NFTs minted:', totalSupply);
    console.log('');
    
    // Test ownership check for existing NFT
    if (totalSupply > 0) {
      console.log('4️⃣ Testing ownership check for NFT #0...');
      try {
        const landData = await blockchainService.getLandFromBlockchain(0);
        console.log('   Current owner:', landData.owner);
        console.log('   IPFS Hash:', landData.ipfsHash);
        console.log('   Area:', landData.area);
        console.log('   Registered at:', landData.registeredAt);
        console.log('');
        
        // Test transfer (you can uncomment and modify this for actual testing)
        /*
        console.log('5️⃣ Testing NFT transfer...');
        const testBuyerAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4'; // Replace with actual buyer address
        
        const transferResult = await blockchainService.transferLandNFT(0, testBuyerAddress);
        console.log('   Transfer result:', transferResult);
        
        // Verify transfer
        const newLandData = await blockchainService.getLandFromBlockchain(0);
        console.log('   New owner:', newLandData.owner);
        console.log('   Transfer successful:', newLandData.owner.toLowerCase() === testBuyerAddress.toLowerCase());
        */
        
      } catch (error) {
        console.log('❌ Error checking NFT #0:', error.message);
      }
    } else {
      console.log('4️⃣ No NFTs found in contract');
    }
    
    console.log('\n🎉 Blockchain test completed successfully!');
    console.log('\n💡 To test actual transfers:');
    console.log('   1. Uncomment the transfer test section above');
    console.log('   2. Replace testBuyerAddress with actual wallet address');
    console.log('   3. Run the script again');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testBlockchainTransfer();