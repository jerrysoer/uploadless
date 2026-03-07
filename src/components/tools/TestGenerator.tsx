"use client";

import { useState, useCallback, useEffect } from "react";
import { FlaskConical, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { useLocalAI } from "@/hooks/useLocalAI";
import { PROMPTS } from "@/lib/ai/prompts";
import AIStreamOutput from "@/components/AIStreamOutput";
import FeatureLock from "@/components/ai/FeatureLock";
import { trackEvent } from "@/lib/analytics";

const LANGUAGES = [
  "JavaScript/TypeScript (Jest)",
  "Python (pytest)",
  "Go",
  "Java",
  "Other",
] as const;

type Language = (typeof LANGUAGES)[number];

export default function TestGenerator() {
  const { isReady, isSupported, loadModel, streamInfer, status } = useLocalAI();
  const [language, setLanguage] = useState<Language>(
    "JavaScript/TypeScript (Jest)"
  );
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "test_generator" });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;

    if (!isReady) {
      await loadModel();
    }

    setOutput("");
    setIsStreaming(true);

    try {
      await streamInfer(
        `Language/Framework: ${language}\n\nGenerate tests for the following code:\n\n${input}`,
        PROMPTS.testGenerator,
        (token) => setOutput((prev) => prev + token)
      );
      trackEvent("ai_tool_used", { tool: "test_generator" });
    } catch {
      setOutput("Error: Failed to generate tests. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, [input, language, isReady, loadModel, streamInfer]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isModelLoading = status === "downloading" || status === "loading";

  return (
    <div>
      <ToolPageHeader
        icon={FlaskConical}
        title="Test Generator"
        description="Paste a function and get comprehensive test cases generated automatically."
      />

      <FeatureLock requiredCapability="test_generate">
        <div className="space-y-6">
          {/* Language selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Language / Framework
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Code input */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Paste the function to test
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your function or code here..."
              rows={10}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
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
              disabled={!input.trim() || isStreaming || isModelLoading}
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
                  : "Generate Tests"}
            </button>
          )}

          {/* Output */}
          <AIStreamOutput
            content={output}
            isStreaming={isStreaming}
            className="font-mono"
          />

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
