"use client";

import { useState } from "react";
import UploadSection from "@/components/UploadSection";
import DisplaySection from "@/components/DisplaySection";

export default function DecodePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [extractedImageUrl, setExtractedImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setExtractedImageUrl("");
    setError("");
  };

  const handleDecode = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setExtractedImageUrl("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/v1/workspace/decode", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Decode failed");
      }

      const data = await response.json();
      const { extracted } = data;
      if (extracted && extracted.data && extracted.type) {
        const imageUrl = `data:${extracted.type};base64,${extracted.data}`;
        setExtractedImageUrl(imageUrl);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      alert(`❌ Decode failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen">
      <div className="w-1/2 border-r bg-white p-6 overflow-auto">
        <UploadSection
          selectedFile={selectedFile}
          preview={preview}
          loading={loading}
          error={error}
          onFileChange={handleFileChange}
          onUpload={handleDecode}
          uploadLabel="Decode Image"
        />
      </div>

      <div className="w-1/2 bg-gray-50 p-6 overflow-auto">
      <DisplaySection
        mode="decode"
        preview={preview} // Your uploaded image preview URL
        extractedImg={extractedImageUrl}
      />
      </div>
    </main>
  );
}