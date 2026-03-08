"use client";

import { useCallback, useState } from "react";
import { Square, Circle, Triangle, Minus, Plus } from "lucide-react";
import { useDesign, type ShapeType } from "../DesignProvider";

const SHAPES: { type: ShapeType; icon: typeof Square; label: string }[] = [
  { type: "rect", icon: Square, label: "Rectangle" },
  { type: "circle", icon: Circle, label: "Circle" },
  { type: "triangle", icon: Triangle, label: "Triangle" },
  { type: "line", icon: Minus, label: "Line" },
];

export default function ShapePanel() {
  const { state, addShape, setActiveShapeType, fabricRef } = useDesign();
  const [fillColor, setFillColor] = useState("#4A90D9");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(100);

  const updateSelected = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: Record<string, any>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set(props);
      canvas.renderAll();
    },
    [fabricRef],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Shapes</h3>
      </div>

      {/* Shape type picker */}
      <div className="grid grid-cols-4 gap-2">
        {SHAPES.map((shape) => (
          <button
            key={shape.type}
            onClick={() => {
              setActiveShapeType(shape.type);
              addShape(shape.type);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-colors ${
              state.activeShapeType === shape.type
                ? "border-text-primary bg-bg-secondary"
                : "border-border-primary hover:border-text-secondary"
            }`}
            title={shape.label}
          >
            <shape.icon className="w-5 h-5" />
            <span className="text-text-secondary text-[10px]">{shape.label}</span>
          </button>
        ))}
      </div>

      {/* Fill color */}
      <div>
        <label className="text-xs text-text-secondary block mb-1">Fill Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => {
              setFillColor(e.target.value);
              updateSelected({ fill: e.target.value });
            }}
            className="w-8 h-8 rounded border border-border-primary cursor-pointer"
          />
          <input
            type="text"
            value={fillColor}
            onChange={(e) => {
              setFillColor(e.target.value);
              updateSelected({ fill: e.target.value });
            }}
            className="flex-1 px-2 py-1 text-xs border border-border-primary rounded bg-bg-primary text-text-primary font-mono"
          />
        </div>
      </div>

      {/* Stroke */}
      <div>
        <label className="text-xs text-text-secondary block mb-1">Stroke</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => {
              setStrokeColor(e.target.value);
              updateSelected({ stroke: e.target.value });
            }}
            className="w-8 h-8 rounded border border-border-primary cursor-pointer"
          />
          <input
            type="number"
            value={strokeWidth}
            onChange={(e) => {
              const v = Number(e.target.value);
              setStrokeWidth(v);
              updateSelected({ strokeWidth: v, stroke: strokeColor });
            }}
            className="w-16 px-2 py-1 text-xs border border-border-primary rounded bg-bg-primary text-text-primary"
            min={0}
            max={20}
            placeholder="Width"
          />
          <span className="text-xs text-text-tertiary">px</span>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="text-xs text-text-secondary block mb-1">
          Opacity: {opacity}%
        </label>
        <input
          type="range"
          value={opacity}
          onChange={(e) => {
            const v = Number(e.target.value);
            setOpacity(v);
            updateSelected({ opacity: v / 100 });
          }}
          min={0}
          max={100}
          className="w-full accent-text-primary"
        />
      </div>

      {/* Add shape button */}
      <button
        onClick={() => addShape()}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded bg-text-primary text-bg-primary hover:opacity-90"
      >
        <Plus className="w-3.5 h-3.5" /> Add {SHAPES.find((s) => s.type === state.activeShapeType)?.label}
      </button>
    </div>
  );
}
