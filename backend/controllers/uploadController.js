const { uploadToIPFS } = require('../utils/ipfs');
const { documentEncryption } = require('../utils/encryption');
const crypto = require('crypto');

exports.uploadDocument = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request file:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Get property and owner info for encryption
    const { propertyId, ownerAddress } = req.body;
    
    console.log('Processing file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      propertyId: propertyId,
      ownerAddress: ownerAddress
    });

    // Generate file hash before encryption
    const originalFileHash = crypto
      .createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');

    console.log('Original file hash generated:', originalFileHash);

    // Encrypt document if property info is provided
    let fileToUpload = req.file.buffer;
    let encryptionMetadata = null;
    
    if (propertyId && ownerAddress) {
      console.log('🔐 Encrypting document for property:', propertyId);
      
      // Generate unique encryption key for this property
      const encryptionKey = documentEncryption.generatePropertyKey(propertyId, ownerAddress);
      
      // Encrypt the document
      const encryptionResult = documentEncryption.encryptDocument(req.file.buffer, encryptionKey);
      
      fileToUpload = encryptionResult.encryptedBuffer;
      encryptionMetadata = {
        isEncrypted: true,
        encryptionMethod: encryptionResult.encryptionMethod,
        verificationHash: encryptionResult.verificationHash,
        originalFileHash: originalFileHash
      };
      
      console.log('✅ Document encrypted successfully');
    } else {
      console.log('⚠️ No encryption - missing property info');
      encryptionMetadata = {
        isEncrypted: false,
        originalFileHash: originalFileHash
      };
    }

    // Upload encrypted file to IPFS
    console.log('Starting IPFS upload...');
    const ipfsHash = await uploadToIPFS(
      fileToUpload,
      req.file.originalname
    );

    console.log('IPFS upload successful:', ipfsHash);

    res.json({
      success: true,
      ipfsHash: ipfsHash,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      encryption: encryptionMetadata
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error types
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ 
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(413).json({ 
        success: false,
        error: 'File size exceeds 5MB limit'
      });
    }

    // Handle encryption errors
    if (error.message.includes('encryption')) {
      return res.status(500).json({ 
        success: false,
        error: 'Document encryption failed. Please try again.'
      });
    }

    // Handle IPFS/Pinata errors
    if (error.message.includes('Pinata') || error.message.includes('IPFS')) {
      return res.status(503).json({ 
        success: false,
        error: 'IPFS service temporarily unavailable. Please try again.'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error during file upload'
    });
  }
};