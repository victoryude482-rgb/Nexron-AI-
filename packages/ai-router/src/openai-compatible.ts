import { ProviderError } from "@nexron/shared";
import type { ModelDescriptor, ProviderRequest, ProviderResponse } from "@nexron/shared";
import type { ModelProvider } from "./router.js";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export interface OpenAICompatibleOptions {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly headers?: Record<string, string>;
  readonly descriptor: ModelDescriptor;
  readonly fetchImpl?: typeof fetch;
}

export class OpenAICompatibleProvider implements ModelProvider {
  readonly descriptor: ModelDescriptor;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAICompatibleOptions) {
    this.descriptor = options.descriptor;
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.headers = options.headers ?? {};
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async complete(request: ProviderRequest, signal?: AbortSignal): Promise<ProviderResponse> {
    const headers: Record<string, string> = { "content-type": "application/json", ...this.headers };
    if (this.apiKey) headers.authorization = "Bearer " + this.apiKey;

    const response = await this.fetchImpl(this.baseUrl + "/chat/completions", {
      method: "POST", headers,
      body: JSON.stringify({ model: request.model.id, messages: request.messages, temperature: request.temperature, stream: false }),
      signal,
    });
    const raw = await response.text();
    if (!response.ok) throw new ProviderError("Provider returned HTTP " + response.status + ": " + raw.slice(0, 500));

    let data: ChatCompletionResponse;
    try { data = JSON.parse(raw) as ChatCompletionResponse; }
    catch (error) { throw new ProviderError("Provider returned invalid JSON.", error); }

    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new ProviderError("Provider returned no assistant content.");

    return {
      content, model: data.model ?? request.model.id, provider: request.model.provider,
      usage: data.usage ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens } : undefined,
    };
  }

  async health(signal?: AbortSignal): Promise<boolean> {
    try {
      const response = await this.fetchImpl(this.baseUrl + "/models", {
        method: "GET",
        headers: this.apiKey ? { authorization: "Bearer " + this.apiKey } : this.headers,
        signal,
      });
      return response.ok;
    } catch { return false; }
  }
}
