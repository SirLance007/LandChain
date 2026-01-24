// Real blockchain integration for LandChain
const { ethers } = require('ethers');

// Contract ABI (Application Binary Interface)
const LAND_NFT_ABI = [
  "function mintLand(address to, string memory ipfsHash, int256 lat, int256 lon, uint256 area) public returns (uint256)",
  "function transferLand(uint256 tokenId, address to) public",
  "function getLandData(uint256 tokenId) public view returns (tuple(string ipfsHash, int256 latitude, int256 longitude, uint256 area, uint256 registeredAt, address registeredBy))",
  "function getTotalLands() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event LandRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash, uint256 timestamp)",
  "event LandTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🔄 Initializing blockchain service...');
      
      // Connect to Monad Testnet
      const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
      console.log('🌐 Connecting to RPC:', rpcUrl);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test provider connection
      const blockNumber = await this.provider.getBlockNumber();
      console.log('📦 Current block number:', blockNumber);
      
      // Setup signer (admin wallet)
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('PRIVATE_KEY not found in environment variables');
      }
      console.log('🔑 Private key found, creating signer...');
      
      this.signer = new ethers.Wallet(privateKey, this.provider);
      console.log('👤 Admin wallet address:', this.signer.address);
      
      // Check wallet balance
      const balance = await this.provider.getBalance(this.signer.address);
      console.log('💰 Admin wallet balance:', ethers.formatEther(balance), 'MON');
      
      // Connect to deployed contract
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('CONTRACT_ADDRESS not found in environment variables');
      }
      console.log('📋 Contract address:', contractAddress);
      
      this.contract = new ethers.Contract(contractAddress, LAND_NFT_ABI, this.signer);
      
      // Test contract connection
      const totalLands = await this.contract.getTotalLands();
      console.log('🏠 Total lands in contract:', totalLands.toString());
      
      // Test network
      const network = await this.provider.getNetwork();
      console.log('✅ Connected to blockchain:', {
        network: network.name,
        chainId: network.chainId.toString(),
        contractAddress: contractAddress,
        adminWallet: this.signer.address,
        balance: ethers.formatEther(balance) + ' MON'
      });
      
      this.isInitialized = true;
      return true;
      
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      console.error('Full error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async transferLandNFTWithUserWallets(tokenId, fromAddress, toAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔄 Transferring NFT with user wallets...', {
        tokenId,
        from: fromAddress,
        to: toAddress
      });

      // Note: This is a simplified version. In a real implementation, 
      // the seller would need to sign the transaction from their wallet.
      // For now, we'll use the admin wallet but record the correct addresses.
      
      // Call smart contract transfer function (using admin wallet for gas)
      const tx = await this.contract.transferLand(tokenId, toAddress);

      console.log('📝 Transfer transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transfer transaction confirmed:', receipt.hash);

      // Extract transfer event
      const transferEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'LandTransferred'
      );

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: fromAddress, // Record the actual seller address
        to: toAddress,     // Record the actual buyer address
        actualFrom: transferEvent ? transferEvent.args[1] : this.signer.address, // Admin wallet that paid gas
        actualTo: transferEvent ? transferEvent.args[2] : toAddress
      };

    } catch (error) {
      console.error('❌ NFT transfer with user wallets failed:', error);
      throw new Error(`Blockchain transfer failed: ${error.message}`);
    }
  }

  async transferLandNFT(tokenId, newOwnerAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔄 Transferring NFT on blockchain...', {
        tokenId,
        newOwner: newOwnerAddress
      });

      // First check current owner
      const currentOwner = await this.contract.ownerOf(tokenId);
      console.log('👤 Current NFT owner:', currentOwner);
      console.log('🎯 Transferring to:', newOwnerAddress);
      
      if (currentOwner.toLowerCase() === newOwnerAddress.toLowerCase()) {
        console.log('⚠️ NFT already owned by target address');
        return {
          success: true,
          transactionHash: 'already-owned',
          blockNumber: 0,
          gasUsed: '0',
          from: currentOwner,
          to: newOwnerAddress,
          message: 'NFT already owned by target address'
        };
      }

      // Estimate gas for the transfer
      const gasEstimate = await this.contract.transferLand.estimateGas(tokenId, newOwnerAddress);
      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Call smart contract transfer function
      const tx = await this.contract.transferLand(tokenId, newOwnerAddress, {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });

      console.log('📝 Transfer transaction submitted:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transfer transaction confirmed:', receipt.hash);
      console.log('📦 Block number:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      // Verify the transfer worked
      const newOwner = await this.contract.ownerOf(tokenId);
      console.log('🔍 Verified new owner:', newOwner);

      // Extract transfer event
      let transferEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'LandTransferred') {
            transferEvent = parsedLog;
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }

      const result = {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: transferEvent ? transferEvent.args[1] : currentOwner,
        to: transferEvent ? transferEvent.args[2] : newOwnerAddress,
        verifiedNewOwner: newOwner
      };

      console.log('🎉 NFT transfer completed successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ NFT transfer failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Not the owner')) {
        throw new Error('Transfer failed: Admin wallet is not the current owner of this NFT');
      } else if (error.message.includes('Invalid recipient')) {
        throw new Error('Transfer failed: Invalid recipient address');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Transfer failed: Insufficient funds for gas fees');
      } else {
        throw new Error(`Blockchain transfer failed: ${error.message}`);
      }
    }
  }

  async mintLandNFT(landData) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const { owner, ipfsHash, latitude, longitude, area } = landData;
      
      console.log('🔗 Minting NFT on blockchain...', {
        owner,
        ipfsHash,
        latitude,
        longitude,
        area
      });

      // Convert coordinates to integers (multiply by 1000000 for precision)
      const latInt = Math.round(latitude * 1000000);
      const lonInt = Math.round(longitude * 1000000);

      // Call smart contract
      const tx = await this.contract.mintLand(
        owner,
        ipfsHash,
        latInt,
        lonInt,
        area
      );

      console.log('📝 Transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);

      // Extract token ID from events
      const landRegisteredEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'LandRegistered'
      );

      let tokenId = null;
      if (landRegisteredEvent) {
        tokenId = landRegisteredEvent.args[0].toString();
      }

      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId: tokenId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ NFT minting failed:', error);
      throw new Error(`Blockchain minting failed: ${error.message}`);
    }
  }

  async getLandFromBlockchain(tokenId) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const landData = await this.contract.getLandData(tokenId);
      const owner = await this.contract.ownerOf(tokenId);

      return {
        tokenId: tokenId,
        owner: owner,
        ipfsHash: landData.ipfsHash,
        latitude: Number(landData.latitude) / 1000000,
        longitude: Number(landData.longitude) / 1000000,
        area: Number(landData.area),
        registeredAt: new Date(Number(landData.registeredAt) * 1000),
        registeredBy: landData.registeredBy
      };

    } catch (error) {
      console.error('❌ Failed to get land from blockchain:', error);
      throw new Error(`Failed to fetch from blockchain: ${error.message}`);
    }
  }

  async getTotalSupply() {
    if (!this.isInitialized) {
      return 0;
    }

    try {
      const total = await this.contract.getTotalLands();
      return Number(total);
    } catch (error) {
      console.error('❌ Failed to get total supply:', error);
      return 0;
    }
  }

  isConnected() {
    return this.isInitialized;
  }

  getContractAddress() {
    return process.env.CONTRACT_ADDRESS;
  }

  getNetworkInfo() {
    if (!this.provider) return null;
    
    return {
      rpcUrl: process.env.MONAD_RPC_URL,
      contractAddress: process.env.CONTRACT_ADDRESS,
      chainId: 10143,
      networkName: 'Monad Testnet'
    };
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = { blockchainService };