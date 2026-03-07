import { redirect } from "next/navigation";

export default function PrivacyPolicyPage() {
  redirect("/ai/summarize?mode=privacy-policy");
}
