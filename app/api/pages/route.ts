import {POST as unlock} from "../unlock/route";
import {digest,privateHeaders,runtime} from "@/lib/auth";
import {openAsset,storyContent} from "@/lib/vault";
export const dynamic="force-dynamic";
const allowedOrigin="https://chihpao.github.io";
function cors(request:Request){return {...privateHeaders,"Access-Control-Allow-Origin":allowedOrigin,"Vary":"Origin","Access-Control-Allow-Methods":"GET, POST, DELETE, OPTIONS","Access-Control-Allow-Headers":"Authorization, Content-Type","Access-Control-Max-Age":"600"};}
function allowed(request:Request){return request.headers.get("origin")===allowedOrigin;}
export async function OPTIONS(request:Request){return new Response(null,{status:allowed(request)?204:403,headers:cors(request)});}
export async function POST(request:Request){
 if(!allowed(request))return new Response(null,{status:403,headers:privateHeaders});
 const headers=new Headers(request.headers);headers.set("origin",new URL(request.url).origin);
 const response=await unlock(new Request(request.url,{method:"POST",headers,body:await request.text()}));
 if(!response.ok)return new Response(null,{status:response.status,headers:{...cors(request),...(response.status===429?{"Retry-After":"900"}:{})}});
 const token=response.headers.get("set-cookie")?.match(/^light_session=([a-f0-9]{64});/)?.[1];
 if(!token)return new Response(null,{status:503,headers:cors(request)});
 return Response.json({token},{headers:cors(request)});
}
async function authorized(request:Request){
 const token=request.headers.get("authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
 if(!token)return null;
 const hash=await digest(token);
 return await runtime().DB.prepare("SELECT expires FROM sessions WHERE token_hash = ? AND expires > ?").bind(hash,Date.now()).first()?hash:null;
}
export async function GET(request:Request){
 if(!allowed(request))return new Response(null,{status:403,headers:privateHeaders});
 try{
  if(!await authorized(request))return new Response(null,{status:401,headers:cors(request)});
  const asset=new URL(request.url).searchParams.get("asset");
  if(!asset)return Response.json(await storyContent(),{headers:cors(request)});
  if(!["afternoon","sunset","night","animals"].includes(asset))return new Response(null,{status:404,headers:cors(request)});
  const bytes=await openAsset(asset);return new Response(bytes,{headers:{...cors(request),"Content-Type":"image/webp"}});
 }catch{return new Response(null,{status:503,headers:cors(request)});}
}
export async function DELETE(request:Request){
 if(!allowed(request))return new Response(null,{status:403,headers:privateHeaders});
 try{const hash=await authorized(request);if(!hash)return new Response(null,{status:401,headers:cors(request)});await runtime().DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(hash).run();return new Response(null,{status:204,headers:cors(request)});}catch{return new Response(null,{status:503,headers:cors(request)});}
}
