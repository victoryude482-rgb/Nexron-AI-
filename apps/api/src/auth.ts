export interface AuthContext { readonly userId:string; readonly authenticated:boolean; }

export function authFromRequest(request:Request):AuthContext{
 const raw=request.headers.get("authorization")||"";
 if(raw.startsWith("Bearer ")){
   const token=raw.slice(7).trim();
   if(token) return {userId:"token:"+token.slice(0,64),authenticated:true};
 }
 return {userId:"anonymous",authenticated:false};
}

export function requireAuth(context:AuthContext):Response|null{
 if(!context.authenticated) return new Response(JSON.stringify({error:"Authentication required."}),{status:401,headers:{"content-type":"application/json"}});
 return null;
}