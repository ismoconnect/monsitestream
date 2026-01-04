// End-to-End Encryption Service using Web Crypto API
import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.keyPair = null;
    this.publicKey = null;
    this.privateKey = null;
  }

  // Generate RSA key pair for asymmetric encryption
  async generateKeyPair() {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      this.publicKey = this.keyPair.publicKey;
      this.privateKey = this.keyPair.privateKey;

      return this.keyPair;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }

  // Export public key for sharing
  async exportPublicKey() {
    if (!this.publicKey) {
      throw new Error('No public key available');
    }

    try {
      const exported = await window.crypto.subtle.exportKey('spki', this.publicKey);
      return Array.from(new Uint8Array(exported));
    } catch (error) {
      console.error('Error exporting public key:', error);
      throw error;
    }
  }

  // Import public key from array
  async importPublicKey(keyArray) {
    try {
      const keyBuffer = new Uint8Array(keyArray);
      return await window.crypto.subtle.importKey(
        'spki',
        keyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );
    } catch (error) {
      console.error('Error importing public key:', error);
      throw error;
    }
  }

  // Encrypt message with public key
  async encryptMessage(message, publicKey) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        publicKey,
        data
      );
      
      return Array.from(new Uint8Array(encrypted));
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  // Decrypt message with private key
  async decryptMessage(encryptedData, privateKey) {
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP"
        },
        privateKey,
        new Uint8Array(encryptedData)
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  // Generate symmetric key for file encryption
  generateSymmetricKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // Encrypt file with symmetric key
  encryptFile(file, key) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const encrypted = CryptoJS.AES.encrypt(
            CryptoJS.lib.WordArray.create(e.target.result),
            key
          ).toString();
          resolve(encrypted);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Decrypt file with symmetric key
  decryptFile(encryptedData, key) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw error;
    }
  }

  // Hash password for storage
  hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }

  // Verify password
  verifyPassword(password, hash) {
    return CryptoJS.SHA256(password).toString() === hash;
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  // Encrypt sensitive data for storage
  encryptSensitiveData(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  // Decrypt sensitive data from storage
  decryptSensitiveData(encryptedData, key) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting sensitive data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;
