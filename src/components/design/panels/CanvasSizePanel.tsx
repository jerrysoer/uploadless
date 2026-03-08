"use client";

import { useState } from "react";
import { useDesign } from "../DesignProvider";
import { CANVAS_PRESETS } from "../lib/canvas-presets";

export default function CanvasSizePanel() {
  const { state, setCanvasSize } = useDesign();
  const [customW, setCustomW] = useState(state.canvasSize.width);
  const [customH, setCustomH] = useState(state.canvasSize.height);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Canvas Size</h3>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {CANVAS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setCanvasSize(preset.width, preset.height, preset.id)}
            className={`text-left px-3 py-2 rounded-md border text-xs transition-colors ${
              state.presetId === preset.id
                ? "border-text-primary bg-bg-secondary font-medium"
                : "border-border-primary hover:border-text-secondary"
            }`}
          >
            <div className="font-medium text-text-primary">{preset.label}</div>
            <div className="text-text-tertiary">
              {preset.width} × {preset.height}
            </div>
          </button>
        ))}
      </div>

      {/* Custom size */}
      <div className="pt-2 border-t border-border-primary">
        <p className="text-xs font-medium text-text-secondary mb-2">Custom</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customW}
            onChange={(e) => setCustomW(Number(e.target.value))}
            className="w-20 px-2 py-1 text-xs border border-border-primary rounded bg-bg-primary text-text-primary"
            min={100}
            max={4096}
            placeholder="Width"
          />
          <span className="text-text-tertiary text-xs">×</span>
          <input
            type="number"
            value={customH}
            onChange={(e) => setCustomH(Number(e.target.value))}
            className="w-20 px-2 py-1 text-xs border border-border-primary rounded bg-bg-primary text-text-primary"
            min={100}
            max={4096}
            placeholder="Height"
          />
          <button
            onClick={() => {
              if (customW >= 100 && customH >= 100) {
                setCanvasSize(customW, customH, null);
              }
            }}
            className="px-2 py-1 text-xs rounded bg-text-primary text-bg-primary hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
