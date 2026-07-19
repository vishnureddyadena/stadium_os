"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldAlert, Leaf, Bus, Globe, Settings,
  LogOut, User, Eye, Sparkles, Cpu,
  ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────
interface DashboardShellProps {
  children: React.ReactNode;
}

type FontSize = 'normal' | 'large' | 'extra-large';
type ColorBlindFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
};

// ─────────────────────────────────────────────────────────────────
//  ROLE → DEFAULT PATH MAP  (single source of truth)
// ─────────────────────────────────────────────────────────────────
const ROLE_DEFAULT_PATHS: Record<string, string> = {
  ORGANIZER: '/dashboard/sponsor-media',
  SECURITY:  '/dashboard/security-medical',
  MEDICAL:   '/dashboard/security-medical',
  VIP:       '/dashboard/vip-transport',
  VENDOR:    '/dashboard/sustainability',
  ADMIN:     '/dashboard/fan-companion',
  SUPER_ADMIN: '/dashboard/fan-companion',
  FAN:       '/dashboard/fan-companion',
  VOLUNTEER: '/dashboard/fan-companion',
};

// ─────────────────────────────────────────────────────────────────
//  NAV ITEMS DEFINITION
// ─────────────────────────────────────────────────────────────────
const ALL_NAV_ITEMS: NavItem[] = [
  { name: 'Security & Medical', path: '/dashboard/security-medical', icon: ShieldAlert, roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'MEDICAL'] },
  { name: 'Sustainability',     path: '/dashboard/sustainability',   icon: Leaf,         roles: ['ADMIN', 'SUPER_ADMIN', 'ORGANIZER', 'VENDOR'] },
  { name: 'VIP & Transport',    path: '/dashboard/vip-transport',    icon: Bus,          roles: ['ADMIN', 'SUPER_ADMIN', 'VIP', 'ORGANIZER'] },
  { name: 'Sponsor & Media',    path: '/dashboard/sponsor-media',    icon: Globe,        roles: ['ADMIN', 'SUPER_ADMIN', 'ORGANIZER'] },
  { name: 'Fan Companion',      path: '/dashboard/fan-companion',    icon: Sparkles,     roles: ['FAN', 'ADMIN', 'SUPER_ADMIN', 'VIP', 'VOLUNTEER', 'ORGANIZER', 'VENDOR', 'SECURITY', 'MEDICAL'] },
  { name: 'System Settings',    path: '/dashboard/settings',         icon: Settings,     roles: ['ADMIN', 'SUPER_ADMIN'] },
];

// ─────────────────────────────────────────────────────────────────
//  LOADING SCREEN
// ─────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }}
      />
      <span className="text-xs font-mono tracking-widest uppercase" style={{ color: '#00D9FF60' }}>
        Initializing Secure Session...
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
//  MAIN SHELL
// ─────────────────────────────────────────────────────────────────
export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const router = useRouter();
  const pathname = usePathname();

  // ── Accessibility state ──
  const [fontSize, setFontSize]               = useState<FontSize>('normal');
  const [contrastMode, setContrastMode]       = useState(false);
  const [colorBlindFilter, setColorBlindFilter] = useState<ColorBlindFilter>('none');
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);

  // ── Route guard ──
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    // Check if user has permission for the current path
    const matched = ALL_NAV_ITEMS.find(item => item.path === pathname);
    if (matched && !matched.roles.includes(user.role)) {
      const fallback = ROLE_DEFAULT_PATHS[user.role] ?? '/dashboard/fan-companion';
      router.replace(fallback);
    }
  }, [user, loading, pathname, router]);

  // ── Smooth navigation helper ──
  const navigate = useCallback((path: string) => {
    if (path === pathname) return;
    setMobileOpen(false);
    router.push(path);
  }, [pathname, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  const navItems = ALL_NAV_ITEMS.filter(item =>
    item.roles.includes(user?.role ?? 'FAN')
  );

  const fontClass = { normal: 'text-sm', large: 'text-base', 'extra-large': 'text-lg' }[fontSize];

  const filterStyle = (): React.CSSProperties => {
    const filters: Record<ColorBlindFilter, string> = {
      none:         '',
      protanopia:   'url(#protanopia-filter)',
      deuteranopia: 'url(#deuteranopia-filter)',
      tritanopia:   'url(#tritanopia-filter)',
    };
    const f = filters[colorBlindFilter];
    return f ? { filter: f } : {};
  };

  // ── Loading / auth guard ──
  if (loading) return <LoadingScreen />;
  if (!user)   return null;

  return (
    <div
      style={{ ...filterStyle(), background: '#080808' }}
      className={`min-h-screen flex flex-col md:flex-row ${contrastMode ? 'contrast-mode' : ''}`}
    >
      {/* ── SVG Color-blind Filters (hidden) ── */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
          </filter>
        </defs>
      </svg>

      {/* ═══════════════════════════════════════════
          SIDEBAR — Pure black, no colour tint
      ═══════════════════════════════════════════ */}
      <>
        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`
            fixed md:sticky top-0 z-50 md:z-30
            h-screen w-64 flex flex-col
            border-r border-white/5
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
          style={{ background: '#0a0a0a' }}
        >
          {/* ── Logo / Branding ── */}
          <div className="px-5 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,217,255,0.2), rgba(79,70,229,0.3))',
                  border: '1px solid rgba(0,217,255,0.25)',
                }}
              >
                <Cpu className="w-5 h-5" style={{ color: '#00D9FF' }} />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-wide">
                  STADIUM <span style={{ color: '#00D9FF' }}>OS</span>
                </div>
                <div className="text-[9px] tracking-widest font-mono" style={{ color: '#00D9FF60' }}>
                  FIFA 2026 AI
                </div>
              </div>
            </div>
          </div>

          {/* ── WS Status ── */}
          <div className="px-5 py-2.5 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-white/30 font-medium">WebSocket</span>
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <Wifi className="w-3 h-3" style={{ color: '#10B981' }} />
              ) : (
                <WifiOff className="w-3 h-3" style={{ color: '#EF4444' }} />
              )}
              <span
                className="text-[9px] font-mono font-bold"
                style={{ color: isConnected ? '#10B981' : '#EF4444' }}
              >
                {isConnected ? 'ONLINE' : 'CONNECTING'}
              </span>
              {isConnected && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#10B981' }}
                />
              )}
            </div>
          </div>

          {/* ── Navigation Items ── */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04] hover:translate-x-1"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0,217,255,0.12), rgba(79,70,229,0.15))'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(0,217,255,0.2)'
                      : '1px solid transparent',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                      style={{ background: '#00D9FF' }}
                    />
                  )}

                  <item.icon
                    className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                    style={{ color: isActive ? '#00D9FF' : '#ffffff50' }}
                  />
                  <span
                    className={`flex-1 font-medium transition-colors duration-200 ${fontClass}`}
                    style={{ color: isActive ? '#ffffff' : '#ffffff60' }}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                      style={{ color: '#00D9FF60' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── User Profile + Actions ── */}
          <div
            className="p-3 border-t border-white/5"
            style={{ background: '#080808' }}
          >
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(79,70,229,0.2)',
                  border: '1px solid rgba(79,70,229,0.3)',
                }}
              >
                <User className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user.name ?? 'User'}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#00D9FF80' }}>
                  {user.role}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAccessPanel(!showAccessPanel)}
                title="Accessibility Settings (WCAG AAA)"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[10px] font-semibold transition-all duration-200"
                style={{
                  background: showAccessPanel ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: showAccessPanel ? '#00D9FF' : '#ffffff50',
                }}
              >
                <Eye className="w-3 h-3" />
                <span>Assist</span>
              </button>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: '#EF4444',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 z-30"
          style={{ background: '#0a0a0a' }}
        >
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
            aria-label="Open navigation"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
          <div className="text-sm font-bold text-white">
            Stadium <span style={{ color: '#00D9FF' }}>OS</span>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: isConnected ? '#10B981' : '#EF4444' }}
          />
        </div>

        {/* Background mesh */}
        <div className="mesh-bg pointer-events-none" aria-hidden="true">
          <div className="mesh-glow-1" />
          <div className="mesh-glow-2" />
          <div className="mesh-glow-3" />
        </div>

        {/* Accessibility Panel */}
        {showAccessPanel && (
          <div
            className="mx-4 mt-4 md:mx-6 p-4 rounded-2xl border border-white/8 grid grid-cols-1 md:grid-cols-3 gap-4 z-20 relative"
            style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(24px)' }}
          >
            {/* Font Size */}
            <div>
              <label className="text-[10px] text-white/40 font-semibold uppercase tracking-widest block mb-2">
                Font Size
              </label>
              <div className="flex gap-1">
                {(['normal', 'large', 'extra-large'] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className="flex-1 py-1.5 text-[10px] rounded-lg border capitalize transition-all duration-150"
                    style={{
                      background: fontSize === sz ? 'rgba(0,217,255,0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: fontSize === sz ? 'rgba(0,217,255,0.4)' : 'rgba(255,255,255,0.06)',
                      color: fontSize === sz ? '#00D9FF' : '#ffffff50',
                      fontWeight: fontSize === sz ? 700 : 400,
                    }}
                  >
                    {sz.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div>
              <label className="text-[10px] text-white/40 font-semibold uppercase tracking-widest block mb-2">
                High Contrast
              </label>
              <button
                onClick={() => setContrastMode(!contrastMode)}
                className="w-full py-1.5 text-[10px] rounded-lg border transition-all duration-150"
                style={{
                  background: contrastMode ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                  borderColor: contrastMode ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)',
                  color: contrastMode ? '#10B981' : '#ffffff50',
                  fontWeight: contrastMode ? 700 : 400,
                }}
              >
                {contrastMode ? '✓ Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Color Blind */}
            <div>
              <label className="text-[10px] text-white/40 font-semibold uppercase tracking-widest block mb-2">
                Color Blind Mode
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setColorBlindFilter(flt)}
                    className="py-1.5 text-[9px] rounded-lg border capitalize transition-all duration-150"
                    style={{
                      background: colorBlindFilter === flt ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: colorBlindFilter === flt ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.06)',
                      color: colorBlindFilter === flt ? '#8B5CF6' : '#ffffff50',
                      fontWeight: colorBlindFilter === flt ? 700 : 400,
                    }}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div key={pathname} className="flex-1 p-4 md:p-6 lg:p-8 relative z-10 page-enter">
          {children}
        </div>
      </main>

      {/* Inline styles for contrast mode + transitions */}
      <style>{`
        .contrast-mode { filter: contrast(1.4) brightness(1.1); }

        /* Smooth page transitions */
        @keyframes pageIn {
          from { 
            opacity: 0; 
            transform: translateX(12px); 
            filter: blur(4px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
            filter: blur(0); 
          }
        }
        .page-enter { animation: pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        /* Ensure sidebar nav has no layout shift */
        aside { will-change: transform; }
      `}</style>
    </div>
  );
};
