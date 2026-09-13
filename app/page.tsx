"use client";
import {useState,type FormEvent} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
export default function Home(){
 const[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function unlock(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");
 try{const r=await fetch("/api/unlock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:new FormData(e.currentTarget).get("password")})});if(r.ok){window.location.assign("/story");return;}setError(r.status===429?"先休息一下，十五分鐘後再試。":r.status===401?"密碼不太對，再試一次。":"暫時無法開啟，請稍後再試。");}catch{setError("連線暫時中斷，請再試一次。");}setBusy(false);}
 return <main className="entry"><div className="entry-top"><span>GongGong</span></div><div className="entry-glow" aria-hidden="true"/><section className="entry-content"><p className="eyebrow">留給妳的一小片光</p><h1>有一個地方，<br/>想讓妳走進來。</h1><form onSubmit={unlock} className="entry-form"><label htmlFor="password">輸入密碼</label><div className="entry-controls"><Input id="password" name="password" type="password" inputMode="numeric" autoComplete="current-password" maxLength={64} required aria-describedby="entry-error" placeholder="••••" disabled={busy}/><Button type="submit" disabled={busy}>{busy?"正在開啟":"走進來"}<span aria-hidden="true">↗</span></Button></div><p id="entry-error" role="status" className="entry-error">{error}</p></form></section><div className="entry-bottom"><span>一點光，一些片刻。</span><span aria-hidden="true">○</span></div></main>;
}
