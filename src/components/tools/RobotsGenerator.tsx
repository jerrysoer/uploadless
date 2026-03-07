"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Bot, Copy, Check, Plus, Trash2 } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { trackEvent } from "@/lib/analytics";

/* -- Types ---------------------------------------- */

interface RobotsRule {
  id: string;
  userAgent: string;
  directives: { type: "Allow" | "Disallow"; path: string }[];
}

/* -- Presets -------------------------------------- */

interface Preset {
  label: string;
  description: string;
  rules: Omit<RobotsRule, "id">[];
  sitemap?: string;
  crawlDelay?: string;
}

const PRESETS: Preset[] = [
  {
    label: "Allow All",
    description: "Allow all crawlers access to everything",
    rules: [
      { userAgent: "*", directives: [{ type: "Allow", path: "/" }] },
    ],
  },
  {
    label: "Block All",
    description: "Block all crawlers from the entire site",
    rules: [
      { userAgent: "*", directives: [{ type: "Disallow", path: "/" }] },
    ],
  },
  {
    label: "Block AI Crawlers",
    description: "Block known AI training crawlers",
    rules: [
      { userAgent: "*", directives: [{ type: "Allow", path: "/" }] },
      { userAgent: "GPTBot", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "ChatGPT-User", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "CCBot", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "anthropic-ai", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "ClaudeBot", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "Google-Extended", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "FacebookBot", directives: [{ type: "Disallow", path: "/" }] },
      { userAgent: "Bytespider", directives: [{ type: "Disallow", path: "/" }] },
    ],
  },
  {
    label: "Standard SEO",
    description: "Allow crawlers, block admin and private paths",
    rules: [
      {
        userAgent: "*",
        directives: [
          { type: "Allow", path: "/" },
          { type: "Disallow", path: "/admin" },
          { type: "Disallow", path: "/api/" },
          { type: "Disallow", path: "/private/" },
          { type: "Disallow", path: "/*.json$" },
        ],
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  },
];

/* -- Helpers -------------------------------------- */

let nextId = 1;
function makeId(): string {
  return `rule_${nextId++}_${Date.now()}`;
}

function generateRobotsTxt(rules: RobotsRule[], sitemap: string, crawlDelay: string): string {
  const parts: string[] = [];

  for (const rule of rules) {
    parts.push(`User-agent: ${rule.userAgent}`);
    if (crawlDelay && rule.userAgent === "*") {
      parts.push(`Crawl-delay: ${crawlDelay}`);
    }
    for (const dir of rule.directives) {
      parts.push(`${dir.type}: ${dir.path}`);
    }
    parts.push("");
  }

  if (sitemap.trim()) {
    parts.push(`Sitemap: ${sitemap.trim()}`);
    parts.push("");
  }

  return parts.join("\n").trimEnd();
}

/* -- Component ------------------------------------ */

export default function RobotsGenerator() {
  const [rules, setRules] = useState<RobotsRule[]>([
    {
      id: makeId(),
      userAgent: "*",
      directives: [{ type: "Allow", path: "/" }],
    },
  ]);
  const [sitemap, setSitemap] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "robots_generator" });
  }, []);

  const output = useMemo(() => generateRobotsTxt(rules, sitemap, crawlDelay), [rules, sitemap, crawlDelay]);

  const addRule = useCallback(() => {
    setRules((prev) => [
      ...prev,
      { id: makeId(), userAgent: "*", directives: [{ type: "Disallow", path: "/" }] },
    ]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateUserAgent = useCallback((id: string, value: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, userAgent: value } : r))
    );
  }, []);

  const addDirective = useCallback((ruleId: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, directives: [...r.directives, { type: "Disallow", path: "" }] }
          : r
      )
    );
  }, []);

  const removeDirective = useCallback((ruleId: string, dirIdx: number) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, directives: r.directives.filter((_, i) => i !== dirIdx) }
          : r
      )
    );
  }, []);

  const updateDirective = useCallback(
    (ruleId: string, dirIdx: number, field: "type" | "path", value: string) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                directives: r.directives.map((d, i) =>
                  i === dirIdx ? { ...d, [field]: value } : d
                ),
              }
            : r
        )
      );
    },
    []
  );

  const applyPreset = useCallback((preset: Preset) => {
    nextId = 1;
    setRules(preset.rules.map((r) => ({ ...r, id: makeId() })));
    setSitemap(preset.sitemap || "");
    setCrawlDelay(preset.crawlDelay || "");
    trackEvent("tool_used", { tool: "robots_generator", action: "preset", preset: preset.label });
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    trackEvent("tool_used", { tool: "robots_generator", action: "copy" });
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div>
      <ToolPageHeader
        icon={Bot}
        title="robots.txt Generator"
        description="Build robots.txt files visually with presets for AI crawlers, SEO, and custom rules."
      />

      {/* Presets */}
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-sm mb-3">Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-start px-3 py-2 rounded-lg text-sm bg-bg-elevated border border-border hover:border-border-hover transition-colors"
            >
              <span className="font-semibold text-text-primary">{preset.label}</span>
              <span className="text-xs text-text-tertiary">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-4 mb-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs text-text-tertiary mb-1 font-medium uppercase tracking-wider">
                  User-agent
                </label>
                <input
                  type="text"
                  value={rule.userAgent}
                  onChange={(e) => updateUserAgent(rule.id, e.target.value)}
                  placeholder="*"
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>
              {rules.length > 1 && (
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-2 text-text-tertiary hover:text-grade-f transition-colors mt-5"
                  title="Remove rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Directives */}
            <div className="space-y-2 mb-3">
              {rule.directives.map((dir, dirIdx) => (
                <div key={dirIdx} className="flex items-center gap-2">
                  <select
                    value={dir.type}
                    onChange={(e) => updateDirective(rule.id, dirIdx, "type", e.target.value)}
                    className="bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="Allow">Allow</option>
                    <option value="Disallow">Disallow</option>
                  </select>
                  <input
                    type="text"
                    value={dir.path}
                    onChange={(e) => updateDirective(rule.id, dirIdx, "path", e.target.value)}
                    placeholder="/path"
                    className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                  />
                  {rule.directives.length > 1 && (
                    <button
                      onClick={() => removeDirective(rule.id, dirIdx)}
                      className="p-1.5 text-text-tertiary hover:text-grade-f transition-colors"
                      title="Remove directive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => addDirective(rule.id)}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-accent transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add directive
            </button>
          </div>
        ))}

        <button
          onClick={addRule}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-elevated hover:bg-bg-hover border border-border border-dashed rounded-xl text-sm text-text-secondary font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Sitemap & Crawl-delay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wider">
            Sitemap URL
          </label>
          <input
            type="text"
            value={sitemap}
            onChange={(e) => setSitemap(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wider">
            Crawl-delay (seconds)
          </label>
          <input
            type="number"
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value)}
            placeholder="10"
            min="0"
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Output */}
      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Generated robots.txt
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-grade-a" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap bg-bg-elevated border border-border rounded-lg p-4">
          {output}
        </pre>
      </div>
    </div>
  );
}
