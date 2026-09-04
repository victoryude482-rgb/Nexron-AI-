import type { ToolDefinition, ToolRequest } from "@nexron/shared";
import { ToolRegistry, type ToolHandler } from "./registry.js";

export interface MCPServerLike {
  listTools():Promise<ToolDefinition[]>;
  callTool(name:string,input:unknown,signal?:AbortSignal):Promise<unknown>;
}

export class MCPToolAdapter implements ToolHandler {
  constructor(readonly definition:ToolDefinition, private readonly server:MCPServerLike){}
  async execute(input:unknown,context:{signal?:AbortSignal}){return this.server.callTool(this.definition.name,input,context.signal);}
}

export async function registerMCPServer(registry:ToolRegistry,server:MCPServerLike){
 for(const definition of await server.listTools()) registry.register(new MCPToolAdapter(definition,server));
}