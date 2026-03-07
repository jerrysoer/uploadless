"use client";

import { useLocalAI } from "@/hooks/useLocalAI";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { getModelPack } from "@/lib/ai/registry";

export default function AIStatusBadge() {
  const { isReady, isSupported, provider, selectedSlug, status, progress } =
    useLocalAI();

  if (!isSupported) return null;

  const pack = selectedSlug ? getModelPack(selectedSlug) : null;

  // Downloading state
  if (status === "downloading") {
    return (
      <Link
        href="/ai/models"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Downloading {Math.round(progress)}%</span>
      </Link>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <Link
        href="/ai/models"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Loading model…</span>
      </Link>
    );
  }

  // Ready state
  if (isReady) {
    const label =
      provider === "ollama"
        ? "Ollama Connected"
        : pack
          ? `${pack.icon} ${pack.name}`
          : "AI Ready";

    return (
      <Link
        href="/ai/models"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-grade-a flex-shrink-0" />
        <span>{label}</span>
      </Link>
    );
  }

  // No model loaded (default — gray state)
  return (
    <Link
      href="/ai/models"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface border border-border text-text-tertiary text-xs font-medium hover:text-text-secondary hover:border-border-hover transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-text-tertiary flex-shrink-0" />
      <span>No AI model</span>
    </Link>
  );
}
