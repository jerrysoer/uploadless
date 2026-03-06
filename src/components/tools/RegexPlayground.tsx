"use client";

import { useState, useMemo } from "react";
import { Regex } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";

interface MatchResult {
  value: string;
  index: number;
  groups: string[];
}

function getMatches(pattern: string, flags: string, testStr: string): { matches: MatchResult[]; error: string | null } {
  if (!pattern) return { matches: [], error: null };
  try {
    const re = new RegExp(pattern, flags);
    const matches: MatchResult[] = [];
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(testStr)) !== null) {
        matches.push({ value: m[0], index: m.index, groups: m.slice(1) });
        if (m[0].length === 0) re.lastIndex++; // prevent infinite loop on zero-length match
      }
    } else {
      const m = re.exec(testStr);
      if (m) {
        matches.push({ value: m[0], index: m.index, groups: m.slice(1) });
      }
    }
    return { matches, error: null };
  } catch (err) {
    return { matches: [], error: err instanceof Error ? err.message : "Invalid regex" };
  }
}

function buildHighlighted(testStr: string, matches: MatchResult[]): React.ReactNode[] {
  if (!testStr || matches.length === 0) return [testStr];
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (m.index > cursor) parts.push(testStr.slice(cursor, m.index));
    parts.push(<mark key={i} className="bg-accent/20 text-accent rounded-sm px-0.5">{m.value}</mark>);
    cursor = m.index + m.value.length;
  }
  if (cursor < testStr.length) parts.push(testStr.slice(cursor));
  return parts;
}

const FLAG_OPTIONS = [
  { flag: "g", label: "global" },
  { flag: "i", label: "case-insensitive" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotAll" },
] as const;

export default function RegexPlayground() {
  const [pattern, setPattern] = useState("");
  const [testStr, setTestStr] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({ g: true, i: false, m: false, s: false });

  const flagStr = useMemo(() => Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join(""), [flags]);

  const { matches, error } = useMemo(() => getMatches(pattern, flagStr, testStr), [pattern, flagStr, testStr]);

  const highlighted = useMemo(() => buildHighlighted(testStr, matches), [testStr, matches]);

  const toggleFlag = (f: string) => {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  };

  return (
    <div>
      <ToolPageHeader
        icon={Regex}
        title="Regex Playground"
        description="Test regular expressions with real-time matching and highlights."
      />

      <div className="space-y-4">
        {/* Regex input + flags */}
        <div>
          <label htmlFor="regex-pattern" className="block text-sm font-medium mb-1.5">
            Pattern
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-sm">/</span>
              <input
                id="regex-pattern"
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                spellCheck={false}
                className={`w-full bg-bg-surface border rounded-xl pl-7 pr-4 py-2.5 text-sm font-mono placeholder:text-text-tertiary focus:outline-none transition-colors ${
                  error ? "border-grade-f focus:border-grade-f" : "border-border focus:border-accent"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-sm">
                /{flagStr}
              </span>
            </div>
          </div>
          {error && <p className="text-grade-f text-xs mt-1.5 font-mono">{error}</p>}

          {/* Flag toggles */}
          <div className="flex gap-1.5 mt-2">
            {FLAG_OPTIONS.map(({ flag, label }) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                title={label}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors border ${
                  flags[flag]
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-surface text-text-secondary border-border hover:border-border-hover"
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Test string */}
        <div>
          <label htmlFor="regex-test" className="block text-sm font-medium mb-1.5">
            Test String
          </label>
          <textarea
            id="regex-test"
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            placeholder="Enter text to test against..."
            spellCheck={false}
            rows={5}
            className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Highlighted preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Highlighted</label>
              {matches.length > 0 && (
                <span className="text-xs text-accent font-medium">
                  {matches.length} match{matches.length !== 1 ? "es" : ""}
                </span>
              )}
            </div>
            <div className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono min-h-[8rem] max-h-[20rem] overflow-auto whitespace-pre-wrap break-all">
              {testStr ? highlighted : <span className="text-text-tertiary">Matches will be highlighted here</span>}
            </div>
          </div>

          {/* Match list */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Match Details</label>
            <div className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono min-h-[8rem] max-h-[20rem] overflow-auto">
              {matches.length === 0 && (
                <span className="text-text-tertiary">
                  {!pattern && !testStr ? "Enter a pattern and test string" : error ? "" : "No matches found"}
                </span>
              )}
              {matches.length > 0 && (
                <div className="space-y-2">
                  {matches.map((m, i) => (
                    <div key={i} className="border border-border rounded-lg px-3 py-2 bg-bg-elevated">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-accent font-medium">{m.value}</span>
                        <span className="text-text-tertiary text-xs shrink-0">index {m.index}</span>
                      </div>
                      {m.groups.length > 0 && (
                        <div className="mt-1 text-xs text-text-secondary">
                          {m.groups.map((g, gi) => (
                            <span key={gi} className="inline-block mr-2">
                              ${gi + 1}: <span className="text-text-primary">{g ?? "undefined"}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
