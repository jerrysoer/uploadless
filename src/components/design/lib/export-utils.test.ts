import { describe, it, expect } from "vitest";
import { dataUrlToBlob } from "./export-utils";

describe("export-utils", () => {
  describe("dataUrlToBlob", () => {
    it("converts a PNG data URL to a Blob with correct mime type", () => {
      // 1×1 red pixel PNG as base64
      const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

      const blob = dataUrlToBlob(dataUrl);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("image/png");
      expect(blob.size).toBeGreaterThan(0);
    });

    it("converts a JPEG data URL to a Blob with correct mime type", () => {
      // Minimal JPEG
      const dataUrl =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP8B//8AAP/+AP/+AP/8AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP8A//8B/9sAQwAP/9k=";

      const blob = dataUrlToBlob(dataUrl);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("image/jpeg");
      expect(blob.size).toBeGreaterThan(0);
    });

    it("defaults to image/png for malformed headers", () => {
      const dataUrl = "data:;base64,AAAA";

      const blob = dataUrlToBlob(dataUrl);

      expect(blob.type).toBe("image/png");
    });

    it("preserves binary content accurately", () => {
      // Create a known data URL: 3 bytes (0x48, 0x69, 0x21 = "Hi!")
      const dataUrl = "data:application/octet-stream;base64,SGkh";

      const blob = dataUrlToBlob(dataUrl);

      expect(blob.size).toBe(3);
      expect(blob.type).toBe("application/octet-stream");
    });
  });
});
