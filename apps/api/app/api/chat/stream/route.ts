import { getRuntime } from "../../../../src/container";
import { authFromRequest, requireAuth } from "../../../../src/auth";
import { guardRequest } from "../../../../src/request-context";
export const runtime="nodejs";
export async function POST(request:Request){
 const auth=await authFromRequest(request);const denied=requireAuth(auth);if(denied)return denied;const blocked=guardRequest(request,true);if(blocked)return blocked;
 const body=await request.json() as {message?:unknown};
 if(typeof body.message!=="string"||!body.message.trim())return new Response(JSON.stringify({error:"message must be a non-empty string"}),{status:400,headers:{"content-type":"application/json"}});
 const message=body.message.trim();
 if(message.length>20000)return new Response(JSON.stringify({error:"message is too long"}),{status:413,headers:{"content-type":"application/json"}});
 const controller=new AbortController();request.signal.addEventListener("abort",()=>controller.abort(request.signal.reason),{once:true});const encoder=new TextEncoder();
 const stream=new ReadableStream({async start(out){try{
  out.enqueue(encoder.encode("event: status\ndata: "+JSON.stringify({status:"running"})+"\n\n"));
  for await(const delta of getRuntime().stream(message,{signal:controller.signal,userId:auth.userId}))out.enqueue(encoder.encode("event: delta\ndata: "+JSON.stringify({delta})+"\n\n"));
  out.enqueue(encoder.encode("event: done\ndata: {}\n\n"));out.close();
 }catch(error){out.enqueue(encoder.encode("event: error\ndata: "+JSON.stringify({error:error instanceof Error?error.message:String(error)})+"\n\n"));out.close();}}});
 return new Response(stream,{headers:{"content-type":"text/event-stream; charset=utf-8","cache-control":"no-cache, no-transform","connection":"keep-alive","x-accel-buffering":"no"}});
}