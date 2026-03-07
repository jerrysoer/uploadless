import type { ModelCapability } from "./registry";

const OLLAMA_BASE = "http://localhost:11434";
const DETECT_TIMEOUT_MS = 2000;
const HEALTH_CHECK_INTERVAL_MS = 30_000;

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface OllamaStatus {
  connected: boolean;
  models: OllamaModel[];
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  sizeLabel: string;
  capabilities: ModelCapability[];
  provider: "ollama";
}

/**
 * Silently probe Ollama at localhost:11434.
 * Returns { connected, models } or { connected: false } on any error.
 */
export async function detectOllama(): Promise<OllamaStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DETECT_TIMEOUT_MS);

    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return { connected: false, models: [] };

    const data = await res.json();
    return {
      connected: true,
      models: (data.models ?? []) as OllamaModel[],
    };
  } catch {
    return { connected: false, models: [] };
  }
}

/**
 * Map Ollama model names to capabilities using heuristics.
 * Inspects the model name for known patterns (codellama, llama, mistral, etc.)
 */
function inferCapabilities(modelName: string): ModelCapability[] {
  const name = modelName.toLowerCase();

  // Base capabilities all models get
  const base: ModelCapability[] = [
    "classification",
    "sentiment",
    "keywords",
    "rewrite",
    "summarize_short",
    "summarize_medium",
  ];

  // Most Ollama models are large enough for structured tasks
  const structured: ModelCapability[] = [
    ...base,
    "audit_explain",
    "json_explain",
    "regex_explain",
    "email_compose",
    "social_post",
    "extract_json",
    "receipt_parse",
    "contract_analyze",
    "privacy_policy",
    "meeting_minutes",
    "translate",
    "job_analyze",
  ];

  // Code-focused models
  if (
    name.includes("code") ||
    name.includes("coder") ||
    name.includes("deepseek-coder") ||
    name.includes("starcoder")
  ) {
    return [
      ...structured,
      "commit_message",
      "code_review",
      "code_explain",
      "sql_generate",
      "test_generate",
      "error_decode",
      "pr_description",
      "readme_generate",
    ];
  }

  // Reasoning-focused models
  if (
    name.includes("qwq") ||
    name.includes("deepseek-r1") ||
    name.includes("phi")
  ) {
    return [...structured, "swot", "threat_model"];
  }

  // Large general-purpose models (7B+) get everything
  if (
    name.includes("70b") ||
    name.includes("34b") ||
    name.includes("13b") ||
    name.includes("8b") ||
    name.includes("7b")
  ) {
    return [
      ...structured,
      "commit_message",
      "code_review",
      "code_explain",
      "sql_generate",
      "test_generate",
      "error_decode",
      "pr_description",
      "readme_generate",
      "swot",
      "threat_model",
      "long_doc",
      "full_review",
      "tech_writing",
    ];
  }

  return structured;
}

/**
 * List Ollama models with capability heuristics.
 */
export async function ollamaListModels(): Promise<OllamaModelInfo[]> {
  const status = await detectOllama();
  if (!status.connected) return [];

  return status.models.map((m) => ({
    name: m.name,
    size: m.size,
    sizeLabel: `${Math.round((m.size / 1e9) * 10) / 10} GB`,
    capabilities: inferCapabilities(m.name),
    provider: "ollama" as const,
  }));
}

/**
 * Start a periodic health check loop for Ollama connectivity.
 * Returns a cleanup function that stops the interval.
 */
export function startOllamaHealthCheck(
  onStatusChange: (status: OllamaStatus) => void,
): () => void {
  const controller = new AbortController();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function check() {
    if (controller.signal.aborted) return;
    const status = await detectOllama();
    if (!controller.signal.aborted) {
      onStatusChange(status);
    }
  }

  intervalId = setInterval(check, HEALTH_CHECK_INTERVAL_MS);

  return () => {
    controller.abort();
    if (intervalId) clearInterval(intervalId);
  };
}

/**
 * Stream text from Ollama /api/generate endpoint.
 * Returns the complete response text. Calls onToken for each chunk.
 */
export async function ollamaGenerate(
  model: string,
  prompt: string,
  options?: { system?: string; onToken?: (token: string) => void },
): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        system: options?.system,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            result += parsed.response;
            options?.onToken?.(parsed.response);
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Stream chat from Ollama /api/chat endpoint.
 * Returns the complete assistant message. Calls onToken for each chunk.
 */
export async function ollamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  onToken?: (token: string) => void,
): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            result += parsed.message.content;
            onToken?.(parsed.message.content);
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    return result;
  } catch {
    return null;
  }
}
