import { createClient } from "@supabase/supabase-js";
export interface AuthContext{readonly userId:string;readonly authenticated:boolean;}
export async function authFromRequest(request:Request,env:Record<string,string|undefined>=process.env):Promise<AuthContext>{
 const header=request.headers.get("authorization")||"";const token=header.startsWith("Bearer ")?header.slice(7).trim():"";
 const apiToken=env.NEXRON_API_TOKEN?.trim();if(apiToken&&token===apiToken)return {userId:"api-user",authenticated:true};
 const url=env.SUPABASE_URL?.trim();const serviceKey=env.SUPABASE_SERVICE_ROLE_KEY?.trim();
 if(url&&serviceKey&&token){try{const client=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await client.auth.getUser(token);if(!error&&data.user)return {userId:data.user.id,authenticated:true};}catch{/* invalid credentials remain unauthenticated */}}
 return {userId:"anonymous",authenticated:false};
}
export function requireAuth(context:AuthContext):Response|null{if(!context.authenticated)return new Response(JSON.stringify({error:"Authentication required."}),{status:401,headers:{"content-type":"application/json"}});return null;}
