"use client";

import { useState, useCallback, useEffect } from "react";
import { Database, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { useLocalAI } from "@/hooks/useLocalAI";
import { PROMPTS } from "@/lib/ai/prompts";
import AIStreamOutput from "@/components/AIStreamOutput";
import FeatureLock from "@/components/ai/FeatureLock";
import { trackEvent } from "@/lib/analytics";

const DIALECTS = ["PostgreSQL", "MySQL", "SQLite", "BigQuery"] as const;

type Dialect = (typeof DIALECTS)[number];

export default function SQLGenerator() {
  const { isReady, isSupported, loadModel, streamInfer, status } = useLocalAI();
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState("");
  const [dialect, setDialect] = useState<Dialect>("PostgreSQL");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "sql_generator" });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return;

    if (!isReady) {
      await loadModel();
    }

    setOutput("");
    setIsStreaming(true);

    const userPrompt = [
      `SQL Dialect: ${dialect}`,
      `\nQuery description:\n${description}`,
      schema.trim() ? `\nTable schema:\n${schema}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await streamInfer(
        userPrompt,
        PROMPTS.sqlGenerator,
        (token) => setOutput((prev) => prev + token)
      );
      trackEvent("ai_tool_used", { tool: "sql_generator" });
    } catch {
      setOutput("Error: Failed to generate SQL. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, [description, schema, dialect, isReady, loadModel, streamInfer]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const isModelLoading = status === "downloading" || status === "loading";

  return (
    <div>
      <ToolPageHeader
        icon={Database}
        title="SQL Generator"
        description="Describe what you want to query in plain English and get SQL back."
      />

      <FeatureLock requiredCapability="sql_generate">
        <div className="space-y-6">
          {/* Dialect selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              SQL dialect
            </label>
            <div className="flex gap-2">
              {DIALECTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDialect(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dialect === d
                      ? "bg-accent text-accent-fg"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              What do you want to query?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Find all users who signed up in the last 30 days and have made at least one purchase..."
              rows={4}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
            />
          </div>

          {/* Schema context (optional) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Table definitions{" "}
              <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="Paste your CREATE TABLE statements or describe your schema..."
              rows={6}
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
              disabled={!description.trim() || isStreaming || isModelLoading}
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
                  : "Generate SQL"}
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
