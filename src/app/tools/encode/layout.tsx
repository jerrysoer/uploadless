import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encode / Decode — ShipLocal",
  description:
    "Encode and decode Base64, HTML entities, and URLs — all in your browser.",
};

export default function EncodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
