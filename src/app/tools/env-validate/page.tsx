import { Metadata } from "next";
import EnvValidator from "@/components/tools/EnvValidator";

export const metadata: Metadata = {
  title: ".env Validator — Uploadless",
  description:
    "Validate .env files for correct format, duplicate keys, missing values, unquoted spaces, and potential secrets. All processing happens locally in your browser.",
};

export default function EnvValidatePage() {
  return <EnvValidator />;
}
