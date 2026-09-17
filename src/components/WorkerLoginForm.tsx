import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  KeyRound,
} from 'lucide-react';
import { User as UserType } from '../types';

interface WorkerLoginFormProps {
  onLoginSuccess: (user: UserType) => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    domain?: string;
  };
  isModal?: boolean;
  onClose?: () => void;
}

export const WorkerLoginForm: React.FC<WorkerLoginFormProps> = ({
  onLoginSuccess,
  siteSettings,
  isModal = false,
  onClose,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isVerifiedHuman, setIsVerifiedHuman] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Live countdown timer for active lockout
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutSeconds !== null && lockoutSeconds > 0) {
      setError(`Security lockout active. Please wait ${lockoutSeconds} seconds before retrying.`);
      return;
    }

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError('Please provide your worker username and password.');
      return;
    }

    if (!isVerifiedHuman) {
      setError('Please confirm the security verification check before signing in.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          username: trimmedUser,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const waitTime = data.retryAfterSeconds || 900;
          setLockoutSeconds(waitTime);
          setRemainingAttempts(0);
          throw new Error(
            data.error ||
              `Security lockout triggered due to consecutive failed attempts. Wait ${waitTime}s.`
          );
        }

        if (typeof data.remainingAttempts === 'number') {
          setRemainingAttempts(data.remainingAttempts);
        }

        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      if (data.user?.role !== 'worker') {
        throw new Error('Access Denied: This workspace is strictly restricted to registered field workers.');
      }

      // Successful worker authentication
      setError(null);
      setRemainingAttempts(null);
      setLockoutSeconds(null);
      onLoginSuccess(data.user);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;

  return (
    <div className="w-full max-w-[420px] bg-[#161B22] border border-[#30363D] rounded-[10px] p-6 text-[#C9D1D9] shadow-2xl relative">
      {isModal && onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#8B949E] hover:text-[#E6EDF3] p-1.5 rounded hover:bg-[#21262D] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-5">
        {siteSettings?.logoUrl ? (
          <img
            src={siteSettings.logoUrl}
            alt={siteSettings.siteName || 'Logo'}
            className="h-8 max-w-[140px] object-contain mx-auto mb-2"
          />
        ) : (
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#12171F] border border-[#2A303C] text-[#38BDF8] mb-2 shadow-inner">
            <KeyRound className="w-5 h-5" />
          </div>
        )}

        <h1 className="text-[17px] text-[#E6EDF3] font-normal tracking-tight">
          Worker Sign In
        </h1>
      </div>

      {/* Lockout Banner */}
      {isLocked && (
        <div className="mb-4 p-3.5 rounded-[6px] bg-[#280D12] border border-[#5C1D24] text-[#F87171] text-[12px] space-y-1">
          <div className="flex items-center gap-2 font-normal">
            <Clock className="w-4 h-4 text-[#EF4444] shrink-0 animate-pulse" />
            <span>Temporary Security Lockout Active</span>
          </div>
          <p className="text-[11.5px] text-[#C9D1D9] leading-relaxed">
            Too many consecutive failed attempts were detected. For your account security, access is</p>
          <div className="text-[13px] font-mono font-light text-[#EF4444] pt-1">
            {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s remaining
          </div>
        </div>
      )}

      {/* Standard Error / Remaining Attempts Warning */}
      {!isLocked && error && (
        <div className="mb-4 p-3 rounded-[6px] bg-[#280D12] border border-[#5C1D24] text-[#F87171] text-[12px] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <div>{error}</div>
            {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 5 && (
              <div className="text-[11px] text-[#FCA5A5] font-mono">
                Security Warning: {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'}{' '}
                remaining before a 15-minute temporary lockout.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Caps Lock Notice */}
      {capsLockActive && !isLocked && (
        <div className="mb-3 px-3 py-1.5 rounded-[6px] bg-[#221B0B] border border-[#5C4516] text-[#FBBF24] text-[11px] flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Caps Lock is currently ON. Passwords are case-sensitive.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11.5px] text-[#8B949E] mb-1 font-light">
            Worker Username or Registered Email
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-[#6E7681] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              disabled={isLocked || loading}
              maxLength={80}
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error && !isLocked) setError(null);
              }}
              placeholder="e.g. your_worker_id"
              className="vib-input pl-10 text-[13px] disabled:opacity-50"
              autoFocus={!isModal && !isLocked}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11.5px] text-[#8B949E] mb-1 font-light">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-[#6E7681] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLocked || loading}
              maxLength={128}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error && !isLocked) setError(null);
              }}
              onKeyDown={handlePasswordKeyDown}
              onKeyUp={handlePasswordKeyDown}
              placeholder="••••••••••••"
              className="vib-input pl-10 pr-10 text-[13px] disabled:opacity-50"
            />
            <button
              type="button"
              disabled={isLocked || loading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E7681] hover:text-[#C9D1D9] transition-colors disabled:opacity-40 p-0.5"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security Verification Check */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 p-2.5 rounded-[6px] bg-[#12171F] border border-[#2A303C] cursor-pointer hover:border-[#38BDF8]/40 transition-colors">
            <input
              type="checkbox"
              checked={isVerifiedHuman}
              disabled={isLocked || loading}
              onChange={(e) => setIsVerifiedHuman(e.target.checked)}
              className="mt-0.5 rounded border-[#30363D] bg-[#161B22] text-[#2563EB] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 disabled:opacity-50"
            />
            <div className="text-[11px] text-[#8B949E] select-none leading-snug">
              <span className="text-[#C9D1D9] font-light block">
                Authorized Personnel Verification</span>
              I confirm that I am an authorized Dark Devil field worker accessing this workspace.
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || isLocked || !isVerifiedHuman}
          className="vib-btn-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] w-full mt-2 font-light justify-center flex items-center gap-2 py-2.5 text-[13px] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Securing &amp; Authenticating...</span>
          ) : isLocked ? (
            <span>Security Lockout Active</span>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Security Status */}
      <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between text-[10.5px] text-[#8B949E]">
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-[#22C55E]" />
          <span>Encrypted Session</span>
        </span>
        <span className="font-mono text-[#6E7681]">v2.4</span>
      </div>
    </div>
  );
};
