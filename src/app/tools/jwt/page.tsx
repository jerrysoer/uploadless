import { Metadata } from "next";
import JwtDecoder from "@/components/tools/JwtDecoder";

export const metadata: Metadata = {
  title: "JWT Decoder — Uploadless",
  description:
    "Decode and inspect JWT tokens. View header, payload, claims, and expiry status — all in your browser. No server, no uploads.",
};

export default function JwtPage() {
  return <JwtDecoder />;
}
