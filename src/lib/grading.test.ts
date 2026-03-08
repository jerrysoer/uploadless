import { describe, it, expect } from "vitest";
import { computeScores, scoreToGrade, gradeFromScan } from "./grading";
import type { ScanData } from "./types";

/** Helper to build a minimal ScanData with overrides */
function makeScan(overrides: Partial<{
  thirdPartyCookies: number;
  thirdPartyDomains: number;
  analyticsCount: number;
  adCount: number;
  sessionRecordingCount: number;
  serverSide: boolean;
}>): ScanData {
  const {
    thirdPartyCookies = 0,
    thirdPartyDomains = 0,
    analyticsCount = 0,
    adCount = 0,
    sessionRecordingCount = 0,
    serverSide = false,
  } = overrides;

  return {
    url: "https://example.com",
    domain: "example.com",
    scannedAt: new Date().toISOString(),
    loadTimeMs: 500,
    consent: { bannerDetected: false, bannerClicked: false, cmpName: null },
    cookies: {
      total: thirdPartyCookies,
      firstParty: 0,
      thirdParty: thirdPartyCookies,
      items: [],
    },
    thirdPartyDomains: {
      total: thirdPartyDomains,
      items: Array.from({ length: thirdPartyDomains }, (_, i) => `tracker${i}.com`),
    },
    trackers: {
      analytics: Array.from({ length: analyticsCount }, (_, i) => ({
        domain: `analytics${i}.com`,
        category: "analytics" as const,
        name: `Analytics ${i}`,
      })),
      advertising: Array.from({ length: adCount }, (_, i) => ({
        domain: `ads${i}.com`,
        category: "advertising" as const,
        name: `Ad Network ${i}`,
      })),
      sessionRecording: Array.from({ length: sessionRecordingCount }, (_, i) => ({
        domain: `recorder${i}.com`,
        category: "session-recording" as const,
        name: `Recorder ${i}`,
      })),
      social: [],
    },
    serverSideProcessing: serverSide,
  };
}

describe("scoreToGrade", () => {
  it("returns A for scores >= 90", () => {
    expect(scoreToGrade(100)).toBe("A");
    expect(scoreToGrade(95)).toBe("A");
    expect(scoreToGrade(90)).toBe("A");
  });

  it("returns B for scores 75-89", () => {
    expect(scoreToGrade(89)).toBe("B");
    expect(scoreToGrade(75)).toBe("B");
  });

  it("returns C for scores 55-74", () => {
    expect(scoreToGrade(74)).toBe("C");
    expect(scoreToGrade(55)).toBe("C");
  });

  it("returns D for scores 35-54", () => {
    expect(scoreToGrade(54)).toBe("D");
    expect(scoreToGrade(35)).toBe("D");
  });

  it("returns F for scores below 35", () => {
    expect(scoreToGrade(34)).toBe("F");
    expect(scoreToGrade(0)).toBe("F");
  });
});

describe("computeScores", () => {
  it("gives 100 for all factors when scan is clean", () => {
    const scores = computeScores(makeScan({}));
    expect(scores.thirdPartyCookies).toBe(100);
    expect(scores.thirdPartyDomains).toBe(100);
    expect(scores.sessionRecording).toBe(100);
    expect(scores.adNetworks).toBe(100);
    expect(scores.analyticsTrackers).toBe(100);
    expect(scores.serverSide).toBe(100);
    expect(scores.total).toBe(100);
  });

  it("floors third-party cookies at worstAt=30", () => {
    const scores = computeScores(makeScan({ thirdPartyCookies: 30 }));
    expect(scores.thirdPartyCookies).toBe(0);

    // 50 cookies should also be 0 (clamped at worstAt)
    const scores2 = computeScores(makeScan({ thirdPartyCookies: 50 }));
    expect(scores2.thirdPartyCookies).toBe(0);
  });

  it("scores third-party cookies linearly between 0 and 30", () => {
    const scores = computeScores(makeScan({ thirdPartyCookies: 15 }));
    expect(scores.thirdPartyCookies).toBe(50);
  });

  it("floors third-party domains at worstAt=20", () => {
    const scores = computeScores(makeScan({ thirdPartyDomains: 20 }));
    expect(scores.thirdPartyDomains).toBe(0);
  });

  it("scores third-party domains linearly between 0 and 20", () => {
    const scores = computeScores(makeScan({ thirdPartyDomains: 10 }));
    expect(scores.thirdPartyDomains).toBe(50);
  });

  it("floors analytics trackers at worstAt=3", () => {
    const scores = computeScores(makeScan({ analyticsCount: 3 }));
    expect(scores.analyticsTrackers).toBe(0);
  });

  it("scores analytics linearly between 0 and 3", () => {
    const scores = computeScores(makeScan({ analyticsCount: 1 }));
    expect(scores.analyticsTrackers).toBe(67);
  });

  it("gives 0 for session recording when any recorder is found", () => {
    const scores = computeScores(makeScan({ sessionRecordingCount: 1 }));
    expect(scores.sessionRecording).toBe(0);
  });

  it("gives 0 for server-side when detected", () => {
    const scores = computeScores(makeScan({ serverSide: true }));
    expect(scores.serverSide).toBe(0);
  });

  it("computes weighted total correctly", () => {
    // All factors at 0 except session recording (100) — weight 0.2
    const scan = makeScan({
      thirdPartyCookies: 100,
      thirdPartyDomains: 100,
      analyticsCount: 10,
      adCount: 10,
      serverSide: true,
    });
    const scores = computeScores(scan);
    // Only sessionRecording contributes: 100 * 0.2 = 20
    expect(scores.total).toBe(20);
  });
});

describe("gradeFromScan — tier differentiation", () => {
  it("Tier 5 (pristine, e.g. example.com) → A", () => {
    const { grade } = gradeFromScan(makeScan({}));
    expect(grade).toBe("A");
  });

  it("Tier 4 (minimal tracking, e.g. signal.org) → A or B", () => {
    const { grade } = gradeFromScan(makeScan({
      thirdPartyCookies: 1,
      thirdPartyDomains: 2,
      analyticsCount: 1,
    }));
    expect(["A", "B"]).toContain(grade);
  });

  it("Tier 3 (moderate, e.g. github.com) → B or C", () => {
    const { grade } = gradeFromScan(makeScan({
      thirdPartyCookies: 8,
      thirdPartyDomains: 10,
      analyticsCount: 2,
    }));
    expect(["B", "C"]).toContain(grade);
  });

  it("Tier 2 (heavy tracking, e.g. canva.com) → C or D", () => {
    const { grade } = gradeFromScan(makeScan({
      thirdPartyCookies: 20,
      thirdPartyDomains: 15,
      analyticsCount: 3,
      adCount: 1,
    }));
    expect(["C", "D"]).toContain(grade);
  });

  it("Tier 1 (extreme tracking, e.g. ilovepdf.com) → D or F", () => {
    const { grade } = gradeFromScan(makeScan({
      thirdPartyCookies: 50,
      thirdPartyDomains: 30,
      analyticsCount: 3,
      adCount: 2,
      sessionRecordingCount: 1,
    }));
    expect(["D", "F"]).toContain(grade);
  });

  it("grades increase monotonically from Tier 1 → Tier 5", () => {
    const gradeOrder: Record<string, number> = { F: 0, D: 1, C: 2, B: 3, A: 4 };

    const tier1 = gradeFromScan(makeScan({
      thirdPartyCookies: 50, thirdPartyDomains: 30,
      analyticsCount: 3, adCount: 2, sessionRecordingCount: 1,
    }));
    const tier3 = gradeFromScan(makeScan({
      thirdPartyCookies: 8, thirdPartyDomains: 10, analyticsCount: 2,
    }));
    const tier5 = gradeFromScan(makeScan({}));

    expect(gradeOrder[tier1.grade]).toBeLessThan(gradeOrder[tier3.grade]);
    expect(gradeOrder[tier3.grade]).toBeLessThan(gradeOrder[tier5.grade]);
  });
});
