import { Metadata } from "next";
import Link from "next/link";
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
  ScanEye,
  Palette,
  Code,
  Regex,
  FileText,
  ALargeSmall,
  Sparkles,
  PenLine,
  Shield,
  Link as LinkIcon,
  GitCompare,
  Image,
  Share2,
  Camera,
  EyeOff,
  Eye,
  Mail,
  FileSearch,
} from "lucide-react";
import EditorialRule from "@/components/EditorialRule";

export const metadata: Metadata = {
  title: "Developer & Privacy Tools — ShipLocal",
  description:
    "38+ developer and privacy tools that run entirely in your browser. Hash, encode, encrypt, generate, diff, inspect — no uploads, no tracking.",
};

interface ToolEntry {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const DEVELOPER_TOOLS: ToolEntry[] = [
  { href: "/tools/json", icon: Braces, title: "JSON Formatter", description: "Format, minify, validate, and convert JSON to CSV/YAML." },
  { href: "/tools/hash", icon: Hash, title: "Hash Calculator", description: "MD5, SHA-1, SHA-256, SHA-512 for text and files." },
  { href: "/tools/base64", icon: Binary, title: "Base64 Encode/Decode", description: "Encode and decode Base64 for text and files." },
  { href: "/tools/uuid", icon: Fingerprint, title: "UUID Generator", description: "Generate v4 UUIDs in bulk with format options." },
  { href: "/tools/qr", icon: QrCode, title: "QR Code Generator", description: "Create QR codes for URLs, WiFi, vCards, and text." },
  { href: "/tools/password", icon: KeyRound, title: "Password Generator", description: "Generate strong passwords and passphrases with strength meter." },
  { href: "/tools/epoch", icon: Clock, title: "Epoch Converter", description: "Convert between Unix timestamps, ISO 8601, and human dates." },
  { href: "/tools/jwt", icon: FileKey, title: "JWT Decoder", description: "Decode and inspect JWT tokens. Header, payload, and expiry." },
  { href: "/tools/encrypt", icon: Lock, title: "File Encryption", description: "Encrypt and decrypt files with AES-256-GCM. Password-based." },
  { href: "/tools/exif", icon: Eye, title: "EXIF Stripper", description: "View and strip metadata from images. GPS, camera, dates." },
  { href: "/tools/contrast", icon: ScanEye, title: "Contrast Checker", description: "Check WCAG 2.1 color contrast ratios. AA and AAA compliance." },
  { href: "/tools/gradient", icon: Palette, title: "CSS Gradient Generator", description: "Create linear, radial, and conic CSS gradients visually." },
  { href: "/tools/svg-to-react", icon: Code, title: "SVG → React", description: "Convert SVG markup into a clean React component with JSX." },
  { href: "/tools/regex", icon: Regex, title: "Regex Playground", description: "Test regular expressions with real-time matching and highlights." },
  { href: "/tools/wordcount", icon: FileText, title: "Word Counter", description: "Count words, characters, sentences, and estimate reading time." },
  { href: "/tools/case", icon: ALargeSmall, title: "Case Converter", description: "Convert text between camelCase, snake_case, kebab-case, and more." },
  { href: "/tools/cron", icon: Clock, title: "Cron Expression Builder", description: "Build cron expressions visually with presets and human-readable output." },
  { href: "/tools/chmod", icon: Shield, title: "Chmod Calculator", description: "Calculate Unix file permissions with a visual checkbox grid." },
  { href: "/tools/url", icon: LinkIcon, title: "URL Parser", description: "Break URLs into protocol, host, path, params, and hash. Encode/decode." },
  { href: "/tools/lorem", icon: Type, title: "Lorem Ipsum Generator", description: "Generate placeholder text by paragraphs, sentences, or words." },
  { href: "/tools/html-entities", icon: Code, title: "HTML Entity Encoder", description: "Encode and decode HTML entities. Named, numeric, and hex support." },
  { href: "/tools/base-convert", icon: Binary, title: "Number Base Converter", description: "Convert numbers between binary, octal, decimal, and hexadecimal." },
  { href: "/tools/diff", icon: GitCompare, title: "Text Diff / Compare", description: "Compare two texts side by side with highlighted additions and deletions." },
  { href: "/tools/markdown", icon: FileText, title: "Markdown Editor", description: "Write Markdown with a live preview. Toolbar for formatting shortcuts." },
  { href: "/tools/favicon", icon: Image, title: "Favicon Generator", description: "Generate favicons from images or emoji in all required sizes." },
  { href: "/tools/og-preview", icon: Share2, title: "OG Image Preview", description: "Preview how your page looks when shared on Twitter, Facebook, and LinkedIn." },
  { href: "/tools/palette", icon: Palette, title: "Color Palette from Image", description: "Extract dominant colors from any image using k-means clustering." },
  { href: "/tools/code-screenshot", icon: Camera, title: "Code Screenshot", description: "Create beautiful code screenshots with syntax highlighting and themes." },
];

const AI_TOOLS: ToolEntry[] = [
  { href: "/ai/summarize", icon: Sparkles, title: "Text Summarizer", description: "Summarize text using a local AI model. No server required." },
  { href: "/ai/rewrite", icon: PenLine, title: "Text Rewriter", description: "Rewrite text in different tones using local AI." },
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

function ToolSection({
  label,
  count,
  tools,
  deptColor,
}: {
  label: string;
  count: number;
  tools: ToolEntry[];
  deptColor: string;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: deptColor }} />
        <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
          {label} · {count} tools
        </span>
      </div>
      <div>
        {tools.map((tool) => (
          <ToolRow key={tool.href} {...tool} />
        ))}
      </div>
    </section>
  );
}

export default function ToolsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <EditorialRule className="mb-6" />
        <h1 className="font-heading font-bold text-4xl mb-3">
          Developer & Privacy Tools
        </h1>
        <p className="text-text-secondary max-w-xl">
          Hash, encode, encrypt, generate, and inspect — all in your browser.
          No data leaves your device.
        </p>
      </div>

      <ToolSection
        label="Developer"
        count={DEVELOPER_TOOLS.length}
        tools={DEVELOPER_TOOLS}
        deptColor="var(--color-dept-dev)"
      />
      <ToolSection
        label="AI-Powered"
        count={AI_TOOLS.length}
        tools={AI_TOOLS}
        deptColor="var(--color-dept-ai)"
      />
      <ToolSection
        label="Privacy"
        count={PRIVACY_TOOLS.length}
        tools={PRIVACY_TOOLS}
        deptColor="var(--color-dept-privacy)"
      />
    </div>
  );
}
