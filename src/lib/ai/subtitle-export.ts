import type { TranscriptionSegment } from "./whisper";

function formatTimeSRT(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatTimeVTT(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

export function toSRT(segments: TranscriptionSegment[]): string {
  return segments
    .map((seg, i) => `${i + 1}\n${formatTimeSRT(seg.start)} --> ${formatTimeSRT(seg.end)}\n${seg.text.trim()}`)
    .join("\n\n");
}

export function toVTT(segments: TranscriptionSegment[]): string {
  const header = "WEBVTT\n\n";
  const body = segments
    .map((seg) => `${formatTimeVTT(seg.start)} --> ${formatTimeVTT(seg.end)}\n${seg.text.trim()}`)
    .join("\n\n");
  return header + body;
}
