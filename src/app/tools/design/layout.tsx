import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color & Design Tools — Uploadless",
  description:
    "Check contrast ratios, generate CSS gradients, and extract color palettes — all in your browser.",
};

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
