import type { SupabaseClient } from "@supabase/supabase-js";
import type { Memory, MemoryStore } from "./store.js";
export class SupabaseMemoryStore implements MemoryStore{
 constructor(private readonly client:SupabaseClient,private readonly table="memories"){}
 private map(row:any):Memory{return {id:String(row.id),scope:row.scope==="project"||row.scope==="conversation"?"user":row.scope,userId:String(row.user_id),key:String(row.key??row.id),value:String(row.content??row.value??""),createdAt:String(row.created_at),updatedAt:String(row.updated_at??row.created_at)} as Memory;}
 async put(memory:Memory){const m=memory as Memory & {userId?:string};const {error}=await this.client.from(this.table).upsert({id:m.id,user_id:m.userId??"unknown",scope:m.scope,key:m.key,value:m.value,content:m.value,created_at:m.createdAt,updated_at:m.updatedAt});if(error)throw error;}
 async search(scope:Memory["scope"],query:string,limit=10){const {data,error}=await this.client.from(this.table).select("*").eq("scope",scope).or("key.ilike.%"+query.replace(/[%_]/g,"")+"%,value.ilike.%"+query.replace(/[%_]/g,"")+"%").order("created_at",{ascending:false}).limit(limit);if(error)throw error;return (data??[]).map(row=>this.map(row));}
}