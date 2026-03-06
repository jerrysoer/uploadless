import { Metadata } from "next";
import GradientGenerator from "@/components/tools/GradientGenerator";

export const metadata: Metadata = {
  title: "CSS Gradient Generator — ShipTools",
  description:
    "Create beautiful CSS gradients with a visual editor. Linear, radial, and conic gradients — copy the CSS instantly.",
};

export default function GradientPage() {
  return <GradientGenerator />;
}
