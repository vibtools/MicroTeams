import React from 'react';
import { ShieldAlert, LogOut, ArrowLeft, Terminal, ShieldCheck, Shield, Award, UserCheck } from 'lucide-react';
import { AdminUser, User } from '../src/types';

interface LeaderNavbarProps {
  currentUser: AdminUser | User | null;
  onLogout: () => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
  };
}

export const LeaderNavbar: React.FC<LeaderNavbarProps> = ({ currentUser, onLogout, siteSettings }) => {
  const getRoleBadge = (role?: string) => {
    if (role === 'Administrator' || role === 'admin') {
      return (
        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#280D12] text-[#EF4444] border border-[#5C1D24] font-light inline-flex items-center gap-1">
          <Shield className="w-2.5 h-2.5" />
          <span>Administrator</span>
        </span>
      );
    }
    if (role === 'Leader') {
      return (
        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#271E0B] text-[#F59E0B] border border-[#4D3800] font-light inline-flex items-center gap-1">
          <Award className="w-2.5 h-2.5" />
          <span>Leader</span>
        </span>
      );
    }
    if (role === 'Sub Leader') {
      return (
        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#0D2847] text-[#38BDF8] border border-[#164E63] font-light inline-flex items-center gap-1">
          <UserCheck className="w-2.5 h-2.5" />
          <span>Sub Leader</span>
        </span>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-40 h-[44px] bg-[#0B0F17]/95 border-b border-[#30363D] backdrop-blur-md px-3 sm:px-5">
      <div className="max-w-[1280px] h-full mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          {siteSettings?.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt="Logo"
              className="h-7 max-w-[120px] object-contain rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const fb = (e.target as HTMLElement).parentElement?.querySelector('.leader-logo-fallback') as HTMLElement;
                if (fb) fb.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-6 h-6 rounded-[6px] bg-[#280D12] border border-[#5C1D24] items-center justify-center text-[#EF4444] leader-logo-fallback ${
              siteSettings?.logoUrl ? 'hidden' : 'flex'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-light text-[#E6EDF3] tracking-tight">
              {siteSettings?.siteName ? siteSettings.siteName.toUpperCase() : 'DARK DEVIL'}
            </span>
            <span className="text-[10px] text-[#EF4444] px-1.5 py-0.2 rounded bg-[#280D12] border border-[#5C1D24] font-light">
              LEADER CORE
            </span>
          </div>
        </div>

        {/* Security Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8B949E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span className="font-mono">ISOLATED LEADER INSTANCE</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D]"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">User Portal</span>
          </a>

          {currentUser && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[#161B22] border border-[#30363D]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span className="text-[11.5px] text-[#E6EDF3] font-light">{currentUser.username}</span>
                {getRoleBadge(currentUser.role)}
              </div>
              <button
                onClick={onLogout}
                className="vib-btn-sm bg-[#280D12] hover:bg-[#3D141B] text-[#F87171] border border-[#5C1D24]"
                title="Logout from Leader Panel"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
