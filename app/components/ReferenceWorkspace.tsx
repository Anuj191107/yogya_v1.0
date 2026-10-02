"use client";

import React, { useEffect, useMemo, useState } from "react";
import MinistryDashboard from "./MinistryDashboard";
import IndustryDashboard from "./IndustryDashboard";

import { FormattedSarthiAnswer } from "./FormattedMarkdown";

type Role = "Trainee" | "Trainer" | "Institute" | "Industry" | "Ministry";
type View = "Dashboard" | "Simulation" | "Guidance";

const roles: Role[] = ["Trainee", "Trainer", "Industry", "Institute", "Ministry"];
const phoneConfig: Record<Role, { title: string; greeting: string; subtitle: string; icon: string; prompt: string; detail: string; chips: string[]; nav: string[] }> = {
  Trainee: { title: "Sarthi Learning Coach", greeting: "Ready to learn today?", subtitle: "आज काय शिकायचे आहे?", icon: "◎", prompt: "Today's plan", detail: "Complete CNC turning basics, practice a simulation, and add evidence to your skill passport.", chips: ["What should I learn next?", "Help me prepare for CNC"], nav: ["Home", "Simulations", "Learn", "Profile"] },
  Trainer: { title: "Sarthi Trainer Copilot", greeting: "Good morning, Sir!", subtitle: "Here's your teaching briefing for today.", icon: "▤", prompt: "3 assignments need checking", detail: "CNC Turning · Batch A (12), Safety Quiz · Batch B (8), Workshop Report · Batch C (6).", chips: ["Plan today's class", "Create a recap activity"], nav: ["Home", "Students", "Resources", "Schedule"] },
  Industry: { title: "Sarthi Talent Partner", greeting: "How can I help you today?", subtitle: "Find skills that fit your open roles.", icon: "▥", prompt: "Welder demand is high", detail: "85 demo openings in Kolhapur district this quarter. Ask for verified candidate matches and practical evidence.", chips: ["Find welder candidates", "Write a skill requirement"], nav: ["Home", "Talent", "Projects", "Shortlist"] },
  Institute: { title: "Sarthi Institute Advisor", greeting: "Good morning, Principal Sir!", subtitle: "Here's your institute briefing for today.", icon: "▦", prompt: "Placement readiness needs attention", detail: "Review electrician placement outcomes and align an EV wiring elective with local demand.", chips: ["Review placement readiness", "Suggest course updates"], nav: ["Home", "Analytics", "Institutes", "Reports"] },
  Ministry: { title: "Sarthi District Advisor", greeting: "Good morning, Officer.", subtitle: "Here is your district skill intelligence briefing.", icon: "⌖", prompt: "District skill gap alert", detail: "Compare training capacity with local demand and inspect institutions with the largest sample skill gaps.", chips: ["Summarise district gaps", "Which institutions need support?"], nav: ["Home", "Districts", "Institutions", "Reports"] }
};
const demands = [
  { title: "CNC operators", detail: "NSQF L4 · Fanuc certified", openings: 20, tone: "orange" },
  { title: "Welders", detail: "MIG/TIG · 1G–3G positions", openings: 12, tone: "teal" },
  { title: "Quality inspectors", detail: "CMM operation", openings: 5, tone: "blue" },
];
const courses = [
  { name: "CNC machining", status: "Industry validated", tone: "good", icon: "⚙" },
  { name: "Welding", status: "Industry validated", tone: "good", icon: "⌁" },
  { name: "Electrician", status: "Review due", tone: "warn", icon: "ϟ" },
  { name: "Fitter", status: "Draft", tone: "muted", icon: "🔧" },
];
const people = [
  { name: "Aarav Patil", skill: "CNC operation · Fanuc", score: 94, status: "Verified" },
  { name: "Sana Shaikh", skill: "Quality inspection · CMM", score: 91, status: "Verified" },
  { name: "Rohan Jadhav", skill: "MIG/TIG welding", score: 88, status: "Review" },
  { name: "Meera Kulkarni", skill: "Industrial electrical", score: 84, status: "Verified" },
];

function Icon({ children }: { children: React.ReactNode }) { return <span className="yw-icon" aria-hidden="true">{children}</span>; }
function Kpi({ icon, label, value, trend, orange = false }: { icon: string; label: string; value: string; trend?: string; orange?: boolean }) {
  return <article className="yw-kpi"><span className={`yw-kpi-icon ${orange ? "orange" : ""}`}><Icon>{icon}</Icon></span><div className="yw-kpi-copy"><span>{label}</span><strong>{value}</strong>{trend && <small>↗ {trend}</small>}</div><svg className="yw-spark" viewBox="0 0 76 28" aria-hidden="true"><path d="M2 23 L14 19 L25 21 L37 12 L48 16 L60 7 L74 3" fill="none" stroke={orange ? "#ef8b4b" : "#5bb8ad"} strokeWidth="2" strokeLinecap="round"/></svg></article>;
}
function Panel({ title, right, children, className = "" }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`yw-panel ${className}`}><header className="yw-panel-head"><h2>{title}</h2>{right}</header>{children}</section>;
}

export default function ReferenceWorkspace({ role: initialRole, onBack, onChooseRole }: { role: Role; onBack: () => void; onChooseRole?: () => void }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [view, setView] = useState<View>("Dashboard");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Last 6 months");
  const [district, setDistrict] = useState("Kolhapur District, Maharashtra");
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [chat, setChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [phoneDrafts, setPhoneDrafts] = useState<Record<Role, string>>({ Trainee: "", Trainer: "", Industry: "", Institute: "", Ministry: "" });
  const [phoneAnswers, setPhoneAnswers] = useState<Partial<Record<Role, string>>>({});
  const [phoneLoading, setPhoneLoading] = useState<Role | null>(null);
  const [chatLanguages, setChatLanguages] = useState<Record<Role, "en" | "hi">>({ Trainee: "en", Trainer: "en", Industry: "en", Institute: "en", Ministry: "en" });
  const [simState, setSimState] = useState<"idle" | "running" | "paused" | "complete">("idle");
  const [simType, setSimType] = useState<"CNC" | "MRI">("CNC");
  const [mriSequence, setMriSequence] = useState("T1 weighted");
  const [sliceLevel, setSliceLevel] = useState(50);
  const [contrast, setContrast] = useState(65);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1200);
  const [feed, setFeed] = useState(0.25);
  const [depth, setDepth] = useState(1.5);
  const [material, setMaterial] = useState("Aluminium 6061");
  const [toolWear, setToolWear] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState("Government ITI Kolhapur");
  const [selectedCourse, setSelectedCourse] = useState("CNC machining");

  useEffect(() => {
    setRole(initialRole);
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get("view");
    setView(initialView === "simulation" ? "Simulation" : initialView === "guidance" ? "Guidance" : "Dashboard");
  }, [initialRole]);
  function navigateView(nextView: View) {
    setView(nextView);
    if (typeof window !== "undefined") window.history.pushState({}, "", `/?role=${role.toLowerCase()}&view=${nextView.toLowerCase()}`);
  }
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("view");
      setView(next === "simulation" ? "Simulation" : next === "guidance" ? "Guidance" : "Dashboard");
      const roleParam = params.get("role");
      const nextRole = roles.find((item) => item.toLowerCase() === roleParam?.toLowerCase());
      if (nextRole) setRole(nextRole);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    if (simState !== "running") return;
    const timer = window.setInterval(() => setProgress(p => {
      const next = Math.min(100, p + 2);
      if (next >= 100) setSimState("complete");
      return next;
    }), 240);
    return () => window.clearInterval(timer);
  }, [simState]);

  const filteredPeople = useMemo(() => people.filter(p => `${p.name} ${p.skill}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const filteredDemands = useMemo(() => demands.filter(d => `${d.title} ${d.detail}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const quality = Math.max(52, Math.min(99, Math.round(98 - Math.abs(speed - 1200) / 55 - Math.abs(feed - 0.25) * 34 - Math.abs(depth - 1.5) * 7 - (toolWear ? 12 : 0) - (material === "Mild steel" ? 3 : 0))));
  const efficiency = Math.max(45, Math.min(99, Math.round(93 - Math.abs(speed - 1200) / 85 - Math.abs(feed - 0.25) * 20 - (toolWear ? 9 : 0))));

  async function askSarthi(e: React.FormEvent) {
    e.preventDefault(); if (!question.trim()) return;
    setChatLoading(true); setAnswer("");
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, role }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not get a response."); setAnswer(data.answer || "No response returned.");
    } catch (err) { setAnswer(err instanceof Error ? err.message : "Sarthi is unavailable right now."); }
    finally { setChatLoading(false); }
  }

  async function askPhoneSarthi(e: React.FormEvent, phoneRole: Role) {
    e.preventDefault();
    const message = phoneDrafts[phoneRole].trim();
    if (!message || phoneLoading) return;
    setPhoneLoading(phoneRole);
    setPhoneAnswers(current => ({ ...current, [phoneRole]: `You asked: ${message}\n\n` }));
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, role: phoneRole, language: chatLanguages[phoneRole] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not get a response.");
      setPhoneAnswers(current => ({ ...current, [phoneRole]: `You asked: ${message}\n\n${data.answer || "No response returned."}` }));
      setPhoneDrafts(current => ({ ...current, [phoneRole]: "" }));
    } catch (err) {
      setPhoneAnswers(current => ({ ...current, [phoneRole]: `You asked: ${message}\n\n${err instanceof Error ? err.message : "Sarthi is unavailable right now."}` }));
    } finally { setPhoneLoading(null); }
  }

  const renderWebChat = (chatRole: Role, inPopup = false) => {
    const cfg = phoneConfig[chatRole];
    const botIntro = chatRole === "Trainee" ? "I can help you build a learning plan, practise safely, and track skills." : chatRole === "Trainer" ? "I can help plan lessons, review learner progress, and prepare assessments." : chatRole === "Industry" ? "I can help translate job requirements into skills and compare demo candidate evidence." : chatRole === "Institute" ? "I can help review outcomes, align courses with demand, and plan institute actions." : "I can help interpret illustrative district indicators and prioritise follow-up.";
    const hindi = chatLanguages[chatRole] === "hi";
    const transcript = phoneAnswers[chatRole] || "";
    const transcriptParts = transcript.split("\n\n");
    const asked = transcript.startsWith("You asked: ") ? transcriptParts[0].replace("You asked: ", "") : "";
    const reply = transcript.startsWith("You asked: ") ? transcriptParts.slice(1).join("\n\n") : transcript;
    return <section className={`yw-webchat ${inPopup ? "yw-webchat-popup-content" : ""}`} aria-label={`${chatRole} Sarthi chat`}>
      <header className="yw-webchat-header"><span className="yw-webchat-avatar">✳</span><div><strong>{cfg.title}</strong><small>{chatRole} workspace · Gemini-powered guidance</small></div><div className="yw-webchat-header-actions"><div className="yw-chat-language-toggle" aria-label="Chat response language"><button type="button" className={!hindi ? "active" : ""} onClick={() => setChatLanguages(current => ({ ...current, [chatRole]: "en" }))}>EN</button><button type="button" className={hindi ? "active" : ""} onClick={() => setChatLanguages(current => ({ ...current, [chatRole]: "hi" }))}>हिन्दी</button></div><span className="yw-webchat-online"><i/> {hindi ? "डेमो सहायक" : "Demo assistant"}</span></div></header>
      <div className="yw-webchat-context"><span className="yw-webchat-context-icon">{cfg.icon}</span><div><b>{hindi ? "आज का फोकस" : cfg.prompt}</b><p>{hindi ? "आपके कार्यक्षेत्र के लिए व्यावहारिक सुझाव और मार्गदर्शन।" : cfg.detail}</p></div></div>
      <div className="yw-webchat-messages" aria-live="polite">
        <div className="yw-webchat-message bot"><span className="yw-webchat-mini-avatar">✳</span><div><small>{hindi ? `सारथी · ${chatRole} सहायक` : `Sarthi · ${chatRole} assistant`}</small><p>{hindi ? "मैं आपके कौशल, प्रशिक्षण और अवसरों से जुड़े सवालों में मदद कर सकता हूँ। अपना प्रश्न लिखें या नीचे दिए गए सुझाव चुनें।" : botIntro}</p></div></div>
        {asked && <div className="yw-webchat-message user"><div><small>You</small><p>{asked}</p></div></div>}
        {reply && (
          <div className="yw-webchat-message bot">
            <span className="yw-webchat-mini-avatar">✳</span>
            <div>
              <small>{hindi ? "सारथी" : "Sarthi"}</small>
              <div className="yw-webchat-bubble">
                <FormattedSarthiAnswer text={reply} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="yw-webchat-suggestions"><span>{hindi ? "यह पूछकर देखें" : "Try asking"}</span>{cfg.chips.map(chip => <button type="button" key={chip} onClick={() => setPhoneDrafts(current => ({ ...current, [chatRole]: chip }))}>{hindi ? (chip === "What should I learn next?" ? "अब मुझे क्या सीखना चाहिए?" : chip === "Help me prepare for CNC" ? "CNC की तैयारी में मदद करें" : chip === "Plan today's class" ? "आज की कक्षा की योजना" : chip === "Create a recap activity" ? "दोहराव गतिविधि बनाएं" : chip === "Find welder candidates" ? "वेल्डर उम्मीदवार खोजें" : chip === "Write a skill requirement" ? "कौशल आवश्यकता लिखें" : chip === "Review placement readiness" ? "प्लेसमेंट तैयारी देखें" : chip === "Suggest course updates" ? "पाठ्यक्रम सुझाव दें" : chip === "Summarise district gaps" ? "जिले के कौशल अंतर बताएं" : "संस्थानों को किस सहायता की ज़रूरत है?" ) : chip}</button>)}</div>
      <form className="yw-webchat-compose" onSubmit={e => askPhoneSarthi(e, chatRole)}><textarea aria-label={`Ask Sarthi as ${chatRole}`} rows={2} value={phoneDrafts[chatRole]} onChange={e => setPhoneDrafts(current => ({ ...current, [chatRole]: e.target.value }))} placeholder={hindi ? `${cfg.title} से प्रश्न पूछें…` : `Ask ${cfg.title} a question…`} /><button type="submit" disabled={phoneLoading !== null || !phoneDrafts[chatRole].trim()}>{phoneLoading === chatRole ? (hindi ? "भेज रहे हैं…" : "Sending…") : (hindi ? "संदेश भेजें ↑" : "Send message ↑")}</button></form>
      <footer className="yw-webchat-footer"><span>✦ {hindi ? "भूमिका-आधारित AI मार्गदर्शन" : "Role-specific AI guidance"}</span><span>{hindi ? "डेमो डेटा उदाहरण के लिए है" : "Prototype data is illustrative"}</span></footer>
    </section>;
  };

  const navItems: { label: string; icon: string; view?: View; action?: () => void }[] = [
    { label: "Dashboard", icon: "▦", view: "Dashboard" },
    { label: role === "Industry" ? "My demands" : role === "Institute" ? "Courses & labs" : role === "Ministry" ? "District insights" : "My learning", icon: "▤", view: "Dashboard" },
    { label: role === "Industry" ? "Candidate radar" : role === "Institute" ? "Learners" : role === "Ministry" ? "Institutions" : "Skill passport", icon: "♧", view: "Dashboard" },
    { label: "Simulations", icon: "◉", view: "Simulation" },
    { label: "Personalised guidance", icon: "✳", view: "Guidance" },
  ];

  if (view === "Dashboard" && role === "Ministry") {
    return (
      <MinistryDashboard
        onBack={onBack}
        onChooseRole={onChooseRole ?? onBack}
        onAskSarthi={() => {
          setView("Guidance");
          setChat(true);
          window.history.pushState({}, "", "/?role=ministry&view=guidance");
        }}
      />
    );
  }

  if (view === "Dashboard" && role === "Industry") {
    return (
      <IndustryDashboard
        onBack={onBack}
        onChooseRole={onChooseRole ?? onBack}
        onOpenSarthi={() => {
          setView("Guidance");
          setChat(true);
          window.history.pushState({}, "", "/?role=industry&view=guidance");
        }}
      />
    );
  }

  return <main className="yw-app">
    <header className="yw-topbar"><div className="yw-brand" onClick={onBack} role="button" tabIndex={0}><span className="yw-brand-mark">Y</span><b>yogya<span>.</span></b></div><div className="yw-top-title"><strong>{view === "Simulation" ? "Simulation Sandbox" : view === "Guidance" ? "Personalised Agentic Guidance" : `${role} Dashboard`}</strong><span>Skills · Experience · Opportunity</span></div><div className="yw-top-controls"><select aria-label="Switch demo role" value={role} onChange={e => { const nextRole = e.target.value as Role; setRole(nextRole); setView("Dashboard"); window.history.pushState({}, "", `/?role=${nextRole.toLowerCase()}`); setDetail(null); }}><option value="Trainee">Trainee</option><option value="Trainer">Trainer</option><option value="Industry">Industry</option><option value="Institute">Institute</option><option value="Ministry">Ministry</option></select><label className="yw-search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skills, candidates..." /></label><button className="yw-primary yw-top-sarthi" onClick={() => setChat(true)}>✳ Sarthi</button><button className="yw-avatar" onClick={onBack} title="Return to home">S</button></div></header>
    <div className="yw-shell"><aside className="yw-sidebar"><div className="yw-org"><div className="yw-org-seal">✦</div><div><strong>{role === "Industry" ? "Gokul Auto Components" : role === "Institute" ? "Govt ITI Kolhapur" : role === "Ministry" ? "Skill Development" : role === "Trainer" ? "Trainer workspace" : "My learning space"}</strong><small>{role === "Ministry" ? "District administration" : "Kolhapur, Maharashtra"}</small></div></div><div className="yw-nav-label">WORKSPACE</div>{navItems.map(item => <button key={item.label} className={`yw-nav-item ${((item.view === view && ((item.view === "Dashboard" && item.label === "Dashboard") || item.view !== "Dashboard")) ? "active" : "")}`} onClick={() => { if (item.view) navigateView(item.view); if (item.label !== "Dashboard" && item.view === "Dashboard") setDetail(item.label); else setDetail(null); }}><span>{item.icon}</span>{item.label}</button>)}<div className="yw-sidebar-bottom"><div className="yw-prototype"><span>●</span><div><b>Prototype mode</b><small>Illustrative sample data</small></div></div><button className="yw-back" onClick={onChooseRole ?? onBack}>↔ Switch workspace</button><button className="yw-back" onClick={onBack}>⌂ Back to landing page</button></div></aside>
    <section className="yw-main">
      {view === "Dashboard" && role === "Institute" && <>
        <div className="yw-page-heading"><div><div className="yw-eyebrow">INSTITUTE WORKSPACE / OVERVIEW</div><h1>Institute Dashboard</h1><p>Track learner outcomes, course alignment, and training capacity.</p></div><div className="yw-heading-actions"><select value={period} onChange={e=>setPeriod(e.target.value)}><option>Last 6 months</option><option>This quarter</option><option>This year</option></select><button className="yw-outline" onClick={()=>setDetail("Export institute report")}>⇩ Export report</button></div></div>
        <div className="yw-kpi-grid"><Kpi icon="◎" label="Placement readiness" value="87%" trend="6% vs last quarter"/><Kpi icon="♧" label="Enrolled trainees" value="640" trend="12% vs last quarter"/><Kpi icon="♙" label="Trainer capacity" value="92%" trend="4% vs last quarter"/><Kpi icon="⚙" label="Equipment uptime" value="92%" trend="3% vs last quarter"/></div>
        <div className="yw-grid institute-grid"><Panel title="LIVE MARKET DEMAND" right={<select className="yw-small-select" value={period} onChange={e=>setPeriod(e.target.value)}><option>Last 6 months</option><option>This quarter</option><option>This year</option></select>}><div className="yw-line-chart"><div className="yw-y-labels"><span>150</span><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div><svg viewBox="0 0 440 190" preserveAspectRatio="none"><g stroke="#e8ecee" strokeDasharray="3 4"><path d="M0 20H440M0 52H440M0 84H440M0 116H440M0 148H440M0 180H440"/></g><polyline points="10,140 92,115 174,94 256,69 338,48 430,25" fill="none" stroke="#ed7d35" strokeWidth="3"/><polyline points="10,155 92,140 174,121 256,105 338,84 430,70" fill="none" stroke="#0b9387" strokeWidth="3"/><polyline points="10,170 92,160 174,149 256,140 338,130 430,120" fill="none" stroke="#8d96a3" strokeWidth="3"/>{[[10,140],[92,115],[174,94],[256,69],[338,48],[430,25]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill="#ed7d35"/>)}<text x="412" y="18" fill="#ed7d35">120</text><text x="412" y="65" fill="#0b9387">85</text><text x="412" y="115" fill="#697686">60</text></svg></div><div className="yw-chart-legend"><span><i className="orange-dot"/> CNC machining</span><span><i/> Welding</span><span><i className="grey-dot"/> Electricians</span></div></Panel>
          <Panel title="LAB & EQUIPMENT STATUS" right={<button className="yw-text-btn" onClick={()=>setDetail("All equipment")}>View all ↗</button>}>{[{n:"CNC lathes",s:"8 of 9 operational",v:89},{n:"Welding bays",s:"12 of 12 operational",v:100},{n:"Milling machines",s:"4 of 6 operational",v:67},{n:"3D printers",s:"1 of 2 operational",v:50}].map((x,i)=><button className="yw-equipment" key={x.n} onClick={()=>setDetail(x.n)}><span className="yw-eq-icon">{["⚙","▧","▥","▦"][i]}</span><span><b>{x.n}</b><small>{x.s}</small></span><div className="yw-progress"><i style={{width:`${x.v}%`,background:x.v<70?"#ed7d35":"#07877d"}}/></div><strong>{x.v}%</strong></button>)}<button className="yw-alert" onClick={()=>setDetail("Equipment maintenance schedule")}>⚠ 2 machines awaiting parts <span>›</span></button></Panel>
          <Panel title="MARKET UPDATES" right={<button className="yw-text-btn" onClick={()=>setDetail("All market updates")}>View all ↗</button>}><div className="yw-updates">{[{t:"Gokul Shivgaon foundry added 120 CNC openings",s:"New expansion expected to create additional demand",time:"2 hours ago"},{t:"EV assembly unit announced battery-tech skills",s:"New entry-level positions expected in the next quarter",time:"1 day ago"},{t:"Textile units shifting to automated looms",s:"Local manufacturers requesting automation training",time:"3 days ago"}].map(x=><button key={x.t} onClick={()=>setDetail(x.t)}><i/><span><b>{x.t}</b><small>{x.s}</small></span><time>{x.time}</time></button>)}</div></Panel>
          <Panel title="STUDENT SKILL LEVELS" right={<span className="yw-badge good">● Active</span>}><div className="yw-levels institute-levels">{[{label:"Advanced",n:22,c:"#087f78"},{label:"Intermediate",n:46,c:"#ed7d35"},{label:"Beginner",n:32,c:"#8d96a3"}].map(x=><div className="yw-level" key={x.label}><span>{x.label}</span><div><i style={{width:`${x.n}%`,background:x.c}}/></div><b>{x.n}%</b></div>)}</div><div className="yw-faculty"><b className="yw-mini-title">FACULTY & TRAINERS</b>{[{n:"S. Patil",v:4.8},{n:"R. Deshmukh",v:4.6},{n:"A. Kulkarni",v:4.4},{n:"J. Joshi",v:4.1}].map(x=><div className="yw-rating" key={x.n}><span>{x.n}</span><div><i style={{width:`${x.v/5*100}%`}}/></div><b>{x.v}</b></div>)}</div></Panel>
          <Panel title="COURSE & SYLLABUS UPDATES" right={<button className="yw-text-btn" onClick={()=>setDetail("Course syllabus")}>View all ↗</button>}><div className="yw-updates">{courses.slice(0,3).map(c=><button key={c.name} onClick={()=>{setSelectedCourse(c.name);setDetail(c.name)}}><span className="yw-eq-icon">▤</span><span><b>{c.name}</b><small>{c.status}</small></span><span className={`yw-badge ${c.tone}`}>{c.tone === "good" ? "Live" : c.tone === "warn" ? "Review" : "Draft"}</span></button>)}</div></Panel>
          <Panel title="RESOURCES ALLOCATED" right={<select className="yw-small-select"><option>This year</option><option>Last year</option></select>}><div className="yw-resource-layout"><div className="yw-donut"><strong>88%</strong></div><div className="yw-resource-legend"><span><i/> Labs <b>40%</b></span><span><i className="orange-dot"/> Workshops <b>35%</b></span><span><i className="grey-dot"/> Training <b>25%</b></span></div></div></Panel>
        </div>
      </>}
      {view === "Dashboard" && (role === "Trainee" || role === "Trainer") && <>
        <div className="yw-page-heading"><div><div className="yw-eyebrow">{role.toUpperCase()} / YOUR WORKSPACE</div><h1>{role === "Trainee" ? "Ready to learn today?" : "Your teaching workspace"}</h1><p>{role === "Trainee" ? "Build practical skills and turn your learning into verified experience." : "Help learners build skills that map to real industry demand."}</p></div><button className="yw-primary" onClick={()=>setChat(true)}>✳ Ask Sarthi</button></div>
        <div className="yw-kpi-grid"><Kpi icon="◎" label={role === "Trainee" ? "Skills completed" : "Learners supported"} value={role === "Trainee" ? "8 / 12" : "124"} trend="Updated this week"/><Kpi icon="◉" label={role === "Trainee" ? "Learning progress" : "Skills to refresh"} value={role === "Trainee" ? "72%" : "6"} trend="Keep it moving"/><Kpi icon="▣" label={role === "Trainee" ? "Projects available" : "Learning resources"} value={role === "Trainee" ? "12" : "18"} trend="Matched to skills"/><Kpi icon="♧" label="Readiness score" value="87%" trend="+5% this month"/></div>
        <div className="yw-grid guidance-grid"><Panel title={role === "Trainee" ? "TODAY'S PLAN" : "TODAY'S TEACHING PLAN"} right={<button className="yw-text-btn" onClick={()=>navigateView("Guidance")}>View roadmap ↗</button>}><div className="yw-plan-list">{(role === "Trainee" ? [{t:"Complete CNC turning basics",s:"Module 3 · 20 min",p:72},{t:"Practice a machine simulation",s:"Hands-on exercise · 15 min",p:0},{t:"Add evidence to your skill passport",s:"Verified skill record · 10 min",p:0}] : [{t:"Review CNC turning module",s:"12 learners need review",p:72},{t:"Schedule a practical assessment",s:"Workshop bay 2 · 30 min",p:0},{t:"Update welding course outcomes",s:"Curriculum alignment · 20 min",p:0}]).map((x,i)=><button className="yw-plan-row" key={x.t} onClick={()=>i===1?navigateView("Simulation"):setDetail(x.t)}><span className={`yw-plan-icon ${i===0?"done":""}`}>{i===0?"✓":i+1}</span><span><b>{x.t}</b><small>{x.s}</small><div className="yw-progress"><i style={{width:`${x.p}%`}}/></div></span><span className="yw-chevron">›</span></button>)}</div></Panel><Panel title="YOUR ROADMAP" right={<span className="yw-badge good">Personalised</span>}><div className="yw-roadmap"><div className="yw-roadmap-step done" onClick={()=>setDetail("Skill Foundations Certificate")}><i>✓</i><span><b>Skill foundations</b><small>Completed · 4 activities</small></span></div><div className="yw-roadmap-step active" onClick={()=>navigateView("Simulation")}><i>2</i><span><b>Practical simulation</b><small>CNC turning · In progress</small></span></div><div className="yw-roadmap-step" onClick={()=>setDetail("Municipal Industry Project")}><i>3</i><span><b>Industry project</b><small>Municipal project experience</small></span></div><div className="yw-roadmap-step" onClick={()=>setDetail("Verified Skill Passport")}><i>4</i><span><b>Verified skill passport</b><small>Build employer-visible evidence</small></span></div></div><button className="yw-primary yw-full" onClick={()=>navigateView("Simulation")}>Start simulation ↗</button></Panel></div>
      </>}
      {view === "Simulation" && <div className="yw-simulation-page"><div className="yw-page-heading"><div><div className="yw-eyebrow">PRACTICAL LEARNING / MODULE 3</div><h1>Simulation Sandbox</h1><p>{simType === "CNC" ? "Practice CNC turning in a safe, simulated training environment." : "Explore MRI anatomy and scan settings in an educational imaging simulation."}</p></div><span className="yw-badge good">✓ Safe practice mode</span></div><div className="yw-simulation-switcher" role="tablist" aria-label="Choose a simulation"><button role="tab" aria-selected={simType === "CNC"} className={simType === "CNC" ? "active" : ""} onClick={() => { setSimType("CNC"); setSimState("idle"); setProgress(0); }}>⚙ CNC turning</button><button role="tab" aria-selected={simType === "MRI"} className={simType === "MRI" ? "active" : ""} onClick={() => { setSimType("MRI"); setSimState("idle"); setProgress(0); }}>✚ MRI scanner</button></div><div className="yw-sim-layout"><aside className="yw-sim-learning"><b className="yw-mini-title">{simType === "CNC" ? "LEARNING PATH · TURNING BASICS" : "LEARNING PATH · MRI BASICS"}</b>{(simType === "CNC" ? [{t:"Machine anatomy",s:"Explore main components"},{t:"Coordinate systems",s:"Understand X, Z axes"},{t:"Tool selection",s:"Choose the right tool"},{t:"Spindle speed and feed",s:"Set cutting parameters"},{t:"First cut simulation",s:"Complete a machining cycle"}] : [{t:"Scanner anatomy",s:"Magnet, bore, and patient table"},{t:"Patient positioning",s:"Center the scan region"},{t:"Choose sequence",s:"T1, T2, or FLAIR contrast"},{t:"Set slice and contrast",s:"Adjust the educational view"},{t:"Run MRI scan",s:"Generate a simulated slice"}]).map((x,i)=><button key={x.t} className={`yw-learning-step ${i===3?"current":i<3?"done":""}`} onClick={()=>setNotice(`Learning step selected: ${x.t}`)}><i>{i<3?"✓":i+1}</i><span><b>{x.t}</b><small>{x.s}</small></span>{i===3&&<em>{progress}%</em>}</button>)}<b className="yw-mini-title yw-concept-title">CONCEPT NOTES</b><details open><summary>{simType === "CNC" ? "Feed rate" : "MRI signal"}</summary><p>{simType === "CNC" ? "Controls how quickly the cutting tool advances across the workpiece. A suitable feed helps balance finish and productivity." : "MRI uses radiofrequency pulses and magnetic-field gradients to encode signals from hydrogen nuclei into image contrast."}</p></details><details><summary>{simType === "CNC" ? "Spindle speed" : "T1 and T2 contrast"}</summary><p>{simType === "CNC" ? "Higher speed can improve productivity but may increase heat and tool wear if poorly matched to the material." : "T1-weighted images often emphasize anatomy and fat signal; T2-weighted images make many fluid-rich structures appear bright."}</p></details><details><summary>{simType === "CNC" ? "Cut depth" : "Slice selection"}</summary><p>{simType === "CNC" ? "Depth of cut affects material removal and cutting forces. Keep within the suggested training range." : "Slice level changes which illustrative axial cross-section is shown. This is a learning visualization, not a patient scan."}</p></details></aside>
          <section className="yw-machine-panel">{simType === "CNC" ? <div className="yw-machine-scene yw-machine-photo-scene"><img src="/cnc-machine-reference.png" alt="CNC turning centre with labelled chuck, spindle, turret and tailstock"/><button className="yw-photo-hotspot yw-photo-start" aria-label="Start CNC operation" onClick={() => { setProgress(0); setSimState("running"); }}> </button><button className="yw-photo-hotspot yw-photo-stop" aria-label="Emergency stop CNC operation" onClick={() => setSimState("paused")}> </button><div className="yw-machine-caption">CNC TURNING CENTRE · INTERACTIVE TRAINING SIMULATION</div></div> : <div className={`yw-mri-scene ${simState === "running" ? "scanning" : ""}`}><div className="yw-mri-room-lights"/><div className="yw-mri-machine"><div className="yw-mri-shell"><div className="yw-mri-bore"><div className="yw-mri-bore-ring"/><div className="yw-mri-patient-bed"><div className="yw-mri-patient"><span/></div></div></div><div className="yw-mri-console-mark">MRI 1.5T</div></div><div className="yw-mri-table"><div/></div></div><svg className="yw-mri-slice" style={{ filter: `contrast(${contrast}%)` }} viewBox="0 0 180 180" role="img" aria-label={`Illustrative axial MRI slice at ${sliceLevel} percent`}><defs><radialGradient id="brainGlow"><stop offset="0" stopColor="#d6d9de"/><stop offset=".55" stopColor="#858d98"/><stop offset="1" stopColor="#222a35"/></radialGradient></defs><rect width="180" height="180" rx="8" fill="#0a111b"/><ellipse cx="90" cy="90" rx={49 + sliceLevel * .12} ry={62 + sliceLevel * .06} fill="url(#brainGlow)" stroke="#c3c9d1" strokeWidth="3"/><path d="M90 31 C70 40 62 56 72 72 C52 81 59 105 78 112 C66 129 81 145 90 145 C99 145 114 129 102 112 C121 105 128 81 108 72 C118 56 110 40 90 31Z" fill="#353e4b" stroke="#e0e4e8" strokeWidth="2"/><path d="M88 58 C74 64 76 81 88 87 M92 58 C106 64 104 81 92 87 M78 101 C70 113 82 126 88 124 M102 101 C110 113 98 126 92 124" fill="none" stroke="#d9dce1" strokeWidth="4" strokeLinecap="round"/><ellipse cx="90" cy="89" rx="10" ry="16" fill="#101722"/><circle cx="90" cy="89" r="4" fill="#a6b6c8"/></svg><div className="yw-mri-label label-magnet">Main magnet</div><div className="yw-mri-label label-bore">Scanner bore</div><div className="yw-mri-label label-table">Patient table</div><div className="yw-mri-label label-slice">Axial slice · {sliceLevel}%</div><div className="yw-mri-caption">MRI SYSTEM · EDUCATIONAL ANATOMY VIEW · NOT FOR DIAGNOSIS</div></div>}<div className="yw-machine-controls"><div className="yw-sim-status"><span className={simState === "running" ? "live" : ""}/><b>{simState === "running" ? (simType === "CNC" ? "Machining cycle running" : "MRI acquisition running") : simState === "paused" ? "Simulation paused" : simState === "complete" ? (simType === "CNC" ? "Cycle complete" : "Scan complete") : (simType === "CNC" ? "Machine ready" : "Scanner ready")}</b><small>{progress}% complete</small></div><div className="yw-sim-progress"><i style={{width:`${progress}%`}}/></div><div className="yw-sim-buttons">{simState === "running" ? <button className="yw-outline" onClick={()=>setSimState("paused")}>Ⅱ Pause</button> : simState === "paused" ? <button className="yw-primary" onClick={()=>setSimState("running")}>▶ Resume</button> : simState === "complete" ? <button className="yw-primary" onClick={()=>{setProgress(0);setSimState("idle")}}>↻ Run again</button> : <button className="yw-primary" onClick={()=>{setProgress(0);setSimState("running")}}>▶ Start operation</button>}<button className="yw-stop" onClick={()=>setSimState("paused")}>■ Stop</button><button className="yw-icon-button" onClick={()=>{setSimState("idle");setProgress(0);setNotice("")}}>↻ Reset view</button></div></div>{simState === "complete" && <div className="yw-result-banner"><b>{simType === "CNC" ? `Cycle complete · ${quality}/100 quality score` : `MRI scan complete · ${Math.min(99, 78 + Math.round(contrast / 8))}/100 image clarity`}</b><span>{simType === "CNC" ? `Estimated efficiency ${efficiency}% · ${quality>=85?"Within training tolerance":"Review parameters and try again"}` : `${mriSequence} · slice ${sliceLevel}% · illustrative image only, not a diagnosis`}</span><button onClick={()=>setDetail(simType === "CNC" ? "CNC Simulation Completion Audit" : "MRI Learning Performance Report")}>View report ↗</button></div>}</section>
          <aside className="yw-sim-properties">{simType === "CNC" ? <><b className="yw-mini-title">MACHINE PROPERTIES</b><label className="yw-range-label"><span>Spindle speed (RPM)</span><b>{speed}</b></label><input type="range" min="400" max="3000" step="100" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/><div className="yw-range-limits"><span>400</span><span>3000</span></div><label className="yw-range-label"><span>Feed rate (mm/rev)</span><b>{feed.toFixed(2)}</b></label><input type="range" min="0.05" max="0.6" step="0.01" value={feed} onChange={e=>setFeed(Number(e.target.value))}/><div className="yw-range-limits"><span>0.05</span><span>0.60</span></div><label className="yw-range-label"><span>Cut depth (mm)</span><b>{depth.toFixed(1)}</b></label><input type="range" min="0.5" max="4" step="0.1" value={depth} onChange={e=>setDepth(Number(e.target.value))}/><div className="yw-range-limits"><span>0.5</span><span>4.0</span></div><label className="yw-select-label">Material<select value={material} onChange={e=>setMaterial(e.target.value)}><option>Aluminium 6061</option><option>Mild steel</option><option>Brass</option></select></label><label className="yw-toggle"><span>Worn cutting tool</span><input type="checkbox" checked={toolWear} onChange={e=>setToolWear(e.target.checked)}/><i/></label><div className="yw-property-results"><b className="yw-mini-title">LIVE ESTIMATES</b><div><span>Predicted quality</span><b>{quality}/100</b></div><div className="yw-progress"><i style={{width:`${quality}%`}}/></div><div><span>Cycle efficiency</span><b>{efficiency}%</b></div><div className="yw-progress"><i style={{width:`${efficiency}%`}}/></div>{(speed>2200||feed>0.45||depth>3.2||toolWear)&&<p className="yw-safety-warning">⚠ Parameters may increase tool wear or reduce surface quality. Review settings before starting.</p>}</div><div className="yw-movable"><b className="yw-mini-title">MOVABLE PARTS</b>{["Chuck jaws","Turret","Carriage","Tailstock"].map((x,i)=><div key={x}><span>◉</span>{x}<small>{["Open / close","Rotate tool","Adjust X / Z","Advance 40 mm"][i]}</small><button onClick={()=>setNotice(`${x} control activated in demo mode`)}>↔</button></div>)}</div></> : <><b className="yw-mini-title">MRI SCAN PARAMETERS</b><label className="yw-select-label">Pulse sequence<select value={mriSequence} onChange={e=>setMriSequence(e.target.value)}><option>T1 weighted</option><option>T2 weighted</option><option>FLAIR</option><option>Diffusion (DWI)</option></select></label><label className="yw-range-label"><span>Slice level</span><b>{sliceLevel}%</b></label><input type="range" min="10" max="90" step="5" value={sliceLevel} onChange={e=>setSliceLevel(Number(e.target.value))}/><div className="yw-range-limits"><span>Lower</span><span>Upper</span></div><label className="yw-range-label"><span>Image contrast</span><b>{contrast}%</b></label><input type="range" min="20" max="100" step="5" value={contrast} onChange={e=>setContrast(Number(e.target.value))}/><div className="yw-property-results"><b className="yw-mini-title">SCAN PREVIEW</b><div><span>Sequence</span><b>{mriSequence}</b></div><div><span>Slice position</span><b>{sliceLevel}%</b></div><div><span>Contrast setting</span><b>{contrast}%</b></div><p className="yw-safety-warning">Educational demonstration only. No patient data, medical interpretation, or diagnostic output.</p></div><div className="yw-movable"><b className="yw-mini-title">LABELLED COMPONENTS</b>{["Main magnet","Gradient coils","RF coil","Patient table"].map((x,i)=><div key={x}><span>◉</span>{x}<small>{["Creates static magnetic field","Encodes spatial position","Transmits and receives RF","Positions scan region"][i]}</small><button onClick={()=>setNotice(`${x}: ${["Strong static field aligns hydrogen nuclei.","Gradient coils spatially encode the MRI signal.","RF coils transmit pulses and receive signal.","Patient table moves the scan region into the bore."][i]}`)}>i</button></div>)}</div></>}</aside></div></div>}
      {view === "Guidance" && <div className="yw-guidance-page yw-web-guidance-page">
        <div className="yw-page-heading"><div><div className="yw-eyebrow">SARTHI · {role.toUpperCase()} ASSISTANT</div><h1>{phoneConfig[role].title}</h1><p>A dedicated web chat for the {role.toLowerCase()} workspace. Only this role's assistant is shown.</p></div><span className="yw-guidance-role-pill">✳ {role} workspace</span></div>
        <div className="yw-webchat-page-layout"><aside className="yw-webchat-sidebar"><div className="yw-webchat-sidebar-icon">✳</div><h2>Sarthi AI</h2><p>Your role-aware assistant for skills, training and opportunity.</p><div className="yw-webchat-sidebar-stat"><span>Assistant</span><b>{role}</b></div><div className="yw-webchat-sidebar-stat"><span>Response style</span><b>Practical guidance</b></div><div className="yw-webchat-sidebar-note">AI-generated responses can be inaccurate. Verify important decisions.</div></aside><div className="yw-webchat-main">{renderWebChat(role)}</div></div>
      </div>}
      {notice && <div className="yw-toast" role="status"><span>✓</span>{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </section></div>
    {detail && <div className="yw-modal-backdrop" onClick={()=>setDetail(null)}><section className="yw-modal" onClick={e=>e.stopPropagation()}><button className="yw-modal-close" onClick={()=>setDetail(null)}>✕</button><span className="yw-eyebrow">YOGYA · VERIFIED RECORD</span><h2>{detail}</h2>{detail === "Verified Skill Passport" ? (
      <div style={{ padding: "8px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 12, borderRadius: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <strong style={{ color: "#166534" }}>Cryptographically Verified Skill Passport</strong>
            <div style={{ fontSize: 12, color: "#15803d" }}>Pass ID: IND-MH-KLH-2026-88492 · NSQF L4 Certified</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
          <b>Verified Competencies:</b>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 14px" }}>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Fanuc 0i CNC Turning (Score: 94%)</span>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>GD&T Blueprint Reading (Score: 88%)</span>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Industrial Safety ISO 45001</span>
          </div>
        </div>
        <div style={{ background: "#f8fafc", padding: 10, borderRadius: 6, fontSize: 12, color: "#64748b" }}>
          Verified by Govt ITI Kolhapur & Gokul Auto Components. Visible to 48 registered employers in Kolhapur district.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="yw-primary" style={{ flex: 1 }} onClick={() => { setDetail(null); setNotice("Skill Passport downloaded as PDF badge."); }}>⇩ Export Passport PDF</button>
          <button className="yw-outline" style={{ flex: 1 }} onClick={() => { setDetail(null); setNotice("Shareable verification link copied to clipboard."); }}>🔗 Share Profile</button>
        </div>
      </div>
    ) : detail.includes("Completion") || detail.includes("Report") ? (
      <div style={{ padding: "8px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div><small style={{ color: "#64748b" }}>Quality Score</small><strong style={{ display: "block", fontSize: 18, color: "#07877d" }}>{quality}/100</strong></div>
          <div><small style={{ color: "#64748b" }}>Efficiency</small><strong style={{ display: "block", fontSize: 18, color: "#ed7d35" }}>{efficiency}%</strong></div>
          <div><small style={{ color: "#64748b" }}>Tolerance</small><strong style={{ display: "block", fontSize: 18 }}>±0.02 mm</strong></div>
        </div>
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          The turning cycle was executed with spindle speed at {speed} RPM and feed at {feed} mm/rev on {material}. Toolpath offsets and surface finish met training benchmarks.
        </p>
        <button className="yw-primary" style={{ width: "100%", marginTop: 12 }} onClick={() => { setDetail(null); setNotice("Practical evidence attached to your Skill Passport!"); }}>
          ✓ Add Evidence to Skill Passport ↗
        </button>
      </div>
    ) : detail.toLowerCase().includes("demand")||detail.toLowerCase().includes("create")||detail.toLowerCase().includes("add a new") ? <form onSubmit={e=>{e.preventDefault();setDetail(null);setNotice("Demo demand saved locally.")}} className="yw-detail-form"><label>Skill / requirement<input defaultValue={detail.includes("demand")?"CNC operator":""} placeholder="e.g. CNC operator" required/></label><label>Openings<input type="number" min="1" defaultValue="10" required/></label><label>Priority<select defaultValue="High"><option>High</option><option>Medium</option><option>Low</option></select></label><button className="yw-primary">Save demo demand</button></form> : <><p>This panel shows illustrative prototype details for <b>{detail}</b>. Live records and integrations can be connected in a later version.</p><div className="yw-detail-stats"><span><small>Status</small><b>Demo record</b></span><span><small>Location</small><b>Kolhapur</b></span><span><small>Last updated</small><b>Today</b></span></div><button className="yw-primary" onClick={()=>{setDetail(null);setNotice(`Opened ${detail}`)}}>Confirm and return</button></>}</section></div>}
    {chat && <div className="yw-webchat-modal-backdrop" role="presentation" onClick={() => setChat(false)}><section className="yw-webchat-modal" role="dialog" aria-modal="true" aria-label={`${role} Sarthi assistant`} onClick={e => e.stopPropagation()}><button className="yw-webchat-modal-close" onClick={() => setChat(false)} aria-label="Close Sarthi assistant">✕</button>{renderWebChat(role, true)}</section></div>}
  </main>;
}

