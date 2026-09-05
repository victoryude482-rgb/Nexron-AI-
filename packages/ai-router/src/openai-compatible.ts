import { ProviderError } from "@nexron/shared";
import type { ModelDescriptor, ProviderRequest, ProviderResponse } from "@nexron/shared";
import type { ModelProvider } from "./router.js";
interface ChatCompletionResponse { choices?:Array<{message?:{content?:string}}>; model?:string; usage?:{prompt_tokens?:number;completion_tokens?:number}; }
export interface OpenAICompatibleOptions { readonly baseUrl:string; readonly apiKey?:string; readonly headers?:Record<string,string>; readonly descriptor:ModelDescriptor; readonly fetchImpl?:typeof fetch; }
export class OpenAICompatibleProvider implements ModelProvider {
 readonly descriptor:ModelDescriptor; private readonly baseUrl:string; private readonly apiKey?:string; private readonly headers:Record<string,string>; private readonly fetchImpl:typeof fetch;
 constructor(options:OpenAICompatibleOptions){this.descriptor=options.descriptor;this.baseUrl=options.baseUrl.replace(/\/$/,"");this.apiKey=options.apiKey;this.headers=options.headers??{};this.fetchImpl=options.fetchImpl??fetch;}
 private requestHeaders(){const headers:Record<string,string>={"content-type":"application/json",...this.headers};if(this.apiKey)headers.authorization="Bearer "+this.apiKey;return headers;}
 async complete(request:ProviderRequest,signal?:AbortSignal):Promise<ProviderResponse>{
  const response=await this.fetchImpl(this.baseUrl+"/chat/completions",{method:"POST",headers:this.requestHeaders(),body:JSON.stringify({...request,model:request.model.id,stream:false}),signal});
  const raw=await response.text();if(!response.ok)throw new ProviderError("Provider returned HTTP "+response.status+": "+raw.slice(0,500));
  let data:ChatCompletionResponse;try{data=JSON.parse(raw) as ChatCompletionResponse}catch(error){throw new ProviderError("Provider returned invalid JSON.",error);}
  const content=data.choices?.[0]?.message?.content;if(typeof content!=="string")throw new ProviderError("Provider returned no assistant content.");
  return {content,model:data.model??request.model.id,provider:request.model.provider,usage:data.usage?{inputTokens:data.usage.prompt_tokens,outputTokens:data.usage.completion_tokens}:undefined};
 }
 async *stream(request:ProviderRequest,signal?:AbortSignal):AsyncIterable<string>{
  const response=await this.fetchImpl(this.baseUrl+"/chat/completions",{method:"POST",headers:this.requestHeaders(),body:JSON.stringify({...request,model:request.model.id,stream:true}),signal});
  if(!response.ok){const raw=await response.text();throw new ProviderError("Provider returned HTTP "+response.status+": "+raw.slice(0,500));}
  if(!response.body)throw new ProviderError("Provider returned no streaming body.");
  const reader=response.body.getReader();const decoder=new TextDecoder();let buffer="";
  try{while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split(/\r?\n/);buffer=lines.pop()??"";
    for(const line of lines){const trimmed=line.trim();if(!trimmed.startsWith("data:"))continue;const payload=trimmed.slice(5).trim();if(payload==="[DONE]")return;try{const item=JSON.parse(payload) as {choices?:Array<{delta?:{content?:string}}>};const delta=item.choices?.[0]?.delta?.content;if(delta)yield delta;}catch{/* ignore keepalive/non-JSON SSE frames */}}
  }}finally{reader.releaseLock();}
 }
 async health(signal?:AbortSignal){try{const response=await this.fetchImpl(this.baseUrl+"/models",{method:"GET",headers:this.apiKey?{authorization:"Bearer "+this.apiKey}:this.headers,signal});return response.ok;}catch{return false;}}
}
