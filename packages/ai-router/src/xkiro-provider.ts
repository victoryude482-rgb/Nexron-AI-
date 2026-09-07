import type { ModelDescriptor } from "@nexron/shared";
import { OpenAICompatibleProvider } from "./openai-compatible.js";

/**
 * xKiro uses an OpenAI-compatible API. Keep this as a named adapter so the
 * router can identify xKiro explicitly without duplicating request/streaming
 * protocol logic.
 */
export interface XKiroProviderOptions {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly descriptor: ModelDescriptor;
  readonly fetchImpl?: typeof fetch;
}

export class XKiroProvider extends OpenAICompatibleProvider {
  constructor(options: XKiroProviderOptions) {
    super(options);
  }
}
