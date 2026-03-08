"use client";

import { useState, useCallback, useRef } from "react";
import { useDesign, type BackgroundConfig } from "../DesignProvider";

const SOLID_PRESETS = [
  "#ffffff",
  "#000000",
  "#f8f9fa",
  "#1a1a2e",
  "#e74c3c",
  "#e67e22",
  "#f1c40f",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#1abc9c",
  "#34495e",
];

const GRADIENT_PRESETS: BackgroundConfig[] = [
  {
    type: "gradient",
    color: "",
    gradient: {
      type: "linear",
      stops: [
        { color: "#667eea", offset: 0 },
        { color: "#764ba2", offset: 1 },
      ],
    },
  },
  {
    type: "gradient",
    color: "",
    gradient: {
      type: "linear",
      stops: [
        { color: "#f093fb", offset: 0 },
        { color: "#f5576c", offset: 1 },
      ],
    },
  },
  {
    type: "gradient",
    color: "",
    gradient: {
      type: "linear",
      stops: [
        { color: "#4facfe", offset: 0 },
        { color: "#00f2fe", offset: 1 },
      ],
    },
  },
  {
    type: "gradient",
    color: "",
    gradient: {
      type: "linear",
      stops: [
        { color: "#43e97b", offset: 0 },
        { color: "#38f9d7", offset: 1 },
      ],
    },
  },
  {
    type: "gradient",
    color: "",
    gradient: {
      type: "linear",
      stops: [
        { color: "#fa709a", offset: 0 },
        { color: "#fee140", offset: 1 },
      ],
    },
  },
  {
    type: "gradient",
    color: "",
    gradient: {
      type: "radial",
      stops: [
        { color: "#ffecd2", offset: 0 },
        { color: "#fcb69f", offset: 1 },
      ],
    },
  },
];

export default function BackgroundPanel() {
  const { state, setBackground } = useDesign();
  const [customColor, setCustomColor] = useState(state.background.color || "#ffffff");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageBg = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setBackground({ type: "image", color: "", imageUrl: url });
    },
    [setBackground],
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Background</h3>

      {/* Solid colors */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Solid Color</p>
        <div className="grid grid-cols-6 gap-2">
          {SOLID_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setBackground({ type: "solid", color })}
              className={`w-8 h-8 rounded-md border-2 transition-all ${
                state.background.type === "solid" && state.background.color === color
                  ? "border-text-primary scale-110"
                  : "border-border-primary hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              setBackground({ type: "solid", color: e.target.value });
            }}
            className="w-8 h-8 rounded border border-border-primary cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
                setBackground({ type: "solid", color: e.target.value });
              }
            }}
            className="flex-1 px-2 py-1 text-xs border border-border-primary rounded bg-bg-primary text-text-primary font-mono"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Gradients */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Gradient</p>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_PRESETS.map((preset, i) => {
            const stops = preset.gradient?.stops ?? [];
            const css =
              preset.gradient?.type === "radial"
                ? `radial-gradient(circle, ${stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ")})`
                : `linear-gradient(135deg, ${stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ")})`;

            return (
              <button
                key={i}
                onClick={() => setBackground(preset)}
                className="w-full h-10 rounded-md border-2 border-border-primary hover:border-text-secondary transition-all"
                style={{ background: css }}
              />
            );
          })}
        </div>
      </div>

      {/* Image background */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Image</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2 text-xs border border-dashed border-border-primary rounded hover:border-text-secondary transition-colors"
        >
          Upload background image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageBg(file);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}
