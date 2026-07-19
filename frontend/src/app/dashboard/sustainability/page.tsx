"use client";

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { useWebSocket } from '@/context/WebSocketContext';
import { Leaf, RefreshCw, Zap, Droplet, Trash2, Gauge, Sparkles } from 'lucide-react';

export default function Sustainability() {
  const { liveData } = useWebSocket();
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [metrics, setMetrics] = useState<any>(null);
  
  const [energyHistory, setEnergyHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sustainability Metric Submission Form State
  const [logCategory, setLogCategory] = useState('ENERGY');
  const [logValue, setLogValue] = useState('');
  const [logUnit, setLogUnit] = useState('kWh');
  const [logStatusMsg, setLogStatusMsg] = useState('');

  const handleCategoryChange = (val: string) => {
    setLogCategory(val);
    if (val === 'ENERGY') setLogUnit('kWh');
    else if (val === 'WATER') setLogUnit('Liters');
    else if (val === 'WASTE') setLogUnit('kg');
    else if (val === 'CARBON') setLogUnit('kg_CO2');
  };

  const handleLogMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logValue) return;
    setLogStatusMsg('Transmitting telemetry to carbon ledger...');
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/sustainability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: logCategory,
          value: Number(logValue),
          unit: logUnit
        })
      });
      if (response.ok) {
        setLogStatusMsg('Metric logged successfully!');
        setLogValue('');
        fetchAdvisorData();
        fetchChartHistory();
        setTimeout(() => setLogStatusMsg(''), 3000);
      } else {
        setLogStatusMsg('Failed to log sustainability metric.');
      }
    } catch (err) {
      console.error(err);
      setLogStatusMsg('Connection error.');
    }
  };

  const fetchAdvisorData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('stadium_token');
      // Fetch stats and advice
      const response = await fetch('http://localhost:8000/api/v1/ai/sustainability-advisor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.stats);
        setAiAdvice(data.advice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchChartHistory = async () => {
    try {
      const token = localStorage.getItem('stadium_token');
      // Fetch energy log history
      const response = await fetch('http://localhost:8000/api/v1/modules/sustainability/history?category=ENERGY', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEnergyHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
    fetchChartHistory();
  }, []);

  // Update stats from WebSocket if available
  const displayMetrics = liveData?.sustainability || metrics || {
    energy: { value: 1850.8, unit: 'kWh' },
    water: { value: 11800.0, unit: 'Liters' },
    waste: { value: 480.0, unit: 'kg' },
    carbon: { value: 188.7, unit: 'kg_CO2' }
  };

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-mint-aurora/10">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">CARBON & INFRASTRUCTURE SUSTAINABILITY</h2>
          <p className="text-xs text-slate-400 mt-1">
            Resource Diagnostics, HVAC Load Optimization, Carbon Mitigations & AI Conservation Models
          </p>
        </div>
        
        <button
          onClick={fetchAdvisorData}
          disabled={refreshing}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-emerald-light/40 border border-mint-aurora/10 hover:border-mint-aurora/30 text-mint-aurora font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Analyzing logs...' : 'Audit Grid Settings'}</span>
        </button>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Energy */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-mint-aurora/10">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HVAC & Grid Power</span>
            <h3 className="text-2xl font-black text-white font-display mt-1">
              {displayMetrics.energy.value.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{displayMetrics.energy.unit}</span>
            </h3>
            <span className="text-[10px] text-mint-aurora font-medium mt-1 inline-block">100% solar batteries backup ready</span>
          </div>
          <div className="p-3.5 bg-mint-aurora/15 text-mint-aurora rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Water */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-cyan-electric/10">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Water Refill Capacity</span>
            <h3 className="text-2xl font-black text-white font-display mt-1">
              {displayMetrics.water.value.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{displayMetrics.water.unit}</span>
            </h3>
            <span className="text-[10px] text-cyan-electric font-medium mt-1 inline-block">Restroom graywater filtration online</span>
          </div>
          <div className="p-3.5 bg-cyan-electric/15 text-cyan-electric rounded-2xl">
            <Droplet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Waste */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-indigo-royal/10">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Waste Sorting Index</span>
            <h3 className="text-2xl font-black text-white font-display mt-1">
              {displayMetrics.waste.value.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{displayMetrics.waste.unit}</span>
            </h3>
            <span className="text-[10px] text-indigo-royal font-medium mt-1 inline-block">Recyclables sorting: 84% accuracy</span>
          </div>
          <div className="p-3.5 bg-indigo-royal/15 text-indigo-royal rounded-2xl">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Carbon */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-orange-cyber/10">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Carbon Emissions</span>
            <h3 className="text-2xl font-black text-white font-display mt-1">
              {displayMetrics.carbon.value.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg CO₂e</span>
            </h3>
            <span className="text-[10px] text-orange-cyber font-medium mt-1 inline-block">Transit offset reduction: -12.4%</span>
          </div>
          <div className="p-3.5 bg-orange-cyber/15 text-orange-cyber rounded-2xl">
            <Gauge className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: AI advisor & History chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI sustainability advisor */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 border-mint-aurora/15 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-mint-aurora" />
                <span>GenAI Sustainability Insights</span>
              </h4>
              
              {aiAdvice ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-dark/50 border border-mint-aurora/5 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {aiAdvice}
                  </div>
                  
                  <div className="text-[10px] text-slate-400 border-t border-mint-aurora/5 pt-4">
                    💡 **AI Tip:** HVAC systems represent 64% of total matchday electrical draws. Activating the economizer cycles during pre-match venting saves up to 450 kWh.
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-mint-aurora border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="mt-6">
              <button 
                onClick={fetchAdvisorData}
                className="w-full py-2.5 bg-gradient-to-r from-mint-aurora to-cyan-electric text-[#020f0d] font-bold rounded-xl text-xs hover:brightness-110 transition-all"
              >
                Recalibrate Smart Valve Reserves
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Historical visual graph logs */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl h-full">
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider mb-6">
              Hourly Power Consumption (Last 24 Hours)
            </h4>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-mint-aurora border-t-transparent rounded-full animate-spin" />
              </div>
            ) : energyHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No logs written. Energy meter starting shortly.
              </div>
            ) : (
              <div className="space-y-6">
                
                 {/* SVG Visual Bar chart */}
                 <div className="h-[200px] w-full flex items-end justify-between space-x-1.5 pt-4 overflow-hidden px-1">
                   {energyHistory.slice(-8).map((item, idx) => {
                     const maxVal = Math.max(...energyHistory.slice(-8).map(i => i.value));
                     const percentage = (item.value / maxVal) * 100;
                     
                     return (
                       <div key={item.id} className="flex-1 min-w-0 flex flex-col items-center h-full justify-end group">
                         {/* Tooltip on hover */}
                         <span className="opacity-0 group-hover:opacity-100 bg-slate-900 border border-mint-aurora/10 text-[9px] font-mono text-white px-1.5 py-0.5 rounded mb-1 transition-opacity">
                           {item.value}kW
                         </span>
                         {/* Bar */}
                         <div 
                           className="w-full max-w-[28px] bg-gradient-to-t from-mint-aurora to-cyan-electric rounded-t transition-all duration-1000"
                           style={{ height: `${percentage * 0.7}%` }}
                         />
                         {/* Timestamp label */}
                         <span className="text-[8px] text-slate-400 font-mono mt-2 truncate max-w-full">
                           {new Date(item.recorded_at).toLocaleTimeString([], {hour: '2-digit'})}
                         </span>
                       </div>
                     );
                   })}
                 </div>

                <div className="flex items-center justify-between text-xs border-t border-mint-aurora/10 pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 bg-mint-aurora rounded" />
                      <span className="text-slate-400 text-[10px]">Active Load</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 bg-slate-700 rounded" />
                      <span className="text-slate-400 text-[10px]">Baseline Peak</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-electric font-bold font-mono">Telemetry feed: 1-hour intervals</span>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

      {/* Vendor Concession Resource Log Form */}
      <div className="mt-8 glass-panel p-6 border-mint-aurora/10 rounded-2xl max-w-2xl">
        <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Leaf className="w-5 h-5 text-mint-aurora" />
          <span>Vendor Concession Resource Logger</span>
        </h4>
        <p className="text-xs text-slate-400 mb-4 font-sans">
          Concessionaires, vendors, and operations staff can submit their hourly resource usage metrics to update the stadium carbon index and sustainability telemetry graphs.
        </p>

        <form onSubmit={handleLogMetric} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Metric Category
            </label>
            <select
              value={logCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full glass-input text-xs"
            >
              <option value="ENERGY">HVAC / Power (ENERGY)</option>
              <option value="WATER">Water Inflow (WATER)</option>
              <option value="WASTE">Solid Recycled (WASTE)</option>
              <option value="CARBON">Carbon Mitigation (CARBON)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Metric Value
            </label>
            <input
              type="number"
              required
              value={logValue}
              onChange={(e) => setLogValue(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Unit
            </label>
            <input
              type="text"
              disabled
              value={logUnit}
              className="w-full glass-input text-xs bg-slate-900/60 text-slate-400 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-mint-aurora to-cyan-electric text-background font-bold rounded-xl text-xs hover:brightness-110 transition-all"
          >
            Log Metric
          </button>
        </form>
        {logStatusMsg && <p className="text-[10px] text-cyan-electric mt-2 font-mono">{logStatusMsg}</p>}
      </div>

    </DashboardShell>
  );
}
