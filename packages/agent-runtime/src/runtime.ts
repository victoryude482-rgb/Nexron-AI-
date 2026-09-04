import type { AgentTask, Capability, ChatMessage, ProviderResponse, ToolRequest } from "@nexron/shared";
import type { AIRouter } from "@nexron/ai-router";
import { TaskExecutor } from "@nexron/taskmaster";

export interface AgentDefinition {
  readonly id: string;
  readonly name: string;
  readonly capability: Capability;
  readonly systemPrompt: string;
}

export interface AgentContext {
  readonly messages: ChatMessage[];
  readonly signal?: AbortSignal;
}

export interface AgentTaskPlanner {
  plan(input: string, context: AgentContext): Promise<AgentTask[]>;
}

export interface AgentToolBridge {
  execute(request: ToolRequest): Promise<unknown>;
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
  ) {
    this.executor = new TaskExecutor({
      execute: async (task, context) => {
        const messages: ChatMessage[] = [
          { role: "system", content: "You are Nexron agent task " + task.title + "." },
          { role: "user", content: typeof task.input === "string" ? task.input : JSON.stringify(task.input ?? {}) },
        ];
        const result = await this.router.complete(
          { messages, capability: task.capability, stream: false },
          { freeFirst: true, signal: context.signal },
        );
        return { ...task, status: "completed", output: result.content };
      },
    });
  }

  async run(input: string, context: AgentContext = {}): Promise<AgentRunResult> {
    const planned = await this.planner.plan(input, context);
    const tasks = await this.executor.run(planned, { signal: context.signal });
    const last = [...tasks].reverse().find(task => task.status === "completed");
    if (!last) throw new Error("Agent run completed without a successful task.");

    const final = await this.router.complete({
      messages: [
        ...context.messages,
        { role: "user", content: "Original request: " + input },
        { role: "assistant", content: JSON.stringify(tasks) },
        { role: "user", content: "Produce the final concise answer from the completed task outputs." },
      ],
      capability: "chat",
      stream: false,
    }, { freeFirst: true, signal: context.signal });

    return { tasks, response: final };
  }
}
