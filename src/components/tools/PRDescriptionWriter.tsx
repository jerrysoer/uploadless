"use client";

import { useState, useCallback, useEffect } from "react";
import { GitPullRequest, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { useLocalAI } from "@/hooks/useLocalAI";
import { PROMPTS } from "@/lib/ai/prompts";
import AIStreamOutput from "@/components/AIStreamOutput";
import FeatureLock from "@/components/ai/FeatureLock";
import { trackEvent } from "@/lib/analytics";

export default function PRDescriptionWriter() {
  const { isReady, isSupported, loadModel, streamInfer, status } = useLocalAI();
  const [diff, setDiff] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "pr_description_writer" });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!diff.trim()) return;

    if (!isReady) {
      await loadModel();
    }

    setOutput("");
    setIsStreaming(true);

    const userPrompt = [
      `Changes:\n${diff}`,
      context.trim() ? `\nAdditional context:\n${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await streamInfer(
        userPrompt,
        PROMPTS.prDescriptionWriter,
        (token) => setOutput((prev) => prev + token)
      );
      trackEvent("ai_tool_used", { tool: "pr_description_writer" });
    } catch {
      setOutput(
        "Error: Failed to generate PR description. Please try again."
      );
    } finally {
      setIsStreaming(false);
    }
  }, [diff, context, isReady, loadModel, streamInfer]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isModelLoading = status === "downloading" || status === "loading";

  return (
    <div>
      <ToolPageHeader
        icon={GitPullRequest}
        title="PR Description Writer"
        description="Generate a well-structured pull request description from your diff or change list."
      />

      <FeatureLock requiredCapability="pr_description">
        <div className="space-y-6">
          {/* Diff / changes */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Paste your diff or describe changes
            </label>
            <textarea
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              placeholder="Paste your git diff or describe the changes made..."
              rows={8}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
            />
          </div>

          {/* Context (optional) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Additional context{" "}
              <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any additional context, motivation, or related issues..."
              rows={3}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
            />
          </div>

          {/* Generate button */}
          {!isSupported ? (
            <p className="text-text-tertiary text-sm">
              WebGPU required. Try Chrome or Edge, or install Ollama.
            </p>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!diff.trim() || isStreaming || isModelLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-accent-fg rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming || isModelLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isModelLoading
                ? "Loading AI model..."
                : isStreaming
                  ? "Generating..."
                  : "Generate PR Description"}
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

          <p className="text-text-tertiary text-xs mt-6">
            Generated by local AI — may contain errors.
          </p>
        </div>
      </FeatureLock>
    </div>
  );
}
