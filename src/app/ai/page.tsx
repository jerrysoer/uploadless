"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  Trash2,
  Cpu,
  AlertCircle,
  Shield,
  Mail,
  Share2,
  FileJson,
  Receipt,
  FileText,
  Users,
  Briefcase,
  GitCommit,
  FileCode,
  SearchCode,
  Bug,
  Database,
  FlaskConical,
  GitPullRequest,
  BookOpen,
  LayoutGrid,
  HeartPulse,
  Tags,
  FileStack,
  ShieldCheck,
  PenTool,
  ImageOff,
  ScanText,
  Mic,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useLocalAI } from "@/hooks/useLocalAI";
import EditorialRule from "@/components/EditorialRule";
import AISummarizer from "@/components/tools/AISummarizer";
import AIRewriter from "@/components/tools/AIRewriter";

interface AIToolEntry {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tier: string;
}

const BUILT_IN_TABS = [
  { id: "summarize", label: "Summarize" },
  { id: "rewrite", label: "Rewrite" },
  { id: "tools", label: "All AI Tools" },
] as const;

const AI_TOOL_GROUPS = [
  {
    label: "Text & Communication",
    tier: "Balanced+",
    tools: [
      { href: "/ai/privacy-policy", icon: Shield, title: "Privacy Policy Summarizer", description: "Analyze privacy policies for data collection, sharing, and red flags." },
      { href: "/ai/email", icon: Mail, title: "Email Composer", description: "Draft emails with tone control — professional, casual, follow-up." },
      { href: "/ai/social", icon: Share2, title: "Social Post Generator", description: "Create platform-optimized posts for Twitter, LinkedIn, Instagram." },
    ],
  },
  {
    label: "Document Analysis",
    tier: "General+",
    tools: [
      { href: "/ai/extract", icon: FileJson, title: "Structured Extractor", description: "Extract structured JSON from unstructured text using a custom schema." },
      { href: "/ai/receipts", icon: Receipt, title: "Receipt Parser", description: "Upload receipt images → OCR → structured line items and totals." },
      { href: "/ai/contracts", icon: FileText, title: "Contract Analyzer", description: "Analyze contracts and flag clauses by severity." },
      { href: "/ai/meeting-minutes", icon: Users, title: "Meeting Minutes", description: "Generate structured minutes from meeting transcripts." },
      { href: "/ai/job-analyzer", icon: Briefcase, title: "Job Description Analyzer", description: "Analyze job postings for red flags, requirements, and match tips." },
    ],
  },
  {
    label: "Code & Development",
    tier: "Code model",
    tools: [
      { href: "/ai/commit-msg", icon: GitCommit, title: "Commit Message", description: "Generate conventional commit messages from diffs." },
      { href: "/ai/code-explain", icon: FileCode, title: "Code Explainer", description: "Get line-by-line explanations of code snippets." },
      { href: "/ai/code-review", icon: SearchCode, title: "Code Reviewer", description: "Review code for bugs, security, performance, and style." },
      { href: "/ai/error-decode", icon: Bug, title: "Error Decoder", description: "Decode error messages and stack traces into fixes." },
      { href: "/ai/sql-gen", icon: Database, title: "SQL Generator", description: "Generate SQL from natural language descriptions." },
      { href: "/ai/test-gen", icon: FlaskConical, title: "Test Generator", description: "Generate test cases for functions (Jest, pytest)." },
      { href: "/ai/pr-desc", icon: GitPullRequest, title: "PR Description", description: "Write pull request descriptions from diffs." },
      { href: "/ai/readme-gen", icon: BookOpen, title: "README Generator", description: "Generate project README from descriptions." },
    ],
  },
  {
    label: "Analysis & Research",
    tier: "Reasoning model",
    tools: [
      { href: "/ai/swot", icon: LayoutGrid, title: "SWOT Analyzer", description: "Strategic SWOT analysis for businesses and projects." },
      { href: "/ai/sentiment", icon: HeartPulse, title: "Sentiment Analyzer", description: "Analyze emotional tone and sentiment of text." },
      { href: "/ai/keywords", icon: Tags, title: "Keyword Extractor", description: "Extract and categorize keywords from text." },
    ],
  },
  {
    label: "Vision & Audio",
    tier: "Specialized models",
    tools: [
      { href: "/ai/background-removal", icon: ImageOff, title: "Background Removal", description: "Remove image backgrounds using AI segmentation." },
      { href: "/ai/ocr", icon: ScanText, title: "OCR — Text from Images", description: "Extract text from images with Tesseract.js." },
      { href: "/ai/transcribe", icon: Mic, title: "Speech-to-Text", description: "Transcribe audio with timestamps using Whisper." },
    ],
  },
  {
    label: "Advanced (Ollama)",
    tier: "Requires Ollama",
    tools: [
      { href: "/ai/long-doc", icon: FileStack, title: "Long Document Summarizer", description: "Summarize lengthy documents with 8K+ context." },
      { href: "/ai/full-review", icon: ShieldCheck, title: "Full Code Review", description: "Comprehensive code review for large files." },
      { href: "/ai/tech-writing", icon: PenTool, title: "Tech Writing Assistant", description: "Generate technical documentation and guides." },
    ],
  },
];

function AIToolRow({
  href,
  icon: Icon,
  title,
  description,
}: AIToolEntry | { href: string; icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 py-3 border-b border-border hover:bg-bg-surface transition-colors -mx-3 px-3"
    >
      <Icon className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0" />
      <span className="font-medium text-sm group-hover:text-accent transition-colors min-w-[180px]">
        {title}
      </span>
      <span className="text-text-secondary text-sm hidden sm:block">
        {description}
      </span>
    </Link>
  );
}

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

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (BUILT_IN_TABS.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: "var(--color-dept-ai)" }}
          />
          <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
            Department No. 01
          </span>
        </div>
        <EditorialRule className="mb-6" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading font-bold text-4xl mb-3">
              AI Tools
            </h1>
            <p className="text-text-secondary max-w-xl">
              30+ AI-powered tools running locally in your browser. No server,
              no API keys, no data leaves your device.
            </p>
          </div>
          <Link
            href="/ai/models"
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Model Store
          </Link>
        </div>
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

        {isSupported &&
          !isReady &&
          status !== "downloading" &&
          status !== "loading" && (
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
                style={{
                  width: `${progress}%`,
                  backgroundColor: "var(--color-dept-ai)",
                }}
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
        {BUILT_IN_TABS.map((tab) => (
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

      {/* Built-in tools */}
      {activeTab === "summarize" && <AISummarizer />}
      {activeTab === "rewrite" && <AIRewriter />}

      {/* All AI Tools directory */}
      {activeTab === "tools" && (
        <div className="space-y-10">
          {AI_TOOL_GROUPS.map((group) => (
            <section key={group.label}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "var(--color-dept-ai)" }}
                />
                <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
                  {group.label} &middot; {group.tier}
                </span>
              </div>
              <div>
                {group.tools.map((tool) => (
                  <AIToolRow key={tool.href} {...tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-text-tertiary text-xs mt-10">
        AI models run entirely in your browser using WebGPU. The first load
        downloads ~1–2 GB to your local cache. No data is sent to any server.
      </p>
    </div>
  );
}
