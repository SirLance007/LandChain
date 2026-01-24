const pinataSDK = require('@pinata/sdk');

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

// Test Pinata connection
async function testPinataConnection() {
  try {
    const result = await pinata.testAuthentication();
    console.log('✅ Pinata authentication successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Pinata authentication failed:', error.message);
    return false;
  }
}

async function uploadToIPFS(fileBuffer, originalName) {
  try {
    console.log('Uploading to IPFS:', originalName);
    
    // Test connection first
    const isConnected = await testPinataConnection();
    if (!isConnected) {
      throw new Error('Pinata service is not available');
    }

    // Create readable stream from buffer
    const readableStreamForFile = require('stream').Readable.from(fileBuffer);
    
    const options = {
      pinataMetadata: {
        name: originalName,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          originalName: originalName
        }
      },
      pinataOptions: {
        cidVersion: 0
      }
    };

    console.log('Pinning file to IPFS...');
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    
    console.log('✅ File pinned successfully:', result.IpfsHash);
    return result.IpfsHash;
    
  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    
    // Handle specific Pinata errors
    if (error.message.includes('401')) {
      throw new Error('Pinata authentication failed. Please check API credentials.');
    }
    
    if (error.message.includes('402')) {
      throw new Error('Pinata account limit exceeded. Please upgrade your plan.');
    }
    
    if (error.message.includes('timeout')) {
      throw new Error('IPFS upload timeout. Please try again with a smaller file.');
    }
    
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

module.exports = { uploadToIPFS, testPinataConnection };