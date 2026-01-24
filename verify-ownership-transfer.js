// Script to verify ownership transfer on blockchain
const axios = require('axios');

// Your contract details
const CONTRACT_ADDRESS = '0x2CfB760420FbD34cf7b769a78D0eF4eA4a89d600';
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

// Contract ABI for ownerOf function
const OWNER_OF_ABI = {
  "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
  "name": "ownerOf",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
};

async function checkOwnership(tokenId, expectedOwner) {
  try {
    console.log(`🔍 Checking ownership of Property #${tokenId}...`);
    console.log(`📍 Expected Owner: ${expectedOwner}`);
    console.log(`📋 Contract: ${CONTRACT_ADDRESS}`);
    console.log('---');

    // Encode function call for ownerOf
    const functionSignature = '0x6352211e'; // ownerOf function signature
    const paddedTokenId = tokenId.toString(16).padStart(64, '0');
    const data = functionSignature + paddedTokenId;

    // Make RPC call
    const response = await axios.post(MONAD_RPC_URL, {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{
        to: CONTRACT_ADDRESS,
        data: data
      }, 'latest'],
      id: 1
    });

    if (response.data.error) {
      console.log('❌ RPC Error:', response.data.error);
      return false;
    }

    // Decode response
    const result = response.data.result;
    if (!result || result === '0x') {
      console.log('❌ No owner found - NFT might not exist');
      return false;
    }

    // Extract address from response (last 40 characters)
    const ownerAddress = '0x' + result.slice(-40);
    
    console.log(`✅ Current Owner: ${ownerAddress}`);
    console.log(`🎯 Expected Owner: ${expectedOwner}`);
    
    const isCorrectOwner = ownerAddress.toLowerCase() === expectedOwner.toLowerCase();
    
    if (isCorrectOwner) {
      console.log('🎉 OWNERSHIP TRANSFER VERIFIED!');
      console.log('✅ NFT is now owned by the correct address');
    } else {
      console.log('❌ OWNERSHIP MISMATCH!');
      console.log('⚠️ NFT is not owned by expected address');
    }

    console.log('\n🔗 Verification Links:');
    console.log(`📍 Contract: https://testnet-explorer.monad.xyz/address/${CONTRACT_ADDRESS}`);
    console.log(`👤 Owner: https://testnet-explorer.monad.xyz/address/${ownerAddress}`);
    
    return isCorrectOwner;

  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  }
}

// Example usage
async function verifyTransfer() {
  console.log('🔍 LandChain Ownership Verification\n');
  
  // Replace these with actual values
  const PROPERTY_TOKEN_ID = 1; // Your property token ID
  const BUYER_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4'; // Buyer's wallet
  
  console.log('📋 Verification Details:');
  console.log(`   Property Token ID: ${PROPERTY_TOKEN_ID}`);
  console.log(`   Expected New Owner: ${BUYER_WALLET}`);
  console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
  console.log('');
  
  const isVerified = await checkOwnership(PROPERTY_TOKEN_ID, BUYER_WALLET);
  
  if (isVerified) {
    console.log('\n🎉 SUCCESS: Ownership transfer verified on blockchain!');
  } else {
    console.log('\n❌ FAILED: Ownership transfer not verified');
    console.log('💡 Possible reasons:');
    console.log('   - Transaction still pending');
    console.log('   - Wrong token ID or wallet address');
    console.log('   - Blockchain sync delay');
  }
}

// Run verification
verifyTransfer();