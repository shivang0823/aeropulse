"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Activity, 
  Brain, 
  Award, 
  Menu, 
  X, 
  ShieldAlert, 
  Database,
  User,
  Wind,
  RefreshCw
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import OverviewTab from "@/components/OverviewTab";
import PredictiveAITab from "@/components/PredictiveAITab";
import RagCommandTab from "@/components/RagCommandTab";
import { CityTelemetry, AlertLog } from "@/types/telemetry";

type TabId = "overview" | "predictive" | "rag";

function generateInitialHistory(
  basePM25: number,
  basePM10: number,
  baseNO2: number,
  baseCO: number,
  baseSO2: number
) {
  const history = [];
  const now = Date.now();
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now - i * 8000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const noise = Math.random() - 0.5;
    history.push({
      time,
      pm25: Math.max(10, Math.round(basePM25 + noise * 15)),
      pm10: Math.max(20, Math.round(basePM10 + noise * 25)),
      no2: Math.max(5, Math.round(baseNO2 + noise * 8)),
      co: Math.max(0.1, Math.round((baseCO + noise * 0.4) * 10) / 10),
      so2: Math.max(2, Math.round(baseSO2 + noise * 5)),
    });
  }
  return history;
}

const initialCities: CityTelemetry[] = [
  {
    id: "lucknow",
    name: "Lucknow",
    hindiName: "लखनऊ",
    pm25: 145,
    pm10: 210,
    no2: 78,
    co: 2.9,
    so2: 15,
    temp: 32,
    humid: 65,
    windSpeed: 12,
    windDir: "NE",
    actuators: {
      mistCannons: false,
      trafficRedirect: false,
      industrialCap: false,
      publicBroadcast: false,
    },
    history: generateInitialHistory(145, 210, 78, 2.9, 15),
  },
  {
    id: "kanpur",
    name: "Kanpur",
    hindiName: "कानपुर",
    pm25: 280,
    pm10: 360,
    no2: 55,
    co: 2.1,
    so2: 45,
    temp: 33,
    humid: 58,
    windSpeed: 8,
    windDir: "E",
    actuators: {
      mistCannons: false,
      trafficRedirect: false,
      industrialCap: false,
      publicBroadcast: false,
    },
    history: generateInitialHistory(280, 360, 55, 2.1, 45),
  },
  {
    id: "noida",
    name: "Noida",
    hindiName: "नोएडा",
    pm25: 165,
    pm10: 410,
    no2: 68,
    co: 2.4,
    so2: 18,
    temp: 31,
    humid: 60,
    windSpeed: 14,
    windDir: "W",
    actuators: {
      mistCannons: false,
      trafficRedirect: false,
      industrialCap: false,
      publicBroadcast: false,
    },
    history: generateInitialHistory(165, 410, 68, 2.4, 18),
  },
  {
    id: "ghaziabad",
    name: "Ghaziabad",
    hindiName: "गाज़ियाबाद",
    pm25: 220,
    pm10: 320,
    no2: 70,
    co: 2.8,
    so2: 24,
    temp: 31,
    humid: 62,
    windSpeed: 10,
    windDir: "NW",
    actuators: {
      mistCannons: false,
      trafficRedirect: false,
      industrialCap: false,
      publicBroadcast: false,
    },
    history: generateInitialHistory(220, 320, 70, 2.8, 24),
  },
  {
    id: "varanasi",
    name: "Varanasi",
    hindiName: "वाराणसी",
    pm25: 95,
    pm10: 155,
    no2: 42,
    co: 1.4,
    so2: 12,
    temp: 30,
    humid: 78,
    windSpeed: 6,
    windDir: "S",
    actuators: {
      mistCannons: false,
      trafficRedirect: false,
      industrialCap: false,
      publicBroadcast: false,
    },
    history: generateInitialHistory(95, 155, 42, 1.4, 12),
  },
];

const initialAlerts: AlertLog[] = [
  {
    id: "alert-init-1",
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
    cityId: "kanpur",
    cityName: "Kanpur",
    level: "critical",
    message: "Kanpur: AQI is 'Severe' (PM2.5: 280 µg/m³). Recommended to activate smog towers.",
  },
  {
    id: "alert-init-2",
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    cityId: "noida",
    cityName: "Noida",
    level: "warning",
    message: "Noida: Construction dust alert. PM10 is elevated at 410 µg/m³.",
  },
  {
    id: "alert-init-3",
    timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
    cityId: "system",
    cityName: "System",
    level: "info",
    message: "AeroPulse UP Actuation Network initialized. 10 IoT nodes online.",
  },
];

async function fetchOpenAQData(cityId: string, locationId: number): Promise<Partial<CityTelemetry>> {
  // Query our server-side API proxy to bypass browser CORS blockages
  const res = await fetch(`/api/openaq?locationId=${locationId}`);
  if (!res.ok) throw new Error(`Proxy fetch failed with status ${res.status}`);
  const data = await res.json();
  
  const sensors = data.location?.sensors || [];
  const sensorMap: Record<number, string> = {};
  sensors.forEach((s: any) => {
    sensorMap[s.id] = s.parameter?.name;
  });

  const measurements = data.latest || [];
  const readings: Record<string, number> = {
    pm25: 60, pm10: 100, no2: 30, co: 1.0, so2: 10, temp: 28, humid: 60, windSpeed: 10
  };
  let windDir = "N";

  measurements.forEach((m: any) => {
    const param = sensorMap[m.sensorsId];
    if (!param) return;

    if (param === "pm25") readings.pm25 = m.value;
    else if (param === "pm10") readings.pm10 = m.value;
    else if (param === "no2") {
      readings.no2 = m.value;
    }
    else if (param === "co") {
      readings.co = m.value > 100 ? Math.round((m.value / 1000) * 10) / 10 : m.value;
    }
    else if (param === "so2") readings.so2 = m.value;
    else if (param === "temperature") readings.temp = m.value;
    else if (param === "relativehumidity") readings.humid = m.value;
    else if (param === "wind_speed") {
      readings.windSpeed = Math.round(m.value * 3.6);
    }
    else if (param === "wind_direction") {
      const deg = m.value;
      const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const index = Math.round(deg / 45) % 8;
      windDir = dirs[index];
    }
  });

  return {
    pm25: Math.round(readings.pm25),
    pm10: Math.round(readings.pm10),
    no2: Math.round(readings.no2),
    co: readings.co,
    so2: Math.round(readings.so2),
    temp: Math.round(readings.temp),
    humid: Math.round(readings.humid),
    windSpeed: readings.windSpeed,
    windDir,
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cities, setCities] = useState<CityTelemetry[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("lucknow");
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    setCities(initialCities);
    setAlerts(initialAlerts);
    setMounted(true);
  }, []);

  const addManualAlert = useCallback((cityId: string, message: string, level: "info" | "warning" | "critical" = "warning") => {
    const timestamp = new Date().toLocaleTimeString();
    setAlerts((a) => {
      const newAlert: AlertLog = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        cityId,
        cityName: cityId === "system" ? "System" : (cityId === "kanpur" ? "Kanpur" : cityId === "noida" ? "Noida" : cityId === "ghaziabad" ? "Ghaziabad" : cityId === "varanasi" ? "Varanasi" : "Lucknow"),
        level,
        message,
      };
      return [newAlert, ...a].slice(0, 30);
    });
  }, []);

  const handleSyncLiveData = useCallback(async (enable: boolean) => {
    if (!enable) {
      setIsLiveSync(false);
      setCities(initialCities);
      addManualAlert("system", "Returned to Closed-Loop Actuation Simulation mode.", "info");
      return;
    }

    setSyncLoading(true);
    addManualAlert("system", "Contacting OpenAQ v3 nodes for Uttar Pradesh airsheds...", "info");
    
    try {
      const locationIds: Record<string, number> = {
        lucknow: 2456,
        kanpur: 234568,
        noida: 6980,
        ghaziabad: 5665,
        varanasi: 5590,
      };

      const updatedCities = await Promise.all(
        initialCities.map(async (city) => {
          const locId = locationIds[city.id];
          if (!locId) return city;

          try {
            const realData = await fetchOpenAQData(city.id, locId);
            
            const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const newHistoryPoint = {
              time: timestamp,
              pm25: realData.pm25 || 60,
              pm10: realData.pm10 || 100,
              no2: realData.no2 || 30,
              co: realData.co || 1.0,
              so2: realData.so2 || 10,
            };

            return {
              ...city,
              ...realData,
              history: [...city.history.slice(1), newHistoryPoint] as any,
            };
          } catch (err) {
            console.error(`Error syncing ${city.name}:`, err);
            return city;
          }
        })
      );

      setCities(updatedCities);
      setIsLiveSync(true);
      addManualAlert("system", "Successfully synced actual CPCB sensor readings from OpenAQ v3 API.", "info");
    } catch (error) {
      console.error("Live sync failed:", error);
      addManualAlert("system", "Failed to sync OpenAQ readings. Verify your connection or API Key.", "critical");
    } finally {
      setSyncLoading(false);
    }
  }, [addManualAlert]);

  // Background Simulation Interval (Ticks every 4 seconds)
  useEffect(() => {
    if (isLiveSync) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      
      setCities((prevCities) => {
        return prevCities.map((city) => {
          const { mistCannons, trafficRedirect, industrialCap, publicBroadcast } = city.actuators;
          
          let pm25Reduction = 1;
          let pm10Reduction = 1;
          let no2Reduction = 1;
          let coReduction = 1;
          let so2Reduction = 1;
          
          if (mistCannons) {
            pm25Reduction -= 0.22;
            pm10Reduction -= 0.35;
          }
          if (trafficRedirect) {
            no2Reduction -= 0.25;
            coReduction -= 0.30;
          }
          if (industrialCap) {
            pm25Reduction -= 0.12;
            so2Reduction -= 0.38;
          }
          if (publicBroadcast) {
            pm25Reduction -= 0.04;
            pm10Reduction -= 0.04;
            no2Reduction -= 0.04;
            coReduction -= 0.04;
            so2Reduction -= 0.04;
          }
          
          let basePM25 = 145;
          let basePM10 = 210;
          let baseNO2 = 78;
          let baseCO = 2.9;
          let baseSO2 = 15;
          
          if (city.id === "kanpur") {
            basePM25 = 280; basePM10 = 360; baseNO2 = 55; baseCO = 2.1; baseSO2 = 45;
          } else if (city.id === "noida") {
            basePM25 = 165; basePM10 = 410; baseNO2 = 68; baseCO = 2.4; baseSO2 = 18;
          } else if (city.id === "ghaziabad") {
            basePM25 = 220; basePM10 = 320; baseNO2 = 70; baseCO = 2.8; baseSO2 = 24;
          } else if (city.id === "varanasi") {
            basePM25 = 95; basePM10 = 155; baseNO2 = 42; baseCO = 1.4; baseSO2 = 12;
          }
          
          const targetPM25 = basePM25 * pm25Reduction;
          const targetPM10 = basePM10 * pm10Reduction;
          const targetNO2 = baseNO2 * no2Reduction;
          const targetCO = baseCO * coReduction;
          const targetSO2 = baseSO2 * so2Reduction;
          
          const noise = (Math.random() - 0.5);
          
          const nextPM25 = Math.max(15, Math.round(city.pm25 + (targetPM25 - city.pm25) * 0.15 + noise * 10));
          const nextPM10 = Math.max(25, Math.round(city.pm10 + (targetPM10 - city.pm10) * 0.15 + noise * 15));
          const nextNO2 = Math.max(5, Math.round(city.no2 + (targetNO2 - city.no2) * 0.15 + noise * 5));
          const nextCO = Math.max(0.2, Math.round((city.co + (targetCO - city.co) * 0.15 + noise * 0.2) * 10) / 10);
          const nextSO2 = Math.max(2, Math.round(city.so2 + (targetSO2 - city.so2) * 0.15 + noise * 4));
          
          // Emit critical alerts on crossing threshold
          if (nextPM25 > 250 && !mistCannons) {
            if (city.pm25 <= 250) {
              const alertMsg = `${city.name}: PM2.5 is critically high at ${nextPM25} µg/m³! Smog Tower activation recommended.`;
              setAlerts((a) => {
                // Avoid duplicates in short timeframes
                if (a.some(x => x.cityId === city.id && x.message.includes("PM2.5 is critically high") && Date.now() - new Date(x.id.split("-")[1]).getTime() < 15000)) return a;
                const newAlert: AlertLog = {
                  id: `alert-${Date.now()}-${city.id}-pm25`,
                  timestamp: new Date().toLocaleTimeString(),
                  cityId: city.id,
                  cityName: city.name,
                  level: "critical",
                  message: alertMsg,
                };
                return [newAlert, ...a].slice(0, 30);
              });
            }
          }
          
          const newHistoryPoint = {
            time: timestamp,
            pm25: nextPM25,
            pm10: nextPM10,
            no2: nextNO2,
            co: nextCO,
            so2: nextSO2,
          };
          
          return {
            ...city,
            pm25: nextPM25,
            pm10: nextPM10,
            no2: nextNO2,
            co: nextCO,
            so2: nextSO2,
            history: [...city.history.slice(1), newHistoryPoint],
          };
        });
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isLiveSync]);

  const toggleActuator = useCallback((cityId: string, actuatorKey: keyof CityTelemetry["actuators"]) => {
    setCities((prev) =>
      prev.map((c) => {
        if (c.id !== cityId) return c;
        const nextVal = !c.actuators[actuatorKey];
        
        const timestamp = new Date().toLocaleTimeString();
        const actionText = nextVal ? "ACTIVATED" : "DEACTIVATED";
        const actuatorNames = {
          mistCannons: "Smog Towers & Mist Cannons",
          trafficRedirect: "Traffic Redirection Bypass",
          industrialCap: "Clean-Air Industrial Cap",
          publicBroadcast: "Citizen Warning Broadcast",
        };
        const newAlert: AlertLog = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          cityId,
          cityName: c.name,
          level: "info",
          message: `${actuatorNames[actuatorKey]} ${actionText} for ${c.name}.`,
        };
        setAlerts((a) => [newAlert, ...a].slice(0, 30));
        
        return {
          ...c,
          actuators: {
            ...c.actuators,
            [actuatorKey]: nextVal,
          },
        };
      })
    );
  }, []);


  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const navigation = [
    { id: "overview", name: "Live Telemetry", icon: Activity, desc: "IoT Sensor Streams & Actuation" },
    { id: "predictive", name: "Predictive AI", icon: Brain, desc: "3-Hour Time-Series Forecasts" },
    { id: "rag", name: "RAG Command", icon: ShieldAlert, desc: "Legal Bylaws & Directive Generation" },
  ] as const;

  const renderActiveTab = () => {
    if (!mounted) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground font-mono text-xs gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Wind className="h-6 w-6 animate-spin" />
          </div>
          <span>Synchronizing Node Network...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab 
            cities={cities}
            selectedCityId={selectedCityId}
            setSelectedCityId={setSelectedCityId}
            onToggleActuator={toggleActuator}
            alerts={alerts}
            onAddManualAlert={addManualAlert}
            onClearAlerts={clearAlerts}
            isLiveSync={isLiveSync}
          />
        );
      case "predictive":
        return <PredictiveAITab />;
      case "rag":
        return (
          <RagCommandTab 
            onAddManualAlert={addManualAlert}
            cities={cities}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Navigation Bar with Vertical Item Stack */}
      <header className="w-full border-b border-border bg-card select-none">
        <div className="max-w-[1600px] mx-auto p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Wind className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-xl leading-tight">AeroPulse UP</h1>
              <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Actuation Network</span>
            </div>
          </div>

          {/* Navigation Items (Stacked Vertically) */}
          <nav className="flex flex-col gap-1.5 w-full md:max-w-md">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono px-2">Navigation Deck</span>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group text-left border ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <div>
                    <div className="font-bold leading-tight">{item.name}</div>
                    <div className={`text-[9px] font-normal ${isActive ? "text-blue-100" : "text-muted-foreground"}`}>{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Admin Profile Info */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate leading-tight">Shivang Srivastava</h2>
              <p className="text-[10px] text-muted-foreground truncate">System Administrator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Row */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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

            {/* Live OpenAQ Sync Switch */}
            <button
              onClick={() => handleSyncLiveData(!isLiveSync)}
              disabled={syncLoading}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-mono select-none transition-all ${
                isLiveSync
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25 shadow-sm shadow-emerald-500/5 font-bold"
                  : syncLoading
                    ? "bg-muted text-muted-foreground border-border cursor-wait"
                    : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncLoading ? "animate-spin" : ""}`} />
              <span>{isLiveSync ? "CPCB Live: ON" : "Sync Live CPCB"}</span>
            </button>

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
