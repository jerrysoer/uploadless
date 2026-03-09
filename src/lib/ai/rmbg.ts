// Singleton model + processor for background removal using RMBG-1.4
// Uses AutoModel + AutoProcessor API (RMBG-1.4 doesn't support pipeline())
import type { PreTrainedModel, Processor, Tensor } from "@xenova/transformers";

let model: PreTrainedModel | null = null;
let processor: Processor | null = null;
let loadingPromise: Promise<void> | null = null;

export interface RMBGProgress {
  status: string;
  progress: number;
  text: string;
}

export async function loadRMBG(
  onProgress?: (progress: RMBGProgress) => void,
): Promise<void> {
  if (model && processor) return;
  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    onProgress?.({ status: "downloading", progress: 0, text: "Downloading background removal model..." });
    const { AutoModel, AutoProcessor } = await import("@xenova/transformers");

    model = await AutoModel.from_pretrained("briaai/RMBG-1.4", {
      quantized: false,
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

    processor = await AutoProcessor.from_pretrained("briaai/RMBG-1.4");
  })();

  try {
    await loadingPromise;
    onProgress?.({ status: "ready", progress: 100, text: "Model ready" });
  } catch (err) {
    loadingPromise = null;
    model = null;
    processor = null;
    throw err;
  }
  loadingPromise = null;
}

export async function removeBackground(imageBlob: Blob): Promise<Blob> {
  if (!model || !processor) throw new Error("RMBG not loaded. Call loadRMBG() first.");

  const { RawImage } = await import("@xenova/transformers");

  // Load image and run through processor
  const image = await RawImage.fromBlob(imageBlob);
  const { pixel_values } = await (processor as unknown as (img: InstanceType<typeof RawImage>) => Promise<{ pixel_values: Tensor }>)(image);

  // Run inference — _call is the typed entry point (runtime Proxy makes model() work too)
  const { output } = await model._call({ input: pixel_values }) as { output: Tensor };

  // Post-process: output shape [1, 1, H, W] → squeeze to [H, W], scale to 0-255
  const maskTensor = output.squeeze().mul(255).to("uint8");
  const mask = RawImage.fromTensor(maskTensor);
  const resizedMask = await mask.resize(image.width, image.height);

  // Create canvas, draw original image, apply mask as alpha channel
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d")!;

  const imageUrl = URL.createObjectURL(imageBlob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageUrl;
    });
    ctx.drawImage(img, 0, 0);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }

  // Apply mask as alpha channel
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < resizedMask.data.length; i++) {
    imageData.data[i * 4 + 3] = resizedMask.data[i];
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas to blob failed"))),
      "image/png",
    );
  });
}

export function isRMBGLoaded(): boolean {
  return model !== null && processor !== null;
}

export function unloadRMBG(): void {
  model = null;
  processor = null;
  loadingPromise = null;
}
