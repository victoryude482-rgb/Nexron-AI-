import type { AgentDefinition, AgentTaskPlanner } from "./runtime.js";
import type { AgentTask, Capability } from "@nexron/shared";

export const BUILTIN_AGENTS: readonly AgentDefinition[] = [
  { id: "general", name: "General", capability: "chat", systemPrompt: "General-purpose Nexron assistant." },
  { id: "researcher", name: "Researcher", capability: "research", systemPrompt: "Research, compare and synthesize evidence." },
  { id: "coder", name: "Coder", capability: "coding", systemPrompt: "Design, implement, debug and review software." },
  { id: "browser", name: "Browser Agent", capability: "browser", systemPrompt: "Navigate and inspect web resources through approved browser tools." },
  { id: "lead-finder", name: "Lead Finder", capability: "lead_intelligence", systemPrompt: "Discover, enrich and rank business leads." },
  { id: "trend-finder", name: "Trend Finder", capability: "research", systemPrompt: "Find current signals and emerging trends." },
  { id: "opportunity-finder", name: "Opportunity Finder", capability: "research", systemPrompt: "Identify actionable market opportunities." },
  { id: "reviewer", name: "Reviewer", capability: "chat", systemPrompt: "Critically review outputs for correctness and completeness." },
  { id: "tester", name: "Tester", capability: "coding", systemPrompt: "Create verification plans and identify regressions." },
];

const capabilityFor = (input: string): Capability => {
  const value = input.toLowerCase();
  if (/\b(code|coding|program|debug|bug|repository|github|typescript|python)\b/.test(value)) return "coding";
  if (/\b(lead|leads|businesses|prospects|customers)\b/.test(value)) return "lead_intelligence";
  if (/\b(browser|website|web page|navigate|click)\b/.test(value)) return "browser";
  if (/\b(research|compare|latest|trend|market|sources)\b/.test(value)) return "research";
  return "chat";
};

export class HeuristicTaskPlanner implements AgentTaskPlanner {
  async plan(input: string): Promise<AgentTask[]> {
    const capability = capabilityFor(input);
    const primary: AgentTask = {
      id: "primary",
      title: BUILTIN_AGENTS.find(agent => agent.capability === capability)?.name ?? "General",
      capability,
      dependsOn: [],
      status: "pending",
      input,
    };

    if (capability === "coding") {
      return [
        primary,
        { id: "review", title: "Review implementation", capability: "coding", dependsOn: ["primary"], status: "pending", input: "Review the primary coding result." },
      ];
    }

    return [primary];
  }
}
