import data from "./vault.generated.json";
import {runtime} from "./auth";
const decode=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
export async function openAsset(id:string){
 const item=(data as Record<string,{iv:string;data:string}>)[id];
 if(!item) return null;
 const key=await crypto.subtle.importKey("raw",decode(runtime().VAULT_KEY),"AES-GCM",false,["decrypt"]);
 return await crypto.subtle.decrypt({name:"AES-GCM",iv:decode(item.iv),additionalData:new TextEncoder().encode(id)},key,decode(item.data));
}
export async function storyContent(){const bytes=await openAsset("story");if(!bytes)throw new Error("Content unavailable");return JSON.parse(new TextDecoder().decode(bytes));}
