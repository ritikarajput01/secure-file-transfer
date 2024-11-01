import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [downloadKey, setDownloadKey] = useState('');
  const [downloadIv, setDownloadIv] = useState('');
  const [downloadAuthTag, setDownloadAuthTag] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setUploadedFiles([...uploadedFiles, { 
        originalName: file.name,
        ...result 
      }]);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1
  });

  const handleDownload = async () => {
    if (!downloadFilename || !downloadKey || !downloadIv || !downloadAuthTag) {
      toast.error('Please fill in all download fields');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/download/${downloadFilename}?key=${downloadKey}&iv=${downloadIv}&authTag=${downloadAuthTag}`,
        { method: 'GET' }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename.replace(/\.enc$/, '');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully!');
    } catch (error) {
      toast.error('Download failed: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Secure File Transfer</h1>
      
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{file.originalName}</span>
                </div>
                <div className="grid gap-2 text-sm">
                  <p><strong>Filename:</strong> {file.filename}</p>
                  <p><strong>Key:</strong> {file.key}</p>
                  <p><strong>IV:</strong> {file.iv}</p>
                  <p><strong>Auth Tag:</strong> {file.authTag}</p>
                  <p><strong>Hash:</strong> {file.hash}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Download File</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filename
            </label>
            <input
              type="text"
              value={downloadFilename}
              onChange={(e) => setDownloadFilename(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter filename"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key
            </label>
            <input
              type="text"
              value={downloadKey}
              onChange={(e) => setDownloadKey(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter encryption key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IV
            </label>
            <input
              type="text"
              value={downloadIv}
              onChange={(e) => setDownloadIv(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter IV"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auth Tag
            </label>
            <input
              type="text"
              value={downloadAuthTag}
              onChange={(e) => setDownloadAuthTag(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter auth tag"
            />
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;