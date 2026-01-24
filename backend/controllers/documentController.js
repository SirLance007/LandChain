// Document Access Controller with Encryption Support
const { documentEncryption } = require('../utils/encryption');
const Land = require('../models/Land');
const axios = require('axios');

/**
 * Get encrypted document with access control
 */
exports.getDocument = async (req, res) => {
  try {
    const { propertyId, documentHash } = req.params;
    const { userAddress } = req.query;

    console.log('📄 Document access request:', {
      propertyId,
      documentHash,
      userAddress
    });

    // Validate required parameters
    if (!propertyId || !documentHash || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: propertyId, documentHash, userAddress'
      });
    }

    // Get property data
    const property = await Land.findOne({ tokenId: parseInt(propertyId) });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Check access permissions
    const hasAccess = documentEncryption.checkDocumentAccess(propertyId, userAddress, property);
    if (!hasAccess) {
      console.log('❌ Access denied for user:', userAddress);
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to view this document.'
      });
    }

    console.log('✅ Access granted for user:', userAddress);

    // Check if document hash exists in property
    if (!property.documents.includes(documentHash) && property.ipfsHash !== documentHash) {
      return res.status(404).json({
        success: false,
        error: 'Document not found in property records'
      });
    }

    // Download encrypted document from IPFS
    console.log('📥 Downloading document from IPFS...');
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${documentHash}`;
    
    const response = await axios.get(ipfsUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const encryptedBuffer = Buffer.from(response.data);
    console.log('✅ Document downloaded from IPFS');

    // Check if document is encrypted
    const documentMetadata = property.documentMetadata?.find(
      meta => meta.ipfsHash === documentHash
    );

    if (documentMetadata && documentMetadata.isEncrypted) {
      console.log('🔓 Decrypting document...');
      
      // Generate decryption key
      const decryptionKey = documentEncryption.generatePropertyKey(propertyId, property.owner);
      
      // Decrypt document
      const decryptedBuffer = documentEncryption.decryptDocument(
        encryptedBuffer,
        decryptionKey,
        documentMetadata.verificationHash
      );

      // Set appropriate headers
      res.set({
        'Content-Type': documentMetadata.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${documentMetadata.fileName || 'document'}"`,
        'Cache-Control': 'private, no-cache',
        'X-Document-Status': 'decrypted'
      });

      console.log('✅ Document decrypted and served');
      return res.send(decryptedBuffer);

    } else {
      console.log('📄 Serving unencrypted document');
      
      // Serve unencrypted document
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache',
        'X-Document-Status': 'unencrypted'
      });

      return res.send(encryptedBuffer);
    }

  } catch (error) {
    console.error('❌ Document access error:', error);

    if (error.message.includes('decryption')) {
      return res.status(500).json({
        success: false,
        error: 'Document decryption failed. The document may be corrupted.'
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'Document download timeout. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document'
    });
  }
};

/**
 * Generate secure access token for document viewing
 */
exports.generateAccessToken = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { userAddress, expiryMinutes = 60 } = req.body;

    console.log('🎫 Generating access token:', { propertyId, userAddress, expiryMinutes });

    // Validate parameters
    if (!propertyId || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Get property data
    const property = await Land.findOne({ tokenId: parseInt(propertyId) });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Check access permissions
    const hasAccess = documentEncryption.checkDocumentAccess(propertyId, userAddress, property);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Generate access token
    const accessToken = documentEncryption.generateAccessToken(propertyId, userAddress, expiryMinutes);

    console.log('✅ Access token generated');

    res.json({
      success: true,
      accessToken: accessToken,
      expiryMinutes: expiryMinutes,
      message: 'Access token generated successfully'
    });

  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate access token'
    });
  }
};

/**
 * Get document metadata without downloading
 */
exports.getDocumentMetadata = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { userAddress } = req.query;

    // Get property data
    const property = await Land.findOne({ tokenId: parseInt(propertyId) });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Check access permissions
    const hasAccess = documentEncryption.checkDocumentAccess(propertyId, userAddress, property);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Return document metadata
    const documentInfo = {
      propertyId: propertyId,
      totalDocuments: property.documents.length,
      documents: property.documents.map((hash, index) => ({
        index: index,
        ipfsHash: hash,
        isEncrypted: property.documentMetadata?.[index]?.isEncrypted || false,
        fileName: property.documentMetadata?.[index]?.fileName || `Document ${index + 1}`,
        mimeType: property.documentMetadata?.[index]?.mimeType || 'application/octet-stream'
      })),
      accessLevel: hasAccess ? 'full' : 'none'
    };

    res.json({
      success: true,
      documentInfo: documentInfo
    });

  } catch (error) {
    console.error('❌ Metadata retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document metadata'
    });
  }
};