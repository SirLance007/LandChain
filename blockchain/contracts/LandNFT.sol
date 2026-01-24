// File: blockchain/contracts/LandNFT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LandNFT is ERC721, Ownable, AccessControl {
    uint256 private _tokenIdCounter;
    
    // Role for approved registrars who can mint land NFTs
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    
    struct LandData {
        string ipfsHash;
        int256 latitude;
        int256 longitude;
        uint256 area;
        uint256 registeredAt;
        address registeredBy;
        bytes32 landHash; // Hash of coordinates + IPFS for duplicate prevention
    }
    
    struct TransferRecord {
        address from;
        address to;
        uint256 timestamp;
        bytes32 transferHash; // Unique hash for this transfer
    }
    
    mapping(uint256 => LandData) public lands;
    mapping(bytes32 => bool) public landExists; // Prevent duplicate land registration
    mapping(uint256 => TransferRecord[]) public transferHistory; // Track all transfers per token
    mapping(bytes32 => uint256) public transferHashToTokenId; // Map transfer hash to token ID
    
    event LandRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        bytes32 indexed landHash,
        uint256 timestamp
    );
    
    event LandTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 transferHash,
        uint256 timestamp
    );
    
    event RegistrarAdded(address indexed registrar, address indexed addedBy);
    event RegistrarRemoved(address indexed registrar, address indexed removedBy);
    
    constructor() ERC721("LandChain", "LAND") Ownable(msg.sender) {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant the contract deployer the registrar role
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }
    
    /**
     * @dev Modifier to restrict minting to approved registrars only
     */
    modifier onlyRegistrar() {
        require(
            hasRole(REGISTRAR_ROLE, msg.sender) || owner() == msg.sender,
            "LandNFT: caller is not a registrar or owner"
        );
        _;
    }
    
    /**
     * @dev Add a new registrar who can mint land NFTs
     * @param registrar Address to grant registrar role
     */
    function addRegistrar(address registrar) public onlyOwner {
        require(registrar != address(0), "LandNFT: invalid registrar address");
        _grantRole(REGISTRAR_ROLE, registrar);
        emit RegistrarAdded(registrar, msg.sender);
    }
    
    /**
     * @dev Remove a registrar
     * @param registrar Address to revoke registrar role from
     */
    function removeRegistrar(address registrar) public onlyOwner {
        _revokeRole(REGISTRAR_ROLE, registrar);
        emit RegistrarRemoved(registrar, msg.sender);
    }
    
    /**
     * @dev Check if an address is a registrar
     * @param account Address to check
     */
    function isRegistrar(address account) public view returns (bool) {
        return hasRole(REGISTRAR_ROLE, account);
    }
    
    /**
     * @dev Generate unique hash for land based on coordinates and IPFS hash
     * @param ipfsHash IPFS hash of land documents
     * @param lat Latitude coordinate
     * @param lon Longitude coordinate
     */
    function _generateLandHash(
        string memory ipfsHash,
        int256 lat,
        int256 lon
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(ipfsHash, lat, lon));
    }
    
    /**
     * @dev Generate unique hash for transfer
     * @param tokenId Token ID being transferred
     * @param from Address transferring from
     * @param to Address transferring to
     * @param timestamp Block timestamp
     */
    function _generateTransferHash(
        uint256 tokenId,
        address from,
        address to,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, from, to, timestamp));
    }
    
    /**
     * @dev Mint a new land NFT (restricted to registrars)
     * @param to Address to mint the NFT to
     * @param ipfsHash IPFS hash of land documents
     * @param lat Latitude coordinate (multiplied by 1000000 for precision)
     * @param lon Longitude coordinate (multiplied by 1000000 for precision)
     * @param area Land area in square meters
     */
    function mintLand(
        address to,
        string memory ipfsHash,
        int256 lat,
        int256 lon,
        uint256 area
    ) public onlyRegistrar returns (uint256) {
        require(to != address(0), "LandNFT: cannot mint to zero address");
        require(bytes(ipfsHash).length > 0, "LandNFT: IPFS hash cannot be empty");
        require(area > 0, "LandNFT: area must be greater than zero");
        
        // Generate unique hash for this land
        bytes32 landHash = _generateLandHash(ipfsHash, lat, lon);
        
        // Check for duplicate land registration
        require(!landExists[landHash], "LandNFT: land already registered with these coordinates and documents");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mark this land as existing
        landExists[landHash] = true;
        
        // Mint the NFT
        _safeMint(to, tokenId);
        
        // Store land data
        lands[tokenId] = LandData({
            ipfsHash: ipfsHash,
            latitude: lat,
            longitude: lon,
            area: area,
            registeredAt: block.timestamp,
            registeredBy: msg.sender,
            landHash: landHash
        });
        
        // Record initial "transfer" (minting) in history
        bytes32 transferHash = _generateTransferHash(tokenId, address(0), to, block.timestamp);
        transferHistory[tokenId].push(TransferRecord({
            from: address(0),
            to: to,
            timestamp: block.timestamp,
            transferHash: transferHash
        }));
        transferHashToTokenId[transferHash] = tokenId;
        
        emit LandRegistered(tokenId, to, ipfsHash, landHash, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Override _update to emit custom event and track transfers
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        // Only track actual transfers (not minting/burning)
        if (from != address(0) && to != address(0)) {
            // Generate unique transfer hash
            bytes32 transferHash = _generateTransferHash(tokenId, from, to, block.timestamp);
            
            // Record transfer in history
            transferHistory[tokenId].push(TransferRecord({
                from: from,
                to: to,
                timestamp: block.timestamp,
                transferHash: transferHash
            }));
            transferHashToTokenId[transferHash] = tokenId;
            
            // Emit custom transfer event with unique hash
            emit LandTransferred(tokenId, from, to, transferHash, block.timestamp);
        }
        
        return previousOwner;
    }
    
    /**
     * @dev Get land data for a token
     * @param tokenId Token ID to query
     */
    function getLandData(uint256 tokenId) 
        public 
        view 
        returns (LandData memory) 
    {
        require(_ownerOf(tokenId) != address(0), "LandNFT: land not registered");
        return lands[tokenId];
    }
    
    /**
     * @dev Get transfer history for a token
     * @param tokenId Token ID to query
     */
    function getTransferHistory(uint256 tokenId) 
        public 
        view 
        returns (TransferRecord[] memory) 
    {
        require(_ownerOf(tokenId) != address(0), "LandNFT: land not registered");
        return transferHistory[tokenId];
    }
    
    /**
     * @dev Get token ID from transfer hash
     * @param transferHash Unique transfer hash
     */
    function getTokenIdFromTransferHash(bytes32 transferHash) 
        public 
        view 
        returns (uint256) 
    {
        return transferHashToTokenId[transferHash];
    }
    
    /**
     * @dev Check if land exists with given coordinates and IPFS hash
     * @param ipfsHash IPFS hash of land documents
     * @param lat Latitude coordinate
     * @param lon Longitude coordinate
     */
    function checkLandExists(
        string memory ipfsHash,
        int256 lat,
        int256 lon
    ) public view returns (bool) {
        bytes32 landHash = _generateLandHash(ipfsHash, lat, lon);
        return landExists[landHash];
    }
    
    /**
     * @dev Get total number of lands minted
     */
    function getTotalLands() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get total number of transfers for a token
     * @param tokenId Token ID to query
     */
    function getTransferCount(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "LandNFT: land not registered");
        return transferHistory[tokenId].length;
    }
    
    /**
     * @dev Override supportsInterface to include AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}