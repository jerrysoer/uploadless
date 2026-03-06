import type { Metadata } from "next";
import AIRewriter from "@/components/tools/AIRewriter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Text Rewriter — ShipLocal",
};

export default function RewritePage() {
  return (
    <div>
      <Link
        href="/ai"
        className="inline-flex items-center gap-1 text-text-tertiary hover:text-text-secondary text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        AI Tools
      </Link>
      <h1 className="font-heading font-bold text-2xl mb-2">
        Text Rewriter
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        Rewrite text in different tones — powered by a local AI model running
        in your browser.
      </p>
      <AIRewriter />
    </div>
  );
}
