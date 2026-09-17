import React from 'react';
import {
  User as UserIcon,
  LogOut,
  ChevronRight,
  Flame,
  Briefcase,
  Mail,
  Home,
  Shield,
  Layers,
} from 'lucide-react';
import { User } from '../types';

export type NavViewMode = 'landing' | 'services' | 'apply' | 'contact' | 'user' | 'not-found';

interface NavbarProps {
  currentUser: User | null;
  currentView: NavViewMode;
  onNavigate: (view: 'landing' | 'services' | 'apply' | 'contact' | 'user') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    domain?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenLogin,
  onLogout,
  siteSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 h-[48px] bg-[#0D1117]/95 border-b border-[#30363D] backdrop-blur-md px-3 sm:px-6">
      <div className="max-w-[1280px] h-full mx-auto flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => onNavigate('landing')}
          title="Return to Home"
        >
          {siteSettings?.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.siteName || 'Team Dark Devil'}
              className="h-7 max-w-[140px] object-contain rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const fb = (e.target as HTMLElement).parentElement?.querySelector(
                  '.logo-fallback'
                ) as HTMLElement;
                if (fb) fb.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-6 h-6 rounded-[6px] bg-[#161B22] border border-[#30363D] items-center justify-center text-[#38BDF8] logo-fallback ${
              siteSettings?.logoUrl ? 'hidden' : 'flex'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="flex items-center">
            <span className="text-[13px] font-medium text-[#E6EDF3] tracking-tight uppercase">
              {siteSettings?.siteName || 'TEAM DARK DEVIL'}
            </span>
          </div>
        </div>

        {/* Center Navigation Links: Home, Services, Apply, Contact Us */}
        <nav className="flex items-center gap-1 sm:gap-2 text-[12.5px] font-light">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
              currentView === 'landing'
                ? 'bg-[#161B22] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('services')}
            className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
              currentView === 'services'
                ? 'bg-[#161B22] text-[#38BDF8] border border-[#30363D]'
                : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>

          <button
            onClick={() => onNavigate('apply')}
            className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
              currentView === 'apply'
                ? 'bg-[#161B22] text-[#38BDF8] border border-[#30363D]'
                : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
              currentView === 'contact'
                ? 'bg-[#161B22] text-[#38BDF8] border border-[#30363D]'
                : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </button>
        </nav>

        {/* Right Actions: Worker Login CTA OR Logged-In User Profile Button */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            /* Logged in state: Worker Login CTA is replaced with User's Username + Profile Icon Button */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('user')}
                title="Click to open user panel"
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-[7px] border transition-all group ${
                  currentView === 'user'
                    ? 'bg-[#12171F] border-[#38BDF8] text-[#38BDF8]'
                    : 'bg-[#161B22] hover:bg-[#1C2128] border-[#30363D] hover:border-[#38BDF8]/60 text-[#E6EDF3]'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#38BDF8] group-hover:bg-[#2563EB] group-hover:text-white transition-colors overflow-hidden shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.username}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <UserIcon className="w-3 h-3" />
                  )}
                </div>
                <div className="flex items-center text-left">
                  <span className="text-[12.5px] font-normal tracking-tight text-[#E6EDF3] group-hover:text-[#38BDF8] transition-colors">
                    {currentUser.username}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6E7681] group-hover:text-[#38BDF8] transition-colors" />
              </button>

              <button
                onClick={onLogout}
                title="Log Out"
                aria-label="Log Out"
                className="p-1.5 rounded-[6px] bg-[#161B22] hover:bg-[#1C2128] text-[#8B949E] hover:text-[#F87171] border border-[#30363D] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Logged out state: Worker Login CTA button */
            <button
              onClick={onOpenLogin}
              className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] flex items-center gap-1.5 px-3 py-1.5 shadow-sm font-light transition-all"
            >
              <span>Worker Login</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
