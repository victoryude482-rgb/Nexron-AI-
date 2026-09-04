import { ProviderError } from "@nexron/shared";
import type { Capability, ModelDescriptor, ProviderRequest, ProviderResponse } from "@nexron/shared";
import { CircuitBreaker } from "./circuit-breaker.js";
import { withRetry } from "./retry.js";

export interface ModelProvider {
  readonly descriptor: ModelDescriptor;
  complete(request: ProviderRequest, signal?: AbortSignal): Promise<ProviderResponse>;
  health?(signal?: AbortSignal): Promise<boolean>;
}

export interface RoutingPolicy {
  readonly freeFirst?: boolean;
  readonly preferredProviders?: readonly string[];
  readonly maxAttempts?: number;
  readonly signal?: AbortSignal;
}

interface ManagedProvider {
  readonly provider: ModelProvider;
  readonly breaker: CircuitBreaker;
}

export class AIRouter {
  private readonly providers: ManagedProvider[];

  constructor(providers: readonly ModelProvider[]) {
    this.providers = providers.map(provider => ({ provider, breaker: new CircuitBreaker() }));
  }

  async complete(
    request: Omit<ProviderRequest, "model"> & { capability?: Capability },
    policy: RoutingPolicy = {},
  ): Promise<ProviderResponse> {
    const candidates = this.providers
      .filter(({ provider }) => provider.descriptor.enabled !== false)
      .filter(({ provider }) => !request.capability || provider.descriptor.capabilities.includes(request.capability))
      .filter(({ breaker }) => breaker.canRequest())
      .sort((a, b) => this.score(b.provider.descriptor, policy) - this.score(a.provider.descriptor, policy))
      .slice(0, policy.maxAttempts ?? this.providers.length);

    if (!candidates.length) throw new ProviderError("No compatible healthy AI provider is configured.");

    let lastError: unknown;
    for (const { provider, breaker } of candidates) {
      try {
        if (provider.health && !(await provider.health(policy.signal))) { breaker.failure(); continue; }
        const response = await withRetry(
          () => provider.complete({ ...request, model: provider.descriptor }, policy.signal),
          undefined,
          policy.signal,
        );
        breaker.success();
        return response;
      } catch (error) {
        breaker.failure();
        lastError = error;
      }
    }
    throw new ProviderError("All compatible AI providers failed.", lastError);
  }

  private score(model: ModelDescriptor, policy: RoutingPolicy): number {
    let score = model.free && policy.freeFirst !== false ? 100 : 0;
    const index = (policy.preferredProviders ?? []).indexOf(model.provider);
    if (index >= 0) score += 50 - index;
    return score;
  }
}
