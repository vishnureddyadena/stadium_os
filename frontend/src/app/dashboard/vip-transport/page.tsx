"use client";

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { useWebSocket } from '@/context/WebSocketContext';
import { Bus, Car, Star, Users, MapPin, Sparkles, RefreshCw, Send } from 'lucide-react';

interface TransportRoute {
  id: number;
  route_name: string;
  type: string;
  delay_minutes: number;
  status: string;
  driver_contact: string;
}

interface ParkingSector {
  id: number;
  sector: string;
  total_spots: number;
  occupied_spots: number;
  reserve_spots: number;
  EV_charger_spots: number;
  sensor_status: string;
  ai_prediction_score: number;
}

export default function VIPTransport() {
  const { liveData } = useWebSocket();
  
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [parkingSectors, setParkingSectors] = useState<ParkingSector[]>([]);
  const [loading, setLoading] = useState(true);

  // Shuttle Booking Form State
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState('SHUTTLE');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [routeStatus, setRouteStatus] = useState('NORMAL');
  const [driverContact, setDriverContact] = useState('');
  const [bookingStatusMsg, setBookingStatusMsg] = useState('');

  // Parking Sector Update Form State
  const [selectedSectorName, setSelectedSectorName] = useState('LOT_A_VIP');
  const [newOccupiedSpots, setNewOccupiedSpots] = useState(150);
  const [parkingStatusMsg, setParkingStatusMsg] = useState('');

  const handleBookShuttle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName || !driverContact) return;
    setBookingStatusMsg('Registering route on blockchain ledger...');
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/transport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          route_name: routeName,
          type: routeType,
          delay_minutes: Number(delayMinutes),
          status: routeStatus,
          driver_contact: driverContact
        })
      });
      if (response.ok) {
        setBookingStatusMsg('Route registry verified and added!');
        setRouteName('');
        setDriverContact('');
        fetchTransportAndParking();
        setTimeout(() => setBookingStatusMsg(''), 3000);
      } else {
        setBookingStatusMsg('Failed to register transport route.');
      }
    } catch (err) {
      console.error(err);
      setBookingStatusMsg('Connection error.');
    }
  };

  const handleUpdateParkingSpots = async (e: React.FormEvent) => {
    e.preventDefault();
    setParkingStatusMsg('Updating lot status indicators...');
    try {
      const token = localStorage.getItem('stadium_token');
      const response = await fetch('http://localhost:8000/api/v1/modules/parking/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sector: selectedSectorName,
          occupied_spots: Number(newOccupiedSpots)
        })
      });
      if (response.ok) {
        setParkingStatusMsg('Capacity indicators updated!');
        fetchTransportAndParking();
        setTimeout(() => setParkingStatusMsg(''), 3000);
      } else {
        setParkingStatusMsg('Failed to update parking spots.');
      }
    } catch (err) {
      console.error(err);
      setParkingStatusMsg('Connection error.');
    }
  };

  // AI Optimizer States
  const [optimizerInput, setOptimizerInput] = useState('');
  const [optimizerOutput, setOptimizerOutput] = useState<string>('Select optimization mode below to analyze transport telemetry...');
  const [loadingAI, setLoadingAI] = useState(false);

  // VIP list seed (Static premium data for FIFA operations)
  const vipList = [
    { name: "Gianni Infantino", suite: "FIFA President Suite 1", transport: "Valet Limo-1", status: "ARRIVED" },
    { name: "Clint Dempsey", suite: "Legends VIP Suite 10", transport: "Shuttle V-4", status: "IN_TRANSIT" },
    { name: "Sir Kenny Dalglish", suite: "Match Sponsor Suite 4", transport: "Valet Escort-2", status: "ARRIVED" },
    { name: "Didier Drogba", suite: "Legends VIP Suite 12", transport: "Shuttle V-7", status: "PENDING" },
  ];

  const fetchTransportAndParking = async () => {
    try {
      const token = localStorage.getItem('stadium_token');
      // Fetch Transport
      const resT = await fetch('http://localhost:8000/api/v1/modules/transport', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resT.ok) {
        const dataT = await resT.json();
        setTransportRoutes(dataT);
      }
      
      // Fetch Parking
      const resP = await fetch('http://localhost:8000/api/v1/modules/parking', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resP.ok) {
        const dataP = await resP.json();
        setParkingSectors(dataP);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportAndParking();
  }, []);

  const handleRunOptimizer = async (type: string) => {
    setLoadingAI(true);
    setOptimizerOutput('AI models parsing active route telemetry and vehicle telemetry log matrices...');
    
    try {
      const token = localStorage.getItem('stadium_token');
      const promptText = type === 'parking' 
        ? "Evaluate lot occupancy parameters and generate parking lot optimization recommendations." 
        : "Evaluate active shuttle delays and generate shuttle schedule optimization routes.";
        
      const response = await fetch('http://localhost:8000/api/v1/ai/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (response.ok) {
        const data = await response.json();
        setOptimizerOutput(data.response);
      } else {
        setOptimizerOutput('Error running optimization solver.');
      }
    } catch (err) {
      setOptimizerOutput('Timeout connecting to AI router.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Sync state from websockets
  const routes = liveData?.transport || transportRoutes;
  const sectors = liveData?.parking || parkingSectors;

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-mint-aurora/10">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">VIP ARRIVALS & TRANSPORT INTELLIGENCE</h2>
          <p className="text-xs text-slate-400 mt-1">
            Metro Telemetry, Shuttle Dispatch Optimization, Parking Allotments & Protocol Registry
          </p>
        </div>
        
        <button
          onClick={fetchTransportAndParking}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-emerald-light/40 border border-mint-aurora/10 hover:border-mint-aurora/30 text-mint-aurora font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Transit and Parking */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Transit Routes list */}
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
              <Bus className="w-5 h-5 text-mint-aurora" />
              <span>Live Transit Route Monitors</span>
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-mint-aurora border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map(route => {
                  const isDelayed = route.delay_minutes > 5;
                  const isCongested = route.status === 'OVERCROWDED';
                  
                  return (
                    <div key={route.id} className="p-4 rounded-xl bg-emerald-dark/40 border border-mint-aurora/5 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white font-display">{route.route_name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Type: {route.type} | Contact: {route.driver_contact}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Delay: <strong className={isDelayed ? 'text-orange-cyber' : 'text-mint-aurora'}>{route.delay_minutes} mins</strong>
                        </p>
                      </div>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        isDelayed || isCongested ? 'bg-orange-cyber/20 text-orange-cyber' : 'bg-mint-aurora/20 text-mint-aurora'
                      }`}>
                        {route.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Parking sectors list */}
          <div className="glass-panel p-6 border-cyan-electric/15 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display mb-4 flex items-center space-x-2">
              <Car className="w-5 h-5 text-cyan-electric" />
              <span>Smart Parking Sector Statuses</span>
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-mint-aurora border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectors.map(sector => (
                  <div key={sector.id} className="p-4 rounded-xl bg-emerald-dark/40 border border-mint-aurora/5">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-white font-display">{sector.sector}</h4>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
                        sector.sensor_status === 'OPERATIONAL' ? 'bg-mint-aurora/20 text-mint-aurora' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sector.sensor_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      <div className="p-1 rounded bg-[#021210]">
                        <span className="text-[8px] text-slate-400 block font-semibold leading-none">Occupied</span>
                        <strong className="text-white mt-1 block font-mono">{sector.occupied_spots}</strong>
                      </div>
                      <div className="p-1 rounded bg-[#021210]">
                        <span className="text-[8px] text-slate-400 block font-semibold leading-none">Reserve</span>
                        <strong className="text-white mt-1 block font-mono">{sector.reserve_spots}</strong>
                      </div>
                      <div className="p-1 rounded bg-[#021210]">
                        <span className="text-[8px] text-slate-400 block font-semibold leading-none">EV Charging</span>
                        <strong className="text-white mt-1 block font-mono">{sector.EV_charger_spots}</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-mint-aurora/5 pt-2">
                      <span>Util Rate: {((sector.occupied_spots / sector.total_spots)*100).toFixed(0)}%</span>
                      <span className="text-cyan-electric font-semibold">AI Predict Capacity: {sector.ai_prediction_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dispatch Control Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form 1: Book/Add Shuttle Route */}
            <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display mb-4">
                ➕ Dispatch Premium Transit Route
              </h3>
              <form onSubmit={handleBookShuttle} className="space-y-3">
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Route Name</label>
                  <input
                    type="text"
                    required
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g. VIP Shuttle V-10"
                    className="w-full glass-input text-[10px] py-1.5 px-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Type</label>
                    <select
                      value={routeType}
                      onChange={(e) => setRouteType(e.target.value)}
                      className="w-full glass-input text-[10px] py-1.5 px-1"
                    >
                      <option value="SHUTTLE">SHUTTLE</option>
                      <option value="BUS">BUS</option>
                      <option value="METRO">METRO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Status</label>
                    <select
                      value={routeStatus}
                      onChange={(e) => setRouteStatus(e.target.value)}
                      className="w-full glass-input text-[10px] py-1.5 px-1"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="DELAYED">DELAYED</option>
                      <option value="OVERCROWDED">OVERCROWDED</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Delay (mins)</label>
                    <input
                      type="number"
                      required
                      value={delayMinutes}
                      onChange={(e) => setDelayMinutes(Number(e.target.value))}
                      className="w-full glass-input text-[10px] py-1.5 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Driver Contact</label>
                    <input
                      type="text"
                      required
                      value={driverContact}
                      onChange={(e) => setDriverContact(e.target.value)}
                      placeholder="+1-555-9999"
                      className="w-full glass-input text-[10px] py-1.5 px-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-mint-aurora hover:bg-cyan-electric text-[#020f0d] font-bold text-[10px] rounded-lg transition-all"
                >
                  Confirm Dispatch Route
                </button>
                {bookingStatusMsg && <p className="text-[9px] text-cyan-electric text-center mt-1">{bookingStatusMsg}</p>}
              </form>
            </div>

            {/* Form 2: Update Parking Lot Occupancy */}
            <div className="glass-panel p-6 border-cyan-electric/15 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display mb-4">
                🚗 Adjust Parking Lot Capacity
              </h3>
              <form onSubmit={handleUpdateParkingSpots} className="space-y-4">
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Select Sector</label>
                  <select
                    value={selectedSectorName}
                    onChange={(e) => setSelectedSectorName(e.target.value)}
                    className="w-full glass-input text-[10px] py-1.5 px-2"
                  >
                    <option value="LOT_A_VIP">LOT_A_VIP (VIP Lot)</option>
                    <option value="LOT_B_GENERAL">LOT_B_GENERAL (General Lot)</option>
                    <option value="LOT_C_SHUTTLES">LOT_C_SHUTTLES (Shuttle Lot)</option>
                    <option value="LOT_D_STAFF">LOT_D_STAFF (Staff Lot)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">New Occupied Spots Count</label>
                  <input
                    type="number"
                    required
                    value={newOccupiedSpots}
                    onChange={(e) => setNewOccupiedSpots(Number(e.target.value))}
                    className="w-full glass-input text-[10px] py-1.5 px-2 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-cyan-electric hover:bg-mint-aurora text-[#020f0d] font-bold text-[10px] rounded-lg transition-all"
                >
                  Sync Sector Telemetry
                </button>
                {parkingStatusMsg && <p className="text-[9px] text-cyan-electric text-center mt-1">{parkingStatusMsg}</p>}
              </form>
            </div>
            
          </div>

        </div>

        {/* Right Column: VIP List & AI Shuttle Optimizer */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Shuttle/Parking Optimizer Widget */}
          <div className="glass-panel p-6 border-mint-aurora/15 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-mint-aurora" />
              <span>AI Shuttle & Parking Optimizer</span>
            </h4>
            
            <div className="p-3.5 rounded-xl bg-emerald-dark/50 border border-mint-aurora/5 text-xs text-slate-300 font-mono mb-4 leading-relaxed max-h-[140px] overflow-y-auto">
              {optimizerOutput}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRunOptimizer('shuttle')}
                disabled={loadingAI}
                className="py-2.5 rounded-xl bg-indigo-royal text-white hover:brightness-110 font-semibold text-[10px] transition-all"
              >
                Optimize Shuttle Loops
              </button>
              <button
                onClick={() => handleRunOptimizer('parking')}
                disabled={loadingAI}
                className="py-2.5 rounded-xl bg-mint-aurora text-background hover:brightness-110 font-bold text-[10px] transition-all"
              >
                Re-Route Ramps Log
              </button>
            </div>
          </div>

          {/* VIP Registry */}
          <div className="glass-panel p-6 border-mint-aurora/10 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4 flex items-center space-x-2">
              <Star className="w-4 h-4 text-gold-solar" />
              <span>VIP Protocol Registry</span>
            </h4>
            
            <div className="space-y-3">
              {vipList.map((vip, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-900/60 border border-mint-aurora/5 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{vip.name}</h5>
                    <p className="text-[9px] text-slate-400 font-medium">{vip.suite} | {vip.transport}</p>
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold ${
                    vip.status === 'ARRIVED' ? 'bg-mint-aurora/20 text-mint-aurora' : vip.status === 'IN_TRANSIT' ? 'bg-gold-solar/20 text-gold-solar' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {vip.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
