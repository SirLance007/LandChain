// Real blockchain integration for LandChain
const { ethers } = require('ethers');

// Contract ABI (Application Binary Interface) - Updated for enhanced contract
const LAND_NFT_ABI = [
  // Admin functions
  "function addRegistrar(address registrar) public",
  "function removeRegistrar(address registrar) public", 
  "function isRegistrar(address account) public view returns (bool)",
  "function adminTransfer(uint256 tokenId, address to) public", // Admin force transfer
  "function adminBatchTransfer(uint256[] calldata tokenIds, address to) public", // Batch transfer
  "function adminClaimOwnership(uint256 tokenId) public", // Claim ownership
  
  // Signature-based transfer functions
  "function executeSignatureTransfer(tuple(uint256 tokenId, address from, address to, uint256 nonce, uint256 deadline) auth, bytes signature) public",
  "function getTransferAuthHash(tuple(uint256 tokenId, address from, address to, uint256 nonce, uint256 deadline) auth) public view returns (bytes32)",
  "function getNonce(address user) public view returns (uint256)",
  "function isSignatureUsed(bytes32 signatureHash) public view returns (bool)",
  
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
  "function owner() public view returns (address)",
  
  // Events
  "event LandRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash, bytes32 indexed landHash, uint256 timestamp)",
  "event LandTransferred(uint256 indexed tokenId, address indexed from, address indexed to, bytes32 transferHash, uint256 timestamp)",
  "event SignatureTransferExecuted(uint256 indexed tokenId, address indexed from, address indexed to, bytes32 transferHash, bytes32 signatureHash, uint256 timestamp)",
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

  async adminForceTransfer(tokenId, newOwnerAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔥🔥🔥 ADMIN FORCE TRANSFER DEBUG START 🔥🔥🔥');
      console.log('🔄 Force transferring NFT via admin power...', {
        tokenId,
        newOwner: newOwnerAddress
      });

      // STEP 1: Check current state
      console.log('📋 STEP 1: Checking current blockchain state...');
      const currentOwner = await this.contract.ownerOf(tokenId);
      const contractOwner = await this.contract.owner();
      const adminWallet = this.signer.address;
      
      console.log('   Current NFT owner:', currentOwner);
      console.log('   Target new owner:', newOwnerAddress);
      console.log('   Contract owner (admin):', contractOwner);
      console.log('   Admin wallet address:', adminWallet);
      console.log('   Admin = Contract Owner?', contractOwner.toLowerCase() === adminWallet.toLowerCase());
      console.log('   Admin = NFT Owner?', currentOwner.toLowerCase() === adminWallet.toLowerCase());
      
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

      // STEP 2: Check admin permissions
      console.log('📋 STEP 2: Checking admin permissions...');
      if (contractOwner.toLowerCase() !== adminWallet.toLowerCase()) {
        console.log('❌ CRITICAL ERROR: Admin wallet is not the contract owner!');
        console.log('   This means adminTransfer will fail');
        throw new Error('Admin wallet is not the contract owner - cannot perform force transfer');
      }
      
      console.log('✅ Admin permissions verified - proceeding with force transfer');

      // STEP 3: Estimate gas
      console.log('📋 STEP 3: Estimating gas for adminTransfer...');
      let gasEstimate;
      try {
        gasEstimate = await this.contract.adminTransfer.estimateGas(tokenId, newOwnerAddress);
        console.log('   Estimated gas:', gasEstimate.toString());
      } catch (gasError) {
        console.log('❌ GAS ESTIMATION FAILED:', gasError.message);
        console.log('   This indicates the transaction will likely fail');
        throw new Error(`Gas estimation failed: ${gasError.message}`);
      }

      // STEP 4: Execute force transfer
      console.log('📋 STEP 4: Executing adminTransfer function...');
      console.log('💪 Using adminTransfer - this bypasses all ownership checks!');
      
      const tx = await this.contract.adminTransfer(tokenId, newOwnerAddress, {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });

      console.log('📝 FORCE TRANSFER transaction submitted:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // STEP 5: Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ FORCE TRANSFER transaction confirmed:', receipt.hash);
      console.log('📦 Block number:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      // STEP 6: Verify the transfer worked
      console.log('📋 STEP 6: Verifying transfer success...');
      const newOwner = await this.contract.ownerOf(tokenId);
      console.log('   New verified owner:', newOwner);
      console.log('   Expected owner:', newOwnerAddress);
      console.log('   Transfer successful?', newOwner.toLowerCase() === newOwnerAddress.toLowerCase());

      // STEP 7: Extract events
      console.log('📋 STEP 7: Extracting transfer events...');
      let transferEvent = null;
      let transferHash = null;
      
      console.log('   Total logs in receipt:', receipt.logs.length);
      
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`   Log ${i}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data
        });
        
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          console.log(`   Parsed log ${i}:`, {
            name: parsedLog.name,
            args: parsedLog.args
          });
          
          if (parsedLog && parsedLog.name === 'LandTransferred') {
            transferEvent = parsedLog;
            transferHash = parsedLog.args[3]; // transferHash is the 4th argument
            console.log('   ✅ Found LandTransferred event!');
            console.log('   Transfer hash:', transferHash);
            break;
          }
        } catch (parseError) {
          console.log(`   Could not parse log ${i}:`, parseError.message);
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
        uniqueTransfer: true, // This is a real blockchain transfer with unique hash
        forceTransfer: true // This was a force transfer by admin
      };

      console.log('🎉🎉🎉 ADMIN FORCE TRANSFER COMPLETED SUCCESSFULLY! 🎉🎉🎉');
      console.log('📋 Final result:', result);
      console.log('💪 This transfer bypassed all ownership restrictions!');
      console.log('🔥🔥🔥 ADMIN FORCE TRANSFER DEBUG END 🔥🔥🔥');
      
      return result;

    } catch (error) {
      console.log('❌❌❌ ADMIN FORCE TRANSFER FAILED! ❌❌❌');
      console.error('Full error details:', error);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error reason:', error.reason);
      
      // Provide more specific error messages
      if (error.message.includes('Ownable: caller is not the owner')) {
        throw new Error('Admin force transfer failed: Admin wallet is not the contract owner');
      } else if (error.message.includes('token does not exist')) {
        throw new Error('Admin force transfer failed: NFT does not exist');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Admin force transfer failed: Insufficient funds for gas fees');
      } else {
        throw new Error(`Admin force transfer failed: ${error.message}`);
      }
    }
  }

  async directTransferNFT(tokenId, fromAddress, toAddress) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🚀 DIRECT NFT TRANSFER - Simple & Fast!');
      console.log('🔄 Direct transferring NFT...', {
        tokenId,
        from: fromAddress,
        to: toAddress
      });

      // Check current owner
      const currentOwner = await this.contract.ownerOf(tokenId);
      console.log('👤 Current NFT owner:', currentOwner);
      console.log('🎯 Transferring to:', toAddress);
      
      if (currentOwner.toLowerCase() === toAddress.toLowerCase()) {
        console.log('⚠️ NFT already owned by target address');
        return {
          success: true,
          transactionHash: 'already-owned',
          message: 'NFT already owned by target address'
        };
      }

      // Use admin transfer for direct transfer (simplest method)
      console.log('💪 Using admin direct transfer...');
      
      const gasEstimate = await this.contract.adminTransfer.estimateGas(tokenId, toAddress);
      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Execute direct transfer
      const tx = await this.contract.adminTransfer(tokenId, toAddress, {
        gasLimit: gasEstimate * 120n / 100n
      });

      console.log('📝 DIRECT TRANSFER transaction submitted:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      const receipt = await tx.wait();
      console.log('✅ DIRECT TRANSFER confirmed:', receipt.hash);
      console.log('📦 Block number:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      // Verify transfer
      const newOwner = await this.contract.ownerOf(tokenId);
      console.log('🔍 Verified new owner:', newOwner);

      // Extract transfer event
      let transferEvent = null;
      let transferHash = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'LandTransferred') {
            transferEvent = parsedLog;
            transferHash = parsedLog.args[3];
            break;
          }
        } catch (e) {
          // Skip unparseable logs
        }
      }

      const result = {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: transferEvent ? transferEvent.args[1] : currentOwner,
        to: transferEvent ? transferEvent.args[2] : toAddress,
        verifiedNewOwner: newOwner,
        transferHash: transferHash,
        uniqueTransfer: true,
        directTransfer: true
      };

      console.log('🎉 DIRECT TRANSFER completed successfully!');
      console.log('🚀 Simple and fast - no signatures needed!');
      return result;

    } catch (error) {
      console.error('❌ Direct transfer failed:', error);
      throw new Error(`Direct transfer failed: ${error.message}`);
    }
  }

  async executeSignatureTransfer(tokenId, fromAddress, toAddress, signature, nonce, deadline) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔏 SIGNATURE-BASED TRANSFER - User-to-User Direct Transfer!');
      console.log('🔄 Executing signature transfer...', {
        tokenId,
        from: fromAddress,
        to: toAddress,
        nonce,
        deadline: new Date(deadline * 1000)
      });

      // Prepare transfer authorization struct
      const auth = {
        tokenId: tokenId,
        from: fromAddress,
        to: toAddress,
        nonce: nonce,
        deadline: deadline
      };

      console.log('📋 Transfer authorization:', auth);
      console.log('🔏 Signature:', signature);

      // Estimate gas for the signature transfer
      const gasEstimate = await this.contract.executeSignatureTransfer.estimateGas(auth, signature);
      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Execute signature transfer
      const tx = await this.contract.executeSignatureTransfer(auth, signature, {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });

      console.log('📝 Signature transfer transaction submitted:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Signature transfer confirmed:', receipt.hash);
      console.log('📦 Block number:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      // Verify the transfer worked
      const newOwner = await this.contract.ownerOf(tokenId);
      console.log('🔍 Verified new owner:', newOwner);

      // Extract SignatureTransferExecuted event
      let transferEvent = null;
      let transferHash = null;
      let signatureHash = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'SignatureTransferExecuted') {
            transferEvent = parsedLog;
            transferHash = parsedLog.args[3]; // transferHash
            signatureHash = parsedLog.args[4]; // signatureHash
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
        from: transferEvent ? transferEvent.args[1] : fromAddress,
        to: transferEvent ? transferEvent.args[2] : toAddress,
        verifiedNewOwner: newOwner,
        transferHash: transferHash, // Unique transfer hash from contract
        signatureHash: signatureHash, // Signature hash used
        uniqueTransfer: true, // This is a real blockchain transfer
        signatureTransfer: true, // This was a signature-based transfer
        userToUser: true // Direct user-to-user transfer
      };

      console.log('🎉 SIGNATURE TRANSFER completed successfully:', result);
      console.log('🔏 This was a direct user-to-user transfer using signatures!');
      return result;

    } catch (error) {
      console.error('❌ Signature transfer failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('signature expired')) {
        throw new Error('Signature transfer failed: Signature has expired');
      } else if (error.message.includes('invalid signature')) {
        throw new Error('Signature transfer failed: Invalid signature provided');
      } else if (error.message.includes('signature already used')) {
        throw new Error('Signature transfer failed: Signature has already been used');
      } else if (error.message.includes('invalid nonce')) {
        throw new Error('Signature transfer failed: Invalid nonce - signature may be outdated');
      } else if (error.message.includes('from is not owner')) {
        throw new Error('Signature transfer failed: Signer is not the current owner');
      } else {
        throw new Error(`Signature transfer failed: ${error.message}`);
      }
    }
  }

  async generateTransferSignature(tokenId, fromAddress, toAddress, privateKey, deadline) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔏 Generating transfer signature...');
      
      // Get current nonce for the from address
      const nonce = await this.contract.getNonce(fromAddress);
      console.log('📋 Current nonce for', fromAddress, ':', nonce.toString());

      // Prepare transfer authorization
      const auth = {
        tokenId: tokenId,
        from: fromAddress,
        to: toAddress,
        nonce: Number(nonce),
        deadline: deadline
      };

      // Get the hash that needs to be signed
      const authHash = await this.contract.getTransferAuthHash(auth);
      console.log('📋 Authorization hash:', authHash);

      // Create wallet from private key to sign
      const wallet = new ethers.Wallet(privateKey);
      
      // Sign the hash
      const signature = await wallet.signMessage(ethers.getBytes(authHash));
      console.log('🔏 Generated signature:', signature);

      return {
        auth: auth,
        signature: signature,
        authHash: authHash,
        signer: wallet.address
      };

    } catch (error) {
      console.error('❌ Signature generation failed:', error);
      throw new Error(`Signature generation failed: ${error.message}`);
    }
  }

  async getUserNonce(address) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const nonce = await this.contract.getNonce(address);
      return Number(nonce);
    } catch (error) {
      console.error('❌ Get nonce failed:', error);
      return 0;
    }
  }

  async isSignatureUsed(signatureHash) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const used = await this.contract.isSignatureUsed(signatureHash);
      return used;
    } catch (error) {
      console.error('❌ Check signature used failed:', error);
      return false;
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