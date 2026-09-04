import { FixedWindowRateLimiter, clientKey, requireJson } from "@nexron/security";

const limiter=new FixedWindowRateLimiter(Number(process.env.NEXRON_RATE_LIMIT||60),60_000);

export function guardRequest(request:Request, json=false){
 if(json) requireJson(request);
 const result=limiter.check(clientKey(request));
 if(!result.allowed) return new Response(JSON.stringify({error:"Rate limit exceeded."}),{status:429,headers:{"content-type":"application/json","retry-after":String(Math.ceil(result.retryAfterMs/1000))}});
 return null;
}