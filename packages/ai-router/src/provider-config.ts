import type { Capability, ModelDescriptor } from "@nexron/shared";
import { OpenAICompatibleProvider } from "./openai-compatible.js";
import { XKiroProvider } from "./xkiro-provider.js";
import { CognexaProvider } from "./cognexa-provider.js";
import type { ModelProvider } from "./router.js";

export interface ProviderConfig {
  readonly name: string;
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly model: string;
  readonly capabilities: Capability[];
  readonly free?: boolean;
  readonly contextWindow?: number;
  readonly enabled?: boolean;
}

const csv = (value: string | undefined): Capability[] =>
  (value ?? "chat").split(",").map(x => x.trim()).filter(Boolean) as Capability[];

// NOTE: XKIRO and COGNEXA are custom/self-hosted adapters with no public
// default endpoint. A previous default silently pointed XKIRO at
// "https://api.xkiro.com/v1" - a host that does not correspond to any known
// public AI API. Every request against it failed, which surfaced to users as
// the router's generic "All compatible AI providers failed." error. Both now
// require an explicit *_BASE_URL to be configured before they are used.
export function providerFromEnv(prefix: string, env: Record<string, string | undefined>): ModelProvider | null {
  const baseUrl = env[prefix + "_BASE_URL"];
  const model = env[prefix + "_MODEL"];
  if (!baseUrl || !model) return null;
  if (prefix === "COGNEXA") return new CognexaProvider({ baseUrl, descriptor: { id: model, provider: env[prefix + "_NAME"] ?? "cognexa", capabilities: csv(env[prefix + "_CAPABILITIES"]), contextWindow: env[prefix + "_CONTEXT_WINDOW"] ? Number(env[prefix + "_CONTEXT_WINDOW"]) : undefined, free: true, enabled: env[prefix + "_ENABLED"] !== "false" } });
  const descriptor: ModelDescriptor = {
    id: model, provider: env[prefix + "_NAME"] ?? prefix.toLowerCase(),
    capabilities: csv(env[prefix + "_CAPABILITIES"]),
    contextWindow: env[prefix + "_CONTEXT_WINDOW"] ? Number(env[prefix + "_CONTEXT_WINDOW"]) : undefined,
    free: env[prefix + "_FREE"] === "true", enabled: env[prefix + "_ENABLED"] !== "false",
  };
  const options = { baseUrl, apiKey: env[prefix + "_API_KEY"], descriptor };
  return prefix === "XKIRO"
    ? new XKiroProvider(options)
    : new OpenAICompatibleProvider(options);
}

// Default prefixes are limited to providers with real, documented,
// OpenAI-compatible (or compatibility-shimmed) public endpoints:
// - GROQ:          https://api.groq.com/openai/v1 (free tier)
// - GEMINI:        https://generativelanguage.googleapis.com/v1beta/openai/
//                  (Google's OpenAI-compatibility endpoint - the raw Gemini
//                  API is NOT chat-completions-compatible)
// - OPENROUTER:    https://openrouter.ai/api/v1 (free + paid models)
// - GITHUB_MODELS: https://models.inference.ai.azure.com (free with a GitHub token)
// XKIRO / COGNEXA / LOCALAI remain available but must be opted into
// explicitly via NEXRON_PROVIDER_PREFIXES since they require a self-hosted
// or custom endpoint that has no safe public default.
export function providersFromEnv(env: Record<string, string | undefined>): ModelProvider[] {
  const prefixes = (env.NEXRON_PROVIDER_PREFIXES ?? "GROQ,GEMINI,OPENROUTER,GITHUB_MODELS")
    .split(",").map(x => x.trim()).filter(Boolean);
  return prefixes.flatMap(prefix => {
    const provider = providerFromEnv(prefix, env);
    return provider ? [provider] : [];
  });
}
