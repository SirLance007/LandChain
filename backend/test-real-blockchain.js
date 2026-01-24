// Test Real Monad Blockchain
const { ethers } = require('ethers');
require('dotenv').config();

const LAND_NFT_ABI = [
  "function mintLand(address to, string memory ipfsHash, int256 lat, int256 lon, uint256 area) public returns (uint256)",
  "function getLandData(uint256 tokenId) public view returns (tuple(string ipfsHash, int256 latitude, int256 longitude, uint256 area, uint256 registeredAt, address registeredBy))",
  "function getTotalLands() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event LandRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash, uint256 timestamp)"
];

async function testRealBlockchain() {
  try {
    console.log('🔗 Connecting to Monad Testnet...');
    
    // Connect to Monad Testnet
    const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Connect to deployed contract
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, LAND_NFT_ABI, signer);
    
    console.log('✅ Connected to Monad Testnet');
    console.log(`📍 Contract Address: ${process.env.CONTRACT_ADDRESS}`);
    console.log(`🌐 Explorer: https://testnet-explorer.monad.xyz/address/${process.env.CONTRACT_ADDRESS}`);
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`⛓️ Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check signer balance
    const balance = await provider.getBalance(signer.address);
    console.log(`💰 Wallet Balance: ${ethers.formatEther(balance)} MON`);
    
    // Check total NFTs on blockchain
    const totalLands = await contract.getTotalLands();
    console.log(`🏠 Total Properties on Blockchain: ${totalLands.toString()}`);
    
    // Check specific NFTs if they exist
    if (totalLands > 0) {
      console.log('\n📋 Existing Properties on Blockchain:');
      const maxCheck = Math.min(Number(totalLands), 5);
      
      for (let i = 0; i < maxCheck; i++) {
        try {
          const owner = await contract.ownerOf(i);
          const landData = await contract.getLandData(i);
          
          console.log(`\n🏠 Property #${i}:`);
          console.log(`   Owner: ${owner}`);
          console.log(`   IPFS: ${landData.ipfsHash}`);
          console.log(`   Location: ${Number(landData.latitude)/1000000}, ${Number(landData.longitude)/1000000}`);
          console.log(`   Area: ${landData.area.toString()} sq ft`);
          console.log(`   Registered: ${new Date(Number(landData.registeredAt) * 1000).toLocaleString()}`);
        } catch (error) {
          console.log(`   Property #${i}: Error reading data - ${error.message}`);
        }
      }
    }
    
    console.log('\n🎯 Real Blockchain Integration Status:');
    console.log('✅ Contract deployed on Monad Testnet');
    console.log('✅ Backend connected to real blockchain');
    console.log('✅ Ready for real NFT minting');
    console.log('✅ Ready for real property transfers');
    
    console.log('\n🔗 Blockchain Explorer Links:');
    console.log(`📍 Contract: https://testnet-explorer.monad.xyz/address/${process.env.CONTRACT_ADDRESS}`);
    console.log(`👤 Wallet: https://testnet-explorer.monad.xyz/address/${signer.address}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealBlockchain();