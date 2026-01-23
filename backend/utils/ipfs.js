// File: backend/utils/ipfs.js

const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

async function uploadToIPFS(fileBuffer, originalName) {
  try {
    // Create readable stream from buffer
    const readableStreamForFile = require('stream').Readable.from(fileBuffer);
    
    const options = {
      pinataMetadata: {
        name: originalName
      }
    };

    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

module.exports = { uploadToIPFS };