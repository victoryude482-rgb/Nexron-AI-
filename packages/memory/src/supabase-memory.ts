import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryRecord, MemoryStore } from "./store.js";
export class SupabaseMemoryStore implements MemoryStore{
 constructor(private readonly client:SupabaseClient,private readonly table="memories"){}
 private map(row:any):MemoryRecord{return {id:String(row.id),userId:String(row.user_id),content:String(row.content??""),createdAt:typeof row.created_at==="number"?row.created_at:Date.parse(String(row.created_at)),metadata:row.metadata&&typeof row.metadata==="object"?row.metadata:undefined};}
 async save(record:MemoryRecord){const {error}=await this.client.from(this.table).upsert({id:record.id,user_id:record.userId,content:record.content,created_at:new Date(record.createdAt).toISOString(),metadata:record.metadata??{}});if(error)throw error;}
 async search(userId:string,query:string,limit=10){const {data,error}=await this.client.from(this.table).select("*").eq("user_id",userId).ilike("content","%"+query.replace(/[%_]/g,"") +"%").order("created_at",{ascending:false}).limit(limit);if(error)throw error;return (data??[]).map(row=>this.map(row));}
}