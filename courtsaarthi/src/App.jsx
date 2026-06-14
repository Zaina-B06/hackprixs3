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
    ],
    clientUpdates: [
      {
        id: "up_sample1",
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        date: "11 Jun 2025",
        language: "Telugu",
        englishText: "Your bail hearing has been successfully listed in front of Judge Rao at the Hyderabad Sessions Court for 18 July 2025. Please arrive by 10 AM with your physical Aadhaar card and salary slip.",
        translatedText: "మీ బెయిల్ పిటిషన్ 18 జూలై 2025 న హైదరాబాద్ సెషన్స్ కోర్టులో జడ్జి రావు గారి ఎదుట లిస్ట్ చేయబడింది. దయచేసి మీ ఒరిజినల్ ఆధార్ కార్డు మరియు జీతం స్లిప్ తో ఉదయం 10 గంటలకల్లా హాజరుకావాలి.",
        status: "sent"
      }
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
  { id: "summarize_extract", icon: FileText, name: "Summarize & Extract Details", desc: "Scan files to create a short summary and automatically pull case numbers, parties, and dates" },
  { id: "client", icon: Languages, name: "Update client", desc: "Write updates in English and translate them to client's language" },
  { id: "dictate", icon: Mic, name: "Voice Dictation", desc: "Speak in a mix of Hindi and English to record notes and transcribe them to English text" },
  { id: "draft_document", icon: FileText, name: "Draft Document", desc: "Select case documents to draft professional bail applications, legal notices, or replies" },
  { id: "search_cases", icon: Search, name: "Search similar cases", desc: "Look up past cases to see their details and how they ended" },
  { id: "deadlines", icon: Calendar, name: "Deadline", desc: "Type or paste case updates to extract details, schedule events, and alert clients automatically" },
];

// --- Mock Groq AI Helper ---
async function callGroq(prompt) {
  // Simulating Groq AI completion latency
  await new Promise(r => setTimeout(r, 1500));
  
  const text = prompt.toLowerCase();
  
  let date = "2025-07-25"; // default
  let eventType = "Hearing";
  let time = null;
  let location = null;
  let clientAction = null;
  
  // Try matching date like DD Month YYYY or YYYY-MM-DD or Month DD, YYYY
  const dateMatch = text.match(/(\d{1,2})?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1] ? dateMatch[1].padStart(2, "0") : "18";
    const monthStr = dateMatch[2];
    const year = dateMatch[3];
    const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
    date = `${year}-${months[monthStr]}-${day}`;
  } else {
    // Try YYYY-MM-DD
    const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) date = isoMatch[0];
  }
  
  // Try matching time
  const timeMatch = text.match(/(\d{1,2}(:\d{2})?\s*(am|pm))/);
  if (timeMatch) time = timeMatch[0].toUpperCase();
  
  // Try matching location (strictly find actual court names, return null if vague or plain 'court')
  const locMatch = text.match(/\b([a-z0-9\-']+\s+){0,3}(sessions court|family court|civil court|high court|city civil court|district court|court)\b/i);
  if (locMatch) {
    let matched = locMatch[0].trim();
    while (true) {
      const cleaned = matched.replace(/^(in|at|the|for|on|to|a|an|of|is|listed|here|am|pm|\d{1,2}(:\d{2})?(am|pm)?|\d+)\s+/i, "");
      if (cleaned === matched) break;
      matched = cleaned;
    }
    if (matched.toLowerCase() === "court" || matched.toLowerCase() === "the court" || matched.toLowerCase() === "a court") {
      location = null;
    } else {
      location = matched.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
  
  // Try matching client actions
  if (text.includes("submit") || text.includes("bring") || text.includes("present") || text.includes("provide")) {
    const actionMatch = text.match(/(submit|bring|present|provide)[^.]*/);
    if (actionMatch) {
      clientAction = actionMatch[0].trim().replace(/^\w/, c => c.toUpperCase());
    }
  }
  
  if (text.includes("bail")) eventType = "Bail Hearing";
  else if (text.includes("argument")) eventType = "Arguments";
  else if (text.includes("evidence")) eventType = "Evidence Listing";
  else if (text.includes("judgment") || text.includes("decree")) eventType = "Judgment Pronouncement";
  
  return JSON.stringify({
    eventType,
    date,
    time,
    location,
    clientAction
  });
}

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

function getFallbackTranslation(text, language) {
  if (language === "English") return text;
  
  let translated = text;
  
  if (language === "Hindi") {
    translated = translated
      .replace(/Your next hearing is on/gi, "आपकी अगली सुनवाई")
      .replace(/Your bail hearing has been/gi, "आपकी जमानत सुनवाई")
      .replace(/listed in front of/gi, "सूचीबद्ध की गई है सामने")
      .replace(/Please arrive by/gi, "कृपया पहुंचें")
      .replace(/with your/gi, "अपने साथ")
      .replace(/at the/gi, "पर")
      .replace(/at/gi, "बजे")
      .replace(/on/gi, "को")
      .replace(/Please/gi, "कृपया")
      .replace(/hearing/gi, "सुनवाई")
      .replace(/court/gi, "न्यायालय")
      .replace(/sessions court/gi, "सत्र न्यायालय")
      .replace(/family court/gi, "पारिवारिक न्यायालय")
      .replace(/civil court/gi, "सिविल न्यायालय")
      .replace(/high court/gi, "उच्च न्यायालय");
    return `[हिंदी अनुवाद]: ${translated}`;
  }
  
  if (language === "Telugu") {
    translated = translated
      .replace(/Your next hearing is on/gi, "మీ తదుపరి విచారణ తేదీ")
      .replace(/Your bail hearing has been/gi, "మీ బెయిల్ విచారణ")
      .replace(/listed in front of/gi, "లిస్ట్ చేయబడింది")
      .replace(/Please arrive by/gi, "దయచేసి హాజరుకావాలి")
      .replace(/with your/gi, "మీ")
      .replace(/at the/gi, "వద్ద")
      .replace(/at/gi, "సమయానికి")
      .replace(/on/gi, "న")
      .replace(/Please/gi, "దయచేసి")
      .replace(/hearing/gi, "విచారణ")
      .replace(/court/gi, "కోర్టు")
      .replace(/sessions court/gi, "సెషన్స్ కోర్టు")
      .replace(/family court/gi, "ఫ్యామిలీ కోర్టు")
      .replace(/civil court/gi, "సివిల్ కోర్టు")
      .replace(/high court/gi, "హైకోర్టు");
    return `[తెలుగు అనువాదం]: ${translated}`;
  }
  
  if (language === "Urdu") {
    translated = translated
      .replace(/Your next hearing is on/gi, "آپ کی اگلی سماعت")
      .replace(/Your bail hearing has been/gi, "آپ کی ضمانت کی سماعت")
      .replace(/listed in front of/gi, "کے سامنے پیش کی گئی ہے")
      .replace(/Please arrive by/gi, "براہ کرم پہنچیں")
      .replace(/with your/gi, "اپنے ساتھ")
      .replace(/at the/gi, "پر")
      .replace(/at/gi, "بجے")
      .replace(/on/gi, "کو")
      .replace(/Please/gi, "براہ کرم")
      .replace(/hearing/gi, "سماعت")
      .replace(/court/gi, "عدالت")
      .replace(/sessions court/gi, "سیشن کورٹ")
      .replace(/family court/gi, "فیملی کورٹ")
      .replace(/civil court/gi, "سیول کورٹ")
      .replace(/high court/gi, "ہائی کورٹ");
    return `[اردو ترجمہ]: ${translated}`;
  }
  
  if (language === "Tamil") {
    translated = translated
      .replace(/Your next hearing is on/gi, "உங்களின் அடுத்த விசாரணை")
      .replace(/Your bail hearing has been/gi, "உங்களின் ஜாமீன் விசாரணை")
      .replace(/listed in front of/gi, "பட்டியலிடப்பட்டுள்ளது")
      .replace(/Please arrive by/gi, "தயவுசெய்து வரவும்")
      .replace(/with your/gi, "உங்களுடன்")
      .replace(/at the/gi, "இல்")
      .replace(/at/gi, "மணிக்கு")
      .replace(/on/gi, "அன்று")
      .replace(/Please/gi, "தயவுசெய்து")
      .replace(/hearing/gi, "விசாரணை")
      .replace(/court/gi, "நீதிமன்றம்")
      .replace(/sessions court/gi, "செஷன்ஸ் நீதிமன்றம்")
      .replace(/family court/gi, "குடும்ப நீதிமன்றம்")
      .replace(/civil court/gi, "சிவில் நீதிமன்றம்")
      .replace(/high court/gi, "உயர் நீதிமன்றம்");
    return `[தமிழ் மொழிபெயர்ப்பு]: ${translated}`;
  }
  
  return text;
}

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
  const [formClient, setFormClient] = useState("");
  const [formClientLang, setFormClientLang] = useState("Hindi");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

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
    if (!formTitle || !formClient) return;

    const newId = "m_" + Date.now();
    const newCase = {
      id: newId,
      title: formTitle,
      type: formType,
      caseNo: "Not set yet — run document analysis",
      court: "Not set yet — run document analysis",
      client: formClient,
      clientPhone: formPhone,
      clientAddress: formAddress,
      clientLang: formClientLang,
      nextDate: "",
      openTasks: 0,
      stages: [
        { name: formType === "criminal" ? "FIR registered" : "Plaint filed", status: "done" },
        { name: "First hearing", status: "active" },
        { name: "Evidence", status: "upcoming" },
        { name: "Arguments", status: "upcoming" },
        { name: "Final order", status: "upcoming" }
      ],
      deadlines: [],
      documents: [],
      notes: []
    };

    setCases([newCase, ...cases]);
    setNewCaseModal(false);
    setOpenId(newId); // Open the case details immediately!
    
    // Clear Form
    setFormTitle("");
    setFormType("criminal");
    setFormClient("");
    setFormClientLang("Hindi");
    setFormPhone("");
    setFormAddress("");
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
      {activeTab !== "document_analysis" && activeTab !== "document_drafter" && (
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
              label="Client Updates" 
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
      )}

      {/* Main Panel */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
      }}>
        {/* Top Header */}
        {activeTab !== "document_analysis" && activeTab !== "document_drafter" && (
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
        )}

        {/* Tab Content Router */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {activeTab === "cases" && (
            openId === null 
              ? <CaseGallery cases={cases} onOpen={setOpenId} searchQuery={searchQuery} filterType={filterType} setFilterType={setFilterType} stats={{ totalCases, criminalCases, civilCases, pendingHearings }} onDeleteCase={(id) => {
                  if (confirm("Are you sure you want to delete this case file?")) {
                    setCases(cases.filter(c => c.id !== id));
                  }
                }} />
              : <CaseDetail 
                  matter={selectedMatter} 
                  onBack={() => setOpenId(null)} 
                  setCases={setCases} 
                  cases={cases} 
                  onOpenDetail={setOpenId} 
                  onOpenDocumentAnalysis={(caseId) => {
                    setOpenId(caseId);
                    setActiveTab("document_analysis");
                  }}
                  onOpenDocumentDrafter={(caseId) => {
                    setOpenId(caseId);
                    setActiveTab("document_drafter");
                  }}
                />
          )}

          {activeTab === "calendar" && <CalendarView cases={cases} onOpenCase={(id) => { setActiveTab("cases"); setOpenId(id); }} />}

          {activeTab === "client" && <ClientUpdatesView cases={cases} />}

          {activeTab === "settings" && <SettingsView />}

          {activeTab === "document_analysis" && (
            <DocumentAnalysisView 
              matter={selectedMatter} 
              onBack={() => setActiveTab("cases")} 
              onSaveAnalysis={(updatedCase) => {
                setCases(prevCases => prevCases.map(c => c.id === updatedCase.id ? { ...c, ...updatedCase } : c));
              }}
            />
          )}

          {activeTab === "document_drafter" && (
            <DocumentDrafterView 
              matter={selectedMatter} 
              onBack={() => setActiveTab("cases")} 
            />
          )}
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
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Client Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    placeholder="e.g. Ayesha Begum"
                    value={formClient} 
                    onChange={(e) => setFormClient(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Client Phone</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. +91 9876543210"
                    value={formPhone} 
                    onChange={(e) => setFormPhone(e.target.value)} 
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Client Address</label>
                <textarea 
                  className="input-field" 
                  rows={2}
                  placeholder="e.g. Dabeerpura, Hyderabad"
                  value={formAddress} 
                  onChange={(e) => setFormAddress(e.target.value)} 
                  style={{ resize: "vertical" }}
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
                    {m.complainant_name && m.accused_name ? `${m.complainant_name} vs. ${m.accused_name}` : m.title}
                  </h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, fontWeight: 500 }}>
                    {m.fo_number || m.caseNo} &nbsp;&middot;&nbsp; {m.court && m.court !== "Not set yet — run document analysis" ? m.court : (m.hearings && m.hearings.length > 0 ? m.hearings[0].court : "Not set yet — run document analysis")}
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
                      <span>Next Hearing: <b style={{ color: "var(--text-main)", fontWeight: 600 }}>{m.hearings && m.hearings.length > 0 ? m.hearings[0].hearing_date : (m.nextDate || "None")}</b></span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                      <User size={13} color="var(--text-muted)" />
                      <span>Client: <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{m.client_name || m.client}</span> ({m.clientLang})</span>
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
function CaseDetail({ matter, onBack, setCases, cases, onOpenDetail, onOpenDocumentAnalysis, onOpenDocumentDrafter }) {
  const [openFolder, setOpenFolder] = useState(null); // null, 'brief', 'deadlines', 'documents', 'notes', 'ai-tools'
  const [activeTool, setActiveTool] = useState(null);
  const [explainingDocIdx, setExplainingDocIdx] = useState(null);
  
  // Note inputs
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    setExplainingDocIdx(null);
  }, [openFolder]);

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
              {matter.complainant_name && matter.accused_name ? `${matter.complainant_name} vs. ${matter.accused_name}` : matter.title}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 6, fontWeight: 500 }}>
              {matter.fo_number || matter.caseNo} &nbsp;&middot;&nbsp; 🏛️ {matter.court && matter.court !== "Not set yet — run document analysis" ? matter.court : (matter.hearings && matter.hearings.length > 0 ? matter.hearings[0].court : "Not set yet — run document analysis")} &nbsp;&middot;&nbsp; 👥 Client: {matter.client_name || matter.client} ({matter.clientLang})
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

              {/* Folder 5: AI Assistants Box */}
              <FolderBoxCard 
                title="AI Assistant Tools" 
                desc="Use AI to draft documents, translate updates, search precedents, or check dates" 
                icon={Activity} 
                badgeText="5 AI Tools"
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
                {matter.brief ? (
                  <div style={{ 
                    fontSize: 14, 
                    color: "var(--text-main)", 
                    lineHeight: 1.6, 
                    margin: 0, 
                    whiteSpace: "pre-wrap",
                    background: "rgba(0, 0, 0, 0.05)",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)"
                  }}>
                    {matter.brief}
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                    No brief yet — run document analysis.
                  </p>
                )}

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginTop: 8 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>Docket Parameters</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Case / FIR Number</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        {matter.fo_number || matter.caseNo}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Jurisdiction Court</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        {matter.court && matter.court !== "Not set yet — run document analysis" ? matter.court : (matter.hearings && matter.hearings.length > 0 ? matter.hearings[0].court : "Not set yet — run document analysis")}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Parties (Complainant vs Accused)</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        {matter.complainant_name && matter.accused_name 
                          ? `${matter.complainant_name} vs ${matter.accused_name}` 
                          : (matter.complainant_name || matter.accused_name || matter.client)}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Next Hearing Date</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        {matter.hearings && matter.hearings.length > 0 
                          ? matter.hearings[0].hearing_date 
                          : (matter.nextDate || "None")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Named Sections */}
                {matter.named_sections && matter.named_sections.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginTop: 8 }}>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
                      Sections Named in Document
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {matter.named_sections.map((sec, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: "var(--bg-app)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-md)",
                            padding: "10px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CheckCircle2 size={14} color="var(--alert-green)" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                              {sec.section}
                            </span>
                          </div>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic" }}>
                            "{sec.quote}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Sections */}
                {matter.suggested_sections && matter.suggested_sections.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginTop: 8 }}>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
                      AI Suggested Sections
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {matter.suggested_sections.map((sec, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: "var(--alert-yellow-bg)",
                            border: "1.5px dashed var(--gold)",
                            borderRadius: "var(--radius-md)",
                            padding: "12px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-main)" }}>
                              {sec.section}
                            </span>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
                              Label: {sec.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 11.5, color: "var(--text-main)", fontStyle: "italic", margin: 0 }}>
                            Basis Fact: "{sec.basis_fact}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {matter.hearings && matter.hearings.length > 0 ? (
                    matter.hearings.map((h, i) => {
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
                          <Clock size={16} color="var(--gold)" />
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-main)" }}>
                              {h.hearing_type || "Hearing"}
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                              🏛️ {h.court || h.location || "Court Room"}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 600 }}>{h.hearing_date}</div>
                            <span style={{
                              fontSize: 9,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "10px",
                              background: "var(--alert-green-bg)",
                              color: "var(--alert-green)"
                            }}>
                              HEARING
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : matter.deadlines && matter.deadlines.length > 0 ? (
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
                }} onClick={() => onOpenDocumentAnalysis(matter.id)}>
                  <UploadCloud size={28} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                  <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>Drag and drop court brief filings or scans</h4>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Supports PDF, DOCX, scan images up to 10MB.</p>
                </div>

                {/* Document Registry List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {matter.documents && matter.documents.length > 0 ? (
                    matter.documents.map((doc, idx) => {
                      const isSavedDoc = !!doc.file_url;
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{
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
                                {isSavedDoc ? (
                                  <a 
                                    href={doc.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ 
                                      fontSize: 12.5, 
                                      fontWeight: 600, 
                                      color: "var(--primary)",
                                      textDecoration: "underline",
                                      cursor: "pointer"
                                    }}
                                  >
                                    {doc.file_name}
                                  </a>
                                ) : (
                                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-main)" }}>
                                    {doc.name}
                                  </div>
                                )}
                                <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>
                                  {isSavedDoc 
                                    ? `${doc.doc_type || "Document"} · Added ${new Date(doc.uploaded_at || doc.created_at).toLocaleDateString("en-GB")}`
                                    : `${doc.size} · Added ${doc.date}`}
                                </span>
                              </div>
                            </div>

                            <button 
                              className="btn-secondary" 
                              style={{ padding: "4px 8px", fontSize: 10 }}
                              onClick={() => setExplainingDocIdx(explainingDocIdx === idx ? null : idx)}
                            >
                              {explainingDocIdx === idx ? "Hide Brief" : "Explain briefly"}
                            </button>
                          </div>

                          {explainingDocIdx === idx && (
                            <div style={{
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              padding: "14px",
                              boxShadow: "var(--shadow-sm)",
                              fontSize: "12.5px",
                              lineHeight: "1.5",
                              color: "var(--text-main)",
                              borderLeft: "3.5px solid var(--gold)"
                            }}>
                              <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", marginBottom: 6 }}>
                                Document Summary Brief
                              </span>
                              {matter.brief ? (
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                  {matter.brief}
                                </div>
                              ) : (
                                <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                                  No summary brief available for this document yet. Please run Document Analysis to extract the case details.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)" }}>
                      No files loaded. Propose scans or docket updates.
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
                        onClick={() => {
                          if (t.id === "summarize_extract") {
                            onOpenDocumentAnalysis(matter.id);
                          } else if (t.id === "draft_document") {
                            onOpenDocumentDrafter(matter.id);
                          } else {
                            setActiveTool(t);
                          }
                        }}
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
          onAddClientUpdate={(englishText, translatedText, language) => {
            const newUpdate = {
              id: "up_" + Date.now(),
              timestamp: Date.now(),
              date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
              language,
              englishText,
              translatedText,
              status: "sent"
            };
            const newNote = {
              date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
              author: "Adv. Zainab Ali (Client Updates Log)",
              content: `WhatsApp Client Update sent in ${language}.\nEnglish: "${englishText}"\nTranslated: "${translatedText}"`
            };
            const updatedCases = cases.map((c) => {
              if (c.id === matter.id) {
                return {
                  ...c,
                  clientUpdates: [newUpdate, ...(c.clientUpdates || [])],
                  notes: [newNote, ...(c.notes || [])]
                };
              }
              return c;
            });
            setCases(updatedCases);
          }}
          onTriggerClientTranslation={(text) => {
            const clientTool = TOOLS.find(t => t.id === "client");
            if (clientTool) {
              setActiveTool({
                ...clientTool,
                prefilledText: text
              });
            }
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
function ToolPanel({ tool, matter, onClose, onAddDeadline, onAddNote, onSaveExtractedDetails, onAddClientUpdate, onTriggerClientTranslation }) {
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

  // AI Drafter States
  const [draftText, setDraftText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [draftError, setDraftError] = useState(null);

  // Search Past Cases States
  const [searchCaseQuery, setSearchCaseQuery] = useState("");

  // Smart Hearing Entry States
  const [smartText, setSmartText] = useState("");
  const [smartExtracted, setSmartExtracted] = useState(null);
  const [smartDraftedMessage, setSmartDraftedMessage] = useState("");

  const Icon = tool.icon;

  // Voice Dictation and Real Audio States/Refs
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Helper function for translating updates via backend API
  const performTranslation = async (text, targetLang) => {
    try {
      const res = await fetch("http://localhost:8000/api/sarvam/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          target_language: targetLang
        })
      });
      const json = await res.json();
      if (json.success) {
        setTranslatedText(json.translated_text);
      } else {
        throw new Error(json.error || "Translation failed");
      }
    } catch (err) {
      console.error("Translation error:", err);
      // Fallback
      setTranslatedText(getFallbackTranslation(text, targetLang));
    }
  };

  // Cleanup timers, audio and recorders on unmount or tool change
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Sync pre-filled text on tool change
  useEffect(() => {
    setToolState("idle");
    setTranslatedText("");
    setIsRecording(false);
    setTranscribedText("");
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (tool.id === "draft_builder") {
      setDraftText("");
      setIsCopied(false);
      setDraftError(null);
    }
    if (tool.id === "client") {
      const initialText = tool.prefilledText || `Your bail hearing has been successfully listed in front of Judge Rao at the Hyderabad Sessions Court for 18 July 2025. Please arrive by 10 AM with your physical Aadhaar card and salary slip.`;
      setClientUpdateEnglish(initialText);
      
      // Auto-trigger translation if it is a prefilled message handoff
      if (tool.prefilledText) {
        setToolState("loading");
        performTranslation(initialText, clientLanguage).then(() => {
          setToolState("complete");
        });
      }
    }
    if (tool.id === "deadlines") {
      setSmartText("");
      setSmartExtracted(null);
      setSmartDraftedMessage("");
    }
  }, [tool]);

  // Run AI Simulation
  const handleLaunchTool = async () => {
    setToolState("loading");
    setDraftError(null);
    
    if (tool.id === "draft_builder") {
      try {
        const res = await fetch(`http://localhost:8000/api/cases/${matter.id}/draft-bail`, {
          method: "POST"
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || "Failed to generate draft");
        }
        setDraftText(json.data.draft_text);
        setToolState("complete");
      } catch (err) {
        console.error(err);
        setDraftError(err.message || "Failed to generate draft. Please ensure the case has details extracted from document analysis.");
        setToolState("idle");
      }
      return;
    }
    
    if (tool.id === "deadlines") {
      try {
        const jsonStr = await callGroq(smartText);
        const extracted = JSON.parse(jsonStr);
        setSmartExtracted(extracted);
        
        // Step 2: Create calendar event (deterministic)
        const eventLabel = `${extracted.eventType || "Hearing"} (Smart Entry)`;
        const eventDate = extracted.date;
        const eventNote = `${extracted.time || "No time"} @ ${extracted.location || "No location"}`;
        
        onAddDeadline(eventLabel, eventDate, "prep", eventNote);
        
        // Step 3: Draft client notification text
        const actionText = extracted.clientAction ? ` Please ${extracted.clientAction.toLowerCase().replace(/^please\s+/i, "")}.` : "";
        const timeText = extracted.time ? ` at ${extracted.time}` : "";
        const locText = extracted.location ? ` at ${extracted.location}` : "";
        const draftedMsg = `Your next hearing is on ${extracted.date}${timeText}${locText}.${actionText}`;
        setSmartDraftedMessage(draftedMsg);
        setToolState("complete");
      } catch (err) {
        console.error("Smart hearing extraction failed:", err);
        setToolState("idle");
      }
      return;
    }
    
    if (tool.id === "client") {
      await performTranslation(clientUpdateEnglish, clientLanguage);
      setToolState("complete");
      return;
    }
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  };

  // Real Speech-to-Text (STT) Recorder using MediaRecorder API
  const startRealRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setToolState("loading");
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.wav");
          const response = await fetch("http://localhost:8000/api/sarvam/stt", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (result.success) {
            setTranscribedText(result.transcript);
            setToolState("complete");
          } else {
            console.error("STT error:", result.error);
            setTranscribedText("Error transcribing audio: " + result.error);
            setToolState("complete");
          }
        } catch (err) {
          console.error("STT error:", err);
          setTranscribedText("Error connecting to STT service: " + err.message);
          setToolState("complete");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscribedText("");
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone access is required for voice dictation. Please ensure permission is granted.");
    }
  };

  const stopRealRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
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
                {tool.id === "summarize_extract" && "Summarizes files to create a short summary and automatically extracts case parameters (numbers, parties, dates)."}
                {tool.id === "deadlines" && "Type or paste case updates to extract details, schedule events, and alert clients automatically."}
                {tool.id === "client" && "Translates your case updates to the client's language and makes an audio version."}
                {tool.id === "dictate" && "Records what you say and types it out. You can speak in a mix of Hindi and English."}
                {tool.id === "search_cases" && "Searches legal databases to find similar cases and see how they ended."}
              </p>
            </div>

            {/* Inputs based on Tool ID */}
            {tool.id === "deadlines" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                    Describe the hearing or paste the order
                  </label>
                  <textarea 
                    className="input-field" 
                    rows={5} 
                    placeholder="e.g. Next hearing is listed on 28 July 2025 at 11:30 AM in the City Civil Court. Complainant must bring original property title deeds."
                    value={smartText}
                    onChange={(e) => setSmartText(e.target.value)}
                    style={{ fontSize: 12.5 }}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleLaunchTool}
                  disabled={!smartText.trim()}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Generate Details
                </button>
              </div>
            )}
            {tool.id === "summarize_extract" && (
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
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", padding: "20px 0" }}>
                <div 
                  onClick={isRecording ? stopRealRecording : startRealRecording}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: isRecording ? "var(--alert-red-bg)" : "rgba(27, 61, 51, 0.1)",
                    border: isRecording ? "2px solid var(--alert-red)" : "2px solid var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: isRecording ? "0 0 15px rgba(168, 61, 34, 0.3)" : "none",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  {isRecording ? <Square size={24} color="var(--alert-red)" /> : <Mic size={28} color="var(--primary)" />}
                </div>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-main)" }}>
                    {isRecording ? "Recording... Click to Stop" : "Click to Start Voice Dictation"}
                  </span>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, maxWidth: 280, margin: "6px auto 0" }}>
                    Speak naturally in Hindi, Telugu, Tamil, Urdu, or English. Sarvam AI will transcribe it.
                  </p>
                </div>

                {isRecording && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, height: 16, marginTop: 8 }}>
                    <div className="soundwave-bar" style={{ height: 12, animationDuration: "0.8s" }} />
                    <div className="soundwave-bar" style={{ height: 6, animationDuration: "1.1s" }} />
                    <div className="soundwave-bar" style={{ height: 14, animationDuration: "0.7s" }} />
                    <div className="soundwave-bar" style={{ height: 8, animationDuration: "0.9s" }} />
                    <div className="soundwave-bar" style={{ height: 12, animationDuration: "1.2s" }} />
                  </div>
                )}
              </div>
            )}

            {tool.id === "draft_builder" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Draft Parameters</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Accused / Client: </span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{matter.accused_name || matter.client_name || matter.client || "Not set yet"}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>IPC / BNS Sections: </span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{matter.ipc_sections && matter.ipc_sections.length > 0 ? matter.ipc_sections.join(", ") : "None extracted yet"}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Jurisdiction Court: </span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{matter.court && matter.court !== "Not set yet — run document analysis" ? matter.court : (matter.hearings && matter.hearings.length > 0 ? matter.hearings[0].court : "None extracted yet")}</span>
                    </div>
                  </div>
                </div>

                {(!matter.ipc_sections || matter.ipc_sections.length === 0) && (
                  <div style={{ display: "flex", gap: 8, background: "var(--alert-yellow-bg)", border: "1px dashed var(--gold)", padding: "10px 12px", borderRadius: "6px", fontSize: 11.5, color: "var(--gold)" }}>
                    <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>Some parameters are missing. Running "Summarize & Extract Details" first is recommended for highly accurate drafts.</span>
                  </div>
                )}

                {draftError && (
                  <div style={{ background: "var(--alert-red-bg)", border: "1px solid var(--alert-red)", padding: "10px 12px", borderRadius: "6px", fontSize: 12, color: "var(--alert-red)" }}>
                    {draftError}
                  </div>
                )}

                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleLaunchTool}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Generate Bail Application Draft
                </button>
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
            
            {tool.id === "deadlines" && smartExtracted && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                }}>
                  <CheckCircle2 size={16} /> Calendar event successfully added to this case's schedule.
                </div>

                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <h4 className="serif" style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>Extracted Hearing Details</h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid rgba(0,0,0,0.03)", paddingBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Event Type</span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{smartExtracted.eventType || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid rgba(0,0,0,0.03)", paddingBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Date Listed</span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{smartExtracted.date || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid rgba(0,0,0,0.03)", paddingBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Time</span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{smartExtracted.time || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid rgba(0,0,0,0.03)", paddingBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Court Location</span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{smartExtracted.location || "—"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", fontSize: 12, paddingTop: 4 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500, marginBottom: 2 }}>Client Action Required</span>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                        {smartExtracted.clientAction || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <h4 className="serif" style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 6, color: "var(--text-main)" }}>Drafted Client Notification</h4>
                  <p style={{ fontSize: 12.5, color: "var(--text-main)", fontStyle: "italic", lineHeight: 1.45, margin: 0, borderLeft: "3px solid var(--gold)", paddingLeft: 10 }}>
                    "{smartDraftedMessage}"
                  </p>
                </div>

                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => onTriggerClientTranslation(smartDraftedMessage)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Globe size={14} style={{ marginRight: 6 }} /> Open Client Translator
                </button>
              </div>
            )}

            {tool.id === "draft_builder" && draftText && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                }}>
                  <CheckCircle2 size={16} /> Legal Draft Generated Successfully
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>BAIL APPLICATION DRAFT</span>
                    <span style={{ fontSize: 10, color: "var(--primary)" }}>
                      Editable
                    </span>
                  </label>
                  
                  <textarea
                    className="input-field"
                    rows={12}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      background: "var(--bg-app)",
                      color: "var(--text-main)",
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: "10px", justifyContent: "center" }}
                    onClick={() => {
                      navigator.clipboard.writeText(draftText);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                  >
                    {isCopied ? <Check size={14} color="var(--alert-green)" /> : <FileText size={14} />}
                    <span style={{ marginLeft: 6 }}>{isCopied ? "Copied!" : "Copy Text"}</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ flex: 1, padding: "10px", justifyContent: "center" }}
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([draftText], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `bail_application_draft_${matter.id}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                  >
                    <span>Download (.txt)</span>
                  </button>
                </div>
              </div>
            )}

            {tool.id === "summarize_extract" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                }}>
                  <CheckCircle2 size={16} /> Summary & Parameters Extracted
                </div>

                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <h4 className="serif" style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>Executive Summary</h4>
                  <p style={{ fontSize: 12.5, color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                    This case involves charges registered under IPC sections regarding allegations of physical altercation.
                    The primary complainant asserts that the incident occurred in public jurisdiction on 10th May. 
                    Procedural clocks are active for 90 days for chargesheet registration.
                  </p>
                </div>

                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <h4 className="serif" style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>Extracted Parameters</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                  </div>
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={() => {
                  onSaveExtractedDetails({ caseNo: extCaseNo, court: extCourt, client: extClient });
                  onAddNote("AI Summarization & Parameter Extraction Log: Parsed docket filings. Synchronized metadata variables. Logged brief summaries to case file.");
                  onClose();
                }}>
                  Save & Update Docket
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
                      onClick={async () => {
                        if (isPlayingAudio) {
                          if (audioRef.current) {
                            audioRef.current.pause();
                          }
                          setIsPlayingAudio(false);
                        } else {
                          setIsPlayingAudio(true);
                          try {
                            const res = await fetch("http://localhost:8000/api/sarvam/tts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                text: translatedText,
                                language: clientLanguage
                              })
                            });
                            if (!res.ok) throw new Error("TTS generation failed");
                            const blob = await res.blob();
                            const audioUrl = URL.createObjectURL(blob);
                            
                            if (audioRef.current) {
                              audioRef.current.pause();
                            }
                            
                            const audio = new Audio(audioUrl);
                            audioRef.current = audio;
                            audio.onended = () => {
                              setIsPlayingAudio(false);
                            };
                            audio.play();
                          } catch (err) {
                            console.error("Failed to play audio:", err);
                            setIsPlayingAudio(false);
                          }
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
                    onAddClientUpdate(clientUpdateEnglish, translatedText, clientLanguage);
                    onClose();
                  }}>
                    Send & Log Update
                  </button>
                </div>
              </div>
            )}

            {tool.id === "dictate" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "var(--alert-green-bg)", color: "var(--alert-green)", border: "1px solid rgba(41,96,67,0.15)",
                  padding: "10px 14px", borderRadius: "8px", fontSize: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 600
                }}>
                  <CheckCircle2 size={16} /> Transcription Complete
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>REVIEW / EDIT NOTE</label>
                  <textarea
                    className="input-field"
                    rows={8}
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    style={{ fontSize: 13, lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => setToolState("idle")}>
                    Record Again
                  </button>
                  <button type="button" className="btn-primary" style={{ flex: 2, padding: "8px" }} onClick={() => {
                    onAddNote(transcribedText);
                    onClose();
                  }}>
                    Save Note to Case
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

// --- Client Updates tab ---
function ClientUpdatesView({ cases }) {
  const [selectedCaseFilter, setSelectedCaseFilter] = useState("all");
  const [selectedLangFilter, setSelectedLangFilter] = useState("all");

  // Collect all updates from cases
  const allUpdates = [];
  cases.forEach((c) => {
    if (c.clientUpdates) {
      c.clientUpdates.forEach((up) => {
        allUpdates.push({
          ...up,
          caseId: c.id,
          caseTitle: c.title,
          clientName: c.client
        });
      });
    }
  });

  // Sort by timestamp (newest first)
  allUpdates.sort((a, b) => {
    const tA = a.timestamp || 0;
    const tB = b.timestamp || 0;
    return tB - tA;
  });

  // Apply filters
  const filteredUpdates = allUpdates.filter((up) => {
    const matchesCase = selectedCaseFilter === "all" || up.caseId === selectedCaseFilter;
    const matchesLang = selectedLangFilter === "all" || up.language.toLowerCase() === selectedLangFilter.toLowerCase();
    return matchesCase && matchesLang;
  });

  const languagesList = ["Hindi", "Telugu", "Urdu", "Tamil", "English"];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
      <h2 className="serif" style={{ fontSize: 26, color: "var(--text-main)", marginBottom: 6 }}>
        Client Updates Log
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Read-only log of all multilingual translated updates sent to clients across registered cases.
      </p>

      {/* Filter Toolbar */}
      <div style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        marginBottom: 24
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Filter by Case File</label>
          <select 
            className="input-field" 
            value={selectedCaseFilter} 
            onChange={(e) => setSelectedCaseFilter(e.target.value)}
            style={{ fontSize: 12.5, padding: "8px 12px" }}
          >
            <option value="all">All Cases ({cases.length})</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Filter by Language</label>
          <select 
            className="input-field" 
            value={selectedLangFilter} 
            onChange={(e) => setSelectedLangFilter(e.target.value)}
            style={{ fontSize: 12.5, padding: "8px 12px" }}
          >
            <option value="all">All Languages</option>
            {languagesList.map((l) => (
              <option key={l} value={l.toLowerCase()}>{l}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", minWidth: "120px", textAlign: "right" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>MATCHING RECORDS</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>{filteredUpdates.length}</span>
        </div>
      </div>

      {/* Updates log list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map((up, idx) => (
            <div 
              key={up.id || idx} 
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 14
              }}
            >
              {/* Header: Case, Client & Date info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--gold)" }}>
                    {up.caseTitle}
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", marginTop: 2 }}>
                    Client: {up.clientName}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    background: "rgba(198, 155, 63, 0.15)",
                    color: "var(--gold)"
                  }}>
                    🌎 {up.language}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>
                    Sent: {up.date}
                  </span>
                </div>
              </div>

              {/* Body: English & Translation */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Original English */}
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>Original (English)</span>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45, margin: 0 }}>
                    {up.englishText}
                  </p>
                </div>

                {/* Translation */}
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--primary)", marginBottom: 6, textTransform: "uppercase" }}>Translated WhatsApp Alert</span>
                  <p style={{ fontSize: 13.5, color: "var(--text-main)", fontWeight: 500, lineHeight: 1.45, margin: 0, fontStyle: "italic" }}>
                    "{up.translatedText}"
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            padding: "80px 24px",
            textAlign: "center",
            background: "var(--bg-card)",
            border: "1px dashed var(--border-color)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-muted)"
          }}>
            <MessageSquare size={44} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
            <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", marginBottom: 6 }}>No client updates sent yet</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 360, margin: "0 auto" }}>
              No client updates sent yet. Open a case and use 'Update client' to send one.
            </p>
          </div>
        )}
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
      </div>
    </div>
  );
}

// --- Document Analysis API Integration ---
async function analyzeDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/api/analyze", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || "Analysis failed");
  }

  // The real result is nested under data.data because the backend wraps everything in ApiResponse
  return json.data;   // this has { raw_text, facts, named_sections, suggested_sections }
}

// --- Full-page Document Analysis View ---
function DocumentAnalysisView({ matter, onBack, onSaveAnalysis }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeHighlightRange, setActiveHighlightRange] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const highlightRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to highlight element
  useEffect(() => {
    if (activeHighlightRange && activeHighlightRange[0] !== -1 && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeHighlightRange]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    setActiveHighlightRange(null);
    setFileName(file.name);
    setUploadedFile(file);
    try {
      const result = await analyzeDocument(file);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
      e.target.value = "";
    }
  };

  const handleSaveToCase = async () => {
    if (!uploadedFile || !data) return;
    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      
      const payload = {
        facts: data.facts || {},
        named_sections: data.named_sections || [],
        suggested_sections: data.suggested_sections || [],
        raw_text: data.raw_text || "",
        client_name: matter.client || "",
        client_phone: matter.clientPhone || "",
        client_address: matter.clientAddress || ""
      };
      formData.append("analysis_result", JSON.stringify(payload));

      const res = await fetch(`http://localhost:8000/api/cases/${matter.id}/save-analysis`, {
        method: "POST",
        body: formData
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to save analysis to case.");
      }

      alert("Saved to case successfully!");
      if (onSaveAnalysis) {
        onSaveAnalysis(json.data);
      }
      onBack();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save analysis");
    } finally {
      setIsSaving(false);
    }
  };

  // Text rendering with highlight
  const renderDocumentText = () => {
    if (!data || !data.raw_text) return null;
    if (!activeHighlightRange || activeHighlightRange[0] === -1 || activeHighlightRange[1] === -1) {
      return <div>{data.raw_text}</div>;
    }
    const [start, end] = activeHighlightRange;
    const preText = data.raw_text.substring(0, start);
    const highlighted = data.raw_text.substring(start, end);
    const postText = data.raw_text.substring(end);

    return (
      <div>
        {preText}
        <mark 
          ref={highlightRef} 
          style={{ 
            background: "rgba(198, 155, 63, 0.35)", 
            color: "inherit", 
            padding: "2px 4px", 
            borderRadius: "3px", 
            borderBottom: "2px solid var(--gold)",
            fontWeight: "500",
            transition: "all var(--transition-normal)"
          }}
        >
          {highlighted}
        </mark>
        {postText}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)", overflow: "hidden" }}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: "none" }} 
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
      />

      {/* Header */}
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
        {/* Back Link */}
        <button 
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--primary)",
            background: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            borderRadius: "20px",
            cursor: "pointer",
            padding: "8px 16px",
            transition: "all var(--transition-fast)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-light)";
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.transform = "translateX(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <ArrowLeft size={15} /> 
          <span>Back to Case: {matter.title}</span>
        </button>

        {/* Document Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)" }} className="serif">
            {fileName || "Document Analysis"}
          </span>
          {fileName && (
            <span style={{ fontSize: 10, background: "var(--gold-bg)", color: "var(--gold)", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
              Verifiable Brief
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          {data && (
            <button 
              onClick={handleSaveToCase} 
              className="btn-primary"
              style={{ 
                padding: "8px 16px",
                background: "var(--alert-green)",
                color: "#ffffff"
              }}
              disabled={isSaving}
            >
              <span>{isSaving ? "Saving..." : "Save to Case"}</span>
            </button>
          )}

          <button 
            onClick={handleUploadClick} 
            className="btn-secondary"
            style={{ padding: "8px 16px" }}
            disabled={isAnalyzing || isSaving}
          >
            <UploadCloud size={16} />
            <span>Upload / Re-analyse</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      {isAnalyzing ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            border: "3px solid var(--border-color)",
            borderTopColor: "var(--primary)",
            animation: "spin 1s infinite linear"
          }} />
          <div style={{ textAlign: "center" }}>
            <h4 className="serif" style={{ fontSize: 16, color: "var(--text-main)" }}>Reading document...</h4>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Digitising transcription, verifying statutory coordinates
            </p>
          </div>
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
          <AlertTriangle size={48} color="var(--alert-red)" />
          <div style={{ textAlign: "center" }}>
            <h4 className="serif" style={{ fontSize: 18, color: "var(--text-main)" }}>Analysis Failed</h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, maxWidth: 400, margin: "4px auto 16px" }}>
              {error}
            </p>
            <button className="btn-primary" onClick={handleUploadClick}>
              <UploadCloud size={16} style={{ marginRight: 6 }} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      ) : !data ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            maxWidth: "520px",
            textAlign: "center",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(198, 155, 63, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold)"
            }}>
              <UploadCloud size={32} />
            </div>
            <div>
              <h3 className="serif" style={{ fontSize: 22, color: "var(--text-main)", marginBottom: 8 }}>
                Upload Case Document
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                Submit a litigation brief, FIR scan, or court order in PDF or image format. 
                CourtSaarthi will digitise the document, extract key facts, and map statutory references with verifiable citation highlights.
              </p>
            </div>
            
            <button className="btn-primary" onClick={handleUploadClick} style={{ padding: "12px 24px", fontSize: 14 }}>
              <UploadCloud size={18} style={{ marginRight: 6 }} />
              <span>Select Document</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
          {/* Left Panel: Document View */}
          <div style={{
            width: "50%",
            overflowY: "auto",
            padding: "24px 32px",
            background: "var(--bg-app)",
            height: "100%"
          }}>
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              boxShadow: "var(--shadow-sm)",
              minHeight: "100%"
            }}>
              <h3 className="serif" style={{ fontSize: 16, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
                Document Transcription
              </h3>
              <div style={{
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: "1.65",
                color: "var(--text-main)",
                textAlign: "left"
              }}>
                {renderDocumentText()}
              </div>
            </div>
          </div>

          {/* Right Panel: Analyzed Citations */}
          <div style={{
            width: "50%",
            overflowY: "auto",
            padding: "24px 32px",
            borderLeft: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 28
          }}>
            {/* Section 1: Key Facts */}
            <div>
              <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Key Facts</span>
                <span style={{ fontSize: 11, background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "10px", color: "var(--text-muted)" }}>
                  Verified Parameters
                </span>
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
                Verifiable case metadata points cited in the primary docket report.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {data && data.facts && Object.entries(data.facts).map(([key, fact]) => {
                  const isVerified = fact.verified && fact.span && fact.span[0] !== -1;
                  
                  const getLabel = (k) => {
                    if (fact.label) return fact.label;
                    const mapping = {
                      case_number: "Case File Number",
                      court: "Jurisdiction Court",
                      parties: "Parties Involved",
                      hearing_date: "Next Hearing Date",
                      complainant: "Complainant",
                      accused: "Accused Party"
                    };
                    return mapping[k] || k.replace(/_/g, " ").toUpperCase();
                  };

                  return (
                    <div 
                      key={key} 
                      style={{
                        background: isVerified ? "var(--bg-app)" : "rgba(128, 128, 128, 0.05)",
                        border: "1px solid",
                        borderColor: isVerified ? "var(--border-color)" : "rgba(128, 128, 128, 0.2)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        opacity: isVerified ? 1 : 0.6,
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <div>
                        <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                          {getLabel(key)}
                        </span>
                        <span style={{ 
                          display: "block", 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: isVerified ? "var(--text-main)" : "var(--text-muted)", 
                          marginTop: 4,
                          textDecoration: "none"
                        }}>
                          {Array.isArray(fact.value) ? fact.value.join(" vs ") : fact.value}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                        {isVerified ? (
                          <button 
                            onClick={() => setActiveHighlightRange(fact.span)}
                            className="btn-secondary"
                            style={{ padding: "4px 8px", fontSize: 10.5, display: "flex", alignItems: "center", gap: 4, borderRadius: "6px" }}
                          >
                            <Search size={11} />
                            <span>Cite Source</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={12} color="var(--text-muted)" />
                            <span>couldn't confirm in document</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Sections Named in Document */}
            <div>
              <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Sections Named in Document</span>
                <span style={{ fontSize: 11, background: "var(--alert-green-bg)", padding: "2px 8px", borderRadius: "10px", color: "var(--alert-green)", fontWeight: 600 }}>
                  Confirmed Provisions
                </span>
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
                Statutes explicitly referenced by section code in the docket text.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data && data.named_sections && data.named_sections.map((sec, idx) => {
                  const isVerified = sec.verified && sec.span && sec.span[0] !== -1;
                  return (
                    <div 
                      key={idx}
                      style={{
                        background: isVerified ? "var(--bg-app)" : "rgba(128, 128, 128, 0.05)",
                        border: "1px solid",
                        borderColor: isVerified ? "var(--border-color)" : "rgba(128, 128, 128, 0.2)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: isVerified ? 1 : 0.6,
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {isVerified ? (
                          <CheckCircle2 size={16} color="var(--alert-green)" />
                        ) : (
                          <AlertTriangle size={15} color="var(--text-muted)" />
                        )}
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isVerified ? "var(--text-main)" : "var(--text-muted)" }}>
                            {sec.section}
                          </span>
                          <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, fontStyle: "italic" }}>
                            "{sec.quote}"
                          </span>
                        </div>
                      </div>

                      <div>
                        {isVerified ? (
                          <button 
                            onClick={() => setActiveHighlightRange(sec.span)}
                            className="btn-secondary"
                            style={{ padding: "4px 8px", fontSize: 10.5, display: "flex", alignItems: "center", gap: 4, borderRadius: "6px" }}
                          >
                            <Search size={11} />
                            <span>Cite Source</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                            <span>couldn't confirm in document</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: AI Suggested Sections */}
            <div>
              <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span>AI Suggested Sections</span>
                <span style={{ fontSize: 10.5, background: "var(--gold-bg)", padding: "2px 8px", borderRadius: "10px", color: "var(--gold)", fontWeight: 700 }}>
                  Inferred Statutes
                </span>
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
                Statutes inferred by AI model from factual context. Check against active statutes to confirm.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data && data.suggested_sections && data.suggested_sections.map((sec, idx) => {
                  return (
                    <div 
                      key={idx}
                      style={{
                        background: "var(--alert-yellow-bg)",
                        border: "1.5px dashed var(--gold)",
                        borderRadius: "var(--radius-lg)",
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-main)" }}>
                            {sec.section}
                          </span>
                          <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 2 }}>
                            Label: {sec.label}
                          </span>
                        </div>

                        <span style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          background: "rgba(198, 155, 63, 0.15)",
                          color: "var(--gold)",
                          letterSpacing: "0.02em"
                        }}>
                          {sec.disclaimer}
                        </span>
                      </div>

                      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
                        <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          Prompting Fact Basis
                        </span>
                        <p style={{ fontSize: 12, color: "var(--text-main)", fontStyle: "italic", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                          "{sec.basis_fact}"
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {sec.basis_span && sec.basis_span[0] !== -1 ? (
                          <button 
                            onClick={() => setActiveHighlightRange(sec.basis_span)}
                            className="btn-secondary"
                            style={{ padding: "4px 8px", fontSize: 10.5, display: "flex", alignItems: "center", gap: 4, borderRadius: "6px" }}
                          >
                            <Search size={11} />
                            <span>Cite Fact Basis</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={12} color="var(--text-muted)" />
                            <span>couldn't confirm basis in document</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// --- Document Drafter Page ---
function DocumentDrafterView({ matter, onBack }) {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [docType, setDocType] = useState("bail_application");
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Load jsPDF from CDN dynamically
  useEffect(() => {
    if (!window.jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const cleanDraftResponse = (data) => {
    if (!data) return null;
    let title = data.title || "Legal Draft";
    let body = data.body || "";

    // 1. Try parsing body if it's a JSON string
    if (typeof body === "string" && body.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(body.trim());
        if (parsed.body) {
          body = parsed.body;
        }
        if (parsed.title) {
          title = parsed.title;
        }
      } catch (e) {
        console.error("Error parsing nested JSON in draft body:", e);
      }
    }

    // 2. Perform aggressive cleaning of outer JSON artifacts in body
    if (typeof body === "string") {
      let cleaned = body.trim();
      
      // Strip markdown block wraps
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

      // If it starts with { and we couldn't parse it as pure JSON
      if (cleaned.startsWith("{")) {
        cleaned = cleaned.replace(/^\{\s*["']title["']\s*:\s*["'].*?["']\s*,\s*["']body["']\s*:\s*["']/, "");
        cleaned = cleaned.replace(/^\{\s*["']body["']\s*:\s*["']/, "");
        cleaned = cleaned.replace(/^\{\s*["']draft["']\s*:\s*\{\s*["']body["']\s*:\s*["']/, "");
        cleaned = cleaned.replace(/["']\s*\}\s*$/, "");
        cleaned = cleaned.replace(/\s*\}\s*$/, "");
      }

      // Clean prefix tags
      cleaned = cleaned.replace(/^["']?body["']?\s*:\s*["']?/, "");
      cleaned = cleaned.replace(/^["']?title["']?\s*:\s*["']?.*?["']?\s*,\s*["']?body["']?\s*:\s*["']?/, "");

      body = cleaned.trim();
    }

    return { ...data, title, body };
  };

  const handleDocCheckboxChange = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    );
  };

  const handleDraft = async () => {
    if (selectedDocs.length === 0) {
      setError("Please select at least one source document.");
      return;
    }

    setIsDrafting(true);
    setError(null);
    setDraftData(null);

    try {
      const res = await fetch("http://localhost:8000/api/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doc_type: docType,
          source_doc_ids: selectedDocs
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to generate draft.");
      }
      const cleanedData = cleanDraftResponse(json.data);
      setDraftData(cleanedData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to draft document.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!draftData) return;
    if (!window.jspdf) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const titleText = draftData.title || "Draft Document";
    const bodyText = draftData.body || "";

    // 1. Process citations and collect footnotes for the PDF
    const footnotes = [];
    const citeRegex = /\[SRC:\s*\\*["'](.*?)\\*["']\]/g;
    let match;
    while ((match = citeRegex.exec(bodyText)) !== null) {
      const quote = match[1].trim();
      if (quote && !footnotes.includes(quote)) {
        footnotes.push(quote);
      }
    }

    // Clean body text: remove inline [SRC: ...] and change [TO BE FILLED] to blank underscores
    const cleanBody = bodyText
      .replace(/\[SRC:\s*[^\]]*\]/g, "")
      .replace(/\[TO\s+BE\s+FILLED\]/g, "___________");

    // Margins and wrap width
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (margin * 2);

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    
    const splitTitle = doc.splitTextToSize(titleText.toUpperCase(), maxLineWidth);
    let y = margin + 10;
    
    splitTitle.forEach(line => {
      doc.text(line, margin, y);
      y += 8;
    });

    y += 10; // spacing after title

    // Document Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const paragraphs = cleanBody.split("\n");
    paragraphs.forEach(paragraph => {
      const splitLines = doc.splitTextToSize(paragraph, maxLineWidth);
      splitLines.forEach(line => {
        if (y > 275) {
          doc.addPage();
          y = margin + 10;
        }
        doc.text(line, margin, y);
        y += 6;
      });
      y += 4; // spacing between paragraphs
    });

    // 2. Append the footnotes section in the PDF
    if (footnotes.length > 0) {
      y += 10;
      if (y > 260) {
        doc.addPage();
        y = margin + 10;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("SOURCES / CITATIONS:", margin, y);
      y += 8;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      footnotes.forEach((quote, idx) => {
        const footnoteLine = `${idx + 1}. "${quote}"`;
        const splitLines = doc.splitTextToSize(footnoteLine, maxLineWidth);
        splitLines.forEach(line => {
          if (y > 275) {
            doc.addPage();
            y = margin + 10;
          }
          doc.text(line, margin, y);
          y += 5;
        });
        y += 2;
      });
    }

    doc.save(`${titleText.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
  };

  const renderDraftBody = (bodyText) => {
    if (!bodyText) return null;

    // Collect quotes from [SRC: "quote"] markers (ignore empty quotes)
    const citeRegex = /\[SRC:\s*\\*["'](.*?)\\*["']\]/g;
    const footnotes = [];
    let match;
    while ((match = citeRegex.exec(bodyText)) !== null) {
      const quote = match[1].trim();
      if (quote && !footnotes.includes(quote)) {
        footnotes.push(quote);
      }
    }

    // Clean body text for clean, continuous inline display
    const cleanText = bodyText
      .replace(/\[SRC:\s*[^\]]*\]/g, "")
      .replace(/\[TO\s+BE\s+FILLED\]/g, "__________");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: "1.75", color: "var(--text-main)" }}>
          {cleanText}
        </div>
        
        {footnotes.length > 0 && (
          <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--gold)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Sources / Citations
            </h4>
            <ol style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {footnotes.map((quote, idx) => (
                <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  "{quote}"
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const caseDocuments = matter.documents || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)", overflow: "hidden" }}>
      {/* Header */}
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
        {/* Back Link */}
        <button 
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--primary)",
            background: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            borderRadius: "20px",
            cursor: "pointer",
            padding: "8px 16px",
            transition: "all var(--transition-fast)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-light)";
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.transform = "translateX(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <ArrowLeft size={15} /> 
          <span>Back to Case</span>
        </button>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)" }} className="serif">
            AI Document Drafter
          </span>
          <span style={{ fontSize: 10, background: "var(--gold-bg)", color: "var(--gold)", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
            Verifiable Drafting
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          {draftData && (
            <button 
              onClick={handleDownloadPDF} 
              className="btn-primary"
              style={{ 
                padding: "8px 16px",
                background: "var(--gold)",
                color: "#12241f"
              }}
            >
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        {/* Left Sidebar: Controls & Documents */}
        <div style={{
          width: "320px",
          borderRight: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          boxShadow: "var(--shadow-sm)",
          height: "100%",
          flexShrink: 0
        }}>
          {/* Dropdown at the top */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
              Document Type
            </label>
            <select 
              className="input-field"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              style={{ fontSize: "13px", padding: "10px 12px" }}
            >
              {[
                { value: "bail_application", label: "Bail Application" },
                { value: "anticipatory_bail", label: "Anticipatory Bail Application" },
                { value: "legal_notice", label: "Legal Notice" },
                { value: "reply_legal_notice", label: "Reply to Legal Notice" },
                { value: "written_reply", label: "Written Statement / Reply" },
                { value: "plaint", label: "Plaint (Civil Suit)" },
                { value: "affidavit", label: "Affidavit" },
                { value: "adjournment_application", label: "Adjournment Application" },
                { value: "vakalatnama", label: "Vakalatnama" }
              ].map(dt => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
          </div>

          {/* Source documents list */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>
              Source Documents ({caseDocuments.length})
            </label>
            
            {caseDocuments.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "16px", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                No documents saved in locker. Upload documents first.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {caseDocuments.map((doc, idx) => {
                  const docId = doc.id || `mock_${matter.id}_${idx}`;
                  const isChecked = selectedDocs.includes(docId);
                  return (
                    <div 
                      key={docId}
                      onClick={() => handleDocCheckboxChange(docId)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "10px 12px",
                        border: "1px solid",
                        borderColor: isChecked ? "var(--primary)" : "var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        background: isChecked ? "var(--gold-bg)" : "var(--bg-app)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div onClick
                        style={{ marginTop: 2, cursor: "pointer" }}
                      />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {doc.file_name || doc.name}
                        </div>
                        <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
                          {doc.doc_type || "Document"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Draft button at the bottom */}
          <button 
            onClick={handleDraft}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={isDrafting || caseDocuments.length === 0}
          >
            <span>{isDrafting ? "Drafting..." : "Draft Document"}</span>
          </button>
        </div>

        {/* Right Main Panel: Generated Draft */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px",
          background: "var(--bg-app)",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}>
          {isDrafting ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{
                width: 50, height: 50, borderRadius: "50%",
                border: "3px solid var(--border-color)",
                borderTopColor: "var(--primary)",
                animation: "spin 1s infinite linear"
              }} />
              <div style={{ textAlign: "center" }}>
                <h4 className="serif" style={{ fontSize: 16, color: "var(--text-main)" }}>Generating Legal Draft...</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Consulting statutory formats, integrating case facts and citations
                </p>
              </div>
            </div>
          ) : error ? (
            <div style={{ background: "var(--alert-red-bg)", border: "1px solid var(--alert-red)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", gap: 12, color: "var(--alert-red)", marginBottom: 20 }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 4px 0" }}>Drafting Failed</h4>
                <p style={{ fontSize: 12.5, margin: 0 }}>{error}</p>
              </div>
            </div>
          ) : !draftData ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-lg)", padding: "40px", background: "var(--bg-card)", textAlign: "center" }}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <h3 className="serif" style={{ fontSize: 18, color: "var(--text-main)", marginBottom: 6 }}>Ready for Drafting</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 360, margin: 0 }}>
                Select source documents on the left, choose your document template, and click "Draft Document" to generate a court-ready draft.
              </p>
            </div>
          ) : (
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "40px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: 24,
              flexShrink: 0
            }}>
              {/* Draft Heading */}
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", borderBottom: "2px solid var(--primary)", paddingBottom: 14, margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {draftData.title || "Legal Draft"}
              </h2>

              {/* Draft Body Content */}
              <div style={{ flex: 1 }}>
                {renderDraftBody(draftData.body)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}