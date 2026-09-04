import type { Capability, ModelDescriptor } from "@nexron/shared";
import { OpenAICompatibleProvider } from "./openai-compatible.js";
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

export function providerFromEnv(prefix: string, env: Record<string, string | undefined>): ModelProvider | null {
  const baseUrl = env[prefix + "_BASE_URL"];
  const model = env[prefix + "_MODEL"];
  if (!baseUrl || !model) return null;
  const descriptor: ModelDescriptor = {
    id: model, provider: env[prefix + "_NAME"] ?? prefix.toLowerCase(),
    capabilities: csv(env[prefix + "_CAPABILITIES"]),
    contextWindow: env[prefix + "_CONTEXT_WINDOW"] ? Number(env[prefix + "_CONTEXT_WINDOW"]) : undefined,
    free: env[prefix + "_FREE"] === "true", enabled: env[prefix + "_ENABLED"] !== "false",
  };
  return new OpenAICompatibleProvider({ baseUrl, apiKey: env[prefix + "_API_KEY"], descriptor });
}

export function providersFromEnv(env: Record<string, string | undefined>): ModelProvider[] {
  const prefixes = (env.NEXRON_PROVIDER_PREFIXES ?? "GROQ,GEMINI,OPENROUTER,LOCALAI,GITHUB_MODELS")
    .split(",").map(x => x.trim()).filter(Boolean);
  return prefixes.flatMap(prefix => {
    const provider = providerFromEnv(prefix, env);
    return provider ? [provider] : [];
  });
}
