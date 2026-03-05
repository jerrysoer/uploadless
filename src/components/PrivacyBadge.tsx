import { ShieldCheck } from "lucide-react";

export default function PrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-grade-a/10 border border-grade-a/20 text-grade-a text-xs font-medium">
      <ShieldCheck className="w-3.5 h-3.5" />
      All processing happens in your browser
    </div>
  );
}
