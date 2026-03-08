"use client";

import { useEffect, useCallback } from "react";
import {
  Maximize2,
  Type,
  Shapes,
  ImageIcon,
  Paintbrush,
  Layers as LayersIcon,
  LayoutTemplate,
  Download,
} from "lucide-react";
import { useDesign, type PanelId } from "./DesignProvider";
import DesignCanvas from "./DesignCanvas";
import DesignToolbar from "./DesignToolbar";
import CanvasSizePanel from "./panels/CanvasSizePanel";
import TextPanel from "./panels/TextPanel";
import ShapePanel from "./panels/ShapePanel";
import ImagePanel from "./panels/ImagePanel";
import BackgroundPanel from "./panels/BackgroundPanel";
import LayersPanel from "./panels/LayersPanel";
import ExportPanel from "./panels/ExportPanel";
import TemplatePanel from "./panels/TemplatePanel";
import { trackEvent } from "@/lib/analytics";

const LEFT_PANELS: { id: PanelId; icon: typeof Maximize2; label: string }[] = [
  { id: "size", icon: Maximize2, label: "Size" },
  { id: "text", icon: Type, label: "Text" },
  { id: "shape", icon: Shapes, label: "Shapes" },
  { id: "image", icon: ImageIcon, label: "Image" },
  { id: "background", icon: Paintbrush, label: "Background" },
  { id: "templates", icon: LayoutTemplate, label: "Templates" },
];

const RIGHT_PANELS: { id: PanelId; icon: typeof LayersIcon; label: string }[] = [
  { id: "layers", icon: LayersIcon, label: "Layers" },
  { id: "export", icon: Download, label: "Export" },
];

const PANEL_COMPONENTS: Record<PanelId, React.ComponentType> = {
  size: CanvasSizePanel,
  text: TextPanel,
  shape: ShapePanel,
  image: ImagePanel,
  background: BackgroundPanel,
  layers: LayersPanel,
  export: ExportPanel,
  templates: TemplatePanel,
};

/**
 * Main design editor shell.
 * Three-column layout: left panel tabs → canvas → right panel (layers).
 * Keyboard shortcuts for undo/redo/delete/duplicate/select-all.
 */
export default function DesignEditor() {
  const {
    state,
    setActivePanel,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    selectAll,
    contextMenu,
    contextMenuRef,
    hideContextMenu,
  } = useDesign();

  // Track tool open
  useEffect(() => {
    trackEvent("tool_opened", { tool: "design_editor" });
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isCtrl && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not editing text
        const active = document.activeElement;
        if (active?.tagName !== "INPUT" && active?.tagName !== "TEXTAREA") {
          deleteSelected();
        }
      } else if (isCtrl && e.key === "a") {
        e.preventDefault();
        selectAll();
      } else if (isCtrl && e.key === "d") {
        e.preventDefault();
        duplicateSelected();
      }
    },
    [undo, redo, deleteSelected, selectAll, duplicateSelected],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Determine which panel to render
  const isLeftPanel = LEFT_PANELS.some((p) => p.id === state.activePanel);
  const isRightPanel = RIGHT_PANELS.some((p) => p.id === state.activePanel);
  const ActivePanelComponent = state.activePanel
    ? PANEL_COMPONENTS[state.activePanel]
    : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-61px-48px)] md:h-[calc(100dvh-61px-48px)]">
      <DesignToolbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar: panel tabs */}
        <div className="hidden md:flex border-r border-border-primary bg-bg-primary">
          {/* Tab buttons */}
          <div className="flex flex-col gap-1 p-1.5 border-r border-border-primary">
            {LEFT_PANELS.map((panel) => (
              <button
                key={panel.id}
                onClick={() =>
                  setActivePanel(state.activePanel === panel.id ? null : panel.id)
                }
                className={`p-2 rounded-md transition-colors ${
                  state.activePanel === panel.id
                    ? "bg-text-primary text-bg-primary"
                    : "text-text-secondary hover:bg-bg-secondary"
                }`}
                title={panel.label}
              >
                <panel.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Left panel content */}
          {isLeftPanel && ActivePanelComponent && (
            <div className="w-[240px] p-3 overflow-y-auto">
              <ActivePanelComponent />
            </div>
          )}
        </div>

        {/* Canvas area */}
        <div className="flex-1 min-w-0" data-design-canvas-area>
          <DesignCanvas />
        </div>

        {/* Right sidebar */}
        <div className="hidden md:flex border-l border-border-primary bg-bg-primary">
          {/* Right panel content */}
          {isRightPanel && ActivePanelComponent && (
            <div className="w-[220px] p-3 overflow-y-auto">
              <ActivePanelComponent />
            </div>
          )}

          {/* Tab buttons */}
          <div className="flex flex-col gap-1 p-1.5 border-l border-border-primary">
            {RIGHT_PANELS.map((panel) => (
              <button
                key={panel.id}
                onClick={() =>
                  setActivePanel(state.activePanel === panel.id ? null : panel.id)
                }
                className={`p-2 rounded-md transition-colors ${
                  state.activePanel === panel.id
                    ? "bg-text-primary text-bg-primary"
                    : "text-text-secondary hover:bg-bg-secondary"
                }`}
                title={panel.label}
              >
                <panel.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet: panel tabs */}
      <div className="flex md:hidden border-t border-border-primary bg-bg-primary">
        <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto">
          {[...LEFT_PANELS, ...RIGHT_PANELS].map((panel) => (
            <button
              key={panel.id}
              onClick={() =>
                setActivePanel(state.activePanel === panel.id ? null : panel.id)
              }
              className={`shrink-0 p-2 rounded-md text-xs transition-colors ${
                state.activePanel === panel.id
                  ? "bg-text-primary text-bg-primary"
                  : "text-text-secondary"
              }`}
              title={panel.label}
            >
              <panel.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Mobile bottom sheet: panel content */}
      {state.activePanel && ActivePanelComponent && (
        <div className="md:hidden border-t border-border-primary bg-bg-primary max-h-[40vh] overflow-y-auto p-3">
          <ActivePanelComponent />
        </div>
      )}

      {/* Context menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-bg-primary border border-border-primary rounded-md shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.items.map((item, i) => (
            <div key={i}>
              {item.separator && i > 0 && (
                <div className="h-px bg-border-primary my-1" />
              )}
              <button
                onClick={item.action}
                disabled={item.disabled}
                className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
