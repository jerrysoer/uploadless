import { Metadata } from "next";
import RegexPlayground from "@/components/tools/RegexPlayground";

export const metadata: Metadata = {
  title: "Regex Playground — BrowserShip",
  description:
    "Test regular expressions with real-time matching, highlights, and captured groups — all in your browser.",
};

export default function RegexPage() {
  return <RegexPlayground />;
}
