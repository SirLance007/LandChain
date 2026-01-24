// File: blockchain/contracts/LandNFT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct LandData {
        string ipfsHash;
        int256 latitude;
        int256 longitude;
        uint256 area;
        uint256 registeredAt;
        address registeredBy;
    }
    
    mapping(uint256 => LandData) public lands;
    
    event LandRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        uint256 timestamp
    );
    
    event LandTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    constructor() ERC721("LandChain", "LAND") Ownable(msg.sender) {}
    
    function mintLand(
        address to,
        string memory ipfsHash,
        int256 lat,
        int256 lon,
        uint256 area
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        lands[tokenId] = LandData({
            ipfsHash: ipfsHash,
            latitude: lat,
            longitude: lon,
            area: area,
            registeredAt: block.timestamp,
            registeredBy: msg.sender
        });
        
        emit LandRegistered(tokenId, to, ipfsHash, block.timestamp);
        
        return tokenId;
    }
    
    function transferLand(
        uint256 tokenId,
        address to
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(to != address(0), "Invalid recipient");
        
        address from = ownerOf(tokenId);
        _transfer(from, to, tokenId);
        
        emit LandTransferred(tokenId, from, to, block.timestamp);
    }
    
    function getLandData(uint256 tokenId) 
        public 
        view 
        returns (LandData memory) 
    {
        require(ownerOf(tokenId) != address(0), "Land not registered");
        return lands[tokenId];
    }
    
    function getTotalLands() public view returns (uint256) {
        return _tokenIdCounter;
    }
}