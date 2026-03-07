import { Metadata } from "next";
import UserAgentParser from "@/components/tools/UserAgentParser";

export const metadata: Metadata = {
  title: "User-Agent Parser — BrowserShip",
  description:
    "Parse user-agent strings to identify browser, OS, engine, device type, and bot detection. All processing happens locally in your browser.",
};

export default function UserAgentPage() {
  return <UserAgentParser />;
}
