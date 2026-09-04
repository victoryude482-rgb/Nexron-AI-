import type { Capability } from "@nexron/shared";
import type { LeadProvider, LeadRecord, LeadSearchRequest } from "./provider.js";
export interface LeadHttpProviderOptions{readonly name:string;readonly endpoint:string;readonly apiKey?:string;readonly capability?:Capability;}
export class LeadHttpProvider implements LeadProvider{
 readonly name:string;readonly capability:Capability;private readonly endpoint:string;private readonly apiKey?:string;
 constructor(options:LeadHttpProviderOptions){this.name=options.name;this.endpoint=options.endpoint.replace(/\/$/,"");this.apiKey=options.apiKey;this.capability=options.capability??"lead_intelligence";}
 async search(request:LeadSearchRequest,signal?:AbortSignal):Promise<LeadRecord[]>{const headers:Record<string,string>={"content-type":"application/json"};if(this.apiKey)headers.authorization="Bearer "+this.apiKey;const response=await fetch(this.endpoint+"/leads/search",{method:"POST",headers,body:JSON.stringify(request),signal});if(!response.ok)throw new Error(this.name+" returned HTTP "+response.status);const data=await response.json() as {records?:LeadRecord[]};return Array.isArray(data.records)?data.records:[];}
}