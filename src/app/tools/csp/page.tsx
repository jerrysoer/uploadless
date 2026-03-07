import { Metadata } from "next";
import CSPBuilder from "@/components/tools/CSPBuilder";

export const metadata: Metadata = {
  title: "CSP Header Builder — BrowserShip",
  description:
    "Build Content-Security-Policy headers visually with presets, per-directive toggles, and custom domain inputs. All processing happens locally in your browser.",
};

export default function CSPPage() {
  return <CSPBuilder />;
}
