"use client";

import { useState } from "react";

const tools = [
  { name: "Research", detail: "Compare sources and synthesize findings." },
  { name: "Code", detail: "Plan, edit, review, and test software." },
  { name: "Leads", detail: "Discover and rank business prospects." },
  { name: "Browser", detail: "Work with approved web tools." },
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!input.trim()) return;
    setSent(true);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="mark">N</span><span>Nexron</span></div>
        <button className="newChat" onClick={() => { setInput(""); setSent(false); }}>New task</button>
        <nav aria-label="Workspace">
          <a className="navItem active" href="/">Workspace</a>
          <a className="navItem" href="/privacy">Privacy</a>
          <a className="navItem" href="/terms">Terms</a>
        </nav>
        <div className="sidebarBottom">
          <div className="statusDot"><i /> Free-first routing</div>
          <span className="muted">Provider independent</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">AI WORKSPACE</p><h1>What are you working on?</h1></div>
          <button className="quietButton">Model: Auto</button>
        </header>

        <div className="content">
          <section className="composerCard">
            <label htmlFor="task">Task</label>
            <textarea id="task" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Describe the outcome you need. Nexron will plan the work and choose the appropriate agent." />
            <div className="composerFooter">
              <span className="hint">Planning, tools, and provider routing happen behind the task.</span>
              <button className="primaryButton" onClick={submit}>Run task <span aria-hidden="true">→</span></button>
            </div>
            {sent && <div className="resultNotice">Task accepted. The runtime will validate the plan before execution.</div>}
          </section>

          <section className="section">
            <div className="sectionHeader"><div><p className="eyebrow">CAPABILITIES</p><h2>Choose a starting point</h2></div></div>
            <div className="toolGrid">
              {tools.map(tool => <button key={tool.name} className="toolCard" onClick={() => setInput(tool.name + ": ")}>
                <span className="toolIcon" aria-hidden="true">{tool.name.slice(0,1)}</span>
                <span><strong>{tool.name}</strong><small>{tool.detail}</small></span>
                <span className="arrow" aria-hidden="true">↗</span>
              </button>)}
            </div>
          </section>

          <section className="section split">
            <div><p className="eyebrow">HOW IT WORKS</p><h2>One request, controlled execution.</h2><p className="bodyCopy">Nexron turns a request into a validated task graph, routes each task to the right capability, and keeps sensitive tool actions behind explicit approval.</p></div>
            <div className="steps"><div><b>01</b><span>Plan</span><small>Structured task graph</small></div><div><b>02</b><span>Route</span><small>Specialist or tool</small></div><div><b>03</b><span>Verify</span><small>Results are synthesized</small></div></div>
          </section>
        </div>

        <footer className="footer"><span>© {new Date().getFullYear()} Nexron</span><span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span></footer>
      </section>
    </main>
  );
}