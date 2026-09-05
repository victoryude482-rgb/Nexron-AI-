import type { AIRouter } from "@nexron/ai-router";
import type { ChatMessage, AgentTask } from "@nexron/shared";
import type { AgentContext, AgentTaskPlanner } from "./runtime.js";
import { parseAgentPlan } from "./plan-schema.js";

export class LLMTaskPlanner implements AgentTaskPlanner {
  constructor(private readonly router: AIRouter) {}

  async plan(input: string, context: AgentContext = {}): Promise<AgentTask[]> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: [
          "You are Nexron's task planner.",
          'Return ONLY valid JSON: {"tasks":[{"id":"...","title":"...","capability":"...","dependsOn":[],"input":"..."}]}',
          "Allowed capabilities: chat, coding, research, browser, vision, tool_use, lead_intelligence.",
          "Use 1-12 tasks for normal requests. Keep tasks focused. Dependencies must form a DAG.",
          "Never request secrets, credentials, unrestricted shell access, or unsafe actions.",
        ].join("\n"),
      },
      ...(context.messages ?? []),
      { role: "user", content: input },
    ];

    const response = await this.router.complete(
      { messages, capability: "chat", stream: false },
      { freeFirst: true, signal: context.signal },
    );

    let value: unknown;
    try {
      value = JSON.parse(response.content);
    } catch (error) {
      throw new Error("Planner model did not return valid JSON.", { cause: error });
    }

    return parseAgentPlan(value);
  }
}
