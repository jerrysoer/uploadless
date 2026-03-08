export interface FontEntry {
  family: string;
  category: "sans" | "serif" | "display" | "handwriting" | "mono";
  weights: number[];
  googleUrl: string;
}

export const FONT_CATALOG: FontEntry[] = [
  // Sans-Serif
  { family: "Inter", category: "sans", weights: [400, 500, 600, 700], googleUrl: "Inter:wght@400;500;600;700" },
  { family: "Open Sans", category: "sans", weights: [400, 600, 700], googleUrl: "Open+Sans:wght@400;600;700" },
  { family: "Roboto", category: "sans", weights: [400, 500, 700], googleUrl: "Roboto:wght@400;500;700" },
  { family: "Poppins", category: "sans", weights: [400, 500, 600, 700], googleUrl: "Poppins:wght@400;500;600;700" },
  { family: "Montserrat", category: "sans", weights: [400, 500, 600, 700, 800], googleUrl: "Montserrat:wght@400;500;600;700;800" },
  { family: "DM Sans", category: "sans", weights: [400, 500, 600, 700], googleUrl: "DM+Sans:wght@400;500;600;700" },
  { family: "Work Sans", category: "sans", weights: [400, 500, 600, 700], googleUrl: "Work+Sans:wght@400;500;600;700" },

  // Serif
  { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 900], googleUrl: "Playfair+Display:wght@400;500;600;700;900" },
  { family: "Lora", category: "serif", weights: [400, 500, 600, 700], googleUrl: "Lora:wght@400;500;600;700" },
  { family: "Merriweather", category: "serif", weights: [400, 700], googleUrl: "Merriweather:wght@400;700" },
  { family: "Cormorant Garamond", category: "serif", weights: [400, 500, 600, 700], googleUrl: "Cormorant+Garamond:wght@400;500;600;700" },
  { family: "Crimson Text", category: "serif", weights: [400, 600, 700], googleUrl: "Crimson+Text:wght@400;600;700" },

  // Display
  { family: "Bebas Neue", category: "display", weights: [400], googleUrl: "Bebas+Neue" },
  { family: "Oswald", category: "display", weights: [400, 500, 600, 700], googleUrl: "Oswald:wght@400;500;600;700" },
  { family: "Anton", category: "display", weights: [400], googleUrl: "Anton" },
  { family: "Righteous", category: "display", weights: [400], googleUrl: "Righteous" },
  { family: "Archivo Black", category: "display", weights: [400], googleUrl: "Archivo+Black" },

  // Handwriting
  { family: "Dancing Script", category: "handwriting", weights: [400, 500, 600, 700], googleUrl: "Dancing+Script:wght@400;500;600;700" },
  { family: "Pacifico", category: "handwriting", weights: [400], googleUrl: "Pacifico" },
  { family: "Caveat", category: "handwriting", weights: [400, 500, 600, 700], googleUrl: "Caveat:wght@400;500;600;700" },
  { family: "Sacramento", category: "handwriting", weights: [400], googleUrl: "Sacramento" },
  { family: "Great Vibes", category: "handwriting", weights: [400], googleUrl: "Great+Vibes" },

  // Monospace
  { family: "IBM Plex Mono", category: "mono", weights: [400, 500], googleUrl: "IBM+Plex+Mono:wght@400;500" },
  { family: "JetBrains Mono", category: "mono", weights: [400, 500, 600, 700], googleUrl: "JetBrains+Mono:wght@400;500;600;700" },
  { family: "Source Code Pro", category: "mono", weights: [400, 500, 600, 700], googleUrl: "Source+Code+Pro:wght@400;500;600;700" },
];

/** System fonts that don't need loading */
export const SYSTEM_FONTS = ["Arial", "Helvetica", "Georgia"];

/** All available font families (Google + system) */
export const ALL_FONT_FAMILIES = [
  ...FONT_CATALOG.map((f) => f.family),
  ...SYSTEM_FONTS,
];

/** Category labels for UI grouping */
export const FONT_CATEGORIES = {
  sans: "Sans-Serif",
  serif: "Serif",
  display: "Display",
  handwriting: "Handwriting",
  mono: "Monospace",
} as const;
