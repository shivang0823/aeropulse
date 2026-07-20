"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  FileText, 
  Scale, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { CityTelemetry } from "@/types/telemetry";

interface RagCommandTabProps {
  onAddManualAlert: (cityId: string, message: string, level: "info" | "warning" | "critical") => void;
  cities: CityTelemetry[];
}

interface BylawDoc {
  id: string;
  title: string;
  source: string;
  snippet: string;
  keywords: string[];
}

const bylawDatabase: BylawDoc[] = [
  {
    id: "bylaw-1",
    title: "UP Air Pollution (Control) Act 1981 - Section 21",
    source: "UP State Pollution Control Board",
    snippet: "Empowers the state board to declare air pollution control areas. In designated zones, municipal officers have the mandate to order immediate power caps (up to 40% emission limits) or temporary closures on brick kilns, furnaces, and metal tanneries if PM2.5 averages cross 250 µg/m³ for two consecutive hours.",
    keywords: ["industry", "industrial", "cap", "tanneries", "power", "kiln", "factory", "boiler"]
  },
  {
    id: "bylaw-2",
    title: "Lucknow Municipal Smart Infrastructure Code - Chapter IV (Dust)",
    source: "Lucknow Municipal Corporation",
    snippet: "Mandates that all construction sites, real estate developments, and road excavation zones exceeding 10,000 sq ft must maintain operational automated water atomization misting cannons during active hours. Failure to deploy dust containment barriers and misters results in immediate stoppage orders and fines up to ₹50,000 per violation day.",
    keywords: ["dust", "construction", "excavation", "misting", "mist", "cannon", "water", "building"]
  },
  {
    id: "bylaw-3",
    title: "EPCA Graded Response Action Plan (GRAP) Guidelines - Stage III",
    source: "Environment Pollution Authority (National Capital Region)",
    snippet: "Enforces a mandatory 'Green Corridor Bypass' traffic bypass. Non-essential heavy commercial diesel trucks and cargo freighters are restricted from entering core municipal sectors when localized sensor nodes report PM2.5 > 150 µg/m³, rerouting all commercial traffic to regional bypass expressways.",
    keywords: ["traffic", "congestion", "truck", "bypass", "diesel", "freight", "vehicle", "road"]
  },
  {
    id: "bylaw-4",
    title: "UP Environmental Protection Rules 2022 - Section 8 (Crop Smoke)",
    source: "UP Department of Environment",
    snippet: "Prohibits the open burning of agricultural crop residues, straw, and parali stalks within 20km of dense urban populations. Municipalities are authorized to coordinate with local panchayats to broadcast warning advisories, deploy patrol units, and impose penalties on landholders violating air quality mandates.",
    keywords: ["crop", "burning", "stubble", "parali", "agriculture", "farm", "smoke", "fire"]
  }
];

export default function RagCommandTab({ onAddManualAlert, cities }: RagCommandTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ doc: BylawDoc; score: number }>>([]);
  const [searched, setSearched] = useState(false);

  // Directive Generator State
  const [selectedCityId, setSelectedCityId] = useState("lucknow");
  const [violationType, setViolationType] = useState("Construction Dust");
  const [selectedBylawId, setSelectedBylawId] = useState("bylaw-2");
  
  const [generatedDirective, setGeneratedDirective] = useState<string>("");
  const [refNumber, setRefNumber] = useState<string>("");
  const [deployed, setDeployed] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedCityObj = cities.find((c) => c.id === selectedCityId) || { name: "Lucknow" };

  // Simulated Semantic RAG search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    const queryTerms = searchQuery.toLowerCase().split(/\s+/);
    const matches = bylawDatabase.map((doc) => {
      let score = 0;
      queryTerms.forEach((term) => {
        // Simple string matches
        if (doc.title.toLowerCase().includes(term)) score += 30;
        if (doc.snippet.toLowerCase().includes(term)) score += 15;
        // Keyword matches
        doc.keywords.forEach((kw) => {
          if (kw.includes(term) || term.includes(kw)) score += 20;
        });
      });

      // Normalize score between 45% and 98%
      const finalScore = score > 0 ? Math.min(98, Math.max(45, score)) : 0;
      return { doc, score: finalScore };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

    setSearchResults(matches);
    setSearched(true);

    // Auto-select best bylaw match for directive generator
    if (matches.length > 0) {
      setSelectedBylawId(matches[0].doc.id);
    }
  };

  // Generate Directive Text
  const handleGenerateDirective = async () => {
    setGenerating(true);
    try {
      let pollutant = "PM2.5";
      let aqiValue = (selectedCityObj as any).pm25 || 150;
      if (violationType === "Industrial Emissions") {
        pollutant = "SO2";
        aqiValue = (selectedCityObj as any).so2 || 25;
      } else if (violationType === "Traffic Congestion") {
        pollutant = "NO2";
        aqiValue = (selectedCityObj as any).no2 || 45;
      } else if (violationType === "Stubble Burning") {
        pollutant = "PM10";
        aqiValue = (selectedCityObj as any).pm10 || 250;
      }

      const res = await fetch("/api/rag-directive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCity: selectedCityObj,
          pollutantType: pollutant,
          acuteValue: aqiValue,
          violationType
        })
      });

      if (!res.ok) throw new Error("Failed to fetch directive");
      const data = await res.json();
      
      setRefNumber(data.refNumber);
      setGeneratedDirective(data.generatedDirective);
      setDeployed(false);

      // Dynamically select the RAG matched bylaw in the UI list if found
      if (data.matchedBylaw && data.matchedBylaw.title) {
        // Find if title contains string or add it to search results
        const matchedId = data.matchedBylaw.title.toLowerCase().includes("1981") 
          ? "bylaw-1" 
          : data.matchedBylaw.title.toLowerCase().includes("lucknow")
          ? "bylaw-2"
          : data.matchedBylaw.title.toLowerCase().includes("grap")
          ? "bylaw-3"
          : "bylaw-4";
        setSelectedBylawId(matchedId);
      }
    } catch (err) {
      console.warn("API error, falling back to static order template:", err);
      const cityInitials = selectedCityId.substring(0, 2).toUpperCase();
      const randomRef = Math.floor(1000 + Math.random() * 9000);
      const calculatedRef = `UP-SPCB-2026-${cityInitials}-${randomRef}`;
      const timestamp = new Date().toLocaleString();
      let violationDetail = "";
      if (violationType === "Construction Dust") {
        violationDetail = "uncontrolled construction dust emissions and failure to operate water atomization misting cannons.";
      } else if (violationType === "Industrial Emissions") {
        violationDetail = "industrial boiler particulate discharge exceeding CPCB-mandated standard thresholds.";
      } else if (violationType === "Traffic Congestion") {
        violationDetail = "excessive vehicular diesel soot concentration inside high-density residential wards.";
      } else {
        violationDetail = "agricultural crop residue (parali) open burning in adjacent rural buffer regions.";
      }

      const orderText = `DIRECTIVE ORDER: ADMINISTRATIVE COMPLIANCE MANDATE
REFERENCE NO: ${calculatedRef}
DATE OF ISSUANCE: ${timestamp}
ISSUING AUTHORITY: UP State Pollution Control Board
TARGET JURISDICTION: Municipal Area of ${selectedCityObj.name}, UP

WHEREAS local IoT telemetry sensors on the AeroPulse Actuation Network have flagged elevated particulate matter levels exceeding safety benchmarks;

AND WHEREAS it has been determined that the primary source of airshed distress is attributed to: ${violationDetail}

NOW, THEREFORE, IN EXERCISE of powers conferred under "UP Air Pollution Control Act 1981 Section 21", the issuing authority hereby directs the Municipal Commissioner and Ward Wardens of ${selectedCityObj.name} to enforce corrective measures immediately.

[SEAL OF COMMISSIONER]
Digitally Signed by: Shivang Srivastava
System Administrator`;

      setRefNumber(calculatedRef);
      setGeneratedDirective(orderText);
      setDeployed(false);
    } finally {
      setGenerating(false);
    }
  };

  // Deploy Directive back to global Telemetry Alerts
  const handleDeployDirective = () => {
    if (!generatedDirective) return;
    
    const message = `[DIRECTIVE DEPLOYED] Official warning issued for ${selectedCityObj.name} (Ref: ${refNumber}) regarding ${violationType}. Relays armed.`;
    onAddManualAlert(selectedCityId, message, "critical");
    setDeployed(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <section className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-blue-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              RAG AI Command Center
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-[650px]">
            Retrieve regulatory contexts from UP environmental bylaws and compile official administrative compliance directives. Deployed directives push directly into the live actuation network alerts.
          </p>
        </div>
      </section>

      {/* 2. Main Workspace Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Bylaw Query Database (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Query input card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Search className="h-4.5 w-4.5 text-blue-500" />
              Bylaw Context Matching
            </h3>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. construction dust, industrial load..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-muted border border-border px-3 py-2 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold font-mono select-none transition-colors"
              >
                Search
              </button>
            </form>

            <p className="text-[10px] text-muted-foreground leading-normal">
              Enter keywords to query environmental codes (UP Air Act 1981, Municipal Rules, GRAP bylaws) via simulated semantic RAG.
            </p>
          </div>

          {/* Search Results list */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Semantic Matches ({searchResults.length})
            </h4>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {searched ? (
                searchResults.length > 0 ? (
                  searchResults.map((match) => (
                    <div 
                      key={match.doc.id}
                      onClick={() => setSelectedBylawId(match.doc.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 text-[11px] ${
                        selectedBylawId === match.doc.id
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 font-bold text-foreground">
                        <span className="truncate max-w-[200px]">{match.doc.title}</span>
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded leading-none">
                          {match.score}% Match
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic">
                        &ldquo;{match.doc.snippet.substring(0, 120)}...&rdquo;
                      </p>
                      <span className="text-[9px] text-muted-foreground font-mono mt-1.5 block">
                        Source: {match.doc.source}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-xs font-mono">
                    <AlertCircle className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                    No match found. Try "dust", "industry", "crop", or "traffic".
                  </div>
                )
              ) : (
                // Show default database
                bylawDatabase.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedBylawId(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 text-[11px] ${
                      selectedBylawId === doc.id
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="font-bold text-foreground mb-1.5 truncate leading-none">
                      {doc.title}
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">
                      &ldquo;{doc.snippet.substring(0, 110)}...&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Directive Composer & Output Preview (7 Cols) */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/60 pb-4">
              <FileText className="h-4.5 w-4.5 text-blue-500" />
              Directive Compiler
            </h3>

            {/* Config rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-mono uppercase font-bold">Target Municipality</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full bg-muted border border-border px-3 py-2 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Violation Type */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-mono uppercase font-bold">Violation Category</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  className="w-full bg-muted border border-border px-3 py-2 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Construction Dust">Construction Dust Violations</option>
                  <option value="Industrial Emissions">Industrial Excess Emissions</option>
                  <option value="Traffic Congestion">Traffic Congestion Soot</option>
                  <option value="Stubble Burning">Crop Residue Burning</option>
                </select>
              </div>
            </div>

            {/* Generate Trigger */}
            <button
              onClick={handleGenerateDirective}
              disabled={generating}
              className={`w-full py-2.5 text-white rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-colors select-none ${
                generating ? "bg-zinc-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Scale className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Querying Regulatory RAG Matrix..." : "Compile & Preview Official Directive"}
            </button>

            {/* Directive Document Preview */}
            {generatedDirective && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                  <span>DOCUMENT PREVIEW PREPARATION:</span>
                  <span className="text-emerald-500 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500/10" />
                    Bylaw Context Embedded
                  </span>
                </div>

                {/* Simulated Goverment Document */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-[10px] text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed max-h-[300px] overflow-y-auto relative scrollbar-thin select-text">
                  {generatedDirective}
                </div>

                {/* Actions row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Deploy Directive */}
                  <button
                    onClick={handleDeployDirective}
                    disabled={deployed}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-2 select-none transition-all ${
                      deployed
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {deployed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Directive Deployed & Relays Armed
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Deploy Directive to Network
                      </>
                    )}
                  </button>

                  {/* Print / Export */}
                  <button
                    onClick={() => alert(`Exporting ${refNumber} to administrative PDF... Download started.`)}
                    className="py-2 px-4 bg-muted hover:bg-accent border border-border text-muted-foreground hover:text-foreground rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-2 select-none transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Print / Export Administrative PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
