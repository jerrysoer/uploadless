import { Metadata } from "next";
import SvgToReact from "@/components/tools/SvgToReact";

export const metadata: Metadata = {
  title: "SVG → React Component — ShipTools",
  description:
    "Convert raw SVG markup into a clean React component with JSX attributes, TypeScript types, and memo support.",
};

export default function SvgToReactPage() {
  return <SvgToReact />;
}
