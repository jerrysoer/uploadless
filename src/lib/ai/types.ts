export type AIProvider = "webllm" | "ollama";

export type AIStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "loading"
  | "ready"
  | "error";

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  sizeLabel: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InferenceOptions {
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
}

export interface AIContextValue {
  status: AIStatus;
  provider: AIProvider | null;
  model: ModelInfo | null;
  isSupported: boolean;
  isReady: boolean;
  progress: number;
  progressText: string;
  error: string | null;
  loadModel: () => Promise<void>;
  deleteModel: () => Promise<void>;
  infer: (
    prompt: string,
    systemPrompt?: string,
    options?: InferenceOptions
  ) => Promise<string>;
  streamInfer: (
    prompt: string,
    systemPrompt?: string,
    onToken?: (token: string) => void,
    options?: InferenceOptions
  ) => Promise<string>;
}
