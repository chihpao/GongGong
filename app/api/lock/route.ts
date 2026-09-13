import {cookies} from "next/headers";
import {digest,privateHeaders,runtime,sameOrigin} from "@/lib/auth";
export async function POST(request:Request){
 if(!sameOrigin(request))return new Response(null,{status:403});
 const token=(await cookies()).get("light_session")?.value;
 if(token)try{await runtime().DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await digest(token)).run();}catch{return new Response("暫時無法關閉，請稍後重試。",{status:503,headers:privateHeaders});}
 return new Response(null,{status:303,headers:{...privateHeaders,Location:"/","Set-Cookie":"light_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"}});
}
