// Script to verify which contract address is working
const axios = require('axios');

const CONTRACT_ADDRESSES = [
  '0x2CfB760420FbD34cf7b769a78D0eF4eA4a89d600',
  '0x654b3F530043786020dC54c7C91ac3D27500E3e8'
];

async function verifyContract(address) {
  try {
    console.log(`🔍 Checking contract: ${address}`);
    
    // Check on Monad Explorer
    const explorerUrl = `https://testnet-explorer.monad.xyz/address/${address}`;
    console.log(`🌐 Explorer: ${explorerUrl}`);
    
    // Try to make a simple RPC call to check if contract exists
    const rpcUrl = 'https://testnet-rpc.monad.xyz';
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [address, 'latest'],
      id: 1
    });
    
    const code = response.data.result;
    
    if (code && code !== '0x') {
      console.log(`✅ Contract exists at ${address}`);
      console.log(`📝 Code length: ${code.length} characters`);
      return true;
    } else {
      console.log(`❌ No contract found at ${address}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${address}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Verifying LandChain Contract Addresses...\n');
  
  for (const address of CONTRACT_ADDRESSES) {
    const exists = await verifyContract(address);
    console.log('---');
    
    if (exists) {
      console.log(`\n🎯 ACTIVE CONTRACT ADDRESS: ${address}`);
      console.log(`🌐 Explorer: https://testnet-explorer.monad.xyz/address/${address}`);
      console.log(`\n📋 Use this address in your .env files:`);
      console.log(`CONTRACT_ADDRESS=${address}`);
      break;
    }
  }
}

main().catch(console.error);