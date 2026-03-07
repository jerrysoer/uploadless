import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Utilities — ShipLocal",
  description:
    "Count words, convert case, and generate lorem ipsum — all in your browser.",
};

export default function TextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
