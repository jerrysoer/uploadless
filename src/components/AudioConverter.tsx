"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import DropZone from "./DropZone";
import PrivacyBadge from "./PrivacyBadge";
import { useConverter } from "@/hooks/useConverter";
import { MAX_AUDIO_SIZE } from "@/lib/constants";
import type { AudioFormat, ConversionOptions } from "@/lib/types";

const OUTPUT_FORMATS: AudioFormat[] = ["mp3", "wav", "ogg", "aac", "flac"];
const ACCEPT = ".mp3,.wav,.ogg,.aac,.flac,.m4a,.wma,audio/*";

// Lazy-load ffmpeg.wasm
let ffmpegInstance: unknown = null;

async function getFFmpeg(onProgress?: (p: number) => void) {
  if (ffmpegInstance) return ffmpegInstance;

  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();

  onProgress?.(10);

  // Load from CDN via blob URLs (bypasses COEP restrictions)
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  onProgress?.(30);
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

async function convertAudio(
  file: File,
  outputFormat: string,
  options?: ConversionOptions,
  onProgress?: (p: number) => void
): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpeg = (await getFFmpeg(onProgress)) as any;

  const inputName = `input.${file.name.split(".").pop()}`;
  const outputName = `output.${outputFormat}`;

  onProgress?.(40);

  // Write input file
  const { fetchFile } = await import("@ffmpeg/util");
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  onProgress?.(50);

  // Build ffmpeg command
  const args = ["-i", inputName];

  // Bitrate
  if (options?.bitrate) {
    args.push("-b:a", `${options.bitrate}k`);
  }

  // Trim
  if (options?.trimStart !== undefined) {
    args.push("-ss", String(options.trimStart));
  }
  if (options?.trimEnd !== undefined) {
    args.push("-to", String(options.trimEnd));
  }

  // Codec mapping
  const codecMap: Record<string, string[]> = {
    mp3: ["-codec:a", "libmp3lame"],
    ogg: ["-codec:a", "libvorbis"],
    aac: ["-codec:a", "aac"],
    flac: ["-codec:a", "flac"],
    wav: [], // PCM default
  };

  if (codecMap[outputFormat]) {
    args.push(...codecMap[outputFormat]);
  }

  args.push("-y", outputName);

  onProgress?.(60);

  await ffmpeg.exec(args);

  onProgress?.(80);

  const data = await ffmpeg.readFile(outputName);

  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  onProgress?.(90);

  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    aac: "audio/aac",
    flac: "audio/flac",
    m4a: "audio/mp4",
  };

  return new Blob([data], { type: mimeMap[outputFormat] ?? "application/octet-stream" });
}

export default function AudioConverter() {
  const [outputFormat, setOutputFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);

  const { jobs, addFiles, processAll, downloadResult, removeJob, clearJobs } =
    useConverter(async (file, format, options, onProgress) => {
      setIsLoadingFFmpeg(true);
      try {
        return await convertAudio(file, format, options, onProgress);
      } finally {
        setIsLoadingFFmpeg(false);
      }
    });

  const handleFiles = useCallback(
    (files: File[]) => {
      addFiles(files, outputFormat, { bitrate });
    },
    [addFiles, outputFormat, bitrate]
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

      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-text-secondary text-xs block mb-1">Output format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as AudioFormat)}
            className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f} value={f}>{f.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-text-secondary text-xs block mb-1">Bitrate</label>
          <select
            value={bitrate}
            onChange={(e) => setBitrate(Number(e.target.value))}
            className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            <option value={128}>128 kbps</option>
            <option value={192}>192 kbps</option>
            <option value={256}>256 kbps</option>
            <option value={320}>320 kbps</option>
          </select>
        </div>
      </div>

      <DropZone
        accept={ACCEPT}
        maxSize={MAX_AUDIO_SIZE}
        onFiles={handleFiles}
        label="Drop audio files here or click to browse"
      />

      {isLoadingFFmpeg && (
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading audio engine (~25MB, one-time download)...
        </div>
      )}

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
