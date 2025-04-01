"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";

interface SettingsSectionProps {
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  walletKey: string;
  setWalletKey: (key: string) => void;
  onSave: () => void;
}

export default function SettingsSection({
  selectedChain,
  setSelectedChain,
  walletKey,
  setWalletKey,
  onSave,
}: SettingsSectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mb-6 space-y-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800"
      >
        Open Settings
      </button>

      <div className="text-sm text-gray-600 break-words">
        <p><strong>Selected Chain:</strong> {selectedChain || "(none)"}</p>
      </div>

      {showModal && (
        <SettingsModal
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          walletKey={walletKey}
          setWalletKey={setWalletKey}
          onSave={() => {
            onSave();
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
