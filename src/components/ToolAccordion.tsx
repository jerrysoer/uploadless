"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface ToolEntry {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface ToolGroup {
  label: string;
  tools: ToolEntry[];
}

interface ToolAccordionProps {
  groups: ToolGroup[];
  storageKey?: string;
}

function ToolRow({ href, icon: Icon, title, description }: ToolEntry) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 py-3 border-b border-border hover:bg-bg-surface transition-colors -mx-3 px-3"
    >
      <Icon className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors flex-shrink-0" />
      <span className="font-medium text-sm group-hover:text-accent transition-colors min-w-[180px]">
        {title}
      </span>
      <span className="text-text-secondary text-sm hidden sm:block">
        {description}
      </span>
    </Link>
  );
}

export default function ToolAccordion({
  groups,
  storageKey = "tool-accordion-state",
}: ToolAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state on mount, default all open
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setOpenSections(JSON.parse(stored));
      } else {
        // Default: all sections open
        const allOpen: Record<string, boolean> = {};
        groups.forEach((g) => {
          allOpen[g.label] = true;
        });
        setOpenSections(allOpen);
      }
    } catch {
      const allOpen: Record<string, boolean> = {};
      groups.forEach((g) => {
        allOpen[g.label] = true;
      });
      setOpenSections(allOpen);
    }
    setHydrated(true);
  }, [groups, storageKey]);

  // Persist state changes
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(openSections));
      } catch {
        // Ignore storage errors
      }
    }
  }, [openSections, storageKey, hydrated]);

  const toggleSection = useCallback((label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isOpen = hydrated ? (openSections[group.label] ?? true) : true;

        return (
          <div key={group.label}>
            <button
              onClick={() => toggleSection(group.label)}
              className="w-full flex items-center gap-3 py-3 group cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                  isOpen ? "" : "-rotate-90"
                }`}
              />
              <span className="font-mono text-xs tracking-widest uppercase text-text-tertiary">
                {group.label} · {group.tools.length} tools
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-200 ease-in-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
              }}
            >
              <div className="overflow-hidden">
                <div className="pb-6">
                  {group.tools.map((tool) => (
                    <ToolRow key={tool.href} {...tool} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
