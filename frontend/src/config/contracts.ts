// Contract Configuration for LandChain
export const CONTRACT_CONFIG = {
  // Real deployed contract address on Monad Testnet
  LAND_NFT_ADDRESS: '0x654b3F530043786020dC54c7C91ac3D27500E3e8',
  
  // Network configuration
  NETWORK: {
    name: 'Monad Testnet',
    chainId: 10143,
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    explorerUrl: 'https://testnet-explorer.monad.xyz',
    currency: 'MON'
  },
  
  // Contract ABI (simplified for frontend use)
  LAND_NFT_ABI: [
    'function mintLand(address to, string memory ipfsHash, int256 lat, int256 lon, uint256 area) public returns (uint256)',
    'function getLandData(uint256 tokenId) public view returns (tuple(string ipfsHash, int256 latitude, int256 longitude, uint256 area, uint256 registeredAt, address registeredBy))',
    'function getTotalLands() public view returns (uint256)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'event LandRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash, uint256 timestamp)'
  ]
};

// Helper functions
export const getContractAddress = () => CONTRACT_CONFIG.LAND_NFT_ADDRESS;
export const getExplorerUrl = (address?: string) => 
  `${CONTRACT_CONFIG.NETWORK.explorerUrl}/address/${address || CONTRACT_CONFIG.LAND_NFT_ADDRESS}`;
export const getTransactionUrl = (txHash: string) => 
  `${CONTRACT_CONFIG.NETWORK.explorerUrl}/tx/${txHash}`;

export default CONTRACT_CONFIG;