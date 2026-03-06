import { Metadata } from "next";
import CaseConverter from "@/components/tools/CaseConverter";

export const metadata: Metadata = {
  title: "Case Converter — ShipTools",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and more.",
};

export default function CasePage() {
  return <CaseConverter />;
}
