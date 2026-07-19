"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';

export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  role: 'FAN' | 'VOLUNTEER' | 'SECURITY' | 'MEDICAL' | 'ORGANIZER' | 'VENDOR' | 'VIP' | 'ADMIN' | 'SUPER_ADMIN';
  employee_id?: string;
  volunteer_id?: string;
  fifa_id?: string;
}

export interface UserSessionInfo {
  id: number;
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  is_trusted: boolean;
  created_at: string;
}

interface LoginResponsePayload {
  success: boolean;
  mfa_required?: boolean;
  onboard_required?: boolean;
  ticket?: string;
  anomaly_flag?: boolean;
  error?: string;
  rate_limited?: boolean;
  lockout_minutes?: number;
  user?: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  deviceFingerprint: string;
  login: (identityCode: string, password: string, captchaId?: string, captchaSolution?: string) => Promise<LoginResponsePayload>;
  mfaVerify: (ticket: string, code: string) => Promise<boolean>;
  onboard: (identityCode: string, code: string, pass: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  requestReset: (identityCode: string) => Promise<{ success: boolean; token?: string; error?: string }>;
  confirmReset: (token: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  fetchSessions: () => Promise<UserSessionInfo[]>;
  revokeSession: (sessionId: number) => Promise<boolean>;
  ssoLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState('FP-UNKNOWN-BROWSER');

  // Compute a simple device fingerprint on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fp = `FP-${navigator.userAgent.length}-${window.screen.width}x${window.screen.height}`;
      setDeviceFingerprint(fp);
    }
  }, []);

  // Sync token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('stadium_token');
    const storedUser = localStorage.getItem('stadium_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    identityCode: string, 
    password: string, 
    captchaId?: string, 
    captchaSolution?: string
  ): Promise<LoginResponsePayload> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identity_code: identityCode, 
          password, 
          device_fingerprint: deviceFingerprint,
          captcha_id: captchaId,
          captcha_solution: captchaSolution
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        return { success: false, rate_limited: true, error: "Too many login requests. IP rate-limited." };
      }
      
      if (response.status === 423) {
        return { success: false, error: data.detail };
      }

      if (!response.ok) {
        return { success: false, error: data.detail || "Authentication failed." };
      }

      // Check if MFA is required
      if (data.mfa_required) {
        return { success: true, mfa_required: true, ticket: data.ticket };
      }

      // Check if onboarding is required
      if (data.onboard_required) {
        return { success: true, onboard_required: true };
      }

      // Successful direct login
      localStorage.setItem('stadium_token', data.access_token);
      localStorage.setItem('stadium_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      
      return { success: true, anomaly_flag: data.anomaly_flag, user: data.user };
    } catch (e) {
      console.error(e);
      return { success: false, error: "Unable to contact authentication server." };
    }
  };

  const mfaVerify = async (ticket: string, code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticket, 
          code, 
          device_fingerprint: deviceFingerprint 
        }),
      });

      if (!response.ok) return false;
      const data = await response.json();

      localStorage.setItem('stadium_token', data.access_token);
      localStorage.setItem('stadium_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const onboard = async (identityCode: string, code: string, pass: string, role?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identity_code: identityCode, 
          temp_verification_code: code, 
          new_password: pass,
          role
        }),
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail };
      return { success: true };
    } catch (e) {
      return { success: false, error: "Connection error during onboarding." };
    }
  };

  const requestReset = async (identityCode: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_code: identityCode }),
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail };
      return { success: true, token: data.mock_token };
    } catch (e) {
      return { success: false, error: "Server link error." };
    }
  };

  const confirmReset = async (resetToken: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: pass }),
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail };
      return { success: true };
    } catch (e) {
      return { success: false, error: "Server confirmation error." };
    }
  };

  const fetchSessions = async (): Promise<UserSessionInfo[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/sessions`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const revokeSession = async (sessionId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/sessions/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  };

  const ssoLogin = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/sso/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return false;
      const data = await response.json();

      localStorage.setItem('stadium_token', data.access_token);
      localStorage.setItem('stadium_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return true;
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('stadium_token');
    localStorage.removeItem('stadium_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      deviceFingerprint, 
      login, 
      mfaVerify, 
      onboard, 
      requestReset, 
      confirmReset, 
      fetchSessions, 
      revokeSession, 
      ssoLogin, 
      logout, 
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
