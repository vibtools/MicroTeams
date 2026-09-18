import React from 'react';
import { Terminal, Database, Cloud, Lock } from 'lucide-react';

export interface PublicFooterProps {
  onNavigateHome?: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApply?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToSetup?: () => void;
  onOpenLogin?: () => void;
  siteSettings?: {
    siteName?: string;
    domain?: string;
    logoUrl?: string;
  };
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigateHome,
  onNavigateToServices,
  onNavigateToApply,
  onNavigateToContact,
  onNavigateToSetup,
  onOpenLogin,
  siteSettings,
}) => {
  return (
    <footer className="border-t border-[#21262D] bg-[#0E131F] text-[#8B949E] pt-8 pb-5 px-4 w-full">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-[#21262D]">
          {/* Column 1: Brand & Operational Status */}
          <div className="space-y-2.5">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={onNavigateHome}
            >
              <div className="w-6 h-6 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#38BDF8]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] text-[#E6EDF3] font-medium tracking-tight">
                {siteSettings?.siteName || 'Team Dark Devil'}
              </span>
            </div>
            <p className="text-[11px] text-[#8B949E] font-light leading-relaxed">
              Decentralized microjob dispatching and high-throughput communication infrastructure.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0C2117] border border-[#124D31] text-[10px] text-[#22C55E] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>All Systems Operational &bull; 99.98% SLA</span>
            </div>
          </div>

          {/* Column 2: Capabilities & Services */}
          <div className="space-y-1.5 text-[11px]">
            <div className="text-[11px] text-[#E6EDF3] uppercase tracking-wider font-medium mb-1.5">
              Core Operations
            </div>
            <div className="space-y-1 text-[#8B949E]">
              <div
                className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                onClick={onNavigateToServices}
              >
                B2B Email Campaign Dispatch
              </div>
              <div
                className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                onClick={onNavigateToServices}
              >
                SMS Gateway &amp; OTP Alerts
              </div>
              <div
                className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                onClick={onNavigateToServices}
              >
                Data Validation &amp; Microjob Proofs
              </div>
              <div
                className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                onClick={onNavigateToServices}
              >
                Phone &amp; Email Syntax Cleaners
              </div>
            </div>
          </div>

          {/* Column 3: Platform Navigation */}
          <div className="space-y-1.5 text-[11px]">
            <div className="text-[11px] text-[#E6EDF3] uppercase tracking-wider font-medium mb-1.5">
              Platform Access
            </div>
            <div className="space-y-1">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="hover:text-[#38BDF8] transition-colors block text-left text-[#8B949E]"
                >
                  Worker Workspace Login
                </button>
              )}
              {onNavigateToApply && (
                <button
                  onClick={onNavigateToApply}
                  className="hover:text-[#38BDF8] transition-colors block text-left text-[#8B949E]"
                >
                  Apply for Field Operations
                </button>
              )}
              {onNavigateToServices && (
                <button
                  onClick={onNavigateToServices}
                  className="hover:text-[#38BDF8] transition-colors block text-left text-[#8B949E]"
                >
                  View All Services &amp; Rates
                </button>
              )}
              {onNavigateToContact && (
                <button
                  onClick={onNavigateToContact}
                  className="hover:text-[#38BDF8] transition-colors block text-left text-[#8B949E]"
                >
                  Leadership Contact &amp; Inquiries
                </button>
              )}
              {onNavigateToSetup && (
                <button
                  onClick={onNavigateToSetup}
                  className="hover:text-[#38BDF8] transition-colors block text-left text-[#8B949E]"
                >
                  System Setup Wizard
                </button>
              )}
            </div>
          </div>

          {/* Column 4: Infrastructure & Security */}
          <div className="space-y-1.5 text-[11px]">
            <div className="text-[11px] text-[#E6EDF3] uppercase tracking-wider font-medium mb-1.5">
              Infrastructure
            </div>
            <div className="space-y-1.5 text-[#8B949E]">
              <div className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-[#22C55E] shrink-0" />
                <span>Neon PostgreSQL Protected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-[#38BDF8] shrink-0" />
                <span>Cloudflare R2 S3 Storage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#F59E0B] shrink-0" />
                <span>Token Encrypted Dispatch API</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#6E7681]">
                <span>Host: ap-southeast-1 &bull; {siteSettings?.domain || 'darkdevil.team'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Protocol Bar */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px]">
          <div className="text-[#8B949E]">
            &copy; {new Date().getFullYear()} {siteSettings?.siteName || 'Team Dark Devil'} ({siteSettings?.domain || 'darkdevil.team'}). All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-[#6E7681]">
            <span className="font-mono text-[#8B949E]">Status: 100% Operational</span>
            <span>&bull;</span>
            <span className="text-[#38BDF8] font-mono">Microjob Protocol v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
