import type { AgentTask, Capability, ToolRequest } from "@nexron/shared";
import type { AgentDefinition } from "./runtime.js";
import { BUILTIN_AGENTS } from "./specialists.js";

export interface SpecialistExecutor {
  execute(task: AgentTask, agent: AgentDefinition, signal?: AbortSignal): Promise<AgentTask>;
}

export interface ToolTaskExecutor {
  execute(task: AgentTask, request: ToolRequest, signal?: AbortSignal): Promise<AgentTask>;
}

export interface CapabilityDispatcherOptions {
  readonly specialists?: readonly AgentDefinition[];
  readonly specialistExecutor: SpecialistExecutor;
  readonly toolExecutor?: ToolTaskExecutor;
}

const agentForCapability = (capability: Capability, agents: readonly AgentDefinition[]) =>
  agents.find(agent => agent.capability === capability);

export class CapabilityDispatcher {
  private readonly agents: readonly AgentDefinition[];

  constructor(private readonly options: CapabilityDispatcherOptions) {
    this.agents = options.specialists ?? BUILTIN_AGENTS;
  }

  async execute(task: AgentTask, signal?: AbortSignal): Promise<AgentTask> {
    if (signal?.aborted) throw signal.reason;

    if (task.capability === "tool_use" && this.options.toolExecutor) {
      const input = task.input as Partial<ToolRequest> | undefined;
      if (!input?.tool) throw new Error("Tool task requires a tool name.");
      return this.options.toolExecutor.execute(task, {
        tool: input.tool,
        input: input.input,
        approvalRequired: input.approvalRequired === true,
      }, signal);
    }

    const agent = agentForCapability(task.capability, this.agents);
    if (!agent) throw new Error("No specialist agent supports capability: " + task.capability);
    return this.options.specialistExecutor.execute(task, agent, signal);
  }
}
