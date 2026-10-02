"use client";

import { useEffect, useState } from "react";
import ReferenceWorkspace from "./components/ReferenceWorkspace";
import { FormattedSarthiAnswer } from "./components/FormattedMarkdown";
import "./components/reference-workspace.css";

type Role = "Trainee" | "Trainer" | "Institute" | "Industry" | "Ministry";

const roles: { name: Role; icon: string; detail: string }[] = [
  { name: "Trainee", icon: "🎓", detail: "Build skills, projects, and a career roadmap" },
  { name: "Trainer", icon: "🧑‍🏫", detail: "Explore industry-aligned teaching resources" },
  { name: "Institute", icon: "🏛️", detail: "Track outcomes, capacity, and course alignment" },
  { name: "Industry", icon: "🏭", detail: "Discover verified talent and emerging skills" },
  { name: "Ministry", icon: "📍", detail: "Explore district-level workforce insights" },
];

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLang, setChatLang] = useState<"en" | "hi">("en");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function askGemini(e: React.FormEvent, customQ?: string) {
    if (e?.preventDefault) e.preventDefault();
    const q = (typeof customQ === "string" ? customQ : question).trim();
    if (!q) return;
    setLoading(true); setAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, role: "Trainee", language: chatLang }),
      });
      const data = await res.json();
      if (!res.ok && !data.answer) throw new Error(data.error || "Could not get a response.");
      setAnswer(data.answer || "No response received.");
    } catch (err) {
      setAnswer(err instanceof Error ? err.message : "Something went wrong.");
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

          {/* Floating Sarthi Button on Landing Page */}
          <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 90 }}>
            <button
              onClick={() => setChatOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#087f78",
                color: "#ffffff",
                border: "1px solid #066963",
                borderRadius: "999px",
                padding: "12px 18px",
                fontSize: "13px",
                fontWeight: 650,
                boxShadow: "0 8px 24px rgba(8, 127, 120, 0.35)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "16px" }}>✳</span>
              <span>Ask Sarthi AI Guide</span>
            </button>
          </div>

          {/* Landing Page Sarthi Modal */}
          {chatOpen && (
            <div className="ind-modal-overlay" onClick={() => setChatOpen(false)}>
              <div
                className="ind-drawer-right"
                onClick={(e) => e.stopPropagation()}
                style={{ width: "min(460px, 95vw)", display: "flex", flexDirection: "column" }}
              >
                <div className="ind-modal-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px", color: "#087f78" }}>✳</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "15px" }}>{chatLang === "hi" ? "सारथी AI मार्गदर्शक" : "Sarthi AI Platform Guide"}</h3>
                      <small style={{ color: "#64748b" }}>{chatLang === "hi" ? "Gemini-संचालित राष्ट्रीय कौशल सलाहकार" : "Powered by Gemini · National Skills Advisor"}</small>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", border: "1px solid #d8e9e6", borderRadius: "999px", overflow: "hidden", background: "#f6fbfa" }}>
                      <button
                        type="button"
                        style={{
                          padding: "3px 8px",
                          fontSize: "11px",
                          fontWeight: chatLang === "en" ? 700 : 500,
                          background: chatLang === "en" ? "#087f78" : "transparent",
                          color: chatLang === "en" ? "#fff" : "#4b6066",
                          border: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => setChatLang("en")}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: "3px 8px",
                          fontSize: "11px",
                          fontWeight: chatLang === "hi" ? 700 : 500,
                          background: chatLang === "hi" ? "#087f78" : "transparent",
                          color: chatLang === "hi" ? "#fff" : "#4b6066",
                          border: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => setChatLang("hi")}
                      >
                        हिन्दी
                      </button>
                    </div>
                    <button onClick={() => setChatOpen(false)} style={{ background: "transparent", border: 0, fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
                  </div>
                </div>

                <div style={{ padding: "16px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {chatLang === "hi" ? (
                      <>
                        <button
                          type="button"
                          className="ind-hint-chip"
                          onClick={() => {
                            const q = "योग्या प्लेटफॉर्म क्या है और यह युवाओं के कौशल में कैसे मदद करता है?";
                            setQuestion(q);
                            askGemini(null as any, q);
                          }}
                        >
                          योग्या प्लेटफॉर्म क्या है? ↗
                        </button>
                        <button
                          type="button"
                          className="ind-hint-chip"
                          onClick={() => {
                            const q = "NSQF लेवल 4 और 5 सर्टिफिकेशन के क्या लाभ हैं?";
                            setQuestion(q);
                            askGemini(null as any, q);
                          }}
                        >
                          NSQF सर्टिफिकेशन लाभ ↗
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="ind-hint-chip"
                          onClick={() => {
                            const q = "What is Yogya and how does it bridge skills with industry jobs?";
                            setQuestion(q);
                            askGemini(null as any, q);
                          }}
                        >
                          What is Yogya? ↗
                        </button>
                        <button
                          type="button"
                          className="ind-hint-chip"
                          onClick={() => {
                            const q = "How do NSQF Level 4/5 certifications work in manufacturing?";
                            setQuestion(q);
                            askGemini(null as any, q);
                          }}
                        >
                          NSQF certification benefits ↗
                        </button>
                      </>
                    )}
                  </div>

                  <form onSubmit={askGemini} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <textarea
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={chatLang === "hi" ? "सारथी से कोई भी प्रश्न पूछें..." : "Ask Sarthi anything about skills, certifications, or roles..."}
                      className="ind-sarthi-textarea"
                    />
                    <button type="submit" disabled={loading} className="ind-sarthi-submit-btn">
                      {loading ? (chatLang === "hi" ? "उत्तर तैयार कर रहे हैं..." : "Consulting Sarthi...") : (chatLang === "hi" ? "प्रश्न पूछें ↗" : "Ask Sarthi ↗")}
                    </button>
                  </form>

                  {answer && (
                    <div className="ind-sarthi-answer-box">
                      <h4>{chatLang === "hi" ? "सारथी का उत्तर" : "Sarthi's Guidance"}</h4>
                      <div className="ind-sarthi-answer-text">
                        <FormattedSarthiAnswer text={answer} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <footer className="footer"><a className="brand" href="#"><span className="brand-mark">Y</span> yogya<span className="brand-dot">.</span></a><span>Skills today. Possibilities tomorrow.</span><span>Demo prototype · 2026</span></footer>
        </>
      ) : (
        <ReferenceWorkspace role={role} onBack={goHome} onChooseRole={goRoles} />
      )}
    </main>
  );
}
