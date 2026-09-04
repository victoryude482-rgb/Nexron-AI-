export interface ConversationMessage { readonly id:string; readonly role:"user"|"assistant"|"tool"|"system"; readonly content:string; readonly createdAt:number; }
export interface Conversation { readonly id:string; readonly userId:string; readonly title:string; readonly messages:ConversationMessage[]; readonly createdAt:number; readonly updatedAt:number; }
export interface ConversationStore { get(id:string,userId:string):Promise<Conversation|null>; list(userId:string):Promise<Conversation[]>; upsert(conversation:Conversation):Promise<void>; delete(id:string,userId:string):Promise<boolean>; }
export class InMemoryConversationStore implements ConversationStore{
 private readonly data=new Map<string,Conversation>();
 async get(id:string,userId:string){const value=this.data.get(id);return value?.userId===userId?structuredClone(value):null;}
 async list(userId:string){return [...this.data.values()].filter(x=>x.userId===userId).sort((a,b)=>b.updatedAt-a.updatedAt).map(value=>structuredClone(value));}
 async upsert(c:Conversation){this.data.set(c.id,structuredClone(c));}
 async delete(id:string,userId:string){const c=this.data.get(id);if(!c||c.userId!==userId)return false;this.data.delete(id);return true;}
}