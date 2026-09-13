import {redirect} from "next/navigation";
import {hasSession} from "@/lib/auth";
import {storyContent} from "@/lib/vault";
export const dynamic="force-dynamic";
const Lines=({text}:{text:string})=><>{text.split("\n").map((line,i)=><span key={i}>{line}<br/></span>)}</>;
export default async function Story(){
 let authorized=false;try{authorized=await hasSession();}catch{return <main className="entry"><h1>這片光暫時休息中。</h1><a href="/">回到入口，再試一次</a></main>;}
 if(!authorized)redirect("/");
 const c=await storyContent();
 return <main className="story" id="top">
  <nav className="story-nav" aria-label="閱讀選項"><a href="#top">{c.recipient}</a><form action="/api/lock" method="post"><button type="submit">關上這片光</button></form></nav>
  <section className="hero"><div className="reveal"><p className="eyebrow">一些片刻 ／ 一些關於妳的感覺</p><h1><Lines text={c.title}/></h1><p className="intro"><Lines text={c.intro}/></p><a className="scroll-note" href="#natural">慢慢往下看 ↓</a></div><figure className="hero-photo"><img src="/api/photo/afternoon" alt={c.afternoonAlt} width="960" height="1280"/><figcaption className="caption">{c.afternoonCaption}</figcaption></figure></section>
  <section className="memory natural" id="natural"><p className="date">01 ／ 自然</p><p className="large-words"><Lines text={c.naturalTitle}/></p><p><Lines text={c.natural}/></p></section>
  <section className="cinema"><div className="memory"><div><p className="date">{c.cinemaLabel}</p><h2><Lines text={c.cinemaTitle}/></h2><p className="small-note">{c.film}</p></div><div className="fragments">{c.cinema.map((p:string,i:number)=><p key={i}><Lines text={p}/></p>)}</div></div></section>
  <section className="memory animals"><p className="date">{c.animalsLabel}</p><div className="animal-grid"><div><h2><Lines text={c.animalsTitle}/></h2>{c.animals.map((p:string,i:number)=><p key={i}><Lines text={p}/></p>)}</div><img src="/api/photo/animals" alt={c.animalsAlt} width="1200" height="800" loading="lazy"/></div></section>
  <section className="sharing"><p className="eyebrow">02 ／ 分享</p><p><Lines text={c.sharing}/></p></section>
  <section className="sunset"><figure><img src="/api/photo/sunset" alt={c.sunsetAlt} width="1477" height="1108" loading="lazy"/></figure><div className="memory"><p className="date">{c.sunsetLabel}</p><h2><Lines text={c.sunsetTitle}/></h2><p><Lines text={c.sunset}/></p></div></section>
  <section className="night"><div className="memory"><p className="date">同一天 ／ 新月升起以後</p>{c.night.map((p:string,i:number)=><p key={i}><Lines text={p}/></p>)}</div><figure className="night-photo"><img src="/api/photo/night" alt={c.nightAlt} width="1280" height="720" loading="lazy"/></figure><p className="caption">{c.nightCaption}</p></section>
 </main>;
}
