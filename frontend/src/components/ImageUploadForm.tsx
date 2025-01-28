'use client'; // Next.js Client Component

import { useState } from 'react';

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Please check server logs or try again.');
      }

      const data = await response.json();
      setTxHash(data.tx_hash);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-600 to-indigo-700 min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-6 text-center">
          <span className="text-pink-300">PixelProof</span>
        </h1>

        {/* Description */}
        <p className="mb-4 text-center text-lg text-white/90 leading-relaxed max-w-xl mx-auto">
          Empower your images with invisible watermarking and on-chain registration
        </p>
        
        {/* File Upload Section */}
        <div className="flex flex-col items-start mb-6">
          <label className="mb-2 font-semibold text-white/90">
            Select an image to register:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-pink-500 file:text-white
              hover:file:bg-pink-600
              cursor-pointer
            "
          />
          <button
            onClick={handleUpload}
            className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded transition-colors"
          >
            Upload & Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        {/* Preview & Result */}
        <div className="border-t border-white/20 pt-6">
          <h2 className="text-xl font-semibold mb-4">
            Result
          </h2>

          {/* Image Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto rounded shadow mb-4"
            />
          )}

          {/* Transaction Hash */}
          {txHash && (
            <p className="text-sm text-white/90">
              Transaction Hash:
              <a
                href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-300 hover:text-pink-400 ml-2"
              >
                {txHash}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Footer or Additional Info */}
      <p className="mt-8 text-xs text-white/70">
        Powered by FastAPI • Polygon (Mumbai) • Invisible Watermark
      </p>
    </div>
  );
}