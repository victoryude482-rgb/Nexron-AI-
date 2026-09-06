import { ProviderError } from "@nexron/shared";
import type { ProviderRequest, ProviderResponse, ModelDescriptor } from "@nexron/shared";
import type { ModelProvider } from "./router.js";

export interface CognexaProviderOptions {
  readonly baseUrl: string;
  readonly descriptor: ModelDescriptor;
  readonly fetchImpl?: typeof fetch;
}

export class CognexaProvider implements ModelProvider {
  readonly descriptor: ModelDescriptor;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: CognexaProviderOptions) {
    this.descriptor = options.descriptor;
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async complete(request: ProviderRequest, signal?: AbortSignal): Promise<ProviderResponse> {
    const response = await this.fetchImpl(this.baseUrl + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: request.messages,
        model: request.model.id,
        stream: false,
      }),
      signal,
    });
    const raw = await response.text();
    if (!response.ok) throw new ProviderError("Cognexa returned HTTP " + response.status + ": " + raw.slice(0, 500));
    try {
      const data = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }>; model?: string };
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === "string") return { content, model: data.model ?? request.model.id, provider: request.model.provider };
    } catch {}
    throw new ProviderError("Cognexa returned an invalid or unsupported response.");
  }

  async *stream(request: ProviderRequest, signal?: AbortSignal): AsyncIterable<string> {
    const response = await this.fetchImpl(this.baseUrl + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: request.messages, model: request.model.id, stream: true }),
      signal,
    });
    if (!response.ok) {
      const raw = await response.text();
      throw new ProviderError("Cognexa returned HTTP " + response.status + ": " + raw.slice(0, 500));
    }
    if (!response.body) throw new ProviderError("Cognexa returned no streaming body.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") return;
          try {
            const item = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
            const delta = item.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async health(signal?: AbortSignal): Promise<boolean> {
    try {
      const response = await this.fetchImpl(this.baseUrl + "/api/models", { method: "GET", signal });
      return response.ok;
    } catch {
      return false;
    }
  }
}
