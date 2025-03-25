// src/components/UploadModal.tsx
import React from "react";

interface UploadModalProps {
  preview: string;
  selectedFile: File | null;
  embeddedImg: string;
  extractedImg: string;
  txHash: string;
  loading: boolean;
  error: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onClose: () => void;
}

export default function UploadModal({
  preview,
  selectedFile,
  embeddedImg,
  extractedImg,
  txHash,
  loading,
  error,
  onFileChange,
  onUpload,
  onClose,
}: UploadModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select and Upload an Image</h2>

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 mb-4"
        />

        {preview && (
          <img
            src={preview}
            alt="Selected File"
            className="w-full h-auto mb-4 rounded shadow"
          />
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded">{error}</div>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {txHash && (
          <p className="mb-4 text-sm text-gray-800">
            Transaction Hash:
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 ml-1"
            >
              {txHash}
            </a>
          </p>
        )}

        {embeddedImg && (
          <div className="mb-4">
            <p className="font-semibold text-gray-800">Embedded Image:</p>
            <img
              src={embeddedImg}
              alt="Embedded Watermark"
              className="w-full h-auto mt-2 rounded shadow"
            />
          </div>
        )}

        {extractedImg && (
          <div className="mb-4">
            <p className="font-semibold text-gray-800">Extracted Watermark:</p>
            <img
              src={extractedImg}
              alt="Extracted Watermark"
              className="w-full h-auto mt-2 rounded shadow"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
