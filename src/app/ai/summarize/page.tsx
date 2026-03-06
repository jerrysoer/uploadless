import type { Metadata } from "next";
import AISummarizer from "@/components/tools/AISummarizer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Text Summarizer — ShipLocal",
};

export default function SummarizePage() {
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
        Text Summarizer
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        Paste text and get a concise summary — powered by a local AI model
        running in your browser.
      </p>
      <AISummarizer />
    </div>
  );
}
