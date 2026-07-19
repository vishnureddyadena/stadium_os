"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Role → default landing path (single source of truth — mirrors DashboardShell)
const ROLE_DEFAULT: Record<string, string> = {
  ORGANIZER:   '/dashboard/sponsor-media',
  SECURITY:    '/dashboard/security-medical',
  MEDICAL:     '/dashboard/security-medical',
  VIP:         '/dashboard/vip-transport',
  VENDOR:      '/dashboard/sustainability',
  ADMIN:       '/dashboard/fan-companion',
  SUPER_ADMIN: '/dashboard/fan-companion',
  FAN:         '/dashboard/fan-companion',
  VOLUNTEER:   '/dashboard/fan-companion',
};

export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || redirected.current) return;
    redirected.current = true;

    if (!user) {
      router.replace('/login');
    } else {
      const path = ROLE_DEFAULT[user.role] ?? '/dashboard/fan-companion';
      router.replace(path);
    }
  }, [user, loading, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#080808' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }}
        />
        <span
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: '#00D9FF60' }}
        >
          Routing to your dashboard...
        </span>
      </div>
    </div>
  );
}
