import { AIRouter, providersFromEnv } from "@nexron/ai-router";
import { AgentRuntime, LLMTaskPlanner } from "@nexron/agent-runtime";

let runtime: AgentRuntime | undefined;

export function getRuntime(): AgentRuntime {
  if (runtime) return runtime;
  const router = new AIRouter(providersFromEnv(process.env));
  runtime = new AgentRuntime(router, new LLMTaskPlanner(router));
  return runtime;
}
