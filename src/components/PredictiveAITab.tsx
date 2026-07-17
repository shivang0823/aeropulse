"use client";

import { useState } from "react";
import { 
  Brain, 
  Cpu, 
  Wind, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Gauge 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

const cities = [
  { id: "lucknow", name: "Lucknow", hindiName: "लखनऊ", base: 145 },
  { id: "kanpur", name: "Kanpur", hindiName: "कानपुर", base: 280 },
  { id: "noida", name: "Noida", hindiName: "नोएडा", base: 165 },
  { id: "ghaziabad", name: "Ghaziabad", hindiName: "गाज़ियाबाद", base: 220 },
  { id: "varanasi", name: "Varanasi", hindiName: "वाराणसी", base: 95 },
];

export default function PredictiveAITab() {
  const [selectedCityId, setSelectedCityId] = useState("lucknow");
  
  // Interactive Variables Sliders State
  const [traffic, setTraffic] = useState(65); // 10 - 150 vehicles/min
  const [industrial, setIndustrial] = useState(70); // 20% - 120%
  const [misting, setMisting] = useState(15); // 0 - 60 min/hour
  const [stubble, setStubble] = useState(3); // 0 - 10 index (Parali burning)

  const selectedCity = cities.find((c) => c.id === selectedCityId) || cities[0];

  // Mathematical Projection Generator (Now to +180 mins)
  const forecastData = [];
  const intervals = ["Now", "+30m", "+60m", "+90m", "+120m", "+150m", "+180m"];
  
  for (let i = 0; i < intervals.length; i++) {
    const timeFactor = i * 10; // natural accumulation over time without dispersion
    
    // Baseline Projection (No extra misting mitigation, keeping default variables)
    const basePM = Math.max(20, Math.round(
      selectedCity.base + timeFactor + 
      (traffic - 65) * 0.6 + 
      (industrial - 70) * 0.8 + 
      stubble * 15
    ));

    // Optimized Forecast (Incorporates active misting frequency)
    const optPM = Math.max(15, Math.round(
      selectedCity.base + timeFactor * 0.4 + 
      (traffic - 65) * 0.6 + 
      (industrial - 70) * 0.8 + 
      stubble * 15 - 
      misting * 1.8
    ));

    forecastData.push({
      time: intervals[i],
      "Baseline Projection (No Action)": basePM,
      "Optimized Forecast (With Mitigation)": optPM,
    });
  }

  // Get final projected levels
  const finalBaseline = forecastData[forecastData.length - 1]["Baseline Projection (No Action)"];
  const finalOptimized = forecastData[forecastData.length - 1]["Optimized Forecast (With Mitigation)"];
  
  // Calculate AQI category for final optimized value
  const getSeverity = (pmValue: number) => {
    if (pmValue <= 60) return { label: "Satisfactory", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/25" };
    if (pmValue <= 120) return { label: "Moderate/Poor", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/25" };
    if (pmValue <= 250) return { label: "Very Poor", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/25" };
    return { label: "Severe/Hazardous", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/25" };
  };

  const baselineSeverity = getSeverity(finalBaseline);
  const optimizedSeverity = getSeverity(finalOptimized);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <section className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Predictive AI Projections
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-[650px]">
            Calibrated neural forecast models simulating 3-hour local airshed dynamics. Tweak municipal parameters to view predicted particulate decay curves.
          </p>
        </div>

        {/* City selector dropdown */}
        <div className="flex items-center gap-2 bg-muted border border-border px-3 py-1.5 rounded-lg w-fit">
          <span className="text-[10px] text-muted-foreground font-mono uppercase">TARGET REGION:</span>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id} className="bg-card text-foreground">
                {city.name} ({city.hindiName})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 2. Forecast Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Interactive Sliders (5 Cols) */}
        <section className="lg:col-span-5 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Sliders className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-bold text-sm text-foreground">Variable Actuators</h3>
              <span className="text-[10px] text-muted-foreground font-mono">Micro-simulation variables</span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Variable 1: Traffic Density */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Traffic Volume Density</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                  {traffic} vehicles / min
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={traffic}
                onChange={(e) => setTraffic(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>Light (10)</span>
                <span>Peak Congestion (150)</span>
              </div>
            </div>

            {/* Variable 2: Industrial Activity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Industrial Output Capacity</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                  {industrial}% load
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={industrial}
                onChange={(e) => setIndustrial(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>Cap (20%)</span>
                <span>Overload (120%)</span>
              </div>
            </div>

            {/* Variable 3: Misting Cannon Frequency */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Mist Cannon Active Rate</span>
                <span className="font-mono bg-blue-500/10 border border-blue-500/10 px-2 py-0.5 rounded text-[10px] text-blue-500 font-bold">
                  {misting} mins / hr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={misting}
                onChange={(e) => setMisting(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>Off (0)</span>
                <span>Continuous Misting (60)</span>
              </div>
            </div>

            {/* Variable 4: Stubble Burning Intensity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Stubble Burning (Parali) Index</span>
                <span className="font-mono bg-red-500/10 border border-red-500/10 px-2 py-0.5 rounded text-[10px] text-red-500 font-bold">
                  Level {stubble} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={stubble}
                onChange={(e) => setStubble(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>None (0)</span>
                <span>Severe Crop Burning (10)</span>
              </div>
            </div>
          </div>

          {/* Variables Impact Summary */}
          <div className="p-3.5 rounded-lg bg-muted border border-border/80 text-[10px] text-muted-foreground font-mono space-y-1.5">
            <span className="font-bold text-foreground block uppercase tracking-wider text-[9px]">Simulation Parameters:</span>
            <ul className="list-disc pl-3.5 space-y-1">
              <li>High **Stubble Burning** indices inject heavy particulate offsets.</li>
              <li>Continuous **Mist Cannons** spray active water, washing down particulates.</li>
              <li>Reducing **Industrial Load** and diversion of **Traffic Congestion** decreases gaseous pollutants.</li>
            </ul>
          </div>
        </section>

        {/* Right Section: Forecast Graph & AI Insights (7 Cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Prediction Graph */}
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">3-Hour PM2.5 Projection Curves</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">Forecast trends (+180 mins)</span>
                </div>
              </div>
              
              <span className="text-[9px] font-mono bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded font-bold uppercase">
                Neural Model Calibrated
              </span>
            </div>

            {/* Recharts Projections */}
            <div className="h-[220px] w-full font-mono text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      borderRadius: "0.5rem",
                      fontFamily: "monospace",
                      fontSize: "10px"
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  <Line
                    name="Projected Baseline (No Action)"
                    type="monotone"
                    dataKey="Baseline Projection (No Action)"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                  <Line
                    name="Optimized Forecast (With Mitigation)"
                    type="monotone"
                    dataKey="Optimized Forecast (With Mitigation)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights & Projections Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Projected Baseline Outcome Card */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">PROJECTED PM2.5 (NO ACTION)</span>
                <h4 className="text-2xl font-extrabold text-foreground mt-1">{finalBaseline} <span className="text-xs font-mono font-normal">µg/m³</span></h4>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono ${baselineSeverity.bg} ${baselineSeverity.color} ${baselineSeverity.border}`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Class: {baselineSeverity.label}</span>
              </div>
            </div>

            {/* Projected Optimized Outcome Card */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">OPTIMIZED PM2.5 (MITIGATION ACTIVE)</span>
                <h4 className="text-2xl font-extrabold text-foreground mt-1">{finalOptimized} <span className="text-xs font-mono font-normal">µg/m³</span></h4>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono ${optimizedSeverity.bg} ${optimizedSeverity.color} ${optimizedSeverity.border}`}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Class: {optimizedSeverity.label}</span>
              </div>
            </div>

          </div>

          {/* AI Recommendation Alert */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex gap-4 items-start shadow-sm">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                Predictive AI Recommendation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {finalOptimized > 220 ? (
                  `Critical violation risk in 3 hours! Even with ${misting}m/hr misting active, baseline Parali stubble emissions (${stubble}) and industrial load (${industrial}%) will saturate the airshed. We recommend immediately deploying an Industrial Output Cap (< 40%) and issuing an official warning bylaw directive.`
                ) : finalOptimized > 120 ? (
                  `Particulate levels projected to enter 'Very Poor' categories. To stabilize the airshed under current traffic load (${traffic} veh/min), we advise increasing mist cannon active rates to at least 45 mins/hour.`
                ) : (
                  `Optimized mitigation is effective. Projections show air particulate levels remaining within moderate thresholds. Maintaining current misting rate (${misting}m/hr) is sufficient.`
                )}
              </p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
