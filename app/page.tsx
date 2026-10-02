"use client";

import { useEffect, useState } from "react";
import ReferenceWorkspace from "./components/ReferenceWorkspace";
import "./components/reference-workspace.css";

type Role = "Trainee" | "Trainer" | "Institute" | "Industry" | "Ministry";

const roles: { name: Role; icon: string; detail: string }[] = [
  { name: "Trainee", icon: "🎓", detail: "Build skills, projects, and a career roadmap" },
  { name: "Trainer", icon: "🧑‍🏫", detail: "Explore industry-aligned teaching resources" },
  { name: "Institute", icon: "🏛️", detail: "Track outcomes, capacity, and course alignment" },
  { name: "Industry", icon: "🏭", detail: "Discover verified talent and emerging skills" },
  { name: "Ministry", icon: "📍", detail: "Explore district-level workforce insights" },
];

const dashboardData: Record<Role, { title: string; subtitle: string; stats: [string, string][]; tasks: string[] }> = {
  Trainee: { title: "Your growth dashboard", subtitle: "A clearer path from learning to meaningful work.", stats: [["Skills matched", "8"], ["Learning progress", "72%"], ["Projects available", "12"]], tasks: ["Complete your skill profile", "Explore a municipal project", "Review your AI career roadmap"] },
  Trainer: { title: "Trainer workspace", subtitle: "Keep learning practical and aligned with industry.", stats: [["Learners", "124"], ["Skills to refresh", "6"], ["Resources", "18"]], tasks: ["Review emerging skill alerts", "Open a simulation exercise", "Plan an alumni-led workshop"] },
  Institute: { title: "Institute overview", subtitle: "Connect course capacity with changing skill demand.", stats: [["Learners tracked", "1,240"], ["Placement readiness", "78%"], ["Programs reviewed", "14"]], tasks: ["Review course-to-skill alignment", "Check lab and trainer capacity", "View placement trends"] },
  Industry: { title: "Industry talent hub", subtitle: "Find relevant skills and connect with emerging talent.", stats: [["Matched candidates", "48"], ["Skills in demand", "12"], ["Open projects", "5"]], tasks: ["Browse candidate matches", "Post a sample project", "Review district skill signals"] },
  Ministry: { title: "District skill intelligence", subtitle: "Turn workforce signals into evidence-led planning.", stats: [["Institutions", "32"], ["Priority skills", "16"], ["Projects tracked", "27"]], tasks: ["Review district demand", "Compare institutional outcomes", "Explore local project impact"] },
};

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  function syncUrl(url: string, replace = false) {
    if (typeof window === "undefined") return;
    if (replace) window.history.replaceState({}, "", url);
    else window.history.pushState({}, "", url);
  }
  function goHome() {
    setRole(null); setShowRoleSelection(false); setChatOpen(false);
    syncUrl("/"); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goRoles() {
    setRole(null); setShowRoleSelection(true); setChatOpen(false);
    syncUrl("/?view=roles"); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goRole(nextRole: Role) {
    setRole(nextRole); setShowRoleSelection(false); setChatOpen(false);
    syncUrl(`/?role=${nextRole.toLowerCase()}`); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    const readLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      const matched = roles.find((item) => item.name.toLowerCase() === roleParam?.toLowerCase());
      setRole(matched?.name ?? null);
      setShowRoleSelection(!matched && params.get("view") === "roles");
      setChatOpen(false);
    };
    readLocation();
    window.addEventListener("popstate", readLocation);
    return () => window.removeEventListener("popstate", readLocation);
  }, []);

  async function askGemini(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true); setAnswer(""); setNotice("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, role: role ?? "Trainee" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not get a response.");
      setAnswer(data.answer);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  }

  return (
    <main>
      {!role && showRoleSelection ? (
        <section className="role-selection-page">
          <nav className="role-selection-nav">
            <a className="brand role-page-brand" href="#" onClick={(event) => { event.preventDefault(); goHome(); }}><span className="brand-mark">Y</span> yogya<span className="brand-dot">.</span></a>
            <div className="role-page-nav-actions"><span>Choose your workspace</span><button onClick={goHome}>← Back to home</button></div>
          </nav>
          <div className="role-selection-content">
            <div className="section-kicker">YOUR YOGYA WORKSPACE</div>
            <h1>Choose your path.<br/><em>Make it yours.</em></h1>
            <p>Select a role to explore its dashboard, sample data, practical tools, and personalised guidance.</p>
            <div className="role-selection-grid">{roles.map((item, index) => <button className="role-selection-card" key={item.name} onClick={() => goRole(item.name)}><span className="role-selection-number">0{index + 1}</span><span className="role-selection-icon">{item.icon}</span><strong>{item.name}</strong><span className="role-selection-detail">{item.detail}</span><span className="role-selection-arrow">Explore workspace ↗</span></button>)}</div>
            <div className="role-selection-note"><span>✳</span> Prototype environment · All dashboard figures are illustrative sample data</div>
          </div>
        </section>
      ) : !role ? (
        <>
          <section className="hero">
            <nav className="topbar">
              <a className="brand" href="#" aria-label="Yogya home"><span className="brand-mark">Y</span> yogya<span className="brand-dot">.</span></a>
              <div className="nav-links"><a href="#how">How it works</a><button className="nav-cta" onClick={goRoles}>Get started ↗</button></div>
            </nav>
            <div className="hero-content">
              <div className="eyebrow"><span className="pulse"></span> SKILLS · EXPERIENCE · OPPORTUNITY</div>
              <h1>Make your skills<br /> <em>mean something.</em></h1>
              <p className="hero-copy">A bridge between what the world needs and what you can become. Learn with purpose, build real experience, and move forward with Yogya.</p>
              <div className="hero-actions"><button className="primary-btn" onClick={goRoles}>Explore your path <span>↗</span></button><a className="text-link" href="#how">Discover Yogya <span>↓</span></a></div>
              <div className="hero-foot"><span>✳ Built for India’s evolving workforce</span><span>Prototype preview · Sample data</span></div>
            </div>
            <div className="hero-shade"></div>
            <div className="hero-index">01 / THE NEXT CHAPTER</div>
          </section>

          <section className="intro section-wrap" id="how">
            <div className="section-kicker">A more connected future</div>
            <div className="intro-grid"><h2>From learning<br />to <em>doing.</em></h2><p>Yogya brings trainees, trainers, institutes, employers, and public planners into one connected ecosystem. So skills grow alongside real opportunities.</p></div>
            <div className="feature-row">
              <article><span className="feature-icon">↗</span><h3>Follow the signal</h3><p>Understand which skills are emerging in the job market.</p></article>
              <article><span className="feature-icon">✳</span><h3>Learn by doing</h3><p>Build evidence through projects and practical simulations.</p></article>
              <article><span className="feature-icon">◎</span><h3>Find your people</h3><p>Connect learners, educators, and employers around shared goals.</p></article>
            </div>
          </section>

          <footer className="footer"><a className="brand" href="#"><span className="brand-mark">Y</span> yogya<span className="brand-dot">.</span></a><span>Skills today. Possibilities tomorrow.</span><span>Demo prototype · 2026</span></footer>
        </>
      ) : (
        <ReferenceWorkspace role={role} onBack={goHome} onChooseRole={goRoles} />
      )}
    </main>
  );
}
