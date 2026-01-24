// Debug endpoint to check NFT ownership and contract state
const express = require('express');
const { blockchainService } = require('./utils/blockchain');

const router = express.Router();

// Debug endpoint to check NFT ownership
router.get('/debug/nft/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    console.log('🔍 DEBUG: Checking NFT ownership for token:', tokenId);
    
    if (!blockchainService.isConnected()) {
      return res.json({
        success: false,
        error: 'Blockchain service not connected'
      });
    }
    
    // Get current ownership info
    const currentOwner = await blockchainService.contract.ownerOf(tokenId);
    const contractOwner = await blockchainService.contract.owner();
    const adminWallet = blockchainService.signer.address;
    
    // Get NFT data
    let nftData = null;
    try {
      nftData = await blockchainService.getLandFromBlockchain(tokenId);
    } catch (error) {
      nftData = { error: error.message };
    }
    
    // Get transfer history
    let transferHistory = null;
    try {
      transferHistory = await blockchainService.getTransferHistory(tokenId);
    } catch (error) {
      transferHistory = { error: error.message };
    }
    
    const debugInfo = {
      success: true,
      tokenId: tokenId,
      ownership: {
        currentNFTOwner: currentOwner,
        contractOwner: contractOwner,
        adminWallet: adminWallet,
        isAdminContractOwner: contractOwner.toLowerCase() === adminWallet.toLowerCase(),
        isAdminNFTOwner: currentOwner.toLowerCase() === adminWallet.toLowerCase()
      },
      nftData: nftData,
      transferHistory: transferHistory,
      contractInfo: {
        address: blockchainService.getContractAddress(),
        network: blockchainService.getNetworkInfo()
      }
    };
    
    console.log('📋 DEBUG INFO:', debugInfo);
    
    res.json(debugInfo);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to test admin force transfer
router.post('/debug/force-transfer', async (req, res) => {
  try {
    const { tokenId, toAddress } = req.body;
    
    console.log('🔥 DEBUG: Testing admin force transfer');
    console.log('   Token ID:', tokenId);
    console.log('   To Address:', toAddress);
    
    if (!blockchainService.isConnected()) {
      return res.json({
        success: false,
        error: 'Blockchain service not connected'
      });
    }
    
    const result = await blockchainService.adminForceTransfer(tokenId, toAddress);
    
    res.json({
      success: true,
      result: result
    });
    
  } catch (error) {
    console.error('❌ Force transfer debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;