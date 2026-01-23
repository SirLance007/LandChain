// File: backend/controllers/uploadController.js

const { uploadToIPFS } = require('../utils/ipfs');
const crypto = require('crypto');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Generate file hash
    const fileHash = crypto
      .createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');

    // Upload to IPFS
    const ipfsHash = await uploadToIPFS(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      ipfsHash: ipfsHash,
      fileHash: fileHash,
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};