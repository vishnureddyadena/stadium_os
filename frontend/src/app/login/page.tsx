"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config';

import { 
  KeyRound, ShieldAlert, Fingerprint, Lock, Shield, Cpu, 
  HelpCircle, Sparkles, RefreshCw, LogIn, ChevronRight, UserPlus 
} from 'lucide-react';

export default function LoginPage() {
  const { login, mfaVerify, onboard, requestReset, confirmReset, ssoLogin } = useAuth();
  const router = useRouter();

  // Primary Login Form states
  const [identityCode, setIdentityCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Captcha states
  const [captchaId, setCaptchaId] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaSolution, setCaptchaSolution] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  // MFA states
  const [mfaActive, setMfaActive] = useState(false);
  const [mfaTicket, setMfaTicket] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // Password recovery & Onboarding panel toggle states
  const [activePanel, setActivePanel] = useState<'login' | 'reset-request' | 'reset-confirm' | 'onboard'>('login');
  
  // Onboarding parameters
  const [onboardCode, setOnboardCode] = useState('');
  const [onboardPassword, setOnboardPassword] = useState('');
  const [onboardRole, setOnboardRole] = useState('FAN');

  // Reset password parameters
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');

  // Anomaly warnings
  const [anomalyWarning, setAnomalyWarning] = useState(false);

  // Fetch a captcha code on mount
  const fetchCaptcha = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/captcha`);
      if (response.ok) {
        const data = await response.json();
        setCaptchaId(data.captcha_id);
        setCaptchaQuestion(data.question);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setAnomalyWarning(false);
    setLoading(true);

    const result = await login(
      identityCode, 
      password, 
      showCaptcha ? captchaId : undefined, 
      showCaptcha ? captchaSolution : undefined
    );

    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Failed to log in.");
      // Check if we need to show CAPTCHA challenge
      if (result.error && result.error.includes("CAPTCHA")) {
        setShowCaptcha(true);
        fetchCaptcha();
      }
      return;
    }

    // Check if MFA is required
    if (result.mfa_required && result.ticket) {
      setMfaTicket(result.ticket);
      setMfaActive(true);
      return;
    }

    // Check if onboarding is required
    if (result.onboard_required) {
      setErrorMessage("Onboarding required for this account. Select Onboarding tab below.");
      setActivePanel('onboard');
      return;
    }

    // Success login, redirect target based on user role!
    const getRedirectPath = (role?: string) => {
      switch (role) {
        case 'ORGANIZER':
          return '/dashboard/sponsor-media';
        case 'SECURITY':
        case 'MEDICAL':
          return '/dashboard/security-medical';
        case 'VIP':
          return '/dashboard/vip-transport';
        case 'VENDOR':
          return '/dashboard/sustainability';
        case 'ADMIN':
        case 'SUPER_ADMIN':
        case 'FAN':
        case 'VOLUNTEER':
        default:
          return '/dashboard/fan-companion';
      }
    };

    const targetPath = getRedirectPath(result.user?.role);

    if (result.anomaly_flag) {
      setAnomalyWarning(true);
      setSuccessMessage("Security Notification: Logged in successfully from a new location. Active security audit trail generated.");
      setTimeout(() => {
        router.push(targetPath);
      }, 3500);
    } else {
      router.push(targetPath);
    }
  };

  const handleMFAVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const success = await mfaVerify(mfaTicket, mfaCode);
    setLoading(false);

    if (success) {
      const storedUser = localStorage.getItem('stadium_user');
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      const getRedirectPath = (role?: string) => {
        switch (role) {
          case 'ORGANIZER':
            return '/dashboard/sponsor-media';
          case 'SECURITY':
          case 'MEDICAL':
            return '/dashboard/security-medical';
          case 'VIP':
            return '/dashboard/vip-transport';
          case 'VENDOR':
            return '/dashboard/sustainability';
          case 'ADMIN':
          case 'SUPER_ADMIN':
          case 'FAN':
          case 'VOLUNTEER':
          default:
            return '/dashboard/fan-companion';
        }
      };
      router.push(getRedirectPath(userObj?.role));
    } else {
      setErrorMessage("MFA Code invalid. Try again.");
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const result = await onboard(identityCode, onboardCode, onboardPassword, onboardRole);
    setLoading(false);

    if (result.success) {
      setSuccessMessage("Activation completed! You can now authenticate.");
      setActivePanel('login');
      setPassword(onboardPassword);
    } else {
      setErrorMessage(result.error || "Onboarding activation failed.");
    }
  };

  const handleResetRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const result = await requestReset(identityCode);
    setLoading(false);

    if (result.success && result.token) {
      setSuccessMessage(`Security Code dispatched: Use token code "${result.token}" to confirm.`);
      setResetToken(result.token);
      setActivePanel('reset-confirm');
    } else {
      setErrorMessage(result.error || "Unrecognized identifier.");
    }
  };

  const handleResetConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const result = await confirmReset(resetToken, resetPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMessage("Password reset confirmed. Please sign in.");
      setActivePanel('login');
      setPassword(resetPassword);
    } else {
      setErrorMessage(result.error || "Token confirmation expired.");
    }
  };

  const handleSSOTrigger = async () => {
    setLoading(true);
    setErrorMessage('');
    const success = await ssoLogin();
    setLoading(false);

    if (success) {
      const storedUser = localStorage.getItem('stadium_user');
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      const getRedirectPath = (role?: string) => {
        switch (role) {
          case 'ORGANIZER':
            return '/dashboard/sponsor-media';
          case 'SECURITY':
          case 'MEDICAL':
            return '/dashboard/security-medical';
          case 'VIP':
            return '/dashboard/vip-transport';
          case 'VENDOR':
            return '/dashboard/sustainability';
          case 'ADMIN':
          case 'SUPER_ADMIN':
          case 'FAN':
          case 'VOLUNTEER':
          default:
            return '/dashboard/fan-companion';
        }
      };
      router.push(getRedirectPath(userObj?.role));
    } else {
      setErrorMessage("SSO Authentication rejected by provider federation gate.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden">
      
      {/* Background Mesh Elements */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-gradient-to-br from-emerald-base/40 to-indigo-royal/10 filter blur-[110px] rounded-full" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-gradient-to-tr from-cyan-electric/15 to-mint-aurora/5 filter blur-[120px] rounded-full" />

      {/* Primary Authentication Container */}
      <div className="w-full max-w-lg z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-mint-aurora to-cyan-electric rounded-2xl shadow-xl shadow-mint-aurora/15">
              <Cpu className="w-8 h-8 text-[#020f0d]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-widest text-white leading-none">STADIUM OS AI</h1>
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-electric">FIFA 2026 Core Gateway</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-sm leading-relaxed mt-2">
            Enter your Email, Employee ID, Volunteer ID, or FIFA ID to access the smart operations deck.
          </p>
        </div>

        {/* Form panel Card */}
        <div className="w-full glass-panel border-mint-aurora/15 rounded-3xl p-8 flex flex-col shadow-2xl relative">
          
          {/* Notifications */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-orange-cyber/10 border border-orange-cyber/20 text-orange-cyber text-xs font-semibold flex items-start space-x-2.5 animate-slideDown">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-start space-x-2.5 animate-slideDown ${
              anomalyWarning ? 'bg-indigo-royal/20 border border-indigo-royal/40 text-cyan-electric' : 'bg-mint-aurora/10 border border-mint-aurora/20 text-mint-aurora'
            }`}>
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MFA Challenge Active Screen */}
          {mfaActive ? (
            <form onSubmit={handleMFAVerifySubmit} className="space-y-6">
              <div className="text-center">
                <Lock className="w-10 h-10 text-mint-aurora mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Multi-Factor Authenticator Challenge</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Type the 4-digit code from your authenticator app or email.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">MFA PASSCODE (Try "2026")</label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  required
                  placeholder="e.g. 2026"
                  className="w-full glass-input text-center tracking-widest text-lg font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-mint-aurora to-cyan-electric text-background font-bold rounded-xl text-sm transition-all shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify Passcode'}
              </button>
            </form>
          ) : (
            <>
              {/* PANEL 1: Standard login */}
              {activePanel === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Identity Identifier Code
                    </label>
                    <input
                      type="text"
                      value={identityCode}
                      onChange={e => setIdentityCode(e.target.value)}
                      required
                      placeholder="Email, Employee ID (EMP-100), Volunteer (VOL-400), or FIFA ID"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Credentials Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  {/* CAPTCHA challenge box */}
                  {showCaptcha && (
                    <div className="p-4 rounded-xl bg-emerald-dark/60 border border-orange-cyber/20 space-y-3 animate-slideDown">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>{captchaQuestion}</span>
                        <button type="button" onClick={fetchCaptcha} className="text-cyan-electric flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Reload</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={captchaSolution}
                        onChange={e => setCaptchaSolution(e.target.value)}
                        required
                        placeholder="Type answer here..."
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-mint-aurora to-cyan-electric text-background font-bold rounded-xl text-xs hover:brightness-110 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-mint-aurora/10"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                  </button>

                  {/* SSO Federation divider */}
                  <div className="relative my-6 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-mint-aurora/10" />
                    </div>
                    <span className="relative px-3 bg-[#051d1a] text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      OIDC SSO Federation
                    </span>
                  </div>

                  {/* SSO Trigger Button */}
                  <button
                    type="button"
                    onClick={handleSSOTrigger}
                    className="w-full py-2.5 rounded-xl bg-indigo-royal/10 border border-indigo-royal/35 hover:bg-indigo-royal/20 text-cyan-electric font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Sign In via FIFA Core Passport ID</span>
                  </button>
                </form>
              )}

              {/* PANEL 2: First-time Onboarding */}
              {activePanel === 'onboard' && (
                <form onSubmit={handleOnboardSubmit} className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-2">Activate Operational Account</h3>
                  
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Identity ID</label>
                    <input
                      type="text"
                      value={identityCode}
                      onChange={e => setIdentityCode(e.target.value)}
                      required
                      placeholder="e.g. EMP-100 or email"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Onboarding Activation Code (Try "FIFA2026")</label>
                    <input
                      type="text"
                      value={onboardCode}
                      onChange={e => setOnboardCode(e.target.value)}
                      required
                      placeholder="Enter verification code"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Create Permanent Password</label>
                    <input
                      type="password"
                      value={onboardPassword}
                      onChange={e => setOnboardPassword(e.target.value)}
                      required
                      placeholder="Minimum 8 characters"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Select Operational Role</label>
                    <select
                      value={onboardRole}
                      onChange={e => setOnboardRole(e.target.value)}
                      className="w-full glass-input text-xs bg-[#110825]"
                    >
                      <option value="FAN">FAN (General Spectator)</option>
                      <option value="VOLUNTEER">VOLUNTEER (Event Steward)</option>
                      <option value="SECURITY">SECURITY (Safety Officer)</option>
                      <option value="MEDICAL">MEDICAL (First Aid/Responder)</option>
                      <option value="ORGANIZER">ORGANIZER (FIFA Coordinator)</option>
                      <option value="VIP">VIP (Premium Guest)</option>

                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-mint-aurora text-[#020f0d] font-bold rounded-xl text-xs"
                  >
                    {loading ? 'Activating account...' : 'Complete Activation'}
                  </button>
                </form>
              )}

              {/* PANEL 3: Password recovery request */}
              {activePanel === 'reset-request' && (
                <form onSubmit={handleResetRequestSubmit} className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-2">Request Password Recovery</h3>
                  
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Identifier Code</label>
                    <input
                      type="text"
                      value={identityCode}
                      onChange={e => setIdentityCode(e.target.value)}
                      required
                      placeholder="Email, Employee, Volunteer, or FIFA ID"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-mint-aurora text-background font-bold rounded-xl text-xs"
                  >
                    {loading ? 'Validating ID...' : 'Send Recovery Token'}
                  </button>
                </form>
              )}

              {/* PANEL 4: Password recovery confirm */}
              {activePanel === 'reset-confirm' && (
                <form onSubmit={handleResetConfirmSubmit} className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-2">Confirm Password Reset</h3>
                  
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Recovery Token Code</label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      required
                      placeholder="Paste recovery uuid token"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Choose New Password</label>
                    <input
                      type="password"
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-mint-aurora to-cyan-electric text-[#020f0d] font-bold rounded-xl text-xs"
                  >
                    Confirm Reset
                  </button>
                </form>
              )}

              {/* Footer Panel toggle links */}
              <div className="flex justify-between items-center border-t border-mint-aurora/10 pt-4 mt-6 text-[10px] text-slate-400">
                {activePanel !== 'login' ? (
                  <button 
                    onClick={() => { setActivePanel('login'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-cyan-electric hover:underline font-semibold"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => { setActivePanel('reset-request'); setErrorMessage(''); setSuccessMessage(''); }}
                      className="hover:underline"
                    >
                      Forgot password?
                    </button>
                    <button 
                      onClick={() => { setActivePanel('onboard'); setErrorMessage(''); setSuccessMessage(''); }}
                      className="text-mint-aurora hover:underline font-semibold flex items-center space-x-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Activate Account</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
