import type { MLCEngine } from "@mlc-ai/web-llm";
import type { AIStatus } from "./types";

/** Tiered models: try largest first, fall through on OOM */
const MODEL_TIERS = [
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 3B",
    sizeLabel: "~1.8 GB",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 1.5B",
    sizeLabel: "~900 MB",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 0.5B",
    sizeLabel: "~350 MB",
  },
] as const;

// Module-level singleton
let engine: MLCEngine | null = null;
let loadedModelId: string | null = null;

export type ProgressCallback = (progress: {
  status: AIStatus;
  progress: number;
  text: string;
}) => void;

/**
 * Check if WebGPU is available in this browser.
 */
export function isWebGPUSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return "gpu" in navigator;
}

/**
 * Load the best available model. Tries each tier in order.
 * Returns the loaded model info or throws if all tiers fail.
 */
export async function loadBestModel(
  onProgress?: ProgressCallback
): Promise<{ id: string; name: string; sizeLabel: string }> {
  // Dynamic import to avoid SSR issues
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

  for (const tier of MODEL_TIERS) {
    try {
      onProgress?.({
        status: "downloading",
        progress: 0,
        text: `Downloading ${tier.name} (${tier.sizeLabel})...`,
      });

      engine = await CreateMLCEngine(tier.id, {
        initProgressCallback: (report) => {
          const pct = Math.round((report.progress ?? 0) * 100);
          onProgress?.({
            status: report.progress === 1 ? "loading" : "downloading",
            progress: pct,
            text: report.text,
          });
        },
      });

      loadedModelId = tier.id;
      onProgress?.({
        status: "ready",
        progress: 100,
        text: `${tier.name} ready`,
      });

      return { ...tier };
    } catch (err) {
      console.warn(`[webllm] Failed to load ${tier.name}:`, err);
      engine = null;
      // Continue to next tier
    }
  }

  onProgress?.({
    status: "error",
    progress: 0,
    text: "Failed to load any model. Your device may not have enough memory.",
  });
  throw new Error("All model tiers failed to load");
}

/**
 * Run inference with the loaded model.
 * Returns the complete response text.
 */
export async function chat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    temperature?: number;
    max_tokens?: number;
    onToken?: (token: string) => void;
  }
): Promise<string> {
  if (!engine) throw new Error("No model loaded. Call loadBestModel() first.");

  if (options?.onToken) {
    // Streaming mode
    const chunks = await engine.chat.completions.create({
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      stream: true,
    });

    let result = "";
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        result += delta;
        options.onToken(delta);
      }
    }
    return result;
  } else {
    // Non-streaming mode
    const response = await engine.chat.completions.create({
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1024,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}

/**
 * Get the currently loaded model ID.
 */
export function getLoadedModel(): string | null {
  return loadedModelId;
}

/**
 * Delete the cached model from IndexedDB and unload the engine.
 */
export async function deleteModel(): Promise<void> {
  if (engine) {
    engine.unload();
    engine = null;
  }
  loadedModelId = null;

  // Clear IndexedDB caches used by WebLLM
  if (typeof indexedDB !== "undefined") {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name && (db.name.includes("mlc") || db.name.includes("webllm"))) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  }
}
