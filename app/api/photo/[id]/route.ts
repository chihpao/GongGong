import {hasSession,privateHeaders} from "@/lib/auth";
import {openAsset} from "@/lib/vault";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{
  if(!await hasSession())return new Response(null,{status:401,headers:privateHeaders});
  const {id}=await params;
  if(!["afternoon","sunset","night","animals"].includes(id))return new Response(null,{status:404,headers:privateHeaders});
  const asset=await openAsset(id);if(!asset)return new Response(null,{status:404,headers:privateHeaders});
  return new Response(asset,{headers:{...privateHeaders,"Content-Type":"image/webp"}});
 }catch{return new Response(null,{status:503,headers:privateHeaders});}
}
