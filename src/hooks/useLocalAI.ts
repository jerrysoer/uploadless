"use client";

import { useContext } from "react";
import { AIContext } from "@/components/AIProvider";
import type { AIContextValue } from "@/lib/ai/types";

/**
 * Hook for accessing local AI capabilities.
 *
 * Usage:
 *   const { isReady, infer, streamInfer, loadModel } = useLocalAI();
 *
 *   // Load model on user action
 *   await loadModel();
 *
 *   // Run inference
 *   const result = await infer("Explain this code", systemPrompt);
 *
 *   // Stream tokens
 *   await streamInfer("Summarize this", systemPrompt, (token) => {
 *     setOutput(prev => prev + token);
 *   });
 */
export function useLocalAI(): AIContextValue {
  const ctx = useContext(AIContext);
  if (!ctx) {
    throw new Error("useLocalAI must be used within <AIProvider>");
  }
  return ctx;
}
