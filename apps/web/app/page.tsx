"use client";
import {useEffect,useMemo,useRef,useState} from "react";
type Msg={role:"user"|"assistant";content:string};
type Conversation={id:string;title:string;messages:Msg[]};
const starters=[["Research","Compare sources and synthesize findings."],["Code","Plan, edit, review, and test software."],["Leads","Discover and rank business prospects."],["Browser","Work with approved web tools."]];
function id(){return crypto.randomUUID?.()??Date.now().toString(36);}
export default function HomePage(){
 const [chats,setChats]=useState<Conversation[]>([]),[active,setActive]=useState(""),[input,setInput]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),bottom=useRef<HTMLDivElement>(null);
 const chat=useMemo(()=>chats.find(c=>c.id===active),[chats,active]);
 useEffect(()=>{const raw=localStorage.getItem("nexron-chats");if(raw){try{const x=JSON.parse(raw);setChats(x);if(x[0])setActive(x[0].id);}catch{}}},[]);
 useEffect(()=>{localStorage.setItem("nexron-chats",JSON.stringify(chats));bottom.current?.scrollIntoView({behavior:"smooth"});},[chats]);
 function newChat(){const c={id:id(),title:"New task",messages:[]};setChats(x=>[c,...x]);setActive(c.id);setInput("");setError("");}
 function updateMessages(messages:Msg[],title?:string){setChats(x=>x.map(c=>c.id===active?{...c,messages,title:title??c.title}:c));}
 async function send(){
  const text=input.trim();if(!text||busy)return;if(!chat)newChat();
  const target=chat?.id??active;const user={role:"user" as const,content:text};const title=text.slice(0,42);
  setChats(x=>x.map(c=>c.id===target?{...c,messages:[...c.messages,user],title:c.title==="New task"?title:c.title}:c));setInput("");setBusy(true);setError("");
  try{const res=await fetch("/api/chat/stream",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:text})});if(!res.ok){const j=await res.json().catch(()=>({}));throw new Error(j.error||"Request failed");}
   if(!res.body)throw new Error("Streaming is unavailable.");const reader=res.body.getReader(),decoder=new TextDecoder();let buffer="",answer="";
   while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const events=buffer.split("\n\n");buffer=events.pop()??"";for(const ev of events){const line=ev.split("\n").find(x=>x.startsWith("data: "));if(!line)continue;const data=JSON.parse(line.slice(6));if(data.delta){answer+=data.delta;setChats(x=>x.map(c=>c.id===target?{...c,messages:[...c.messages.filter((_,i)=>i<c.messages.length),{role:"assistant",content:answer}]}:c));}if(data.error)throw new Error(data.error);}}
  }catch(e){setError(e instanceof Error?e.message:"Something went wrong.");setChats(x=>x.map(c=>c.id===target?{...c,messages:[...c.messages,{role:"assistant",content:"I couldn't complete that request."}]}:c));}finally{setBusy(false);}
 }
 return <main className="appShell">
  <aside className="sidebar"><div className="brand"><span className="mark">N</span><b>Nexron</b></div><button className="newChat" onClick={newChat}>＋ New chat</button>
   <div className="history">{chats.map(c=><button key={c.id} className={"historyItem "+(c.id===active?"selected":"")} onClick={()=>setActive(c.id)}>{c.title}</button>)}</div>
   <div className="sideBottom"><span><i/> Systems online</span><small>Free-first routing</small></div>
  </aside>
  <section className="main"><header className="topbar"><div><span className="eyebrow">NEXRON AI</span><h1>{chat?.title||"New chat"}</h1></div><span className="model">Auto · Free-first</span></header>
   <div className="chatArea">{!chat||chat.messages.length===0?<div className="welcome"><div className="heroMark">N</div><h2>What can I help you accomplish?</h2><p>Plan research, coding, lead discovery, and tool-assisted work from one workspace.</p><div className="starterGrid">{starters.map(([a,b])=><button key={a} onClick={()=>setInput(a+": ")}><b>{a}</b><small>{b}</small><span>↗</span></button>)}</div></div>:<div className="messages">{chat.messages.map((m,i)=><article key={i} className={"message "+m.role}><div className="avatar">{m.role==="user"?"You":"N"}</div><div><span className="role">{m.role==="user"?"You":"Nexron"}</span><div className="bubble">{m.content}</div></div></article>)}{busy&&<div className="typing"><i/><i/><i/> Nexron is working…</div>}<div ref={bottom}/></div>}</div>
   <div className="composerWrap"><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Message Nexron…" rows={1}/><button onClick={send} disabled={busy||!input.trim()} aria-label="Send">↑</button></div><div className="composerMeta">Nexron may use multiple agents and approved tools · Enter to send · Shift+Enter for newline</div>{error&&<div className="error">{error}</div>}</div>
  </section>
 </main>;
}