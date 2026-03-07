import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FeaturedToolCardProps {
  href: string;
  title: string;
  description: string;
  deptColor: string;
  size: "large" | "small";
}

export default function FeaturedToolCard({
  href,
  title,
  description,
  deptColor,
  size,
}: FeaturedToolCardProps) {
  if (size === "large") {
    return (
      <Link
        href={href}
        className="group block bg-bg-surface p-8 sm:p-10 transition-colors hover:bg-bg-elevated"
        style={{ borderTop: `4px solid ${deptColor}` }}
      >
        <h3 className="font-heading text-3xl sm:text-4xl font-semibold mb-4 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-text-secondary text-lg leading-relaxed mb-6 max-w-lg">
          {description}
        </p>
        <span className="inline-flex items-center gap-2 text-accent font-medium text-sm">
          Open tool
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block bg-bg-surface p-6 transition-colors hover:bg-bg-elevated"
      style={{ borderTop: `3px solid ${deptColor}` }}
    >
      <h3 className="font-heading text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-4">
        {description}
      </p>
      <span className="inline-flex items-center gap-1.5 text-accent font-medium text-xs">
        Open
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}
