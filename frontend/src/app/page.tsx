"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
//components
import SettingsModal from "@/components/SettingsModal";
import UploadModal from "@/components/UploadModal";
import TopSection from "@/components/TopSection";
import BottomSection from "@/components/BottomSection";
import DisplaySection from "@/components/DisplaySection";
//hooks
import { useLocalSettings } from "@/hooks/useLocalSettings";

export default function HomePage() {
  const router = useRouter();
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  //File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state

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
  const {
    selectedChain,
    setSelectedChain,
    walletKey,
    setWalletKey,
    saveSettings,
  } = useLocalSettings();
  
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
    if (!selectedChain) {
      setError("Please select a chain in settings.");
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
        console.error("Upload failed:", response);
        throw new Error("Upload failed. You have already registered this image.");
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
      {/* <BottomSection
        height={bottomHeight}
        onHover={setHoveredSection}
        onUploadClick={() => setShowModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
      /> */}
      <BottomSection
        height={bottomHeight}
        onHover={setHoveredSection}
        onUploadClick={() => router.push("/workspace")}
        onSettingsClick={() => {}}
        onWorkspaceClick={() => router.push("/workspace")} 
      />
    </main>
  );
}