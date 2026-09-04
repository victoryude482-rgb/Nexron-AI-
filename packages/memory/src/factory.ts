import { createClient } from "@supabase/supabase-js";
import type { ConversationStore } from "./conversation.js";
import { InMemoryConversationStore } from "./conversation.js";
import { SupabaseConversationStore } from "./supabase-store.js";

export function conversationStoreFromEnv(env:Record<string,string|undefined>=process.env):ConversationStore{
 const url=env.SUPABASE_URL?.trim();const key=env.SUPABASE_SERVICE_ROLE_KEY?.trim()||env.SUPABASE_ANON_KEY?.trim();
 if(url&&key)return new SupabaseConversationStore(createClient(url,key));
 return new InMemoryConversationStore();
}