import { NextResponse } from "next/server";
import { getConversationStore } from "../../../src/container.js";
import { authFromRequest, requireAuth } from "../../../src/auth.js";
import { guardRequest } from "../../../src/request-context.js";
export const runtime="nodejs";
export async function GET(request:Request){const auth=authFromRequest(request);const denied=requireAuth(auth);if(denied)return denied;const blocked=guardRequest(request);if(blocked)return blocked;return NextResponse.json(await getConversationStore().list(auth.userId));}
export async function POST(request:Request){const auth=authFromRequest(request);const denied=requireAuth(auth);if(denied)return denied;const blocked=guardRequest(request,true);if(blocked)return blocked;const body=await request.json() as {id?:unknown;title?:unknown};if(typeof body.id!=="string"||typeof body.title!=="string")return NextResponse.json({error:"id and title are required"},{status:400});const now=Date.now();const conversation={id:body.id,userId:auth.userId,title:body.title.slice(0,200),messages:[],createdAt:now,updatedAt:now};await getConversationStore().upsert(conversation);return NextResponse.json(conversation,{status:201});}
