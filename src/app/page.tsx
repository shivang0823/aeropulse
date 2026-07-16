"use client";

import { useState } from "react";
import { 
  Activity, 
  Brain, 
  Award, 
  Menu, 
  X, 
  ShieldAlert, 
  Database,
  User,
  Wind
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import OverviewTab from "@/components/OverviewTab";
import PredictiveAITab from "@/components/PredictiveAITab";
import RagCommandTab from "@/components/RagCommandTab";
import PortfolioTab from "@/components/PortfolioTab";

type TabId = "overview" | "predictive" | "rag" | "portfolio";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: "overview", name: "Live Telemetry", icon: Activity, desc: "IoT Sensor Streams & Actuation" },
    { id: "predictive", name: "Predictive AI", icon: Brain, desc: "3-Hour Time-Series Forecasts" },
    { id: "rag", name: "RAG Command", icon: ShieldAlert, desc: "Legal Bylaws & Directive Generation" },
    { id: "portfolio", name: "1M1B Portfolio", icon: Award, desc: "Innovation Journey & ESG Matrix" },
  ] as const;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "predictive":
        return <PredictiveAITab />;
      case "rag":
        return <RagCommandTab />;
      case "portfolio":
        return <PortfolioTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card text-card-foreground p-6 select-none shrink-0">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Wind className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-lg leading-tight">AeroPulse UP</h1>
            <span className="text-xs text-muted-foreground font-mono">Actuation Network</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group text-left ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-[10px] ${isActive ? "text-blue-100" : "text-muted-foreground"}`}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Innovator Metadata Portfolio Card */}
        <div className="mt-auto border-t border-border pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate leading-tight">Shivang Srivastava</h2>
              <p className="text-[10px] text-muted-foreground truncate">Innovator | Cohort 9U</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-card border-r border-border p-6 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Wind className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-lg leading-tight">AeroPulse UP</h1>
              <span className="text-[10px] text-muted-foreground font-mono">Actuation Network</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md bg-muted hover:bg-accent hover:text-accent-foreground border border-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group text-left ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-[10px] ${isActive ? "text-blue-100" : "text-muted-foreground"}`}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate leading-tight">Shivang Srivastava</h2>
              <p className="text-[10px] text-muted-foreground truncate">1M1B Journey - Batch 2 UPN</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Row */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg bg-muted/50 hover:bg-muted border border-border lg:hidden text-foreground transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold capitalize leading-none tracking-tight">
                {navigation.find(item => item.id === activeTab)?.name}
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                {navigation.find(item => item.id === activeTab)?.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Live Telemetry Node Indicators */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>10 IoT Nodes Active</span>
            </div>

            {/* Uptime Diagnostics */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-border text-xs text-muted-foreground font-mono">
              <Database className="h-3.5 w-3.5" />
              <span>G-Trans: 99.8%</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto transition-all duration-300">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
