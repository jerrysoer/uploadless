"use client";

import type { Metadata } from "next";
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
      {/* Hero */}
      <div className="text-center mb-10 py-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-5">
          <Sparkles className="w-7 h-7 text-accent" />
        </div>
        <h1 className="font-heading font-bold text-3xl mb-3">
          Local AI Tools
        </h1>
        <p className="text-text-secondary mb-4">
          Run AI models directly in your browser. No server, no API keys, no
          data leaves your device.
        </p>
      </div>

      {/* Model Status Card */}
      <div className="bg-bg-surface border border-border rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Cpu className="w-5 h-5 text-accent" />
            </div>
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary hover:text-grade-f border border-border rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete cached model
            </button>
          )}
        </div>

        {!isSupported && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-grade-f/5 border border-grade-f/20">
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
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
          <div className="flex items-start gap-2 p-3 rounded-lg bg-grade-f/5 border border-grade-f/20 text-sm">
            <AlertCircle className="w-4 h-4 text-grade-f shrink-0 mt-0.5" />
            <span className="text-text-secondary">{error}</span>
          </div>
        )}
      </div>

      {/* AI Tools Grid */}
      <h2 className="font-heading font-semibold text-lg text-text-secondary mb-3">
        AI-Powered Tools
      </h2>
      <div className="grid gap-3">
        {AI_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-start gap-4 bg-bg-surface border border-border rounded-xl p-5 hover:border-border-hover transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/15 transition-colors">
              <tool.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-0.5">
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
      <p className="text-text-tertiary text-xs text-center mt-8">
        AI models run entirely in your browser using WebGPU. The first load
        downloads ~1–2 GB to your local cache. No data is sent to any server.
      </p>
    </div>
  );
}
