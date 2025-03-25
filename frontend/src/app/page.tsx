"use client";

import { useState, useEffect } from "react";
import SettingsModal from "@/components/SettingsModal";
import UploadModal from "@/components/UploadModal";
import TopSection from "@/components/TopSection";
import BottomSection from "@/components/BottomSection";

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
      <TopSection height={topHeight} onHover={setHoveredSection} />


      {/* BOTTOM SECTION */}
      <BottomSection
        height={bottomHeight}
        onHover={setHoveredSection}
        onUploadClick={() => setShowModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
      />


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