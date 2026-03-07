import { Metadata } from "next";
import RobotsGenerator from "@/components/tools/RobotsGenerator";

export const metadata: Metadata = {
  title: "robots.txt Generator — BrowserShip",
  description:
    "Build robots.txt files visually with presets for AI crawlers, SEO, and custom rules. All processing happens locally in your browser.",
};

export default function RobotsPage() {
  return <RobotsGenerator />;
}
