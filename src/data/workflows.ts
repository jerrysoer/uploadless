import {
  Monitor,
  Video,
  ImageIcon,
  Eye,
  EyeOff,
  Lock,
  FileKey,
  Braces,
  Binary,
  Hash,
  FileText,
  Layers,
  Users,
  Sparkles,
  QrCode,
  Palette,
  ScanEye,
  Image,
  Type,
  FileArchive,
} from "lucide-react";

export interface WorkflowTool {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Workflow {
  id: string;
  number: string;
  title: string;
  summary: string;
  tools: WorkflowTool[];
  deptColor: string;
}

export const WORKFLOWS: Workflow[] = [
  {
    id: "product-demo",
    number: "01",
    title: "Product Demo Pipeline",
    summary: "Record a demo and share it as a GIF",
    tools: [
      { name: "Screen Recorder", href: "/record/screen", icon: Monitor },
      { name: "Video Converter", href: "/convert/video", icon: Video },
      { name: "GIF Recorder", href: "/record/gif", icon: ImageIcon },
      { name: "Image Converter", href: "/convert/images", icon: Image },
    ],
    deptColor: "var(--color-dept-record)",
  },
  {
    id: "privacy-cleanup",
    number: "02",
    title: "Privacy Cleanup",
    summary: "Strip metadata, clean data, redact, encrypt",
    tools: [
      { name: "EXIF Stripper", href: "/tools/exif", icon: Eye },
      { name: "Text Cleaner", href: "/tools/text-cleaner", icon: Type },
      { name: "Document Redactor", href: "/tools/redact", icon: EyeOff },
      { name: "File Encryption", href: "/tools/encrypt", icon: Lock },
    ],
    deptColor: "var(--color-dept-privacy)",
  },
  {
    id: "api-debug",
    number: "03",
    title: "API Debug Chain",
    summary: "Decode a JWT, inspect payload, verify signature",
    tools: [
      { name: "JWT Decoder", href: "/tools/jwt", icon: FileKey },
      { name: "Data Formatter", href: "/tools/data-formatter", icon: Braces },
      { name: "Base64 Decode", href: "/tools/base64", icon: Binary },
      { name: "Hash Calculator", href: "/tools/hash", icon: Hash },
    ],
    deptColor: "var(--color-dept-dev)",
  },
  {
    id: "design-assets",
    number: "04",
    title: "Design Assets",
    summary: "Extract colors from a reference and build assets",
    tools: [
      { name: "Image Converter", href: "/convert/images", icon: Image },
      { name: "Color Palette", href: "/tools/palette", icon: Palette },
      { name: "Contrast Checker", href: "/tools/contrast", icon: ScanEye },
      { name: "Favicon Generator", href: "/tools/favicon", icon: ImageIcon },
    ],
    deptColor: "var(--color-dept-convert)",
  },
  {
    id: "document-pipeline",
    number: "05",
    title: "Document Pipeline",
    summary: "Convert, combine, sign, and encrypt documents",
    tools: [
      { name: "Doc Converter", href: "/convert/documents", icon: FileText },
      { name: "PDF Tools", href: "/tools/pdf", icon: Layers },
      { name: "ZIP / Unzip", href: "/convert/zip", icon: FileArchive },
      { name: "File Encryption", href: "/tools/encrypt", icon: Lock },
    ],
    deptColor: "var(--color-dept-convert)",
  },
  {
    id: "meeting-capture",
    number: "06",
    title: "Meeting Capture",
    summary: "Record, get AI notes, polish, share via QR",
    tools: [
      { name: "Meeting Recorder", href: "/record/meeting", icon: Users },
      { name: "Text Summarizer", href: "/ai/summarize", icon: Sparkles },
      { name: "Markdown Editor", href: "/tools/markdown", icon: FileText },
      { name: "QR Code", href: "/tools/qr", icon: QrCode },
    ],
    deptColor: "var(--color-dept-ai)",
  },
];
