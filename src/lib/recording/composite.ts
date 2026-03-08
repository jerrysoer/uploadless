/**
 * Post-recording webcam compositing via ffmpeg overlay filter.
 *
 * Takes screen + webcam blobs and produces a single video with the webcam
 * composited as a picture-in-picture overlay. Runs in WASM — no server needed.
 */

import type { PipPosition, PipSize } from "@/components/recording/WebcamPreview";

export interface CompositeOptions {
  screenWidth: number;
  screenHeight: number;
  position: PipPosition;
  size: PipSize;
  onProgress?: (pct: number) => void;
}

const SIZE_RATIO: Record<PipSize, number> = {
  small: 0.12,
  medium: 0.18,
  large: 0.25,
};

const PADDING = 32;

function getOverlayPosition(
  position: PipPosition,
  screenWidth: number,
  screenHeight: number,
  webcamPx: number,
): { x: string; y: string } {
  // Estimate webcam height from 4:3 aspect ratio
  const webcamHeight = Math.round(webcamPx * (3 / 4));

  switch (position) {
    case "top-left":
      return { x: String(PADDING), y: String(PADDING) };
    case "top-right":
      return { x: String(screenWidth - webcamPx - PADDING), y: String(PADDING) };
    case "bottom-left":
      return { x: String(PADDING), y: String(screenHeight - webcamHeight - PADDING) };
    case "bottom-right":
      return {
        x: String(screenWidth - webcamPx - PADDING),
        y: String(screenHeight - webcamHeight - PADDING),
      };
  }
}

export async function compositeWebcam(
  screenBlob: Blob,
  webcamBlob: Blob,
  options: CompositeOptions,
): Promise<Blob> {
  const { getFFmpeg } = await import("@/lib/ffmpeg");
  const { fetchFile } = await import("@ffmpeg/util");

  options.onProgress?.(5);
  const ffmpeg = await getFFmpeg();
  options.onProgress?.(20);

  // Write inputs to virtual FS
  await ffmpeg.writeFile("screen.webm", await fetchFile(screenBlob));
  await ffmpeg.writeFile("webcam.webm", await fetchFile(webcamBlob));
  options.onProgress?.(30);

  const webcamPx = Math.round(options.screenWidth * SIZE_RATIO[options.size]);
  const { x, y } = getOverlayPosition(
    options.position,
    options.screenWidth,
    options.screenHeight,
    webcamPx,
  );

  // hflip mirrors webcam to match the CSS scale-x-[-1] in WebcamPreview
  const filterComplex = `[1:v]hflip,scale=${webcamPx}:-1,setsar=1[cam];[0:v][cam]overlay=${x}:${y}:shortest=1`;

  options.onProgress?.(35);

  await ffmpeg.exec([
    "-i", "screen.webm",
    "-i", "webcam.webm",
    "-filter_complex", filterComplex,
    "-c:a", "copy",
    "-y", "composited.webm",
  ]);

  options.onProgress?.(85);

  const data = await ffmpeg.readFile("composited.webm");
  const result = new Blob([data], { type: "video/webm" });

  // Cleanup virtual FS
  try {
    await ffmpeg.deleteFile("screen.webm");
    await ffmpeg.deleteFile("webcam.webm");
    await ffmpeg.deleteFile("composited.webm");
  } catch {
    // Non-fatal
  }

  options.onProgress?.(100);
  return result;
}
