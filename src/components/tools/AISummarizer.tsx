"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { useLocalAI } from "@/hooks/useLocalAI";
import { PROMPTS } from "@/lib/ai/prompts";
import AIStreamOutput from "@/components/AIStreamOutput";
import { trackEvent } from "@/lib/analytics";

type SummaryLength = "1 sentence" | "1 paragraph" | "Key points";

const LENGTH_OPTIONS: SummaryLength[] = ["1 sentence", "1 paragraph", "Key points"];

export default function AISummarizer() {
  const { isReady, isSupported, loadModel, streamInfer, status } = useLocalAI();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [length, setLength] = useState<SummaryLength>("1 paragraph");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = useCallback(async () => {
    if (!input.trim()) return;

    if (!isReady) {
      await loadModel();
    }

    setOutput("");
    setIsStreaming(true);

    try {
      await streamInfer(
        `Summarize the following text in ${length}:\n\n${input}`,
        PROMPTS.summarizer,
        (token) => setOutput((prev) => prev + token)
      );
      trackEvent("tool_used", { tool: "ai_summarizer", length });
    } catch {
      setOutput("Error: Failed to generate summary. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, [input, length, isReady, loadModel, streamInfer]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isModelLoading = status === "downloading" || status === "loading";

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Text to summarize
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your text here..."
          rows={8}
          className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
        />
        <p className="text-text-tertiary text-xs mt-1">
          {input.length.toLocaleString()} characters
        </p>
      </div>

      {/* Length selector */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Summary length
        </label>
        <div className="flex gap-2">
          {LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setLength(opt)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                length === opt
                  ? "bg-accent text-accent-fg"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Summarize button */}
      {!isSupported ? (
        <p className="text-text-tertiary text-sm">
          WebGPU required. Try Chrome or Edge, or install Ollama.
        </p>
      ) : (
        <button
          onClick={handleSummarize}
          disabled={!input.trim() || isStreaming || isModelLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-accent-fg rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming || isModelLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isModelLoading ? "Loading AI model..." : isStreaming ? "Summarizing..." : "Summarize"}
        </button>
      )}

      {/* Output */}
      <AIStreamOutput content={output} isStreaming={isStreaming} />

      {/* Copy button */}
      {output && !isStreaming && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary border border-border rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-grade-a" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
      )}
    </div>
  );
}
