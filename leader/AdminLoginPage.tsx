import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { AdminUser } from '../src/types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    domain?: string;
  };
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, siteSettings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
      setErrorMsg('Identifier and password are required.');
      return;
    }

    // Guard: Prevent field worker ID prefixes from attempting admin authentication
    if (trimmedUser.startsWith('usr_')) {
      setErrorMsg('Worker accounts cannot access the Leader Panel. Please sign in via the Worker Portal.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center p-3 sm:p-5 bg-[#0D1117]">
      <div className="w-full max-w-[380px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-3 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
          <div className="flex items-center gap-2">
            {siteSettings?.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt="Logo"
                className="h-7 max-w-[110px] object-contain rounded"
              />
            ) : (
              <div className="w-7 h-7 rounded-[6px] bg-[#280D12] border border-[#5C1D24] flex items-center justify-center text-[#EF4444]">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              </div>
            )}
            <h1 className="text-[13px] text-[#E6EDF3] font-medium tracking-tight m-0 p-0">LEADER SECURITY GATEWAY</h1>
          </div>
          <a
            href="/"
            className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Portal</span>
          </a>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2 rounded-[6px] bg-[#280D12] border border-[#5C1D24] text-[#F87171] text-[11px] font-normal leading-tight">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] text-[#8B949E] mb-1 font-normal">Administrator ID</label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Administrator ID or Email"
                className="vib-input pl-7 text-[12px] font-normal"
              />
              <UserIcon className="w-3.5 h-3.5 text-[#8B949E] absolute left-2 top-2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#8B949E] mb-1 font-normal">Access Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="vib-input pl-7 pr-8 font-mono text-[12px]"
              />
              <Lock className="w-3.5 h-3.5 text-[#8B949E] absolute left-2 top-2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1.5 text-[#8B949E] hover:text-[#E6EDF3] p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="vib-btn-sm w-full bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444] mt-1 justify-center disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Shield className="w-3 h-3" />
                <span>Authorize &amp; Enter Leader Panel</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </form>

        {/* Status Footer */}
        <div className="border-t border-[#21262D] pt-2 flex items-center justify-between text-[10px] text-[#8B949E]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Encrypted Session
          </span>
          <span className="font-mono text-[#6E7681]">TLS 1.3</span>
        </div>
      </div>
    </div>
  );
};
