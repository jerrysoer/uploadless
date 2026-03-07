"use client";

import { useState, useCallback, useEffect } from "react";
import { BookOpen, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { useLocalAI } from "@/hooks/useLocalAI";
import { PROMPTS } from "@/lib/ai/prompts";
import AIStreamOutput from "@/components/AIStreamOutput";
import FeatureLock from "@/components/ai/FeatureLock";
import { trackEvent } from "@/lib/analytics";

export default function READMEGenerator() {
  const { isReady, isSupported, loadModel, streamInfer, status } = useLocalAI();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [features, setFeatures] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "readme_generator" });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!projectName.trim() || !description.trim()) return;

    if (!isReady) {
      await loadModel();
    }

    setOutput("");
    setIsStreaming(true);

    const userPrompt = [
      `Project name: ${projectName}`,
      `\nDescription:\n${description}`,
      techStack.trim() ? `\nTech stack: ${techStack}` : "",
      features.trim() ? `\nKey features:\n${features}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await streamInfer(
        userPrompt,
        PROMPTS.readmeGenerator,
        (token) => setOutput((prev) => prev + token)
      );
      trackEvent("ai_tool_used", { tool: "readme_generator" });
    } catch {
      setOutput("Error: Failed to generate README. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, [projectName, description, techStack, features, isReady, loadModel, streamInfer]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isModelLoading = status === "downloading" || status === "loading";

  return (
    <div>
      <ToolPageHeader
        icon={BookOpen}
        title="README Generator"
        description="Generate a professional README.md from your project details."
      />

      <FeatureLock requiredCapability="readme_generate">
        <div className="space-y-6">
          {/* Project name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Project name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., my-awesome-app"
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your project do? Who is it for?"
              rows={3}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
            />
          </div>

          {/* Tech stack */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tech stack{" "}
              <span className="text-text-tertiary font-normal">
                (comma-separated)
              </span>
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g., Next.js, TypeScript, Tailwind, Supabase"
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Key features */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Key features{" "}
              <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="List the main features, one per line..."
              rows={4}
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
              disabled={
                !projectName.trim() ||
                !description.trim() ||
                isStreaming ||
                isModelLoading
              }
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
                  : "Generate README"}
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
