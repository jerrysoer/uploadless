"use client";

import { useEffect, useRef, useCallback, type RefObject } from "react";

export interface UseFabricOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

/**
 * Core hook: dynamically imports Fabric.js, initializes the canvas, and
 * handles lifecycle + cleanup. Returns a stable ref to the Canvas instance.
 *
 * Fabric.js requires the DOM, so it's imported inside useEffect — never at
 * module scope — to prevent SSR crashes.
 */
export function useFabric(
  canvasElRef: RefObject<HTMLCanvasElement | null>,
  options: UseFabricOptions,
  onReady?: (canvas: import("fabric").Canvas) => void,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvasRef = useRef<any>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;

    let disposed = false;

    (async () => {
      const fabric = await import("fabric");
      if (disposed) return;

      const canvas = new fabric.Canvas(el, {
        width: optionsRef.current.width,
        height: optionsRef.current.height,
        backgroundColor: optionsRef.current.backgroundColor ?? "#ffffff",
        preserveObjectStacking: true,
        selection: true,
      });

      canvasRef.current = canvas;
      onReadyRef.current?.(canvas);
    })();

    return () => {
      disposed = true;
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
    // Only re-init if the canvas DOM element changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasElRef]);

  /** Update canvas dimensions without re-initializing */
  const resize = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }, []);

  return { canvasRef, resize };
}
