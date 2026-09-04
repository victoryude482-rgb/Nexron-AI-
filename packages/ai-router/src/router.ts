import type { Capability, ModelDescriptor, ProviderRequest, ProviderResponse } from "@nexron/shared";

export interface ModelProvider {
  descriptor: ModelDescriptor;
  complete(request: ProviderRequest): Promise<ProviderResponse>;
  health?(): Promise<boolean>;
}

export interface RoutingPolicy {
  freeFirst?: boolean;
  preferredProviders?: string[];
  maxAttempts?: number;
}

export class AIRouter {
  constructor(private readonly providers: ModelProvider[]) {}

  async complete(
    request: Omit<ProviderRequest, "model"> & { capability?: Capability },
    policy: RoutingPolicy = {},
  ): Promise<ProviderResponse> {
    const candidates = this.providers
      .filter(p => p.descriptor.enabled !== false)
      .filter(p => !request.capability || p.descriptor.capabilities.includes(request.capability))
      .sort((a, b) => this.score(b.descriptor, policy) - this.score(a.descriptor, policy))
      .slice(0, policy.maxAttempts ?? this.providers.length);

    if (!candidates.length) throw new Error("No compatible AI provider is configured.");

    let lastError: unknown;
    for (const provider of candidates) {
      try {
        if (provider.health && !(await provider.health())) continue;
        return await provider.complete({ ...request, model: provider.descriptor });
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error(`All compatible AI providers failed: ${String(lastError ?? "unknown error")}`);
  }

  private score(model: ModelDescriptor, policy: RoutingPolicy): number {
    let score = model.free && policy.freeFirst !== false ? 100 : 0;
    const preferred = policy.preferredProviders ?? [];
    const index = preferred.indexOf(model.provider);
    if (index >= 0) score += 50 - index;
    return score;
  }
}