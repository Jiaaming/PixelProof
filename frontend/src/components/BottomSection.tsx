// src/components/BottomSection.tsx
import React from "react";

interface BottomSectionProps {
  height: string;
  onHover: (section: "bottom" | "none") => void;
  onUploadClick: () => void;
  onSettingsClick: () => void;
  onWorkspaceClick: () => void;
}

export default function BottomSection({
  height,
  onHover,
  onUploadClick,
  onSettingsClick,
  onWorkspaceClick,
}: BottomSectionProps) {
  return (
    <section
      style={{ height }}
      className="transition-all duration-500 ease-in-out bg-white relative"
      onMouseEnter={() => onHover("bottom")}
      onMouseLeave={() => onHover("none")}
    >
      <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">PixelProof</h1>
        <p className="text-lg text-gray-600 mb-8">
          Empower your images with invisible watermarking and on-chain registration
        </p>
        <div className="flex space-x-4">
          {/* <button
            onClick={onUploadClick}
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
          >
            Upload an Image
          </button>
          <button
            onClick={onSettingsClick}
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-gray-600 rounded-lg shadow hover:bg-gray-700"
          >
            Settings
          </button> */}
          <button
            onClick={onWorkspaceClick}
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-teal-600 rounded-lg shadow hover:bg-teal-700"
          >
            Open Workspace
          </button>
        </div>
      </div>
    </section>
  );
}
