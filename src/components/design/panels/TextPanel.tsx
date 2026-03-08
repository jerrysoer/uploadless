"use client";

import { useState, useCallback } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
} from "lucide-react";
import { useDesign } from "../DesignProvider";
import {
  FONT_CATALOG,
  SYSTEM_FONTS,
  FONT_CATEGORIES,
} from "../lib/font-catalog";

export default function TextPanel() {
  const { addText, fabricRef, loadFont, loadedFonts } = useDesign();
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#000000");

  const updateSelected = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: Record<string, any>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active || (active.type !== "textbox" && active.type !== "i-text")) return;
      active.set(props);
      canvas.renderAll();
    },
    [fabricRef],
  );

  const handleFontChange = useCallback(
    async (family: string) => {
      setSelectedFont(family);
      await loadFont(family);
      updateSelected({ fontFamily: family });
    },
    [loadFont, updateSelected],
  );

  // Group fonts by category
  const grouped = Object.entries(FONT_CATEGORIES).map(([key, label]) => ({
    label,
    fonts: FONT_CATALOG.filter((f) => f.category === key),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Text</h3>
        <button
          onClick={addText}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-text-primary text-bg-primary hover:opacity-90"
        >
          <Plus className="w-3 h-3" /> Add Text
        </button>
      </div>

      {/* Font family */}
      <div>
        <label className="text-xs text-text-secondary block mb-1">Font</label>
        <select
          value={selectedFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-border-primary rounded bg-bg-primary text-text-primary"
        >
          {grouped.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.fonts.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.family} {loadedFonts.includes(f.family) ? "" : "(load)"}
                </option>
              ))}
            </optgroup>
          ))}
          <optgroup label="System">
            {SYSTEM_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Font size + color */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-text-secondary block mb-1">Size</label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFontSize(v);
              updateSelected({ fontSize: v });
            }}
            className="w-full px-2 py-1.5 text-xs border border-border-primary rounded bg-bg-primary text-text-primary"
            min={8}
            max={200}
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Color</label>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => {
              setFontColor(e.target.value);
              updateSelected({ fill: e.target.value });
            }}
            className="w-10 h-8 rounded border border-border-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Text style buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            const canvas = fabricRef.current;
            const active = canvas?.getActiveObject();
            if (active && "fontWeight" in active) {
              const isBold = active.fontWeight === "bold" || active.fontWeight === 700;
              updateSelected({ fontWeight: isBold ? "normal" : "bold" });
            }
          }}
          className="p-2 rounded hover:bg-bg-secondary text-text-secondary"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const canvas = fabricRef.current;
            const active = canvas?.getActiveObject();
            if (active && "fontStyle" in active) {
              updateSelected({
                fontStyle: active.fontStyle === "italic" ? "normal" : "italic",
              });
            }
          }}
          className="p-2 rounded hover:bg-bg-secondary text-text-secondary"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const canvas = fabricRef.current;
            const active = canvas?.getActiveObject();
            if (active && "underline" in active) {
              updateSelected({ underline: !active.underline });
            }
          }}
          className="p-2 rounded hover:bg-bg-secondary text-text-secondary"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border-primary mx-1" />

        <button
          onClick={() => updateSelected({ textAlign: "left" })}
          className="p-2 rounded hover:bg-bg-secondary text-text-secondary"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateSelected({ textAlign: "center" })}
          className="p-2 rounded hover:bg-bg-secondary text-text-secondary"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateSelected({ textAlign: "right" })}
          className="p-2 rounded hover:bg-bg-secondary text-text-secondary"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
