"use client";

import React, { useState } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { Award, Monitor, Users, Sparkles, Send, Play, CheckCircle2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';


export default function SponsorMedia() {
  // Signage loops
  const [sponsors, setSponsors] = useState([
    { id: 1, name: "Visa", impression: 124500, activeBanner: "Visa Infinite FIFA Special", loopStatus: "PLAYING", screenId: "Scoreboard East" },
    { id: 2, name: "Qatar Airways", impression: 98000, activeBanner: "Fly to Qatar 2026 Promo", loopStatus: "PLAYING", screenId: "Scoreboard West" },
    { id: 3, name: "Hyundai", impression: 145000, activeBanner: "Hyundai IONIQ 5 Score Ring", loopStatus: "PAUSED", screenId: "Concourse Ring A" },
    { id: 4, name: "Coca-Cola", impression: 215000, activeBanner: "Coca-Cola Zero Refill Hour", loopStatus: "PLAYING", screenId: "Concourse Ring B" },
  ]);

  const [pushedScreen, setPushedScreen] = useState<string | null>(null);

  // Broadcast Alert Form State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [notifType, setNotifType] = useState('BROADCAST');
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState('');

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    setDispatchStatusMsg('Transmitting broadcast payload to gateway...');
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: broadcastMsg,
          target_role: targetRole,
          type: notifType
        })
      });
      if (response.ok) {
        setDispatchStatusMsg('Broadcast transmitted successfully!');
        setBroadcastMsg('');
        setTimeout(() => setDispatchStatusMsg(''), 3000);
      } else {
        setDispatchStatusMsg('Failed to transmit broadcast alert.');
      }
    } catch (err) {
      console.error(err);
      setDispatchStatusMsg('Connection error.');
    }
  };

  const handlePushToStadium = (sponsorName: string, banner: string) => {
    setPushedScreen(`${sponsorName} ad ("${banner}")`);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#73FFD8', '#00D9FF', '#4F46E5']
    });
    
    // Clear notification after 4s
    setTimeout(() => {
      setPushedScreen(null);
    }, 4000);
  };

  const handleToggleLoop = (id: number) => {
    setSponsors(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, loopStatus: s.loopStatus === 'PLAYING' ? 'PAUSED' : 'PLAYING' };
      }
      return s;
    }));
  };

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-mint-aurora/10">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">SPONSOR & DIGITAL SIGNAGE CENTER</h2>
          <p className="text-xs text-slate-400 mt-1">
            Scoreboard Ad Allocations, Real-time Signage Impression Logs & Press Center Seating
          </p>
        </div>
      </div>

      {/* Confetti pushed alert banner */}
      {pushedScreen && (
        <div className="mb-6 p-4 rounded-xl bg-mint-aurora/15 border border-mint-aurora/35 text-mint-aurora text-xs font-semibold flex items-center space-x-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-mint-aurora" />
          <span>🚀 DIGITAL SIGNAGE TRIGGERED: Successfully pushed <strong>{pushedScreen}</strong> to main Stadium Scoreboards!</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Signage manager */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
              Active Scoreboard Signage Slots
            </h3>
            <span className="text-xs text-slate-400">Total screens linked: 4</span>
          </div>

          <div className="space-y-4">
            {sponsors.map(sp => (
              <div key={sp.id} className="glass-panel p-5 rounded-2xl border-mint-aurora/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5 mb-1">
                    <Award className="w-4 h-4 text-cyan-electric" />
                    <h4 className="text-sm font-bold text-white font-display">{sp.name} <span className="text-[10px] text-slate-500 font-normal">| {sp.screenId}</span></h4>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">Active Loop Asset: <strong>"{sp.activeBanner}"</strong></p>
                  
                  <div className="flex space-x-4 text-[10px] text-slate-400">
                    <span>Active Impressions: <strong className="text-white font-mono">{sp.impression.toLocaleString()}</strong></span>
                    <span>Status: <strong className={sp.loopStatus === 'PLAYING' ? 'text-mint-aurora' : 'text-slate-500'}>{sp.loopStatus}</strong></span>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleLoop(sp.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-mint-aurora/5 hover:border-mint-aurora/20 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    {sp.loopStatus === 'PLAYING' ? 'Pause Ad Loop' : 'Resume Loop'}
                  </button>
                  
                  <button
                    onClick={() => handlePushToStadium(sp.name, sp.activeBanner)}
                    className="px-3.5 py-2 rounded-xl bg-mint-aurora hover:bg-cyan-electric text-background font-bold text-xs transition-all flex items-center space-x-1"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Push Scoreboard</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Press & Media analytics */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Analytics block */}
          <div className="glass-panel p-6 border-indigo-royal/20 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4">
              Matchday Analytics Center
            </h4>
            
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Fan Turnstile Entry Rate</span>
                <div className="flex justify-between items-baseline mb-1">
                  <strong className="text-white font-display text-lg">94.2%</strong>
                  <span className="text-mint-aurora text-[10px] font-semibold">Goal Achieved</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-mint-aurora" style={{ width: '94.2%' }} />
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Sponsor Board Playtime</span>
                <div className="flex justify-between items-baseline mb-1">
                  <strong className="text-white font-display text-lg">182 / 240 <span className="text-xs text-slate-500 font-normal">mins</span></strong>
                  <span className="text-cyan-electric text-[10px] font-semibold">Active</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-electric" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Media Suite Reservation */}
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4">
              Media Hub Press Center
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 flex items-center justify-between border border-mint-aurora/5">
                <div>
                  <h5 className="font-bold text-white">Press Stand Seat E-04</h5>
                  <p className="text-[10px] text-slate-400">Associated: Associated Press (AP)</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-mint-aurora/20 text-mint-aurora font-mono">OCCUPIED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 flex items-center justify-between border border-mint-aurora/5">
                <div>
                  <h5 className="font-bold text-white">Press Stand Seat E-12</h5>
                  <p className="text-[10px] text-slate-400">Associated: ESPN LatAm</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-mint-aurora/20 text-mint-aurora font-mono">OCCUPIED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 flex items-center justify-between border border-mint-aurora/5">
                <div>
                  <h5 className="font-bold text-white">Press Conference Box 2</h5>
                  <p className="text-[10px] text-slate-400">Associated: FIFA Media Board</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-cyber/20 text-orange-cyber font-mono">RESERVED</span>
              </div>
            </div>
          </div>

          {/* Matchday Broadcast Alert Dispatcher */}
          <div className="glass-panel p-6 border-cyan-electric/25 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-electric animate-pulse" />
              <span>Matchday Broadcast Dispatcher</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              Dispatch a critical announcement or operational broadcast directly to match terminals, stewards, security personnel, or fan companions.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Announcement Message</label>
                <textarea
                  required
                  rows={2}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. Kick-off delayed by 10 minutes due to weather..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Target Audience</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full glass-input text-[10px] py-1 px-2"
                  >
                    <option value="ALL">ALL (Public Broadcast)</option>
                    <option value="SECURITY">SECURITY ONLY</option>
                    <option value="MEDICAL">MEDICAL ONLY</option>
                    <option value="VOLUNTEER">VOLUNTEERS ONLY</option>
                    <option value="VIP">VIP SUITES ONLY</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Category Type</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full glass-input text-[10px] py-1 px-2"
                  >
                    <option value="BROADCAST">BROADCAST</option>
                    <option value="ALERT">ALERT</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-mint-aurora to-cyan-electric text-[#020f0d] font-bold text-xs rounded-xl transition-all"
              >
                Broadcast Alert
              </button>
              {dispatchStatusMsg && <p className="text-[9px] text-cyan-electric text-center font-mono mt-1">{dispatchStatusMsg}</p>}
            </form>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
