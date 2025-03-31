"use client";

import { useState } from "react";
import UploadSection from "@/components/UploadSection";
import SettingsSection from "@/components/SettingsSection";
import DisplaySection from "@/components/DisplaySection";
import { useLocalSettings } from "@/hooks/useLocalSettings";

export default function WorkspacePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [embeddedImg, setEmbeddedImg] = useState<string>("");
  const [extractedImg, setExtractedImg] = useState<string>("");

  const {
    selectedChain,
    setSelectedChain,
    walletKey,
    setWalletKey,
    saveSettings,
  } = useLocalSettings();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setEmbeddedImg("");
    setExtractedImg("");
    setTxHash("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!selectedChain || !walletKey) {
      setError("Please select a chain and provide a wallet key in settings.");
      return;
    }

    setLoading(true);
    setError("");

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
      if (data.txHash) setTxHash(data.txHash);

      alert(`File uploaded successfully: ${selectedFile.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen">
      {/* 左侧：设置和上传 */}
      <div className="w-1/2 border-r bg-white p-6 overflow-auto">
        <SettingsSection
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          walletKey={walletKey}
          setWalletKey={setWalletKey}
          onSave={saveSettings}
        />
        <UploadSection
          selectedFile={selectedFile}
          preview={preview}
          loading={loading}
          error={error}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </div>

      {/* 右侧：图像显示 */}
      <div className="w-1/2 bg-gray-50 p-6 overflow-auto">
        <DisplaySection
          preview={preview}
          embeddedImg={embeddedImg}
          extractedImg={extractedImg}
          txHash={txHash}
        />
      </div>
    </main>
  );
}
