export type Capability = "chat" | "coding" | "research" | "browser" | "vision" | "tool_use" | "lead_intelligence";

export interface ModelDescriptor {
  id: string;
  provider: string;
  capabilities: Capability[];
  contextWindow?: number;
  free?: boolean;
  enabled?: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ProviderRequest {
  model: ModelDescriptor;
  messages: ChatMessage[];
  temperature?: number;
  stream?: boolean;
}

export interface ProviderResponse {
  content: string;
  model: string;
  provider: string;
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface AgentTask {
  id: string;
  title: string;
  dependsOn: string[];
  capability: Capability;
  status: "pending" | "running" | "completed" | "failed" | "blocked";
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  risk: "low" | "medium" | "high";
}

export interface ToolRequest {
  tool: string;
  input: unknown;
  approvalRequired: boolean;
}
