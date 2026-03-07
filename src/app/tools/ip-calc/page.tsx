import { Metadata } from "next";
import IPCalculator from "@/components/tools/IPCalculator";

export const metadata: Metadata = {
  title: "IP / Subnet Calculator — Uploadless",
  description:
    "Calculate subnet details from CIDR notation or IP + mask. Get network range, usable hosts, broadcast address, and more. All processing happens locally in your browser.",
};

export default function IPCalcPage() {
  return <IPCalculator />;
}
