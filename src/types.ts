export interface SensorData {
  n: number | null;
  p: number | null;
  k: number | null;
  moisture: number | null;
  soilTemp: number | null;
  waterTemp: number | null;
  ph: number | null;
  timestamp: number | null;
}

export interface StationCommand {
  read_soil: boolean;
  update_wifi: boolean;
  wifi_ssid?: string;
  wifi_pass?: string;
}

export interface StationStatus {
  online: boolean;
  lastSeen: number;
  wifiRSSI: number;
  firmwareVersion: string;
}

export interface Station {
  Data?: SensorData;
  Command?: StationCommand;
  Status?: StationStatus;
}

export interface HistoryRecord extends SensorData {}

export interface AIInsight {
  summary: string;
  nutrients: {
    n: string;
    p: string;
    k: string;
  };
  moisture: string;
  ph: string;
  temperature: string;
  anomalies: string[];
  trends: string[];
  recommendations: string[];
}

export interface AIAnalysis {
  insight: AIInsight;
  timestamp: number;
}

export interface WifiConfiguration {
  ssid: string;
  pass: string;
}

export interface MeasurementState {
  isMeasuring: boolean;
  stage: string;
}

export type DemoModeType = boolean;

