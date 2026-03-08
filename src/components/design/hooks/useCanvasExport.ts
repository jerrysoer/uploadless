"use client";

import { useCallback } from "react";
import { dataUrlToBlob, downloadBlob, exportAsPdf } from "../lib/export-utils";

export type ExportFormat = "png" | "jpg" | "pdf";

/**
 * Export hook: wraps Fabric.js canvas export with format handling.
 * Temporarily sets zoom to 1.0 for full-resolution export.
 */
export function useCanvasExport() {
  const exportCanvas = useCallback(
    async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas: any,
      format: ExportFormat,
      quality: number,
      filename: string,
      designWidth: number,
      designHeight: number,
    ) => {
      if (!canvas) return;

      // Save current zoom/viewport and reset for export
      const currentZoom = canvas.getZoom();
      const currentVpt = [...canvas.viewportTransform];
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.setZoom(1);
      canvas.setDimensions({ width: designWidth, height: designHeight });

      try {
        if (format === "pdf") {
          const dataUrl = canvas.toDataURL({
            format: "png",
            multiplier: 1,
          });
          await exportAsPdf(dataUrl, designWidth, designHeight, filename);
        } else {
          const dataUrl = canvas.toDataURL({
            format: format === "jpg" ? "jpeg" : "png",
            quality: format === "jpg" ? quality / 100 : 1,
            multiplier: 1,
          });
          const blob = dataUrlToBlob(dataUrl);
          downloadBlob(blob, filename);
        }
      } finally {
        // Restore zoom/viewport
        canvas.setZoom(currentZoom);
        canvas.setViewportTransform(currentVpt);
        canvas.setDimensions({
          width: designWidth * currentZoom,
          height: designHeight * currentZoom,
        });
        canvas.renderAll();
      }
    },
    [],
  );

  return { exportCanvas };
}
