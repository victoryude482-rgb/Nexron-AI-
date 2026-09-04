import type { ToolDefinition, ToolRequest } from "@nexron/shared";

export interface ToolContext { readonly signal?: AbortSignal; }
export interface ToolHandler {
  readonly definition: ToolDefinition;
  execute(input: unknown, context: ToolContext): Promise<unknown>;
}
export interface ApprovalPolicy { isApproved(request: ToolRequest): boolean; }

export class ToolRegistry {
  private readonly handlers = new Map<string, ToolHandler>();
  constructor(private readonly approval?: ApprovalPolicy) {}
  register(handler: ToolHandler): void {
    const name = handler.definition.name.trim();
    if (!name) throw new Error("Tool name cannot be empty.");
    if (this.handlers.has(name)) throw new Error("Tool already registered: " + name);
    this.handlers.set(name, handler);
  }
  unregister(name: string): boolean { return this.handlers.delete(name); }
  list(): readonly ToolDefinition[] { return [...this.handlers.values()].map(h => h.definition); }
  async execute(request: ToolRequest, context: ToolContext = {}): Promise<unknown> {
    if (context.signal?.aborted) throw context.signal.reason;
    const handler = this.handlers.get(request.tool);
    if (!handler) throw new Error("Unknown tool: " + request.tool);
    if (handler.definition.risk === "high" && (!this.approval || !this.approval.isApproved(request))) {
      throw new Error("Approval required for high-risk tool: " + request.tool);
    }
    return handler.execute(request.input, context);
  }
}
