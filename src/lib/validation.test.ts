import { describe, it, expect } from "vitest";
import { parseScanRequest } from "./validation";

describe("parseScanRequest", () => {
  describe("URL normalization", () => {
    it("adds https:// when protocol is missing", () => {
      const result = parseScanRequest({ url: "example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe("https://example.com/");
      }
    });

    it("forces HTTP to HTTPS", () => {
      const result = parseScanRequest({ url: "http://example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toMatch(/^https:\/\//);
      }
    });

    it("preserves existing HTTPS", () => {
      const result = parseScanRequest({ url: "https://example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe("https://example.com/");
      }
    });

    it("preserves path and query params", () => {
      const result = parseScanRequest({ url: "example.com/page?q=1" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toContain("/page?q=1");
      }
    });
  });

  describe("validation", () => {
    it("rejects empty URL", () => {
      const result = parseScanRequest({ url: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing URL", () => {
      const result = parseScanRequest({});
      expect(result.success).toBe(false);
    });

    it("rejects garbage input", () => {
      const result = parseScanRequest({ url: "not a url at all !!!" });
      expect(result.success).toBe(false);
    });
  });

  describe("force parameter", () => {
    it("accepts force: true", () => {
      const result = parseScanRequest({ url: "example.com", force: true });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.force).toBe(true);
      }
    });

    it("accepts force: false", () => {
      const result = parseScanRequest({ url: "example.com", force: false });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.force).toBe(false);
      }
    });

    it("defaults force to undefined when omitted", () => {
      const result = parseScanRequest({ url: "example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.force).toBeUndefined();
      }
    });

    it("rejects non-boolean force", () => {
      const result = parseScanRequest({ url: "example.com", force: "yes" });
      expect(result.success).toBe(false);
    });
  });
});
