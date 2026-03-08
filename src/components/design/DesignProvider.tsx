"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
  type RefObject,
} from "react";
import { nanoid } from "nanoid";
import { useCanvasHistory } from "./hooks/useCanvasHistory";
import { useCanvasExport, type ExportFormat } from "./hooks/useCanvasExport";
import { useDesignFonts } from "./hooks/useDesignFonts";
import { useContextMenu, type ContextMenuItem } from "./hooks/useContextMenu";
import { DEFAULT_PRESET } from "./lib/canvas-presets";
import type { TemplateMeta, TemplateJSON } from "./lib/template-schema";

// ─── Types ──────────────────────────────────────────────────────────────

export type DesignTool = "select" | "text" | "shape" | "image";
export type ShapeType = "rect" | "circle" | "triangle" | "line";
export type PanelId =
  | "size"
  | "text"
  | "shape"
  | "image"
  | "background"
  | "layers"
  | "export"
  | "templates";

export interface BackgroundConfig {
  type: "solid" | "gradient" | "image";
  color: string;
  gradient?: {
    type: "linear" | "radial";
    stops: { color: string; offset: number }[];
  };
  imageUrl?: string;
}

export interface ObjectInfo {
  id: string;
  name: string;
  type: string;
  locked: boolean;
  visible: boolean;
}

export interface DesignState {
  canvasSize: { width: number; height: number };
  presetId: string | null;
  zoom: number;
  activeTool: DesignTool;
  activeShapeType: ShapeType;
  selectedObjectIds: string[];
  activePanel: PanelId | null;
  background: BackgroundConfig;
  isCanvasReady: boolean;
  objects: ObjectInfo[];
  bgRemovalLoading: boolean;
}

// ─── Context Value ──────────────────────────────────────────────────────

export interface DesignContextValue {
  state: DesignState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fabricRef: MutableRefObject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setCanvas: (canvas: any) => void;

  // Tool / Panel
  setActiveTool: (tool: DesignTool) => void;
  setActiveShapeType: (type: ShapeType) => void;
  setActivePanel: (panel: PanelId | null) => void;

  // Canvas sizing
  setCanvasSize: (w: number, h: number, presetId?: string | null) => void;
  setZoom: (zoom: number) => void;
  fitToScreen: (containerWidth: number, containerHeight: number) => void;

  // Object creation
  addText: () => void;
  addShape: (type?: ShapeType) => void;
  addImage: (file: File) => void;

  // Object manipulation
  deleteSelected: () => void;
  duplicateSelected: () => void;
  selectAll: () => void;

  // Background
  setBackground: (bg: BackgroundConfig) => void;

  // Layers
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  toggleLock: (objectId: string) => void;
  toggleVisibility: (objectId: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Export
  exportAs: (format: ExportFormat, quality: number, filename: string) => void;

  // Templates
  loadTemplate: (meta: TemplateMeta) => Promise<void>;

  // BG Removal
  removeImageBackground: () => void;

  // Fonts
  loadFont: (family: string) => Promise<void>;
  loadedFonts: string[];

  // Context menu
  contextMenu: ReturnType<typeof useContextMenu>["menu"];
  contextMenuRef: RefObject<HTMLDivElement | null>;
  handleContextMenu: (e: React.MouseEvent) => void;
  hideContextMenu: () => void;

  // Refresh objects list
  refreshObjects: () => void;
}

// ─── Initial State ──────────────────────────────────────────────────────

const INITIAL_STATE: DesignState = {
  canvasSize: { width: DEFAULT_PRESET.width, height: DEFAULT_PRESET.height },
  presetId: DEFAULT_PRESET.id,
  zoom: 1,
  activeTool: "select",
  activeShapeType: "rect",
  selectedObjectIds: [],
  activePanel: "size",
  background: { type: "solid", color: "#ffffff" },
  isCanvasReady: false,
  objects: [],
  bgRemovalLoading: false,
};

// ─── Context ────────────────────────────────────────────────────────────

const DesignContext = createContext<DesignContextValue | null>(null);

export function useDesign(): DesignContextValue {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within <DesignProvider>");
  return ctx;
}

// ─── Auto-name counters ─────────────────────────────────────────────────

interface NameCounters {
  text: number;
  rect: number;
  circle: number;
  triangle: number;
  line: number;
  image: number;
}

const LABEL_MAP: Record<string, string> = {
  text: "Text",
  rect: "Rectangle",
  circle: "Circle",
  triangle: "Triangle",
  line: "Line",
  image: "Image",
};

// ─── Provider ───────────────────────────────────────────────────────────

export function DesignProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null);
  const [state, setState] = useState<DesignState>(INITIAL_STATE);
  const counters = useRef<NameCounters>({
    text: 0, rect: 0, circle: 0, triangle: 0, line: 0, image: 0,
  });

  // Compose hooks
  const history = useCanvasHistory();
  const { exportCanvas } = useCanvasExport();
  const { loadedFonts, loadFont, loadFonts } = useDesignFonts();
  const { menu: contextMenu, menuRef: contextMenuRef, showMenu, hideMenu: hideContextMenu } =
    useContextMenu();

  // ── Helpers ─────────────────────────────────────────────────────────

  const refreshObjects = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objs: ObjectInfo[] = canvas
      .getObjects()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o: any) => ({
        id: o.id ?? "",
        name: o.name ?? o.type ?? "Object",
        type: o.type ?? "unknown",
        locked: !o.selectable,
        visible: o.visible !== false,
      }));

    setState((s) => ({ ...s, objects: objs }));
  }, []);

  const pushHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (canvas) {
      history.pushSnapshot(canvas);
      refreshObjects();
    }
  }, [history, refreshObjects]);

  // ── Canvas setup ───────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setCanvas = useCallback((canvas: any) => {
    fabricRef.current = canvas;
    if (!canvas) {
      setState((s) => ({ ...s, isCanvasReady: false }));
      return;
    }

    // Wire canvas events
    canvas.on("object:modified", () => pushHistory());
    canvas.on("object:added", () => refreshObjects());
    canvas.on("object:removed", () => refreshObjects());

    canvas.on("selection:created", () => {
      const ids = canvas
        .getActiveObjects()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((o: any) => o.id)
        .filter(Boolean);
      setState((s) => ({ ...s, selectedObjectIds: ids }));
    });
    canvas.on("selection:updated", () => {
      const ids = canvas
        .getActiveObjects()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((o: any) => o.id)
        .filter(Boolean);
      setState((s) => ({ ...s, selectedObjectIds: ids }));
    });
    canvas.on("selection:cleared", () => {
      setState((s) => ({ ...s, selectedObjectIds: [] }));
    });

    history.initHistory(canvas);
    setState((s) => ({ ...s, isCanvasReady: true }));
    refreshObjects();
  }, [history, pushHistory, refreshObjects]);

  // ── Tool / Panel ───────────────────────────────────────────────────

  const setActiveTool = useCallback((tool: DesignTool) => {
    setState((s) => {
      const panelMap: Record<DesignTool, PanelId | null> = {
        select: s.activePanel,
        text: "text",
        shape: "shape",
        image: "image",
      };
      return { ...s, activeTool: tool, activePanel: panelMap[tool] ?? s.activePanel };
    });
  }, []);

  const setActiveShapeType = useCallback((type: ShapeType) => {
    setState((s) => ({ ...s, activeShapeType: type }));
  }, []);

  const setActivePanel = useCallback((panel: PanelId | null) => {
    setState((s) => ({ ...s, activePanel: panel }));
  }, []);

  // ── Canvas sizing ──────────────────────────────────────────────────

  const setCanvasSize = useCallback(
    (w: number, h: number, presetId?: string | null) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const zoom = state.zoom;
      canvas.setDimensions({ width: w * zoom, height: h * zoom });
      canvas.setZoom(zoom);

      setState((s) => ({
        ...s,
        canvasSize: { width: w, height: h },
        presetId: presetId ?? null,
      }));

      pushHistory();
    },
    [state.zoom, pushHistory],
  );

  const setZoom = useCallback(
    (zoom: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const clamped = Math.max(0.1, Math.min(3, zoom));
      canvas.setZoom(clamped);
      canvas.setDimensions({
        width: state.canvasSize.width * clamped,
        height: state.canvasSize.height * clamped,
      });
      canvas.renderAll();
      setState((s) => ({ ...s, zoom: clamped }));
    },
    [state.canvasSize],
  );

  const fitToScreen = useCallback(
    (containerWidth: number, containerHeight: number) => {
      const padding = 60;
      const w = containerWidth - padding;
      const h = containerHeight - padding;
      const fitZoom = Math.min(
        w / state.canvasSize.width,
        h / state.canvasSize.height,
        1,
      );
      setZoom(fitZoom);
    },
    [state.canvasSize, setZoom],
  );

  // ── Object creation ────────────────────────────────────────────────

  const addText = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const fabric = await import("fabric");
    counters.current.text++;
    const id = nanoid(10);
    const name = `${LABEL_MAP.text} ${counters.current.text}`;

    const text = new fabric.Textbox("Edit me", {
      left: state.canvasSize.width / 2 - 100,
      top: state.canvasSize.height / 2 - 20,
      fontSize: 32,
      fontFamily: "Inter",
      fill: "#000000",
      width: 200,
      textAlign: "center",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (text as any).id = id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (text as any).name = name;

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    pushHistory();
  }, [state.canvasSize, pushHistory]);

  const addShape = useCallback(
    async (type?: ShapeType) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const fabric = await import("fabric");
      const shapeType = type ?? state.activeShapeType;
      const key = shapeType as keyof NameCounters;
      counters.current[key]++;
      const id = nanoid(10);
      const name = `${LABEL_MAP[shapeType]} ${counters.current[key]}`;

      const cx = state.canvasSize.width / 2;
      const cy = state.canvasSize.height / 2;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let shape: any;

      switch (shapeType) {
        case "rect":
          shape = new fabric.Rect({
            left: cx - 75,
            top: cy - 75,
            width: 150,
            height: 150,
            fill: "#4A90D9",
            rx: 0,
            ry: 0,
          });
          break;
        case "circle":
          shape = new fabric.Circle({
            left: cx - 60,
            top: cy - 60,
            radius: 60,
            fill: "#E74C3C",
          });
          break;
        case "triangle":
          shape = new fabric.Triangle({
            left: cx - 60,
            top: cy - 60,
            width: 120,
            height: 120,
            fill: "#2ECC71",
          });
          break;
        case "line":
          shape = new fabric.Line(
            [cx - 100, cy, cx + 100, cy],
            { stroke: "#333333", strokeWidth: 3 },
          );
          break;
      }

      if (shape) {
        shape.id = id;
        shape.name = name;
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        pushHistory();
      }
    },
    [state.activeShapeType, state.canvasSize, pushHistory],
  );

  const addImage = useCallback(
    async (file: File) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const fabric = await import("fabric");
      const url = URL.createObjectURL(file);

      try {
        const img = await fabric.FabricImage.fromURL(url);
        counters.current.image++;
        const id = nanoid(10);
        const name = `${LABEL_MAP.image} ${counters.current.image}`;

        // Scale to fit within canvas if larger
        const maxDim = Math.min(state.canvasSize.width, state.canvasSize.height) * 0.8;
        const scale = Math.min(
          maxDim / (img.width ?? 1),
          maxDim / (img.height ?? 1),
          1,
        );

        img.set({
          left: state.canvasSize.width / 2 - ((img.width ?? 0) * scale) / 2,
          top: state.canvasSize.height / 2 - ((img.height ?? 0) * scale) / 2,
          scaleX: scale,
          scaleY: scale,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (img as any).id = id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (img as any).name = name;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        pushHistory();
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    [state.canvasSize, pushHistory],
  );

  // ── Object manipulation ────────────────────────────────────────────

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    canvas.discardActiveObject();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    active.forEach((obj: any) => canvas.remove(obj));
    canvas.renderAll();
    pushHistory();
  }, [pushHistory]);

  const duplicateSelected = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    const cloned = await active.clone();
    cloned.set({
      left: (active.left ?? 0) + 20,
      top: (active.top ?? 0) + 20,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cloned as any).id = nanoid(10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origName = (active as any).name ?? "Object";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cloned as any).name = `${origName} copy`;

    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    pushHistory();
  }, [pushHistory]);

  const selectAll = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const fabric = require("fabric");
    const objs = canvas.getObjects();
    if (objs.length === 0) return;

    const selection = new fabric.ActiveSelection(objs, { canvas });
    canvas.setActiveObject(selection);
    canvas.renderAll();
  }, []);

  // ── Background ─────────────────────────────────────────────────────

  const setBackground = useCallback(
    async (bg: BackgroundConfig) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (bg.type === "solid") {
        canvas.set("backgroundImage", undefined);
        canvas.set("backgroundColor", bg.color);
      } else if (bg.type === "gradient" && bg.gradient) {
        const fabric = await import("fabric");
        const grad = new fabric.Gradient({
          type: bg.gradient.type,
          coords:
            bg.gradient.type === "linear"
              ? { x1: 0, y1: 0, x2: state.canvasSize.width, y2: state.canvasSize.height }
              : {
                  x1: state.canvasSize.width / 2,
                  y1: state.canvasSize.height / 2,
                  r1: 0,
                  x2: state.canvasSize.width / 2,
                  y2: state.canvasSize.height / 2,
                  r2: Math.max(state.canvasSize.width, state.canvasSize.height) / 2,
                },
          colorStops: bg.gradient.stops,
        });
        canvas.set("backgroundImage", undefined);
        canvas.set("backgroundColor", grad);
      } else if (bg.type === "image" && bg.imageUrl) {
        const fabric = await import("fabric");
        const img = await fabric.FabricImage.fromURL(bg.imageUrl);
        img.scaleToWidth(state.canvasSize.width);
        canvas.set("backgroundImage", img);
        canvas.set("backgroundColor", "");
      }

      canvas.renderAll();
      setState((s) => ({ ...s, background: bg }));
      pushHistory();
    },
    [state.canvasSize, pushHistory],
  );

  // ── Layers ─────────────────────────────────────────────────────────

  const getActiveObj = useCallback(() => {
    return fabricRef.current?.getActiveObject() ?? null;
  }, []);

  const bringForward = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = getActiveObj();
    if (!canvas || !obj) return;
    canvas.bringObjectForward(obj);
    canvas.renderAll();
    pushHistory();
  }, [getActiveObj, pushHistory]);

  const sendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = getActiveObj();
    if (!canvas || !obj) return;
    canvas.sendObjectBackwards(obj);
    canvas.renderAll();
    pushHistory();
  }, [getActiveObj, pushHistory]);

  const bringToFront = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = getActiveObj();
    if (!canvas || !obj) return;
    canvas.bringObjectToFront(obj);
    canvas.renderAll();
    pushHistory();
  }, [getActiveObj, pushHistory]);

  const sendToBack = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = getActiveObj();
    if (!canvas || !obj) return;
    canvas.sendObjectToBack(obj);
    canvas.renderAll();
    pushHistory();
  }, [getActiveObj, pushHistory]);

  const toggleLock = useCallback(
    (objectId: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj = canvas.getObjects().find((o: any) => o.id === objectId);
      if (!obj) return;

      const locked = obj.selectable;
      obj.set({
        selectable: !locked,
        evented: !locked,
        hasControls: !locked,
      });
      canvas.renderAll();
      refreshObjects();
    },
    [refreshObjects],
  );

  const toggleVisibility = useCallback(
    (objectId: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj = canvas.getObjects().find((o: any) => o.id === objectId);
      if (!obj) return;

      obj.set("visible", !obj.visible);
      canvas.renderAll();
      refreshObjects();
    },
    [refreshObjects],
  );

  // ── History ────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    if (canvas) history.undo(canvas);
  }, [history]);

  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    if (canvas) history.redo(canvas);
  }, [history]);

  // ── Export ─────────────────────────────────────────────────────────

  const exportAs = useCallback(
    async (format: ExportFormat, quality: number, filename: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      await exportCanvas(
        canvas,
        format,
        quality,
        filename,
        state.canvasSize.width,
        state.canvasSize.height,
      );
    },
    [exportCanvas, state.canvasSize],
  );

  // ── Templates ──────────────────────────────────────────────────────

  const loadTemplate = useCallback(
    async (meta: TemplateMeta) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Load required fonts first
      if (meta.fonts.length > 0) {
        await loadFonts(meta.fonts);
      }

      // Fetch template JSON
      const res = await fetch(`/templates/${meta.id}.json`);
      const json: TemplateJSON = await res.json();

      // Apply to canvas
      await canvas.loadFromJSON(json);
      canvas.renderAll();

      // Update state
      setState((s) => ({
        ...s,
        canvasSize: { width: meta.width, height: meta.height },
        presetId: meta.presetId,
      }));

      // Reset counters and reinitialize history
      counters.current = { text: 0, rect: 0, circle: 0, triangle: 0, line: 0, image: 0 };
      history.initHistory(canvas);
      refreshObjects();
    },
    [history, loadFonts, refreshObjects],
  );

  // ── BG Removal ─────────────────────────────────────────────────────

  const removeImageBackground = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active || active.type !== "image") return;

    setState((s) => ({ ...s, bgRemovalLoading: true }));

    try {
      // Render image to temp canvas → blob
      const imgEl = active.getElement();
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = imgEl.naturalWidth ?? imgEl.width;
      tempCanvas.height = imgEl.naturalHeight ?? imgEl.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.drawImage(imgEl, 0, 0);
      const blob = await new Promise<Blob>((resolve) =>
        tempCanvas.toBlob((b) => resolve(b!), "image/png"),
      );

      // Run BG removal
      const { loadRMBG, removeBackground } = await import("@/lib/ai/rmbg");
      await loadRMBG();
      const resultBlob = await removeBackground(blob);

      // Create new Fabric image from result
      const fabric = await import("fabric");
      const url = URL.createObjectURL(resultBlob);
      const newImg = await fabric.FabricImage.fromURL(url);
      URL.revokeObjectURL(url);

      // Preserve position/scale/rotation
      newImg.set({
        left: active.left,
        top: active.top,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        angle: active.angle,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newImg as any).id = (active as any).id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newImg as any).name = (active as any).name;

      // Replace on canvas
      const idx = canvas.getObjects().indexOf(active);
      canvas.remove(active);
      canvas.insertAt(idx, newImg);
      canvas.setActiveObject(newImg);
      canvas.renderAll();
      pushHistory();
    } finally {
      setState((s) => ({ ...s, bgRemovalLoading: false }));
    }
  }, [pushHistory]);

  // ── Context Menu ───────────────────────────────────────────────────

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      const items: ContextMenuItem[] = [];

      if (active) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isImage = (active as any).type === "image";

        items.push(
          { label: "Duplicate", action: () => { duplicateSelected(); hideContextMenu(); } },
          { label: "Delete", action: () => { deleteSelected(); hideContextMenu(); } },
          { label: "Bring Forward", action: () => { bringForward(); hideContextMenu(); }, separator: true },
          { label: "Send Backward", action: () => { sendBackward(); hideContextMenu(); } },
          { label: "Bring to Front", action: () => { bringToFront(); hideContextMenu(); } },
          { label: "Send to Back", action: () => { sendToBack(); hideContextMenu(); } },
        );

        if (isImage) {
          items.push({
            label: "Remove Background",
            action: () => { removeImageBackground(); hideContextMenu(); },
            separator: true,
            disabled: state.bgRemovalLoading,
          });
        }
      } else {
        items.push(
          { label: "Select All", action: () => { selectAll(); hideContextMenu(); } },
          { label: "Paste", action: () => hideContextMenu(), disabled: true },
        );
      }

      showMenu(e.clientX, e.clientY, items);
    },
    [
      duplicateSelected, deleteSelected,
      bringForward, sendBackward, bringToFront, sendToBack,
      removeImageBackground, selectAll,
      showMenu, hideContextMenu, state.bgRemovalLoading,
    ],
  );

  // ── Assemble context value ─────────────────────────────────────────

  const value: DesignContextValue = {
    state,
    fabricRef,
    setCanvas,
    setActiveTool,
    setActiveShapeType,
    setActivePanel,
    setCanvasSize,
    setZoom,
    fitToScreen,
    addText,
    addShape,
    addImage,
    deleteSelected,
    duplicateSelected,
    selectAll,
    setBackground,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    exportAs,
    loadTemplate,
    removeImageBackground,
    loadFont,
    loadedFonts,
    contextMenu,
    contextMenuRef,
    handleContextMenu,
    hideContextMenu,
    refreshObjects,
  };

  return (
    <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
  );
}
