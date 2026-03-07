import type { MLCEngine } from "@mlc-ai/web-llm";
import type { AIStatus } from "./types";
import { MODEL_PACKS, getPackByModelId } from "./registry";
import type { ModelSlug } from "./registry";

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
 * Load a specific model by its WebLLM model ID.
 * If the same model is already loaded, this is a no-op.
 */
export async function loadModel(
  modelId: string,
  onProgress?: ProgressCallback,
): Promise<{ id: string; name: string; sizeLabel: string }> {
  // Already loaded — no-op
  if (engine && loadedModelId === modelId) {
    const pack = getPackByModelId(modelId);
    return {
      id: modelId,
      name: pack?.name ?? modelId,
      sizeLabel: pack?.sizeLabel ?? "",
    };
  }

  // Switching models — unload first
  if (engine && loadedModelId !== modelId) {
    engine.unload();
    engine = null;
    loadedModelId = null;
  }

  const pack = getPackByModelId(modelId);
  const label = pack?.name ?? modelId;
  const sizeLabel = pack?.sizeLabel ?? "";

  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

  onProgress?.({
    status: "downloading",
    progress: 0,
    text: `Downloading ${label} (${sizeLabel})...`,
  });

  engine = await CreateMLCEngine(modelId, {
    initProgressCallback: (report) => {
      const pct = Math.round((report.progress ?? 0) * 100);
      onProgress?.({
        status: report.progress === 1 ? "loading" : "downloading",
        progress: pct,
        text: report.text,
      });
    },
  });

  loadedModelId = modelId;
  onProgress?.({
    status: "ready",
    progress: 100,
    text: `${label} ready`,
  });

  return { id: modelId, name: label, sizeLabel };
}

/**
 * Legacy: load the best available model using auto-fallback.
 * Tries each tier in order (largest → smallest).
 * @deprecated Use loadModel() with a specific model ID instead.
 */
export async function loadBestModel(
  onProgress?: ProgressCallback,
): Promise<{ id: string; name: string; sizeLabel: string }> {
  const fallbackOrder = [
    "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
  ];

  for (const modelId of fallbackOrder) {
    try {
      return await loadModel(modelId, onProgress);
    } catch (err) {
      console.warn(`[webllm] Failed to load ${modelId}:`, err);
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
 * Switch to a different model. Unloads current engine and loads the new one.
 */
export async function switchModel(
  modelId: string,
  onProgress?: ProgressCallback,
): Promise<{ id: string; name: string; sizeLabel: string }> {
  if (engine) {
    engine.unload();
    engine = null;
    loadedModelId = null;
  }
  return loadModel(modelId, onProgress);
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
  },
): Promise<string> {
  if (!engine) throw new Error("No model loaded. Call loadModel() first.");

  if (options?.onToken) {
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
 * Probe IndexedDB for cached WebLLM model IDs.
 * Returns slugs of models that have been downloaded.
 */
export async function getDownloadedModels(): Promise<ModelSlug[]> {
  if (typeof indexedDB === "undefined") return [];

  try {
    const dbs = await indexedDB.databases();
    const dbNames = dbs.map((db) => db.name ?? "");
    const downloaded: ModelSlug[] = [];

    for (const pack of MODEL_PACKS) {
      // WebLLM caches model data in IndexedDB with the model ID in the db name
      const isCached = dbNames.some(
        (name) =>
          name.includes(pack.model) ||
          name.includes(pack.model.replace(/-/g, "_")),
      );
      if (isCached) {
        downloaded.push(pack.slug);
      }
    }

    return downloaded;
  } catch {
    return [];
  }
}

/**
 * Delete a specific model from IndexedDB by its WebLLM model ID.
 */
export async function deleteSpecificModel(modelId: string): Promise<void> {
  // Unload if this is the active model
  if (engine && loadedModelId === modelId) {
    engine.unload();
    engine = null;
    loadedModelId = null;
  }

  if (typeof indexedDB === "undefined") return;

  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    if (
      db.name &&
      (db.name.includes(modelId) ||
        db.name.includes(modelId.replace(/-/g, "_")))
    ) {
      indexedDB.deleteDatabase(db.name);
    }
  }
}

/**
 * Delete all cached models from IndexedDB and unload the engine.
 */
export async function deleteModel(): Promise<void> {
  if (engine) {
    engine.unload();
    engine = null;
  }
  loadedModelId = null;

  if (typeof indexedDB !== "undefined") {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name && (db.name.includes("mlc") || db.name.includes("webllm"))) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  }
}

/**
 * Get browser storage estimate (used + available).
 */
export async function getStorageEstimate(): Promise<{
  used: number;
  available: number;
}> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return { used: 0, available: 0 };
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage ?? 0,
      available: estimate.quota ?? 0,
    };
  } catch {
    return { used: 0, available: 0 };
  }
}
