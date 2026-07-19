"use client";

import React, { useState } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { 
  QrCode, Sparkles, Navigation, Languages, Eye, AlertTriangle, CheckCircle, ShieldAlert,
  Smartphone, Volume2, ShieldCheck
} from 'lucide-react';

export default function FanCompanion() {
  
  // 1. Ticket Scan scanner states
  const [ticketNo, setTicketNo] = useState('TICKET-2026-FIFA-001');
  const [scanGate, setScanGate] = useState('GATE_A');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  // 2. AI Seat Upgrade states
  const [upgradeTicketNo, setUpgradeTicketNo] = useState('TICKET-2026-FIFA-001');
  const [upgradeSection, setUpgradeSection] = useState('SEC204');
  const [upgradeOutput, setUpgradeOutput] = useState<string | null>(null);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  // 3. AI Route planner states
  const [routeStart, setRouteStart] = useState('Gate A');
  const [routeEnd, setRouteEnd] = useState('Sector 102');
  const [wheelchairAccess, setWheelchairAccess] = useState(false);
  const [routeOutput, setRouteOutput] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // 4. AI Translation states
  const [translateText, setTranslateText] = useState('Attention all fans, please have your digital QR codes ready on your screens before reaching the turnstiles to ensure speedy entry.');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translationOutput, setTranslationOutput] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  // Fan Incident/Feedback Reporter States
  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incLoc, setIncLoc] = useState('');
  const [incCategory, setIncCategory] = useState('SECURITY');
  const [incSeverity, setIncSeverity] = useState('LOW');
  const [reporterStatusMsg, setReporterStatusMsg] = useState('');

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle || !incDesc || !incLoc) return;
    setReporterStatusMsg('Filing dispatch brief to safety team...');
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: incTitle,
          description: incDesc,
          category: incCategory,
          severity: incSeverity,
          location: incLoc
        })
      });
      if (response.ok) {
        setReporterStatusMsg('Incident filed! Stadium stewards dispatched.');
        setIncTitle('');
        setIncDesc('');
        setIncLoc('');
        setTimeout(() => setReporterStatusMsg(''), 4000);
      } else {
        setReporterStatusMsg('Failed to log report.');
      }
    } catch (err) {
      console.error(err);
      setReporterStatusMsg('Network link error.');
    }
  };

  // Trigger QR scan check
  const handleTicketScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    setScanResult(null);
    
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('stadium_token');
        const res = await fetch('http://localhost:8000/api/v1/modules/tickets/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ticket_no: ticketNo, gate: scanGate }),
        });
        
        const data = await res.json();
        if (res.ok) {
          setScanResult(data);
        } else {
          setScanResult({
            status: "ERROR",
            message: data.detail || "Verification failed."
          });
        }
      } catch (err) {
        setScanResult({
          status: "ERROR",
          message: "Could not link to verification server."
        });
      } finally {
        setScanning(false);
      }
    }, 1500);
  };

  // Trigger Seat Upgrade pitch
  const handleSeatUpgrade = async () => {
    setLoadingUpgrade(true);
    setUpgradeOutput(null);
    
    try {
      const token = localStorage.getItem('stadium_token');
      const res = await fetch('http://localhost:8000/api/v1/ai/seat-upgrade', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticket_no: upgradeTicketNo, section: upgradeSection }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUpgradeOutput(data.recommendation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpgrade(false);
    }
  };

  // Trigger Route plan
  const handleRoutePlan = async () => {
    setLoadingRoute(true);
    setRouteOutput(null);
    
    try {
      const token = localStorage.getItem('stadium_token');
      const res = await fetch('http://localhost:8000/api/v1/ai/route-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ start: routeStart, end: routeEnd, wheelchair: wheelchairAccess }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setRouteOutput(data.route);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Trigger Translation
  const handleTranslateText = async () => {
    setLoadingTranslation(true);
    setTranslationOutput(null);
    
    try {
      const token = localStorage.getItem('stadium_token');
      const res = await fetch('http://localhost:8000/api/v1/ai/translate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: translateText, target_language: targetLang }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setTranslationOutput(data.translated_text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTranslation(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Mobile Shell Mock */}
        <div className="w-full lg:w-[380px] flex-shrink-0 flex justify-center">
          <div className="w-full max-w-[360px] h-[720px] rounded-[40px] border-[12px] border-slate-900 bg-background relative shadow-2xl overflow-y-auto overflow-x-hidden flex flex-col justify-between scrollbar-none">
            
            {/* Phone speaker/camera notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Mobile Content Screen */}
            <div className="p-5 pt-8 flex-1 space-y-6">
              
              {/* Branding header */}
              <div className="flex items-center justify-between border-b border-mint-aurora/10 pb-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white font-display leading-none">FIFA Companion</h3>
                  <span className="text-[8px] text-cyan-electric uppercase tracking-wider font-mono">DALLAS STADIUM OS</span>
                </div>
                <div className="p-1 rounded bg-mint-aurora/10 text-mint-aurora">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Mobile Card: QR Ticket Scanning simulation */}
              <div className="p-4 rounded-2xl bg-emerald-dark/70 border border-mint-aurora/10 space-y-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                  <QrCode className="w-4 h-4 text-mint-aurora" />
                  <span>Gate Access Ticket Scanner</span>
                </h4>

                <form onSubmit={handleTicketScan} className="space-y-3">
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Ticket Code Signature</label>
                    <input 
                      type="text" 
                      value={ticketNo} 
                      onChange={e => setTicketNo(e.target.value)} 
                      placeholder="TICKET-2026-FIFA-001" 
                      className="w-full glass-input text-[10px] py-1.5 px-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Turnstile Gate</label>
                    <select
                      value={scanGate}
                      onChange={e => setScanGate(e.target.value)}
                      className="w-full glass-input text-[10px] py-1.5 px-2"
                    >
                      <option value="GATE_A">Gate A (General East)</option>
                      <option value="GATE_B">Gate B (General West)</option>
                      <option value="GATE_PRESS">Media Gate (VIP Press)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={scanning}
                    className="w-full py-2 bg-gradient-to-r from-mint-aurora to-cyan-electric text-[#020f0d] font-bold text-[10px] rounded-xl hover:brightness-110 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>{scanning ? 'Decoding Security Hash...' : 'Scan Gate Access QR'}</span>
                  </button>
                </form>

                {/* Scan Result */}
                {scanResult && (
                  <div className={`p-3 rounded-xl text-[10px] leading-relaxed border animate-fadeIn ${
                    scanResult.status === 'APPROVED' 
                      ? 'bg-mint-aurora/10 border-mint-aurora text-mint-aurora' 
                      : scanResult.status === 'FRAUD_DETECTED'
                      ? 'bg-orange-cyber/10 border-orange-cyber text-orange-cyber'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}>
                    <div className="flex items-center space-x-1 mb-1 font-bold">
                      {scanResult.status === 'APPROVED' ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      )}
                      <span>Result: {scanResult.status}</span>
                    </div>
                    <p className="font-medium text-[9px]">{scanResult.message}</p>
                    {scanResult.ticket && (
                      <div className="mt-2 text-[8px] text-slate-400 font-mono">
                        Seat: {scanResult.ticket.seat} | Tier: {scanResult.ticket.tier}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Card: Quick Navigation Links */}
              <div className="p-3.5 rounded-2xl bg-emerald-light/20 border border-mint-aurora/5 text-center text-xs space-y-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Operational quick links</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-emerald-dark/50 border border-mint-aurora/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white">Zone C-East</span>
                    <span className="text-[8px] text-slate-500">Restroom Available</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-dark/50 border border-mint-aurora/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white">Sector 102</span>
                    <span className="text-[8px] text-slate-500">Charging Station</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Phone bottom bar */}
            <div className="h-10 border-t border-slate-900 bg-slate-950 flex items-center justify-center z-20">
              <div className="w-24 h-1 bg-slate-800 rounded-full" />
            </div>

          </div>
        </div>

        {/* Right Side: Interactive AI Forms */}
        <div className="flex-1 space-y-6">
          
          {/* AI Route Planner */}
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-mint-aurora" />
              <span>AI Dynamic Route & Wheelchair Generator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Starting Point</label>
                <input 
                  type="text" 
                  value={routeStart} 
                  onChange={e => setRouteStart(e.target.value)} 
                  className="w-full glass-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Destination Stand</label>
                <input 
                  type="text" 
                  value={routeEnd} 
                  onChange={e => setRouteEnd(e.target.value)} 
                  className="w-full glass-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <input 
                type="checkbox" 
                id="wheelchair-toggle" 
                checked={wheelchairAccess} 
                onChange={e => setWheelchairAccess(e.target.checked)} 
                className="w-4 h-4 bg-emerald-dark rounded border-mint-aurora/20 focus:ring-0 text-cyan-electric"
              />
              <label htmlFor="wheelchair-toggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Generate Wheelchair Accessible route (Avoid stairs, elevate ADA platforms)
              </label>
            </div>

            <button
              onClick={handleRoutePlan}
              disabled={loadingRoute}
              className="px-4 py-2 bg-mint-aurora hover:bg-cyan-electric text-background font-bold text-xs rounded-xl transition-all"
            >
              {loadingRoute ? 'Plotting Obstacles...' : 'Generate Route directions'}
            </button>

            {routeOutput && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-dark/50 border border-mint-aurora/10 text-xs text-slate-300 whitespace-pre-line font-mono">
                {routeOutput}
              </div>
            )}
          </div>

          {/* AI Seat Upgrade recommendations */}
          <div className="glass-panel p-6 border-cyan-electric/15 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-electric" />
              <span>AI Seat Upgrade Recommendation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Ticket Number</label>
                <input 
                  type="text" 
                  value={upgradeTicketNo} 
                  onChange={e => setUpgradeTicketNo(e.target.value)} 
                  className="w-full glass-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Current Section</label>
                <input 
                  type="text" 
                  value={upgradeSection} 
                  onChange={e => setUpgradeSection(e.target.value)} 
                  className="w-full glass-input text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSeatUpgrade}
              disabled={loadingUpgrade}
              className="px-4 py-2 bg-gradient-to-r from-mint-aurora to-cyan-electric text-background font-bold text-xs rounded-xl transition-all"
            >
              {loadingUpgrade ? 'Scanning VIP inventory...' : 'Fetch Upgrade Pitch'}
            </button>

            {upgradeOutput && (
              <div className="mt-4 p-4 rounded-xl bg-indigo-royal/10 border border-indigo-royal/20 text-xs text-slate-300 whitespace-pre-line">
                {upgradeOutput}
              </div>
            )}
          </div>

          {/* AI Translator */}
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
              <Languages className="w-5 h-5 text-mint-aurora" />
              <span>AI Real-time Translation Hub</span>
            </h3>

            <div className="mb-4">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Text to Translate</label>
              <textarea 
                value={translateText} 
                onChange={e => setTranslateText(e.target.value)} 
                rows={2}
                className="w-full glass-input text-xs"
              />
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <label className="text-xs text-slate-400 font-semibold">Target Language:</label>
              <select
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
                className="glass-input text-xs py-1 px-3"
              >
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Portuguese">Portuguese (Português)</option>
              </select>
            </div>

            <button
              onClick={handleTranslateText}
              disabled={loadingTranslation}
              className="px-4 py-2 bg-mint-aurora hover:bg-cyan-electric text-background font-bold text-xs rounded-xl transition-all"
            >
              {loadingTranslation ? 'Translating context...' : 'Translate Announcement'}
            </button>

            {translationOutput && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-dark/50 border border-mint-aurora/10 text-xs text-slate-300 font-sans whitespace-pre-line">
                {translationOutput}
              </div>
            )}
          </div>

          {/* Fan Feedback & Incident Reporter Card */}
          <div className="glass-panel p-6 border-cyan-electric/20 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-cyber animate-pulse" />
              <span>Report Local Hazard / Issue</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              Encountered a spill, broken seat, security problem, or medical hazard? Report it directly to stadium stewards and operations crew.
            </p>

            <form onSubmit={handleReportIncident} className="space-y-3">
              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Issue Summary</label>
                <input
                  type="text"
                  required
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder="e.g. Water spill on stairs"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Where is it located?</label>
                <input
                  type="text"
                  required
                  value={incLoc}
                  onChange={(e) => setIncLoc(e.target.value)}
                  placeholder="e.g. Sector 102 Row 14"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Category Type</label>
                <select
                  value={incCategory}
                  onChange={(e) => setIncCategory(e.target.value)}
                  className="w-full glass-input text-[10px] py-1 px-2"
                >
                  <option value="SECURITY">SECURITY / CROWD ISSUE</option>
                  <option value="MEDICAL">MEDICAL ASSISTANCE</option>
                  <option value="MAINTENANCE">SPILL / INFRASTRUCTURE</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Description details</label>
                <textarea
                  required
                  rows={2}
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  placeholder="Provide any visual details to help stewards locate the issue..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-mint-aurora to-cyan-electric text-[#020f0d] font-bold text-xs rounded-xl transition-all"
              >
                File Report
              </button>
              {reporterStatusMsg && <p className="text-[9px] text-cyan-electric text-center font-mono mt-1">{reporterStatusMsg}</p>}
            </form>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
