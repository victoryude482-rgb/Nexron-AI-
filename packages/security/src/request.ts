export interface RequestIdentity { readonly userId:string; readonly authenticated:boolean; }

export function clientKey(request:Request):string{
  const forwarded=request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous").slice(0,128);
}

export function requireJson(request:Request):void{
  const contentType=request.headers.get("content-type")||"";
  if(!contentType.toLowerCase().includes("application/json")) throw new Error("application/json is required.");
}