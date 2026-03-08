"use client";

import { useState, useCallback, useRef } from "react";
import { FONT_CATALOG, SYSTEM_FONTS } from "../lib/font-catalog";

/**
 * Loads Google Fonts on demand via the CSS Font Loading API.
 * Prevents FOUT by waiting for the font to be ready before resolving.
 *
 * Uses a <link> element to fetch from Google Fonts CDN, then waits
 * for `document.fonts.load()` to confirm the font is available.
 */
export function useDesignFonts() {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([...SYSTEM_FONTS]);
  const loadingRef = useRef(new Set<string>());

  const loadFont = useCallback(async (family: string): Promise<void> => {
    // Already loaded or loading
    if (loadedFonts.includes(family) || loadingRef.current.has(family)) return;
    if (SYSTEM_FONTS.includes(family)) return;

    const entry = FONT_CATALOG.find((f) => f.family === family);
    if (!entry) return;

    loadingRef.current.add(family);

    try {
      // Inject Google Fonts stylesheet
      const linkId = `design-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${entry.googleUrl}&display=swap`;
        document.head.appendChild(link);
      }

      // Wait for the font to actually load
      await document.fonts.load(`400 16px "${family}"`);

      setLoadedFonts((prev) =>
        prev.includes(family) ? prev : [...prev, family],
      );
    } finally {
      loadingRef.current.delete(family);
    }
  }, [loadedFonts]);

  /** Load multiple fonts (used when loading templates) */
  const loadFonts = useCallback(
    async (families: string[]) => {
      await Promise.all(families.map(loadFont));
    },
    [loadFont],
  );

  return { loadedFonts, loadFont, loadFonts };
}
