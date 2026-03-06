"use client";

import { useLocalAI } from "@/hooks/useLocalAI";
import { Sparkles } from "lucide-react";

/**
 * Header badge showing AI status.
 * Hidden when no AI is loaded. Shows provider info when active.
 */
export default function AIStatusBadge() {
  const { isReady, provider } = useLocalAI();

  if (!isReady) return null;

  const label =
    provider === "ollama"
      ? "AI: Ollama Connected"
      : "AI: Running locally";

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
      <Sparkles className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
