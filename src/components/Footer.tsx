import Link from "next/link";
import { Github } from "lucide-react";
import AnalyticsStatus from "@/components/AnalyticsStatus";

export default function Footer() {
  return (
    <footer className="mt-auto px-6 py-8 border-t-4 border-text-primary">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-text-tertiary text-sm">
        <div>
          <span className="font-heading font-semibold tracking-[0.15em] uppercase text-text-secondary">
            Uploadless
          </span>
          <span className="mx-2">·</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/about"
            className="hover:text-text-secondary transition-colors"
          >
            About
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link
            href="/transparency"
            className="hover:text-text-secondary transition-colors"
          >
            Transparency
          </Link>
          <span className="text-text-tertiary">·</span>
          <a
            href="https://github.com/jerrysoer/uploadless"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <span className="basis-full sm:basis-auto order-last sm:order-none">
            No tracking. No uploads. No cookies.
          </span>
          <AnalyticsStatus />
        </div>
      </div>
    </footer>
  );
}
