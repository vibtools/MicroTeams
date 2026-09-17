import React, { useState } from 'react';
import { Shield, ShieldAlert, KeyRound, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('RajPass##321');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim().toLowerCase();
    // Guard: Prevent field workers from attempting admin authentication
    if (trimmedUser === 'devil_shadow' || trimmedUser === 'viper_sms' || trimmedUser.startsWith('usr_')) {
      setErrorMsg(
        'Worker accounts cannot access the Leader Panel. Worker and Admin accounts are totally separate. Please sign in through the Worker Portal at /.'
      );
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

  const selectCredential = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center p-3 sm:p-5 bg-[#0D1117]">
      <div className="w-full max-w-[400px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-3.5 relative">
        {/* Top Header */}
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
            <div>
              <div className="text-[13px] text-[#E6EDF3] font-light tracking-tight">LEADER SECURITY GATEWAY</div>
              <div className="text-[10px] text-[#8B949E] font-mono">Separate Table: dd_admin_users</div>
            </div>
          </div>
          <a
            href="/"
            className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Portal</span>
          </a>
        </div>

        {/* Roles Supported Notice & Quick Select */}
        <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase font-mono text-[#8B949E]">Supported Admin Roles</span>
            <span className="text-[9.5px] text-[#EF4444] font-light">dd_admin_users</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => selectCredential('admin', 'RajPass##321')}
              className={`px-1.5 py-1 rounded text-left border transition-colors ${
                username === 'admin'
                  ? 'bg-[#280D12] border-[#5C1D24] text-[#EF4444]'
                  : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              <div className="text-[10px] font-normal truncate">Administrator</div>
              <div className="text-[9px] font-mono text-[#6E7681]">admin</div>
            </button>

            <button
              type="button"
              onClick={() => selectCredential('leader_alex', 'LeaderPass##1')}
              className={`px-1.5 py-1 rounded text-left border transition-colors ${
                username === 'leader_alex'
                  ? 'bg-[#271E0B] border-[#4D3800] text-[#F59E0B]'
                  : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              <div className="text-[10px] font-normal truncate">Leader</div>
              <div className="text-[9px] font-mono text-[#6E7681]">leader_alex</div>
            </button>

            <button
              type="button"
              onClick={() => selectCredential('subleader_kane', 'SubLeader##2')}
              className={`px-1.5 py-1 rounded text-left border transition-colors ${
                username === 'subleader_kane'
                  ? 'bg-[#0D2847] border-[#164E63] text-[#38BDF8]'
                  : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              <div className="text-[10px] font-normal truncate">Sub Leader</div>
              <div className="text-[9px] font-mono text-[#6E7681]">subleader_k</div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2 rounded-[6px] bg-[#280D12] border border-[#5C1D24] text-[#F87171] text-[11px]">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] text-[#8B949E] mb-1 font-light">Administrator ID</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="vib-input pl-7"
              />
              <UserIcon className="w-3.5 h-3.5 text-[#8B949E] absolute left-2 top-2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#8B949E] mb-1 font-light">Access Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="vib-input pl-7 pr-8 font-mono"
              />
              <Lock className="w-3.5 h-3.5 text-[#8B949E] absolute left-2 top-2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1.5 text-[#8B949E] hover:text-[#E6EDF3] p-0.5"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="vib-btn-sm w-full bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444] mt-1 justify-center disabled:opacity-50"
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

        {/* Bottom Security Footer & Worker Notice */}
        <div className="border-t border-[#21262D] pt-2 space-y-1.5">
          <div className="p-2 rounded bg-[#0B0F17] border border-[#21262D] text-[10.5px] text-[#8B949E] leading-relaxed">
            <span className="text-[#E6EDF3] font-light block">Total Account Separation:</span>
            Admin accounts have full system control. Workers are users/job holders and cannot access this gateway, and Admin users cannot log into the Worker Panel.
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#6E7681] pt-1">
            <span>SEPARATED ADMIN ROOT</span>
            <span className="font-mono">TLS 1.3 / NEON DB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
