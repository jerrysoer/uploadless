"use client";

import { useRef, useEffect } from "react";

interface AIStreamOutputProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

/** Strip lone surrogates that small quantized models emit as broken emoji. */
function sanitizeStreamText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

/**
 * Reusable streaming text output component.
 * Shows token-by-token rendering with a blinking cursor during streaming.
 */
export default function AIStreamOutput({
  content,
  isStreaming,
  className = "",
}: AIStreamOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  if (!content && !isStreaming) return null;

  return (
    <div
      ref={containerRef}
      className={`bg-bg-elevated border border-border rounded-xl p-4 text-sm text-text-primary leading-relaxed overflow-y-auto max-h-96 whitespace-pre-wrap ${className}`}
    >
      {sanitizeStreamText(content)}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-accent animate-pulse ml-0.5 align-text-bottom" />
      )}
    </div>
  );
}
