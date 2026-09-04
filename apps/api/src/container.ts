import { AIRouter, providersFromEnv } from "@nexron/ai-router";
import { AgentRuntime, LLMTaskPlanner } from "@nexron/agent-runtime";
import { conversationStoreFromEnv, memoryStoreFromEnv, type ConversationStore } from "@nexron/memory";
import { ProviderBackedLeadIntelligence, LeadHttpProvider } from "@nexron/lead-intelligence";
let runtime:AgentRuntime|undefined;let conversations:ConversationStore|undefined;
function leadService(){const endpoint=process.env.LEADPILOT_URL?.trim();const providers=endpoint?[new LeadHttpProvider({name:"leadpilot",endpoint,apiKey:process.env.LEADPILOT_API_KEY})]:[];return new ProviderBackedLeadIntelligence(providers);}
export function getRuntime(){if(runtime)return runtime;const router=new AIRouter(providersFromEnv(process.env));runtime=new AgentRuntime(router,new LLMTaskPlanner(router),undefined,undefined,leadService(),memoryStoreFromEnv(process.env));return runtime;}
export function getConversationStore(){if(conversations)return conversations;conversations=conversationStoreFromEnv(process.env);return conversations;}