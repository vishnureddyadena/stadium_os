"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/config';

// ── Keep-alive: ping backend every 10 min to prevent Render free-tier cold starts ──
if (typeof window !== 'undefined') {
  const ping = () => fetch(`${API_BASE_URL}/api/v1/health`, { method: 'GET' }).catch(() => {});
  ping(); // immediate ping on load
  setInterval(ping, 10 * 60 * 1000); // repeat every 10 minutes
}

export interface CrowdSensorData {
  id: number;
  section: string;
  gate: string | null;
  count: number;
  speed_m_s: number;
  density_score: number;
  status: string;
}

export interface ParkingData {
  id: number;
  sector: string;
  total_spots: number;
  occupied_spots: number;
  reserve_spots: number;
  EV_charger_spots: number;
  sensor_status: string;
  ai_prediction_score: number;
}

export interface TransportData {
  id: number;
  route_name: string;
  type: string;
  delay_minutes: number;
  status: string;
  driver_contact: string;
}

export interface SustainabilityMetrics {
  energy: { value: number; unit: string };
  water: { value: number; unit: string };
  waste: { value: number; unit: string };
  carbon: { value: number; unit: string };
}

export interface TelemetryData {
  crowd_sensors: CrowdSensorData[];
  parking: ParkingData[];
  transport: TransportData[];
  active_incidents_count: number;
  sustainability: SustainabilityMetrics;
}

interface WebSocketContextType {
  liveData: TelemetryData | null;
  isConnected: boolean;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveData, setLiveData] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        const { WS_BASE_URL } = require('@/config');
        ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws`);
        
        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('Stadium OS WebSockets status: CONNECTED.');
        };

        ws.onmessage = (event) => {
          try {
            const packet = JSON.parse(event.data);
            if (packet.type === 'TELEMETRY_UPDATE') {
              setLiveData(packet.data);
            }
          } catch (e) {
            console.error('Failed to parse WebSocket JSON payload', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('Stadium OS WebSockets status: DISCONNECTED. Retrying...');
          reconnectTimeout = setTimeout(connect, 4000);
        };

        ws.onerror = (e) => {
          setError('WebSocket connection error.');
          console.error(e);
        };
      } catch (err) {
        setError('Failed to establish WebSocket link.');
        reconnectTimeout = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ liveData, isConnected, error }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
