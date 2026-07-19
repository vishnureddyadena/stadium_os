"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
//  TYPE DEFINITIONS
// ─────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color: string;
  pulse?: boolean;
}

interface ProgressCardProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  icon: string;
  status: "optimal" | "warning" | "critical";
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  onClick: () => void;
}

interface TestimonialCardProps {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

// ─────────────────────────────────────────────
//  SUB COMPONENTS
// ─────────────────────────────────────────────

const LiquidBlob = ({
  style,
  color,
}: {
  style: React.CSSProperties;
  color: string;
}) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      ...style,
      background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
      filter: "blur(80px)",
      mixBlendMode: "screen",
    }}
  />
);

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color,
  pulse,
}) => (
  <div className="liquid-glass-card group cursor-pointer relative overflow-hidden p-5 rounded-2xl border transition-all duration-500 hover:-translate-y-2 hover:scale-105">
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${color}18 0%, transparent 70%)`,
      }}
    />
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      {pulse && (
        <span className="flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full opacity-75"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: color }}
          />
        </span>
      )}
    </div>
    <div className="text-3xl font-bold font-display" style={{ color }}>
      {value}
    </div>
    <div className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">
      {label}
    </div>
  </div>
);

const ProgressCard: React.FC<ProgressCardProps> = ({
  label,
  value,
  max,
  unit,
  color,
  icon,
  status,
}) => {
  const pct = Math.min((value / max) * 100, 100);
  const statusColors: Record<string, string> = {
    optimal: "#10B981",
    warning: "#F59E0B",
    critical: "#EF4444",
  };
  const statusLabels: Record<string, string> = {
    optimal: "OPTIMAL",
    warning: "WARNING",
    critical: "CRITICAL",
  };

  return (
    <div className="liquid-glass-card p-5 rounded-2xl border transition-all duration-500 hover:-translate-y-1 group cursor-pointer relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 h-0.5 transition-all duration-700 group-hover:opacity-100 opacity-60"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-semibold text-slate-200">{label}</span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            color: statusColors[status],
            borderColor: `${statusColors[status]}40`,
            background: `${statusColors[status]}12`,
          }}
        >
          {statusLabels[status]}
        </span>
      </div>
      <div className="flex items-end justify-between mb-3">
        <span className="text-2xl font-bold font-display" style={{ color }}>
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500">
          / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 relative"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
        >
          <div
            className="absolute right-0 top-0 h-full w-6 rounded-full animate-pulse"
            style={{ background: color, filter: "blur(4px)" }}
          />
        </div>
      </div>
      <div className="text-right text-xs text-slate-500 mt-1">
        {pct.toFixed(1)}%
      </div>
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  badge,
  gradient,
  onClick,
}) => (
  <div
    className="liquid-glass-card group cursor-pointer p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden"
    onClick={onClick}
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
      style={{ background: gradient }}
    />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: gradient, border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-slate-300 uppercase tracking-widest">
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2 font-display group-hover:text-cyan-300 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-cyan-400 text-xs font-semibold group-hover:gap-2 transition-all">
        <span>Explore Module</span>
        <span>→</span>
      </div>
    </div>
  </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  text,
  avatar,
}) => (
  <div className="liquid-glass-card p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 border border-white/10">
        {avatar}
      </div>
      <div>
        <div className="text-sm font-bold text-white">{name}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
      <div className="ml-auto text-yellow-400 text-xs">★★★★★</div>
    </div>
    <p className="text-sm text-slate-400 leading-relaxed italic">"{text}"</p>
  </div>
);

// ─────────────────────────────────────────────
//  ANIMATED COUNTER
// ─────────────────────────────────────────────
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

// ─────────────────────────────────────────────
//  LIVE TICKER
// ─────────────────────────────────────────────
const TICKER_ITEMS = [
  "🟢 Gate A — OPEN · Occupancy 87%",
  "🟡 Parking Lot P3 — 94% Full",
  "🔵 Metro Line 2 — On Schedule",
  "🔴 Incident #047 — Response Dispatched",
  "🟢 AI Shuttle S12 — Optimized Route Active",
  "⚡ Carbon Offset — 2.4 tonnes saved today",
  "🌐 Digital Twin — Live Sync Active",
  "🤖 Gemini AI — Processing 842 queries/min",
];

// ─────────────────────────────────────────────
//  MAIN LANDING PAGE
// ─────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [particleOpacity, setParticleOpacity] = useState(1);
  const [liveGate, setLiveGate] = useState(87);
  const [livePark, setLivePark] = useState(94);
  const [liveCarbon, setLiveCarbon] = useState(2.4);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const attendance = useCountUp(68450);
  const incidents = useCountUp(3);
  const shuttles = useCountUp(24);
  const uptime = useCountUp(99);

  // Live ticker (kept for internal state use, no longer shown in nav)
  useEffect(() => {
    const id = setInterval(
      () => setTickerIndex((i) => (i + 1) % TICKER_ITEMS.length),
      3000
    );
    return () => clearInterval(id);
  }, []);

  // Live data fluctuation
  useEffect(() => {
    const id = setInterval(() => {
      setLiveGate((v) => Math.min(99, Math.max(60, v + (Math.random() - 0.45) * 3)));
      setLivePark((v) => Math.min(100, Math.max(70, v + (Math.random() - 0.5) * 2)));
      setLiveCarbon((v) => parseFloat(Math.max(0, v + (Math.random() - 0.6) * 0.1).toFixed(1)));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const showNotif = (msg: string) => {
    setNotifMsg(msg);
    setNotifVisible(true);
    setTimeout(() => setNotifVisible(false), 3500);
  };

  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/login");
  const handleFeature = (feature: string) => {
    showNotif(`🚀 Navigating to ${feature}...`);
    setTimeout(() => router.push("/login"), 1200);
  };

  const features = [
    {
      icon: "🌐",
      title: "3D Digital Twin",
      description:
        "Real-time interactive stadium replica with live telemetry overlays, crowd heatmaps, and sector analytics.",
      badge: "Live",
      gradient:
        "linear-gradient(135deg, rgba(0,217,255,0.08) 0%, rgba(79,70,229,0.08) 100%)",
      onClick: () => handleFeature("3D Digital Twin"),
    },
    {
      icon: "🤖",
      title: "Gemini AI Engine",
      description:
        "Google Gemini-powered intelligence for incident briefs, predictive crowd routing, and real-time translations.",
      badge: "GenAI",
      gradient:
        "linear-gradient(135deg, rgba(115,255,216,0.08) 0%, rgba(6,182,212,0.08) 100%)",
      onClick: () => handleFeature("Gemini AI Engine"),
    },
    {
      icon: "🚌",
      title: "Smart Shuttle Ops",
      description:
        "AI-optimized shuttle scheduling with dynamic rerouting based on live metro delays and crowd density.",
      badge: "AI-Optimized",
      gradient:
        "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(139,92,246,0.08) 100%)",
      onClick: () => handleFeature("Shuttle Operations"),
    },
    {
      icon: "🔐",
      title: "RBAC Security",
      description:
        "Role-based access control with JWT authentication, audit trails, and multi-tier operational permissions.",
      badge: "Enterprise",
      gradient:
        "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(239,68,68,0.08) 100%)",
      onClick: () => handleFeature("Security Dashboard"),
    },
    {
      icon: "♿",
      title: "Accessible Routing",
      description:
        "AI-generated accessibility paths, elevator status monitoring, and priority fan assistance dispatch.",
      badge: "Inclusive",
      gradient:
        "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.08) 100%)",
      onClick: () => handleFeature("Accessibility Hub"),
    },
    {
      icon: "📊",
      title: "Carbon Intelligence",
      description:
        "Real-time environmental telemetry, CO₂ tracking, sustainability scoring, and green offset analytics.",
      badge: "Eco",
      gradient:
        "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(115,255,216,0.08) 100%)",
      onClick: () => handleFeature("Carbon Dashboard"),
    },
  ];

  const progressCards = [
    {
      label: "Gate Occupancy",
      value: Math.round(liveGate * 685),
      max: 68500,
      unit: "fans",
      color: "#00D9FF",
      icon: "🚪",
      status: liveGate > 90 ? "critical" : liveGate > 75 ? "warning" : "optimal",
    },
    {
      label: "Parking Capacity",
      value: Math.round(livePark * 62),
      max: 6200,
      unit: "spaces",
      color: "#F59E0B",
      icon: "🅿️",
      status: livePark > 90 ? "critical" : livePark > 75 ? "warning" : "optimal",
    },
    {
      label: "Shuttle Fleet",
      value: 22,
      max: 24,
      unit: "active",
      color: "#73FFD8",
      icon: "🚌",
      status: "optimal",
    },
    {
      label: "Metro Flow",
      value: 4820,
      max: 6000,
      unit: "pass/hr",
      color: "#8B5CF6",
      icon: "🚇",
      status: "warning",
    },
    {
      label: "Carbon Offset",
      value: liveCarbon * 10,
      max: 50,
      unit: "tonnes",
      color: "#10B981",
      icon: "🌿",
      status: "optimal",
    },
    {
      label: "Incidents Resolved",
      value: 44,
      max: 47,
      unit: "total",
      color: "#EF4444",
      icon: "🚨",
      status: liveGate > 90 ? "critical" : "warning",
    },
  ] as ProgressCardProps[];

  const testimonials = [
    {
      name: "Omar Al-Rashidi",
      role: "FIFA Operations Director",
      avatar: "👨‍💼",
      text: "Stadium OS AI transformed how we manage 68,000 fans simultaneously. The Digital Twin alone saved us hours of manual tracking per shift.",
    },
    {
      name: "Dr. Priya Nair",
      role: "Chief Medical Officer",
      avatar: "👩‍⚕️",
      text: "The AI-powered incident dispatch is a game changer. Response times dropped by 40% in our first live event trial.",
    },
    {
      name: "Carlos Mendez",
      role: "Head of Security",
      avatar: "👮‍♂️",
      text: "Real-time crowd emotion analytics and instant RBAC permissions made crowd management effortless during peak periods.",
    },
  ];

  // Tabs removed — no longer needed in nav

  return (
    <div className="min-h-screen relative overflow-x-hidden page-enter" style={{ background: "#040a18" }}>
      {/* ── LIQUID GLASS GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

        /* ── SMOOTH PAGE TRANSITION ── */
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-enter { animation: pageEnter 0.45s cubic-bezier(0.4,0,0.2,1) both; }

        /* ── SECTION SCROLL REVEAL ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) both; }

        * { box-sizing: border-box; }

        .liquid-glass-card {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.07) 0%,
            rgba(255,255,255,0.03) 50%,
            rgba(0,217,255,0.04) 100%
          );
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.2);
        }

        .liquid-glass-nav {
          background: linear-gradient(
            135deg,
            rgba(4,10,24,0.85) 0%,
            rgba(10,18,40,0.80) 100%
          );
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border-bottom: 1px solid rgba(0,217,255,0.12);
          box-shadow: 0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(0,217,255,0.08);
        }

        .liquid-glass-hero {
          background: linear-gradient(
            135deg,
            rgba(0,217,255,0.06) 0%,
            rgba(79,70,229,0.08) 30%,
            rgba(115,255,216,0.04) 70%,
            rgba(0,0,0,0) 100%
          );
          backdrop-filter: blur(40px) saturate(150%);
          -webkit-backdrop-filter: blur(40px) saturate(150%);
          border: 1px solid rgba(0,217,255,0.15);
          box-shadow:
            0 0 60px rgba(0,217,255,0.08),
            0 32px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .liquid-glass-btn {
          background: linear-gradient(135deg, rgba(0,217,255,0.15), rgba(79,70,229,0.25));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0,217,255,0.3);
          box-shadow: 0 4px 24px rgba(0,217,255,0.12), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .liquid-glass-btn:hover {
          background: linear-gradient(135deg, rgba(0,217,255,0.25), rgba(79,70,229,0.4));
          box-shadow: 0 8px 40px rgba(0,217,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
          transform: translateY(-2px);
          border-color: rgba(0,217,255,0.5);
        }

        .liquid-glass-btn-primary {
          background: linear-gradient(135deg, #00D9FF 0%, #4F46E5 100%);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 24px rgba(0,217,255,0.35), 0 0 60px rgba(0,217,255,0.08);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .liquid-glass-btn-primary:hover {
          box-shadow: 0 8px 48px rgba(0,217,255,0.5), 0 0 80px rgba(0,217,255,0.15);
          transform: translateY(-2px) scale(1.02);
        }

        .glow-cyan { box-shadow: 0 0 30px rgba(0,217,255,0.3), 0 0 60px rgba(0,217,255,0.1); }
        .glow-text-cyan { text-shadow: 0 0 20px rgba(0,217,255,0.6), 0 0 40px rgba(0,217,255,0.3); }
        .glow-text-mint { text-shadow: 0 0 20px rgba(115,255,216,0.5), 0 0 40px rgba(115,255,216,0.2); }

        .ticker-fade {
          animation: tickerFade 0.5s ease-in-out;
        }
        @keyframes tickerFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .float-anim { animation: floatY 6s ease-in-out infinite alternate; }
        @keyframes floatY {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-18px) rotate(2deg); }
        }

        .scan-line {
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(0,217,255,0.04) 50%,
            transparent 100%
          );
          animation: scanLine 8s linear infinite;
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .glass-orb {
          background: radial-gradient(circle at 30% 30%, rgba(0,217,255,0.15), rgba(79,70,229,0.1) 60%, transparent 100%);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,217,255,0.2);
        }

        .notif-slide {
          animation: notifIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes notifIn {
          0% { transform: translateX(100%) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .hex-badge {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(0,217,255,0.3); border-radius: 2px; }
      `}</style>

      {/* ── AMBIENT LIQUID BLOBS ── */}
      <LiquidBlob
        color="rgba(0,217,255,0.25)"
        style={{ top: "-15%", left: "-10%", width: "55vw", height: "55vw", animation: "floatY 20s ease-in-out infinite alternate" }}
      />
      <LiquidBlob
        color="rgba(115,255,216,0.2)"
        style={{ top: "30%", right: "-15%", width: "45vw", height: "45vw", animation: "floatY 25s ease-in-out infinite alternate-reverse" }}
      />
      <LiquidBlob
        color="rgba(79,70,229,0.3)"
        style={{ bottom: "10%", left: "20%", width: "40vw", height: "40vw", animation: "floatY 18s ease-in-out infinite alternate" }}
      />
      <LiquidBlob
        color="rgba(245,158,11,0.12)"
        style={{ top: "60%", right: "5%", width: "25vw", height: "25vw", animation: "floatY 22s ease-in-out infinite alternate-reverse" }}
      />

      {/* ── GRID OVERLAY ── */}
      <div className="fixed inset-0 grid-bg opacity-100 pointer-events-none z-0" />

      {/* ── SCAN LINE ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="scan-line absolute w-full h-48" />
      </div>

      {/* ── NOTIFICATION TOAST ── */}
      {notifVisible && (
        <div className="fixed top-6 right-6 z-[9999] notif-slide">
          <div className="liquid-glass-card px-5 py-3 rounded-xl border border-cyan-400/30 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm text-white font-medium">{notifMsg}</span>
            <button
              onClick={() => setNotifVisible(false)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          NAV
      ───────────────────────────────────────────── */}
      <nav className="liquid-glass-nav fixed top-0 left-0 right-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => showNotif("🏟️ Stadium OS AI — Home")}
          >
            <div className="w-9 h-9 rounded-xl glass-orb flex items-center justify-center text-xl font-bold border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all">
              ⚡
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white font-display leading-none">
                Stadium<span className="text-cyan-400">OS</span>
              </div>
              <div className="text-[9px] text-slate-500 tracking-widest uppercase">
                AI Platform
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA Buttons — no tabs, no ticker */}
          <div className="flex items-center gap-2">
            <button
              className="liquid-glass-btn text-xs font-semibold text-cyan-300 px-4 py-2 rounded-xl"
              onClick={() => router.push('/login')}
            >
              Sign In
            </button>
            <button
              className="liquid-glass-btn-primary text-xs font-bold text-white px-5 py-2 rounded-xl"
              onClick={handleLogin}
            >
              Launch Platform →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden liquid-glass-btn p-2 rounded-lg text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu — simplified, no tabs */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 px-4 border-t border-white/5 mt-2 pt-4 flex flex-col gap-2">
            <button
              className="text-left px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
            >
              Sign In
            </button>
            <button
              className="text-left px-4 py-2.5 rounded-lg text-sm text-cyan-300 hover:bg-white/5 transition-colors"
              onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
            >
              Launch Platform →
            </button>
          </div>
        )}
      </nav>

      {/* ─────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────── */}
      <section className="relative z-10 pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Top Badge */}
        <div className="flex justify-center mb-8">
          <button
            className="liquid-glass-card px-5 py-2 rounded-full border border-cyan-400/25 flex items-center gap-2 hover:border-cyan-400/50 transition-all group"
            onClick={() => showNotif("🏆 FIFA World Cup 2026 — Official Partner")}
          >
            <span className="text-xs">🏆</span>
            <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">
              FIFA World Cup 2026 — Official Ops Platform
            </span>
            <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">→</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl sm:text-6xl md:text-8xl font-black font-display leading-none mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="block text-white">Stadium</span>
            <span
              className="block glow-text-cyan"
              style={{
                background: "linear-gradient(135deg, #00D9FF 0%, #73FFD8 50%, #4F46E5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              OS AI
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-3 leading-relaxed">
            One Intelligent Platform for Every Stadium Experience.
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Enterprise-grade smart venue operations powered by{" "}
            <span className="text-cyan-400 font-semibold">Google Gemini AI</span>,
            real-time telemetry, and a live{" "}
            <span className="text-mint-aurora font-semibold text-emerald-400">3D Digital Twin</span>.
          </p>
        </div>

        {/* Hero Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            className="liquid-glass-btn-primary text-white font-bold px-8 py-4 rounded-2xl text-sm flex items-center gap-3 w-full sm:w-auto justify-center"
            onClick={handleDashboard}
          >
            <span>⚡</span>
            <span>Launch Dashboard</span>
            <span className="text-cyan-200">→</span>
          </button>
          <button
            className="liquid-glass-btn text-cyan-300 font-semibold px-8 py-4 rounded-2xl text-sm flex items-center gap-3 w-full sm:w-auto justify-center"
            onClick={() => router.push('/login')}
          >
            <span>▶</span>
            <span>Watch Demo</span>
          </button>
          <button
            className="liquid-glass-btn text-slate-300 font-semibold px-8 py-4 rounded-2xl text-sm flex items-center gap-3 w-full sm:w-auto justify-center"
            onClick={() => router.push('/login')}
          >
            <span>📚</span>
            <span>API Docs</span>
          </button>
        </div>

        {/* ── LIVE STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon="👥"
            value={`${(attendance / 1000).toFixed(0)}K`}
            label="Live Attendance"
            color="#00D9FF"
            pulse
          />
          <StatCard
            icon="🚨"
            value={incidents.toString()}
            label="Active Incidents"
            color="#EF4444"
            pulse
          />
          <StatCard
            icon="🚌"
            value={`${shuttles}/24`}
            label="Shuttles Active"
            color="#73FFD8"
          />
          <StatCard
            icon="✅"
            value={`${uptime}%`}
            label="System Uptime"
            color="#10B981"
          />
        </div>

        {/* ── HERO GLASS PANEL ── */}
        <div className="liquid-glass-hero rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          {/* HUD Corner Decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400/40 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400/40 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400/40 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400/40 rounded-br-lg" />

          {/* Live Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live Operations</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-400">Gemini AI Active</span>
            </div>
            <div className="ml-auto text-xs text-slate-500 hidden sm:block">
              Last sync: <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* 3D Stadium Visualization (Canvas representation) */}
          <div
            className="relative h-56 sm:h-72 mb-6 rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              background: "linear-gradient(180deg, rgba(0,15,30,0.8) 0%, rgba(4,10,24,0.95) 100%)",
              border: "1px solid rgba(0,217,255,0.15)",
            }}
            onClick={() => handleFeature("3D Digital Twin Stadium")}
          >
            {/* Stadium SVG Visualization */}
            <svg
              viewBox="0 0 800 320"
              className="w-full h-full"
              style={{ opacity: 0.9 }}
            >
              {/* Stadium outer ring */}
              <ellipse
                cx="400" cy="180" rx="350" ry="155"
                fill="none" stroke="rgba(0,217,255,0.3)" strokeWidth="1.5"
              />
              <ellipse
                cx="400" cy="180" rx="280" ry="120"
                fill="none" stroke="rgba(0,217,255,0.2)" strokeWidth="1"
              />
              {/* Pitch */}
              <ellipse
                cx="400" cy="180" rx="220" ry="90"
                fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.4)" strokeWidth="1"
              />
              {/* Center line */}
              <line x1="400" y1="92" x2="400" y2="268" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
              {/* Center circle */}
              <ellipse
                cx="400" cy="180" rx="45" ry="28"
                fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="0.8"
              />
              {/* Penalty areas */}
              <rect x="180" y="152" width="80" height="56" rx="2" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="0.8" />
              <rect x="540" y="152" width="80" height="56" rx="2" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="0.8" />
              {/* Stands glow lines */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                const r1 = 165, r2 = 215;
                const rad = (angle * Math.PI) / 180;
                const cx = 400 + r1 * Math.cos(rad) * 1.58;
                const cy = 180 + r1 * Math.sin(rad) * 0.77;
                const dx = 400 + r2 * Math.cos(rad) * 1.58;
                const dy = 180 + r2 * Math.sin(rad) * 0.77;
                const colors = ["#00D9FF", "#73FFD8", "#4F46E5", "#F59E0B"];
                return (
                  <line
                    key={i}
                    x1={cx} y1={cy} x2={dx} y2={dy}
                    stroke={colors[i % 4]}
                    strokeWidth="0.6"
                    opacity="0.4"
                  />
                );
              })}
              {/* Hot spots */}
              {[
                { cx: 280, cy: 140, color: "#EF4444", label: "CROWD ALERT" },
                { cx: 520, cy: 220, color: "#F59E0B", label: "HIGH DENSITY" },
                { cx: 400, cy: 80, color: "#10B981", label: "GATE A" },
              ].map((spot, i) => (
                <g key={i}>
                  <circle cx={spot.cx} cy={spot.cy} r="8" fill={`${spot.color}30`} stroke={spot.color} strokeWidth="1">
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={spot.cx} cy={spot.cy} r="3" fill={spot.color} />
                  <text x={spot.cx + 14} y={spot.cy + 4} fill={spot.color} fontSize="7" fontFamily="monospace">
                    {spot.label}
                  </text>
                </g>
              ))}
              {/* Title */}
              <text x="400" y="30" textAnchor="middle" fill="rgba(0,217,255,0.6)" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="600">
                LIVE · 3D DIGITAL TWIN · STADIUM OS AI
              </text>
            </svg>

            {/* Hover Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              style={{ background: "rgba(0,217,255,0.04)" }}>
              <div className="liquid-glass-card px-6 py-3 rounded-xl border border-cyan-400/30 text-sm font-semibold text-cyan-300">
                🌐 Click to Open Digital Twin
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🚨", label: "Dispatch Alert",  color: "#EF4444", path: '/login' },
              { icon: "🚌", label: "Reroute Shuttle", color: "#73FFD8", path: '/login' },
              { icon: "📊", label: "Analytics HUD",  color: "#00D9FF", path: '/login' },
              { icon: "🤖", label: "Ask Gemini AI",  color: "#8B5CF6", path: '/login' },
            ].map((action) => (
              <button
                key={action.label}
                className="liquid-glass-card px-3 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 hover:-translate-y-1 transition-all duration-300 group"
                style={{ borderColor: `${action.color}25` }}
                onClick={() => { showNotif(`${action.icon} ${action.label} — Sign in to continue`); setTimeout(() => router.push(action.path), 1000); }}
              >
                <span className="text-lg">{action.icon}</span>
                <span style={{ color: action.color }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          LIVE PROGRESS CARDS
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-1">
              Live Operations
              <span className="glow-text-cyan" style={{ color: "#00D9FF" }}> Hub</span>
            </h2>
            <p className="text-sm text-slate-500">Real-time stadium telemetry — auto-refreshing every 2.5s</p>
          </div>
          <button
            className="liquid-glass-btn px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 flex items-center gap-2"
            onClick={() => showNotif("🔄 Refreshing all telemetry feeds...")}
          >
            <span className="animate-spin">↻</span>
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressCards.map((card, i) => (
            <ProgressCard key={i} {...card} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          FEATURE CARDS
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-card border border-indigo-400/25 mb-4">
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">Platform Modules</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mb-3">
            Everything You Need to{" "}
            <span style={{
              background: "linear-gradient(135deg, #00D9FF, #73FFD8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Run a World-Class Venue
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Six deeply integrated modules covering every operational dimension of modern stadium management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          METRICS BANNER
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="liquid-glass-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(0,217,255,0.04) 0%, rgba(79,70,229,0.06) 50%, rgba(115,255,216,0.04) 100%)",
              }}
            />
            <div className="text-center mb-10 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-2">
                Platform Performance at a Glance
              </h2>
              <p className="text-slate-400 text-sm">Trusted by stadium operators across FIFA World Cup 2026 venues</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {[
                { value: "68,450+", label: "Peak Concurrent Fans", icon: "👥", color: "#00D9FF" },
                { value: "99.98%", label: "Platform Uptime SLA", icon: "⚡", color: "#10B981" },
                { value: "<0.3s", label: "AI Response Latency", icon: "🤖", color: "#8B5CF6" },
                { value: "40%", label: "Incident Response Boost", icon: "🚨", color: "#F59E0B" },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="text-center cursor-pointer group"
                  onClick={() => showNotif(`📈 ${metric.label}: ${metric.value}`)}
                >
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <div
                    className="text-3xl sm:text-4xl font-black font-display mb-1 transition-all duration-300 group-hover:scale-110"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          ROLE ACCESS CARDS
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-2">
            Role-Based{" "}
            <span style={{ color: "#73FFD8" }}>Access Control</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Tailored dashboards for every operational role — from Commander to Fan
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              role: "Operations Commander",
              icon: "🛡️",
              color: "#00D9FF",
              perms: ["Full dashboard access", "Settings management", "Audit logs", "AI controls"],
              badge: "Admin",
            },
            {
              role: "Security Lead",
              icon: "👮",
              color: "#EF4444",
              perms: ["Incident logging", "Dispatcher HUD", "Crowd analytics", "Gate control"],
              badge: "Security",
            },
            {
              role: "Medical Chief",
              icon: "⚕️",
              color: "#10B981",
              perms: ["Incident tracking", "Medical dispatch", "Triage logs", "Route planning"],
              badge: "Medical",
            },
            {
              role: "Fan Companion",
              icon: "🎟️",
              color: "#F59E0B",
              perms: ["QR ticket scan", "Seat upgrades", "AI translator", "Concessions map"],
              badge: "Fan",
            },
          ].map((role) => (
            <div
              key={role.role}
              className="liquid-glass-card rounded-2xl p-5 border hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
              style={{ borderColor: `${role.color}20` }}
              onClick={() => {
                showNotif(`🔐 Logging in as ${role.role}...`);
                setTimeout(() => router.push("/login"), 1000);
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${role.color}15`, border: `1px solid ${role.color}30` }}
                >
                  {role.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{role.role}</div>
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: `${role.color}20`, color: role.color }}
                  >
                    {role.badge}
                  </span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {role.perms.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-xs text-slate-400">
                    <span style={{ color: role.color }}>✓</span>
                    {perm}
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 w-full py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${role.color}20, ${role.color}10)`,
                  border: `1px solid ${role.color}30`,
                  color: role.color,
                }}
              >
                Login as {role.badge} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          TESTIMONIALS
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-2">
            Trusted by{" "}
            <span style={{ color: "#8B5CF6" }}>World Cup Operators</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          TECH STACK
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="liquid-glass-card rounded-2xl p-6 border border-white/5">
            <div className="text-center mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Powered By</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Next.js 15", icon: "▲", color: "#fff" },
                { name: "FastAPI", icon: "⚡", color: "#00D9FF" },
                { name: "Gemini AI", icon: "🤖", color: "#73FFD8" },
                { name: "WebSockets", icon: "🔌", color: "#8B5CF6" },
                { name: "SQLite/PG", icon: "🗄️", color: "#F59E0B" },
                { name: "Docker", icon: "🐳", color: "#0ea5e9" },
                { name: "Kubernetes", icon: "☸️", color: "#4F46E5" },
                { name: "TypeScript", icon: "📘", color: "#3b82f6" },
              ].map((tech) => (
                <button
                  key={tech.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-card border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => showNotif(`💡 Technology: ${tech.name}`)}
                >
                  <span className="text-sm">{tech.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: tech.color }}>
                    {tech.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          CTA SECTION
      ───────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="liquid-glass-hero rounded-3xl p-10 sm:p-16 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(0,217,255,0.1) 0%, transparent 70%)",
              }}
            />
            <div className="text-5xl mb-6">⚡</div>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white mb-4">
              Ready to Transform
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #00D9FF 0%, #73FFD8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Your Stadium Operations?
              </span>
            </h2>
            <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-xl mx-auto">
              Join the future of intelligent venue management. Powered by AI, built for the world's biggest sporting events.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="liquid-glass-btn-primary text-white font-bold px-10 py-4 rounded-2xl text-sm"
                onClick={handleDashboard}
              >
                🚀 Get Started Free
              </button>
              <button
                className="liquid-glass-btn text-cyan-300 font-semibold px-10 py-4 rounded-2xl text-sm"
                onClick={() => router.push('/login')}
              >
                📞 Request Enterprise Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl glass-orb flex items-center justify-center text-lg border border-cyan-400/30">
                ⚡
              </div>
              <div>
                <div className="text-sm font-bold text-white font-display">
                  Stadium<span className="text-cyan-400">OS</span> AI
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest">
                  Smart Venue Intelligence
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Dashboard', path: '/login' },
                { label: 'API Docs',  path: '/login' },
                { label: 'Security',  path: '/login' },
                { label: 'Privacy',   path: '/login' },
                { label: 'Contact',   path: '/login' },
              ].map(({ label, path }) => (
                <button
                  key={label}
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors duration-200"
                  onClick={() => router.push(path)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-600 text-center">
              © 2026 Stadium OS AI · Built for FIFA World Cup 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
