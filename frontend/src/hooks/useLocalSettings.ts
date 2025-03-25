// src/hooks/useLocalSettings.ts
import { useState, useEffect } from "react";

export function useLocalSettings() {
  const [selectedChain, setSelectedChain] = useState("");
  const [walletKey, setWalletKey] = useState("");

  // 加载 localStorage 中保存的设置
  useEffect(() => {
    const savedChain = localStorage.getItem("selectedChain");
    const savedKey = localStorage.getItem("walletKey");
    if (savedChain) setSelectedChain(savedChain);
    if (savedKey) setWalletKey(savedKey);
  }, []);

  // 保存设置到 localStorage
  const saveSettings = () => {
    localStorage.setItem("selectedChain", selectedChain);
    localStorage.setItem("walletKey", walletKey);
  };

  return {
    selectedChain,
    setSelectedChain,
    walletKey,
    setWalletKey,
    saveSettings,
  };
}
