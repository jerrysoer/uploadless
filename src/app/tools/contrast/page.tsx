import { Metadata } from "next";
import ContrastChecker from "@/components/tools/ContrastChecker";

export const metadata: Metadata = {
  title: "Contrast Checker — ShipTools",
  description:
    "Check WCAG 2.1 color contrast ratios between foreground and background colors. AA and AAA compliance — all in your browser.",
};

export default function ContrastPage() {
  return <ContrastChecker />;
}
