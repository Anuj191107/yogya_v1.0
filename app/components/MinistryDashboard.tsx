"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { FormattedSarthiAnswer } from "./FormattedMarkdown";

interface MinistryDashboardProps {
  onBack?: () => void;
  onChooseRole?: () => void;
  onAskSarthi?: () => void;
  onOpenSarthi?: () => void;
}

type SelectedEntity = "iti" | "gokul" | "shiroli" | "hospital" | "university";

export default function MinistryDashboard({ onBack, onChooseRole, onAskSarthi, onOpenSarthi }: MinistryDashboardProps) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>("iti");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Kolhapur District, Maharashtra");
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapElementRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletLayersRef = useRef<any[]>([]);
  const leafletTileLayerRef = useRef<any>(null);

  const mapLocations = [
    { id: "iti" as SelectedEntity, name: "Government ITI Kolhapur", type: "Vocational training institute", position: { lat: 16.6915, lng: 74.2352 }, color: "#ed7d35", detail: "Illustrative readiness: 87% · 14 active courses · 640 trainees" },
    { id: "university" as SelectedEntity, name: "Shivaji University", type: "University", position: { lat: 16.6868, lng: 74.2575 }, color: "#087f78", detail: "Illustrative institution record · Higher education and skills ecosystem" },
    { id: "hospital" as SelectedEntity, name: "CPR District Hospital", type: "Healthcare employer", position: { lat: 16.7050, lng: 74.2365 }, color: "#d9485f", detail: "Illustrative healthcare workforce demand marker" },
    { id: "gokul" as SelectedEntity, name: "Gokul Shirgaon MIDC", type: "Industrial belt", position: { lat: 16.6485, lng: 74.3372 }, color: "#087f78", detail: "Illustrative industrial cluster · Foundry, auto-components and CNC" },
    { id: "shiroli" as SelectedEntity, name: "Shiroli MIDC", type: "Industrial belt", position: { lat: 16.7355, lng: 74.3990 }, color: "#087f78", detail: "Illustrative industrial cluster · Precision manufacturing" },
  ];

  useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (cancelled || !mapElementRef.current || !(window as any).L) return;
      const L = (window as any).L;
      if (leafletMapRef.current) return;
      const map = L.map(mapElementRef.current, { zoomControl: false, scrollWheelZoom: true }).setView([16.7050, 74.2433], 12);
      leafletMapRef.current = map;
      const tileUrls: Record<string, string> = {
        roadmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      };
      leafletTileLayerRef.current = L.tileLayer(tileUrls[mapType], {
        maxZoom: mapType === "satellite" ? 19 : 17,
        attribution: mapType === "satellite" ? 'Tiles © Esri' : mapType === "terrain" ? 'Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);
      const regionData = [
        { id: "iti" as SelectedEntity, name: "Government ITI Kolhapur", type: "Vocational training institute", position: [16.6915, 74.2352], color: "#ed7d35", detail: "Illustrative readiness: 87% · 14 active courses · 640 trainees", polygon: [[16.697, 74.228], [16.697, 74.241], [16.687, 74.243], [16.685, 74.232]] },
        { id: "university" as SelectedEntity, name: "Shivaji University", type: "University", position: [16.6868, 74.2575], color: "#087f78", detail: "Illustrative institution record · Higher education and skills ecosystem", polygon: [[16.693, 74.251], [16.693, 74.267], [16.681, 74.269], [16.680, 74.253]] },
        { id: "hospital" as SelectedEntity, name: "CPR District Hospital", type: "Healthcare employer", position: [16.7050, 74.2365], color: "#d9485f", detail: "Illustrative healthcare workforce demand marker", polygon: [[16.709, 74.232], [16.709, 74.241], [16.701, 74.242], [16.701, 74.233]] },
        { id: "gokul" as SelectedEntity, name: "Gokul Shirgaon MIDC", type: "Industrial belt", position: [16.6485, 74.3372], color: "#087f78", detail: "Illustrative industrial cluster · Foundry, auto-components and CNC", polygon: [[16.661, 74.321], [16.661, 74.352], [16.640, 74.356], [16.636, 74.328]] },
        { id: "shiroli" as SelectedEntity, name: "Shiroli MIDC", type: "Industrial belt", position: [16.7355, 74.3990], color: "#087f78", detail: "Illustrative industrial cluster · Precision manufacturing", polygon: [[16.746, 74.385], [16.746, 74.411], [16.727, 74.414], [16.725, 74.390]] },
      ];
      leafletLayersRef.current = regionData.map((location) => {
        const polygon = L.polygon(location.polygon, { color: location.color, weight: 2, opacity: .95, fillColor: location.color, fillOpacity: .20 }).addTo(map);
        polygon.bindTooltip(location.name, { sticky: true });
        polygon.on("click", () => setSelectedEntity(location.id));
        const marker = L.circleMarker(location.position, { radius: 8, color: "#fff", weight: 3, fillColor: location.color, fillOpacity: 1 }).addTo(map);
        marker.bindTooltip(location.name, { direction: "top", offset: [0, -7] });
        marker.bindPopup(`<div style="font-family:Arial,sans-serif;min-width:180px"><strong>${location.name}</strong><div style="color:#087f78;font-size:12px;margin:5px 0">${location.type}</div><div style="font-size:12px;line-height:1.45">${location.detail}</div><small style="display:block;color:#78868b;margin-top:6px">Yogya demo data · illustrative region highlight</small></div>`);
        marker.on("click", () => setSelectedEntity(location.id));
        return { polygon, marker, location };
      });
      setMapLoaded(true);
      setMapError("");
      setTimeout(() => map.invalidateSize(), 100);
    };
    const load = () => {
      if ((window as any).L) { init(); return; }
      const cssId = "yogya-leaflet-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link"); link.id = cssId; link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
      }
      const scriptId = "yogya-leaflet-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script"); script.id = scriptId;
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.async = true;
        script.onload = init; script.onerror = () => !cancelled && setMapError("The free map library could not load. Check your internet connection and refresh.");
        document.body.appendChild(script);
      } else { script.addEventListener("load", init); }
    };
    load();
    return () => { cancelled = true; };
    // Map is initialized once; layers update in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    const L = (window as any).L;
    if (!map || !L || !mapLoaded) return;
    const centers: Record<string, [number, number]> = {
      "Kolhapur District, Maharashtra": [16.7050, 74.2433],
      "Pune District, Maharashtra": [18.5204, 73.8567],
      "Nagpur District, Maharashtra": [21.1458, 79.0882],
      "Aurangabad District, Maharashtra": [19.8762, 75.3433],
    };
    // Institution polygons are currently curated for Kolhapur; keep the demo honest when another district is selected.
    map.setView(centers[selectedDistrict] || centers["Kolhapur District, Maharashtra"], selectedDistrict.startsWith("Kolhapur") ? 12 : 10);
    const tileUrls: Record<string, string> = {
      roadmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    };
    if (leafletTileLayerRef.current) map.removeLayer(leafletTileLayerRef.current);
    leafletTileLayerRef.current = L.tileLayer(tileUrls[mapType], {
      maxZoom: mapType === "satellite" ? 19 : 17,
      attribution: mapType === "satellite" ? 'Tiles © Esri' : mapType === "terrain" ? 'Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    leafletLayersRef.current.forEach(({ marker, polygon, location }) => {
      const matches = !searchQuery.trim() || `${location.name} ${location.type}`.toLowerCase().includes(searchQuery.toLowerCase());
      if (matches) { if (!map.hasLayer(marker)) marker.addTo(map); if (!map.hasLayer(polygon)) polygon.addTo(map); }
      else { if (map.hasLayer(marker)) map.removeLayer(marker); if (map.hasLayer(polygon)) map.removeLayer(polygon); }
    });
    map.invalidateSize();
  }, [selectedDistrict, mapType, searchQuery, mapLoaded]);

  // Additional interactive modals
  const [showBoSModal, setShowBoSModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTabModal, setShowTabModal] = useState<string | null>(null);

  // Sarthi AI Drawer
  const [sarthiOpen, setSarthiOpen] = useState(false);
  const [sarthiLanguage, setSarthiLanguage] = useState<"en" | "hi">("en");
  const [sarthiQuery, setSarthiQuery] = useState("");
  const [sarthiResponse, setSarthiResponse] = useState("");
  const [sarthiLoading, setSarthiLoading] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const handleAskSarthi = async (e: React.FormEvent, customQuery?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const queryToSend = (typeof customQuery === "string" ? customQuery : sarthiQuery).trim();
    if (!queryToSend) return;
    setSarthiLoading(true);
    setSarthiResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryToSend,
          role: "Ministry",
          language: sarthiLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok && !data.answer) throw new Error(data.error || "Could not get a response.");
      setSarthiResponse(data.answer || "No response received.");
    } catch (err) {
      setSarthiResponse(err instanceof Error ? err.message : "Error querying Sarthi AI.");
    } finally {
      setSarthiLoading(false);
    }
  };

  const handleZoom = (delta: number) => {
    const map = leafletMapRef.current;
    if (!map) return;
    const nextZoom = Math.min(19, Math.max(5, (map.getZoom?.() || zoomLevel) + delta));
    map.setZoom(nextZoom);
    setZoomLevel(nextZoom);
  };

  return (
    <div className="min-dashboard-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ind-toast-notification">
          <span className="ind-toast-icon">✓</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ind-toast-close">✕</button>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="min-topbar">
        <div className="min-topbar-left">
          {/* Ashoka Emblem & Ministry Branding */}
          <div className="min-emblem-wrap">
            <svg width="26" height="32" viewBox="0 0 24 30" fill="none" className="min-emblem-svg">
              <path d="M12 2L14 6H10L12 2Z" fill="#334155" />
              <circle cx="12" cy="11" r="5" stroke="#334155" strokeWidth="1.5" />
              <circle cx="12" cy="11" r="2" fill="#334155" />
              <line x1="12" y1="6" x2="12" y2="16" stroke="#334155" strokeWidth="1" />
              <line x1="7" y1="11" x2="17" y2="11" stroke="#334155" strokeWidth="1" />
              <path d="M6 19H18V22H6V19Z" fill="#334155" />
              <path d="M4 23H20V26H4V23Z" fill="#334155" />
            </svg>
            <div className="min-brand-titles">
              <span className="min-brand-line1">Ministry of Skill Development</span>
              <span className="min-brand-line2">and Entrepreneurship</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="min-nav-tabs">
            {["Dashboard", "Institutions", "Industry", "Trainees", "Analytics", "Reports"].map((tab) => (
              <button
                key={tab}
                className={`min-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== "Dashboard") {
                    setShowTabModal(tab);
                    showToast(`Opened ${tab} overview.`);
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-topbar-right">
          {/* Location Selector */}
          <div className="min-location-select-wrap">
            <span className="min-loc-pin">📍</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                showToast(`Loaded workforce indicators for ${e.target.value}.`);
              }}
              className="min-loc-select"
            >
              <option value="Kolhapur District, Maharashtra">Kolhapur District, Maharashtra</option>
              <option value="Pune District, Maharashtra">Pune District, Maharashtra</option>
              <option value="Nagpur District, Maharashtra">Nagpur District, Maharashtra</option>
              <option value="Aurangabad District, Maharashtra">Aurangabad District, Maharashtra</option>
            </select>
            <span className="min-select-arrow">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          {/* Search Box */}
          <div className="min-search-box">
            <span className="min-search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search institutions, areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-search-input"
            />
          </div>

          {/* Sarthi AI button */}
          <button
            className="min-sarthi-btn"
            onClick={() => setSarthiOpen(!sarthiOpen)}
            title="Open Sarthi AI Assistant"
          >
            <span>✳</span> Sarthi AI
          </button>

          {/* User Profile Avatar */}
          <div
            className="min-user-avatar"
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: "pointer" }}
            title="Directorate of Vocational Education & Training Profile"
          >
            S
          </div>

          {/* Back to Yogya Home */}
          <button className="min-back-home-btn" onClick={onChooseRole ?? onBack} title="Return to Workspace Selector">
            ✕
          </button>
        </div>
      </header>

      {/* Main Map View Area */}
      <div className="min-map-container">
        {/* Interactive Satellite Canvas & Overlays */}
        <div className="min-google-map-wrap">
          <div ref={mapElementRef} className="min-google-map yogya-leaflet-map" aria-label="Interactive OpenStreetMap showing clickable institution and industrial regions around Kolhapur" />
          {mapError && <div className="min-map-setup-overlay"><div><strong>Map unavailable</strong><p>{mapError}</p><small>Refresh when connected to the internet. No API key is required.</small></div></div>}
          {!mapLoaded && !mapError && <div className="min-map-loading">Loading free interactive map…</div>}
        </div>

        {/* TOP RIGHT FLOATING KPI METRICS ROW (3 cards) */}
        <div className="min-top-kpi-row">
          {/* Card 1: Skill gap index 62 */}
          <div
            className="min-kpi-pill"
            onClick={() => setShowTabModal("Analytics")}
            style={{ cursor: "pointer" }}
            title="Click to view district skill gap breakdown"
          >
            <div className="min-kpi-icon-wrap orange-bg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.4">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div className="min-kpi-data">
              <span className="min-kpi-title">Skill gap index</span>
              <span className="min-kpi-number">62</span>
            </div>
          </div>

          {/* Card 2: Open positions 2,412 */}
          <div
            className="min-kpi-pill"
            onClick={() => setShowTabModal("Industry")}
            style={{ cursor: "pointer" }}
            title="Click to view open positions by MIDC cluster"
          >
            <div className="min-kpi-icon-wrap teal-bg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.4">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="min-kpi-data">
              <span className="min-kpi-title">Open positions</span>
              <span className="min-kpi-number">2,412</span>
            </div>
          </div>

          {/* Card 3: District placement rate 78% */}
          <div
            className="min-kpi-pill"
            onClick={() => setShowTabModal("Institutions")}
            style={{ cursor: "pointer" }}
            title="Click to inspect institutional placement rates"
          >
            <div className="min-kpi-icon-wrap teal-bg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#008075" strokeWidth="2.4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="min-kpi-data">
              <span className="min-kpi-title">District placement rate</span>
              <span className="min-kpi-number">78%</span>
            </div>
          </div>
        </div>

        {/* LEFT FLOATING INSTITUTION / ENTITY CARD */}
        <aside className="min-floating-card">
          {selectedEntity === "iti" ? (
            <>
              {/* ITI Building Thumbnail */}
              <div className="min-card-image-wrap">
                <svg viewBox="0 0 320 140" className="min-building-svg">
                  <rect width="320" height="140" fill="#f8fafc" />
                  {/* Building facade */}
                  <rect x="20" y="25" width="280" height="100" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" rx="3" />
                  <rect x="40" y="35" width="240" height="85" fill="#fef9c3" />
                  {/* Central Entrance */}
                  <rect x="115" y="45" width="90" height="80" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <rect x="125" y="70" width="70" height="55" fill="#1e293b" />
                  {/* Blue Signage Board */}
                  <rect x="100" y="32" width="120" height="24" rx="2" fill="#0284c7" />
                  <text x="160" y="44" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">GOVT. INDUSTRIAL TRAINING INSTITUTE</text>
                  <text x="160" y="52" textAnchor="middle" fill="#e0f2fe" fontSize="6.5">KOLHAPUR, MAHARASHTRA</text>
                  {/* Windows */}
                  <rect x="50" y="45" width="22" height="28" fill="#0284c7" opacity="0.75" />
                  <rect x="80" y="45" width="22" height="28" fill="#0284c7" opacity="0.75" />
                  <rect x="218" y="45" width="22" height="28" fill="#0284c7" opacity="0.75" />
                  <rect x="248" y="45" width="22" height="28" fill="#0284c7" opacity="0.75" />
                  {/* Flag mast */}
                  <line x1="160" y1="10" x2="160" y2="32" stroke="#64748b" strokeWidth="1.5" />
                  <polygon points="160,12 174,15 160,18" fill="#ea580c" />
                </svg>
              </div>

              <div className="min-card-content">
                <span className="min-institution-badge">INSTITUTION</span>
                <h2 className="min-card-name">Government ITI, Kolhapur</h2>
                <div className="min-card-location">
                  <span className="min-loc-icon">📍</span> Kolhapur, Maharashtra
                </div>

                {/* Circular Efficiency Gauge */}
                <div className="min-gauge-row">
                  <div className="min-gauge-circle-wrap">
                    <svg viewBox="0 0 60 60" className="min-gauge-svg">
                      <circle cx="30" cy="30" r="24" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                      <circle
                        cx="30"
                        cy="30"
                        r="24"
                        fill="none"
                        stroke="#008075"
                        strokeWidth="5"
                        strokeDasharray="150.8"
                        strokeDashoffset="19.6"
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                      <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
                        87%
                      </text>
                    </svg>
                  </div>
                  <div className="min-gauge-text">
                    <span className="min-gauge-label">Institution efficiency</span>
                    <span className="min-info-bubble" title="Composite readiness, infrastructure, and trainer rating score">ⓘ</span>
                  </div>
                </div>

                {/* Key Metrics List */}
                <div className="min-stats-list">
                  <div className="min-stat-line">
                    <div className="min-stat-label-wrap">
                      <span className="min-stat-icon">💼</span>
                      <span>Placement readiness</span>
                    </div>
                    <strong className="min-stat-value">87%</strong>
                  </div>

                  <div className="min-stat-line">
                    <div className="min-stat-label-wrap">
                      <span className="min-stat-icon">📖</span>
                      <span>Active courses</span>
                    </div>
                    <strong className="min-stat-value">14</strong>
                  </div>

                  <div className="min-stat-line">
                    <div className="min-stat-label-wrap">
                      <span className="min-stat-icon">👥</span>
                      <span>Trainer capacity</span>
                    </div>
                    <strong className="min-stat-value">92%</strong>
                  </div>

                  <div className="min-stat-line">
                    <div className="min-stat-label-wrap">
                      <span className="min-stat-icon">👤</span>
                      <span>Enrolled trainees</span>
                    </div>
                    <strong className="min-stat-value">640</strong>
                  </div>
                </div>

                {/* Nearby Industry */}
                <div className="min-section-block">
                  <span className="min-section-kicker">NEARBY INDUSTRY</span>
                  <div className="min-chips-row">
                    <span className="min-industry-chip">
                      <span className="chip-icon">🏭</span> Foundry
                    </span>
                    <span className="min-industry-chip">
                      <span className="chip-icon">⚙</span> Auto-components
                    </span>
                    <span className="min-industry-chip">
                      <span className="chip-icon">🧵</span> Textiles
                    </span>
                  </div>
                </div>

                {/* Live Industry Demand */}
                <div className="min-section-block">
                  <span className="min-section-kicker">LIVE INDUSTRY DEMAND</span>
                  <div className="min-demand-bars">
                    <div className="min-demand-row">
                      <span className="min-demand-role">CNC operators</span>
                      <span className="min-demand-count">120 openings</span>
                      <div className="min-bar-track">
                        <div className="min-bar-fill orange" style={{ width: "90%" }}></div>
                      </div>
                    </div>

                    <div className="min-demand-row">
                      <span className="min-demand-role">Welders</span>
                      <span className="min-demand-count">85 openings</span>
                      <div className="min-bar-track">
                        <div className="min-bar-fill orange" style={{ width: "65%" }}></div>
                      </div>
                    </div>

                    <div className="min-demand-row">
                      <span className="min-demand-role">Electricians</span>
                      <span className="min-demand-count">60 openings</span>
                      <div className="min-bar-track">
                        <div className="min-bar-fill orange" style={{ width: "48%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BoS Revision Pending Alert Banner */}
                <div
                  className="min-alert-banner"
                  onClick={() => setShowBoSModal(true)}
                  style={{ cursor: "pointer" }}
                  title="Click to review Board of Studies curriculum proposal"
                >
                  <div className="min-alert-left">
                    <span className="min-alert-badge">!</span>
                    <span>BoS revision pending</span>
                  </div>
                  <span className="min-alert-chevron">›</span>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    className="ind-solid-orange-btn"
                    style={{ flex: 1, fontSize: 12, padding: "8px 10px", justifyContent: "center" }}
                    onClick={() => {
                      showToast("Generated District ITI Inspection & Lab Quality Audit Report (PDF).");
                    }}
                  >
                    ⇩ Export ITI Audit
                  </button>
                  <button
                    className="ind-outline-green-btn"
                    style={{ flex: 1, fontSize: 12, padding: "8px 10px", justifyContent: "center" }}
                    onClick={() => setShowBoSModal(true)}
                  >
                    Review BoS Elective ↗
                  </button>
                </div>
              </div>
            </>
          ) : selectedEntity === "gokul" ? (
            <div className="min-card-content p-top">
              <span className="min-industry-badge">INDUSTRIAL BELT</span>
              <h2 className="min-card-name">Gokul Shirgaon MIDC</h2>
              <div className="min-card-location">
                <span className="min-loc-icon">📍</span> Kolhapur East Industrial Zone
              </div>

              <div className="min-stats-list mt-3">
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Active Factories</span></div>
                  <strong className="min-stat-value">180+ units</strong>
                </div>
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Current Open Requisitions</span></div>
                  <strong className="min-stat-value">540 openings</strong>
                </div>
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Key Clusters</span></div>
                  <strong className="min-stat-value">Foundry & CNC</strong>
                </div>
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Apprenticeship Capacity</span></div>
                  <strong className="min-stat-value">320 slots</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  className="ind-solid-orange-btn"
                  style={{ flex: 1, fontSize: 12, padding: "8px 10px", justifyContent: "center" }}
                  onClick={() => showToast("Notified Gokul Shirgaon Industrial Association regarding candidate batches.")}
                >
                  Broadcast ITI Matches
                </button>
                <button
                  className="min-reset-btn"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setSelectedEntity("iti")}
                >
                  ← Back to ITI
                </button>
              </div>
            </div>
          ) : selectedEntity === "shiroli" ? (
            <div className="min-card-content p-top">
              <span className="min-industry-badge">INDUSTRIAL BELT</span>
              <h2 className="min-card-name">Shiroli MIDC</h2>
              <div className="min-card-location">
                <span className="min-loc-icon">📍</span> NH48 Corridor, Kolhapur
              </div>

              <div className="min-stats-list mt-3">
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Precision Auto Units</span></div>
                  <strong className="min-stat-value">220+ units</strong>
                </div>
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Urgent Demand</span></div>
                  <strong className="min-stat-value">380 CNC / MIG</strong>
                </div>
                <div className="min-stat-line">
                  <div className="min-stat-label-wrap"><span>Specialization</span></div>
                  <strong className="min-stat-value">Precision Machining</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  className="ind-solid-orange-btn"
                  style={{ flex: 1, fontSize: 12, padding: "8px 10px", justifyContent: "center" }}
                  onClick={() => showToast("Allocated 150 Dual-Training apprenticeship vouchers for Shiroli units.")}
                >
                  Allocate Dual-Training
                </button>
                <button
                  className="min-reset-btn"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setSelectedEntity("iti")}
                >
                  ← Back to ITI
                </button>
              </div>
            </div>
          ) : selectedEntity === "university" ? (
            <div className="min-card-content p-top">
              <span className="min-institution-badge">INSTITUTION</span>
              <h2 className="min-card-name">Shivaji University</h2>
              <div className="min-card-location"><span className="min-loc-icon">📍</span> Vidya Nagar, Kolhapur</div>
              <div className="min-stats-list mt-3">
                <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Institution type</span></div><strong className="min-stat-value">State University</strong></div>
                <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Focus areas</span></div><strong className="min-stat-value">Research & Skill Hub</strong></div>
                <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Affiliated Colleges</span></div><strong className="min-stat-value">280 colleges</strong></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  className="ind-solid-orange-btn"
                  style={{ flex: 1, fontSize: 12, padding: "8px 10px", justifyContent: "center" }}
                  onClick={() => showToast("Integrated B.Voc & Apprenticeship credits with State Skill Registry.")}
                >
                  Sync Skill Credits
                </button>
                <button className="min-reset-btn" style={{ flex: 1, margin: 0 }} onClick={() => setSelectedEntity("iti")}>
                  ← Back to ITI
                </button>
              </div>
            </div>
          ) : (
            <div className="min-card-content p-top">
              <span className="min-industry-badge">HEALTHCARE</span>
              <h2 className="min-card-name">CPR District Hospital</h2>
              <div className="min-card-location"><span className="min-loc-icon">📍</span> Dasara Chowk, Kolhapur</div>
              <div className="min-stats-list mt-3">
                <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Sector</span></div><strong className="min-stat-value">District Healthcare</strong></div>
                <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Paramedical Vacancies</span></div><strong className="min-stat-value">48 technicians</strong></div>
                <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Training Affiliation</span></div><strong className="min-stat-value">Govt Medical College</strong></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  className="ind-solid-orange-btn"
                  style={{ flex: 1, fontSize: 12, padding: "8px 10px", justifyContent: "center" }}
                  onClick={() => showToast("Initiated emergency dialysis and radiology technician training batch.")}
                >
                  Fast-track Batch
                </button>
                <button className="min-reset-btn" style={{ flex: 1, margin: 0 }} onClick={() => setSelectedEntity("iti")}>
                  ← Back to ITI
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* BOTTOM RIGHT LEGEND & MAP CONTROLS */}
        <div className="min-bottom-controls-row">
          {/* Legend */}
          <div className="min-legend-card">
            <div className="min-legend-chip">
              <span className="legend-dot orange"></span>
              <span>Institutions</span>
            </div>
            <div className="min-legend-chip">
              <span className="legend-dot teal"></span>
              <span>Industrial belt</span>
            </div>
            <div className="min-legend-chip">
              <span className="legend-dot grey"></span>
              <span>Other</span>
            </div>
          </div>

          {/* Zoom & Layer Controls */}
          <div className="min-zoom-group">
            <button className="min-zoom-btn" onClick={() => handleZoom(1)} title="Zoom In">
              +
            </button>
            <button className="min-zoom-btn" onClick={() => handleZoom(-1)} title="Zoom Out">
              −
            </button>
            <button
              className="min-zoom-btn"
              onClick={() => {
                const map = leafletMapRef.current;
                map?.setView([16.7050, 74.2433], 12);
                setZoomLevel(12);
                setSelectedDistrict("Kolhapur District, Maharashtra");
                showToast("Map recentered on Kolhapur district.");
              }}
              title="Recenter Map"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
              </svg>
            </button>
            <button className="min-zoom-btn min-map-type-btn" onClick={() => setMapType((current) => current === "roadmap" ? "satellite" : current === "satellite" ? "terrain" : "roadmap")} title={`Map layer: ${mapType}. Click to change layer`}>
              {mapType === "roadmap" ? "Map" : mapType === "satellite" ? "Sat" : "Ter"}
            </button>
          </div>
        </div>
      </div>

      {/* Sarthi AI Side Drawer */}
      {sarthiOpen && (
        <div className="ind-sarthi-drawer">
          <div className="ind-sarthi-header">
            <div className="ind-sarthi-title-wrap">
              <div className="ind-sarthi-badge">✳</div>
              <div>
                <h3>{sarthiLanguage === "hi" ? "सारथी AI सलाहकार (मंत्रालय)" : "Sarthi AI Guide (Ministry)"}</h3>
                <small>{sarthiLanguage === "hi" ? "Gemini-संचालित · जिला कार्यबल नियोजन" : "Powered by Gemini · District workforce planning"}</small>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="yw-chat-language-toggle" aria-label="Language selection" style={{ display: "flex", border: "1px solid #d8e9e6", borderRadius: "999px", overflow: "hidden", background: "#f6fbfa" }}>
                <button
                  type="button"
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: sarthiLanguage === "en" ? 700 : 500,
                    background: sarthiLanguage === "en" ? "#087f78" : "transparent",
                    color: sarthiLanguage === "en" ? "#fff" : "#4b6066",
                    border: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => setSarthiLanguage("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: sarthiLanguage === "hi" ? 700 : 500,
                    background: sarthiLanguage === "hi" ? "#087f78" : "transparent",
                    color: sarthiLanguage === "hi" ? "#fff" : "#4b6066",
                    border: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => setSarthiLanguage("hi")}
                >
                  हिन्दी
                </button>
              </div>
              <button className="ind-drawer-close" onClick={() => setSarthiOpen(false)}>✕</button>
            </div>
          </div>

          <div className="ind-sarthi-body">
            <div className="ind-sarthi-hints">
              {sarthiLanguage === "hi" ? (
                <>
                  <button
                    className="ind-hint-chip"
                    onClick={() => {
                      const q = "कोल्हापुर जिले के कौशल अंतर सूचकांक (62) का विश्लेषण करें और त्वरित क्षमता वृद्धि के उपाय बताएं।";
                      setSarthiQuery(q);
                      handleAskSarthi(null as any, q);
                    }}
                  >
                    कौशल अंतर (62) विश्लेषण ↗
                  </button>
                  <button
                    className="ind-hint-chip"
                    onClick={() => {
                      const q = "राजकीय ITI कोल्हापुर और शिरोली-गोकुल शिरगांव MIDC के बीच अप्रेंटिसशिप विस्तार योजना कैसे बनेगी?";
                      setSarthiQuery(q);
                      handleAskSarthi(null as any, q);
                    }}
                  >
                    ITI - MIDC अप्रेंटिसशिप ↗
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="ind-hint-chip"
                    onClick={() => {
                      const q = "Analyze skill gap index (62) for Kolhapur District and suggest fast-track vocational capacity additions.";
                      setSarthiQuery(q);
                      handleAskSarthi(null as any, q);
                    }}
                  >
                    Analyze Kolhapur Skill Gap (62) ↗
                  </button>
                  <button
                    className="ind-hint-chip"
                    onClick={() => {
                      const q = "How can Govt ITI Kolhapur coordinate with Shiroli & Gokul Shirgaon MIDC for auto-component apprenticeship expansion?";
                      setSarthiQuery(q);
                      handleAskSarthi(null as any, q);
                    }}
                  >
                    ITI - MIDC Apprenticeship Plan ↗
                  </button>
                </>
              )}
            </div>

            <form onSubmit={handleAskSarthi} className="ind-sarthi-form">
              <textarea
                value={sarthiQuery}
                onChange={(e) => setSarthiQuery(e.target.value)}
                placeholder={sarthiLanguage === "hi" ? "जिला कार्यबल संकेत, ITI परिणाम या औद्योगिक क्लस्टर पर प्रश्न पूछें..." : "Ask Sarthi about district workforce signals, ITI outcomes, or industry belt alignment..."}
                rows={3}
                className="ind-sarthi-textarea"
              />
              <button type="submit" disabled={sarthiLoading} className="ind-sarthi-submit-btn">
                {sarthiLoading ? (sarthiLanguage === "hi" ? "सारथी से परामर्श ले रहे हैं..." : "Consulting Sarthi...") : (sarthiLanguage === "hi" ? "सारथी से पूछें ↗" : "Ask Sarthi ↗")}
              </button>
            </form>

            {sarthiResponse && (
              <div className="ind-sarthi-answer-box">
                <h4>{sarthiLanguage === "hi" ? "सारथी का रणनीतिक मार्गदर्शन" : "Sarthi's Strategic Guidance"}</h4>
                <div className="ind-sarthi-answer-text">
                  <FormattedSarthiAnswer text={sarthiResponse} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BoS Revision Modal */}
      {showBoSModal && (
        <div className="ind-modal-overlay" onClick={() => setShowBoSModal(false)}>
          <div className="ind-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ind-modal-header">
              <div>
                <h3>Board of Studies (BoS) Revision Notice</h3>
                <small>Govt ITI Kolhapur · Trade Syllabus Update Approval</small>
              </div>
              <button onClick={() => setShowBoSModal(false)}>✕</button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ background: "#fff3ea", border: "1px solid #fbd0b9", padding: 12, borderRadius: 6, marginBottom: 14, fontSize: 13, color: "#9a3412" }}>
                <b>Proposed Amendment:</b> Integration of 5-Axis CNC Milling offsets and EV Battery pack wiring module into second-year trade syllabus.
              </div>
              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                Industry partners (Gokul Auto Components, Shiroli Precision Hub) have validated this requirement against 420 pending job openings across Kolhapur district.
              </p>
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 6, fontSize: 12.5, color: "#475569", margin: "14px 0" }}>
                <div>✓ <b>Lab Equipment Verification:</b> 8.4/10 score verified by DVET inspection team.</div>
                <div>✓ <b>Trainer Upskilling:</b> 3 master trainers certified at National Skill Training Institute (NSTI).</div>
                <div>✓ <b>Financial Outlay:</b> Covered under existing PM-KVY 4.0 district allocation.</div>
              </div>
              <div className="ind-modal-actions">
                <button
                  type="button"
                  className="ind-modal-cancel"
                  onClick={() => {
                    setShowBoSModal(false);
                    showToast("BoS amendment flagged for further stakeholder comments.");
                  }}
                >
                  Request Technical Review
                </button>
                <button
                  type="button"
                  className="ind-modal-submit"
                  onClick={() => {
                    setShowBoSModal(false);
                    showToast("✓ Approved BoS revision. Transmitted authorization to Govt ITI Kolhapur.");
                  }}
                >
                  ✓ Approve & Notify Board ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Overview Modal (Institutions, Industry, Trainees, Analytics, Reports) */}
      {showTabModal && (
        <div className="ind-modal-overlay" onClick={() => setShowTabModal(null)}>
          <div className="ind-drawer-right" onClick={(e) => e.stopPropagation()}>
            <div className="ind-modal-header">
              <div>
                <h3>{showTabModal} · District Strategic View</h3>
                <small>{selectedDistrict}</small>
              </div>
              <button onClick={() => setShowTabModal(null)}>✕</button>
            </div>
            <div className="ind-drawer-body">
              {showTabModal === "Institutions" ? (
                <>
                  <p style={{ fontSize: 13, color: "#64748b" }}>Overview of 32 monitored vocational and technical institutions in the district.</p>
                  {[
                    { name: "Government ITI, Kolhapur", eff: "87%", placement: "87%", trainees: 640, status: "Grade A" },
                    { name: "Government ITI, Shiroli", eff: "82%", placement: "81%", trainees: 380, status: "Grade A" },
                    { name: "Government Polytechnic Kolhapur", eff: "91%", placement: "89%", trainees: 850, status: "Autonomous" },
                    { name: "ITI Gargoti", eff: "78%", placement: "72%", trainees: 290, status: "Grade B+" },
                    { name: "ITI Gadhinglaj", eff: "75%", placement: "68%", trainees: 260, status: "Grade B" },
                  ].map((inst, idx) => (
                    <div key={idx} className="ind-candidate-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <strong>{inst.name}</strong>
                        <span className="ind-verified-badge">{inst.status}</span>
                      </div>
                      <div className="ind-cand-tags">
                        <span>Readiness: {inst.eff}</span>
                        <span>Placement: {inst.placement}</span>
                        <span>{inst.trainees} Enrolled</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : showTabModal === "Industry" ? (
                <>
                  <p style={{ fontSize: 13, color: "#64748b" }}>Aggregated industrial clusters, hiring requisitions, and employer partnerships.</p>
                  {[
                    { name: "Gokul Shirgaon MIDC", cluster: "Auto-components & Foundry", open: 540, units: 180 },
                    { name: "Shiroli MIDC", cluster: "High-precision CNC & Tooling", open: 380, units: 220 },
                    { name: "Kagal Five Star MIDC", cluster: "Textile Automation & Foundry", open: 620, units: 140 },
                    { name: "Hupari Silver & Precision Cluster", cluster: "Artisanal & CAD Jewellery", open: 190, units: 95 },
                  ].map((midc, idx) => (
                    <div key={idx} className="ind-candidate-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <strong>{midc.name}</strong>
                        <span className="ind-match-badge" style={{ background: "#fff3ea", color: "#c2410c" }}>{midc.open} Openings</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#475569" }}>{midc.cluster} · {midc.units} industrial units</div>
                    </div>
                  ))}
                </>
              ) : showTabModal === "Trainees" ? (
                <>
                  <p style={{ fontSize: 13, color: "#64748b" }}>District trainee enrollment, certification velocity, and gender diversity.</p>
                  <div className="ind-stats-list" style={{ marginTop: 10 }}>
                    <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Total Enrolled Trainees</span></div><strong className="min-stat-value">8,420</strong></div>
                    <div className="min-stat-line"><div className="min-stat-label-wrap"><span>NSQF Assessment Pass Rate</span></div><strong className="min-stat-value">91.4%</strong></div>
                    <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Dual System of Training (DST)</span></div><strong className="min-stat-value">1,840 trainees</strong></div>
                    <div className="min-stat-line"><div className="min-stat-label-wrap"><span>Female Enrollment in STEM/Trades</span></div><strong className="min-stat-value">34.2% (+6.8% YoY)</strong></div>
                  </div>
                </>
              ) : showTabModal === "Analytics" ? (
                <>
                  <p style={{ fontSize: 13, color: "#64748b" }}>District Skill Gap Index (62) diagnostic breakdown across core economic pillars.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                    {[
                      { sector: "CNC Precision & Robotics", gap: "74 / 100", urgent: true, desc: "High local demand exceeds current certified intake" },
                      { sector: "Foundry Metallurgical Ops", gap: "68 / 100", urgent: true, desc: "Modern induction furnace training needed" },
                      { sector: "Welding & Fabrication", gap: "54 / 100", urgent: false, desc: "Balanced supply; specialized TIG certification required" },
                      { sector: "Industrial Automation & EV", gap: "79 / 100", urgent: true, desc: "New emerging trade with limited lab capacity" },
                    ].map((s, idx) => (
                      <div key={idx} style={{ background: "#f8fafc", padding: 12, borderRadius: 6, borderLeft: `4px solid ${s.urgent ? "#ea580c" : "#008075"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: 13 }}>{s.sector}</strong>
                          <span style={{ fontSize: 12, fontWeight: 700, color: s.urgent ? "#ea580c" : "#008075" }}>Gap: {s.gap}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#64748b" }}>Downloadable District Skill Development Plan (DSDP) and Quarterly Reviews.</p>
                  {[
                    { title: "Kolhapur DSDP Strategic Roadmap 2026", size: "2.4 MB PDF", date: "Q1 2026 Edition" },
                    { title: "MIDC Cluster Apprenticeship Absorption Audit", size: "1.8 MB PDF", date: "Feb 2026" },
                    { title: "Board of Studies Vocational Curriculum Report", size: "950 KB PDF", date: "Jan 2026" },
                  ].map((r, idx) => (
                    <div key={idx} className="ind-candidate-item" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{r.title}</strong>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{r.date} · {r.size}</div>
                      </div>
                      <button
                        className="ind-shortlist-btn"
                        onClick={() => showToast(`Downloaded ${r.title}`)}
                      >
                        ⇩ Download
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="ind-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="ind-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ind-modal-header">
              <h3>Ministry / Directorate Officer Profile</h3>
              <button onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div className="ind-avatar-circle" style={{ width: 52, height: 52, fontSize: 20, background: "#008075", color: "#fff" }}>
                  S
                </div>
                <div>
                  <strong style={{ fontSize: 16, display: "block" }}>District Skill Development Officer</strong>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Ministry of Skill Development & Entrepreneurship</span>
                  <div style={{ fontSize: 12, color: "#008075", fontWeight: 600 }}>{selectedDistrict}</div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, fontSize: 13, color: "#334155", display: "flex", flexDirection: "column", gap: 8 }}>
                <div>📍 <b>Jurisdiction:</b> Kolhapur District (12 Talukas)</div>
                <div>🏛️ <b>Tracked ITIs & Polytechnics:</b> 32 Institutions</div>
                <div>🏭 <b>Tracked Industrial Corridors:</b> Gokul Shirgaon, Shiroli, Kagal MIDC</div>
                <div>📊 <b>Active Projects & Apprenticeships:</b> 2,412 Positions Tracked</div>
              </div>

              <div className="ind-modal-actions" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="ind-modal-cancel"
                  onClick={() => {
                    setShowProfileModal(false);
                    if (onChooseRole) onChooseRole();
                    else if (onBack) onBack();
                  }}
                >
                  ↔ Switch Workspace Role
                </button>
                <button
                  type="button"
                  className="ind-modal-submit"
                  onClick={() => {
                    setShowProfileModal(false);
                    showToast("Ministry session refreshed.");
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

