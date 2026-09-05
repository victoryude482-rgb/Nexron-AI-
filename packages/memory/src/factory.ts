import { createClient } from "@supabase/supabase-js";
import type { ConversationStore } from "./conversation.js";
import type { MemoryStore } from "./store.js";
import { InMemoryConversationStore } from "./conversation.js";
import { InMemoryStore } from "./store.js";
import { SupabaseConversationStore } from "./supabase-store.js";
import { SupabaseMemoryStore } from "./supabase-memory.js";
export function conversationStoreFromEnv(env:Record<string,string|undefined>=process.env):ConversationStore{const url=env.SUPABASE_URL?.trim();const key=env.SUPABASE_SERVICE_ROLE_KEY?.trim();if(url&&key)return new SupabaseConversationStore(createClient(url,key));return new InMemoryConversationStore();}
export function memoryStoreFromEnv(env:Record<string,string|undefined>=process.env):MemoryStore{const url=env.SUPABASE_URL?.trim();const key=env.SUPABASE_SERVICE_ROLE_KEY?.trim();if(url&&key)return new SupabaseMemoryStore(createClient(url,key));return new InMemoryStore();}
