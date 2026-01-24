// Real blockchain integration for LandChain
const { ethers } = require('ethers');

// Contract ABI (Application Binary Interface) - Updated for enhanced contract
const LAND_NFT_ABI = [
  // Admin functions
  "function addRegistrar(address registrar) public",
  "function removeRegistrar(address registrar) public", 
  "function isRegistrar(address account) public view returns (bool)",
  
  // Minting (restricted to registrars)
  "function mintLand(address to, string memory ipfsHash, int256 lat, int256 lon, uint256 area) public returns (uint256)",
  
  // Standard ERC721 transfer functions (no custom transferLand)
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  
  // View functions
  "function getLandData(uint256 tokenId) public view returns (tuple(string ipfsHash, int256 latitude, int256 longitude, uint256 area, uint256 registeredAt, address registeredBy, bytes32 landHash))",
  "function getTransferHistory(uint256 tokenId) public view returns (tuple(address from, address to, uint256 timestamp, bytes32 transferHash)[])",
  "function getTokenIdFromTransferHash(bytes32 transferHash) public view returns (uint256)",
  "function checkLandExists(string memory ipfsHash, int256 lat, int256 lon) public view returns (bool)",
  "function getTotalLands() public view returns (uint256)",
  "function getTransferCount(uint256 tokenId) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  
  // Events
  "event LandRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash, bytes32 indexed landHash, uint256 timestamp)",
  "event LandTransferred(uint256 indexed tokenId, address indexed from, address indexed to, bytes32 indexed transferHash, uint256 timestamp)",
  "event RegistrarAdded(address indexed registrar, address indexed addedBy)",
  "event RegistrarRemoved(address indexed registrar, address indexed removedBy)"
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

  async addRegistrar(registrarAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔄 Adding registrar:', registrarAddress);

      const tx = await this.contract.addRegistrar(registrarAddress);
      console.log('📝 Add registrar transaction submitted:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Registrar added successfully:', receipt.hash);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        registrar: registrarAddress
      };

    } catch (error) {
      console.error('❌ Add registrar failed:', error);
      throw new Error(`Add registrar failed: ${error.message}`);
    }
  }

  async removeRegistrar(registrarAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔄 Removing registrar:', registrarAddress);

      const tx = await this.contract.removeRegistrar(registrarAddress);
      console.log('📝 Remove registrar transaction submitted:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Registrar removed successfully:', receipt.hash);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        registrar: registrarAddress
      };

    } catch (error) {
      console.error('❌ Remove registrar failed:', error);
      throw new Error(`Remove registrar failed: ${error.message}`);
    }
  }

  async isRegistrar(address) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const isRegistrar = await this.contract.isRegistrar(address);
      return isRegistrar;
    } catch (error) {
      console.error('❌ Check registrar failed:', error);
      return false;
    }
  }

  async checkLandExists(ipfsHash, latitude, longitude) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      // Convert coordinates to integers (multiply by 1000000 for precision)
      const latInt = Math.round(latitude * 1000000);
      const lonInt = Math.round(longitude * 1000000);

      const exists = await this.contract.checkLandExists(ipfsHash, latInt, lonInt);
      return exists;
    } catch (error) {
      console.error('❌ Check land exists failed:', error);
      return false;
    }
  }

  async getTransferHistory(tokenId) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const history = await this.contract.getTransferHistory(tokenId);
      
      // Convert the result to a more readable format
      return history.map(transfer => ({
        from: transfer.from,
        to: transfer.to,
        timestamp: new Date(Number(transfer.timestamp) * 1000),
        transferHash: transfer.transferHash
      }));

    } catch (error) {
      console.error('❌ Get transfer history failed:', error);
      throw new Error(`Get transfer history failed: ${error.message}`);
    }
  }

  async transferLandNFTViaAdmin(tokenId, newOwnerAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔄 Transferring NFT via admin wallet using safeTransferFrom...', {
        tokenId,
        newOwner: newOwnerAddress
      });

      // First check current owner
      const currentOwner = await this.contract.ownerOf(tokenId);
      console.log('👤 Current NFT owner:', currentOwner);
      console.log('🎯 Transferring to:', newOwnerAddress);
      console.log('🔑 Admin wallet:', this.signer.address);
      
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

      // Check if admin wallet is the owner or approved
      if (currentOwner.toLowerCase() !== this.signer.address.toLowerCase()) {
        console.log('⚠️ Admin wallet is not the current owner');
        console.log('💡 This means the NFT was minted to a different address');
        console.log('🔧 For now, we\'ll simulate the transfer in database only');
        
        // Return a simulated success for database update
        return {
          success: false,
          transactionHash: 'admin-not-owner',
          blockNumber: 0,
          gasUsed: '0',
          from: currentOwner,
          to: newOwnerAddress,
          message: 'Admin wallet is not the owner - database-only transfer',
          requiresOwnerTransfer: true
        };
      }

      // Estimate gas for the transfer using safeTransferFrom
      const gasEstimate = await this.contract.safeTransferFrom.estimateGas(
        currentOwner, 
        newOwnerAddress, 
        tokenId
      );
      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Call standard ERC721 safeTransferFrom function
      const tx = await this.contract.safeTransferFrom(
        currentOwner,
        newOwnerAddress,
        tokenId,
        {
          gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        }
      );

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

      // Extract LandTransferred event (our custom event)
      let transferEvent = null;
      let transferHash = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'LandTransferred') {
            transferEvent = parsedLog;
            transferHash = parsedLog.args[3]; // transferHash is the 4th argument
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
        verifiedNewOwner: newOwner,
        transferHash: transferHash, // Unique transfer hash from contract
        uniqueTransfer: true // This is a real blockchain transfer with unique hash
      };

      console.log('🎉 NFT transfer completed successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ NFT transfer failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('ERC721: caller is not token owner or approved')) {
        throw new Error('Transfer failed: Admin wallet is not the current owner or approved for this NFT');
      } else if (error.message.includes('ERC721: transfer to non ERC721Receiver implementer')) {
        throw new Error('Transfer failed: Recipient cannot receive NFTs');
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
        originalOwner: owner,
        adminWallet: this.signer.address,
        ipfsHash,
        latitude,
        longitude,
        area
      });

      // Convert coordinates to integers (multiply by 1000000 for precision)
      const latInt = Math.round(latitude * 1000000);
      const lonInt = Math.round(longitude * 1000000);

      // Check if land already exists (duplicate prevention)
      const landExists = await this.checkLandExists(ipfsHash, latitude, longitude);
      if (landExists) {
        throw new Error('Land already registered with these coordinates and documents');
      }

      // Check if admin wallet is a registrar
      const isRegistrar = await this.isRegistrar(this.signer.address);
      if (!isRegistrar) {
        console.log('⚠️ Admin wallet is not a registrar, adding as registrar...');
        await this.addRegistrar(this.signer.address);
      }

      // IMPORTANT: Mint to ADMIN WALLET instead of user wallet
      // This allows admin to transfer NFTs later
      console.log('🔑 Minting to admin wallet for transfer management');
      console.log(`   Original owner: ${owner}`);
      console.log(`   Minting to: ${this.signer.address}`);

      // Call smart contract - mint to admin wallet
      const tx = await this.contract.mintLand(
        this.signer.address, // Mint to admin wallet, not user wallet
        ipfsHash,
        latInt,
        lonInt,
        area
      );

      console.log('📝 Transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);

      // Extract token ID and land hash from events
      let tokenId = null;
      let landHash = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'LandRegistered') {
            tokenId = parsedLog.args[0].toString();
            landHash = parsedLog.args[3]; // landHash is the 4th argument
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }

      console.log('🎉 NFT minted successfully to admin wallet!');
      console.log(`   Token ID: ${tokenId}`);
      console.log(`   Admin can now transfer to: ${owner}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId: tokenId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        landHash: landHash,
        duplicateProtection: true,
        mintedToAdmin: true,
        originalOwner: owner
      };

    } catch (error) {
      console.error('❌ NFT minting failed:', error);
      
      if (error.message.includes('land already registered')) {
        throw new Error('Duplicate land registration: This land with these coordinates and documents already exists');
      } else if (error.message.includes('caller is not a registrar')) {
        throw new Error('Minting failed: Only approved registrars can mint land NFTs');
      } else {
        throw new Error(`Blockchain minting failed: ${error.message}`);
      }
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
        registeredBy: landData.registeredBy,
        landHash: landData.landHash
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