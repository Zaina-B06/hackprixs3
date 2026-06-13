import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  FileText,
  Search,
  Calendar,
  Languages,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  FolderOpen,
  X,
  ArrowLeft,
  ChevronRight,
  Settings,
  User,
  Trash2,
  Play,
  Pause,
  Square,
  Volume2,
  Edit,
  Save,
  UploadCloud,
  Globe,
  Moon,
  Sun,
  Briefcase,
  Activity,
  ListTodo,
  MessageSquare,
  CalendarDays,
  FileCheck,
  Check,
  Info,
  ChevronLeft
} from "lucide-react";

// --- Sample Case Data (Initial State) ---
const INITIAL_MATTERS = [
  {
    id: "m1",
    title: "State vs. Rahul Kumar",
    type: "criminal",
    caseNo: "FIR 0123/2025",
    court: "Sessions Court, Hyderabad",
    client: "Rahul Kumar",
    clientLang: "Telugu",
    nextDate: "2025-07-18",
    openTasks: 2,
    stages: [
      { name: "FIR registered", status: "done" },
      { name: "Investigation", status: "active", note: "Chargesheet clock: 90 days" },
      { name: "Chargesheet", status: "upcoming" },
      { name: "Cognizance", status: "upcoming" },
      { name: "Charge framing", status: "upcoming" },
      { name: "Trial", status: "upcoming" },
    ],
    deadlines: [
      { label: "Chargesheet due", date: "2025-06-08", risk: "mandatory", note: "Default bail if missed" },
      { label: "Bail hearing prep", date: "2025-07-15", risk: "prep" },
    ],
    documents: [
      { name: "FIR_Rahul_Kumar_Signed.pdf", size: "1.2 MB", date: "12 May 2025" },
      { name: "Bail_Application_Draft_v2.docx", size: "340 KB", date: "10 Jun 2025" }
    ],
    notes: [
      { date: "15 May 2025", author: "Adv. Zainab", content: "Met Rahul's brother. He states that Rahul was at home during the incident. Need to secure neighborhood CCTV footage from 11 PM onwards." }
    ]
  },
  {
    id: "m2",
    title: "Sharma Traders vs. Verma Enterprises",
    type: "civil",
    caseNo: "CS 154/2025",
    court: "City Civil Court, Hyderabad",
    client: "Sharma Traders",
    clientLang: "Hindi",
    nextDate: "2025-07-18",
    openTasks: 1,
    stages: [
      { name: "Plaint filed", status: "done" },
      { name: "Summons served", status: "done" },
      { name: "Written statement", status: "active", note: "30/90/120 day clock" },
      { name: "Framing of issues", status: "upcoming" },
      { name: "Evidence", status: "upcoming" },
      { name: "Judgment / decree", status: "upcoming" },
    ],
    deadlines: [
      { label: "Written statement due", date: "2025-07-12", risk: "directory", note: "Extendable to 90 days" },
      { label: "Limitation (recovery)", date: "2027-01-05", risk: "limitation", note: "3 yrs from cause of action" },
    ],
    documents: [
      { name: "Plaint_Sharma_Traders.pdf", size: "2.4 MB", date: "03 Apr 2025" },
      { name: "Summons_Proof_Service.pdf", size: "890 KB", date: "24 Apr 2025" }
    ],
    notes: [
      { date: "28 Apr 2025", author: "Adv. Zainab", content: "Written statement from Verma Enterprises has not been received. Calculated limitation timer. Preparing application for default judgment if they exceed 90 days." }
    ]
  },
  {
    id: "m3",
    title: "Begum vs. Begum",
    type: "family",
    caseNo: "HMA 88/2025",
    court: "Family Court, Hyderabad",
    client: "Ayesha Begum",
    clientLang: "Urdu",
    nextDate: "2025-08-02",
    openTasks: 0,
    stages: [
      { name: "Petition filed", status: "done" },
      { name: "Notice to respondent", status: "active" },
      { name: "Counselling", status: "upcoming" },
      { name: "Evidence", status: "upcoming" },
      { name: "Decree", status: "upcoming" },
    ],
    deadlines: [
      { label: "Counselling session", date: "2025-08-02", risk: "prep" },
    ],
    documents: [
      { name: "HMA_Petition_88.pdf", size: "3.1 MB", date: "22 May 2025" }
    ],
    notes: [
      { date: "05 Jun 2025", author: "Adv. Zainab", content: "Ayesha reports husband is willing to discuss mutual consent terms. Next counselling date is highly critical for drafting compromise deed." }
    ]
  },
];

const TOOLS = [
  { id: "summarize", icon: FileText, name: "Summarize document", desc: "Turn long court documents or FIRs into short, easy summaries" },
  { id: "extract", icon: Search, name: "Extract key details", desc: "Automatically find and list case numbers, parties, and dates" },
  { id: "deadlines", icon: CalendarDays, name: "Calculate deadlines", desc: "Work out due dates and alerts based on standard rules" },
  { id: "client", icon: Languages, name: "Update client", desc: "Write updates in English and translate them to client's language" },
  { id: "dictate", icon: Mic, name: "Dictate note", desc: "Talk to record notes. Mix English & Hindi naturally to get typed text" },
  { id: "search_cases", icon: Search, name: "Search similar cases", desc: "Look up past cases to see their details and how they ended" },
];

const TYPE_TAGS = {
  criminal: { bg: "rgba(168, 61, 34, 0.15)", fg: "var(--alert-red)", label: "Criminal" },
  civil: { bg: "rgba(31, 61, 51, 0.1)", fg: "var(--primary)", label: "Civil" },
  family: { bg: "rgba(198, 155, 63, 0.15)", fg: "var(--gold)", label: "Family" },
  property: { bg: "rgba(41, 96, 67, 0.15)", fg: "var(--alert-green)", label: "Property" },
};

const RISK_STYLES = {
  mandatory: { bg: "var(--alert-red-bg)", fg: "var(--alert-red)", label: "Mandatory" },
  limitation: { bg: "var(--alert-red-bg)", fg: "var(--alert-red)", label: "Limitation" },
  directory: { bg: "var(--alert-yellow-bg)", fg: "var(--alert-yellow)", label: "Directory" },
  prep: { bg: "var(--alert-green-bg)", fg: "var(--alert-green)", label: "Prep" },
};

export default function App() {
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem("court_saarthi_cases");
    return saved ? JSON.parse(saved) : INITIAL_MATTERS;
  });
  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState("cases"); // cases, calendar, client, settings
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [newCaseModal, setNewCaseModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // New Case Form State
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("criminal");
  const [formCaseNo, setFormCaseNo] = useState("");
  const [formCourt, setFormCourt] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formClientLang, setFormClientLang] = useState("Hindi");
  const [formNextDate, setFormNextDate] = useState("");

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("court_saarthi_cases", JSON.stringify(cases));
  }, [cases]);

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!formTitle || !formCaseNo) return;

    const newCase = {
      id: "m_" + Date.now(),
      title: formTitle,
      type: formType,
      caseNo: formCaseNo,
      court: formCourt || "District Court, Hyderabad",
      client: formClient || "Anonymous Client",
      clientLang: formClientLang,
      nextDate: formNextDate || new Date().toISOString().split("T")[0],
      openTasks: 0,
      stages: [
        { name: formType === "criminal" ? "FIR registered" : "Plaint filed", status: "done" },
        { name: "First hearing", status: "active" },
        { name: "Evidence", status: "upcoming" },
        { name: "Arguments", status: "upcoming" },
        { name: "Final order", status: "upcoming" }
      ],
      deadlines: [
        { label: "Prepare case brief", date: formNextDate || new Date().toISOString().split("T")[0], risk: "prep" }
      ],
      documents: [],
      notes: []
    };

    setCases([newCase, ...cases]);
    setNewCaseModal(false);
    
    // Clear Form
    setFormTitle("");
    setFormType("criminal");
    setFormCaseNo("");
    setFormCourt("");
    setFormClient("");
    setFormClientLang("Hindi");
    setFormNextDate("");
  };

  const selectedMatter = cases.find((m) => m.id === openId);

  // Calculate quick stats
  const totalCases = cases.length;
  const criminalCases = cases.filter(c => c.type === 'criminal').length;
  const civilCases = cases.filter(c => c.type === 'civil').length;
  const pendingHearings = cases.filter(c => {
    const d = new Date(c.nextDate);
    const today = new Date();
    return d >= today;
  }).length;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: 250,
        background: "var(--bg-sidebar)",
        color: "var(--text-light)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid var(--border-color)",
        flexShrink: 0
      }}>
        <div>
          {/* Logo */}
          <div style={{
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
            }}>
              <Scale size={20} color="#12241f" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="serif" style={{ fontSize: 20, color: "#ffffff", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                CourtSaarthi
              </h1>
              <span style={{ fontSize: 10, color: "var(--gold-light)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                AI Legal Assistant
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <SidebarBtn 
              active={activeTab === "cases"} 
              icon={Briefcase} 
              label="Cases Dashboard" 
              onClick={() => { setActiveTab("cases"); setOpenId(null); }} 
            />
            <SidebarBtn 
              active={activeTab === "calendar"} 
              icon={Calendar} 
              label="Hearing Calendar" 
              onClick={() => { setActiveTab("calendar"); }} 
            />
            <SidebarBtn 
              active={activeTab === "client"} 
              icon={Languages} 
              label="Client Multi-Lingual" 
              onClick={() => { setActiveTab("client"); }} 
            />
            <SidebarBtn 
              active={activeTab === "settings"} 
              icon={Settings} 
              label="Settings & Profile" 
              onClick={() => { setActiveTab("settings"); }} 
            />
          </nav>
        </div>

        {/* User profile section at the bottom */}
        <div style={{
          padding: "20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--gold)"
          }}>
            <User size={20} color="var(--text-light)" />
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#ffffff" }}>
              Adv. Zainab Ali
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              High Court of Telangana
            </div>
          </div>
          
          {/* Light/Dark Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--gold-light)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px"
            }}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
      }}>
        {/* Top Header */}
        <header style={{
          height: 70,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, width: "40%" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text"
                placeholder="Search cases, client names, court numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-app)",
                  fontSize: 13,
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, background: "var(--gold-bg)", color: "var(--gold)", padding: "4px 10px", borderRadius: "12px", fontWeight: 600 }}>
              <Activity size={12} />
              <span>AI System: Active & Online</span>
            </div>
            
            <button 
              className="btn-primary" 
              onClick={() => setNewCaseModal(true)}
              style={{ padding: "8px 16px" }}
            >
              <Plus size={16} />
              <span>Add Case File</span>
            </button>
          </div>
        </header>

        {/* Tab Content Router */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {activeTab === "cases" && (
            openId === null 
              ? <CaseGallery cases={cases} onOpen={setOpenId} searchQuery={searchQuery} filterType={filterType} setFilterType={setFilterType} stats={{ totalCases, criminalCases, civilCases, pendingHearings }} onDeleteCase={(id) => {
                  if (confirm("Are you sure you want to delete this case file?")) {
                    setCases(cases.filter(c => c.id !== id));
                  }
                }} />
              : <CaseDetail matter={selectedMatter} onBack={() => setOpenId(null)} setCases={setCases} cases={cases} onOpenDetail={setOpenId} />
          )}

          {activeTab === "calendar" && <CalendarView cases={cases} onOpenCase={(id) => { setActiveTab("cases"); setOpenId(id); }} />}

          {activeTab === "client" && <ClientUpdatesView cases={cases} />}

          {activeTab === "settings" && <SettingsView />}
        </div>
      </main>

      {/* New Case Registration Modal */}
      {newCaseModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "var(--bg-card)",
            width: "500px",
            maxWidth: "90%",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--border-color)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "20px 24px",
              background: "var(--primary)",
              color: "var(--text-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <h2 className="serif" style={{ margin: 0, fontSize: 18, color: "var(--text-light)" }}>New Case Docket</h2>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setNewCaseModal(false)} />
            </div>

            <form onSubmit={handleCreateCase} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Case Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  placeholder="e.g. State vs. Rahul Kumar or Sharma vs. Verma"
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Case Category</label>
                  <select 
                    className="input-field" 
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="criminal">Criminal</option>
                    <option value="civil">Civil</option>
                    <option value="family">Family</option>
                    <option value="property">Property</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Case / FIR No.</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    placeholder="e.g. FIR 0123/2025"
                    value={formCaseNo} 
                    onChange={(e) => setFormCaseNo(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Jurisdiction / Court Room</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Sessions Court, Hyderabad"
                  value={formCourt} 
                  onChange={(e) => setFormCourt(e.target.value)} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Client Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Ayesha Begum"
                    value={formClient} 
                    onChange={(e) => setFormClient(e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Client Language</label>
                  <select 
                    className="input-field" 
                    value={formClientLang}
                    onChange={(e) => setFormClientLang(e.target.value)}
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Urdu">Urdu</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Next Hearing Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formNextDate} 
                  onChange={(e) => setFormNextDate(e.target.value)} 
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn-secondary" onClick={() => setNewCaseModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Register Case File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sidebar Helper Component ---
function SidebarBtn({ active, icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        border: "none",
        background: active ? "var(--gold)" : "transparent",
        color: active ? "#12241f" : "rgba(255,255,255,0.7)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "14px",
        fontWeight: active ? 600 : 500,
        textAlign: "left",
        transition: "all var(--transition-fast)"
      }}
    >
      <Icon size={18} color={active ? "#12241f" : "rgba(255,255,255,0.5)"} />
      <span>{label}</span>
    </button>
  );
}

// --- Case Gallery component ---
function CaseGallery({ cases, onOpen, searchQuery, filterType, setFilterType, stats, onDeleteCase }) {
  const filteredCases = cases.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.court.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && m.type === filterType;
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
      {/* Page Title & Intro */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
            Cases Repository
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Access and manage active litigation briefs, compute procedural clocks, and draft updates.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        <StatsCard label="Total Active Files" val={stats.totalCases} desc="All pending matters" icon={Briefcase} color="var(--primary)" />
        <StatsCard label="Upcoming Hearings" val={stats.pendingHearings} desc="In next 30 days" icon={Calendar} color="var(--gold)" />
        <StatsCard label="Criminal Clocks" val={stats.criminalCases} desc="With strict bail timelines" icon={AlertTriangle} color="var(--alert-red)" />
        <StatsCard label="Civil Recovery / Plaints" val={stats.civilCases} desc="Under statutory deadlines" icon={FileText} color="var(--alert-green)" />
      </div>

      {/* Filters & Search Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "14px",
        marginBottom: 20
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <FilterTab active={filterType === "all"} label="All Categories" onClick={() => setFilterType("all")} />
          <FilterTab active={filterType === "criminal"} label="Criminal Cases" onClick={() => setFilterType("criminal")} />
          <FilterTab active={filterType === "civil"} label="Civil Suits" onClick={() => setFilterType("civil")} />
          <FilterTab active={filterType === "family"} label="Family & HMA" onClick={() => setFilterType("family")} />
          <FilterTab active={filterType === "property"} label="Property disputes" onClick={() => setFilterType("property")} />
        </div>
        
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
          Showing {filteredCases.length} of {cases.length} cases
        </span>
      </div>

      {/* Case Grid Layout */}
      {filteredCases.length === 0 ? (
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--border-color)",
          padding: "80px 24px",
          textAlign: "center"
        }}>
          <FolderOpen size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", marginBottom: 6 }}>No matches found</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 320, margin: "0 auto" }}>
            Refine your query or register a new case file in the system.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20
        }}>
          {filteredCases.map((m) => {
            const activeStage = m.stages.find((s) => s.status === "active");
            const doneStages = m.stages.filter((s) => s.status === "done").length;
            const progressPct = Math.round((doneStages / m.stages.length) * 100);
            const tag = TYPE_TAGS[m.type] || TYPE_TAGS.civil;

            return (
              <div 
                key={m.id} 
                className="transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
                onClick={() => onOpen(m.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
              >
                <div>
                  {/* Card Header Category + Tasks */}
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                    <span style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      background: tag.bg,
                      color: tag.fg
                    }}>
                      {tag.label}
                    </span>
                    
                    <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                      {m.openTasks > 0 && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--alert-red)",
                          background: "var(--alert-red-bg)",
                          borderRadius: "10px",
                          padding: "2px 8px"
                        }}>
                          {m.openTasks} Deadline{m.openTasks > 1 ? "s" : ""}
                        </span>
                      )}
                      
                      {/* Delete icon */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCase(m.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--alert-red)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                        title="Delete Case Docket"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Case Number */}
                  <h3 className="serif" style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-main)", lineHeight: 1.2 }}>
                    {m.title}
                  </h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, fontWeight: 500 }}>
                    {m.caseNo} &nbsp;&middot;&nbsp; {m.court}
                  </div>

                  {/* Case Stage Timeline Mini progress bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                      <span>Stage: {activeStage ? activeStage.name : "Complete"}</span>
                      <span>{progressPct}% Done</span>
                    </div>
                    <div style={{ width: "100%", height: "5px", background: "var(--bg-app)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--primary)", borderRadius: "3px" }} />
                    </div>
                  </div>
                </div>

                {/* Card Footer Details */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                      <Calendar size={13} color="var(--gold)" />
                      <span>Next Hearing: <b style={{ color: "var(--text-main)", fontWeight: 600 }}>{m.nextDate}</b></span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                      <User size={13} color="var(--text-muted)" />
                      <span>Client: <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{m.client}</span> ({m.clientLang})</span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 2,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginTop: 10
                  }}>
                    <span>Open Docket</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Filter tab selector ---
function FilterTab({ active, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: active ? "var(--primary)" : "var(--border-color)",
        background: active ? "var(--primary)" : "var(--bg-card)",
        color: active ? "var(--text-light)" : "var(--text-muted)",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all var(--transition-fast)"
      }}
    >
      {label}
    </button>
  );
}

// --- Quick Statistics Card ---
function StatsCard({ label, val, desc, icon: Icon, color }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-main)", margin: "4px 0" }}>
          {val}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</span>
      </div>

      <div style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  );
}

// --- Case Detail Page (Click to Reveal Folder Box Design) ---
function CaseDetail({ matter, onBack, setCases, cases }) {
  const [openFolder, setOpenFolder] = useState(null); // null, 'brief', 'deadlines', 'documents', 'notes', 'ai-tools'
  const [activeTool, setActiveTool] = useState(null);
  
  // Note inputs
  const [noteText, setNoteText] = useState("");

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
      author: "Adv. Zainab Ali",
      content: noteText
    };

    const updatedCases = cases.map((c) => {
      if (c.id === matter.id) {
        return {
          ...c,
          notes: [newNote, ...(c.notes || [])]
        };
      }
      return c;
    });

    setCases(updatedCases);
    setNoteText("");
  };

  const handleAddDeadline = (label, date, risk, note) => {
    const newDeadline = { label, date, risk, note };
    const updatedCases = cases.map((c) => {
      if (c.id === matter.id) {
        return {
          ...c,
          deadlines: [newDeadline, ...(c.deadlines || [])],
          openTasks: (c.openTasks || 0) + 1
        };
      }
      return c;
    });
    setCases(updatedCases);
  };

  const handleDeleteDeadline = (index) => {
    const updatedCases = cases.map((c) => {
      if (c.id === matter.id) {
        const deadlines = [...c.deadlines];
        deadlines.splice(index, 1);
        return {
          ...c,
          deadlines,
          openTasks: Math.max(0, c.openTasks - 1)
        };
      }
      return c;
    });
    setCases(updatedCases);
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "row",
      height: "100%",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Scrollable Main Detail Panel */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 32px",
        background: "var(--bg-app)",
        height: "100%"
      }}>
        {/* Back Link */}
        <button 
          onClick={openFolder ? () => setOpenFolder(null) : onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: 16
          }}
          onMouseEnter={(e) => e.target.style.color = "var(--primary)"}
          onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
        >
          <ArrowLeft size={16} /> {openFolder ? "Back to Case Sections" : "All cases"}
        </button>

        {/* Case Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "3px 8px",
                borderRadius: "5px",
                fontWeight: 700,
                background: TYPE_TAGS[matter.type]?.bg,
                color: TYPE_TAGS[matter.type]?.fg
              }}>
                {matter.type}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                Case ID: {matter.id}
              </span>
            </div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
              {matter.title}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 6, fontWeight: 500 }}>
              {matter.caseNo} &nbsp;&middot;&nbsp; 🏛️ {matter.court} &nbsp;&middot;&nbsp; 👥 Client: {matter.client} ({matter.clientLang})
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              background: "var(--alert-green-bg)",
              color: "var(--alert-green)",
              border: "1px solid rgba(41,96,67,0.15)",
              padding: "6px 12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--alert-green)" }} />
              Active Case
            </span>
          </div>
        </div>

        {/* Case Timeline */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginBottom: 24,
          boxShadow: "var(--shadow-sm)"
        }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700, display: "block", marginBottom: 16 }}>
            Case Timeline
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", overflowX: "auto", paddingBottom: 6 }}>
            {matter.stages.map((s, idx) => {
              const isDone = s.status === "done";
              const isActive = s.status === "active";
              const isLast = idx === matter.stages.length - 1;
              return (
                <React.Fragment key={idx}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, minWidth: 80, maxWidth: 120 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isDone ? "var(--alert-green-bg)" : isActive ? "var(--gold-bg)" : "var(--bg-app)",
                      border: "2px solid",
                      borderColor: isDone ? "var(--alert-green)" : isActive ? "var(--gold)" : "var(--border-color)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {isDone ? <Check size={14} color="var(--alert-green)" strokeWidth={3} /> : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "var(--gold)" : "var(--text-muted)" }}>{idx + 1}</span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--text-main)" : "var(--text-muted)",
                      marginTop: 8,
                      textAlign: "center",
                      whiteSpace: "nowrap"
                    }}>
                      {s.name}
                    </span>
                  </div>
                  {!isLast && (
                    <div style={{
                      flex: 1, height: "2px",
                      background: isDone ? "var(--alert-green)" : "var(--border-color)",
                      margin: "0 10px",
                      minWidth: 15
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* FOLDER DISPLAY ROUTER */}
        {openFolder === null ? (
          /* Folder Index Grid View (Uncluttered layout, click to open specific folder boxes) */
          <div>
            <SectionLabel>Case Sections</SectionLabel>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
              marginTop: 12
            }}>
              {/* Folder 1: Case Brief Box */}
              <FolderBoxCard 
                title="Case Brief" 
                desc="A quick summary of the case and client details" 
                icon={Info} 
                badgeText="Profile"
                onClick={() => setOpenFolder("brief")}
              />

              {/* Folder 2: Clocks & Deadlines Box */}
              <FolderBoxCard 
                title="Important Dates" 
                desc="See due dates and deadlines based on legal rules" 
                icon={Clock} 
                badgeText={`${matter.deadlines?.length || 0} Deadlines`}
                onClick={() => setOpenFolder("deadlines")}
              />

              {/* Folder 3: Document Locker Box */}
              <FolderBoxCard 
                title="Documents" 
                desc="Upload and store your case files" 
                icon={FolderOpen} 
                badgeText={`${matter.documents?.length || 0} Files`}
                onClick={() => setOpenFolder("documents")}
              />

              {/* Folder 4: Notes Log Box */}
              <FolderBoxCard 
                title="Case Notes" 
                desc="Read, write, and dictate notes" 
                icon={Edit} 
                badgeText={`${matter.notes?.length || 0} Notes`}
                onClick={() => setOpenFolder("notes")}
              />

              {/* Folder 5: AI Assistants Box */}
              <FolderBoxCard 
                title="AI Assistant Tools" 
                desc="Use AI to summarize files, translate, or check dates" 
                icon={Activity} 
                badgeText="6 AI Tools"
                onClick={() => setOpenFolder("ai-tools")}
              />
            </div>
          </div>
        ) : (
          /* FOCUSED REVEAL VIEW (Specific expanded folder content) */
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            boxShadow: "var(--shadow-sm)"
          }}>
            {/* Folder Header back button */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: 14,
              marginBottom: 20
            }}>
              <button 
                onClick={() => setOpenFolder(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                <ChevronLeft size={16} /> Back to Case Sections
              </button>

              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Section: {openFolder.toUpperCase()}
              </span>
            </div>

            {/* Render Folder Content */}
            {openFolder === "brief" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", margin: 0 }}>Case Brief Overview</h3>
                <p style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                  This litigation details a {matter.type} dispute regarding <b>{matter.title}</b> registered under docket <b>{matter.caseNo}</b>.
                  The client, {matter.client}, communicates primarily in <b>{matter.clientLang}</b>. 
                  Currently, the litigation is at the stage of <b>{matter.stages.find(s=>s.status==='active')?.name || 'Pending Trials'}</b>.
                  The client requires periodic updates in <b>{matter.clientLang}</b>. 
                </p>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginTop: 8 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>Docket Parameters</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Case / FIR Number</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{matter.caseNo}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Jurisdiction Court</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{matter.court}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Client Name</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{matter.client}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Client Language</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{matter.clientLang}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {openFolder === "deadlines" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", margin: 0 }}>Statutory Clocks & Deadlines</h3>
                
                {/* Form to add deadline */}
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", display: "block", marginBottom: 10 }}>
                    Register Custom Case Deadline
                  </span>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const label = fd.get("label");
                    const date = fd.get("date");
                    const risk = fd.get("risk");
                    const note = fd.get("note");
                    if (!label || !date) return;
                    handleAddDeadline(label, date, risk, note);
                    e.target.reset();
                  }} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "2 1 180px" }}>
                      <input type="text" name="label" required className="input-field" placeholder="Deadline description..." />
                    </div>
                    <div style={{ flex: "1 1 120px" }}>
                      <input type="date" name="date" required className="input-field" />
                    </div>
                    <div style={{ flex: "1 1 100px" }}>
                      <select name="risk" className="input-field">
                        <option value="prep">Prep</option>
                        <option value="directory">Directory</option>
                        <option value="mandatory">Mandatory</option>
                        <option value="limitation">Limitation</option>
                      </select>
                    </div>
                    <div style={{ flex: "2 1 140px" }}>
                      <input type="text" name="note" className="input-field" placeholder="Optional notes..." />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: "10px 16px" }}>
                      <Plus size={14} /> Add Clock
                    </button>
                  </form>
                </div>

                {/* Deadlines list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {matter.deadlines && matter.deadlines.length > 0 ? (
                    matter.deadlines.map((d, i) => {
                      const r = RISK_STYLES[d.risk] || RISK_STYLES.prep;
                      return (
                        <div key={i} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: "var(--bg-app)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px 16px"
                        }}>
                          {(d.risk === "mandatory" || d.risk === "limitation") 
                            ? <AlertTriangle size={16} color="var(--alert-red)" />
                            : <Clock size={16} color="var(--gold)" />}
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-main)" }}>{d.label}</div>
                            {d.note && <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{d.note}</div>}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 600 }}>{d.date}</div>
                            <span style={{
                              fontSize: 9,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "10px",
                              background: r.bg,
                              color: r.fg
                            }}>
                              {r.label}
                            </span>

                            <button 
                              onClick={() => handleDeleteDeadline(i)}
                              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                              onMouseEnter={(e)=>e.currentTarget.style.color="var(--alert-red)"}
                              onMouseLeave={(e)=>e.currentTarget.style.color="var(--text-muted)"}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
                      No statutory deadlines registered. Compute clocks below.
                    </div>
                  )}
                </div>
              </div>
            )}

            {openFolder === "documents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", margin: 0 }}>Document Locker</h3>

                {/* Upload drag-drop area */}
                <div style={{
                  background: "var(--bg-app)",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px dashed var(--border-color)",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer"
                }} onClick={() => { setOpenFolder("ai-tools"); setActiveTool({ id: "summarize", icon: FileText, name: "Summarize document" }); }}>
                  <UploadCloud size={28} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                  <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>Drag and drop court brief filings or scans</h4>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Supports PDF, DOCX, scan images up to 10MB.</p>
                </div>

                {/* Document Registry List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {matter.documents && matter.documents.length > 0 ? (
                    matter.documents.map((doc, idx) => (
                      <div key={idx} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--bg-app)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px 12px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <FileCheck size={16} color="var(--primary)" />
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-main)" }}>{doc.name}</div>
                            <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{doc.size} &nbsp;&middot;&nbsp; Added {doc.date}</span>
                          </div>
                        </div>

                        <button 
                          className="btn-secondary" 
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => { setOpenFolder("ai-tools"); setActiveTool({ id: "summarize", icon: FileText, name: "Summarize document" }); }}
                        >
                          Extract Brief
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)" }}>
                      No files loaded. Propose scans or docket updates.
                    </div>
                  )}
                </div>
              </div>
            )}

            {openFolder === "notes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", margin: 0 }}>Advocate Notes Log</h3>

                {/* Add note text entries */}
                <form onSubmit={handleAddNote} style={{
                  background: "var(--bg-app)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}>
                  <textarea 
                    className="input-field" 
                    rows={3} 
                    required
                    placeholder="Record verbal admissions, court scheduling details, or local counselor instructions here..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    style={{ resize: "vertical", fontSize: 13 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Sanitized by CourtSaarthi AI
                    </span>
                    
                    <div style={{ display: "flex", gap: 8 }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => { setOpenFolder("ai-tools"); setActiveTool({ id: "dictate", icon: Mic, name: "Dictate a note" }); }}
                      >
                        <Mic size={13} style={{ marginRight: 4 }} /> Dictate Note
                      </button>
                      <button type="submit" className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}>
                        <Save size={13} style={{ marginRight: 4 }} /> File Note
                      </button>
                    </div>
                  </div>
                </form>

                {/* Notes List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {matter.notes && matter.notes.length > 0 ? (
                    matter.notes.map((note, idx) => (
                      <div key={idx} style={{
                        background: "var(--bg-app)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 14px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
                          <span>👤 {note.author}</span>
                          <span>🗓️ Filed {note.date}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: "var(--text-main)", lineHeight: 1.4, whiteSpace: "pre-line", margin: 0 }}>
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                      No advocate notes recorded. File logs above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {openFolder === "ai-tools" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", margin: 0 }}>AI Legal Actions Panel</h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  {TOOLS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div 
                        key={t.id} 
                        onClick={() => setActiveTool(t)}
                        style={{
                          background: "var(--bg-app)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          padding: "24px 20px",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "180px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--primary)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-color)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "8px",
                            background: "var(--gold-bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 12
                          }}>
                            <Icon size={18} color="var(--primary)" />
                          </div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>{t.name}</h4>
                          <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>{t.desc}</p>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginTop: 16, display: "flex", alignItems: "center", gap: 2 }}>
                          <span>Launch Tool</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Tool Sidebar Drawer */}
      {activeTool && (
        <ToolPanel 
          tool={activeTool} 
          matter={matter} 
          onClose={() => setActiveTool(null)} 
          onAddDeadline={handleAddDeadline}
          onAddNote={(content) => {
            const newNote = {
              date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
              author: "Adv. Zainab Ali (AI Transcribed)",
              content
            };
            const updatedCases = cases.map((c) => {
              if (c.id === matter.id) {
                return { ...c, notes: [newNote, ...(c.notes || [])] };
              }
              return c;
            });
            setCases(updatedCases);
          }}
          onSaveExtractedDetails={(extDetails) => {
            const updatedCases = cases.map((c) => {
              if (c.id === matter.id) {
                return {
                  ...c,
                  caseNo: extDetails.caseNo || c.caseNo,
                  court: extDetails.court || c.court,
                  client: extDetails.client || c.client,
                };
              }
              return c;
            });
            setCases(updatedCases);
          }}
        />
      )}
    </div>
  );
}

// --- Folder Box Card component ---
function FolderBoxCard({ title, desc, icon: Icon, badgeText, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 20px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)",
        transition: "all var(--transition-fast)",
        minHeight: "150px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--gold)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "6px",
            background: "var(--gold-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon size={16} color="var(--primary)" />
          </div>
          <span style={{
            fontSize: 10,
            background: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            padding: "2px 8px",
            borderRadius: "10px",
            fontWeight: 700,
            color: "var(--text-muted)",
            marginLeft: "auto"
          }}>
            {badgeText}
          </span>
        </div>
        
        <h3 className="serif" style={{ fontSize: 16.5, fontWeight: 700, color: "var(--text-main)", margin: "0 0 6px 0" }}>
          {title}
        </h3>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
          {desc}
        </p>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 2,
        fontSize: 12,
        fontWeight: 700,
        color: "var(--primary)",
        marginTop: 14
      }}>
        <span>Open Folder</span>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

// --- Section Header Label ---
function SectionLabel({ children }) {
  return (
    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
      {children}
    </span>
  );
}

// --- ToolPanel Interactive Panel (AI Simulations) ---
function ToolPanel({ tool, matter, onClose, onAddDeadline, onAddNote, onSaveExtractedDetails }) {
  const [toolState, setToolState] = useState("idle"); // idle, loading, complete
  
  // States for specific tools
  // Compute Deadlines States
  const [triggerDate, setTriggerDate] = useState(new Date().toISOString().split("T")[0]);
  const [triggerEvent, setTriggerEvent] = useState("summons");
  const [computedDeadlines, setComputedDeadlines] = useState([]);

  // Extract Details Form States
  const [extCaseNo, setExtCaseNo] = useState(matter.caseNo);
  const [extCourt, setExtCourt] = useState(matter.court);
  const [extClient, setExtClient] = useState(matter.client);
  const [extIPCSection, setExtIPCSection] = useState(matter.type === "criminal" ? "Section 302 IPC (Murder)" : "Section 37, Recovery of Debts");

  // Client Update Translator States
  const [clientUpdateEnglish, setClientUpdateEnglish] = useState(`Your bail hearing has been successfully listed in front of Judge Rao at the Hyderabad Sessions Court for 18 July 2025. Please arrive by 10 AM with your physical Aadhaar card and salary slip.`);
  const [clientLanguage, setClientLanguage] = useState(matter.clientLang || "Hindi");
  const [translatedText, setTranslatedText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioIntervalRef = useRef(null);

  // Dictation Notes States
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const transcriptionTimerRef = useRef(null);

  // Search Past Cases States
  const [searchCaseQuery, setSearchCaseQuery] = useState("");

  const Icon = tool.icon;

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (transcriptionTimerRef.current) clearInterval(transcriptionTimerRef.current);
    };
  }, []);

  // Run AI Simulation
  const handleLaunchTool = () => {
    setToolState("loading");
    
    // Simulate API delay
    setTimeout(() => {
      setToolState("complete");
      
      // Calculate outputs based on tools
      if (tool.id === "deadlines") {
        const baseDate = new Date(triggerDate);
        let list = [];
        if (triggerEvent === "summons") {
          // Written statement 30 days mandatory / 90 days discretionary / 120 days hard cap
          const d30 = addDays(baseDate, 30);
          const d90 = addDays(baseDate, 90);
          const d120 = addDays(baseDate, 120);
          list = [
            { label: "Mandatory Written Statement (30 Days)", date: d30, risk: "mandatory", note: "Order VIII Rule 1 CPC statutory deadline" },
            { label: "Discretionary WS Limit (90 Days)", date: d90, risk: "directory", note: "Subject to court condonation of delay" },
            { label: "Hard Statutory Limit (120 Days)", date: d120, risk: "limitation", note: "Commercial Courts Act strict limitation" }
          ];
        } else if (triggerEvent === "fir") {
          // Chargesheet timeline: 60/90 days for bail
          const d60 = addDays(baseDate, 60);
          const d90 = addDays(baseDate, 90);
          list = [
            { label: "Default Bail Eligibility (60 Days)", date: d60, risk: "mandatory", note: "If offense punishable under 10 yrs (Sec 167 CrPC)" },
            { label: "Default Bail Eligibility (90 Days)", date: d90, risk: "limitation", note: "For heinous offenses punishable by life or death" }
          ];
        } else {
          // Limitation timeline
          const d3yrs = addDays(baseDate, 3 * 365);
          list = [
            { label: "Statutory Limitation Filing Period", date: d3yrs, risk: "limitation", note: "3 years from cause of action under Limitation Act" }
          ];
        }
        setComputedDeadlines(list);
      } else if (tool.id === "client") {
        // Translation mock
        const translations = {
          Hindi: `आपका जमानत आवेदन 18 जुलाई 2025 को हैदराबाद सत्र न्यायालय में न्यायाधीश राव के समक्ष सूचीबद्ध किया गया है। कृपया अपने मूल आधार कार्ड और वेतन पर्ची के साथ सुबह 10 बजे तक पहुंचें।`,
          Telugu: `మీ బెయిల్ పిటిషన్ 18 జూలై 2025 న హైదరాబాద్ సెషన్స్ కోర్టులో జడ్జి రావు గారి ఎదుట లిస్ట్ చేయబడింది. దయచేసి మీ ఒరిజినల్ ఆధార్ కార్డు మరియు జీతం స్లిప్ తో ఉదయం 10 గంటలకల్లా హాజరుకావాలి.`,
          Urdu: `آپ کی ضمانت کی سماعت 18 جولائی 2025 کو حیدرآباد سیشن کورٹ میں جج راؤ کے سامنے درج کی گئی ہے۔ براہ کرم صبح 10 بجے تک اپنے اصلی آدھار کارڈ اور تنخواہ کی پرچی کے ساتھ پہنچیں۔`,
          Tamil: `உங்கள் ஜாமீன் மனு ஜூலை 18, 2025 அன்று ஹைதராபாத் செஷன்ஸ் நீதிமன்றத்தில் நீதிபதி ராவ் முன்னிலையில் பட்டியலிடப்பட்டுள்ளது. தயவுசெய்து உங்கள் அசல் ஆதார் அட்டை மற்றும் சம்பள சீட்டுடன் காலை 10 மணிக்குள் வரவும்.`,
          English: clientUpdateEnglish
        };
        setTranslatedText(translations[clientLanguage] || translations["Hindi"]);
      }
    }, 2000);
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  };

  // Mock Dictation Dictator
  const startRecording = () => {
    setIsRecording(true);
    setTranscribedText("");
    
    const words = [
      "Case note compiled. ",
      "Conducted physical inspection of disputed family boundary in Hyderabad. ",
      "Petitioner asserts respondent built illegal brick wall. ",
      "Photographs taken and registered. ",
      "Spoke with client who confirmed compromise terms are acceptable. ",
      "Will submit joint memo on next hearing."
    ];
    
    let currentIdx = 0;
    transcriptionTimerRef.current = setInterval(() => {
      if (currentIdx < words.length) {
        setTranscribedText(prev => prev + words[currentIdx]);
        currentIdx++;
      } else {
        clearInterval(transcriptionTimerRef.current);
        setIsRecording(false);
      }
    }, 1200);
  };

  const stopRecording = () => {
    if (transcriptionTimerRef.current) clearInterval(transcriptionTimerRef.current);
    setIsRecording(false);
  };

  return (
    <div style={{
      width: 440,
      background: "var(--bg-card)",
      borderLeft: "1px solid var(--border-color)",
      boxShadow: "var(--shadow-xl)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      flexShrink: 0,
      zIndex: 10,
      position: "relative"
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-app)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "6px",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon size={16} color="var(--text-light)" />
          </div>
          <h3 className="serif" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
            {tool.name}
          </h3>
        </div>

        <button 
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Body - Interactive States */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        
        {/* State: IDLE */}
        {toolState === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-app)", borderRadius: "var(--radius-md)", padding: "14px", border: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>What this tool does</span>
              <p style={{ fontSize: 12.5, color: "var(--text-main)", marginTop: 4, lineHeight: 1.4 }}>
                {tool.id === "summarize" && "Creates a short, simple summary of long court documents, FIRs, or orders."}
                {tool.id === "extract" && "Finds and lists key details from documents like case numbers, parties, and dates."}
                {tool.id === "deadlines" && "Calculates due dates for written statements, chargesheets, or filings."}
                {tool.id === "client" && "Translates your case updates to the client's language and makes an audio version."}
                {tool.id === "dictate" && "Records what you say and types it out. You can speak in a mix of Hindi and English."}
                {tool.id === "search_cases" && "Searches legal databases to find similar cases and see how they ended."}
              </p>
            </div>

            {/* Inputs based on Tool ID */}
            {tool.id === "summarize" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-lg)", padding: "40px 20px", textAlign: "center" }}>
                  <UploadCloud size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                  <span style={{ fontSize: 13, display: "block", color: "var(--text-main)", fontWeight: 600 }}>Select sample PDF or Scan image</span>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                    <button type="button" className="btn-secondary" style={{ padding: "6px 12px", fontSize: 11 }} onClick={handleLaunchTool}>
                      Sample_FIR_Hyderabad.pdf
                    </button>
                    <button type="button" className="btn-secondary" style={{ padding: "6px 12px", fontSize: 11 }} onClick={handleLaunchTool}>
                      Order_Copy_CS154.pdf
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tool.id === "extract" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-lg)", padding: "24px", textAlign: "center" }}>
                  <UploadCloud size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                  <span style={{ fontSize: 12, display: "block", color: "var(--text-main)" }}>Scan Plaint or Complaint Docket</span>
                  <button type="button" className="btn-primary" style={{ padding: "6px 12px", fontSize: 11, marginTop: 12 }} onClick={handleLaunchTool}>
                    Simulate Doc Scan & Extract
                  </button>
                </div>
              </div>
            )}

            {tool.id === "deadlines" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Triggering Event</label>
                  <select className="input-field" value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)}>
                    <option value="summons">Summons Served to Respondent (CPC)</option>
                    <option value="fir">FIR Registered / Accused Arrested (CrPC)</option>
                    <option value="cause_of_action">Cause of Action Accrued (Limitation Suit)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Trigger Date</label>
                  <input type="date" className="input-field" value={triggerDate} onChange={(e) => setTriggerDate(e.target.value)} />
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLaunchTool}>
                  Compute Statutory Deadlines
                </button>
              </div>
            )}

            {tool.id === "search_cases" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Search terms for past cases</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. default bail chargesheet delay 90 days"
                    value={searchCaseQuery} 
                    onChange={(e) => setSearchCaseQuery(e.target.value)} 
                  />
                </div>
                <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLaunchTool}>
                  Search cases
                </button>
              </div>
            )}

            {tool.id === "client" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Update Note (English/Hindi text)</label>
                  <textarea 
                    className="input-field" 
                    rows={4} 
                    value={clientUpdateEnglish} 
                    onChange={(e) => setClientUpdateEnglish(e.target.value)} 
                    style={{ fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Translate to Language</label>
                  <select className="input-field" value={clientLanguage} onChange={(e) => setClientLanguage(e.target.value)}>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                  </select>
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLaunchTool}>
                  Generate translated update
                </button>
              </div>
            )}

            {tool.id === "dictate" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0" }}>
                <div style={{ textAlign: "center" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>AI Voice Recognition</h4>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                    Tap start and speak. Describe case facts or schedule updates in Hindi-English mixed vocabulary.
                  </p>
                </div>

                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    style={{
                      width: 80, height: 80, borderRadius: "50%", background: "var(--alert-red-bg)", border: "2px solid var(--alert-red)",
                      display: "flex", alignItems: "center", cursor: "pointer", outline: "none",
                      boxShadow: "0 4px 12px rgba(168, 61, 34, 0.2)"
                    }}
                  >
                    <Mic size={32} color="var(--alert-red)" style={{ margin: "0 auto" }} />
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    {/* Visual Sound Wave */}
                    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40 }}>
                      <div className="soundwave-bar" />
                      <div className="soundwave-bar" />
                      <div className="soundwave-bar" />
                      <div className="soundwave-bar" />
                      <div className="soundwave-bar" />
                      <div className="soundwave-bar" />
                      <div className="soundwave-bar" />
                    </div>
                    
                    <button 
                      onClick={stopRecording}
                      className="btn-primary"
                      style={{ background: "var(--alert-red)", color: "white", padding: "6px 14px" }}
                    >
                      <Square size={12} style={{ marginRight: 4 }} /> Stop Listening
                    </button>
                  </div>
                )}

                {transcribedText && (
                  <div style={{
                    width: "100%", background: "var(--bg-app)", border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)", padding: "14px", display: "flex", flexDirection: "column", gap: 10
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>LIVE TRANSLATION</span>
                    <p style={{ fontSize: 12.5, color: "var(--text-main)", margin: 0, fontStyle: "italic", lineHeight: 1.4 }}>
                      "{transcribedText}"
                    </p>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      style={{ padding: "6px 12px", fontSize: 11, alignSelf: "flex-end" }}
                      onClick={() => {
                        onAddNote(transcribedText);
                        onClose();
                      }}
                    >
                      Save to Advocate Log
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* State: LOADING */}
        {toolState === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}>
            <div style={{
              width: 50, height: 50, borderRadius: "50%",
              border: "3px solid var(--border-color)",
              borderTopColor: "var(--primary)",
              animation: "spin 1s infinite linear"
            }} />
            
            <div style={{ textAlign: "center" }}>
              <h4 className="serif" style={{ fontSize: 15, color: "var(--text-main)" }}>AI Core Processing...</h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Reviewing legal references, validating procedural rules
              </p>
            </div>
            
            <div style={{ width: "100%", maxWidth: "200px", height: "8px", background: "var(--bg-app)", borderRadius: "4px", overflow: "hidden", marginTop: 8 }}>
              <div className="shimmer-bg" style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        )}

        {/* State: COMPLETE */}
        {toolState === "complete" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tool Output Result layout */}
            
            {tool.id === "summarize" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                }}>
                  <CheckCircle2 size={16} /> Document Brief Generated Successfully
                </div>

                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <h4 className="serif" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>Executive Summary</h4>
                  <p style={{ fontSize: 12.5, color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                    This case involves charges registered under IPC sections regarding allegations of physical altercation.
                    The primary complainant asserts that the incident occurred in public jurisdiction on 10th May. 
                    Procedural clocks are active for 90 days for chargesheet registration.
                  </p>
                </div>

                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <h4 className="serif" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>Core Directives</h4>
                  <ul style={{ paddingLeft: "16px", fontSize: 12, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 6 }}>
                    <li>Defense must prepare default bail application before 90-day expiry date.</li>
                    <li>Verify CCTV footage and secure alibi statements.</li>
                    <li>Check complainant's phone call logs.</li>
                  </ul>
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={() => {
                  onAddNote("AI Summarization Log: Extracted directives and brief summaries from uploaded docket document. Critical actions include checking alibi verification files.");
                  onClose();
                }}>
                  File Brief Summary to Notes
                </button>
              </div>
            )}

            {tool.id === "extract" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 600
                }}>
                  <CheckCircle2 size={16} /> Extracted Metadata Fields
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>Case File Number</label>
                    <input type="text" className="input-field" style={{ padding: "8px 12px", fontSize: 12.5 }} value={extCaseNo} onChange={(e)=>setExtCaseNo(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>Target Court Room</label>
                    <input type="text" className="input-field" style={{ padding: "8px 12px", fontSize: 12.5 }} value={extCourt} onChange={(e)=>setExtCourt(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>Client Name</label>
                    <input type="text" className="input-field" style={{ padding: "8px 12px", fontSize: 12.5 }} value={extClient} onChange={(e)=>setExtClient(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>Extracted Statutory Sections</label>
                    <input type="text" className="input-field" style={{ padding: "8px 12px", fontSize: 12.5 }} value={extIPCSection} onChange={(e)=>setExtIPCSection(e.target.value)} />
                  </div>
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={() => {
                  onSaveExtractedDetails({ caseNo: extCaseNo, court: extCourt, client: extClient });
                  onAddNote(`AI Document Extractor: Synchronized metadata. Verified statutory applicability for ${extIPCSection}.`);
                  onClose();
                }}>
                  Save & Update Docket
                </button>
              </div>
            )}

            {tool.id === "deadlines" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 600
                }}>
                  <CheckCircle2 size={16} /> {computedDeadlines.length} Procedural Clocks Found
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {computedDeadlines.map((dl, idx) => {
                    const r = RISK_STYLES[dl.risk] || RISK_STYLES.prep;
                    return (
                      <div key={idx} style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>{dl.label}</span>
                          <span style={{ fontSize: 9, textTransform: "uppercase", padding: "2px 6px", borderRadius: "10px", background: r.bg, color: r.fg, fontWeight: 700 }}>
                            {r.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px 0" }}>{dl.note}</p>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--alert-red)" }}>Due: {dl.date}</span>
                      </div>
                    );
                  })}
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={() => {
                  computedDeadlines.forEach((dl) => {
                    onAddDeadline(dl.label, dl.date, dl.risk, dl.note);
                  });
                  onClose();
                }}>
                  Save Clocks to Case File
                </button>
              </div>
            )}

            {tool.id === "search_cases" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 600
                }}>
                  <CheckCircle2 size={16} /> Found 2 similar cases
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-main)" }}>State of Maharashtra vs. Kapil (2021)</span>
                      <span style={{ fontSize: 9, textTransform: "uppercase", padding: "2px 6px", borderRadius: "10px", background: "var(--alert-green-bg)", color: "var(--alert-green)", fontWeight: 700 }}>
                        Bail Granted
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 6px 0" }}>High Court of Bombay</p>
                    <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0 }}>
                      <b>Outcome:</b> The court ruled that if the investigation is not finished in 90 days, the accused has an absolute right to default bail.
                    </p>
                  </div>

                  <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-main)" }}>Ramesh vs. State (2018)</span>
                      <span style={{ fontSize: 9, textTransform: "uppercase", padding: "2px 6px", borderRadius: "10px", background: "var(--alert-green-bg)", color: "var(--alert-green)", fontWeight: 700 }}>
                        Bail Granted
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 6px 0" }}>Supreme Court of India</p>
                    <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0 }}>
                      <b>Outcome:</b> Confirmed that default bail cannot be delayed once the statutory period is complete and no chargesheet has been filed.
                    </p>
                  </div>
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => {
                  onAddNote(`AI Case Search: Found similar cases for "${searchCaseQuery || "default bail"}". key precedent: State vs. Kapil (2021) Bombay HC. Outcome: Bail is a right if chargesheet is delayed.`);
                  onClose();
                }}>
                  Save Search Notes to Case File
                </button>
              </div>
            )}

            {tool.id === "client" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 600
                }}>
                  <CheckCircle2 size={16} /> Translated Vernacular Update
                </div>

                {/* Chat Message Bubble */}
                <div style={{
                  background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
                  padding: "16px", display: "flex", flexDirection: "column", gap: 10
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--text-muted)", fontWeight: 700 }}>
                    <Globe size={13} color="var(--gold)" />
                    <span>TARGET LANGUAGE: {clientLanguage.toUpperCase()}</span>
                  </div>

                  <p style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.5, margin: 0, fontStyle: "italic", borderLeft: "3px solid var(--gold)", paddingLeft: 10 }}>
                    "{translatedText}"
                  </p>

                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Bilingual voice message generated</span>
                    
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsPlayingAudio(!isPlayingAudio);
                        if (!isPlayingAudio) {
                          let count = 0;
                          audioIntervalRef.current = setInterval(() => {
                            count++;
                            if (count > 20) {
                              setIsPlayingAudio(false);
                              clearInterval(audioIntervalRef.current);
                            }
                          }, 500);
                        } else {
                          if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
                        }
                      }}
                      className="btn-secondary" 
                      style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause size={12} />
                          <span>Playing Update...</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          <span>Play Audio brief</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isPlayingAudio && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 16, marginTop: 4 }}>
                      <div className="soundwave-bar" style={{ height: 12, animationDuration: "0.8s" }} />
                      <div className="soundwave-bar" style={{ height: 6, animationDuration: "1.1s" }} />
                      <div className="soundwave-bar" style={{ height: 14, animationDuration: "0.7s" }} />
                      <div className="soundwave-bar" style={{ height: 8, animationDuration: "0.9s" }} />
                      <div className="soundwave-bar" style={{ height: 12, animationDuration: "1.2s" }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => setToolState("idle")}>
                    Back & Edit
                  </button>
                  <button type="button" className="btn-primary" style={{ flex: 2, padding: "8px" }} onClick={() => {
                    onAddNote(`AI Multilingual translation: Transmitted client update to WhatsApp. Language: ${clientLanguage}. Text: "${translatedText}"`);
                    onClose();
                  }}>
                    Send & Log Update
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer controls */}
      <div style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-app)",
        display: "flex",
        justifyContent: "flex-end"
      }}>
        <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// --- Multi-lingual updates tab ---
function ClientUpdatesView({ cases }) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || "");
  const activeCase = cases.find(c => c.id === selectedCaseId);
  const [rawText, setRawText] = useState("Your bail hearing has been successfully listed in front of Judge Rao at the Hyderabad Sessions Court for 18 July 2025. Please arrive by 10 AM with your physical Aadhaar card.");
  const [lang, setLang] = useState("Hindi");
  const [translated, setTranslated] = useState("");

  const handleTranslate = () => {
    const translationMap = {
      Hindi: "आपका जमानत आवेदन 18 जुलाई 2025 को हैदराबाद सत्र न्यायालय में न्यायाधीश राव के समक्ष सूचीबद्ध किया गया है। कृपया सुबह 10 बजे तक अपने मूल आधार कार्ड के साथ पहुंचें।",
      Telugu: "మీ బెయిల్ పిటిషన్ 18 జూలై 2025 న హైదరాబాద్ సెషన్స్ కోర్టులో జడ్జి రావు గారి ఎదుట లిస్ట్ చేయబడింది. దయచేసి మీ ఒరిజినల్ ఆధార్ కార్డుతో ఉదయం 10 గంటలకల్లా హాజరుకావాలి.",
      Urdu: "آپ کی ضمانت کی سماعت 18 جولائی 2025 کو حیدرآباد سیشن کورٹ میں جج راؤ کے سامنے درج کی گئی ہے۔ براہ کرم صبح 10 بجے تک اپنے اصلی آدھار کارڈ کے ساتھ پہنچیں۔",
      Tamil: "உங்கள் ஜாமீன் மனு ஜூலை 18, 2025 அன்று ஹைதராபாத் செஷன்ஸ் நீதிமன்றத்தில் நீதிபதி ராவ் முன்னிலையில் பட்டியலிப்பட்டுள்ளது. தயவுசெய்து உங்கள் அசல் ஆதார் அட்டையுடன் காலை 10 மணிக்குள் வரவும்."
    };
    setTranslated(translationMap[lang] || translationMap["Hindi"]);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
      <h2 className="serif" style={{ fontSize: 26, color: "var(--text-main)", marginBottom: 6 }}>
        Multi-lingual Client Communication Hub
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Compose client updates in English and immediately translate to regional vernacular languages. Includes audio translation playbacks.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
          <h3 className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Draft Update</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Select Case Reference</label>
              <select className="input-field" value={selectedCaseId} onChange={(e) => setSelectedCaseId(e.target.value)}>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.caseNo})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Client Language</label>
              <select className="input-field" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Message Brief (English)</label>
              <textarea 
                className="input-field" 
                rows={4} 
                value={rawText} 
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <button type="button" className="btn-primary" onClick={handleTranslate} style={{ justifyContent: "center" }}>
              <Globe size={16} /> Translate & Generate Audio
            </button>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Translation Preview</h3>
            
            {translated ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6 }}>WHATSAPP MESSAGE BRIEF</div>
                  <p style={{ fontSize: 14, color: "var(--text-main)", fontStyle: "italic", margin: 0, borderLeft: "3px solid var(--gold)", paddingLeft: 10 }}>
                    "{translated}"
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gold-bg)", padding: "12px 16px", borderRadius: "8px" }}>
                  <Volume2 size={20} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>Audio Voice Update Ready</div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Simulated natural text-to-speech audio transcript</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", border: "1.5px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
                Draft update and click translate to view regional vernacular outputs.
              </div>
            )}
          </div>

          {translated && (
            <button 
              className="btn-primary" 
              onClick={() => {
                alert("Vernacular message sent via mock WhatsApp gateway!");
                setTranslated("");
              }}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <MessageSquare size={16} /> Transmit Message to {activeCase ? activeCase.client : "Client"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Calendar View component ---
function CalendarView({ cases, onOpenCase }) {
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState("2025-07-18");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDayPadding = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarSlots = [];
  
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
  for (let i = startDayPadding - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarSlots.push({ day: d, isPadding: true, dateStr });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarSlots.push({ day: d, isPadding: false, dateStr });
  }

  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const totalSlotsNeeded = calendarSlots.length <= 35 ? 35 : 42;
  const nextMonthPadding = totalSlotsNeeded - calendarSlots.length;
  for (let d = 1; d <= nextMonthPadding; d++) {
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarSlots.push({ day: d, isPadding: true, dateStr });
  }

  const getEventsForDate = (dateString) => {
    const list = [];
    cases.forEach((c) => {
      if (c.nextDate === dateString) {
        list.push({ type: "hearing", title: `Hearing: ${c.title}`, detail: c.court, caseId: c.id, cName: c.title });
      }
      if (c.deadlines) {
        c.deadlines.forEach((dl) => {
          if (dl.date === dateString) {
            list.push({ type: "deadline", title: `${dl.label}`, detail: dl.note || c.court, risk: dl.risk, caseId: c.id, cName: c.title });
          }
        });
      }
    });
    return list;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectedDayEvents = getEventsForDate(selectedDateStr);
  const formattedSelectedDate = new Date(selectedDateStr).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div>
        <h2 className="serif" style={{ fontSize: 26, color: "var(--text-main)", margin: 0 }}>
          Hearing & Procedural Calendar
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, marginBottom: 20 }}>
          Monthly schedule showing litigation agendas, statutory timers, and default bail thresholds.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 24, flex: 1, minHeight: 0 }}>
        {/* Month Grid */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="serif" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} color="var(--gold)" />
              {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handlePrevMonth} className="btn-secondary" style={{ padding: "6px 10px" }} title="Previous Month">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => { setCurrentMonth(6); setCurrentYear(2025); setSelectedDateStr("2025-07-18"); }} className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>
                Reset to July '25
              </button>
              <button onClick={handleNextMonth} className="btn-secondary" style={{ padding: "6px 10px" }} title="Next Month">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            fontWeight: 600,
            fontSize: 12,
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: 8,
            marginBottom: 8
          }}>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridAutoRows: "minmax(68px, 1fr)",
            gap: 6,
            flex: 1
          }}>
            {calendarSlots.map((slot, idx) => {
              const dayEvents = getEventsForDate(slot.dateStr);
              const isSelected = slot.dateStr === selectedDateStr;

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDateStr(slot.dateStr)}
                  style={{
                    background: slot.isPadding 
                      ? "rgba(0, 0, 0, 0.02)" 
                      : (isSelected ? "var(--gold-bg)" : "var(--bg-app)"),
                    border: isSelected 
                      ? "2px solid var(--gold)" 
                      : "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: slot.isPadding ? "rgba(0,0,0,0.25)" : "var(--text-main)",
                    alignSelf: "flex-start"
                  }}>
                    {slot.day}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                    {dayEvents.map((ev, eIdx) => {
                      const isH = ev.type === "hearing";
                      return (
                        <div 
                          key={eIdx}
                          style={{
                            width: "100%",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            fontSize: "8.5px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            background: isH ? "var(--alert-green-bg)" : "var(--alert-red-bg)",
                            color: isH ? "var(--alert-green)" : "var(--alert-red)"
                          }}
                          title={`${ev.cName}: ${ev.title}`}
                        >
                          {isH ? "🏛️ " : "⚠️ "}{ev.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div>
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold)", fontWeight: 700 }}>
                Selected Day Agenda
              </span>
              <h4 className="serif" style={{ fontSize: 16, color: "var(--text-main)", margin: "4px 0 0 0", fontWeight: 700 }}>
                {formattedSelectedDate}
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 380, overflowY: "auto" }}>
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((ev, index) => {
                  const isH = ev.type === "hearing";
                  return (
                    <div key={index} style={{
                      background: "var(--bg-app)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 14px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 8.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "8px",
                          background: isH ? "var(--alert-green-bg)" : "var(--alert-red-bg)",
                          color: isH ? "var(--alert-green)" : "var(--alert-red)"
                        }}>
                          {ev.type}
                        </span>
                        
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-main)" }}>
                          {ev.cName}
                        </span>
                      </div>

                      <h5 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 4px 0" }}>
                        {ev.title}
                      </h5>
                      
                      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                        {isH ? `🏛️ Room: ${ev.detail}` : `⚠️ Annotation: ${ev.detail}`}
                      </p>

                      <button 
                        className="btn-secondary" 
                        style={{ padding: "4px 8px", fontSize: 10, width: "100%", justifyContent: "center" }}
                        onClick={() => onOpenCase(ev.caseId)}
                      >
                        Open Case File
                      </button>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  border: "1.5px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-muted)",
                  fontSize: 12.5
                }}>
                  <Clock size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                  No litigation dates listed for this date in the registry database.
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: 12 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
              AI deadline engine updates schedules dynamically as case docs are scanned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Settings View ---
function SettingsView() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
      <h2 className="serif" style={{ fontSize: 26, color: "var(--text-main)", marginBottom: 6 }}>
        System Configurations
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Configure advocate profile data, toggle system integrations, and verify local litigation databases.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 650 }}>
        {/* User profile */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
          <h3 className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Advocate Credentials</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Full Legal Name</label>
              <input type="text" className="input-field" defaultValue="Advocate Zainab Ali" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Bar Council ID</label>
              <input type="text" className="input-field" defaultValue="TS/4523/2022" />
            </div>
          </div>
        </div>

        {/* Database stats */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
          <h3 className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Litigation Ledger</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            Your case repository is stored locally using HTML5 localStorage. Cleaning application cookies will wipe the record.
          </p>
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ color: "var(--alert-red)", borderColor: "rgba(168,61,34,0.3)" }}
            onClick={() => {
              if (confirm("This will erase all registered cases and revert the application to initial sample cases. Proceed?")) {
                localStorage.removeItem("court_saarthi_cases");
                window.location.reload();
              }
            }}
          >
            Revert to default mock database
          </button>
        </div>
      </div>
    </div>
  );
}