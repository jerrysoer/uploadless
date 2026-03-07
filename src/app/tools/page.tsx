"use client";

import {
  Hash,
  QrCode,
  Braces,
  KeyRound,
  Binary,
  Fingerprint,
  Lock,
  Clock,
  FileKey,
  Scan,
  Type,
  ClipboardPaste,
  Unplug,
  Palette,
  Code,
  Regex,
  ALargeSmall,
  Shield,
  GitCompare,
  Image,
  Share2,
  EyeOff,
  Eye,
  Mail,
  FileSearch,
  ArrowLeftRight,
  Database,
  Network,
  Ruler,
  Monitor,
  FileCheck,
  Bot,
} from "lucide-react";
import EditorialRule from "@/components/EditorialRule";
import ToolAccordion from "@/components/ToolAccordion";
import Link from "next/link";

interface ToolEntry {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const DEVELOPER_GROUPS = [
  {
    label: "Encode & Transform",
    tools: [
      { href: "/tools/json", icon: Braces, title: "JSON Formatter", description: "Format, minify, validate, and convert JSON to CSV/YAML." },
      { href: "/tools/format-convert", icon: ArrowLeftRight, title: "JSON / YAML / TOML Converter", description: "Convert between JSON, YAML, and TOML with auto-detection." },
      { href: "/tools/encode", icon: Binary, title: "Encode / Decode", description: "Base64, HTML entities, and URL encode/decode." },
      { href: "/tools/hash", icon: Hash, title: "Hash Calculator", description: "MD5, SHA-1, SHA-256, SHA-512 for text and files." },
      { href: "/tools/numbers", icon: Clock, title: "Number & Date Converter", description: "Number bases (bin, oct, hex) and Unix epoch timestamps." },
      { href: "/tools/text", icon: ALargeSmall, title: "Text Utilities", description: "Word count, case conversion, and lorem ipsum generator." },
    ],
  },
  {
    label: "Security & Crypto",
    tools: [
      { href: "/tools/password", icon: KeyRound, title: "Password Generator", description: "Generate strong passwords and passphrases with strength meter." },
      { href: "/tools/jwt", icon: FileKey, title: "JWT Decoder", description: "Decode and inspect JWT tokens. Header, payload, and expiry." },
      { href: "/tools/encrypt", icon: Lock, title: "File Encryption", description: "Encrypt and decrypt files with AES-256-GCM. Password-based." },
      { href: "/tools/exif", icon: Eye, title: "EXIF Stripper", description: "View and strip metadata from images. GPS, camera, dates." },
    ],
  },
  {
    label: "Code & Design",
    tools: [
      { href: "/tools/code", icon: Code, title: "Code Tools", description: "Markdown editor, SVG \u2192 React, and code screenshots." },
      { href: "/tools/regex", icon: Regex, title: "Regex Playground", description: "Test regular expressions with real-time matching and highlights." },
      { href: "/tools/design", icon: Palette, title: "Color & Design", description: "Contrast checker, CSS gradients, and color palette extraction." },
      { href: "/tools/og-preview", icon: Share2, title: "OG Image Preview", description: "Preview how your page looks when shared on Twitter, Facebook, and LinkedIn." },
      { href: "/tools/favicon", icon: Image, title: "Favicon Generator", description: "Generate favicons from images or emoji in all required sizes." },
    ],
  },
  {
    label: "System & DevOps",
    tools: [
      { href: "/tools/uuid", icon: Fingerprint, title: "UUID Generator", description: "Generate v4 UUIDs in bulk with format options." },
      { href: "/tools/qr", icon: QrCode, title: "QR Code Generator", description: "Create QR codes for URLs, WiFi, vCards, and text." },
      { href: "/tools/cron", icon: Clock, title: "Cron Expression Builder", description: "Build cron expressions visually with presets and human-readable output." },
      { href: "/tools/chmod", icon: Shield, title: "Chmod Calculator", description: "Calculate Unix file permissions with a visual checkbox grid." },
      { href: "/tools/diff", icon: GitCompare, title: "Text Diff / Compare", description: "Compare two texts side by side with highlighted additions and deletions." },
    ],
  },
  {
    label: "Data & DevOps",
    tools: [
      { href: "/tools/sql-format", icon: Database, title: "SQL Formatter", description: "Format, beautify, and minify SQL with dialect support." },
      { href: "/tools/ip-calc", icon: Network, title: "IP / Subnet Calculator", description: "Calculate subnet details from CIDR notation or IP + mask." },
      { href: "/tools/units", icon: Ruler, title: "Unit Converter", description: "Convert length, weight, temperature, data, time, and speed." },
      { href: "/tools/useragent", icon: Monitor, title: "User-Agent Parser", description: "Parse UA strings for browser, OS, device type, and bot detection." },
    ],
  },
  {
    label: "Config & Security",
    tools: [
      { href: "/tools/env-validate", icon: FileCheck, title: ".env Validator", description: "Validate .env files for format, duplicates, missing values, and secrets." },
      { href: "/tools/robots", icon: Bot, title: "robots.txt Generator", description: "Build robots.txt visually with AI crawler and SEO presets." },
      { href: "/tools/csp", icon: Shield, title: "CSP Header Builder", description: "Build Content-Security-Policy headers with visual toggles and presets." },
    ],
  },
];

const PRIVACY_TOOLS: ToolEntry[] = [
  { href: "/tools/fingerprint", icon: Scan, title: "Browser Fingerprint", description: "See what your browser reveals. Canvas, WebGL, fonts, and more." },
  { href: "/tools/tracking-pixels", icon: Unplug, title: "Tracking Pixel Detector", description: "Paste email HTML to detect hidden tracking pixels." },
  { href: "/tools/invisible-chars", icon: Type, title: "Invisible Characters", description: "Detect zero-width chars, homoglyphs, and bidi controls." },
  { href: "/tools/clipboard", icon: ClipboardPaste, title: "Clipboard Cleaner", description: "Paste rich text to strip tracking, styles, and hidden markup." },
  { href: "/tools/redact", icon: EyeOff, title: "Document Redactor", description: "Detect and redact sensitive data in PDFs — emails, phones, SSNs, cards." },
  { href: "/tools/email-headers", icon: Mail, title: "Email Header Analyzer", description: "Parse email headers to trace server hops and check SPF/DKIM/DMARC." },
  { href: "/tools/file-signature", icon: FileSearch, title: "File Signature Checker", description: "Verify file types by magic bytes. Detect extension mismatches." },
];

function ToolRow({ href, icon: Icon, title, description }: ToolEntry) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 py-3 border-b border-border hover:bg-bg-surface transition-colors -mx-3 px-3"
    >
      <Icon className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors flex-shrink-0" />
      <span className="font-medium text-sm group-hover:text-accent transition-colors min-w-[180px]">
        {title}
      </span>
      <span className="text-text-secondary text-sm hidden sm:block">{description}</span>
    </Link>
  );
}

export default function ToolsPage() {
  const devToolCount = DEVELOPER_GROUPS.reduce((sum, g) => sum + g.tools.length, 0);

  return (
    <div>
      {/* Header with editorial rule and department accent */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: "var(--color-dept-dev)" }} />
          <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
            Department No. 04
          </span>
        </div>
        <EditorialRule className="mb-6" />
        <h1 className="font-heading font-bold text-4xl mb-3">
          Developer & Privacy Tools
        </h1>
        <p className="text-text-secondary max-w-xl">
          Hash, encode, encrypt, generate, and inspect — all in your browser.
          No data leaves your device.
        </p>
      </div>

      {/* Developer Tools — Accordion */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: "var(--color-dept-dev)" }} />
          <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
            Developer · {devToolCount} tools
          </span>
        </div>
        <ToolAccordion groups={DEVELOPER_GROUPS} />
      </section>

      {/* Privacy Tools — flat list */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: "var(--color-dept-privacy)" }} />
          <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
            Privacy · {PRIVACY_TOOLS.length} tools
          </span>
        </div>
        <div>
          {PRIVACY_TOOLS.map((tool) => (
            <ToolRow key={tool.href} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
