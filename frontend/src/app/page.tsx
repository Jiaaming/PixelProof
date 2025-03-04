"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // Settings states
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [walletKey, setWalletKey] = useState<string>("");

  // Additional states for watermarked images
  const [embeddedImg, setEmbeddedImg] = useState<string>("");
  const [extractedImg, setExtractedImg] = useState<string>("");

  // Layout hover state
  const [hoveredSection, setHoveredSection] = useState<"none" | "top" | "bottom">("none");

  // Dynamic section heights
  const topHeight =
    hoveredSection === "top" ? "60%" : hoveredSection === "bottom" ? "40%" : "50%";
  const bottomHeight =
    hoveredSection === "bottom" ? "60%" : hoveredSection === "top" ? "40%" : "50%";

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedChain = localStorage.getItem("selectedChain");
    const savedKey = localStorage.getItem("walletKey");
    if (savedChain) setSelectedChain(savedChain);
    if (savedKey) setWalletKey(savedKey);
  }, []);

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setEmbeddedImg("");
    setExtractedImg("");
  };

  // Upload handler with chain and key
  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate settings
    if (!selectedChain || !walletKey) {
      setError("Please select a chain and provide a wallet key in settings.");
      return;
    }
    setLoading(true); // Start loading
    setError(""); // Clear previous errors
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("chain", selectedChain);
    formData.append("key", walletKey);

    try {
      const response = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed. Please check server logs or try again.");
      }

      const data = await response.json();
      const embeddedBase64 = `data:${data.embedded.type};base64,${data.embedded.data}`;
      const extractedBase64 = `data:${data.extracted.type};base64,${data.extracted.data}`;
      setEmbeddedImg(embeddedBase64);
      setExtractedImg(extractedBase64);

      if (data.txHash) {
        setTxHash(data.txHash);
      }

      alert(`File uploaded successfully: ${selectedFile.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* TOP SECTION */}
      <section
        style={{ height: topHeight, backgroundImage: `url('/bg2.jpeg')` }}
        className="transition-all duration-500 ease-in-out relative bg-cover bg-center"
        onMouseEnter={() => setHoveredSection("top")}
        onMouseLeave={() => setHoveredSection("none")}
      >
        <div className="absolute inset-0 bg-black/20" />
      </section>

      {/* BOTTOM SECTION */}
      <section
        style={{ height: bottomHeight }}
        className="transition-all duration-500 ease-in-out bg-white relative"
        onMouseEnter={() => setHoveredSection("bottom")}
        onMouseLeave={() => setHoveredSection("none")}
      >
        <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">PixelProof</h1>
          <p className="text-lg text-gray-600 mb-8">
            Empower your images with invisible watermarking and on-chain registration
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-block px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
            >
              Upload an Image
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-block px-6 py-3 text-lg font-semibold text-white bg-gray-600 rounded-lg shadow hover:bg-gray-700"
            >
              Settings
            </button>
          </div>
        </div>
      </section>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Blockchain Chain
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Chain</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SUI">Sui (SUI)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Wallet Key
            </label>
            <input
              type="text"
              value={walletKey}
              onChange={(e) => setWalletKey(e.target.value)}
              placeholder="e.g., ETH_PRIVATE_KEY, SUI_KEY"
              className="w-full p-2 border rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  localStorage.setItem("selectedChain", selectedChain);
                  localStorage.setItem("walletKey", walletKey);
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select and Upload an Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
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
      )}
    </main>
  );
}