# Secure File Transfer System

A modern, secure file transfer application with end-to-end encryption, real-time status updates, and a beautiful React frontend.

![Secure File Transfer](https://raw.githubusercontent.com/yourusername/secure-file-transfer/main/screenshot.png)

## ✨ Features

### Security

- 🔒 **End-to-End Encryption** using AES-256-GCM
- 🛡️ **Secure Key Management** with per-file encryption keys
- 🔐 **Authentication Tags** for data integrity verification
- 📝 **SHA-256 Hash Verification** for file integrity

### User Experience

- 🖥️ **Modern React Frontend** with Tailwind CSS
- 📱 **Responsive Design** for all devices
- 🔄 **Drag & Drop** file uploads
- 📊 **Real-time Status Updates**

### Backend

- 🚀 **Express.js Server** with robust error handling
- 📦 **Multer** for efficient file uploads
- 🔍 **Winston Logger** for comprehensive logging
- 🛑 **Rate Limiting** for DDoS protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 7+

### Installation

\`\`\`bash

# Clone the repository

git clone https://github.com/ritikarajput01/secure-file-transfer.git

# Install dependencies

npm install

# Start the backend server

npm run start:server

# In a new terminal, start the frontend

npm run dev
\`\`\`

## 💻 Usage

### Web Interface

1. Open your browser to the provided URL
2. Drag & drop files or click to select
3. Save the encryption details after upload
4. Use the download form with saved details to retrieve files

### CLI Interface

Upload:
\`\`\`bash
npm run start:client upload ./path/to/file
\`\`\`

Download:
\`\`\`bash
npm run start:client download <filename> <key> <iv> <authTag> ./output/path
\`\`\`

## 🔒 Security Features

### Encryption

- AES-256-GCM encryption
- Unique keys per file
- Secure IV generation
- Authentication tags

### File Security

- Automatic cleanup of unencrypted files
- File integrity verification
- Size limits (50MB max)

### Server Security

- Rate limiting
- Helmet.js security headers
- CORS protection
- Input validation

## 📝 API Documentation

### POST /upload

Upload and encrypt a file.

Request:

- Method: POST
- Content-Type: multipart/form-data
- Body: file

Response:
\`\`\`json
{
"message": "File uploaded and encrypted successfully",
"filename": "string",
"hash": "string",
"key": "hex string",
"iv": "hex string",
"authTag": "hex string"
}
\`\`\`

### GET /download/:filename

Download and decrypt a file.

Request:

- Method: GET
- Query Parameters:
  - key: encryption key (hex)
  - iv: initialization vector (hex)
  - authTag: authentication tag (hex)

Response:

- Decrypted file content

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Tests cover:

- Encryption/decryption
- File hashing
- Upload/download flows
- Error handling

## 📈 Monitoring

All events are logged with timestamps:

- File uploads
- Downloads
- Errors
- System events

Logs are stored in \`backend/logs/transfer.log\`

## 🛡️ Best Practices

1. **Key Management**

   - Never store keys in plain text
   - Use secure key transmission
   - Rotate keys regularly

2. **File Handling**

   - Validate file types
   - Limit file sizes
   - Clean up temporary files

3. **Error Handling**
   - Graceful error recovery
   - Detailed error logging
   - User-friendly error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🔗 Links

- [Documentation](docs/README.md)
- [Security Policy](SECURITY.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🙋 Support

Open an issue or contact the maintainers for support.
