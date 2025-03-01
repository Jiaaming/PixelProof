"use client";

import { useState } from "react";

export default function HomePage() {
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Additional states to display watermarked images
  const [embeddedImg, setEmbeddedImg] = useState<string>("");
  const [extractedImg, setExtractedImg] = useState<string>("");

  // Layout hover state: "none" | "top" | "bottom"
  const [hoveredSection, setHoveredSection] = useState<"none" | "top" | "bottom">("none");

  // Decide how much height each section should have
  const topHeight =
    hoveredSection === "top"
      ? "60%"
      : hoveredSection === "bottom"
      ? "40%"
      : "50%";

  const bottomHeight =
    hoveredSection === "bottom"
      ? "60%"
      : hoveredSection === "top"
      ? "40%"
      : "50%";

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    // Clear out previous watermarked images
    setEmbeddedImg("");
    setExtractedImg("");
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed. Please check server logs or try again.");
      }

      const data = await response.json();
      /**
       * Example data structure returned:
       * {
       *   "embedded": {
       *     "data": "<base64-string>",
       *     "type": "image/jpeg"
       *   },
       *   "extracted": {
       *     "data": "<base64-string>",
       *     "type": "image/png"
       *   }
       * }
       */

      // Construct Base64 URLs and set them in state
      const embeddedBase64 = `data:${data.embedded.type};base64,${data.embedded.data}`;
      const extractedBase64 = `data:${data.extracted.type};base64,${data.extracted.data}`;

      setEmbeddedImg(embeddedBase64);
      setExtractedImg(extractedBase64);

      setError("");
      alert(`File uploaded successfully: ${selectedFile.name}`);
      // setShowModal(false); // optionally close the modal
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* TOP SECTION */}
      <section
        // Dynamic height
        style={{ height: topHeight }}
        // Tailwind transitions for smooth resizing
        className="transition-all duration-500 ease-in-out relative bg-cover bg-center"
        // The background image
        style={{
          height: topHeight,
          backgroundImage: `url('/bg2.jpeg')`,
        }}
        onMouseEnter={() => setHoveredSection("top")}
        onMouseLeave={() => setHoveredSection("none")}
      >
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* You could place text or a heading in the top half here */}
      </section>

      {/* BOTTOM SECTION */}
      <section
        // Dynamic height
        style={{ height: bottomHeight }}
        className="transition-all duration-500 ease-in-out bg-white relative"
        onMouseEnter={() => setHoveredSection("bottom")}
        onMouseLeave={() => setHoveredSection("none")}
      >
        <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4">
          {/* Content in the bottom half */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">PixelProof</h1>
          <p className="text-lg text-gray-600 mb-8">
            Empower your images with invisible watermarking and on-chain registration
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
          >
            Upload an Image
          </button>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Background overlay—close modal if user clicks outside */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            // onClick={() => setShowModal(false)}
          ></div>

          {/* Modal box */}
          <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2
              className="text-xl font-bold text-gray-800 mb-4"
              id="modal-title"
            >
              Select and Upload an Image
            </h2>

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700
                mb-4
              "
            />

            {/* Preview: original image */}
            {preview && (
              <img
                src={preview}
                alt="Selected File"
                className="w-full h-auto mb-4 rounded shadow"
              />
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-600 rounded">
                {error}
              </div>
            )}

            {/* TX hash result */}
            {txHash && (
              <p className="mb-4 text-sm text-gray-800">
                Transaction Hash:
                <a
                  href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 ml-1"
                >
                  {txHash}
                </a>
              </p>
            )}

            {/* Embedded image */}
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

            {/* Extracted watermark */}
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

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}