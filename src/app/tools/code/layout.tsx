import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Tools — ShipLocal",
  description:
    "Markdown editor, SVG to React converter, and code screenshot generator — all in your browser.",
};

export default function CodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
