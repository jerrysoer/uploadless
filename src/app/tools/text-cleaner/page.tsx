import { Metadata } from "next";
import TextCleaner from "@/components/tools/TextCleaner";

export const metadata: Metadata = {
  title: "Text Cleaner — Uploadless",
  description: "Strip formatting from pasted text and detect invisible characters, zero-width chars, and homoglyphs. All processing happens locally in your browser.",
};

export default function TextCleanerPage() {
  return <TextCleaner />;
}
