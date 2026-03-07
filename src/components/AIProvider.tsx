"use client";

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type {
  AIContextValue,
  AIProvider as AIProviderType,
  AIStatus,
  ModelInfo,
  InferenceOptions,
} from "@/lib/ai/types";
import type { ModelSlug } from "@/lib/ai/registry";
import { getModelPack, MODEL_PACKS } from "@/lib/ai/registry";

const LS_MODEL_KEY = "bs_ai_model";
const LS_MODEL_CHOSEN_KEY = "bs_ai_model_chosen";

export const AIContext = createContext<AIContextValue | null>(null);

export default function AIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AIStatus>("idle");
  const [provider, setProvider] = useState<AIProviderType | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Model Store state
  const [selectedSlug, setSelectedSlug] = useState<ModelSlug | null>(null);
  const [downloadedSlugs, setDownloadedSlugs] = useState<ModelSlug[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageAvailable, setStorageAvailable] = useState(0);

  const ollamaModelRef = useRef<string | null>(null);
  const ollamaConnectedRef = useRef(false);

  // Refresh storage estimate
  const refreshStorage = useCallback(async () => {
    const { getStorageEstimate } = await import("@/lib/ai/webllm");
    const est = await getStorageEstimate();
    setStorageUsed(est.used);
    setStorageAvailable(est.available);
  }, []);

  // Probe IndexedDB for cached models
  const refreshDownloaded = useCallback(async () => {
    const { getDownloadedModels } = await import("@/lib/ai/webllm");
    const slugs = await getDownloadedModels();
    setDownloadedSlugs(slugs);
  }, []);

  // Check WebGPU support + Ollama + restore saved model on mount
  useEffect(() => {
    const hasWebGPU =
      typeof navigator !== "undefined" && "gpu" in navigator;
    setIsSupported(hasWebGPU);

    // Read saved model selection from localStorage
    const savedSlug = localStorage.getItem(LS_MODEL_KEY) as ModelSlug | null;
    if (savedSlug && MODEL_PACKS.some((p) => p.slug === savedSlug)) {
      setSelectedSlug(savedSlug);
    }

    // Probe downloaded models + storage
    refreshDownloaded();
    refreshStorage();

    // Silently check for Ollama + start health check loop
    let cleanupHealthCheck: (() => void) | null = null;

    import("@/lib/ai/ollama").then(
      ({ detectOllama, startOllamaHealthCheck }) => {
        detectOllama().then((result) => {
          if (result.connected && result.models.length > 0) {
            const bestModel = result.models[0];
            ollamaModelRef.current = bestModel.name;
            ollamaConnectedRef.current = true;
            setProvider("ollama");
            setModel({
              id: bestModel.name,
              name: bestModel.name,
              provider: "ollama",
              sizeLabel: `${Math.round((bestModel.size / 1e9) * 10) / 10} GB`,
            });
            setStatus("ready");
          }
        });

        // 30s periodic health check
        cleanupHealthCheck = startOllamaHealthCheck((ollamaStatus) => {
          const wasConnected = ollamaConnectedRef.current;
          ollamaConnectedRef.current = ollamaStatus.connected;

          if (ollamaStatus.connected && ollamaStatus.models.length > 0) {
            const bestModel = ollamaStatus.models[0];
            ollamaModelRef.current = bestModel.name;

            // Reconnected — restore Ollama if not actively using WebLLM
            if (!wasConnected) {
              setProvider((prev) => {
                if (prev !== "webllm") {
                  setModel({
                    id: bestModel.name,
                    name: bestModel.name,
                    provider: "ollama",
                    sizeLabel: `${Math.round((bestModel.size / 1e9) * 10) / 10} GB`,
                  });
                  setStatus("ready");
                  return "ollama";
                }
                return prev;
              });
            }
          } else if (wasConnected && !ollamaStatus.connected) {
            // Disconnected — fallback to WebLLM if it was the active provider
            ollamaModelRef.current = null;
            setProvider((prev) => {
              if (prev === "ollama") {
                // Try to restore last WebLLM model
                const savedSlug = localStorage.getItem(LS_MODEL_KEY);
                if (savedSlug) {
                  setStatus("idle");
                  setModel(null);
                } else {
                  setStatus("idle");
                  setModel(null);
                }
                return null;
              }
              return prev;
            });
          }
        });
      },
    );

    return () => {
      cleanupHealthCheck?.();
    };
  }, [refreshDownloaded, refreshStorage]);

  // Load the selected (or default) WebLLM model
  const loadModel = useCallback(async () => {
    if (
      status === "ready" ||
      status === "downloading" ||
      status === "loading"
    )
      return;

    setError(null);
    setStatus("checking");

    try {
      const { loadModel: loadWebLLM, isWebGPUSupported } = await import(
        "@/lib/ai/webllm"
      );

      if (!isWebGPUSupported()) {
        setError(
          "WebGPU is not supported in this browser. Try Chrome or Edge.",
        );
        setStatus("error");
        return;
      }

      // Use selected slug or default to "general"
      const slug = selectedSlug ?? "general";
      const pack = getModelPack(slug);
      if (!pack) {
        setError("Unknown model pack selected.");
        setStatus("error");
        return;
      }

      const loaded = await loadWebLLM(pack.model, (p) => {
        setStatus(p.status);
        setProgress(p.progress);
        setProgressText(p.text);
      });

      setProvider("webllm");
      setSelectedSlug(slug);
      setModel({
        id: loaded.id,
        name: loaded.name,
        provider: "webllm",
        sizeLabel: loaded.sizeLabel,
      });

      // Persist selection
      localStorage.setItem(LS_MODEL_KEY, slug);
      localStorage.setItem(LS_MODEL_CHOSEN_KEY, "true");

      // Refresh cached model list + storage
      await Promise.all([refreshDownloaded(), refreshStorage()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load model",
      );
      setStatus("error");
    }
  }, [status, selectedSlug, refreshDownloaded, refreshStorage]);

  // Select and load a specific model pack
  const selectModel = useCallback(
    async (slug: ModelSlug) => {
      const pack = getModelPack(slug);
      if (!pack) return;

      setSelectedSlug(slug);
      localStorage.setItem(LS_MODEL_KEY, slug);
      localStorage.setItem(LS_MODEL_CHOSEN_KEY, "true");

      // If we're currently on WebLLM, switch to the new model
      if (provider === "webllm" || !provider) {
        setError(null);
        setStatus("checking");

        try {
          const { loadModel: loadWebLLM, isWebGPUSupported } = await import(
            "@/lib/ai/webllm"
          );

          if (!isWebGPUSupported()) {
            setError("WebGPU not supported.");
            setStatus("error");
            return;
          }

          const loaded = await loadWebLLM(pack.model, (p) => {
            setStatus(p.status);
            setProgress(p.progress);
            setProgressText(p.text);
          });

          setProvider("webllm");
          setModel({
            id: loaded.id,
            name: loaded.name,
            provider: "webllm",
            sizeLabel: loaded.sizeLabel,
          });

          await Promise.all([refreshDownloaded(), refreshStorage()]);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load model",
          );
          setStatus("error");
        }
      }
    },
    [provider, refreshDownloaded, refreshStorage],
  );

  const deleteModelFn = useCallback(async () => {
    try {
      const { deleteModel: deleteWebLLM } = await import("@/lib/ai/webllm");
      await deleteWebLLM();
    } catch {
      // Ignore cleanup errors
    }
    setModel(null);
    setProvider(ollamaModelRef.current ? "ollama" : null);
    setStatus(ollamaModelRef.current ? "ready" : "idle");
    setProgress(0);
    setProgressText("");
    setSelectedSlug(null);
    setDownloadedSlugs([]);
    localStorage.removeItem(LS_MODEL_KEY);
    localStorage.removeItem(LS_MODEL_CHOSEN_KEY);

    // If Ollama was available, restore it
    if (ollamaModelRef.current) {
      setModel({
        id: ollamaModelRef.current,
        name: ollamaModelRef.current,
        provider: "ollama",
        sizeLabel: "",
      });
    }

    await refreshStorage();
  }, [refreshStorage]);

  const infer = useCallback(
    async (
      prompt: string,
      systemPrompt?: string,
      options?: InferenceOptions,
    ): Promise<string> => {
      if (provider === "ollama" && ollamaModelRef.current) {
        const { ollamaGenerate } = await import("@/lib/ai/ollama");
        const result = await ollamaGenerate(ollamaModelRef.current, prompt, {
          system: systemPrompt,
          onToken: options?.onToken,
        });

        // Ollama failed mid-inference — fallback to WebLLM
        if (result === null) {
          ollamaConnectedRef.current = false;
          ollamaModelRef.current = null;

          // Try WebLLM if available
          const { getLoadedModel, chat } = await import("@/lib/ai/webllm");
          if (getLoadedModel()) {
            const messages: Array<{
              role: "system" | "user" | "assistant";
              content: string;
            }> = [];
            if (systemPrompt)
              messages.push({ role: "system", content: systemPrompt });
            messages.push({ role: "user", content: prompt });
            return chat(messages, {
              temperature: options?.temperature,
              max_tokens: options?.maxTokens,
              onToken: options?.onToken,
            });
          }

          throw new Error(
            "Ollama disconnected and no WebLLM model is loaded.",
          );
        }

        return result;
      }

      const { chat } = await import("@/lib/ai/webllm");
      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [];
      if (systemPrompt)
        messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });

      return chat(messages, {
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        onToken: options?.onToken,
      });
    },
    [provider],
  );

  const streamInfer = useCallback(
    async (
      prompt: string,
      systemPrompt?: string,
      onToken?: (token: string) => void,
      options?: InferenceOptions,
    ): Promise<string> => {
      return infer(prompt, systemPrompt, { ...options, onToken });
    },
    [infer],
  );

  const value: AIContextValue = {
    status,
    provider,
    model,
    isSupported,
    isReady: status === "ready",
    progress,
    progressText,
    error,
    selectedSlug,
    downloadedSlugs,
    storageUsed,
    storageAvailable,
    loadModel,
    deleteModel: deleteModelFn,
    selectModel,
    infer,
    streamInfer,
  };

  return <AIContext value={value}>{children}</AIContext>;
}
