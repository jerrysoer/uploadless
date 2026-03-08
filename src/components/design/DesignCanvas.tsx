"use client";

import { useRef, useEffect, useCallback } from "react";
import { useDesign } from "./DesignProvider";

/**
 * Fabric.js <canvas> wrapper.
 * Dynamically imports Fabric (needs DOM — never at module scope) and
 * registers the canvas instance with DesignProvider.
 *
 * The canvas element renders at `designSize × zoom` while Fabric internally
 * works at full resolution for crisp exports.
 */
export default function DesignCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    state,
    setCanvas,
    fitToScreen,
    setZoom,
    handleContextMenu,
  } = useDesign();

  // Initialize Fabric.js canvas
  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;

    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let canvas: any = null;

    (async () => {
      const fabric = await import("fabric");
      if (disposed) return;

      canvas = new fabric.Canvas(el, {
        width: state.canvasSize.width,
        height: state.canvasSize.height,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        selection: true,
      });

      setCanvas(canvas);

      // Fit to container on initial load — use provider's fitToScreen
      // so React state.zoom stays in sync with the Fabric canvas zoom
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        fitToScreen(rect.width, rect.height);
      }
    })();

    return () => {
      disposed = true;
      if (canvas) {
        canvas.dispose();
        setCanvas(null);
      }
    };
    // Only re-init on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle scroll-wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(state.zoom + delta);
    },
    [state.zoom, setZoom],
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-auto bg-[var(--color-bg-tertiary,#f0f0f0)] min-h-0"
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      <div
        className="shadow-lg"
        style={{
          width: state.canvasSize.width * state.zoom,
          height: state.canvasSize.height * state.zoom,
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
