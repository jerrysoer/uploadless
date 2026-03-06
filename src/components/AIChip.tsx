"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useLocalAI } from "@/hooks/useLocalAI";

interface AIChipProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Small "✦ Local AI" chip for tools that support AI enhancement.
 * Click triggers model load if not ready, then calls onClick.
 */
export default function AIChip({ label, onClick, disabled }: AIChipProps) {
  const { isReady, isSupported, status, loadModel } = useLocalAI();
  const [loading, setLoading] = useState(false);

  if (!isSupported) return null;

  async function handleClick() {
    if (disabled) return;

    if (!isReady) {
      setLoading(true);
      try {
        await loadModel();
      } catch {
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    onClick();
  }

  const isModelLoading = loading || status === "downloading" || status === "loading";

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isModelLoading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isModelLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      <span>{isModelLoading ? "Loading AI..." : label}</span>
    </button>
  );
}
