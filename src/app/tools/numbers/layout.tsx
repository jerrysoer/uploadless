import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Number & Date Converter — Uploadless",
  description:
    "Convert between number bases and Unix timestamps — all in your browser.",
};

export default function NumbersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
