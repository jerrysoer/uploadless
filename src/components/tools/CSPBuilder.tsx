"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Shield, Copy, Check, Plus, X } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { trackEvent } from "@/lib/analytics";

/* -- Types ---------------------------------------- */

type DirectiveName =
  | "default-src"
  | "script-src"
  | "style-src"
  | "img-src"
  | "font-src"
  | "connect-src"
  | "frame-src"
  | "media-src"
  | "object-src";

interface DirectiveState {
  enabled: boolean;
  values: string[];
  customDomains: string[];
}

type CSPState = Record<DirectiveName, DirectiveState>;

/* -- Constants ------------------------------------ */

const DIRECTIVE_NAMES: { name: DirectiveName; label: string; description: string }[] = [
  { name: "default-src", label: "default-src", description: "Fallback for all fetch directives" },
  { name: "script-src", label: "script-src", description: "Valid sources for JavaScript" },
  { name: "style-src", label: "style-src", description: "Valid sources for stylesheets" },
  { name: "img-src", label: "img-src", description: "Valid sources for images" },
  { name: "font-src", label: "font-src", description: "Valid sources for fonts" },
  { name: "connect-src", label: "connect-src", description: "Valid targets for fetch/XHR/WebSocket" },
  { name: "frame-src", label: "frame-src", description: "Valid sources for nested browsing contexts" },
  { name: "media-src", label: "media-src", description: "Valid sources for audio/video" },
  { name: "object-src", label: "object-src", description: "Valid sources for plugins (object/embed)" },
];

const COMMON_VALUES = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:", "https:", "*"];

const DEFAULT_STATE: CSPState = {
  "default-src": { enabled: true, values: ["'self'"], customDomains: [] },
  "script-src": { enabled: false, values: [], customDomains: [] },
  "style-src": { enabled: false, values: [], customDomains: [] },
  "img-src": { enabled: false, values: [], customDomains: [] },
  "font-src": { enabled: false, values: [], customDomains: [] },
  "connect-src": { enabled: false, values: [], customDomains: [] },
  "frame-src": { enabled: false, values: [], customDomains: [] },
  "media-src": { enabled: false, values: [], customDomains: [] },
  "object-src": { enabled: false, values: [], customDomains: [] },
};

/* -- Presets -------------------------------------- */

interface Preset {
  label: string;
  description: string;
  state: CSPState;
  reportUri?: string;
}

const PRESETS: Preset[] = [
  {
    label: "Strict",
    description: "Only self, no inline scripts or styles",
    state: {
      "default-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "script-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "style-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "img-src": { enabled: true, values: ["'self'", "data:"], customDomains: [] },
      "font-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "connect-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "frame-src": { enabled: true, values: ["'none'"], customDomains: [] },
      "media-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "object-src": { enabled: true, values: ["'none'"], customDomains: [] },
    },
  },
  {
    label: "Moderate",
    description: "Self + inline styles, common CDNs",
    state: {
      "default-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "script-src": { enabled: true, values: ["'self'"], customDomains: ["cdn.jsdelivr.net", "cdnjs.cloudflare.com"] },
      "style-src": { enabled: true, values: ["'self'", "'unsafe-inline'"], customDomains: ["fonts.googleapis.com"] },
      "img-src": { enabled: true, values: ["'self'", "data:", "https:"], customDomains: [] },
      "font-src": { enabled: true, values: ["'self'"], customDomains: ["fonts.gstatic.com"] },
      "connect-src": { enabled: true, values: ["'self'"], customDomains: [] },
      "frame-src": { enabled: false, values: [], customDomains: [] },
      "media-src": { enabled: false, values: [], customDomains: [] },
      "object-src": { enabled: true, values: ["'none'"], customDomains: [] },
    },
  },
  {
    label: "Permissive",
    description: "Broadly permissive, good starting point",
    state: {
      "default-src": { enabled: true, values: ["'self'", "https:"], customDomains: [] },
      "script-src": { enabled: true, values: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"], customDomains: [] },
      "style-src": { enabled: true, values: ["'self'", "'unsafe-inline'", "https:"], customDomains: [] },
      "img-src": { enabled: true, values: ["*", "data:", "blob:"], customDomains: [] },
      "font-src": { enabled: true, values: ["'self'", "https:", "data:"], customDomains: [] },
      "connect-src": { enabled: true, values: ["'self'", "https:"], customDomains: [] },
      "frame-src": { enabled: true, values: ["'self'", "https:"], customDomains: [] },
      "media-src": { enabled: true, values: ["'self'", "https:"], customDomains: [] },
      "object-src": { enabled: true, values: ["'none'"], customDomains: [] },
    },
  },
];

/* -- Component ------------------------------------ */

export default function CSPBuilder() {
  const [state, setState] = useState<CSPState>(DEFAULT_STATE);
  const [reportUri, setReportUri] = useState("");
  const [enableReportUri, setEnableReportUri] = useState(false);
  const [newDomainInputs, setNewDomainInputs] = useState<Record<DirectiveName, string>>(
    Object.fromEntries(DIRECTIVE_NAMES.map((d) => [d.name, ""])) as Record<DirectiveName, string>
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "csp_builder" });
  }, []);

  const cspHeader = useMemo(() => {
    const parts: string[] = [];

    for (const directive of DIRECTIVE_NAMES) {
      const d = state[directive.name];
      if (!d.enabled) continue;

      const allValues = [...d.values, ...d.customDomains];
      if (allValues.length === 0) continue;

      parts.push(`${directive.name} ${allValues.join(" ")}`);
    }

    if (enableReportUri && reportUri.trim()) {
      parts.push(`report-uri ${reportUri.trim()}`);
    }

    return parts.join("; ");
  }, [state, enableReportUri, reportUri]);

  const toggleDirective = useCallback((name: DirectiveName) => {
    setState((prev) => ({
      ...prev,
      [name]: { ...prev[name], enabled: !prev[name].enabled },
    }));
  }, []);

  const toggleValue = useCallback((name: DirectiveName, value: string) => {
    setState((prev) => {
      const d = prev[name];
      const hasValue = d.values.includes(value);
      return {
        ...prev,
        [name]: {
          ...d,
          values: hasValue ? d.values.filter((v) => v !== value) : [...d.values, value],
        },
      };
    });
  }, []);

  const addCustomDomain = useCallback((name: DirectiveName) => {
    const domain = newDomainInputs[name].trim();
    if (!domain) return;

    setState((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        customDomains: prev[name].customDomains.includes(domain)
          ? prev[name].customDomains
          : [...prev[name].customDomains, domain],
      },
    }));
    setNewDomainInputs((prev) => ({ ...prev, [name]: "" }));
  }, [newDomainInputs]);

  const removeCustomDomain = useCallback((name: DirectiveName, domain: string) => {
    setState((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        customDomains: prev[name].customDomains.filter((d) => d !== domain),
      },
    }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setState(preset.state);
    if (preset.reportUri) {
      setReportUri(preset.reportUri);
      setEnableReportUri(true);
    }
    trackEvent("tool_used", { tool: "csp_builder", action: "preset", preset: preset.label });
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(cspHeader);
    setCopied(true);
    trackEvent("tool_used", { tool: "csp_builder", action: "copy" });
    setTimeout(() => setCopied(false), 2000);
  }, [cspHeader]);

  return (
    <div>
      <ToolPageHeader
        icon={Shield}
        title="CSP Header Builder"
        description="Build Content-Security-Policy headers visually with presets, per-directive toggles, and custom domain inputs."
      />

      {/* Presets */}
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-sm mb-3">Presets</h2>
        <div className="grid grid-cols-3 gap-2">
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

      {/* Directives */}
      <div className="space-y-3 mb-6">
        {DIRECTIVE_NAMES.map((directive) => {
          const d = state[directive.name];
          return (
            <div
              key={directive.name}
              className={`border rounded-xl transition-colors ${
                d.enabled ? "border-accent/30 bg-bg-surface" : "border-border bg-bg-surface/50"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={() => toggleDirective(directive.name)}
                  className="w-4 h-4 rounded border-border accent-accent"
                />
                <div className="flex-1">
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {directive.label}
                  </span>
                  <span className="text-xs text-text-tertiary ml-2 hidden sm:inline">
                    {directive.description}
                  </span>
                </div>
              </div>

              {/* Values (when enabled) */}
              {d.enabled && (
                <div className="px-4 pb-4 pt-1 border-t border-border">
                  {/* Common value toggles */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {COMMON_VALUES.map((value) => (
                      <button
                        key={value}
                        onClick={() => toggleValue(directive.name, value)}
                        className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                          d.values.includes(value)
                            ? "bg-accent text-accent-fg"
                            : "bg-bg-elevated text-text-secondary border border-border hover:border-border-hover"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>

                  {/* Custom domains */}
                  {d.customDomains.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {d.customDomains.map((domain) => (
                        <span
                          key={domain}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-accent/10 text-accent border border-accent/20"
                        >
                          {domain}
                          <button
                            onClick={() => removeCustomDomain(directive.name, domain)}
                            className="hover:text-grade-f transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add domain input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDomainInputs[directive.name]}
                      onChange={(e) =>
                        setNewDomainInputs((prev) => ({ ...prev, [directive.name]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomDomain(directive.name);
                        }
                      }}
                      placeholder="*.example.com"
                      className="flex-1 bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => addCustomDomain(directive.name)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-tertiary hover:text-accent transition-colors bg-bg-elevated border border-border"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Report URI */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={enableReportUri}
            onChange={(e) => setEnableReportUri(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-accent"
          />
          <span className="text-sm text-text-secondary">Enable report-uri</span>
        </label>
        {enableReportUri && (
          <input
            type="text"
            value={reportUri}
            onChange={(e) => setReportUri(e.target.value)}
            placeholder="https://example.com/csp-report"
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
          />
        )}
      </div>

      {/* Output */}
      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            CSP Header
          </span>
          <button
            onClick={handleCopy}
            disabled={!cspHeader}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors disabled:opacity-50"
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
        {cspHeader ? (
          <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap break-all bg-bg-elevated border border-border rounded-lg p-4">
            {cspHeader}
          </pre>
        ) : (
          <p className="text-sm text-text-tertiary text-center py-4">
            Enable at least one directive with values to generate a CSP header.
          </p>
        )}

        {/* Usage hint */}
        {cspHeader && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-tertiary mb-2">Usage in HTTP header:</p>
            <code className="text-xs font-mono text-text-secondary break-all">
              Content-Security-Policy: {cspHeader}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
