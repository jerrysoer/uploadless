"use client";

import { useLocalAI } from "@/hooks/useLocalAI";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { getModelPack } from "@/lib/ai/registry";

/**
 * Header badge showing AI status.
 * Hidden when no AI is loaded. Shows provider + model info when active.
 */
export default function AIStatusBadge() {
  const { isReady, provider, selectedSlug } = useLocalAI();

  if (!isReady) return null;

  const pack = selectedSlug ? getModelPack(selectedSlug) : null;
  const label =
    provider === "ollama"
      ? "AI: Ollama Connected"
      : pack
        ? `AI: ${pack.icon} ${pack.name}`
        : "AI: Running locally";

  return (
    <Link
      href="/ai/models"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
    >
      <Sparkles className="w-3 h-3" />
      <span>{label}</span>
    </Link>
  );
}
