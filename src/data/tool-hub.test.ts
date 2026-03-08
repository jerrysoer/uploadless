import { describe, it, expect } from "vitest";
import {
  QUICK_TOOLS,
  WRITE_GROUPS,
  CODE_GROUPS,
  MEDIA_GROUPS,
  PROTECT_GROUPS,
  ALL_TAB_GROUPS,
  WRITE_TOOL_COUNT,
  CODE_TOOL_COUNT,
  MEDIA_TOOL_COUNT,
  PROTECT_TOOL_COUNT,
  TOTAL_TOOL_COUNT,
  AI_TOOL_COUNT,
  type ToolHubEntry,
  type ToolHubGroup,
} from "./tool-hub";

// ── Helpers ───────────────────────────────────────────────────────────

/** Flatten all tools from a group array */
const flattenTools = (groups: ToolHubGroup[]): ToolHubEntry[] =>
  groups.flatMap((g) => g.tools);

const allGroupedTools = flattenTools(ALL_TAB_GROUPS);

// ── Tab counts ────────────────────────────────────────────────────────

describe("Tool counts", () => {
  it("Write tab has 6 tools (4 grouped + 2 quick)", () => {
    expect(WRITE_TOOL_COUNT).toBe(6);
    expect(flattenTools(WRITE_GROUPS).length + QUICK_TOOLS.length).toBe(6);
  });

  it("Code tab has 16 tools", () => {
    expect(CODE_TOOL_COUNT).toBe(16);
    expect(flattenTools(CODE_GROUPS).length).toBe(16);
  });

  it("Media tab has 14 tools", () => {
    expect(MEDIA_TOOL_COUNT).toBe(14);
    expect(flattenTools(MEDIA_GROUPS).length).toBe(14);
  });

  it("Protect tab has 7 tools", () => {
    expect(PROTECT_TOOL_COUNT).toBe(7);
    expect(flattenTools(PROTECT_GROUPS).length).toBe(7);
  });

  it("Total is 43 tools", () => {
    expect(TOTAL_TOOL_COUNT).toBe(43);
  });

  it("exported count matches actual sum", () => {
    const actual =
      flattenTools(WRITE_GROUPS).length +
      QUICK_TOOLS.length +
      flattenTools(CODE_GROUPS).length +
      flattenTools(MEDIA_GROUPS).length +
      flattenTools(PROTECT_GROUPS).length;
    expect(TOTAL_TOOL_COUNT).toBe(actual);
  });
});

// ── Structural integrity ──────────────────────────────────────────────

describe("No duplicate hrefs", () => {
  it("every tool href is unique across all tabs", () => {
    const allHrefs = [
      ...QUICK_TOOLS.map((t) => t.href),
      ...allGroupedTools.map((t) => t.href),
    ];
    const unique = new Set(allHrefs);
    const duplicates = allHrefs.filter(
      (h, i) => allHrefs.indexOf(h) !== i,
    );
    expect(duplicates).toEqual([]);
    expect(unique.size).toBe(allHrefs.length);
  });
});

describe("Every group has tools", () => {
  it("no empty groups in any tab", () => {
    for (const group of ALL_TAB_GROUPS) {
      expect(
        group.tools.length,
        `Group "${group.label}" is empty`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("Every tool has required fields", () => {
  it("all grouped tools have href, title, description, icon", () => {
    for (const tool of allGroupedTools) {
      expect(tool.href, `Missing href on "${tool.title}"`).toBeTruthy();
      expect(tool.title).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.icon, `Missing icon on "${tool.title}"`).toBeDefined();
    }
  });

  it("all quick tools have href, title, description, icon", () => {
    for (const tool of QUICK_TOOLS) {
      expect(tool.href).toBeTruthy();
      expect(tool.title).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.icon).toBeDefined();
    }
  });
});

// ── Cross-tab moves ──────────────────────────────────────────────────

describe("Cross-tab moves", () => {
  it("JWT Decoder is in Code tab (moved from Protect)", () => {
    const codeTools = flattenTools(CODE_GROUPS);
    const jwt = codeTools.find((t) => t.href === "/tools/jwt");
    expect(jwt).toBeDefined();
    expect(jwt!.title).toBe("JWT Decoder");

    // Verify not in Protect
    const protectTools = flattenTools(PROTECT_GROUPS);
    expect(protectTools.find((t) => t.href === "/tools/jwt")).toBeUndefined();
  });

  it("EXIF Stripper is in Media tab (moved from Protect)", () => {
    const mediaTools = flattenTools(MEDIA_GROUPS);
    const exif = mediaTools.find((t) => t.href === "/tools/exif");
    expect(exif).toBeDefined();
    expect(exif!.title).toBe("EXIF Stripper");

    // Verify not in Protect
    const protectTools = flattenTools(PROTECT_GROUPS);
    expect(protectTools.find((t) => t.href === "/tools/exif")).toBeUndefined();
  });
});

// ── Merged tools exist ───────────────────────────────────────────────

describe("Merged tools present", () => {
  it("Git Writer exists in Code/AI Code", () => {
    const tool = flattenTools(CODE_GROUPS).find(
      (t) => t.href === "/ai/git-writer",
    );
    expect(tool).toBeDefined();
    expect(tool!.title).toBe("Git Writer");
  });

  it("Data Formatter exists in Code/Data & Formats", () => {
    const tool = flattenTools(CODE_GROUPS).find(
      (t) => t.href === "/tools/data-formatter",
    );
    expect(tool).toBeDefined();
    expect(tool!.title).toBe("Data Formatter");
  });

  it("Text Cleaner exists in Protect/Privacy", () => {
    const tool = flattenTools(PROTECT_GROUPS).find(
      (t) => t.href === "/tools/text-cleaner",
    );
    expect(tool).toBeDefined();
    expect(tool!.title).toBe("Text Cleaner");
  });

  it("Email Inspector exists in Protect/Privacy", () => {
    const tool = flattenTools(PROTECT_GROUPS).find(
      (t) => t.href === "/tools/email-inspector",
    );
    expect(tool).toBeDefined();
    expect(tool!.title).toBe("Email Inspector");
  });

  it("PDF Tools exists in Media/Documents", () => {
    const tool = flattenTools(MEDIA_GROUPS).find(
      (t) => t.href === "/tools/pdf",
    );
    expect(tool).toBeDefined();
    expect(tool!.title).toBe("PDF Tools");
  });
});

// ── Cut tools are gone ───────────────────────────────────────────────

describe("Cut tools removed", () => {
  const cutHrefs = [
    "/tools/text",
    "/tools/wordcount",
    "/tools/case",
    "/tools/lorem",
    "/ai/readme-gen",
    "/ai/sql-gen",
    "/ai/test-gen",
    "/tools/code-screenshot",
    "/tools/og-preview",
    "/tools/csp",
    "/tools/chmod",
    "/tools/ip-calc",
    "/tools/useragent",
    "/tools/robots",
    "/convert/scan",
    "/tools/fingerprint",
    "/tools/file-signature",
  ];

  const allHrefs = new Set([
    ...QUICK_TOOLS.map((t) => t.href),
    ...allGroupedTools.map((t) => t.href),
  ]);

  for (const href of cutHrefs) {
    it(`${href} is no longer in the hub`, () => {
      expect(allHrefs.has(href)).toBe(false);
    });
  }
});

// ── Pre-merge routes are gone ────────────────────────────────────────

describe("Pre-merge routes removed", () => {
  const mergedAwayHrefs = [
    "/ai/commit-msg",
    "/ai/pr-desc",
    "/ai/tech-writing",
    "/ai/full-review",
    "/tools/json",
    "/tools/format-convert",
    "/tools/units",
    "/tools/tracking-pixels",
    "/tools/email-headers",
    "/tools/clipboard",
    "/tools/invisible-chars",
    "/convert/pdf-tools",
    "/sign",
  ];

  const allHrefs = new Set([
    ...QUICK_TOOLS.map((t) => t.href),
    ...allGroupedTools.map((t) => t.href),
  ]);

  for (const href of mergedAwayHrefs) {
    it(`${href} is no longer in the hub`, () => {
      expect(allHrefs.has(href)).toBe(false);
    });
  }
});

// ── Group structure ──────────────────────────────────────────────────

describe("Group labels match plan", () => {
  it("Write groups: Writing, Analysis", () => {
    expect(WRITE_GROUPS.map((g) => g.label)).toEqual(["Writing", "Analysis"]);
  });

  it("Code groups: AI Code, Code Utilities, Data & Formats, DevOps", () => {
    expect(CODE_GROUPS.map((g) => g.label)).toEqual([
      "AI Code",
      "Code Utilities",
      "Data & Formats",
      "DevOps",
    ]);
  });

  it("Media groups: Record, Convert & Edit, Documents, Design", () => {
    expect(MEDIA_GROUPS.map((g) => g.label)).toEqual([
      "Record",
      "Convert & Edit",
      "Documents",
      "Design",
    ]);
  });

  it("Protect groups: Security, Privacy", () => {
    expect(PROTECT_GROUPS.map((g) => g.label)).toEqual([
      "Security",
      "Privacy",
    ]);
  });
});

// ── AI tool count ────────────────────────────────────────────────────

describe("AI tool counting", () => {
  it("AI_TOOL_COUNT matches tools with ai property + quick tools", () => {
    const aiGrouped = allGroupedTools.filter((t) => t.ai).length;
    // AI count = grouped AI tools in Write + Code + Media + quick tools
    // (Protect tools don't have AI tags)
    const writeAI = flattenTools(WRITE_GROUPS).filter((t) => t.ai).length;
    const codeAI = flattenTools(CODE_GROUPS).filter((t) => t.ai).length;
    const mediaAI = flattenTools(MEDIA_GROUPS).filter((t) => t.ai).length;
    const expected = writeAI + codeAI + mediaAI + QUICK_TOOLS.length;
    expect(AI_TOOL_COUNT).toBe(expected);
  });

  it("every AI tool has a tier string", () => {
    const aiTools = allGroupedTools.filter((t) => t.ai);
    for (const tool of aiTools) {
      expect(
        tool.ai!.tier,
        `${tool.title} has no AI tier`,
      ).toBeTruthy();
    }
  });
});
