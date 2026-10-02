"use client";

import React, { useState, useMemo } from "react";

interface IndustryDashboardProps {
  onBack: () => void;
  onOpenSarthi: () => void;
}

export default function IndustryDashboard({ onBack, onOpenSarthi }: IndustryDashboardProps) {
  // Navigation & Filter state
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedCompany, setSelectedCompany] = useState("Gokul Auto Components Pvt Ltd");
  const [searchQuery, setSearchQuery] = useState("");
  const [candidatePool, setCandidatePool] = useState("Current candidate pool");
  
  // Modals & Drawers
  const [showAddDemandModal, setShowAddDemandModal] = useState(false);
  const [showCourseChangeModal, setShowCourseChangeModal] = useState(false);
  const [selectedDemandDetail, setSelectedDemandDetail] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Sarthi AI inside dashboard
  const [sarthiOpen, setSarthiOpen] = useState(false);
  const [sarthiQuery, setSarthiQuery] = useState("");
  const [sarthiResponse, setSarthiResponse] = useState("");
  const [sarthiLoading, setSarthiLoading] = useState(false);

  // Form states
  const [newDemandTitle, setNewDemandTitle] = useState("");
  const [newDemandOpenings, setNewDemandOpenings] = useState("10");
  const [newDemandLevel, setNewDemandLevel] = useState("NSQF L4");
  const [newDemandUrgent, setNewDemandUrgent] = useState(false);

  const [courseChangeText, setCourseChangeText] = useState("");

  // Demands list data
  const [demands, setDemands] = useState([
    {
      id: "cnc",
      title: "CNC operators",
      subtitle: "NSQF L4, Fanuc certified",
      openings: 20,
      urgent: true,
      iconType: "gear",
    },
    {
      id: "welders",
      title: "Welders",
      subtitle: "MIG/TIG, 1G-3G positions",
      openings: 12,
      urgent: false,
      iconType: "welder",
    },
    {
      id: "inspectors",
      title: "Quality inspectors",
      subtitle: "CMM operation",
      openings: 5,
      urgent: false,
      iconType: "inspect",
    },
  ]);

  const filteredDemands = useMemo(() => {
    if (!searchQuery.trim()) return demands;
    const q = searchQuery.toLowerCase();
    return demands.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q)
    );
  }, [demands, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const handleAddDemand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemandTitle.trim()) return;
    const newItem = {
      id: "demand-" + Date.now(),
      title: newDemandTitle,
      subtitle: `${newDemandLevel}, Industry specification`,
      openings: parseInt(newDemandOpenings) || 5,
      urgent: newDemandUrgent,
      iconType: "gear",
    };
    setDemands([newItem, ...demands]);
    setShowAddDemandModal(false);
    setNewDemandTitle("");
    showToast(`Added demand for ${newItem.title} (${newItem.openings} openings)`);
  };

  const handleSendCourseChange = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCourseChangeModal(false);
    setCourseChangeText("");
    showToast("Curriculum update proposal transmitted to Govt ITI Kolhapur Board of Studies.");
  };

  const handleAskSarthi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sarthiQuery.trim()) return;
    setSarthiLoading(true);
    setSarthiResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sarthiQuery,
          role: "Industry",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not get a response.");
      setSarthiResponse(data.answer);
    } catch (err) {
      setSarthiResponse(err instanceof Error ? err.message : "Error querying Sarthi AI.");
    } finally {
      setSarthiLoading(false);
    }
  };

  return (
    <div className="ind-dashboard-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ind-toast-notification">
          <span className="ind-toast-icon">✓</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ind-toast-close">✕</button>
        </div>
      )}

      {/* Main Container */}
      <div className="ind-container">
        {/* Left Sidebar */}
        <aside className="ind-sidebar">
          <div className="ind-sidebar-top">
            <nav className="ind-nav-menu">
              <button
                className={`ind-nav-item ${activeNav === "Dashboard" ? "active" : ""}`}
                onClick={() => setActiveNav("Dashboard")}
              >
                <span className="ind-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </span>
                <span className="ind-nav-label">Dashboard</span>
              </button>

              <button
                className={`ind-nav-item ${activeNav === "My demands" ? "active" : ""}`}
                onClick={() => setActiveNav("My demands")}
              >
                <span className="ind-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </span>
                <span className="ind-nav-label">My demands</span>
              </button>

              <button
                className={`ind-nav-item ${activeNav === "Institutes" ? "active" : ""}`}
                onClick={() => setActiveNav("Institutes")}
              >
                <span className="ind-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M3 10h18"></path>
                    <path d="M5 6l7-3 7 3"></path>
                    <path d="M4 10v11"></path>
                    <path d="M20 10v11"></path>
                    <path d="M8 14v4"></path>
                    <path d="M12 14v4"></path>
                    <path d="M16 14v4"></path>
                  </svg>
                </span>
                <span className="ind-nav-label">Institutes</span>
              </button>

              <button
                className={`ind-nav-item ${activeNav === "Candidate radar" ? "active" : ""}`}
                onClick={() => setActiveNav("Candidate radar")}
              >
                <span className="ind-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <span className="ind-nav-label">Candidate radar</span>
              </button>

              <button
                className={`ind-nav-item ${activeNav === "Course validation" ? "active" : ""}`}
                onClick={() => setActiveNav("Course validation")}
              >
                <span className="ind-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </span>
                <span className="ind-nav-label">Course validation</span>
              </button>

              <button
                className={`ind-nav-item ${activeNav === "Hiring history" ? "active" : ""}`}
                onClick={() => setActiveNav("Hiring history")}
              >
                <span className="ind-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <span className="ind-nav-label">Hiring history</span>
              </button>
            </nav>

            {/* Sidebar Bottom Action Buttons */}
            <div className="ind-sidebar-actions">
              <button
                className="ind-action-link"
                onClick={() => setShowAddDemandModal(true)}
              >
                <span className="ind-action-plus">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
                <span>Add demand</span>
              </button>

              <button
                className="ind-action-link"
                onClick={() => setShowCourseChangeModal(true)}
              >
                <span className="ind-action-pencil">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </span>
                <span>Request course change</span>
              </button>
            </div>
          </div>

          <div className="ind-sidebar-foot">
            <button className="ind-back-btn" onClick={onBack}>
              <span>←</span> Yogya All Roles
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="ind-main-pane">
          {/* Top Header */}
          <header className="ind-header">
            <div className="ind-header-left">
              <h1 className="ind-header-title">Industry Dashboard</h1>
              <div className="ind-org-select-wrapper">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="ind-org-select"
                >
                  <option value="Gokul Auto Components Pvt Ltd">Gokul Auto Components Pvt Ltd</option>
                  <option value="Shiroli Precision Hub">Shiroli Precision Hub</option>
                  <option value="Kagal Auto Engineering">Kagal Auto Engineering</option>
                  <option value="Kolhapur Foundry Cluster">Kolhapur Foundry Cluster</option>
                </select>
                <span className="ind-select-chevron">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </div>

            <div className="ind-header-right">
              <div className="ind-search-box">
                <span className="ind-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search institutes, candidates, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ind-search-input"
                />
              </div>

              <button
                className="ind-sarthi-quick-btn"
                onClick={() => setSarthiOpen(!sarthiOpen)}
                title="Open Sarthi AI Assistant"
              >
                <span>✳</span> Sarthi AI
              </button>

              <div className="ind-user-profile">
                <div className="ind-avatar-circle" title="Suresh Patil - HR Director">
                  S
                </div>
                <span className="ind-profile-chevron">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </div>
          </header>

          {/* KPI Cards Row (4 cards) */}
          <section className="ind-kpi-row">
            {/* KPI 1: Open requisitions 12 */}
            <div className="ind-kpi-card">
              <div className="ind-kpi-left">
                <div className="ind-kpi-icon-wrap orange-tint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e86328" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <div className="ind-kpi-text">
                  <span className="ind-kpi-label">Open requisitions</span>
                  <span className="ind-kpi-value">12</span>
                </div>
              </div>
              <div className="ind-kpi-sparkline">
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path
                    d="M 2 22 Q 15 24, 25 15 T 45 12 T 58 4"
                    fill="none"
                    stroke="#eb6b2e"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 2: Candidates matched 48 */}
            <div className="ind-kpi-card">
              <div className="ind-kpi-left">
                <div className="ind-kpi-icon-wrap teal-tint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="ind-kpi-text">
                  <span className="ind-kpi-label">Candidates matched</span>
                  <span className="ind-kpi-value">48</span>
                </div>
              </div>
              <div className="ind-kpi-sparkline">
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path
                    d="M 2 24 Q 16 22, 28 14 T 46 10 T 58 3"
                    fill="none"
                    stroke="#008075"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 3: Hired this quarter 9 */}
            <div className="ind-kpi-card">
              <div className="ind-kpi-left">
                <div className="ind-kpi-icon-wrap teal-tint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div className="ind-kpi-text">
                  <span className="ind-kpi-label">Hired this quarter</span>
                  <span className="ind-kpi-value">9</span>
                </div>
              </div>
              <div className="ind-kpi-sparkline">
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path
                    d="M 2 23 Q 18 20, 30 16 T 46 8 T 58 4"
                    fill="none"
                    stroke="#008075"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 4: Proof reviews pending 5 */}
            <div className="ind-kpi-card">
              <div className="ind-kpi-left">
                <div className="ind-kpi-icon-wrap orange-tint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e86328" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <circle cx="12" cy="14" r="2.5"></circle>
                    <line x1="12" y1="16.5" x2="12" y2="18.5"></line>
                  </svg>
                </div>
                <div className="ind-kpi-text">
                  <span className="ind-kpi-label">Proof reviews pending</span>
                  <span className="ind-kpi-value">5</span>
                </div>
              </div>
              <div className="ind-kpi-sparkline">
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path
                    d="M 2 20 Q 14 25, 26 18 T 44 14 T 58 6"
                    fill="none"
                    stroke="#eb6b2e"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </section>

          {/* Two-Column Grid Content */}
          <section className="ind-grid-layout">
            {/* LEFT COLUMN */}
            <div className="ind-column-left">
              {/* Card 1: Our Demands - What the market expects */}
              <div className="ind-card ind-demands-card">
                <div className="ind-card-header">
                  <h2 className="ind-card-heading">OUR DEMANDS - WHAT THE MARKET EXPECTS</h2>
                  <button
                    className="ind-link-btn"
                    onClick={() => setActiveNav("My demands")}
                  >
                    View all <span>→</span>
                  </button>
                </div>

                <div className="ind-demands-list">
                  {filteredDemands.map((item) => (
                    <div
                      key={item.id}
                      className="ind-demand-row"
                      onClick={() => setSelectedDemandDetail(item.title)}
                    >
                      <div className="ind-demand-left">
                        <div className={`ind-demand-icon ${item.iconType === "gear" ? "orange-bg" : "teal-bg"}`}>
                          {item.iconType === "gear" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#eb6b2e" strokeWidth="2.2">
                              <circle cx="12" cy="12" r="3"></circle>
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                          )}
                          {item.iconType === "welder" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.2">
                              <path d="M12 2a8 8 0 0 0-8 8v6a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-6a8 8 0 0 0-8-8z"></path>
                              <rect x="9" y="8" width="6" height="4" rx="1"></rect>
                              <line x1="12" y1="16" x2="12" y2="18"></line>
                            </svg>
                          )}
                          {item.iconType === "inspect" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.2">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              <path d="M11 8v6"></path>
                              <path d="M8 11h6"></path>
                            </svg>
                          )}
                        </div>
                        <div className="ind-demand-info">
                          <h3 className="ind-demand-title">{item.title}</h3>
                          <span className="ind-demand-sub">{item.subtitle}</span>
                        </div>
                      </div>

                      <div className="ind-demand-right">
                        <span className="ind-demand-openings">
                          <strong>{item.openings}</strong> openings
                        </span>
                        {item.urgent && <span className="ind-urgent-badge">Urgent</span>}
                        <span className="ind-chevron-arrow">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e86328" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Candidate Readiness Radar */}
              <div className="ind-card ind-radar-card">
                <div className="ind-card-header">
                  <h2 className="ind-card-heading">CANDIDATE READINESS RADAR</h2>
                  <div className="ind-pool-select-wrapper">
                    <select
                      value={candidatePool}
                      onChange={(e) => setCandidatePool(e.target.value)}
                      className="ind-pool-select"
                    >
                      <option value="Current candidate pool">Current candidate pool</option>
                      <option value="Govt ITI Kolhapur Cohort">Govt ITI Kolhapur Cohort</option>
                      <option value="NSQF Certified Only">NSQF Certified Only</option>
                    </select>
                    <span className="ind-pool-chevron">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="ind-radar-content">
                  {/* Radar Spider Chart Canvas */}
                  <div className="ind-radar-chart-area">
                    <svg viewBox="0 0 320 270" className="ind-radar-svg">
                      {/* Concentric Pentagons */}
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
                        const r = 90 * scale;
                        const cx = 160, cy = 125;
                        const pts = [
                          [cx, cy - r],
                          [cx + r * Math.cos(-18 * Math.PI / 180), cy + r * Math.sin(-18 * Math.PI / 180)],
                          [cx + r * Math.cos(54 * Math.PI / 180), cy + r * Math.sin(54 * Math.PI / 180)],
                          [cx + r * Math.cos(126 * Math.PI / 180), cy + r * Math.sin(126 * Math.PI / 180)],
                          [cx + r * Math.cos(198 * Math.PI / 180), cy + r * Math.sin(198 * Math.PI / 180)],
                        ].map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

                        return (
                          <polygon
                            key={scale}
                            points={pts}
                            fill={scale === 1.0 ? "#f8fafc" : "none"}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Axis lines */}
                      {(() => {
                        const cx = 160, cy = 125, r = 90;
                        const angles = [-90, -18, 54, 126, 198];
                        return angles.map((deg, i) => {
                          const rad = (deg * Math.PI) / 180;
                          return (
                            <line
                              key={i}
                              x1={cx}
                              y1={cy}
                              x2={(cx + r * Math.cos(rad)).toFixed(1)}
                              y2={(cy + r * Math.sin(rad)).toFixed(1)}
                              stroke="#e2e8f0"
                              strokeWidth="1"
                            />
                          );
                        });
                      })()}

                      {/* Industry Benchmark Polygon (Subtle grey) */}
                      {(() => {
                        const cx = 160, cy = 125;
                        // Values on scale of 5: [3.4, 3.2, 3.5, 3.1, 3.0]
                        const norm = [3.4 / 5, 3.2 / 5, 3.5 / 5, 3.1 / 5, 3.0 / 5];
                        const angles = [-90, -18, 54, 126, 198];
                        const pts = angles.map((deg, i) => {
                          const r = 90 * norm[i];
                          const rad = (deg * Math.PI) / 180;
                          return `${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`;
                        }).join(" ");
                        return (
                          <polygon
                            points={pts}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                        );
                      })()}

                      {/* Candidate Pool Polygon (Teal filled & stroke) */}
                      {(() => {
                        const cx = 160, cy = 125;
                        // Scores: CNC operation 4.2, Blueprint reading 3.8, Safety 4.0, Measurement 3.6, Soft skills 3.2
                        const scores = [4.2 / 5, 3.8 / 5, 4.0 / 5, 3.6 / 5, 3.2 / 5];
                        const angles = [-90, -18, 54, 126, 198];
                        const pts = angles.map((deg, i) => {
                          const r = 90 * scores[i];
                          const rad = (deg * Math.PI) / 180;
                          return `${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`;
                        }).join(" ");
                        return (
                          <polygon
                            points={pts}
                            fill="rgba(0, 128, 117, 0.18)"
                            stroke="#008075"
                            strokeWidth="2.2"
                          />
                        );
                      })()}

                      {/* Points / Dots */}
                      {(() => {
                        const cx = 160, cy = 125;
                        const scores = [4.2 / 5, 3.8 / 5, 4.0 / 5, 3.6 / 5, 3.2 / 5];
                        const angles = [-90, -18, 54, 126, 198];
                        return angles.map((deg, i) => {
                          const r = 90 * scores[i];
                          const rad = (deg * Math.PI) / 180;
                          return (
                            <circle
                              key={i}
                              cx={(cx + r * Math.cos(rad)).toFixed(1)}
                              cy={(cy + r * Math.sin(rad)).toFixed(1)}
                              r="3.5"
                              fill="#008075"
                            />
                          );
                        });
                      })()}

                      {/* Axis Labels and Scores */}
                      {/* Top: CNC operation 4.2 */}
                      <text x="160" y="16" textAnchor="middle" className="ind-radar-label">
                        CNC operation
                      </text>
                      <text x="160" y="29" textAnchor="middle" className="ind-radar-score">
                        4.2
                      </text>

                      {/* Top Right: Blueprint reading 3.8 */}
                      <text x="278" y="92" textAnchor="start" className="ind-radar-label">
                        Blueprint reading
                      </text>
                      <text x="278" y="105" textAnchor="start" className="ind-radar-score">
                        3.8
                      </text>

                      {/* Bottom Right: Safety 4.0 */}
                      <text x="242" y="242" textAnchor="middle" className="ind-radar-label">
                        Safety
                      </text>
                      <text x="242" y="255" textAnchor="middle" className="ind-radar-score">
                        4.0
                      </text>

                      {/* Bottom Left: Measurement 3.6 */}
                      <text x="78" y="242" textAnchor="middle" className="ind-radar-label">
                        Measurement
                      </text>
                      <text x="78" y="255" textAnchor="middle" className="ind-radar-score">
                        3.6
                      </text>

                      {/* Top Left: Soft skills 3.2 */}
                      <text x="42" y="92" textAnchor="end" className="ind-radar-label">
                        Soft skills
                      </text>
                      <text x="42" y="105" textAnchor="end" className="ind-radar-score">
                        3.2
                      </text>
                    </svg>
                  </div>

                  {/* Radar Right Side Summary & Legend */}
                  <div className="ind-radar-summary">
                    <div className="ind-matched-number">48</div>
                    <div className="ind-matched-text">candidates matched to your demands</div>

                    <div className="ind-radar-legend">
                      <div className="ind-legend-item">
                        <span className="ind-legend-dot teal-dot"></span>
                        <span>Your candidate pool</span>
                      </div>
                      <div className="ind-legend-item">
                        <span className="ind-legend-dot grey-dot"></span>
                        <span>Industry benchmark</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="ind-column-right">
              {/* Card 3: Institute Quality - Govt ITI Kolhapur */}
              <div className="ind-card ind-institute-card">
                {/* Institute Header */}
                <div className="ind-card-header">
                  <h2 className="ind-card-heading">INSTITUTE QUALITY - GOVT ITI KOLHAPUR</h2>
                  <span className="ind-verified-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Verified
                  </span>
                </div>

                {/* Sub-grid 2x2: Skill Levels & Trainer Ratings */}
                <div className="ind-quality-grid">
                  {/* Student Skill Levels */}
                  <div className="ind-quality-box">
                    <div className="ind-sub-header">
                      <span>STUDENT SKILL LEVELS</span>
                      <span className="ind-info-icon" title="Aggregated from assessment results">ⓘ</span>
                    </div>
                    <div className="ind-bars-group">
                      <div className="ind-bar-item">
                        <span className="ind-bar-label">Advanced</span>
                        <div className="ind-progress-track">
                          <div className="ind-progress-fill teal-bar" style={{ width: "22%" }}></div>
                        </div>
                        <span className="ind-bar-val">22%</span>
                      </div>

                      <div className="ind-bar-item">
                        <span className="ind-bar-label">Intermediate</span>
                        <div className="ind-progress-track">
                          <div className="ind-progress-fill orange-bar" style={{ width: "46%" }}></div>
                        </div>
                        <span className="ind-bar-val">46%</span>
                      </div>

                      <div className="ind-bar-item">
                        <span className="ind-bar-label">Beginner</span>
                        <div className="ind-progress-track">
                          <div className="ind-progress-fill grey-bar" style={{ width: "32%" }}></div>
                        </div>
                        <span className="ind-bar-val">32%</span>
                      </div>
                    </div>
                  </div>

                  {/* Trainer Skill Ratings */}
                  <div className="ind-quality-box">
                    <div className="ind-sub-header">
                      <span>TRAINER SKILL RATINGS</span>
                      <span className="ind-info-icon" title="Certified trainer scores out of 5.0">ⓘ</span>
                    </div>
                    <div className="ind-bars-group">
                      <div className="ind-bar-item">
                        <span className="ind-bar-label">S. Patil</span>
                        <div className="ind-progress-track">
                          <div className="ind-progress-fill teal-bar" style={{ width: "96%" }}></div>
                        </div>
                        <span className="ind-bar-val">4.8</span>
                      </div>

                      <div className="ind-bar-item">
                        <span className="ind-bar-label">R. Deshmukh</span>
                        <div className="ind-progress-track">
                          <div className="ind-progress-fill teal-bar" style={{ width: "92%" }}></div>
                        </div>
                        <span className="ind-bar-val">4.6</span>
                      </div>

                      <div className="ind-bar-item">
                        <span className="ind-bar-label">A. Kulkarni</span>
                        <div className="ind-progress-track">
                          <div className="ind-progress-fill teal-bar" style={{ width: "88%" }}></div>
                        </div>
                        <span className="ind-bar-val">4.4</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-grid 2x2: Placement History & Lab Equipment */}
                <div className="ind-quality-grid ind-quality-grid-mid">
                  {/* Previous Outputs - Placement History */}
                  <div className="ind-quality-box">
                    <div className="ind-sub-header">
                      <span>PREVIOUS OUTPUTS - PLACEMENT HISTORY</span>
                      <span className="ind-info-icon" title="3-year verified placement rate">ⓘ</span>
                    </div>

                    <div className="ind-placement-chart">
                      <div className="ind-y-axis">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                      </div>
                      <div className="ind-bars-column-area">
                        {/* 2024: 82% */}
                        <div className="ind-col-bar-wrap">
                          <span className="ind-col-top-val">82%</span>
                          <div className="ind-col-track">
                            <div className="ind-col-fill" style={{ height: "82%" }}></div>
                          </div>
                          <span className="ind-col-year">2024</span>
                        </div>

                        {/* 2025: 85% */}
                        <div className="ind-col-bar-wrap">
                          <span className="ind-col-top-val">85%</span>
                          <div className="ind-col-track">
                            <div className="ind-col-fill" style={{ height: "85%" }}></div>
                          </div>
                          <span className="ind-col-year">2025</span>
                        </div>

                        {/* 2026: 87% */}
                        <div className="ind-col-bar-wrap">
                          <span className="ind-col-top-val">87%</span>
                          <div className="ind-col-track">
                            <div className="ind-col-fill" style={{ height: "87%" }}></div>
                          </div>
                          <span className="ind-col-year">2026</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lab Equipment */}
                  <div className="ind-quality-box">
                    <div className="ind-sub-header">
                      <span>LAB EQUIPMENT</span>
                      <span className="ind-info-icon" title="Equipment operational uptime and quality inspection">ⓘ</span>
                    </div>

                    <div className="ind-lab-content">
                      <div className="ind-lab-info">
                        <span className="ind-lab-score-title">Equipment quality score</span>
                        <div className="ind-lab-score-val">
                          <strong>8.4</strong> <span className="ind-lab-denom">/ 10</span>
                        </div>
                        <div className="ind-lab-progress">
                          <div className="ind-lab-progress-fill" style={{ width: "84%" }}></div>
                        </div>
                        <span className="ind-lab-equipment-desc">9 CNC lathes, 12 welding bays</span>
                      </div>

                      <div className="ind-lab-thumb-wrap">
                        {/* Realistic SVG Workshop illustration */}
                        <div className="ind-lab-thumb-image" title="Govt ITI Kolhapur CNC & Precision Lab">
                          <svg viewBox="0 0 160 110" className="ind-lab-svg-pic">
                            <rect width="160" height="110" fill="#e8edf3" />
                            {/* Workshop Floor */}
                            <path d="M 0 65 L 160 65 L 160 110 L 0 110 Z" fill="#cfd8dc" />
                            <line x1="0" y1="85" x2="160" y2="85" stroke="#b0bec5" strokeWidth="1" strokeDasharray="6 6" />
                            {/* CNC Machine Cabinet 1 */}
                            <rect x="15" y="25" width="55" height="60" rx="3" fill="#1e293b" />
                            <rect x="20" y="32" width="45" height="30" rx="2" fill="#0f172a" />
                            <rect x="25" y="36" width="22" height="20" fill="#38bdf8" opacity="0.85" />
                            {/* Chuck & spindle in CNC */}
                            <circle cx="36" cy="46" r="6" fill="#f8fafc" />
                            <circle cx="36" cy="46" r="3" fill="#64748b" />
                            <rect x="49" y="36" width="12" height="18" fill="#475569" />
                            {/* Controls screen */}
                            <rect x="22" y="66" width="18" height="12" fill="#0284c7" />
                            <circle cx="48" cy="72" r="3" fill="#ef4444" />
                            <circle cx="58" cy="72" r="3" fill="#22c55e" />

                            {/* CNC Machine Cabinet 2 */}
                            <rect x="85" y="20" width="62" height="68" rx="3" fill="#0f766e" />
                            <rect x="92" y="28" width="48" height="34" rx="2" fill="#134e4a" />
                            <rect x="96" y="32" width="25" height="24" fill="#5eead4" opacity="0.9" />
                            <circle cx="108" cy="44" r="7" fill="#ffffff" />
                            <rect x="123" y="33" width="14" height="20" fill="#115e59" />
                            {/* Operator console */}
                            <rect x="92" y="66" width="22" height="14" fill="#042f2e" />
                            <circle cx="122" cy="73" r="3" fill="#f59e0b" />
                            <circle cx="132" cy="73" r="3" fill="#10b981" />
                            {/* Lab Badge */}
                            <rect x="10" y="8" width="70" height="12" rx="2" fill="#ffffff" opacity="0.9" />
                            <text x="14" y="17" fontSize="7" fontWeight="bold" fill="#0f172a">Govt ITI CNC Lab</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses Taught */}
                <div className="ind-courses-section">
                  <div className="ind-sub-header">
                    <span>COURSES TAUGHT</span>
                    <span className="ind-info-icon" title="Curriculum offered and industry validation status">ⓘ</span>
                    <button
                      className="ind-link-btn ind-courses-view-all"
                      onClick={() => setActiveNav("Course validation")}
                    >
                      View all <span>→</span>
                    </button>
                  </div>

                  <div className="ind-courses-row">
                    {/* Course 1: CNC Machining */}
                    <div className="ind-course-pill">
                      <div className="ind-course-icon-circle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.4">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                      </div>
                      <div className="ind-course-text-col">
                        <span className="ind-course-name">CNC machining</span>
                        <span className="ind-course-sub-badge">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Industry validated
                        </span>
                      </div>
                    </div>

                    {/* Course 2: Welding */}
                    <div className="ind-course-pill">
                      <div className="ind-course-icon-circle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.4">
                          <path d="M12 2a8 8 0 0 0-8 8v6a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-6a8 8 0 0 0-8-8z"></path>
                          <rect x="9" y="8" width="6" height="4" rx="1"></rect>
                        </svg>
                      </div>
                      <div className="ind-course-text-col">
                        <span className="ind-course-name">Welding</span>
                        <span className="ind-course-sub-badge">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Industry validated
                        </span>
                      </div>
                    </div>

                    {/* Course 3: Electrician */}
                    <div className="ind-course-pill plain-pill">
                      <span className="ind-plain-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                      </span>
                      <span className="ind-course-name">Electrician</span>
                    </div>

                    {/* Course 4: Fitter */}
                    <div className="ind-course-pill plain-pill">
                      <span className="ind-plain-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                      </span>
                      <span className="ind-course-name">Fitter</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Agent Action Buttons */}
                <div className="ind-agent-buttons-row">
                  <button
                    className="ind-solid-orange-btn"
                    onClick={() => showToast("Changes & required skill benchmarks transmitted directly to Trainer Agent.")}
                  >
                    <span className="ind-btn-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </span>
                    <span>Send changes to Trainer Agent</span>
                  </button>

                  <button
                    className="ind-outline-green-btn"
                    onClick={() => showToast("Recommended learning modules and project demand updates sent to Trainee Agent.")}
                  >
                    <span className="ind-btn-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </span>
                    <span>Send changes to Trainee Agent</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Sarthi AI Side Panel Modal */}
      {sarthiOpen && (
        <div className="ind-sarthi-drawer">
          <div className="ind-sarthi-header">
            <div className="ind-sarthi-title-wrap">
              <div className="ind-sarthi-badge">✳</div>
              <div>
                <h3>Sarthi AI Guide (Industry)</h3>
                <small>Powered by Gemini · Real-time workforce advisor</small>
              </div>
            </div>
            <button className="ind-drawer-close" onClick={() => setSarthiOpen(false)}>✕</button>
          </div>

          <div className="ind-sarthi-body">
            <div className="ind-sarthi-hints">
              <button
                className="ind-hint-chip"
                onClick={() => setSarthiQuery("Recommend practical candidate filtering criteria for CNC operator positions at Gokul Auto.")}
              >
                CNC candidate filtering criteria ↗
              </button>
              <button
                className="ind-hint-chip"
                onClick={() => setSarthiQuery("What syllabus additions would make Govt ITI Kolhapur welders immediately job-ready for MIG/TIG?")}
              >
                Welding syllabus improvements ↗
              </button>
            </div>

            <form onSubmit={handleAskSarthi} className="ind-sarthi-form">
              <textarea
                value={sarthiQuery}
                onChange={(e) => setSarthiQuery(e.target.value)}
                placeholder="Ask Sarthi about talent matches, skill gaps, or syllabus adjustments..."
                rows={3}
                className="ind-sarthi-textarea"
              />
              <button type="submit" disabled={sarthiLoading} className="ind-sarthi-submit-btn">
                {sarthiLoading ? "Consulting Sarthi..." : "Ask Sarthi ↗"}
              </button>
            </form>

            {sarthiResponse && (
              <div className="ind-sarthi-answer-box">
                <h4>Sarthi's Guidance</h4>
                <div className="ind-sarthi-answer-text">{sarthiResponse}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Demand Modal */}
      {showAddDemandModal && (
        <div className="ind-modal-overlay" onClick={() => setShowAddDemandModal(false)}>
          <div className="ind-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ind-modal-header">
              <h3>Post Industry Demand</h3>
              <button onClick={() => setShowAddDemandModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDemand} className="ind-modal-form">
              <label>Role / Position Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CNC Lathe Setup Specialist"
                value={newDemandTitle}
                onChange={(e) => setNewDemandTitle(e.target.value)}
              />

              <div className="ind-modal-two-col">
                <div>
                  <label>Openings Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newDemandOpenings}
                    onChange={(e) => setNewDemandOpenings(e.target.value)}
                  />
                </div>
                <div>
                  <label>Qualification Level</label>
                  <select value={newDemandLevel} onChange={(e) => setNewDemandLevel(e.target.value)}>
                    <option value="NSQF L3">NSQF Level 3</option>
                    <option value="NSQF L4">NSQF Level 4</option>
                    <option value="NSQF L5">NSQF Level 5</option>
                    <option value="Diploma / ITI">Diploma / ITI</option>
                  </select>
                </div>
              </div>

              <div className="ind-modal-checkbox-row">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={newDemandUrgent}
                  onChange={(e) => setNewDemandUrgent(e.target.checked)}
                />
                <label htmlFor="urgentCheck">Mark as Urgent Requirement</label>
              </div>

              <div className="ind-modal-actions">
                <button type="button" className="ind-modal-cancel" onClick={() => setShowAddDemandModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ind-modal-submit">
                  Broadcast Demand ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Course Change Modal */}
      {showCourseChangeModal && (
        <div className="ind-modal-overlay" onClick={() => setShowCourseChangeModal(false)}>
          <div className="ind-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ind-modal-header">
              <h3>Request Course & Syllabus Revision</h3>
              <button onClick={() => setShowCourseChangeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSendCourseChange} className="ind-modal-form">
              <p className="ind-modal-desc">
                Submit an industry curriculum recommendation to Govt ITI Kolhapur and the regional Board of Studies.
              </p>
              <label>Target Course</label>
              <select defaultValue="CNC machining">
                <option value="CNC machining">CNC machining (Turn / Mill)</option>
                <option value="Welding">Welding (MIG / TIG / 3G)</option>
                <option value="Quality Inspection">Quality Inspection & CMM</option>
                <option value="Electrician">Electrician & Industrial Automation</option>
              </select>

              <label>Recommended Skill Additions or Equipment Updates</label>
              <textarea
                required
                rows={4}
                placeholder="Detail the specific practical modules (e.g. Fanuc 0i-TF controller offset calibration, multi-axis G-code simulation) needed for immediate shopfloor readiness..."
                value={courseChangeText}
                onChange={(e) => setCourseChangeText(e.target.value)}
              />

              <div className="ind-modal-actions">
                <button type="button" className="ind-modal-cancel" onClick={() => setShowCourseChangeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ind-modal-submit">
                  Submit to Board of Studies ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demand Detail Drawer */}
      {selectedDemandDetail && (
        <div className="ind-modal-overlay" onClick={() => setSelectedDemandDetail(null)}>
          <div className="ind-drawer-right" onClick={(e) => e.stopPropagation()}>
            <div className="ind-modal-header">
              <div>
                <h3>{selectedDemandDetail}</h3>
                <small>Matched Candidate Pool from Govt ITI Kolhapur</small>
              </div>
              <button onClick={() => setSelectedDemandDetail(null)}>✕</button>
            </div>
            <div className="ind-drawer-body">
              <div className="ind-candidate-item">
                <div className="ind-cand-avatar">RS</div>
                <div className="ind-cand-info">
                  <strong>Rohit Shinde</strong>
                  <span>Govt ITI Kolhapur · 2026 Batch</span>
                  <div className="ind-cand-tags">
                    <span>MIG/TIG</span>
                    <span>Blueprint reading</span>
                    <span>Safety 4.0</span>
                  </div>
                </div>
                <div className="ind-cand-score">
                  <span className="ind-match-badge">92% Match</span>
                  <button className="ind-shortlist-btn" onClick={() => showToast("Shortlisted Rohit Shinde for interview.")}>
                    Shortlist
                  </button>
                </div>
              </div>

              <div className="ind-candidate-item">
                <div className="ind-cand-avatar">PS</div>
                <div className="ind-cand-info">
                  <strong>Pranav Salunkhe</strong>
                  <span>Govt ITI Kolhapur · 2026 Batch</span>
                  <div className="ind-cand-tags">
                    <span>CNC Turning</span>
                    <span>Fanuc 0i</span>
                    <span>Quality check</span>
                  </div>
                </div>
                <div className="ind-cand-score">
                  <span className="ind-match-badge">88% Match</span>
                  <button className="ind-shortlist-btn" onClick={() => showToast("Shortlisted Pranav Salunkhe for interview.")}>
                    Shortlist
                  </button>
                </div>
              </div>

              <div className="ind-candidate-item">
                <div className="ind-cand-avatar">AK</div>
                <div className="ind-cand-info">
                  <strong>Aniket Kulkarni</strong>
                  <span>Govt ITI Kolhapur · 2026 Batch</span>
                  <div className="ind-cand-tags">
                    <span>CMM operation</span>
                    <span>Measurement 3.8</span>
                  </div>
                </div>
                <div className="ind-cand-score">
                  <span className="ind-match-badge">85% Match</span>
                  <button className="ind-shortlist-btn" onClick={() => showToast("Shortlisted Aniket Kulkarni for interview.")}>
                    Shortlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
