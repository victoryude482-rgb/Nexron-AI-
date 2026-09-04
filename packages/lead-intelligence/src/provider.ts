import type { Capability, AgentTask } from "@nexron/shared";

export interface LeadRecord {
  readonly id: string;
  readonly name: string;
  readonly website?: string;
  readonly location?: string;
  readonly score?: number;
  readonly source: string;
}

export interface LeadSearchRequest {
  readonly query: string;
  readonly limit?: number;
}

export interface LeadProvider {
  readonly name: string;
  readonly capability: Capability;
  search(request: LeadSearchRequest, signal?: AbortSignal): Promise<LeadRecord[]>;
}

export interface LeadIntelligenceService {
  search(request: LeadSearchRequest, signal?: AbortSignal): Promise<LeadRecord[]>;
}

export class ProviderBackedLeadIntelligence implements LeadIntelligenceService {
  constructor(private readonly providers: readonly LeadProvider[]) {}

  async search(request: LeadSearchRequest, signal?: AbortSignal): Promise<LeadRecord[]> {
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.search(request, signal)),
    );
    const records = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
    const seen = new Set<string>();
    return records
      .filter(record => {
        const key = record.website?.toLowerCase() || record.name.toLowerCase() + "|" + (record.location ?? "").toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, request.limit ?? 50);
  }
}

export function leadTask(query: string, limit = 20): AgentTask {
  return {
    id: "lead-search",
    title: "Find and rank business leads",
    capability: "lead_intelligence",
    dependsOn: [],
    status: "pending",
    input: { query, limit },
  };
}
