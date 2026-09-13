import {digest,privateHeaders,runtime,sameOrigin} from "@/lib/auth";
export async function POST(request:Request){
  if(!sameOrigin(request)) return new Response(null,{status:403,headers:privateHeaders});
  if(Number(request.headers.get("content-length")||0)>1024) return new Response(null,{status:413,headers:privateHeaders});
  try {
    const {DB,SITE_PASSWORD,VAULT_KEY}=runtime();
    const input=await request.text();
    if(input.length>1024) return new Response(null,{status:413,headers:privateHeaders});
    let password:unknown; try{password=JSON.parse(input).password;}catch{return new Response(null,{status:400,headers:privateHeaders});}
    if(typeof password!=="string"||password.length>64) return new Response(null,{status:400,headers:privateHeaders});
    const now=Date.now(), window=Math.floor(now/900000);
    const client=await digest(VAULT_KEY+":"+(request.headers.get("cf-connecting-ip")||"local"));
    const counters=await DB.batch([
      DB.prepare("INSERT INTO attempts (bucket,count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count").bind(client+":"+window),
      DB.prepare("INSERT INTO attempts (bucket,count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count").bind("global:"+window)
    ]);
    if(Number(counters[0].results[0]?.count)>6||Number(counters[1].results[0]?.count)>60) return new Response(null,{status:429,headers:{...privateHeaders,"Retry-After":"900"}});
    const [a,b]=await Promise.all([digest(password),digest(SITE_PASSWORD)]);
    let difference=0;for(let i=0;i<a.length;i++)difference|=a.charCodeAt(i)^b.charCodeAt(i);
    if(difference) return new Response(null,{status:401,headers:privateHeaders});
    const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(n=>n.toString(16).padStart(2,"0")).join("");
    await DB.batch([
      DB.prepare("INSERT INTO sessions (token_hash,expires) VALUES (?,?)").bind(await digest(token),now+43200000),
      DB.prepare("DELETE FROM sessions WHERE expires < ?").bind(now),
      DB.prepare("DELETE FROM attempts WHERE CAST(substr(bucket,instr(bucket,':')+1) AS INTEGER) < ?").bind(window-1)
    ]);
    return new Response(null,{status:204,headers:{...privateHeaders,"Set-Cookie":`light_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${new URL(request.url).protocol==="https:"?"; Secure":""}`}});
  }catch{ return new Response(null,{status:503,headers:privateHeaders}); }
}
