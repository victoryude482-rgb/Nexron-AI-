import { NextResponse } from "next/server";
import { getConversationStore } from "../../../../src/container.js";
import { authFromRequest, requireAuth } from "../../../../src/auth.js";
import { guardRequest } from "../../../../src/request-context.js";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:{id:string}}){const auth=await authFromRequest(request);const denied=requireAuth(auth);if(denied)return denied;const blocked=guardRequest(request);if(blocked)return blocked;const item=await getConversationStore().get(params.id,auth.userId);return item?NextResponse.json(item):NextResponse.json({error:"Conversation not found."},{status:404});}
export async function DELETE(request:Request,{params}:{params:{id:string}}){const auth=await authFromRequest(request);const denied=requireAuth(auth);if(denied)return denied;const blocked=guardRequest(request);if(blocked)return blocked;const deleted=await getConversationStore().delete(params.id,auth.userId);return deleted?NextResponse.json({ok:true}):NextResponse.json({error:"Conversation not found."},{status:404});}
