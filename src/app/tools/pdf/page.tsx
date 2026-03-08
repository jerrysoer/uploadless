import { Metadata } from "next";
import PdfTools from "@/components/tools/PdfTools";

export const metadata: Metadata = {
  title: "PDF Tools — Uploadless",
  description:
    "Merge, split, and sign PDFs — no server, no account. All processing happens locally in your browser.",
};

export default function PdfToolsPage() {
  return <PdfTools />;
}
