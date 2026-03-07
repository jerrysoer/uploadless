"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Monitor, Copy, Check } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { trackEvent } from "@/lib/analytics";

/* -- Parser logic --------------------------------- */

interface ParsedUA {
  browser: { name: string; version: string } | null;
  engine: { name: string; version: string } | null;
  os: { name: string; version: string } | null;
  device: string;
  isBot: boolean;
  botName: string | null;
  raw: string;
}

const BOT_PATTERNS: [RegExp, string][] = [
  [/Googlebot/i, "Googlebot"],
  [/Bingbot/i, "Bingbot"],
  [/Slurp/i, "Yahoo Slurp"],
  [/DuckDuckBot/i, "DuckDuckBot"],
  [/Baiduspider/i, "Baiduspider"],
  [/YandexBot/i, "YandexBot"],
  [/facebookexternalhit/i, "Facebook Bot"],
  [/Twitterbot/i, "Twitter Bot"],
  [/LinkedInBot/i, "LinkedIn Bot"],
  [/WhatsApp/i, "WhatsApp Bot"],
  [/Slackbot/i, "Slackbot"],
  [/Discordbot/i, "Discord Bot"],
  [/GPTBot/i, "GPTBot"],
  [/ChatGPT-User/i, "ChatGPT-User"],
  [/ClaudeBot/i, "ClaudeBot"],
  [/anthropic-ai/i, "Anthropic AI"],
  [/CCBot/i, "CCBot"],
  [/Applebot/i, "Applebot"],
  [/AhrefsBot/i, "AhrefsBot"],
  [/SemrushBot/i, "SemrushBot"],
  [/bot|crawler|spider|scraper/i, "Unknown Bot"],
];

function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = {
    browser: null,
    engine: null,
    os: null,
    device: "desktop",
    isBot: false,
    botName: null,
    raw: ua,
  };

  if (!ua.trim()) return result;

  // Bot detection
  for (const [pattern, name] of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      result.isBot = true;
      result.botName = name;
      break;
    }
  }

  // Browser detection (order matters)
  const browserPatterns: [RegExp, string][] = [
    [/EdgA?\/(\d+[\d.]*)/i, "Edge"],
    [/Edg\/(\d+[\d.]*)/i, "Edge"],
    [/OPR\/(\d+[\d.]*)/i, "Opera"],
    [/Opera\/(\d+[\d.]*)/i, "Opera"],
    [/Vivaldi\/(\d+[\d.]*)/i, "Vivaldi"],
    [/Brave\/(\d+[\d.]*)/i, "Brave"],
    [/YaBrowser\/(\d+[\d.]*)/i, "Yandex Browser"],
    [/SamsungBrowser\/(\d+[\d.]*)/i, "Samsung Internet"],
    [/UCBrowser\/(\d+[\d.]*)/i, "UC Browser"],
    [/Firefox\/(\d+[\d.]*)/i, "Firefox"],
    [/FxiOS\/(\d+[\d.]*)/i, "Firefox iOS"],
    [/CriOS\/(\d+[\d.]*)/i, "Chrome iOS"],
    [/Chrome\/(\d+[\d.]*)/i, "Chrome"],
    [/Version\/(\d+[\d.]*).*Safari/i, "Safari"],
    [/Safari\/(\d+[\d.]*)/i, "Safari"],
    [/MSIE\s(\d+[\d.]*)/i, "Internet Explorer"],
    [/Trident.*rv:(\d+[\d.]*)/i, "Internet Explorer"],
  ];

  for (const [pattern, name] of browserPatterns) {
    const match = ua.match(pattern);
    if (match) {
      result.browser = { name, version: match[1] || "unknown" };
      break;
    }
  }

  // Engine detection
  const enginePatterns: [RegExp, string][] = [
    [/AppleWebKit\/(\d+[\d.]*)/i, "WebKit"],
    [/Gecko\/(\d+[\d.]*)/i, "Gecko"],
    [/Trident\/(\d+[\d.]*)/i, "Trident"],
    [/Presto\/(\d+[\d.]*)/i, "Presto"],
    [/Blink/i, "Blink"],
  ];

  for (const [pattern, name] of enginePatterns) {
    const match = ua.match(pattern);
    if (match) {
      // Chrome/Edge/Opera use Blink (which is based on WebKit)
      const browserName = result.browser?.name || "";
      if (name === "WebKit" && /Chrome|Edg|OPR|Opera|Vivaldi|Brave/i.test(ua)) {
        result.engine = { name: "Blink", version: match[1] || "unknown" };
      } else {
        result.engine = { name, version: match[1] || "unknown" };
      }
      break;
    }
  }

  // OS detection
  const osPatterns: [RegExp, string, (m: RegExpMatchArray) => string][] = [
    [/Windows NT (\d+\.\d+)/i, "Windows", (m) => {
      const versions: Record<string, string> = {
        "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7",
        "6.0": "Vista", "5.1": "XP", "5.0": "2000",
      };
      return versions[m[1]!] || m[1]!;
    }],
    [/Mac OS X (\d+[._\d]*)/i, "macOS", (m) => m[1]!.replace(/_/g, ".")],
    [/iPhone OS (\d+[._\d]*)/i, "iOS", (m) => m[1]!.replace(/_/g, ".")],
    [/iPad.*OS (\d+[._\d]*)/i, "iPadOS", (m) => m[1]!.replace(/_/g, ".")],
    [/Android (\d+[\d.]*)/i, "Android", (m) => m[1]!],
    [/CrOS/, "Chrome OS", () => ""],
    [/Linux/i, "Linux", () => ""],
    [/Ubuntu/i, "Ubuntu", () => ""],
    [/Fedora/i, "Fedora", () => ""],
  ];

  for (const [pattern, name, getVersion] of osPatterns) {
    const match = ua.match(pattern);
    if (match) {
      result.os = { name, version: getVersion(match) };
      break;
    }
  }

  // Device type detection
  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    result.device = "mobile";
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    result.device = "tablet";
  } else {
    result.device = "desktop";
  }

  return result;
}

/* -- Component ------------------------------------ */

export default function UserAgentParser() {
  const [input, setInput] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setInput(navigator.userAgent);
    }
    trackEvent("tool_opened", { tool: "useragent_parser" });
  }, []);

  const parsed = useMemo(() => parseUserAgent(input), [input]);

  const copyValue = useCallback(async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    trackEvent("tool_used", { tool: "useragent_parser", action: "copy" });
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const CopyBtn = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => copyValue(value, field)}
      className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors shrink-0"
      title={`Copy ${field}`}
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-grade-a" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-text-tertiary" />
      )}
    </button>
  );

  const deviceIcon = parsed.device === "mobile" ? "Phone" : parsed.device === "tablet" ? "Tablet" : "Desktop";

  const cards: { label: string; value: string; detail?: string; field: string }[] = [];

  if (parsed.browser) {
    cards.push({
      label: "Browser",
      value: parsed.browser.name,
      detail: `v${parsed.browser.version}`,
      field: "browser",
    });
  }

  if (parsed.engine) {
    cards.push({
      label: "Engine",
      value: parsed.engine.name,
      detail: `v${parsed.engine.version}`,
      field: "engine",
    });
  }

  if (parsed.os) {
    cards.push({
      label: "Operating System",
      value: parsed.os.name,
      detail: parsed.os.version ? `v${parsed.os.version}` : undefined,
      field: "os",
    });
  }

  cards.push({
    label: "Device Type",
    value: deviceIcon,
    field: "device",
  });

  if (parsed.isBot) {
    cards.push({
      label: "Bot Detected",
      value: parsed.botName || "Yes",
      field: "bot",
    });
  }

  return (
    <div>
      <ToolPageHeader
        icon={Monitor}
        title="User-Agent Parser"
        description="Parse user-agent strings to identify browser, OS, device type, and bot detection. Auto-fills with your current browser."
      />

      {/* Input */}
      <div className="mb-6">
        <label className="block text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wider">
          User-Agent String
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a user-agent string here..."
          rows={3}
          className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {input.trim() ? (
        <>
          {/* Cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => (
              <div
                key={card.field}
                className={`bg-bg-surface border rounded-xl p-4 ${
                  card.field === "bot" ? "border-grade-f/30 bg-grade-f/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <label className="block text-xs text-text-tertiary font-medium uppercase tracking-wider">
                    {card.label}
                  </label>
                  <CopyBtn value={`${card.value}${card.detail ? ` ${card.detail}` : ""}`} field={card.field} />
                </div>
                <div className={`font-semibold text-lg ${card.field === "bot" ? "text-grade-f" : "text-text-primary"}`}>
                  {card.value}
                </div>
                {card.detail && (
                  <div className="text-sm text-text-secondary mt-0.5">{card.detail}</div>
                )}
              </div>
            ))}
          </div>

          {/* Raw UA copy */}
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-text-tertiary font-medium uppercase tracking-wider">
                Raw User-Agent
              </label>
              <CopyBtn value={input} field="raw" />
            </div>
            <p className="text-sm text-text-secondary font-mono break-all">{input}</p>
          </div>
        </>
      ) : (
        <div className="bg-bg-surface border border-border rounded-xl px-4 py-8 text-center">
          <p className="text-sm text-text-tertiary">
            Enter a user-agent string above to parse it.
          </p>
        </div>
      )}

      {/* Sample UAs */}
      <div className="bg-bg-surface border border-border rounded-xl p-5 mt-6">
        <h2 className="font-heading font-semibold text-sm mb-3">Sample User-Agents</h2>
        <div className="space-y-2">
          {[
            { label: "Chrome on Windows", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
            { label: "Safari on iPhone", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1" },
            { label: "Firefox on Linux", ua: "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0" },
            { label: "Googlebot", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
            { label: "GPTBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)" },
          ].map((sample) => (
            <button
              key={sample.label}
              onClick={() => setInput(sample.ua)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-bg-elevated border border-border hover:border-border-hover transition-colors text-left"
            >
              <span className="font-medium text-text-primary">{sample.label}</span>
              <span className="text-xs text-text-tertiary ml-2 truncate max-w-[200px] hidden sm:block">
                {sample.ua.slice(0, 50)}...
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
