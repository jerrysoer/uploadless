"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  Trash2,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { useLocalAI } from "@/hooks/useLocalAI";
import EditorialRule from "@/components/EditorialRule";
import AISummarizer from "@/components/tools/AISummarizer";
import AIRewriter from "@/components/tools/AIRewriter";

const TABS = [
  { id: "summarize", label: "Summarize" },
  { id: "rewrite", label: "Rewrite" },
] as const;

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<string>("summarize");

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

  // Sync from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (TABS.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div>
      {/* Header with editorial rule and department accent */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: "var(--color-dept-ai)" }} />
          <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
            Department No. 01
          </span>
        </div>
        <EditorialRule className="mb-6" />
        <h1 className="font-heading font-bold text-4xl mb-3">
          AI Text Tools
        </h1>
        <p className="text-text-secondary max-w-xl">
          Summarize and rewrite text using a local AI model. No server, no API
          keys, no data leaves your device.
        </p>
      </div>

      {/* Model Status Card */}
      <div
        className="p-6 mb-8 border-b border-border"
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

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-bg-surface border border-border rounded-xl mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tool content */}
      {activeTab === "summarize" && <AISummarizer />}
      {activeTab === "rewrite" && <AIRewriter />}

      {/* Note */}
      <p className="text-text-tertiary text-xs mt-10">
        AI models run entirely in your browser using WebGPU. The first load
        downloads ~1–2 GB to your local cache. No data is sent to any server.
      </p>
    </div>
  );
}
