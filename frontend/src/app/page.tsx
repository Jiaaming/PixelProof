"use client";

import { useState, useEffect } from "react";
import SettingsModal from "@/components/SettingsModal";
import UploadModal from "@/components/UploadModal";

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
    hoveredSection === "top" ? "55%" : hoveredSection === "bottom" ? "45%" : "50%";
  const bottomHeight =
    hoveredSection === "bottom" ? "55%" : hoveredSection === "top" ? "45%" : "50%";

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
          <SettingsModal
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          walletKey={walletKey}
          setWalletKey={setWalletKey}
          onSave={() => {
            localStorage.setItem("selectedChain", selectedChain);
            localStorage.setItem("walletKey", walletKey);
            setShowSettingsModal(false);
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
          <UploadModal
          preview={preview}
          selectedFile={selectedFile}
          embeddedImg={embeddedImg}
          extractedImg={extractedImg}
          txHash={txHash}
          loading={loading}
          error={error}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}