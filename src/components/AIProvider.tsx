"use client";

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { AIContextValue, AIProvider as AIProviderType, AIStatus, ModelInfo, InferenceOptions } from "@/lib/ai/types";

export const AIContext = createContext<AIContextValue | null>(null);

export default function AIProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AIStatus>("idle");
  const [provider, setProvider] = useState<AIProviderType | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ollamaModelRef = useRef<string | null>(null);

  // Check WebGPU support + Ollama on mount
  useEffect(() => {
    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
    setIsSupported(hasWebGPU);

    // Silently check for Ollama
    import("@/lib/ai/ollama").then(({ detectOllama }) => {
      detectOllama().then((result) => {
        if (result.connected && result.models.length > 0) {
          const bestModel = result.models[0];
          ollamaModelRef.current = bestModel.name;
          setProvider("ollama");
          setModel({
            id: bestModel.name,
            name: bestModel.name,
            provider: "ollama",
            sizeLabel: `${Math.round(bestModel.size / 1e9 * 10) / 10} GB`,
          });
          setStatus("ready");
        }
      });
    });
  }, []);

  const loadModel = useCallback(async () => {
    if (status === "ready" || status === "downloading" || status === "loading") return;

    setError(null);
    setStatus("checking");

    try {
      const { loadBestModel, isWebGPUSupported } = await import("@/lib/ai/webllm");

      if (!isWebGPUSupported()) {
        setError("WebGPU is not supported in this browser. Try Chrome or Edge.");
        setStatus("error");
        return;
      }

      const loaded = await loadBestModel((p) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
      setStatus("error");
    }
  }, [status]);

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

    // If Ollama was available, restore it
    if (ollamaModelRef.current) {
      setModel({
        id: ollamaModelRef.current,
        name: ollamaModelRef.current,
        provider: "ollama",
        sizeLabel: "",
      });
    }
  }, []);

  const infer = useCallback(
    async (prompt: string, systemPrompt?: string, options?: InferenceOptions): Promise<string> => {
      if (provider === "ollama" && ollamaModelRef.current) {
        const { ollamaGenerate } = await import("@/lib/ai/ollama");
        const result = await ollamaGenerate(ollamaModelRef.current, prompt, {
          system: systemPrompt,
          onToken: options?.onToken,
        });
        return result ?? "";
      }

      const { chat } = await import("@/lib/ai/webllm");
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });

      return chat(messages, {
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        onToken: options?.onToken,
      });
    },
    [provider]
  );

  const streamInfer = useCallback(
    async (
      prompt: string,
      systemPrompt?: string,
      onToken?: (token: string) => void,
      options?: InferenceOptions
    ): Promise<string> => {
      return infer(prompt, systemPrompt, { ...options, onToken });
    },
    [infer]
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
    loadModel,
    deleteModel: deleteModelFn,
    infer,
    streamInfer,
  };

  return <AIContext value={value}>{children}</AIContext>;
}
