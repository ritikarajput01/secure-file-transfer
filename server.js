import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { createLogger, format, transports } from 'winston';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, 'uploads');
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
await fs.mkdir(uploadsDir, { recursive: true });

// Configure Winston logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'transfer.log' }),
    new transports.Console()
  ]
});

const app = express();

// Enable CORS
app.use(cors());

// Security middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Generate encryption key for the session
const generateEncryptionKey = () => {
  return crypto.randomBytes(32);
};

// Encrypt file
const encryptFile = (buffer, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { encrypted, iv, authTag };
};

// Decrypt file
const decryptFile = (encrypted, key, iv, authTag) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

// Calculate file hash for integrity check
const calculateHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const fileBuffer = await fs.readFile(req.file.path);
    const key = generateEncryptionKey();
    const { encrypted, iv, authTag } = encryptFile(fileBuffer, key);
    const hash = calculateHash(fileBuffer);

    await fs.writeFile(req.file.path + '.enc', encrypted);
    await fs.unlink(req.file.path); // Remove original file

    logger.info({
      event: 'file_upload',
      filename: req.file.originalname,
      size: req.file.size,
      hash
    });

    res.json({
      message: 'File uploaded and encrypted successfully',
      filename: req.file.filename,
      hash,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  } catch (error) {
    logger.error({
      event: 'upload_error',
      error: error.message
    });
    res.status(500).json({ error: error.message });
  }
});

app.get('/download/:filename', async (req, res) => {
  try {
    const { key, iv, authTag } = req.query;
    if (!key || !iv || !authTag) {
      throw new Error('Missing decryption parameters');
    }

    const filePath = join(uploadsDir, req.params.filename + '.enc');
    const encryptedBuffer = await fs.readFile(filePath);
    
    const decrypted = decryptFile(
      encryptedBuffer,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
      Buffer.from(authTag, 'hex')
    );

    const hash = calculateHash(decrypted);
    
    logger.info({
      event: 'file_download',
      filename: req.params.filename,
      hash
    });

    res.send(decrypted);
  } catch (error) {
    logger.error({
      event: 'download_error',
      error: error.message
    });
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});