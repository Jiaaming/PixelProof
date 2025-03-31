"use client";

import React, { useState } from "react";

interface DisplaySectionProps {
  preview: string;
  embeddedImg: string;
  extractedImg: string;
  txHash: string;
}

export default function DisplaySection({
  preview,
  embeddedImg,
  extractedImg,
  txHash,
}: DisplaySectionProps) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const renderImagePreview = (src: string, label: string) => (
    <div className="mb-4">
      <p className="font-semibold text-gray-800">{label}</p>
      <img
        src={src}
        alt={label}
        className="max-w-full max-h-64 mt-2 rounded shadow cursor-pointer"
        onClick={() => setZoomImage(src)}
      />
    </div>
  );

  return (
    <div>
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

      {preview && renderImagePreview(preview, "Original Image")}
      {embeddedImg && renderImagePreview(embeddedImg, "Embedded Image")}
      {extractedImg && renderImagePreview(extractedImg, "Extracted Watermark")}

      {zoomImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-[90%] max-h-[90%] rounded shadow-lg border-4 border-white"
          />
        </div>
      )}
    </div>
  );
}
