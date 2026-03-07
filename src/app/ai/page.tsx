"use client";

import Link from "next/link";
import {
  Sparkles,
  Download,
  Trash2,
  Cpu,
  AlertCircle,
  FileText,
  PenLine,
} from "lucide-react";
import { useLocalAI } from "@/hooks/useLocalAI";
import EditorialRule from "@/components/EditorialRule";

const AI_TOOLS = [
  {
    href: "/ai/summarize",
    title: "Text Summarizer",
    description: "Paste long text and get a concise summary. Choose length: 1 sentence, 1 paragraph, or key points.",
    icon: FileText,
  },
  {
    href: "/ai/rewrite",
    title: "Text Rewriter",
    description: "Rewrite text in different tones: formal, simple, shorter, or more detailed.",
    icon: PenLine,
  },
];

export default function AIHubPage() {
  const {
    status,
    provider,
    model,
    isSupported,
    isReady,
    progress,
    progressText,
    error,
    loadModel,
    deleteModel,
  } = useLocalAI();

  return (
    <div>
      {/* Header with editorial rule and department accent */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: "var(--color-dept-ai)" }} />
          <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
            Department No. 04
          </span>
        </div>
        <EditorialRule className="mb-6" />
        <h1 className="font-heading font-bold text-4xl mb-3">
          Local AI Tools
        </h1>
        <p className="text-text-secondary max-w-xl">
          Run AI models directly in your browser. No server, no API keys, no
          data leaves your device.
        </p>
      </div>

      {/* Model Status Card — editorial style */}
      <div
        className="p-6 mb-10 border-b border-border"
        style={{ borderTop: "3px solid var(--color-dept-ai)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-text-tertiary" />
            <div>
              <h2 className="font-heading font-semibold">AI Model</h2>
              <p className="text-text-tertiary text-sm">
                {isReady && model
                  ? `${model.name} via ${provider === "ollama" ? "Ollama" : "WebLLM"}`
                  : "No model loaded"}
              </p>
            </div>
          </div>

          {isReady && provider === "webllm" && (
            <button
              onClick={deleteModel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary hover:text-grade-f border border-border transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete cached model
            </button>
          )}
        </div>

        {!isSupported && (
          <div className="flex items-start gap-3 p-4 bg-grade-f/5 border border-grade-f/20">
            <AlertCircle className="w-5 h-5 text-grade-f shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-grade-f mb-1">
                WebGPU not available
              </p>
              <p className="text-text-secondary">
                Your browser does not support WebGPU, which is required for
                in-browser AI. Try the latest Chrome or Edge. Alternatively,
                install{" "}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Ollama
                </a>{" "}
                for local AI via API.
              </p>
            </div>
          </div>
        )}

        {isSupported && !isReady && status !== "downloading" && status !== "loading" && (
          <button
            onClick={loadModel}
            disabled={status === "checking"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-text-primary text-bg-primary font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Load AI Model
          </button>
        )}

        {(status === "downloading" || status === "loading") && (
          <div>
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>{progressText}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-bg-elevated overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: "var(--color-dept-ai)" }}
              />
            </div>
          </div>
        )}

        {isReady && (
          <div className="flex items-center gap-2 text-sm text-grade-a">
            <div className="w-2 h-2 rounded-full bg-grade-a animate-pulse" />
            {provider === "ollama"
              ? `Connected to Ollama — ${model?.name}`
              : `${model?.name} running in your browser`}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-grade-f/5 border border-grade-f/20 text-sm">
            <AlertCircle className="w-4 h-4 text-grade-f shrink-0 mt-0.5" />
            <span className="text-text-secondary">{error}</span>
          </div>
        )}
      </div>

      {/* AI Tools — editorial list */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: "var(--color-dept-ai)" }} />
        <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
          AI-Powered · {AI_TOOLS.length} tools
        </span>
      </div>

      <div>
        {AI_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-start gap-4 py-5 border-b border-border hover:bg-bg-surface transition-colors -mx-3 px-3"
            style={{ borderLeftWidth: "3px", borderLeftColor: "var(--color-dept-ai)" }}
          >
            <tool.icon className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary transition-colors flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                {tool.title}
              </h3>
              <p className="text-text-secondary text-sm">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Note */}
      <p className="text-text-tertiary text-xs mt-10">
        AI models run entirely in your browser using WebGPU. The first load
        downloads ~1–2 GB to your local cache. No data is sent to any server.
      </p>
    </div>
  );
}
