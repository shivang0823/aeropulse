"use client";

import { useState } from "react";
import { 
  Award, 
  Leaf, 
  Users, 
  Scale, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  BookOpen, 
  Cpu, 
  Layers, 
  TrendingUp, 
  ChevronRight 
} from "lucide-react";

interface ESGGaugeProps {
  value: number;
  label: string;
  sublabel: string;
  gradientId: string;
  colors: [string, string];
  icon: React.ReactNode;
}

function ESGGauge({ value, label, sublabel, gradientId, colors, icon }: ESGGaugeProps) {
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center text-center relative overflow-hidden select-none group">
      {/* Background radial glow */}
      <div 
        className="absolute -top-12 -left-12 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
        style={{ backgroundColor: colors[0] }}
      />
      
      {/* Circle Ring */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-40"
          />
          {/* Progress circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Inside metrics */}
        <div className="absolute flex flex-col items-center justify-center">
          <div className="text-foreground/80 mb-0.5" style={{ color: colors[0] }}>
            {icon}
          </div>
          <span className="text-base font-extrabold text-foreground leading-none">{value}%</span>
        </div>
      </div>

      <h3 className="font-bold text-sm text-foreground leading-snug">{label}</h3>
      <p className="text-[10px] text-muted-foreground font-mono mt-1.5 leading-normal max-w-[200px]">
        {sublabel}
      </p>
    </div>
  );
}

interface Milestone {
  id: number;
  stage: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "planned";
  summary: string;
  deliverables: string[];
  skillsLearned: string[];
  techStack: string[];
}

const milestones: Milestone[] = [
  {
    id: 1,
    stage: "Stage 1",
    title: "Ideation & Social Impact Alignment",
    date: "July 2025 - Sept 2025",
    status: "completed",
    summary: "Aligned with the 1M1B framework to identify critical environmental distress in Uttar Pradesh. Researched the impact of particulate air pollution on public health and analyzed policy bylaws.",
    deliverables: [
      "Municipal air quality pain-point survey map",
      "Social Impact thesis on PM2.5 respiratory risks",
      "Draft proposal for automated micro-actuation systems"
    ],
    skillsLearned: ["Social Entrepreneurship", "Bylaw Policy Mapping", "Public Health Research"],
    techStack: ["Figma", "Research Papers", "Python Data-Analysis Libraries"]
  },
  {
    id: 2,
    stage: "Stage 2",
    title: "IoT Node Engineering & Calibration",
    date: "Oct 2025 - Jan 2026",
    status: "completed",
    summary: "Assembled low-cost optical particulate matter sensors (PM2.5/PM10) alongside DHT22 meteorological sensors. Formulated cellular streaming code and calibrated nodes against reference grade equipment.",
    deliverables: [
      "Assembled 10 robust ESP32-powered IoT sensor nodes",
      "Calibrated laser scattering offset data against standard BAM devices",
      "Firmware code for cellular data packet compression"
    ],
    skillsLearned: ["IoT Hardware Assembly", "Sensor Calibration & Signal Offsets", "Low-Power Firmware Programming"],
    techStack: ["ESP32 MCU", "SDS011 Laser Dust Sensor", "C++ / Arduino IDE", "MQTT Protocols"]
  },
  {
    id: 3,
    stage: "Stage 3",
    title: "AeroPulse Closed-Loop Dashboard",
    date: "Feb 2026 - March 2026",
    status: "in-progress",
    summary: "Building an enterprise-grade command dashboard to view live telemetry, trigger physical actuator overrides, and run predictive forecasting algorithms.",
    deliverables: [
      "React/Next.js App Router workspace scaffolding",
      "Recharts real-time dynamic graphing hooks",
      "Simulated actuation decay feedback systems"
    ],
    skillsLearned: ["State Lifting & Hydration Sync", "Premium Tailwind Web Design", "State-driven Simulation Loops"],
    techStack: ["Next.js 16", "React 19", "Tailwind CSS v4", "Recharts", "Lucide Icons"]
  },
  {
    id: 4,
    stage: "Stage 4",
    title: "Municipal Pilot Deployment",
    date: "April 2026 - Sept 2026",
    status: "planned",
    summary: "Deploying 10 calibrated IoT nodes around the heavy traffic routes and industrial zones of Kanpur and Lucknow. Integrating control relays directly with municipal smog towers.",
    deliverables: [
      "Field installation of 10 weather-proof sensor poles",
      "Relay command integrations for 3 municipal mist cannon arrays",
      "Citizen public broadcast SMS/Whatsapp API integrations"
    ],
    skillsLearned: ["Field Reliability Engineering", "Industrial Relay Control", "Public API Webhooks"],
    techStack: ["AWS IoT Core", "Node-RED", "Twilio API", "Raspberry Pi Gateways"]
  },
  {
    id: 5,
    stage: "Stage 5",
    title: "Scale-up & Administrative Handover",
    date: "Oct 2026 - Jan 2027",
    status: "planned",
    summary: "Handing over telemetry dashboards and automated directive generators to UP municipal administrations. Scaling the model to Ghaziabad and Noida.",
    deliverables: [
      "UP State Pollution Board administrative handbook",
      "Multi-city dashboard replication template",
      "Automated legal directive PDF generation tool"
    ],
    skillsLearned: ["Government Handover & Scaling", "Compliance Reporting Standards", "Multi-tenant Dashboard Design"],
    techStack: ["PDFKit Node.js", "Docker Containers", "GCP Kubernetes Engine"]
  }
];

type StoryTab = "challenge" | "solution" | "impact";

export default function PortfolioTab() {
  const [activeMilestoneId, setActiveMilestoneId] = useState<number>(3);
  const [activeStoryTab, setActiveStoryTab] = useState<StoryTab>("challenge");

  const selectedMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[2];

  return (
    <div className="space-y-8">
      {/* Title & Innovator Profile Banner */}
      <section className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              1M1B Innovation Journey & ESG Compliance
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-[650px]">
            AeroPulse UP is a youth-led social enterprise aligning with the 1 Million 1 Billion Foundation framework to solve localized air crises in Uttar Pradesh via IoT technology.
          </p>
        </div>
        
        {/* Innovator Badge */}
        <div className="flex items-center gap-3.5 bg-muted/60 border border-border p-3 rounded-lg w-fit md:ml-auto">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 font-extrabold text-sm">
            1M
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground font-mono leading-none">PROJECT PORTFOLIO</div>
            <div className="text-sm font-bold text-foreground mt-0.5 leading-snug">Shivang Srivastava</div>
            <div className="text-[9px] text-blue-500 font-mono tracking-wider uppercase font-semibold leading-none mt-0.5">
              1M1B Cohort 9U | UPN
            </div>
          </div>
        </div>
      </section>

      {/* 1. ESG Matrix Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          Municipal ESG Compliance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ESGGauge
            value={84}
            label="Environmental (E)"
            sublabel="Particulate washdown rate + local AQI reduction index. Mist cannons and bypass loops active."
            gradientId="envGradient"
            colors={["#06b6d4", "#3b82f6"]}
            icon={<Leaf className="h-5 w-5" />}
          />
          <ESGGauge
            value={92}
            label="Social (S)"
            sublabel="Citizen respiratory safety index. Warning advisory reach across active municipal wards."
            gradientId="socGradient"
            colors={["#f59e0b", "#ef4444"]}
            icon={<Users className="h-5 w-5" />}
          />
          <ESGGauge
            value={99}
            label="Governance (G)"
            sublabel="Legal bylaw alignment. G-Trans node data integrity & administrative response latency."
            gradientId="govGradient"
            colors={["#10b981", "#059669"]}
            icon={<Scale className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* 2. Interactive Milestone Timeline */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          1M1B Innovation Milestone Timeline
        </h3>

        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-6">
          {/* Horizontal timeline bar */}
          <div className="relative flex items-center justify-between w-full overflow-x-auto pb-4 select-none scrollbar-thin">
            {/* Background progress line */}
            <div className="absolute top-7 left-10 right-10 h-0.5 bg-border z-0 hidden md:block" />

            {milestones.map((milestone) => {
              const isActive = milestone.id === activeMilestoneId;
              const isCompleted = milestone.status === "completed";
              const isInProgress = milestone.status === "in-progress";

              return (
                <button
                  key={milestone.id}
                  onClick={() => setActiveMilestoneId(milestone.id)}
                  className="flex flex-col items-center text-center min-w-[130px] z-10 group relative"
                >
                  {/* Step bubble */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-mono text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20 scale-110" 
                      : isCompleted 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                        : isInProgress 
                          ? "bg-amber-500/10 border-amber-500 text-amber-500 animate-pulse" 
                          : "bg-muted border-border text-muted-foreground"
                  }`}>
                    {milestone.id}
                  </div>

                  {/* Stage text */}
                  <div className="mt-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono block">
                      {milestone.stage}
                    </span>
                    <span className={`text-xs font-semibold block mt-0.5 transition-colors ${
                      isActive ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {milestone.title.split(" ")[0]}...
                    </span>
                  </div>

                  {/* Status Indicator Bar (Under Step) */}
                  <span className={`text-[8px] font-mono uppercase px-1 rounded mt-1.5 leading-none ${
                    isCompleted 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : isInProgress 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {milestone.status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed milestone display card */}
          <div className="bg-muted/50 border border-border/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-6 relative transition-all duration-300">
            {/* Left side details */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full font-bold uppercase w-fit">
                  {selectedMilestone.stage} &bull; {selectedMilestone.status}
                </span>
                <h4 className="text-lg font-bold text-foreground mt-2">
                  {selectedMilestone.title}
                </h4>
                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedMilestone.date}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-foreground/90">
                {selectedMilestone.summary}
              </p>

              {/* Deliverables bullet list */}
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest font-mono">
                  Milestone Deliverables:
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/80 font-mono">
                  {selectedMilestone.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <ChevronRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side metadata */}
            <div className="md:col-span-4 space-y-4 md:border-l md:border-border/60 md:pl-6 flex flex-col justify-between">
              {/* Skills */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                  Innovator Skills
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMilestone.skillsLearned.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-mono bg-card border border-border px-2 py-0.5 rounded text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2 pt-4 md:pt-0">
                <h5 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  Tech Stack Used
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMilestone.techStack.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-mono bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clean Air Data Story / Case Study */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          Clean Air Data Case Study
        </h3>

        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
          {/* Tab Selection */}
          <div className="flex items-center gap-2 border-b border-border pb-4 mb-5">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border ml-2">
              {(["challenge", "solution", "impact"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveStoryTab(tab)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium capitalize select-none transition-all ${
                    activeStoryTab === tab
                      ? "bg-card text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono ml-auto hidden sm:block">
              CASE STUDY: AEROPULSE UP
            </span>
          </div>

          {/* Active Tab Panel */}
          <div className="transition-all duration-300">
            {activeStoryTab === "challenge" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-3.5">
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    The Challenge: Uttar Pradesh Air Distress
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Uttar Pradesh, containing dense industrial zones and heavy traffic capitals, suffers from seasonal particulate crisis. During winters, crop stubble burning (Parali) coupled with stagnant meteorological winds traps PM2.5 and PM10 particles.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Traditional monitoring stations are expensive, widely dispersed, and passive: they report high pollution but fail to trigger mitigation. This leaves municipal sectors exposed without immediate relief tools.
                  </p>
                </div>
                
                {/* Challenge Stats Card */}
                <div className="md:col-span-5 bg-rose-500/5 border border-rose-500/10 p-5 rounded-xl space-y-4 font-mono text-xs">
                  <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider"> distress indices </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-rose-500/10 pb-2">
                      <span className="text-muted-foreground">Kanpur PM2.5 Avg</span>
                      <span className="font-bold text-rose-500">280 µg/m³</span>
                    </div>
                    <div className="flex justify-between border-b border-rose-500/10 pb-2">
                      <span className="text-muted-foreground">Lucknow Traffic NO2</span>
                      <span className="font-bold text-rose-500">78 ppb</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advisory Response Lag</span>
                      <span className="font-bold text-rose-500">&gt; 12 Hours</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStoryTab === "solution" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-3.5">
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    The Solution: Closed-loop IoT Actuation
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    AeroPulse UP engineers a closed-loop response mechanism. Localized ESP32 IoT nodes monitor PM and gases, feeding telemetry to the administration dashboard.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    When sensor thresholds are crossed, automatic actuators are triggered: mist cannons precipitate suspended dust, green bypass routing diverts traffic, and industrial caps limit power outputs.
                  </p>
                </div>
                
                {/* Solution Tech Card */}
                <div className="md:col-span-5 bg-blue-500/5 border border-blue-500/10 p-5 rounded-xl space-y-4 font-mono text-xs">
                  <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider"> active mitigation </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-blue-500/10 pb-2">
                      <span className="text-muted-foreground">Smog Towers Misting</span>
                      <span className="font-bold text-blue-500">Relay Controlled</span>
                    </div>
                    <div className="flex justify-between border-b border-blue-500/10 pb-2">
                      <span className="text-muted-foreground">Traffic Routing Bypass</span>
                      <span className="font-bold text-blue-500">Real-time Diversions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Governance Sync Latency</span>
                      <span className="font-bold text-blue-500">&lt; 45 Seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStoryTab === "impact" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-3.5">
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    The Impact: Quantifiable ESG Health Metrics
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Closed-loop actuation reduces local respiratory risks by up to 25%. Misting lowers construction zone PM10 by 35%, protecting vulnerable citizens.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This transparent environmental response increases municipal ESG compliance rating and lowers public healthcare costs, delivering a sustainable template for smart cities.
                  </p>
                </div>
                
                {/* Impact Stats Card */}
                <div className="md:col-span-5 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl space-y-4 font-mono text-xs">
                  <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider"> projected outcomes </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                      <span className="text-muted-foreground">Local PM10 Reduction</span>
                      <span className="font-bold text-emerald-500">-35% Localized</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                      <span className="text-muted-foreground">Health Advisory Reach</span>
                      <span className="font-bold text-emerald-500">145k+ Wards</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bylaw Compliance Rate</span>
                      <span className="font-bold text-emerald-500">100% Aligned</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
