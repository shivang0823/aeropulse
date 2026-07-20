"use client";

import { useState } from "react";
import { 
  Wind, 
  Thermometer, 
  Droplets, 
  Car, 
  Factory, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  RotateCw, 
  BellRing,
  Trash2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { CityTelemetry, AlertLog } from "@/types/telemetry";

interface OverviewTabProps {
  cities: CityTelemetry[];
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  onToggleActuator: (cityId: string, actuatorKey: keyof CityTelemetry["actuators"]) => void;
  alerts: AlertLog[];
  onAddManualAlert: (cityId: string, message: string, level: "info" | "warning" | "critical") => void;
  onClearAlerts: () => void;
  isLiveSync: boolean;
}

type ChartTab = "particulates" | "gases" | "weather";

// Standard India CPCB AQI Calculation Helper
function calculateAQI(pm25: number, pm10: number) {
  const pm25AQI = pm25 <= 30 ? (pm25 * 50 / 30) :
                  pm25 <= 60 ? 50 + (pm25 - 30) * 50 / 30 :
                  pm25 <= 90 ? 100 + (pm25 - 60) * 100 / 30 :
                  pm25 <= 120 ? 200 + (pm25 - 90) * 100 / 30 :
                  pm25 <= 250 ? 300 + (pm25 - 120) * 100 / 130 :
                  400 + Math.min(100, (pm25 - 250) * 100 / 150);

  const pm10AQI = pm10 <= 50 ? (pm10 * 50 / 50) :
                  pm10 <= 100 ? 50 + (pm10 - 50) * 50 / 50 :
                  pm10 <= 250 ? 100 + (pm10 - 100) * 100 / 150 :
                  pm10 <= 350 ? 200 + (pm10 - 250) * 100 / 100 :
                  pm10 <= 430 ? 300 + (pm10 - 350) * 100 / 80 :
                  400 + Math.min(100, (pm10 - 430) * 100 / 70);

  const aqi = Math.round(Math.max(pm25AQI, pm10AQI));

  if (aqi <= 50) {
    return { value: aqi, label: "Good", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20 dark:border-emerald-500/30", dotColor: "bg-emerald-500" };
  } else if (aqi <= 100) {
    return { value: aqi, label: "Satisfactory", colorClass: "text-green-500", bgClass: "bg-green-500/10", borderClass: "border-green-500/20 dark:border-green-500/30", dotColor: "bg-green-500" };
  } else if (aqi <= 200) {
    return { value: aqi, label: "Moderate", colorClass: "text-amber-500", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20 dark:border-amber-500/30", dotColor: "bg-amber-500" };
  } else if (aqi <= 300) {
    return { value: aqi, label: "Poor", colorClass: "text-orange-500", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20 dark:border-orange-500/30", dotColor: "bg-orange-500" };
  } else if (aqi <= 400) {
    return { value: aqi, label: "Very Poor", colorClass: "text-rose-500", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20 dark:border-rose-500/30", dotColor: "bg-rose-500" };
  } else {
    return { value: aqi, label: "Severe", colorClass: "text-purple-500", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/20 dark:border-purple-500/30", dotColor: "bg-purple-500" };
  }
}

export default function OverviewTab({
  cities,
  selectedCityId,
  setSelectedCityId,
  onToggleActuator,
  alerts,
  onAddManualAlert,
  onClearAlerts,
  isLiveSync,
}: OverviewTabProps) {
  const [chartTab, setChartTab] = useState<ChartTab>("particulates");

  const selectedCity = cities.find((c) => c.id === selectedCityId) || cities[0];
  const aqiInfo = calculateAQI(selectedCity.pm25, selectedCity.pm10);

  const handleTestAlert = () => {
    const alertMessages = [
      `Localized PM2.5 surge detected in ${selectedCity.name} Commercial Zone.`,
      `Minor agricultural dust intrusion reported upwind of ${selectedCity.name}.`,
      `Sudden drop in wind speed (${selectedCity.windSpeed} km/h) stalling dispersion in ${selectedCity.name}.`,
      `Citizen complaints regarding localized soot burning in ${selectedCity.name} quarters.`
    ];
    const randomMsg = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    onAddManualAlert(selectedCity.id, `${selectedCity.name}: ${randomMsg}`, "warning");
  };

  return (
    <div className="space-y-6">
      {/* 1. Municipality Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cities.map((city) => {
          const cityAqi = calculateAQI(city.pm25, city.pm10);
          const isSelected = city.id === selectedCityId;
          const activeActuatorsCount = Object.values(city.actuators).filter(Boolean).length;

          return (
            <button
              key={city.id}
              onClick={() => setSelectedCityId(city.id)}
              className={`flex flex-col text-left p-4 rounded-xl border bg-card/40 backdrop-blur-sm transition-all duration-300 select-none group relative ${
                isSelected
                  ? "border-blue-500 dark:border-blue-500/60 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20"
                  : "border-border hover:border-border-hover hover:bg-card/70"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <h3 className="font-bold text-sm leading-tight text-foreground">{city.name}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono leading-none">{city.hindiName}</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  {cityAqi.value > 200 && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cityAqi.dotColor}`} />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${cityAqi.dotColor}`} />
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold tracking-tight ${cityAqi.colorClass}`}>
                  {cityAqi.value}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  AQI ({cityAqi.label})
                </span>
              </div>

              {/* Quick Status Subtext */}
              <div className="mt-3 flex items-center justify-between w-full text-[10px] text-muted-foreground border-t border-border/50 pt-2 font-mono">
                <span>PM2.5: {city.pm25}</span>
                {isLiveSync ? (
                  <span className="text-emerald-500 font-semibold">
                    Node: {{
                      lucknow: 2456,
                      kanpur: 234568,
                      noida: 6980,
                      ghaziabad: 5665,
                      varanasi: 5590
                    }[city.id] || "Real"}
                  </span>
                ) : activeActuatorsCount > 0 ? (
                  <span className="text-blue-500 font-bold flex items-center gap-0.5 animate-pulse">
                    <Zap className="h-3 w-3 fill-blue-500" />
                    {activeActuatorsCount} Active
                  </span>
                ) : (
                  <span>Nodes Safe</span>
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* 2. Main Workspace Split Panel */}
      <div className="space-y-6">
        
        {/* Left Section: Charts & Telemetry Info */}
        <section className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {selectedCity.name} <span className="text-muted-foreground font-light text-base">| {selectedCity.hindiName}</span>
                  </h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${aqiInfo.bgClass} ${aqiInfo.colorClass} ${aqiInfo.borderClass}`}>
                    AQI {aqiInfo.value} - {aqiInfo.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dynamic IoT readings updating in real-time. Impact factor applied on active actuation.
                </p>
              </div>

              {/* Chart Tabs selector */}
              <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
                {(["particulates", "gases", "weather"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all select-none ${
                      chartTab === tab
                        ? "bg-card text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "particulates" ? "Particulates" : tab === "gases" ? "Gases" : "Meteo"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area */}
            <div className="h-[280px] w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={selectedCity.history}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorNO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--muted-foreground)" 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      borderRadius: "0.5rem",
                      fontFamily: "monospace",
                      fontSize: "11px"
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  {chartTab === "particulates" && (
                    <>
                      <Area
                        name="PM2.5 (µg/m³)"
                        type="monotone"
                        dataKey="pm25"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPM25)"
                        isAnimationActive={false}
                      />
                      <Area
                        name="PM10 (µg/m³)"
                        type="monotone"
                        dataKey="pm10"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPM10)"
                        isAnimationActive={false}
                      />
                    </>
                  )}

                  {chartTab === "gases" && (
                    <>
                      <Area
                        name="NO2 (ppb)"
                        type="monotone"
                        dataKey="no2"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorNO2)"
                        isAnimationActive={false}
                      />
                      <Area
                        name="SO2 (ppb)"
                        type="monotone"
                        dataKey="so2"
                        stroke="#ec4899"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSO2)"
                        isAnimationActive={false}
                      />
                      <Area
                        name="CO (mg/m³)"
                        type="monotone"
                        dataKey="co"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        fill="none"
                        isAnimationActive={false}
                      />
                    </>
                  )}

                  {chartTab === "weather" && (
                    <>
                      <Area
                        name="Temperature (°C)"
                        type="monotone"
                        dataKey="temp"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="none"
                        isAnimationActive={false}
                      />
                      <Area
                        name="Humidity (%)"
                        type="monotone"
                        dataKey="humid"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="none"
                        isAnimationActive={false}
                      />
                      <Area
                        name="Wind Speed (km/h)"
                        type="monotone"
                        dataKey="windSpeed"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        fill="none"
                        isAnimationActive={false}
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sensor Cards Detailed Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* PM2.5 Card */}
            <div className="bg-card border border-border p-4 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium text-[11px]">PM2.5 Fine</span>
                <span className={`font-mono text-[9px] px-1 rounded ${
                  selectedCity.pm25 > 60 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  Limit: 60
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{selectedCity.pm25}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-1">µg/m³</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedCity.pm25 > 120 ? "bg-red-500" : selectedCity.pm25 > 60 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (selectedCity.pm25 / 150) * 100)}%` }}
                />
              </div>
            </div>

            {/* PM10 Card */}
            <div className="bg-card border border-border p-4 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium text-[11px]">PM10 Coarse</span>
                <span className={`font-mono text-[9px] px-1 rounded ${
                  selectedCity.pm10 > 100 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  Limit: 100
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{selectedCity.pm10}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-1">µg/m³</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedCity.pm10 > 150 ? "bg-red-500" : selectedCity.pm10 > 100 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (selectedCity.pm10 / 250) * 100)}%` }}
                />
              </div>
            </div>

            {/* NO2 Card */}
            <div className="bg-card border border-border p-4 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium text-[11px]">Nitrogen Dioxide</span>
                <span className={`font-mono text-[9px] px-1 rounded ${
                  selectedCity.no2 > 80 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  Limit: 80
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{selectedCity.no2}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-1">ppb</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedCity.no2 > 80 ? "bg-red-500" : selectedCity.no2 > 40 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (selectedCity.no2 / 120) * 100)}%` }}
                />
              </div>
            </div>

            {/* CO Card */}
            <div className="bg-card border border-border p-4 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium text-[11px]">Carbon Monoxide</span>
                <span className={`font-mono text-[9px] px-1 rounded ${
                  selectedCity.co > 2.0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  Limit: 2.0
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{selectedCity.co}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-1">mg/m³</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedCity.co > 2.0 ? "bg-red-500" : selectedCity.co > 1.0 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (selectedCity.co / 4.0) * 100)}%` }}
                />
              </div>
            </div>

          </div>


          {/* IoT Control Panel Section */}
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4 mb-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  IoT Control Panel
                </h3>
                <p className="text-xs text-muted-foreground">
                  Deploy emergency mitigation actuators and environmental controls for {selectedCity.name}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mist Cannons Actuator */}
              <button
                onClick={() => onToggleActuator(selectedCity.id, "mistCannons")}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
                  selectedCity.actuators.mistCannons
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    : "border-border bg-card/40 hover:border-border-hover hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCity.actuators.mistCannons ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground"
                  }`}>
                    <Droplets className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors ${
                    selectedCity.actuators.mistCannons
                      ? "bg-blue-500/20 text-blue-400 animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedCity.actuators.mistCannons ? "bg-blue-500" : "bg-muted-foreground"}`} />
                    {selectedCity.actuators.mistCannons ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground">Mist Cannons</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Deploy localized liquid atomizers & smog towers to suppress particulates.
                </p>
              </button>

              {/* Traffic Rerouting Actuator */}
              <button
                onClick={() => onToggleActuator(selectedCity.id, "trafficRedirect")}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
                  selectedCity.actuators.trafficRedirect
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "border-border bg-card/40 hover:border-border-hover hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCity.actuators.trafficRedirect ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                  }`}>
                    <Car className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors ${
                    selectedCity.actuators.trafficRedirect
                      ? "bg-amber-500/20 text-amber-400 animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedCity.actuators.trafficRedirect ? "bg-amber-500" : "bg-muted-foreground"}`} />
                    {selectedCity.actuators.trafficRedirect ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground">Traffic Rerouting</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Activate traffic diversion bypasses around heavy pollution zones.
                </p>
              </button>

              {/* Industrial Power Caps Actuator */}
              <button
                onClick={() => onToggleActuator(selectedCity.id, "industrialCap")}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
                  selectedCity.actuators.industrialCap
                    ? "border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : "border-border bg-card/40 hover:border-border-hover hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCity.actuators.industrialCap ? "bg-rose-500/20 text-rose-400" : "bg-muted text-muted-foreground"
                  }`}>
                    <Factory className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors ${
                    selectedCity.actuators.industrialCap
                      ? "bg-rose-500/20 text-rose-400 animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedCity.actuators.industrialCap ? "bg-rose-500" : "bg-muted-foreground"}`} />
                    {selectedCity.actuators.industrialCap ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground">Industrial Power Caps</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Enforce strict clean-air manufacturing energy restrictions on local plants.
                </p>
              </button>

              {/* Public Broadcast Systems Actuator */}
              <button
                onClick={() => onToggleActuator(selectedCity.id, "publicBroadcast")}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
                  selectedCity.actuators.publicBroadcast
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "border-border bg-card/40 hover:border-border-hover hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCity.actuators.publicBroadcast ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}>
                    <Radio className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors ${
                    selectedCity.actuators.publicBroadcast
                      ? "bg-emerald-500/20 text-emerald-400 animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedCity.actuators.publicBroadcast ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    {selectedCity.actuators.publicBroadcast ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground">Public Broadcast</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Stream air quality warnings and health advisory notices to citizens.
                </p>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
