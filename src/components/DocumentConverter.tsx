"use client";

import { useState, useCallback } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import DropZone from "./DropZone";
import PrivacyBadge from "./PrivacyBadge";
import { useConverter } from "@/hooks/useConverter";
import { MAX_DOCUMENT_SIZE } from "@/lib/constants";
import type { DocumentFormat } from "@/lib/types";

const OUTPUT_FORMATS: DocumentFormat[] = ["pdf", "txt", "csv", "json"];
const ACCEPT = ".pdf,.docx,.doc,.txt,.csv,.json,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/json";

async function convertDocument(
  file: File,
  outputFormat: string,
  _options?: unknown,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(10);

  const inputFormat = file.name.split(".").pop()?.toLowerCase() ?? "";

  // DOCX → TXT
  if ((inputFormat === "docx" || inputFormat === "doc") && outputFormat === "txt") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    onProgress?.(50);
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    onProgress?.(90);
    return new Blob([result.value], { type: "text/plain" });
  }

  // DOCX → PDF (extract text, create simple PDF)
  if ((inputFormat === "docx" || inputFormat === "doc") && outputFormat === "pdf") {
    const mammoth = await import("mammoth");
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    const buffer = await file.arrayBuffer();
    onProgress?.(30);

    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    onProgress?.(50);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 50;
    const lineHeight = fontSize * 1.4;

    const lines = result.value.split("\n");
    let page = pdfDoc.addPage();
    let y = page.getHeight() - margin;

    for (const line of lines) {
      // Word wrap
      const words = line.split(" ");
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth > page.getWidth() - margin * 2 && currentLine) {
          page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
          y -= lineHeight;
          currentLine = word;

          if (y < margin) {
            page = pdfDoc.addPage();
            y = page.getHeight() - margin;
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
      } else {
        y -= lineHeight; // empty line
      }

      if (y < margin) {
        page = pdfDoc.addPage();
        y = page.getHeight() - margin;
      }
    }

    onProgress?.(90);
    const pdfBytes = await pdfDoc.save();
    return new Blob([new Uint8Array(pdfBytes) as BlobPart], { type: "application/pdf" });
  }

  // CSV → JSON
  if (inputFormat === "csv" && outputFormat === "json") {
    const Papa = await import("papaparse");
    const text = await file.text();
    onProgress?.(50);
    const result = Papa.default.parse(text, { header: true, skipEmptyLines: true });
    onProgress?.(90);
    return new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
  }

  // JSON → CSV
  if (inputFormat === "json" && outputFormat === "csv") {
    const Papa = await import("papaparse");
    const text = await file.text();
    onProgress?.(50);
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    const csv = Papa.default.unparse(arr);
    onProgress?.(90);
    return new Blob([csv], { type: "text/csv" });
  }

  // TXT → PDF
  if (inputFormat === "txt" && outputFormat === "pdf") {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    const text = await file.text();
    onProgress?.(50);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;
    const margin = 50;
    const lineHeight = fontSize * 1.4;

    const lines = text.split("\n");
    let page = pdfDoc.addPage();
    let y = page.getHeight() - margin;

    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage();
        y = page.getHeight() - margin;
      }
      page.drawText(line.slice(0, 100), { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }

    onProgress?.(90);
    const pdfBytes = await pdfDoc.save();
    return new Blob([new Uint8Array(pdfBytes) as BlobPart], { type: "application/pdf" });
  }

  // PDF → TXT (basic extraction using pdf-lib metadata; limited without full OCR)
  if (inputFormat === "pdf" && outputFormat === "txt") {
    // pdf-lib can't extract text content; return metadata as placeholder
    const { PDFDocument } = await import("pdf-lib");
    const buffer = await file.arrayBuffer();
    onProgress?.(50);
    const pdfDoc = await PDFDocument.load(buffer);
    const info = [
      `Title: ${pdfDoc.getTitle() ?? "Unknown"}`,
      `Author: ${pdfDoc.getAuthor() ?? "Unknown"}`,
      `Pages: ${pdfDoc.getPageCount()}`,
      "",
      "Note: Full PDF text extraction requires OCR. This is a metadata-only export.",
    ].join("\n");
    onProgress?.(90);
    return new Blob([info], { type: "text/plain" });
  }

  throw new Error(`Conversion from ${inputFormat.toUpperCase()} to ${outputFormat.toUpperCase()} is not supported yet.`);
}

export default function DocumentConverter() {
  const [outputFormat, setOutputFormat] = useState<DocumentFormat>("pdf");

  const { jobs, addFiles, processAll, downloadResult, removeJob, clearJobs } =
    useConverter(convertDocument);

  const handleFiles = useCallback(
    (files: File[]) => {
      addFiles(files, outputFormat);
    },
    [addFiles, outputFormat]
  );

  const pendingCount = jobs.filter((j) => j.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PrivacyBadge />
        {jobs.length > 0 && (
          <button onClick={clearJobs} className="text-text-tertiary hover:text-text-primary text-xs transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div>
        <label className="text-text-secondary text-xs block mb-1">Output format</label>
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as DocumentFormat)}
          className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
        >
          {OUTPUT_FORMATS.map((f) => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <DropZone
        accept={ACCEPT}
        maxSize={MAX_DOCUMENT_SIZE}
        onFiles={handleFiles}
        label="Drop documents here or click to browse"
      />

      <p className="text-text-tertiary text-xs">
        Supported: DOCX → PDF/TXT, CSV ↔ JSON, TXT → PDF. Complex formatting may be simplified.
      </p>

      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center gap-3 bg-bg-surface border border-border rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{job.file.name}</p>
                <p className="text-xs text-text-tertiary">
                  {job.inputFormat.toUpperCase()} → {job.outputFormat.toUpperCase()}
                  {job.status === "processing" && ` · ${job.progress}%`}
                  {job.status === "done" && job.result && <> · {(job.result.size / 1024).toFixed(0)} KB</>}
                  {job.status === "error" && <span className="text-grade-f"> · {job.error}</span>}
                </p>
              </div>
              {job.status === "processing" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
              {job.status === "done" && (
                <button onClick={() => downloadResult(job)} className="p-1.5 rounded hover:bg-bg-elevated transition-colors text-grade-a">
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => removeJob(job.id)} className="p-1.5 rounded hover:bg-bg-elevated transition-colors text-text-tertiary">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {pendingCount > 0 && (
            <button onClick={processAll} className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
              Convert {pendingCount} file{pendingCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
