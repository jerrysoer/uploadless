// Singleton pipeline for background removal using RMBG-1.4
let pipeline: ReturnType<typeof Object> | null = null;
let loadingPromise: Promise<void> | null = null;

export interface RMBGProgress {
  status: string;
  progress: number;
  text: string;
}

export async function loadRMBG(
  onProgress?: (progress: RMBGProgress) => void,
): Promise<void> {
  if (pipeline) return;
  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    onProgress?.({ status: "downloading", progress: 0, text: "Downloading background removal model..." });
    const { pipeline: createPipeline } = await import("@xenova/transformers");
    pipeline = await createPipeline("image-segmentation", "briaai/RMBG-1.4", {
      progress_callback: (data: Record<string, unknown>) => {
        if (data.status === "progress") {
          onProgress?.({
            status: "downloading",
            progress: Math.round(data.progress as number),
            text: `Downloading model: ${Math.round(data.progress as number)}%`,
          });
        }
      },
    });
  })();

  try {
    await loadingPromise;
    onProgress?.({ status: "ready", progress: 100, text: "Model ready" });
  } catch (err) {
    loadingPromise = null;
    pipeline = null;
    throw err;
  }
  loadingPromise = null;
}

export async function removeBackground(imageBlob: Blob): Promise<Blob> {
  if (!pipeline) throw new Error("RMBG not loaded. Call loadRMBG() first.");

  const imageUrl = URL.createObjectURL(imageBlob);
  try {
    const result = await (pipeline as CallableFunction)(imageUrl);
    // Result contains mask — apply it to create transparent PNG
    // The pipeline returns RawImage with mask data
    const maskBlob = result[0]?.mask;
    if (!maskBlob) throw new Error("No mask generated");

    // Create canvas to composite original + mask
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Get mask as image
    const maskUrl = URL.createObjectURL(maskBlob);
    const maskImg = new Image();
    await new Promise<void>((resolve, reject) => {
      maskImg.onload = () => resolve();
      maskImg.onerror = reject;
      maskImg.src = maskUrl;
    });
    URL.revokeObjectURL(maskUrl);

    // Create mask canvas
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext("2d")!;
    maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

    // Apply mask as alpha channel
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = maskData.data[i]; // Use R channel of mask as alpha
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas to blob failed"))),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function isRMBGLoaded(): boolean {
  return pipeline !== null;
}

export function unloadRMBG(): void {
  pipeline = null;
  loadingPromise = null;
}
