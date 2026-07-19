"use client";

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { useWebSocket } from '@/context/WebSocketContext';
import { ShieldAlert, Plus, Activity, HeartPulse, Send, CheckCircle2, UserCheck, Flame } from 'lucide-react';

interface Incident {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  location: string;
  ai_summary: string | null;
  created_at: string;
}

export default function SecurityMedical() {
  const { liveData } = useWebSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [emotionData, setEmotionData] = useState<any>(null);
  
  // Incident Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SECURITY');
  const [severity, setSeverity] = useState('MEDIUM');
  const [location, setLocation] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  const [dispatchedUnits, setDispatchedUnits] = useState([
    { id: 1, name: "Security Patrol Unit 1", type: "SECURITY", status: "IDLE", location: "Gate A Turnstiles" },
    { id: 2, name: "Medical Response Team B", type: "MEDICAL", status: "IDLE", location: "Sector 108" },
    { id: 3, name: "Emergency Steward Unit Alpha", type: "SECURITY", status: "IDLE", location: "Gate B Entry" },
    { id: 4, name: "First Aid Station 2", type: "MEDICAL", status: "IDLE", location: "North Concourse" }
  ]);

  const handleUnitStatusChange = (id: number, newStatus: string) => {
    setDispatchedUnits(prev => prev.map(unit => {
      if (unit.id === id) {
        return { ...unit, status: newStatus };
      }
      return unit;
    }));
  };

  // Fetch incidents & emotion advisor data
  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const fetchEmotionAnalysis = async () => {
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/ai/emotion-analysis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmotionData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchEmotionAnalysis();
  }, []);

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/incidents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category, severity, location }),
      });

      if (response.ok) {
        // Clear fields and refresh
        setTitle('');
        setDescription('');
        setLocation('');
        setShowForm(false);
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch(`http://localhost:8000/api/v1/modules/incidents/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignToMe = async (id: number) => {
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch(`http://localhost:8000/api/v1/modules/incidents/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_to_user_id: 2 }), // security coordinator seeded id
      });

      if (response.ok) {
        fetchIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Split security vs medical for stats
  const totalSecurity = incidents.filter(i => i.category === 'SECURITY' && i.status !== 'RESOLVED').length;
  const totalMedical = incidents.filter(i => i.category === 'MEDICAL' && i.status !== 'RESOLVED').length;

  // Host City Environmental & Cyber threat state
  const hostCities = [
    {
      id: 'metlife',
      name: 'New York / New Jersey (MetLife Stadium)',
      capacity: '82,500',
      risks: 'Severe transit bottlenecks; reliance on rail/bus transfers; high cyber-target profile.',
      temp: '84°F',
      aqi: '52 (Good)',
      threatLevel: 'HIGH (Cyber DDoS target)',
      statusText: 'Meadowlands Shuttle Bus transfers active (300 buses dispatched). Light rail delays: 15m.',
      metrics: { tempColor: 'text-white', aqiColor: 'text-mint-aurora', threatColor: 'text-orange-cyber' }
    },
    {
      id: 'sofi',
      name: 'Los Angeles (SoFi Stadium)',
      capacity: '70,240',
      risks: 'Heavy car dependency; LAX airport congestion; seismic monitoring requirements.',
      temp: '78°F',
      aqi: '88 (Moderate)',
      threatLevel: 'MEDIUM (Car corridor bottleneck)',
      statusText: 'LAX airport transit loop congested. Valet Limos & VIP Shuttles on standby.',
      metrics: { tempColor: 'text-white', aqiColor: 'text-gold-solar', threatColor: 'text-gold-solar' }
    },
    {
      id: 'azteca',
      name: 'Mexico City (Estadio Azteca)',
      capacity: '80,824',
      risks: 'High altitude; Metro Line 2 infrastructure renovations; cartel security deployment.',
      temp: '73°F (Altitude 7,350ft)',
      aqi: '95 (Moderate)',
      threatLevel: 'CRITICAL (100k safety patrol active)',
      statusText: 'Metro Line 2 delays. Migrant worker workforce log compliance check: 100%.',
      metrics: { tempColor: 'text-gold-solar', aqiColor: 'text-gold-solar', threatColor: 'text-orange-cyber animate-pulse' }
    },
    {
      id: 'att',
      name: 'Dallas (AT&T Stadium)',
      capacity: '70,649',
      risks: 'Extreme summer heat (>100°F); limited public transit infrastructure.',
      temp: '104°F (Extreme Heat Warning)',
      aqi: '45 (Good)',
      threatLevel: 'HIGH (Grid Load/Heat Stress)',
      statusText: 'AI cooling zone routes activated. Fanless edge cooling nodes throttled to 92% HVAC.',
      metrics: { tempColor: 'text-orange-cyber animate-pulse', aqiColor: 'text-mint-aurora', threatColor: 'text-orange-cyber' }
    },
    {
      id: 'lumen',
      name: 'Seattle (Lumen Field)',
      capacity: '66,925',
      risks: 'Wildfire smoke and poor air quality; light rail capacity limitations.',
      temp: '68°F',
      aqi: '154 (Unhealthy - Wildfire Smoke)',
      threatLevel: 'HIGH (Degraded air safety)',
      statusText: 'Active air filtration scrubbing enabled. Pedestrian light rail limit capped at 80% capacity.',
      metrics: { tempColor: 'text-white', aqiColor: 'text-orange-cyber animate-pulse', threatColor: 'text-orange-cyber' }
    },
    {
      id: 'bmo',
      name: 'Toronto (BMO Field)',
      capacity: '43,036',
      risks: 'Extensive temporary seating overlay requirements; budget/cost overruns.',
      temp: '70°F',
      aqi: '35 (Good)',
      threatLevel: 'LOW (Structural compliance checks)',
      statusText: 'Temporary structural seating overlay verified. Section 114 overlay limits: NORMAL.',
      metrics: { tempColor: 'text-white', aqiColor: 'text-mint-aurora', threatColor: 'text-mint-aurora' }
    }
  ];

  const [selectedCity, setSelectedCity] = useState(hostCities[0]);

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-mint-aurora/10">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">SECURITY & MEDICAL CENTRE</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Threat Monitoring, Emergency Dispatches & Fan Emotion Analytics
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-mint-aurora hover:bg-cyan-electric text-[#020f0d] font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-mint-aurora/15"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Host City Selector and Environmental Risk Matrix */}
      <div className="mb-8 p-6 glass-panel border-indigo-royal/20 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
              🌍 FIFA World Cup 2026 Host City Environmental & Cyber Threat Matrix
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Select venue location to adjust real-time edge monitoring sensor streams, local transit alerts, and environmental mitigations.
            </p>
          </div>
          
          <div>
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = hostCities.find(c => c.id === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="glass-input text-xs font-semibold bg-[#110825] border-mint-aurora/30 text-white min-w-[280px]"
            >
              {hostCities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-emerald-dark/60 border border-mint-aurora/5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Venue Capacity</span>
            <h4 className="text-lg font-bold text-white font-display mt-1">{selectedCity.capacity} spectators</h4>
            <p className="text-[10px] text-slate-500 mt-1">Expanded seating format</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-dark/60 border border-mint-aurora/5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Air Temperature</span>
            <h4 className={`text-lg font-bold font-display mt-1 ${selectedCity.metrics.tempColor}`}>{selectedCity.temp}</h4>
            <p className="text-[10px] text-slate-500 mt-1">Thermal sensor arrays</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-dark/60 border border-mint-aurora/5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Air Quality Index (AQI)</span>
            <h4 className={`text-lg font-bold font-display mt-1 ${selectedCity.metrics.aqiColor}`}>{selectedCity.aqi}</h4>
            <p className="text-[10px] text-slate-500 mt-1">Wildfire & particle scanners</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-dark/60 border border-mint-aurora/5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Local Cyber / Security Threat</span>
            <h4 className={`text-sm font-bold font-mono mt-1.5 uppercase ${selectedCity.metrics.threatColor}`}>{selectedCity.threatLevel}</h4>
            <p className="text-[10px] text-slate-500 mt-1">Unified logical & physical perimeter</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-indigo-royal/10 border border-indigo-royal/20 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[9px] uppercase tracking-wider text-cyan-electric block mb-0.5">
                Active Mitigations & Transit Operations
              </span>
              <p className="text-slate-300 font-sans">{selectedCity.statusText}</p>
            </div>
            <div className="text-[10px] text-slate-400 italic max-w-sm sm:text-right">
              <strong>Risk Profile:</strong> {selectedCity.risks}
            </div>
          </div>
        </div>
      </div>

      {/* Incident Reporting Form Panel */}
      {showForm && (
        <form onSubmit={handleIncidentSubmit} className="mb-8 p-6 glass-panel border-cyan-electric/20 rounded-2xl animate-slideDown max-w-3xl">
          <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider mb-4">
            New Operational Emergency Dispatch Form
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Incident Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Broken turnstile barrier"
                className="w-full glass-input text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Specific Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Concourse West Gate B"
                className="w-full glass-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Classification Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="SECURITY">SECURITY EMERGENCY</option>
                <option value="MEDICAL">MEDICAL ASSIST</option>
                <option value="MAINTENANCE">INFRASTRUCTURE MAINTENANCE</option>
                <option value="HAZARD">FIRE / STRUCTURAL HAZARD</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="LOW">LOW (Muted local response)</option>
                <option value="MEDIUM">MEDIUM (Steward response)</option>
                <option value="HIGH">HIGH (Immediate supervisor dispatch)</option>
                <option value="CRITICAL">CRITICAL (Multi-agency trigger)</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Factual Description / Symptoms
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Provide clear visual markers and status parameters..."
              className="w-full glass-input text-xs"
            />
          </div>

          <div className="flex space-x-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-mint-aurora to-cyan-electric text-[#020f0d] font-bold text-xs hover:brightness-110 transition-all flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Generating AI Brief...' : 'Discharge Dispatch'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid: Safety Advisor & Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Incidents feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section title */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
              Active Incident Log Feed
            </h3>
            <span className="text-[10px] text-slate-400">Total active: {totalSecurity + totalMedical}</span>
          </div>

          {loadingIncidents ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-mint-aurora border-t-transparent rounded-full animate-spin" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border-mint-aurora/10">
              <CheckCircle2 className="w-12 h-12 text-mint-aurora mx-auto mb-3" />
              <p className="text-sm text-slate-300 font-display font-semibold">All Gates Secure</p>
              <p className="text-xs text-slate-500 mt-1">No active operations emergency tickets pending.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => {
                const isSec = inc.category === 'SECURITY';
                const isMed = inc.category === 'MEDICAL';
                const isCrit = inc.severity === 'HIGH' || inc.severity === 'CRITICAL';
                
                return (
                  <div 
                    key={inc.id} 
                    className={`glass-panel p-5 rounded-2xl border-l-4 transition-all ${
                      isCrit ? 'border-l-orange-cyber' : 'border-l-gold-solar'
                    } ${inc.status === 'RESOLVED' ? 'opacity-60 border-l-mint-aurora' : ''}`}
                  >
                    {/* Top Row: Info parameters */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isSec ? 'bg-orange-cyber/20 text-orange-cyber' : isMed ? 'bg-indigo-royal/20 text-cyan-electric' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {inc.category}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isCrit ? 'bg-orange-cyber/20 text-orange-cyber' : 'bg-gold-solar/20 text-gold-solar'
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">#{inc.id}</span>
                      </div>
                      
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(inc.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    {/* Main text content */}
                    <h4 className="text-sm font-bold text-white font-display mb-1">{inc.title}</h4>
                    <p className="text-xs text-slate-300 mb-3">{inc.description}</p>
                    <p className="text-[11px] text-slate-400 mb-4">📍 Location: <strong className="text-white">{inc.location}</strong></p>

                    {/* AI Advisor Generated Protocols */}
                    {inc.ai_summary && (
                      <div className="p-3.5 rounded-xl bg-[#021210] border border-mint-aurora/10 text-xs text-slate-300 mb-4">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-mint-aurora flex items-center space-x-1 mb-1">
                          <Activity className="w-3 h-3 text-mint-aurora" />
                          <span>AI Core Incident Dispatch Briefing</span>
                        </p>
                        <p className="leading-relaxed font-sans">{inc.ai_summary}</p>
                      </div>
                    )}

                    {/* Interactive Controls Row */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-mint-aurora/5">
                      {inc.status === 'OPEN' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'ASSIGNED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-light/40 border border-mint-aurora/10 hover:border-mint-aurora/35 text-[10px] font-bold text-mint-aurora transition-colors"
                        >
                          Acknowledge Receipt
                        </button>
                      )}
                      
                      {inc.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                          className="px-3 py-1.5 rounded-lg bg-mint-aurora/15 hover:bg-mint-aurora/25 text-[10px] font-bold text-mint-aurora transition-colors"
                        >
                          Mark as Resolved
                        </button>
                      )}
                      
                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleAssignToMe(inc.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-royal/10 border border-indigo-royal/20 hover:border-indigo-royal/40 text-[10px] font-bold text-cyan-electric transition-colors flex items-center space-x-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Self-Assign</span>
                        </button>
                      )}
                      
                      {inc.status === 'RESOLVED' && (
                        <span className="text-[10px] text-mint-aurora font-bold uppercase tracking-wider flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-mint-aurora" />
                          <span>Incident Cleared</span>
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: AI Emotion analytics & Safety Advisor */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Emotion analysis */}
          <div className="glass-panel p-6 border-indigo-royal/20 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-cyber animate-pulse" />
              <span>AI Crowd Emotion Analytics</span>
            </h4>
            
            {emotionData ? (
              <div className="space-y-4">
                
                {/* Visual sliders */}
                <div className="space-y-3">
                  {Object.entries(emotionData.emotions).map(([emo, val]: [string, any]) => (
                    <div key={emo} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300">
                        <span>{emo}</span>
                        <span className="font-mono">{val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            emo === 'EXCITEMENT' || emo === 'JOY' ? 'bg-mint-aurora' : emo === 'FRUSTRATION' ? 'bg-orange-cyber' : 'bg-indigo-royal'
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cognitive recommendations */}
                <div className="p-3.5 rounded-xl bg-indigo-royal/10 border border-indigo-royal/20 text-xs text-slate-300">
                  <p className="font-bold text-[9px] uppercase tracking-wider text-cyan-electric mb-1">
                    AI Safety Advisor Protocol
                  </p>
                  <p className="leading-relaxed whitespace-pre-line">{emotionData.advice}</p>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No emotion analytics synced.
              </div>
            )}
          </div>

          {/* Quick contact card */}
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-3">
              Operational Radio Channels
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-mint-aurora/5">
                <span className="text-slate-400">Security Coordinator</span>
                <span className="text-cyan-electric font-semibold font-mono">CH-09 SEC</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-mint-aurora/5">
                <span className="text-slate-400">Medical Coordinator</span>
                <span className="text-cyan-electric font-semibold font-mono">CH-12 MED</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Stadium Stewards</span>
                <span className="text-cyan-electric font-semibold font-mono">CH-02 FLT</span>
              </div>
            </div>
          </div>

          {/* Active Field Unit Dispatcher */}
          <div className="glass-panel p-6 border-cyan-electric/20 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-cyan-electric animate-pulse" />
              <span>Active Field Unit Dispatcher</span>
            </h4>
            
            <div className="space-y-3">
              {dispatchedUnits.map(unit => (
                <div key={unit.id} className="p-3 rounded-xl bg-slate-900/40 border border-mint-aurora/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-[11px] font-bold text-white leading-tight">{unit.name}</h5>
                      <span className="text-[8px] text-slate-400 font-mono">📍 {unit.location}</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      unit.status === 'IDLE' ? 'bg-slate-800 text-slate-400' :
                      unit.status === 'DISPATCHED' ? 'bg-orange-cyber/20 text-orange-cyber animate-pulse' :
                      'bg-mint-aurora/20 text-mint-aurora'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUnitStatusChange(unit.id, 'IDLE')}
                      className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${
                        unit.status === 'IDLE' ? 'bg-slate-800 text-white border-slate-700' : 'border-slate-800/40 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      Standby
                    </button>
                    <button
                      onClick={() => handleUnitStatusChange(unit.id, 'DISPATCHED')}
                      className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${
                        unit.status === 'DISPATCHED' ? 'bg-orange-cyber/20 text-orange-cyber border-orange-cyber/40' : 'border-slate-800/40 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => handleUnitStatusChange(unit.id, 'ON_SITE')}
                      className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${
                        unit.status === 'ON_SITE' ? 'bg-mint-aurora/20 text-mint-aurora border-mint-aurora/40' : 'border-slate-800/40 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      On-Site
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
