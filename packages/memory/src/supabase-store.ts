import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, ConversationStore } from "./conversation.js";

export class SupabaseConversationStore implements ConversationStore {
  constructor(private readonly client: SupabaseClient, private readonly table="conversations") {}
  async get(id:string,userId:string){
    const {data,error}=await this.client.from(this.table).select("*").eq("id",id).eq("user_id",userId).maybeSingle();
    if(error) throw error;
    return data ? {id:data.id,userId:data.user_id,title:data.title,messages:data.messages??[],createdAt:data.created_at,updatedAt:data.updated_at} : null;
  }
  async list(userId:string){
    const {data,error}=await this.client.from(this.table).select("*").eq("user_id",userId).order("updated_at",{ascending:false});
    if(error) throw error;
    return (data??[]).map(row=>({id:row.id,userId:row.user_id,title:row.title,messages:row.messages??[],createdAt:row.created_at,updatedAt:row.updated_at}));
  }
  async upsert(c:Conversation){
    const {error}=await this.client.from(this.table).upsert({id:c.id,user_id:c.userId,title:c.title,messages:c.messages,created_at:c.createdAt,updated_at:c.updatedAt});
    if(error) throw error;
  }
  async delete(id:string,userId:string){
    const {data,error}=await this.client.from(this.table).delete().eq("id",id).eq("user_id",userId).select("id");
    if(error) throw error;
    return Array.isArray(data)&&data.length>0;
  }
}