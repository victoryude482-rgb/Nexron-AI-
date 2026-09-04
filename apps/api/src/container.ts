import { AIRouter, providersFromEnv } from "@nexron/ai-router";
import { AgentRuntime, LLMTaskPlanner } from "@nexron/agent-runtime";
import { conversationStoreFromEnv, type ConversationStore } from "@nexron/memory";

let runtime:AgentRuntime|undefined;let conversations:ConversationStore|undefined;
export function getRuntime(){if(runtime)return runtime;const router=new AIRouter(providersFromEnv(process.env));runtime=new AgentRuntime(router,new LLMTaskPlanner(router));return runtime;}
export function getConversationStore(){if(conversations)return conversations;conversations=conversationStoreFromEnv(process.env);return conversations;}