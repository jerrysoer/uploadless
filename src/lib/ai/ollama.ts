const OLLAMA_BASE = "http://localhost:11434";
const DETECT_TIMEOUT_MS = 2000;

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface OllamaStatus {
  connected: boolean;
  models: OllamaModel[];
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
 * Stream text from Ollama /api/generate endpoint.
 * Returns the complete response text. Calls onToken for each chunk.
 */
export async function ollamaGenerate(
  model: string,
  prompt: string,
  options?: { system?: string; onToken?: (token: string) => void }
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
      // Ollama sends newline-delimited JSON
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
  onToken?: (token: string) => void
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
