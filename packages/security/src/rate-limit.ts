export interface RateLimitResult { allowed:boolean; remaining:number; retryAfterMs:number; }
export class FixedWindowRateLimiter {
  private readonly windows=new Map<string,{start:number,count:number}>();
  constructor(private readonly limit=60,private readonly windowMs=60_000){}
  check(key:string,now=Date.now()):RateLimitResult{
    const current=this.windows.get(key);
    if(!current || now-current.start>=this.windowMs){this.windows.set(key,{start:now,count:1});return {allowed:true,remaining:this.limit-1,retryAfterMs:0};}
    if(current.count>=this.limit)return {allowed:false,remaining:0,retryAfterMs:this.windowMs-(now-current.start)};
    current.count++;
    return {allowed:true,remaining:this.limit-current.count,retryAfterMs:0};
  }
}