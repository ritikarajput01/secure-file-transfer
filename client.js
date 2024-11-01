import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import crypto from 'crypto';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_URL = 'http://localhost:3000';

async function uploadFile(filePath) {
  try {
    const formData = new FormData();
    formData.append('file', createReadStream(filePath));

    const response = await fetch(`${SERVER_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

async function downloadFile(filename, key, iv, authTag, outputPath) {
  try {
    const response = await fetch(
      `${SERVER_URL}/download/${filename}?key=${key}&iv=${iv}&authTag=${authTag}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.buffer();
    await fs.writeFile(outputPath, buffer);
    console.log('Download successful:', outputPath);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// Example usage
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node client.js <upload|download> [parameters]');
    return;
  }

  const command = process.argv[2];

  if (command === 'upload') {
    if (process.argv.length < 4) {
      console.log('Usage: node client.js upload <filepath>');
      return;
    }
    const filePath = process.argv[3];
    await uploadFile(filePath);
  } else if (command === 'download') {
    if (process.argv.length < 7) {
      console.log('Usage: node client.js download <filename> <key> <iv> <authTag> <outputPath>');
      return;
    }
    const [filename, key, iv, authTag, outputPath] = process.argv.slice(3);
    await downloadFile(filename, key, iv, authTag, outputPath);
  }
}

main().catch(console.error);