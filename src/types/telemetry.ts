export interface TelemetryPoint {
  time: string;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  so2: number;
}

export interface CityTelemetry {
  id: string;
  name: string;
  hindiName: string;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  so2: number;
  temp: number;
  humid: number;
  windSpeed: number;
  windDir: string;
  actuators: {
    mistCannons: boolean;
    trafficRedirect: boolean;
    industrialCap: boolean;
    publicBroadcast: boolean;
  };
  history: TelemetryPoint[];
}

export interface AlertLog {
  id: string;
  timestamp: string;
  cityId: string;
  cityName: string;
  level: "info" | "warning" | "critical";
  message: string;
}
