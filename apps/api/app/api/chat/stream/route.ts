import { getRuntime } from "../../../../src/container.js";
import { guardRequest } from "../../../../src/request-context.js";
export const runtime="nodejs";
export async function POST(request:Request){
 const blocked=guardRequest(request,true);if(blocked)return blocked;
 const body=await request.json() as {message?:unknown};if(typeof body.message!=="string"||!body.message.trim())return new Response(JSON.stringify({error:"message must be a non-empty string"}),{status:400,headers:{"content-type":"application/json"}});
 const encoder=new TextEncoder();const stream=new ReadableStream({async start(controller){
  try{controller.enqueue(encoder.encode("event: status\ndata: {"status":"running"}\n\n"));
   for await(const delta of getRuntime().stream(body.message.trim(),{})){controller.enqueue(encoder.encode("event: delta\ndata: "+JSON.stringify({delta})+"\n\n"));}
   controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));controller.close();
  }catch(error){controller.enqueue(encoder.encode("event: error\ndata: "+JSON.stringify({error:error instanceof Error?error.message:String(error)})+"\n\n"));controller.close();}
 }});
 return new Response(stream,{headers:{"content-type":"text/event-stream","cache-control":"no-cache","connection":"keep-alive","x-accel-buffering":"no"}});
}