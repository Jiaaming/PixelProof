"use client";

import React from "react";

interface UploadModalProps {
  selectedFile: File | null;
  preview: string;
  loading: boolean;
  error: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onClose: () => void;
}

export default function UploadModal({
  selectedFile,
  preview,
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
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select an Image</h2>

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 mb-4"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!selectedFile}
            className={`px-4 py-2 rounded text-white ${
              !selectedFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
