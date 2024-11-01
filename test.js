import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Test file encryption and decryption
async function testEncryption() {
  const testData = 'Test data for encryption';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // Encrypt
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(testData, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Decrypt
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');

  assert.strictEqual(decrypted, testData, 'Encryption/decryption test failed');
  console.log('✓ Encryption test passed');
}

// Test file hash calculation
async function testFileHash() {
  const testData = 'Test data for hashing';
  const expectedHash = crypto
    .createHash('sha256')
    .update(testData)
    .digest('hex');

  const testFile = join(__dirname, 'test.txt');
  await fs.writeFile(testFile, testData);

  const fileData = await fs.readFile(testFile);
  const actualHash = crypto
    .createHash('sha256')
    .update(fileData)
    .digest('hex');

  assert.strictEqual(actualHash, expectedHash, 'File hash test failed');
  await fs.unlink(testFile);
  console.log('✓ File hash test passed');
}

async function runTests() {
  try {
    await testEncryption();
    await testFileHash();
    console.log('All tests passed! ✨');
  } catch (error) {
    console.error('Tests failed:', error);
    process.exit(1);
  }
}

runTests();