"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AIStatusBadge from "@/components/AIStatusBadge";
import ThemeToggle from "@/components/ThemeToggle";
import { WRITE_GROUPS, QUICK_TOOLS } from "@/data/tool-hub";

/** AI paths that belong under the Write tab (derived from tool-hub registry). */
const WRITE_AI_PATHS = new Set<string>([
  ...QUICK_TOOLS.map((t) => t.href),
  ...WRITE_GROUPS.flatMap((g) => g.tools.map((t) => t.href)),
]);

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isWrite = pathname.startsWith("/write");
  const isTools = pathname.startsWith("/tools");
  const isAI = pathname.startsWith("/ai");
  const isWriteAI = isAI && WRITE_AI_PATHS.has(pathname);
  const isCodeAI = isAI && !isWriteAI;
  const isMedia =
    pathname.startsWith("/media") ||
    pathname.startsWith("/record") ||
    pathname.startsWith("/convert") ||
    pathname.startsWith("/sign");
  const isProtect = pathname.startsWith("/protect");

  const navLinks = [
    { href: "/write", label: "Write", active: isWrite || isWriteAI },
    { href: "/tools", label: "Code", active: isTools || isCodeAI },
    { href: "/media", label: "Media", active: isMedia },
    { href: "/protect", label: "Protect", active: isProtect },
  ];

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape key closes drawer
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen, handleKeyDown]);

  return (
    <header className="px-6 py-5 border-b-4 border-text-primary">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="group">
          <span className="font-heading font-bold text-lg tracking-[0.2em] uppercase">
            Uploadless
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
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

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -mr-2 text-text-primary"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 top-[61px] z-50 bg-bg-primary/95 backdrop-blur-sm sm:hidden nav-drawer-enter">
          <nav className="flex flex-col items-start gap-6 px-6 pt-8">
            <AIStatusBadge />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-heading text-2xl transition-colors ${
                  link.active
                    ? "text-text-primary underline underline-offset-8 decoration-2"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
