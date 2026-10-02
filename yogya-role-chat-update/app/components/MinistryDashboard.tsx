"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ministry-dashboard.css";

type Institution = {
  name: string;
  type: string;
  district: string;
  efficiency: number;
  readiness: number;
  courses: number;
  trainers: number;
  trainees: number;
  demand: { name: string; openings: number }[];
  tags: string[];
};

const institutions: Institution[] = [
  { name: "Government ITI, Kolhapur", type: "INSTITUTION", district: "Kolhapur, Maharashtra", efficiency: 87, readiness: 87, courses: 14, trainers: 92, trainees: 640, tags: ["Foundry", "Auto-components", "Textiles"], demand: [{ name: "CNC operators", openings: 120 }, { name: "Welders", openings: 85 }, { name: "Electricians", openings: 60 }] },
  { name: "Gokul Shirgaon MIDC", type: "INDUSTRIAL BELT", district: "Kolhapur, Maharashtra", efficiency: 91, readiness: 89, courses: 9, trainers: 86, trainees: 420, tags: ["Auto-components", "Foundry", "CNC machining"], demand: [{ name: "CNC operators", openings: 140 }, { name: "Welders", openings: 92 }, { name: "Quality inspectors", openings: 44 }] },
  { name: "Shiroli MIDC", type: "INDUSTRIAL BELT", district: "Kolhapur, Maharashtra", efficiency: 84, readiness: 82, courses: 11, trainers: 89, trainees: 510, tags: ["Engineering", "Fabrication", "Electrical"], demand: [{ name: "Fitters", openings: 98 }, { name: "Welders", openings: 74 }, { name: "Electricians", openings: 63 }] },
  { name: "Shivaji University", type: "INSTITUTION", district: "Kolhapur, Maharashtra", efficiency: 90, readiness: 91, courses: 22, trainers: 94, trainees: 1240, tags: ["Engineering", "IT", "Mechatronics"], demand: [{ name: "Automation technicians", openings: 70 }, { name: "Quality inspectors", openings: 52 }, { name: "CNC operators", openings: 40 }] },
  { name: "District Hospital, Kolhapur", type: "PUBLIC SERVICE", district: "Kolhapur, Maharashtra", efficiency: 81, readiness: 78, courses: 8, trainers: 83, trainees: 290, tags: ["Healthcare", "Electrical maintenance", "IT support"], demand: [{ name: "Electricians", openings: 38 }, { name: "IT support", openings: 26 }, { name: "Technicians", openings: 21 }] },
  { name: "Government Polytechnic, Kolhapur", type: "INSTITUTION", district: "Kolhapur, Maharashtra", efficiency: 89, readiness: 86, courses: 18, trainers: 90, trainees: 980, tags: ["Mechanical", "Electrical", "Automation"], demand: [{ name: "CNC operators", openings: 74 }, { name: "Electrical technicians", openings: 61 }, { name: "Quality inspectors", openings: 32 }] },
];

export default function MinistryDashboard({ onBack, onChooseRole, onAskSarthi }: { onBack: () => void; onChooseRole?: () => void; onAskSarthi?: () => void }) {
  const [selected, setSelected] = useState("Government ITI, Kolhapur");
  const [district, setDistrict] = useState("Kolhapur District, Maharashtra");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notice, setNotice] = useState("");
  const mapElement = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);
  const leafletMarkers = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const win = window as unknown as { L?: any };
    const initMap = () => {
      if (cancelled || !mapElement.current || !win.L) return;
      const L = win.L;
      const centers: Record<string, [number, number]> = {
        "Kolhapur District, Maharashtra": [16.705, 74.2433],
        "Sangli District, Maharashtra": [16.8524, 74.5815],
        "Satara District, Maharashtra": [17.6805, 74.0183],
      };
      const center = centers[district] ?? centers["Kolhapur District, Maharashtra"];
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapElement.current, { zoomControl: false, scrollWheelZoom: true }).setView(center, 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        }).addTo(leafletMap.current);
        L.control.zoom({ position: "bottomright" }).addTo(leafletMap.current);
        const geoPins: { name: string; coords: [number, number]; type: string }[] = [
          { name: "Government ITI, Kolhapur", coords: [16.6916, 74.2317], type: "INSTITUTION" },
          { name: "Shivaji University", coords: [16.6875, 74.257], type: "INSTITUTION" },
          { name: "Government Polytechnic, Kolhapur", coords: [16.7044, 74.2438], type: "INSTITUTION" },
          { name: "Gokul Shirgaon MIDC", coords: [16.6702, 74.2758], type: "INDUSTRIAL BELT" },
          { name: "Shiroli MIDC", coords: [16.7385, 74.3404], type: "INDUSTRIAL BELT" },
          { name: "District Hospital, Kolhapur", coords: [16.705, 74.238], type: "PUBLIC SERVICE" },
        ];
        leafletMarkers.current = geoPins.map((pin) => {
          const marker = L.marker(pin.coords).addTo(leafletMap.current);
          marker.bindTooltip(pin.name, { direction: "top", offset: [0, -8] });
          marker.on("click", () => selectInstitution(pin.name));
          return marker;
        });
      } else {
        leafletMap.current.setView(center, district === "Kolhapur District, Maharashtra" ? 12 : 10, { animate: true });
      }
      window.setTimeout(() => leafletMap.current?.invalidateSize(), 80);
    };
    const cssId = "yogya-leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link"); link.id = cssId; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
    }
    const winWithL = window as unknown as { L?: any };
    if (winWithL.L) initMap();
    else {
      const existing = document.querySelector<HTMLScriptElement>('script[data-yogya-leaflet="true"]');
      if (existing) existing.addEventListener("load", initMap, { once: true });
      else {
        const script = document.createElement("script"); script.dataset.yogyaLeaflet = "true";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.onload = initMap; script.onerror = () => setNotice("The live map needs an internet connection. Please reload when online."); document.body.appendChild(script);
      }
    }
    return () => { cancelled = true; };
  }, [district]);
  useEffect(() => () => {
    if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; leafletMarkers.current = []; }
  }, []);

  const institution = institutions.find((item) => item.name === selected) ?? institutions[0];
  const filtered = useMemo(() => institutions.filter((item) => `${item.name} ${item.type} ${item.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())), [search]);

  function selectInstitution(name: string) {
    setSelected(name);
    setActiveTab("Dashboard");
    const coords: Record<string, [number, number]> = {
      "Government ITI, Kolhapur": [16.6916, 74.2317],
      "Gokul Shirgaon MIDC": [16.6702, 74.2758],
      "Shiroli MIDC": [16.7385, 74.3404],
      "Shivaji University": [16.6875, 74.257],
      "District Hospital, Kolhapur": [16.705, 74.238],
      "Government Polytechnic, Kolhapur": [16.7044, 74.2438],
    };
    const position = coords[name];
    if (position && leafletMap.current) leafletMap.current.flyTo(position, 14, { duration: 0.7 });
  }

  return <main className="ymd-page">
    <h1 className="ymd-page-title">ministry dashboard</h1>
    <section className="ymd-frame" aria-label="Ministry district intelligence dashboard">
      <header className="ymd-topbar">
        <button className="ymd-ministry-brand" onClick={onBack} aria-label="Back to Yogya home"><span className="ymd-seal">✥</span><span><b>Ministry of Skill Development</b><small>and Entrepreneurship</small></span></button>
        <nav className="ymd-nav" aria-label="Ministry navigation">
          {["Dashboard", "Institutions", "Industry", "Trainees", "Analytics", "Reports"].map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => { setActiveTab(tab); if (tab !== "Dashboard") setNotice(`${tab} view selected · prototype data`); }}>{tab}</button>)}
        </nav>
        <label className="ymd-district-select"><span>📍</span><select aria-label="Select district" value={district} onChange={(e) => { setDistrict(e.target.value); setNotice(`Map centered on ${e.target.value}. Institution records remain illustrative demo data.`); }}><option>Kolhapur District, Maharashtra</option><option>Sangli District, Maharashtra</option><option>Satara District, Maharashtra</option></select></label>
        <label className="ymd-search"><span>⌕</span><input aria-label="Search institutions and areas" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search institutions, areas..." /></label>
        <button className="ymd-role-switch" onClick={onAskSarthi} title="Open the Ministry Sarthi assistant">✳ Ask Sarthi</button><button className="ymd-role-switch" onClick={onChooseRole} title="Choose another workspace">Switch role</button>
        <button className="ymd-user" onClick={onBack} title="Return to Yogya home">Y</button>
      </header>
      <div className="ymd-map-stage">
        <div className="ymd-map-viewport ymd-live-map-viewport" aria-label="Interactive OpenStreetMap map with educational institutions">
          <div ref={mapElement} className="ymd-live-map" role="application" aria-label="Live interactive map. Use mouse or touch to pan and zoom; select a marker for institution details." />
        </div>
        <div className="ymd-map-credit">Map data © OpenStreetMap contributors</div>
        <div className="ymd-map-status"><span className="ymd-live-pulse"/> Interactive map · {selected}</div>
        <aside className="ymd-institution-card">
          <img className="ymd-building-photo" src={institution.name === "Government ITI, Kolhapur" ? "/ministry-iti-building.jpg" : "/ministry-map-reference.jpg"} alt={institution.name === "Government ITI, Kolhapur" ? "Government ITI Kolhapur campus" : `Map preview for ${institution.name}`} />
          <span className="ymd-type-badge">{institution.type}</span>
          <h2>{institution.name}</h2>
          <p className="ymd-location">⌖ {district.replace(" District", "")}</p>
          <div className="ymd-efficiency"><div className="ymd-eff-ring" style={{ background: `conic-gradient(#087f78 ${institution.efficiency}%, #e7edef 0)` }}><span>{institution.efficiency}%</span></div><div><b>Institution<br/>efficiency</b><small>●</small></div></div>
          <div className="ymd-metrics">
            <div><span>♧</span><label>Placement readiness</label><b>{institution.readiness}%</b></div>
            <div><span>▤</span><label>Active courses</label><b>{institution.courses}</b></div>
            <div><span>♙</span><label>Trainer capacity</label><b>{institution.trainers}%</b></div>
            <div><span>♟</span><label>Enrolled trainees</label><b>{institution.trainees.toLocaleString("en-IN")}</b></div>
          </div>
          <div className="ymd-subhead">NEARBY INDUSTRY</div>
          <div className="ymd-tags">{institution.tags.map((tag) => <button key={tag} onClick={() => setSearch(tag)}>{tag === "Foundry" ? "▦" : tag === "Auto-components" ? "⚙" : "▤"} {tag}</button>)}</div>
          <div className="ymd-subhead ymd-demand-heading">LIVE INDUSTRY DEMAND</div>
          <div className="ymd-demand-list">{institution.demand.map((demand) => <button key={demand.name} onClick={() => { setSearch(demand.name); setNotice(`Filtered dashboard for ${demand.name}`); }}><span>{demand.name}</span><small>{demand.openings} openings</small><i><b style={{ width: `${Math.min(100, demand.openings / Math.max(...institution.demand.map((item) => item.openings)) * 100)}%` }} /></i></button>)}</div>
          <button className="ymd-alert" onClick={() => setNotice("Board of Studies revision is pending in this sample institution record.")}>ⓘ BoS revision pending <span>›</span></button>
        </aside>
        {filtered.length > 0 && search.trim() && <div className="ymd-search-results"><b>Matching locations</b>{filtered.map((item) => <button key={item.name} onClick={() => selectInstitution(item.name)}>{item.name}<span>›</span></button>)}</div>}
        {notice && <div className="ymd-notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      </div>
    </section>
  </main>;
}
