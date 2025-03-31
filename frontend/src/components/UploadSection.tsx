"use client";

import { useState } from "react";
import UploadModal from "./UploadModal";

interface UploadSectionProps {
  selectedFile: File | null;
  preview: string;
  loading: boolean;
  error: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export default function UploadSection({
  selectedFile,
  preview,
  loading,
  error,
  onFileChange,
  onUpload,
}: UploadSectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center space-x-2 text-indigo-600 text-sm">
          <div className="w-4 h-4 border-2 border-t-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Uploading...</span>
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={`px-6 py-3 text-white rounded-lg shadow ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        Upload an Image
      </button>

      {selectedFile && (
        <div className="text-sm text-gray-500">
          <strong>Selected File:</strong> {selectedFile.name}
        </div>
      )}

      {preview && (
        <div className="text-sm text-gray-500 break-words">
          <strong>Preview URL:</strong> {preview}
        </div>
      )}

      {showModal && (
        <UploadModal
          selectedFile={selectedFile}
          preview={preview}
          loading={false}
          error={""}
          onFileChange={onFileChange}
          onUpload={() => {
            onUpload();
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
