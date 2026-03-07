import { Metadata } from "next";
import UnitConverter from "@/components/tools/UnitConverter";

export const metadata: Metadata = {
  title: "Unit Converter — BrowserShip",
  description:
    "Convert between units of length, weight, temperature, data, time, and speed. Real-time conversion as you type. All processing happens locally in your browser.",
};

export default function UnitsPage() {
  return <UnitConverter />;
}
