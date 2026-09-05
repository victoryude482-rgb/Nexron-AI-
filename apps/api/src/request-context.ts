import { FixedWindowRateLimiter } from "@nexron/security";

const limiter=new FixedWindowRateLimiter(Number(process.env.NEXRON_RATE_LIMIT||60),60_000);

function clientKey(request:Request){
 return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
   || request.headers.get("x-real-ip")?.trim()
   || "anonymous";
}

function requireJson(request:Request){
 const contentType=request.headers.get("content-type")||"";
 if(!contentType.toLowerCase().startsWith("application/json")){
  return new Response(JSON.stringify({error:"Content-Type must be application/json."}),{status:415,headers:{"content-type":"application/json"}});
 }
 return null;
}

export function guardRequest(request:Request,json=false){
 if(json){
  const invalid=requireJson(request);
  if(invalid)return invalid;
 }
 const result=limiter.check(clientKey(request));
 if(!result.allowed) return new Response(JSON.stringify({error:"Rate limit exceeded."}),{status:429,headers:{"content-type":"application/json","retry-after":String(Math.ceil(result.retryAfterMs/1000))}});
 return null;
}