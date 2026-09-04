export interface AuthContext { readonly userId:string; readonly authenticated:boolean; }

export function authFromRequest(request:Request,env:Record<string,string|undefined>=process.env):AuthContext{
 const header=request.headers.get("authorization")||"";
 const token=header.startsWith("Bearer ")?header.slice(7).trim():"";
 const expected=env.NEXRON_API_TOKEN?.trim();
 if(expected && token && token===expected)return {userId:"api-user",authenticated:true};
 return {userId:"anonymous",authenticated:false};
}
export function requireAuth(context:AuthContext):Response|null{
 if(!context.authenticated)return new Response(JSON.stringify({error:"Authentication required."}),{status:401,headers:{"content-type":"application/json"}});
 return null;
}