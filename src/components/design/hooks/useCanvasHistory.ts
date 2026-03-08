"use client";

import { useRef, useCallback, useState } from "react";

const MAX_SNAPSHOTS = 50;

/**
 * Undo/redo via Fabric.js JSON snapshots.
 * Each snapshot is a `canvas.toJSON(['id', 'name'])` call (~20-50KB).
 * Capped at 50 entries — ~1-2.5MB max, acceptable for an MVP.
 */
export function useCanvasHistory() {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isProgrammatic = useRef(false);

  /** Take a snapshot of current canvas state and push to undo stack */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pushSnapshot = useCallback((canvas: any) => {
    if (isProgrammatic.current) return;

    const json = JSON.stringify(canvas.toJSON(["id", "name"]));
    undoStack.current.push(json);

    // Cap the stack
    if (undoStack.current.length > MAX_SNAPSHOTS) {
      undoStack.current.shift();
    }

    // Clear redo stack on new action
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  /** Initialize history with the current canvas state */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initHistory = useCallback((canvas: any) => {
    undoStack.current = [JSON.stringify(canvas.toJSON(["id", "name"]))];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  /** Undo the last action */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const undo = useCallback(async (canvas: any) => {
    if (undoStack.current.length <= 1) return; // Keep at least the initial state

    const current = undoStack.current.pop()!;
    redoStack.current.push(current);

    const prev = undoStack.current[undoStack.current.length - 1];
    isProgrammatic.current = true;
    await canvas.loadFromJSON(JSON.parse(prev));
    canvas.renderAll();
    isProgrammatic.current = false;

    setCanUndo(undoStack.current.length > 1);
    setCanRedo(true);
  }, []);

  /** Redo the last undone action */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redo = useCallback(async (canvas: any) => {
    if (redoStack.current.length === 0) return;

    const next = redoStack.current.pop()!;
    undoStack.current.push(next);

    isProgrammatic.current = true;
    await canvas.loadFromJSON(JSON.parse(next));
    canvas.renderAll();
    isProgrammatic.current = false;

    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  return { pushSnapshot, initHistory, undo, redo, canUndo, canRedo };
}
