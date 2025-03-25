// components/SettingsModal.tsx
import React from "react";

interface SettingsModalProps {
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  walletKey: string;
  setWalletKey: (key: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function SettingsModal({
  selectedChain,
  setSelectedChain,
  walletKey,
  setWalletKey,
  onSave,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
