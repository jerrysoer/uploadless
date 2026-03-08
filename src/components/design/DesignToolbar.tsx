"use client";

import {
  MousePointer2,
  Type,
  Square,
  ImageIcon,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
} from "lucide-react";
import { useDesign, type DesignTool } from "./DesignProvider";

const TOOLS: { id: DesignTool; icon: typeof MousePointer2; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "text", icon: Type, label: "Text" },
  { id: "shape", icon: Square, label: "Shape" },
  { id: "image", icon: ImageIcon, label: "Image" },
];

export default function DesignToolbar() {
  const {
    state,
    setActiveTool,
    setActivePanel,
    undo,
    redo,
    canUndo,
    canRedo,
    setZoom,
    fitToScreen,
  } = useDesign();

  const zoomPct = Math.round(state.zoom * 100);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary bg-bg-primary">
      {/* Left: Tool buttons */}
      <div className="flex items-center gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-2 rounded-md text-sm transition-colors ${
              state.activeTool === tool.id
                ? "bg-text-primary text-bg-primary"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Center: Undo/Redo + Zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-md text-text-secondary hover:bg-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-md text-text-secondary hover:bg-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border-primary mx-1" />

        <button
          onClick={() => setZoom(state.zoom - 0.1)}
          className="p-1.5 rounded-md text-text-secondary hover:bg-bg-secondary"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-text-secondary w-10 text-center tabular-nums">
          {zoomPct}%
        </span>
        <button
          onClick={() => setZoom(state.zoom + 0.1)}
          className="p-1.5 rounded-md text-text-secondary hover:bg-bg-secondary"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const container = document.querySelector("[data-design-canvas-area]");
            if (container) {
              const rect = container.getBoundingClientRect();
              fitToScreen(rect.width, rect.height);
            }
          }}
          className="p-1.5 rounded-md text-text-secondary hover:bg-bg-secondary"
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Export */}
      <button
        onClick={() => setActivePanel("export")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-text-primary text-bg-primary text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>
    </div>
  );
}
