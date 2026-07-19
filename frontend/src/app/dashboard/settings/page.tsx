"use client";

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { useAuth, UserSessionInfo } from '@/context/AuthContext';
import { 
  Settings, Cpu, HardDrive, ShieldAlert, Activity, RefreshCw, 
  UserCheck, Smartphone, Globe, AlertOctagon 
} from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  user_name: string;
  ip_address: string;
  timestamp: string;
}

export default function AdminSettings() {
  const { fetchSessions, revokeSession, user, token } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Simulated hardware metrics
  const [cpuLoad, setCpuLoad] = useState(24);
  const [memLoad, setMemLoad] = useState(42);
  const [dbPool, setDbPool] = useState(8);

  const loadDataAndSessions = async () => {
    setLoading(true);
    try {
      // 1. Fetch user directory from backend API
      const tokenToUse = token || localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/auth/users', {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });
      if (response.ok) {
        const resUsers = await response.json();
        setUsers(resUsers);
      } else {
        console.error("Failed to load user directory.");
      }

      // 2. Fetch Audit logs
      const mockLogs: AuditLog[] = [
        { id: 1, action: "User security@stadiumos.ai self-assigned Incident #3", user_name: "Security Lead", ip_address: "192.168.1.42", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
        { id: 2, action: "Admin authenticated via Biometric FaceID scan", user_name: "Ops Commander", ip_address: "192.168.1.10", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { id: 3, action: "Ticket Scan Fraud Trigger logged for TICKET-2026-FIFA-999", user_name: "Gate Press Scanner", ip_address: "10.0.4.15", timestamp: new Date(Date.now() - 1000 * 60 * 82).toISOString() },
        { id: 4, action: "Pushed Coca-Cola Signage Loop to Scoreboard East", user_name: "Match Sponsor Lead", ip_address: "192.168.1.121", timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString() },
      ];
      setAuditLogs(mockLogs);

      // 3. Fetch active device sessions from backend API
      const sessionData = await fetchSessions();
      setActiveSessions(sessionData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const tokenToUse = token || localStorage.getItem('stadium_token');
      const response = await fetch(`http://localhost:8000/api/v1/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        // Reload users list
        const res = await fetch('http://localhost:8000/api/v1/auth/users', {
          headers: {
            'Authorization': `Bearer ${tokenToUse}`
          }
        });
        if (res.ok) {
          const resUsers = await res.json();
          setUsers(resUsers);
        }
      } else {
        alert("Failed to update user role.");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting server.");
    }
  };

  useEffect(() => {
    loadDataAndSessions();

    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(95, Math.max(10, prev + Math.floor(Math.random() * 9) - 4)));
      setMemLoad(prev => Math.min(90, Math.max(30, prev + Math.floor(Math.random() * 5) - 2)));
      setDbPool(prev => Math.min(20, Math.max(1, prev + Math.floor(Math.random() * 3) - 1)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRevoke = async (id: number) => {
    const success = await revokeSession(id);
    if (success) {
      // Reload sessions list
      const data = await fetchSessions();
      setActiveSessions(data);
    } else {
      alert("Unable to terminate device session.");
    }
  };

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-mint-aurora/10">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">SYSTEM SETTINGS & AUDIT LOGS</h2>
          <p className="text-xs text-slate-400 mt-1">
            Server Health Indicators, Database Pool Checks, RBAC Registries & Session Security
          </p>
        </div>
        
        <button
          onClick={loadDataAndSessions}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-emerald-light/40 border border-mint-aurora/10 hover:border-mint-aurora/30 text-mint-aurora font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Diagnostics</span>
        </button>
      </div>

      {/* System Health stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* CPU */}
        <div className="glass-panel p-5 rounded-2xl border-mint-aurora/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">API Core Server CPU</span>
            <Cpu className="w-4.5 h-4.5 text-mint-aurora" />
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-2xl font-black text-white font-mono">{cpuLoad}%</h3>
            <span className="text-[10px] text-slate-400">Target: &lt; 70%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${cpuLoad > 80 ? 'bg-orange-cyber' : 'bg-mint-aurora'}`} style={{ width: `${cpuLoad}%` }} />
          </div>
        </div>

        {/* Memory */}
        <div className="glass-panel p-5 rounded-2xl border-cyan-electric/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Redis Cache RAM pool</span>
            <HardDrive className="w-4.5 h-4.5 text-cyan-electric" />
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-2xl font-black text-white font-mono">{memLoad}%</h3>
            <span className="text-[10px] text-slate-400">Total: 16 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-electric rounded-full transition-all duration-1000" style={{ width: `${memLoad}%` }} />
          </div>
        </div>

        {/* Database Pool */}
        <div className="glass-panel p-5 rounded-2xl border-indigo-royal/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SQLAlchemy Active Connections</span>
            <Activity className="w-4.5 h-4.5 text-indigo-royal" />
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-2xl font-black text-white font-mono">{dbPool} <span className="text-xs text-slate-400 font-normal">threads</span></h3>
            <span className="text-[10px] text-slate-400">Pool capacity: 20</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-royal rounded-full transition-all duration-1000" style={{ width: `${(dbPool/20)*100}%` }} />
          </div>
        </div>

      </div>

      {/* Grid: Users, Sessions and Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: User directory role management */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4">
              Registered Operators (RBAC registry)
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-mint-aurora border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-mint-aurora/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none mb-1">{u.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono mb-1">{u.email}</p>
                      {u.employee_id && <p className="text-[8px] text-cyan-electric">ID: {u.employee_id}</p>}
                      {u.volunteer_id && <p className="text-[8px] text-mint-aurora">ID: {u.volunteer_id}</p>}
                      {u.fifa_id && <p className="text-[8px] text-indigo-royal">FIFA ID: {u.fifa_id}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="text-[10px] bg-slate-800 text-slate-200 border border-mint-aurora/20 rounded px-2 py-1 focus:ring-0 focus:outline-none"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="ORGANIZER">ORGANIZER</option>
                        <option value="SECURITY">SECURITY</option>
                        <option value="MEDICAL">MEDICAL</option>
                        <option value="VOLUNTEER">VOLUNTEER</option>
                        <option value="VIP">VIP</option>
                        <option value="VENDOR">VENDOR</option>
                        <option value="FAN">FAN</option>
                      </select>
                      <span className="w-1.5 h-1.5 rounded-full bg-mint-aurora" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audit Logs list */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-6 border-cyan-electric/10 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
              <ShieldAlert className="w-4.5 h-4.5 text-cyan-electric" />
              <span>Real-Time Audit Trails</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-mint-aurora border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#021210] border border-mint-aurora/5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-cyan-electric uppercase">{log.user_name}</span>
                      <span className="text-[8px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] leading-tight text-slate-300 mb-1">{log.action}</p>
                    <span className="text-[8px] text-slate-500">Source IP: {log.ip_address}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Active sessions full-width panel */}
      <div className="glass-panel p-6 border-indigo-royal/20 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-cyan-electric" />
          <span>Active Device Sessions Management (Token Hijack Prevention)</span>
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-mint-aurora border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeSessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No active secondary sessions logged. Only your current session is open.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map(sess => (
              <div key={sess.id} className="p-4 rounded-xl bg-emerald-dark/50 border border-mint-aurora/5 flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-cyan-electric">{sess.device_fingerprint}</span>
                    {sess.ip_address === "127.0.0.1" && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-mint-aurora/20 text-mint-aurora font-bold uppercase tracking-wider">
                        Current Session
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white mb-1 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[200px]">{sess.user_agent || "Unknown Browser"}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">IP Source: {sess.ip_address}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Authenticated: {new Date(sess.created_at).toLocaleString()}</p>
                </div>

                <button
                  onClick={() => handleRevoke(sess.id)}
                  className="w-full py-1.5 rounded-lg bg-orange-cyber/10 border border-orange-cyber/20 hover:bg-orange-cyber/20 text-orange-cyber text-[10px] font-bold transition-colors"
                >
                  Revoke Device Token
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
