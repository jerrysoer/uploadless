"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AIStatusBadge from "@/components/AIStatusBadge";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const isConvert = pathname.startsWith("/convert");
  const isRecord = pathname.startsWith("/record") || pathname.startsWith("/scan");
  const isTools = pathname.startsWith("/tools");
  const isAI = pathname.startsWith("/ai");

  const navLinks = [
    { href: "/convert", label: "Convert", active: isConvert },
    { href: "/record", label: "Record", active: isRecord },
    { href: "/tools", label: "Tools", active: isTools },
    { href: "/ai", label: "AI", active: isAI },
  ];

  return (
    <header className="px-6 py-5 border-b-4 border-text-primary">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="group">
          <span className="font-heading font-bold text-lg tracking-[0.2em] uppercase">
            ShipLocal
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <AIStatusBadge />
          {navLinks.map((link, i) => (
            <span key={link.href} className="flex items-center">
              {i > 0 && (
                <span className="text-text-tertiary mx-1 select-none" aria-hidden="true">·</span>
              )}
              <Link
                href={link.href}
                className={`px-2 py-1 text-sm font-medium transition-colors ${
                  link.active
                    ? "text-text-primary underline underline-offset-4 decoration-2"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            </span>
          ))}
          <span className="text-text-tertiary mx-1 select-none" aria-hidden="true">·</span>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
