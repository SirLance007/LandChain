// Document Encryption Utility for LandChain
const CryptoJS = require('crypto-js');
const crypto = require('crypto');

class DocumentEncryption {
  constructor() {
    // Master encryption key from environment
    this.masterKey = process.env.ENCRYPTION_MASTER_KEY || 'landchain-default-key-change-in-production';
  }

  /**
   * Generate unique encryption key for each property
   * @param {string} propertyId - Unique property identifier
   * @param {string} ownerAddress - Owner's wallet address
   * @returns {string} - Unique encryption key
   */
  generatePropertyKey(propertyId, ownerAddress) {
    const keyMaterial = `${propertyId}-${ownerAddress}-${this.masterKey}`;
    return CryptoJS.SHA256(keyMaterial).toString();
  }

  /**
   * Encrypt document buffer
   * @param {Buffer} fileBuffer - Original file buffer
   * @param {string} encryptionKey - Encryption key
   * @returns {Object} - Encrypted data with metadata
   */
  encryptDocument(fileBuffer, encryptionKey) {
    try {
      console.log('🔐 Encrypting document...');
      
      // Convert buffer to base64 for encryption
      const fileBase64 = fileBuffer.toString('base64');
      
      // Encrypt using AES-256
      const encrypted = CryptoJS.AES.encrypt(fileBase64, encryptionKey).toString();
      
      // Generate verification hash
      const verificationHash = CryptoJS.SHA256(fileBase64).toString();
      
      // Create encrypted buffer
      const encryptedBuffer = Buffer.from(encrypted, 'utf8');
      
      console.log('✅ Document encrypted successfully');
      
      return {
        encryptedBuffer: encryptedBuffer,
        verificationHash: verificationHash,
        encryptionMethod: 'AES-256',
        isEncrypted: true
      };
      
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error(`Document encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt document
   * @param {Buffer} encryptedBuffer - Encrypted file buffer
   * @param {string} encryptionKey - Decryption key
   * @param {string} verificationHash - Hash for verification
   * @returns {Buffer} - Decrypted file buffer
   */
  decryptDocument(encryptedBuffer, encryptionKey, verificationHash) {
    try {
      console.log('🔓 Decrypting document...');
      
      // Convert buffer to string
      const encryptedString = encryptedBuffer.toString('utf8');
      
      // Decrypt using AES-256
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedString, encryptionKey);
      const decryptedBase64 = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedBase64) {
        throw new Error('Invalid decryption key or corrupted data');
      }
      
      // Verify integrity
      const currentHash = CryptoJS.SHA256(decryptedBase64).toString();
      if (currentHash !== verificationHash) {
        throw new Error('Document integrity verification failed');
      }
      
      // Convert back to buffer
      const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');
      
      console.log('✅ Document decrypted and verified successfully');
      
      return decryptedBuffer;
      
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error(`Document decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate secure access token for document viewing
   * @param {string} propertyId - Property ID
   * @param {string} userAddress - User's wallet address
   * @param {number} expiryMinutes - Token expiry in minutes (default: 60)
   * @returns {string} - Secure access token
   */
  generateAccessToken(propertyId, userAddress, expiryMinutes = 60) {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
    const tokenData = {
      propertyId: propertyId,
      userAddress: userAddress,
      expiryTime: expiryTime,
      timestamp: Date.now()
    };
    
    const tokenString = JSON.stringify(tokenData);
    const token = CryptoJS.AES.encrypt(tokenString, this.masterKey).toString();
    
    return Buffer.from(token).toString('base64');
  }

  /**
   * Verify access token
   * @param {string} token - Access token
   * @returns {Object} - Token data if valid
   */
  verifyAccessToken(token) {
    try {
      const tokenString = Buffer.from(token, 'base64').toString('utf8');
      const decryptedBytes = CryptoJS.AES.decrypt(tokenString, this.masterKey);
      const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      const tokenData = JSON.parse(decryptedString);
      
      // Check expiry
      if (Date.now() > tokenData.expiryTime) {
        throw new Error('Access token expired');
      }
      
      return tokenData;
      
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Check if user has access to property documents
   * @param {string} propertyId - Property ID
   * @param {string} userAddress - User's wallet address
   * @param {Object} propertyData - Property data from database
   * @returns {boolean} - Access permission
   */
  checkDocumentAccess(propertyId, userAddress, propertyData) {
    // Owner always has access
    if (propertyData.owner.toLowerCase() === userAddress.toLowerCase()) {
      return true;
    }
    
    // Admin access (you can define admin addresses)
    const adminAddresses = [
      '0x1d524D361EF86057dF3583c87D1815032fdb8dba', // Your admin address
      // Add more admin addresses here
    ];
    
    if (adminAddresses.includes(userAddress.toLowerCase())) {
      return true;
    }
    
    // Property must be verified for public access (if needed)
    // if (propertyData.status === 'verified') {
    //   return true;
    // }
    
    return false;
  }
}

// Create singleton instance
const documentEncryption = new DocumentEncryption();

module.exports = { documentEncryption };