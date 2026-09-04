export function corsHeaders(origin:string|undefined,allowed:string[]=[]):Record<string,string>{
 const headers:Record<string,string>={"Vary":"Origin"};
 if(origin && (allowed.length===0 || allowed.includes(origin))) {
   headers["Access-Control-Allow-Origin"]=origin;
   headers["Access-Control-Allow-Headers"]="content-type, authorization";
   headers["Access-Control-Allow-Methods"]="GET,POST,DELETE,OPTIONS";
 }
 return headers;
}