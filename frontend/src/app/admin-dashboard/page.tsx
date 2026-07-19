"use client";

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { Stadium3D } from '@/components/Stadium3D';
import { useWebSocket } from '@/context/WebSocketContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, ShieldAlert, Car, Clock, Sparkles, Send, Play, AlertTriangle, Flame, Cpu
} from 'lucide-react';

export default function CommandCenter() {
  const { liveData } = useWebSocket();
  const { user } = useAuth();
  const router = useRouter();

  // Role Gate: Redirect unauthorized roles
  useEffect(() => {
    if (user) {
      if (user.role === 'ORGANIZER') {
        router.push('/dashboard/sponsor-media');
      } else if (user.role === 'SECURITY' || user.role === 'MEDICAL') {
        router.push('/dashboard/security-medical');
      } else if (user.role === 'VIP') {
        router.push('/dashboard/vip-transport');
      } else if (user.role === 'VENDOR') {
        router.push('/dashboard/sustainability');
      } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        router.push('/dashboard/fan-companion');
      }
    }
  }, [user, router]);
  
  // Chat bot states
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([
    { sender: 'ai', text: 'Good morning Commander. Stadium OS AI is online. Telemetry sync complete. How can I assist you with operations?' }
  ]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Extract totals from live telemetry
  const totalCrowd = liveData?.crowd_sensors.reduce((acc, curr) => acc + curr.count, 0) || 11330;
  const activeIncidents = liveData?.active_incidents_count ?? 3;
  
  const totalParkingSpots = liveData?.parking.reduce((acc, curr) => acc + curr.total_spots, 0) || 1900;
  const occupiedParkingSpots = liveData?.parking.reduce((acc, curr) => acc + curr.occupied_spots, 0) || 1315;
  const parkingPercentage = totalParkingSpots > 0 ? ((occupiedParkingSpots / totalParkingSpots) * 100).toFixed(0) : '69';

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setPrompt('');
    setLoadingAI(true);

    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/ai/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: userText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Error contacting AI cognitive layer.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Connection timed out. Check FastAPI server.' }]);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <DashboardShell>
      
      {/* Header operations overview bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 pb-6 border-b border-mint-aurora/10">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">COMMAND CENTER</h2>
          <p className="text-xs text-slate-400 mt-1">
            FIFA Matchday Operations Platform | Dallas Arena Sector North
          </p>
        </div>
        
        {/* Active game schedule banner */}
        <div className="mt-4 lg:mt-0 flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-indigo-royal/10 border border-indigo-royal/20">
          <Clock className="w-5 h-5 text-cyan-electric" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">NEXT KICK-OFF MATCH</span>
            <span className="text-xs font-semibold text-white font-display">USA vs Germany | Group Stage A | 18:00 UTC</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* KPI 1: Live Crowd Counts */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-mint-aurora/15">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Occupancy</span>
            <h3 className="text-2xl font-black text-white font-display mt-1">{totalCrowd.toLocaleString()}</h3>
            <span className="text-[10px] text-mint-aurora font-medium mt-1 inline-block">Live counting sensors active</span>
          </div>
          <div className="p-3.5 bg-mint-aurora/15 text-mint-aurora rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Active Incidents */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-orange-cyber/15">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unresolved alerts</span>
            <h3 className={`text-2xl font-black font-display mt-1 ${activeIncidents > 0 ? 'text-orange-cyber' : 'text-white'}`}>
              {activeIncidents}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Security / Medical logs</span>
          </div>
          <div className={`p-3.5 rounded-2xl ${activeIncidents > 0 ? 'bg-orange-cyber/20 text-orange-cyber' : 'bg-slate-800 text-slate-400'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Parking rates */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-cyan-electric/15">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Parking Utilization</span>
            <h3 className="text-2xl font-black text-white font-display mt-1">{parkingPercentage}%</h3>
            <span className="text-[10px] text-cyan-electric font-medium mt-1 inline-block">
              {occupiedParkingSpots} / {totalParkingSpots} spots full
            </span>
          </div>
          <div className="p-3.5 bg-cyan-electric/15 text-cyan-electric rounded-2xl">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Operations health */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-mint-aurora/15">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">System Status</span>
            <h3 className="text-2xl font-black text-mint-aurora font-display mt-1">99.8%</h3>
            <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Response latency: 12ms</span>
          </div>
          <div className="p-3.5 bg-mint-aurora/10 text-mint-aurora rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Cognitive Analytics & AI Telemetry Grid */}
      <div className="mb-8">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display mb-4 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric animate-ping" />
          <span>GenAI Cognitive Telemetry</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Heatmap Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-cyan-electric/15">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Cognitive Requests</span>
              <h3 className="text-2xl font-black text-white font-display mt-1">14,250 <span className="text-xs font-normal text-slate-400">/ min</span></h3>
              <span className="text-[10px] text-cyan-electric font-medium mt-1 inline-block font-sans">GenAI Heatmap load steady</span>
            </div>
            <div className="p-3.5 bg-cyan-electric/10 text-cyan-electric rounded-2xl">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Inference Latency Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-mint-aurora/15">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Avg Inference Latency</span>
              <h3 className="text-2xl font-black text-mint-aurora font-display mt-1">142ms</h3>
              <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block font-sans">Pipeline response time</span>
            </div>
            <div className="p-3.5 bg-mint-aurora/10 text-mint-aurora rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Token Efficiency Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-cyan-electric/15">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Token Efficiency</span>
              <h3 className="text-2xl font-black text-white font-display mt-1">98.4%</h3>
              <span className="text-[10px] text-cyan-electric font-medium mt-1 inline-block font-sans">Cache optimization index</span>
            </div>
            <div className="p-3.5 bg-cyan-electric/10 text-cyan-electric rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Active Edge AI Nodes Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-mint-aurora/15">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Active Edge AI Nodes</span>
              <h3 className="text-2xl font-black text-white font-display mt-1">128 / 128</h3>
              <span className="text-[10px] text-mint-aurora font-medium mt-1 inline-block font-sans">5G Standalone slice online</span>
            </div>
            <div className="p-3.5 bg-mint-aurora/10 text-mint-aurora rounded-2xl">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
          </div>

        </div>
      </div>

      {/* Main content grid: Digital Twin & Gates load graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: digital twin */}
        <div className="lg:col-span-8 space-y-6">
          <Stadium3D />
          
          {/* Turnstiles Crowd Speeds and Gates overview */}
          <div className="glass-panel rounded-2xl p-6 border-mint-aurora/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display mb-4">
              Real-time gate processing telemetry
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveData?.crowd_sensors.slice(0, 3).map((sensor) => {
                const isOverloaded = sensor.density_score > 0.75;
                const isWarning = sensor.density_score > 0.4 && sensor.density_score <= 0.75;
                const barColor = isOverloaded ? 'bg-orange-cyber' : isWarning ? 'bg-gold-solar' : 'bg-mint-aurora';
                
                return (
                  <div key={sensor.id} className="p-4 rounded-xl bg-emerald-dark/40 border border-mint-aurora/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white font-display">{sensor.gate || sensor.section}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isOverloaded ? 'bg-orange-cyber/20 text-orange-cyber' : isWarning ? 'bg-gold-solar/20 text-gold-solar' : 'bg-mint-aurora/20 text-mint-aurora'
                        }`}>
                          {sensor.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-lg font-black text-white font-mono">{sensor.count}</span>
                        <span className="text-[10px] text-slate-400">fans scanned</span>
                      </div>
                    </div>

                    {/* Heatmap Bar graph */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${barColor} transition-all duration-1000`} 
                          style={{ width: `${sensor.density_score * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400">
                        <span>Flow: {sensor.speed_m_s} m/s</span>
                        <span>Density: {(sensor.density_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI command assistant Chat */}
        <div className="lg:col-span-4 flex">
          <div className="w-full glass-panel border-cyan-electric/15 rounded-2xl p-6 flex flex-col justify-between h-[500px] lg:h-auto">
            
            {/* AI Assistant header */}
            <div className="flex items-center justify-between border-b border-mint-aurora/10 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-mint-aurora animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">GenAI Command Copilot</h4>
                  <span className="text-[9px] text-cyan-electric font-mono">STADIUM-AI-1.5-FLASH</span>
                </div>
              </div>
            </div>

            {/* Chat Box messages body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-light/40 border border-mint-aurora/10 ml-auto text-slate-200' 
                      : 'bg-indigo-royal/10 border border-indigo-royal/20 mr-auto text-slate-300'
                  }`}
                >
                  <p className="font-bold text-[9px] uppercase tracking-wider mb-1 text-slate-400">
                    {msg.sender === 'user' ? 'Operator Command' : 'Stadium OS AI'}
                  </p>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
              
              {loadingAI && (
                <div className="p-3 rounded-xl bg-slate-800/40 text-slate-400 text-xs w-28 mr-auto animate-pulse flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-electric rounded-full animate-ping" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            {/* Chat input form */}
            <form onSubmit={handleAISubmit} className="flex space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI: 'Generate Gate A wheelchair route'..."
                className="flex-1 glass-input text-xs"
              />
              <button 
                type="submit" 
                disabled={loadingAI}
                className="p-2.5 rounded-lg bg-mint-aurora hover:bg-cyan-electric text-[#020f0d] transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
