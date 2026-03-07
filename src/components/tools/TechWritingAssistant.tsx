"use client";

import { useState, useCallback, useEffect } from "react";
import { PenTool, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { useLocalAI } from "@/hooks/useLocalAI";
import { PROMPTS } from "@/lib/ai/prompts";
import AIStreamOutput from "@/components/AIStreamOutput";
import OllamaGate from "@/components/ai/OllamaGate";
import { trackEvent } from "@/lib/analytics";

const AUDIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type AudienceLevel = (typeof AUDIENCE_LEVELS)[number];

const CONTENT_TYPES = [
  "Tutorial",
  "API Reference",
  "How-to Guide",
  "Explanation",
  "Troubleshooting",
] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

export default function TechWritingAssistant() {
  const { isReady, isSupported, loadModel, streamInfer, status } = useLocalAI();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState<AudienceLevel>("Intermediate");
  const [contentType, setContentType] = useState<ContentType>("Tutorial");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "tech_writing_assistant" });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;

    if (!isReady) {
      await loadModel();
    }

    setOutput("");
    setIsStreaming(true);

    const userPrompt = [
      `Topic: ${topic}`,
      `Audience level: ${audience}`,
      `Content type: ${contentType}`,
      notes.trim() ? `\nNotes/outline:\n${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await streamInfer(
        userPrompt,
        PROMPTS.techWritingAssistant,
        (token) => setOutput((prev) => prev + token)
      );
      trackEvent("ai_tool_used", { tool: "tech_writing_assistant" });
    } catch {
      setOutput(
        "Error: Failed to generate technical writing. Please try again."
      );
    } finally {
      setIsStreaming(false);
    }
  }, [topic, audience, contentType, notes, isReady, loadModel, streamInfer]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isModelLoading = status === "downloading" || status === "loading";

  return (
    <div>
      <ToolPageHeader
        icon={PenTool}
        title="Tech Writing Assistant"
        description="Generate well-structured technical documentation, tutorials, and guides."
      />

      <OllamaGate fallbackMessage="Long-form technical writing requires a larger model running via Ollama.">
        <div className="space-y-6">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Setting up authentication with Supabase in Next.js"
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Audience level */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Audience level
            </label>
            <div className="flex gap-2">
              {AUDIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setAudience(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    audience === level
                      ? "bg-accent text-accent-fg"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Content type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Content type
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    contentType === type
                      ? "bg-accent text-accent-fg"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / outline */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes / outline{" "}
              <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any key points, structure, or outline you want the document to follow..."
              rows={5}
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
              disabled={!topic.trim() || isStreaming || isModelLoading}
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
                  ? "Writing..."
                  : "Generate Documentation"}
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
      </OllamaGate>
    </div>
  );
}
