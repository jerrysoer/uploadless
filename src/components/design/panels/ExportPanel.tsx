"use client";

import { useState } from "react";
import { Download, FileImage, FileType, FileText } from "lucide-react";
import { useDesign } from "../DesignProvider";
import type { ExportFormat } from "../hooks/useCanvasExport";

const FORMATS: { id: ExportFormat; label: string; icon: typeof FileImage; ext: string }[] = [
  { id: "png", label: "PNG", icon: FileImage, ext: ".png" },
  { id: "jpg", label: "JPG", icon: FileType, ext: ".jpg" },
  { id: "pdf", label: "PDF", icon: FileText, ext: ".pdf" },
];

export default function ExportPanel() {
  const { state, exportAs } = useDesign();
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(90);
  const [filename, setFilename] = useState("design");

  const ext = FORMATS.find((f) => f.id === format)?.ext ?? ".png";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Export</h3>

      {/* Format picker */}
      <div>
        <label className="text-xs text-text-secondary block mb-2">Format</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-md border text-xs transition-colors ${
                format === f.id
                  ? "border-text-primary bg-bg-secondary font-medium"
                  : "border-border-primary hover:border-text-secondary"
              }`}
            >
              <f.icon className="w-5 h-5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality slider (JPG only) */}
      {format === "jpg" && (
        <div>
          <label className="text-xs text-text-secondary block mb-1">
            Quality: {quality}%
          </label>
          <input
            type="range"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            min={10}
            max={100}
            step={5}
            className="w-full accent-text-primary"
          />
        </div>
      )}

      {/* Filename */}
      <div>
        <label className="text-xs text-text-secondary block mb-1">Filename</label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs border border-border-primary rounded bg-bg-primary text-text-primary"
            placeholder="design"
          />
          <span className="text-xs text-text-tertiary font-mono">{ext}</span>
        </div>
      </div>

      {/* Dimensions info */}
      <div className="text-xs text-text-tertiary">
        Export size: {state.canvasSize.width} × {state.canvasSize.height}px
      </div>

      {/* Download button */}
      <button
        onClick={() => exportAs(format, quality, `${filename}${ext}`)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-text-primary text-bg-primary font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4" />
        Download {format.toUpperCase()}
      </button>

      {/* Privacy note */}
      <p className="text-[10px] text-text-tertiary text-center">
        Exported files contain no EXIF metadata — privacy by design.
      </p>
    </div>
  );
}
