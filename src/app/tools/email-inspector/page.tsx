import { Metadata } from "next";
import EmailInspector from "@/components/tools/EmailInspector";

export const metadata: Metadata = {
  title: "Email Inspector — Uploadless",
  description:
    "Detect tracking pixels in emails and analyze email headers for authentication and server hops. All processing happens locally in your browser.",
};

export default function EmailInspectorPage() {
  return <EmailInspector />;
}
