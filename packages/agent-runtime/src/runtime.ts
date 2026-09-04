import type { AgentTask, Capability, ChatMessage, ProviderResponse, ToolRequest } from "@nexron/shared";
import type { AIRouter } from "@nexron/ai-router";
import { TaskExecutor } from "@nexron/taskmaster";
import { BUILTIN_AGENTS } from "./specialists.js";
import { CapabilityDispatcher } from "./dispatcher.js";

export interface AgentDefinition {
  readonly id: string;
  readonly name: string;
  readonly capability: Capability;
  readonly systemPrompt: string;
}

export interface AgentContext {
  readonly messages?: ChatMessage[];
  readonly signal?: AbortSignal;
}

export interface AgentTaskPlanner {
  plan(input: string, context: AgentContext): Promise<AgentTask[]>;
}

export interface AgentToolBridge {
  execute(request: ToolRequest, signal?: AbortSignal): Promise<unknown>;
}

export interface AgentRunResult {
  readonly tasks: AgentTask[];
  readonly response: ProviderResponse;
}

export class AgentRuntime {
  private readonly executor: TaskExecutor;

  constructor(
    private readonly router: AIRouter,
    private readonly planner: AgentTaskPlanner,
    private readonly tools?: AgentToolBridge,
    private readonly specialists: readonly AgentDefinition[] = BUILTIN_AGENTS,
  ) {
    const dispatcher = new CapabilityDispatcher({
      specialists,
      specialistExecutor: {
        execute: async (task, agent, signal) => {
          const messages: ChatMessage[] = [
            { role: "system", content: agent.systemPrompt },
            { role: "user", content: typeof task.input === "string" ? task.input : JSON.stringify(task.input ?? {}) },
          ];
          const result = await this.router.complete(
            { messages, capability: task.capability, stream: false },
            { freeFirst: true, signal },
          );
          return { ...task, status: "completed", output: result.content };
        },
      },
      toolExecutor: tools ? {
        execute: async (task, request, signal) => {
          const output = await tools.execute(request, signal);
          return { ...task, status: "completed", output };
        },
      } : undefined,
    });

    this.executor = new TaskExecutor({
      execute: (task, context) => dispatcher.execute(task, context.signal),
    });
  }

  async run(input: string, context: AgentContext = {}): Promise<AgentRunResult> {
    const planned = await this.planner.plan(input, context);
    const tasks = await this.executor.run(planned, { signal: context.signal });
    const completed = tasks.filter(task => task.status === "completed");
    if (!completed.length) throw new Error("Agent run completed without a successful task.");

    const final = await this.router.complete({
      messages: [
        ...(context.messages ?? []),
        { role: "user", content: "Original request: " + input },
        { role: "assistant", content: JSON.stringify(completed.map(task => ({ id: task.id, title: task.title, output: task.output }))) },
        { role: "user", content: "Synthesize the completed task outputs into the final answer." },
      ],
      capability: "chat",
      stream: false,
    }, { freeFirst: true, signal: context.signal });

    return { tasks, response: final };
  }
}
