"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WorkflowCard from "@/components/WorkflowCard";
import { WORKFLOWS } from "@/data/workflows";

export default function WorkflowSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold mb-2">
          What will you build today?
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-text-secondary">
            Chain tools together into complete workflows.
          </p>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 border border-border rounded-lg hover:bg-bg-surface transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 border border-border rounded-lg hover:bg-bg-surface transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-hide snap-x snap-mandatory px-6 pb-4"
        style={{ paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))" }}
      >
        {WORKFLOWS.map((workflow) => (
          <WorkflowCard key={workflow.id} {...workflow} />
        ))}
      </div>
    </section>
  );
}
