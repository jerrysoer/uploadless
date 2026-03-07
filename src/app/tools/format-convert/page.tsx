import { Metadata } from "next";
import FormatConverter from "@/components/tools/FormatConverter";

export const metadata: Metadata = {
  title: "JSON / YAML / TOML Converter — BrowserShip",
  description:
    "Convert between JSON, YAML, and TOML formats with auto-detection. All processing happens locally in your browser.",
};

export default function FormatConvertPage() {
  return <FormatConverter />;
}
