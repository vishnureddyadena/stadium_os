"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Shield, Activity, Flame, Users, Sparkles, Navigation, Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { useNavigationVoice } from '@/context/NavigationVoiceContext';

export const Stadium3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { liveData } = useWebSocket();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0.45);

  // Voice Context integration
  const { 
    activeRoute, 
    voiceStatus, 
    transcript, 
    messages, 
    startListening, 
    stopListening, 
    sendVoiceCommand,
    isSpeechSupported 
  } = useNavigationVoice();
  
  const [commandInput, setCommandInput] = useState('');

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandInput.trim()) {
      sendVoiceCommand(commandInput);
      setCommandInput('');
    }
  };
  const [tilt, setTilt] = useState(0.65);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle auto rotation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRotation(prev => (prev + 0.001) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Track canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI support
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Coordinate centers
    const cx = width / 2;
    const cy = height / 2 + 10;
    const rx = Math.min(width, height) * 0.35; // X radius
    const ry = rx * tilt; // Y radius (tilted perspective)

    // Helper: translate 3D space to 2D screen coordinates
    const project = (x3d: number, y3d: number, z3d: number) => {
      // Rotate x & y around Z axis
      const rx = x3d * Math.cos(rotation) - y3d * Math.sin(rotation);
      const ry = x3d * Math.sin(rotation) + y3d * Math.cos(rotation);
      // Project with tilt
      return {
        x: cx + rx,
        y: cy + (ry * tilt) - z3d
      };
    };

    // Draw mesh ground grid
    ctx.strokeStyle = 'rgba(115, 255, 216, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 400;
    const gridDiv = 14;
    for (let i = -gridDiv; i <= gridDiv; i++) {
      const step = (gridSize / gridDiv) * i;
      
      const p1 = project(step, -gridSize, 0);
      const p2 = project(step, gridSize, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = project(-gridSize, step, 0);
      const p4 = project(gridSize, step, 0);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // Draw central pitch
    ctx.strokeStyle = '#73FFD8';
    ctx.fillStyle = 'rgba(6, 41, 37, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const pw = 80;
    const ph = 50;
    const pitchCorner1 = project(-pw, -ph, 0);
    const pitchCorner2 = project(pw, -ph, 0);
    const pitchCorner3 = project(pw, ph, 0);
    const pitchCorner4 = project(-pw, ph, 0);
    ctx.moveTo(pitchCorner1.x, pitchCorner1.y);
    ctx.lineTo(pitchCorner2.x, pitchCorner2.y);
    ctx.lineTo(pitchCorner3.x, pitchCorner3.y);
    ctx.lineTo(pitchCorner4.x, pitchCorner4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw center line and circle of pitch
    ctx.beginPath();
    const pMid1 = project(0, -ph, 0);
    const pMid2 = project(0, ph, 0);
    ctx.moveTo(pMid1.x, pMid1.y);
    ctx.lineTo(pMid2.x, pMid2.y);
    ctx.stroke();

    // Draw 3D Stadium rings (stands structure)
    const tiers = [
      { height: 10, offset: 1.1, color: 'rgba(12, 77, 69, 0.1)', border: 'rgba(115, 255, 216, 0.1)' },
      { height: 35, offset: 1.35, color: 'rgba(6, 41, 37, 0.15)', border: 'rgba(115, 255, 216, 0.15)' },
      { height: 60, offset: 1.6, color: 'rgba(5, 29, 26, 0.2)', border: 'rgba(0, 217, 255, 0.2)' }
    ];

    const anglesCount = 64;

    tiers.forEach((tier) => {
      // Lower rim
      ctx.beginPath();
      for (let i = 0; i <= anglesCount; i++) {
        const theta = (i / anglesCount) * Math.PI * 2;
        const x = Math.cos(theta) * rx * tier.offset;
        const y = Math.sin(theta) * ry * tier.offset;
        const p = project(x, y, tier.height - 10);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = tier.color;
      ctx.fill();
      ctx.strokeStyle = tier.border;
      ctx.stroke();

      // Vertical pillars
      const pillars = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
      pillars.forEach(angle => {
        const x = Math.cos(angle) * rx * tier.offset;
        const y = Math.sin(angle) * ry * tier.offset;
        const pBottom = project(x, y, 0);
        const pTop = project(x, y, tier.height);
        ctx.beginPath();
        ctx.moveTo(pBottom.x, pBottom.y);
        ctx.lineTo(pTop.x, pTop.y);
        ctx.stroke();
      });
    });

    // Draw Live Crowd Gates indicators on Stadium ring
    const gates = [
      { name: 'GATE_A', angle: 0, label: 'Gate A' },
      { name: 'GATE_B', angle: Math.PI * 0.5, label: 'Gate B' },
      { name: 'GATE_C', angle: Math.PI * 1.0, label: 'Gate C' },
      { name: 'GATE_PRESS', angle: Math.PI * 1.5, label: 'Media Gate' },
    ];

    gates.forEach(gate => {
      // Find crowd data
      const sensor = liveData?.crowd_sensors.find(s => s.section === gate.name);
      const density = sensor?.density_score || 0.3;
      const count = sensor?.count || 100;
      
      // Calculate color based on density status alerts
      let color = '#22C55E'; // Optimal Flow (Green)
      if (density > 0.75) color = '#EF4444'; // Critical Bottleneck/Security Risk (Red)
      else if (density > 0.4) color = '#F97316'; // High Capacity/Transit Delay (Orange)

      const x = Math.cos(gate.angle) * rx * 1.45;
      const y = Math.sin(gate.angle) * ry * 1.45;
      const p = project(x, y, 20);

      // Draw sensor anchor point
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Pulsing wave animations
      const time = Date.now() * 0.003;
      const pulseSize = 6 + (time % 1) * 15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 * (1 - (time % 1));
      ctx.stroke();

      // Draw connector line to badge
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y - 25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Check hover
      const dist = Math.hypot(mousePos.x - p.x, mousePos.y - (p.y - 25));
      const hovered = dist < 22;
      if (hovered && hoveredSection !== gate.name) {
        setHoveredSection(gate.name);
      }

      // Draw Badge Label
      ctx.fillStyle = hovered ? 'rgba(139, 92, 246, 0.95)' : 'rgba(17, 8, 37, 0.85)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const text = `${gate.label}: ${count}`;
      ctx.font = '9px Space Grotesk';
      const textWidth = ctx.measureText(text).width;
      
      ctx.beginPath();
      ctx.roundRect(p.x - textWidth/2 - 6, p.y - 37, textWidth + 12, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = hovered ? '#020f0d' : '#ffffff';
      ctx.fillText(text, p.x - textWidth/2, p.y - 26);
    });

    // Render voice route path if active
    if (activeRoute) {
      const nodeMap: Record<string, { angle: number; offset: number; z: number }> = {
        'GATE_A': { angle: 0, offset: 1.45, z: 20 },
        'GATE_B': { angle: Math.PI * 0.5, offset: 1.45, z: 20 },
        'GATE_C': { angle: Math.PI * 1.0, offset: 1.45, z: 20 },
        'GATE_PRESS': { angle: Math.PI * 1.5, offset: 1.45, z: 20 },
        'SECTOR_102': { angle: Math.PI * 0.2, offset: 1.2, z: 35 },
        'SECTOR_204': { angle: Math.PI * 0.7, offset: 1.2, z: 35 },
        'CONCOURSE_EAST': { angle: Math.PI * 1.7, offset: 1.2, z: 35 }
      };

      const startNode = nodeMap[activeRoute.start];
      const endNode = nodeMap[activeRoute.end];
      
      if (startNode && endNode) {
        ctx.beginPath();
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          // Interpolate angle, offset and Z height along the stadium ring profile
          const angle = startNode.angle + (endNode.angle - startNode.angle) * t;
          const offset = startNode.offset + (endNode.offset - startNode.offset) * t;
          const z = startNode.z + (endNode.z - startNode.z) * t;
          
          const x = Math.cos(angle) * rx * offset;
          const y = Math.sin(angle) * ry * offset;
          const p = project(x, y, z);
          
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        
        ctx.save();
        
        const pathColor = activeRoute.wheelchair ? '#10B981' : '#8B5CF6';
        const pathGlowColor = activeRoute.wheelchair ? 'rgba(16, 185, 129, 0.4)' : 'rgba(139, 92, 246, 0.4)';
        
        // Draw glow back path
        ctx.strokeStyle = pathGlowColor;
        ctx.lineWidth = 6 + Math.sin(Date.now() * 0.015) * 2;
        ctx.stroke();
        
        // Draw inner traveling dashes
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -((Date.now() / 45) % 14);
        ctx.stroke();
        
        ctx.restore();
        
        // Draw start / end nodes indicators
        const pStart = project(Math.cos(startNode.angle)*rx*startNode.offset, Math.sin(startNode.angle)*ry*startNode.offset, startNode.z);
        const pEnd = project(Math.cos(endNode.angle)*rx*endNode.offset, Math.sin(endNode.angle)*ry*endNode.offset, endNode.z);
        
        // Pulsing Start (Cyan)
        ctx.beginPath();
        ctx.arc(pStart.x, pStart.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#00D9FF';
        ctx.fill();
        
        // Pulsing End (Orange)
        ctx.beginPath();
        ctx.arc(pEnd.x, pEnd.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FF5722';
        ctx.fill();
      }
    }

  }, [rotation, tilt, liveData, mousePos, hoveredSection, activeRoute]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    
    // Slight tilt offset
    const height = rect.height;
    const width = rect.width;
    setTilt(0.5 + (y / height) * 0.3);
  };

  const getHoveredDetails = () => {
    if (!hoveredSection || !liveData) return null;
    const sensor = liveData.crowd_sensors.find(s => s.section === hoveredSection);
    return sensor;
  };

  const hoveredDetails = getHoveredDetails();

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 bg-[#031412]/85 glass-panel rounded-2xl overflow-hidden p-6 border-mint-aurora/10">
      
      {/* 3D Canvas Side */}
      <div className="relative flex-1 h-[320px] lg:h-[350px]">
        {/* HUD Header */}
        <div className="absolute top-0 left-0 z-10 flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-cyan-electric rounded-full animate-ping" />
          <span className="text-xs font-display tracking-widest text-mint-aurora font-semibold">DIGITAL TWIN: 3D DECK</span>
        </div>

        <div className="absolute top-0 right-0 z-10 flex space-x-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-light/40 border border-mint-aurora/10 text-slate-300">
            Zoom: 100%
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-light/40 border border-mint-aurora/10 text-slate-300">
            Rotation: Active
          </span>
        </div>

        {/* 3D Canvas */}
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredSection(null)}
          className="w-full h-full cursor-crosshair"
        />

        {/* Hover Info Badge Overlay */}
        {hoveredDetails && (
          <div className="absolute bottom-0 left-0 right-0 glass-panel border-cyan-electric/20 rounded-xl p-3 flex items-center justify-between animate-fadeIn z-20">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${hoveredDetails.density_score > 0.75 ? 'bg-orange-cyber/20 text-orange-cyber' : hoveredDetails.density_score > 0.4 ? 'bg-gold-solar/20 text-gold-solar' : 'bg-mint-aurora/20 text-mint-aurora'}`}>
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white font-display">
                  {hoveredDetails.gate || hoveredDetails.section} Turnstile status
                </h4>
                <p className="text-[10px] text-slate-400">
                  Density: {(hoveredDetails.density_score * 100).toFixed(0)}% | Velocity: {hoveredDetails.speed_m_s} m/s
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold font-display text-white">
                {hoveredDetails.count} <span className="text-[10px] text-slate-400 font-normal">fans</span>
              </span>
              <p className="text-[9px] text-cyan-electric font-semibold uppercase tracking-wider">
                {hoveredDetails.density_score > 0.75 ? 'AI: REDIRECT REQ' : 'AI: STEADY'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Voice Assistant HUD Panel */}
      <div className="w-full xl:w-80 bg-[#062925]/60 border border-mint-aurora/15 rounded-xl p-4 flex flex-col h-[320px] lg:h-[350px] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-mint-aurora/10 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              voiceStatus === 'listening' 
                ? 'bg-orange-cyber animate-pulse shadow-[0_0_8px_#FF5722]' 
                : voiceStatus === 'speaking' 
                  ? 'bg-mint-aurora animate-ping' 
                  : 'bg-slate-500'
            }`} />
            <span className="text-[10px] font-bold tracking-wider text-white uppercase font-display">
              Voice Assistant ({voiceStatus.toUpperCase()})
            </span>
          </div>
          <span className="text-[9px] text-cyan-electric font-mono">
            {isSpeechSupported ? 'Web Speech API' : 'Text Fallback'}
          </span>
        </div>

        {/* Transcripts history */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2 scrollbar-thin max-h-[220px]">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`p-2 rounded-lg text-[10px] leading-normal ${
                msg.sender === 'user' 
                  ? 'bg-cyan-electric/10 border border-cyan-electric/20 ml-auto max-w-[85%] text-slate-200' 
                  : 'bg-emerald-light/40 border border-mint-aurora/10 mr-auto max-w-[85%] text-slate-300'
              }`}
            >
              <span className="font-bold text-[8px] uppercase tracking-wider block text-slate-400 mb-0.5 font-sans">
                {msg.sender === 'user' ? 'Operator Command' : 'AI Assistant'}
              </span>
              <p className="font-sans">{msg.text}</p>
            </div>
          ))}
          {voiceStatus === 'listening' && (
            <div className="p-2 rounded-lg bg-emerald-light/20 border border-mint-aurora/5 text-[10px] mr-auto max-w-[85%] text-slate-400 animate-pulse font-sans">
              Listening for voice command...
            </div>
          )}
        </div>

        {/* Controls footer */}
        <div className="flex space-x-1.5 items-center pt-2 border-t border-mint-aurora/10">
          <button
            onClick={voiceStatus === 'listening' ? stopListening : startListening}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
              voiceStatus === 'listening' 
                ? 'bg-orange-cyber text-[#020f0d] animate-pulse shadow-[0_0_10px_#FF5722]' 
                : 'bg-mint-aurora hover:bg-cyan-electric text-[#020f0d]'
            }`}
            title={voiceStatus === 'listening' ? "Stop Listening" : "Start Voice Assistant"}
          >
            {voiceStatus === 'listening' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <form onSubmit={handleCommandSubmit} className="flex-1 flex space-x-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={isSpeechSupported ? "Or type command..." : "Type: 'Gate A to Sector 102'..."}
              className="flex-1 px-2.5 py-1 text-[10px] bg-emerald-dark/70 border border-mint-aurora/10 rounded-md focus:outline-none focus:border-mint-aurora/30 text-white font-sans"
            />
            <button 
              type="submit"
              className="p-1.5 rounded-md bg-mint-aurora/20 border border-mint-aurora/30 text-mint-aurora hover:bg-mint-aurora hover:text-[#020f0d] transition-all flex items-center justify-center"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

