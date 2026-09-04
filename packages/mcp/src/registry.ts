import type { ToolDefinition, ToolRequest } from "@nexron/shared";

export interface ToolHandler {
  definition: ToolDefinition;
  execute(input: unknown): Promise<unknown>;
}

export class ToolRegistry {
  private readonly handlers = new Map<string, ToolHandler>();

  register(handler: ToolHandler): void {
    if (this.handlers.has(handler.definition.name)) throw new Error(`Tool already registered: ${handler.definition.name}`);
    this.handlers.set(handler.definition.name, handler);
  }

  list(): ToolDefinition[] {
    return [...this.handlers.values()].map(h => h.definition);
  }

  async execute(request: ToolRequest): Promise<unknown> {
    const handler = this.handlers.get(request.tool);
    if (!handler) throw new Error(`Unknown tool: ${request.tool}`);
    if (handler.definition.risk === "high" && !request.approvalRequired) {
      throw new Error(`High-risk tool ${request.tool} requires explicit approval.`);
    }
    return handler.execute(request.input);
  }
}