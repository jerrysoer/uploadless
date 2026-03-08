import { Metadata } from "next";
import DataFormatter from "@/components/tools/DataFormatter";

export const metadata: Metadata = {
  title: "Data Formatter — Uploadless",
  description:
    "Format, validate, and convert JSON. Convert between JSON, YAML, and TOML with auto-detection. All processing happens locally in your browser.",
};

export default function DataFormatterPage() {
  return <DataFormatter />;
}
