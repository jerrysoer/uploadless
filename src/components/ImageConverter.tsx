"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import DropZone from "./DropZone";
import PrivacyBadge from "./PrivacyBadge";
import { useConverter } from "@/hooks/useConverter";
import { MAX_IMAGE_SIZE } from "@/lib/constants";
import type { ImageFormat } from "@/lib/types";

const OUTPUT_FORMATS: ImageFormat[] = ["webp", "png", "jpg", "avif"];
const ACCEPT = ".png,.jpg,.jpeg,.webp,.avif,.gif,.bmp,.tiff,.tif,image/*";

// Lazy-load wasm-vips from CDN via dynamic import at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let vipsPromise: Promise<any> | null = null;

async function getVips() {
  if (!vipsPromise) {
    // Use Function constructor to create a dynamic import that TypeScript won't try to resolve
    const dynamicImport = new Function(
      "url",
      "return import(url)"
    ) as (url: string) => Promise<unknown>;
    vipsPromise = dynamicImport(
      "https://cdn.jsdelivr.net/npm/wasm-vips@0.0.11/lib/vips-es6.js"
    );
  }
  return vipsPromise;
}

async function convertImage(
  file: File,
  outputFormat: string,
  options?: { quality?: number; width?: number; height?: number },
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(10);

  // Try Canvas API for simple formats first (faster, no WASM needed)
  if (["png", "jpg", "jpeg", "webp"].includes(outputFormat) && !options?.width && !options?.height) {
    try {
      return await convertWithCanvas(file, outputFormat, options?.quality);
    } catch {
      // Fall through to wasm-vips
    }
  }

  onProgress?.(30);

  // Use wasm-vips for advanced conversions
  const Vips = await getVips();
  const vips = await (Vips as { default: () => Promise<unknown> }).default();

  onProgress?.(50);

  const buffer = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const image = (vips as any).Image.newFromBuffer(new Uint8Array(buffer));

  let processed = image;

  // Resize if requested
  if (options?.width || options?.height) {
    const w = options.width ?? 0;
    const h = options.height ?? 0;
    if (w && h) {
      processed = processed.thumbnailImage(w, { height: h, crop: "centre" });
    } else if (w) {
      processed = processed.thumbnailImage(w);
    } else if (h) {
      const scale = h / processed.height;
      processed = processed.thumbnailImage(Math.round(processed.width * scale));
    }
  }

  onProgress?.(70);

  // Convert to output format
  const formatMap: Record<string, string> = {
    png: ".png",
    jpg: ".jpg",
    jpeg: ".jpg",
    webp: ".webp",
    avif: ".avif",
    gif: ".gif",
    tiff: ".tiff",
  };

  const suffix = formatMap[outputFormat] ?? `.${outputFormat}`;
  const writeOptions: Record<string, number> = {};
  if (options?.quality && ["jpg", "jpeg", "webp", "avif"].includes(outputFormat)) {
    writeOptions.Q = options.quality;
  }

  const outBuffer: Uint8Array = processed.writeToBuffer(suffix, writeOptions);

  onProgress?.(90);

  const mimeMap: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    tiff: "image/tiff",
  };

  return new Blob([new Uint8Array(outBuffer) as BlobPart], { type: mimeMap[outputFormat] ?? "application/octet-stream" });
}

async function convertWithCanvas(file: File, format: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0);

      const mimeType = format === "jpg" || format === "jpeg" ? "image/jpeg" : `image/${format}`;
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas conversion failed"));
        },
        mimeType,
        quality ? quality / 100 : undefined
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageConverter() {
  const [outputFormat, setOutputFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState(80);

  const { jobs, addFiles, processAll, downloadResult, removeJob, clearJobs } =
    useConverter(convertImage);

  const handleFiles = useCallback(
    (files: File[]) => {
      addFiles(files, outputFormat, { quality });
    },
    [addFiles, outputFormat, quality]
  );

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const doneCount = jobs.filter((j) => j.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PrivacyBadge />
        {jobs.length > 0 && (
          <button
            onClick={clearJobs}
            className="text-text-tertiary hover:text-text-primary text-xs transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-text-secondary text-xs block mb-1">Output format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
            className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-text-secondary text-xs block mb-1">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <DropZone
        accept={ACCEPT}
        maxSize={MAX_IMAGE_SIZE}
        onFiles={handleFiles}
        label="Drop images here or click to browse"
      />

      {/* Job list */}
      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-3 bg-bg-surface border border-border rounded-lg px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{job.file.name}</p>
                <p className="text-xs text-text-tertiary">
                  {job.inputFormat.toUpperCase()} → {job.outputFormat.toUpperCase()}
                  {job.status === "processing" && ` · ${job.progress}%`}
                  {job.status === "done" && job.result && (
                    <> · {(job.result.size / 1024).toFixed(0)} KB</>
                  )}
                  {job.status === "error" && (
                    <span className="text-grade-f"> · {job.error}</span>
                  )}
                </p>
              </div>

              {job.status === "processing" && (
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              )}
              {job.status === "done" && (
                <button
                  onClick={() => downloadResult(job)}
                  className="p-1.5 rounded hover:bg-bg-elevated transition-colors text-grade-a"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => removeJob(job.id)}
                className="p-1.5 rounded hover:bg-bg-elevated transition-colors text-text-tertiary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {pendingCount > 0 && (
            <button
              onClick={processAll}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Convert {pendingCount} file{pendingCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
