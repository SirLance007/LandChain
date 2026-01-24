// Real blockchain integration for LandChain
const { ethers } = require('ethers');

// Contract ABI (Application Binary Interface)
const LAND_NFT_ABI = [
  "function mintLand(address to, string memory ipfsHash, int256 lat, int256 lon, uint256 area) public returns (uint256)",
  "function getLandData(uint256 tokenId) public view returns (tuple(string ipfsHash, int256 latitude, int256 longitude, uint256 area, uint256 registeredAt, address registeredBy))",
  "function getTotalLands() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event LandRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash, uint256 timestamp)"
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
      // Connect to Monad Testnet
      const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Setup signer (admin wallet)
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('PRIVATE_KEY not found in environment variables');
      }
      
      this.signer = new ethers.Wallet(privateKey, this.provider);
      
      // Connect to deployed contract
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('CONTRACT_ADDRESS not found in environment variables');
      }
      
      this.contract = new ethers.Contract(contractAddress, LAND_NFT_ABI, this.signer);
      
      // Test connection
      const network = await this.provider.getNetwork();
      console.log('✅ Connected to blockchain:', {
        network: network.name,
        chainId: network.chainId.toString(),
        contractAddress: contractAddress
      });
      
      this.isInitialized = true;
      return true;
      
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      this.isInitialized = false;
      return false;
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