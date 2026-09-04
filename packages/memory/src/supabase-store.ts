import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, ConversationStore } from "./conversation.js";
export class SupabaseConversationStore implements ConversationStore {
 constructor(private readonly client:SupabaseClient,private readonly table="conversations"){}
 private map(row:any):Conversation{return {id:String(row.id),userId:String(row.user_id),title:String(row.title??"New conversation"),messages:Array.isArray(row.messages)?row.messages:[],createdAt:typeof row.created_at==="number"?row.created_at:Date.parse(String(row.created_at)),updatedAt:typeof row.updated_at==="number"?row.updated_at:Date.parse(String(row.updated_at))};}
 async get(id:string,userId:string){const {data,error}=await this.client.from(this.table).select("*").eq("id",id).eq("user_id",userId).maybeSingle();if(error)throw error;return data?this.map(data):null;}
 async list(userId:string){const {data,error}=await this.client.from(this.table).select("*").eq("user_id",userId).order("updated_at",{ascending:false});if(error)throw error;return (data??[]).map(row=>this.map(row));}
 async upsert(c:Conversation){const {error}=await this.client.from(this.table).upsert({id:c.id,user_id:c.userId,title:c.title,messages:c.messages,created_at:new Date(c.createdAt).toISOString(),updated_at:new Date(c.updatedAt).toISOString()});if(error)throw error;}
 async delete(id:string,userId:string){const {data,error}=await this.client.from(this.table).delete().eq("id",id).eq("user_id",userId).select("id");if(error)throw error;return Array.isArray(data)&&data.length>0;}
}