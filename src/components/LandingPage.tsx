import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileQuestion,
  Shield,
  ShieldCheck,
  Clock,
  Terminal,
  FileCheck,
  Award,
  Send,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Server,
  Activity,
  Database,
  Cloud,
  Lock,
  Globe,
  Check,
} from 'lucide-react';
import { ServiceItem } from '../types';
import { PublicFooter } from './PublicFooter';

interface LandingPageProps {
  onOpenLogin?: () => void;
  onNavigateToLeader?: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApply?: () => void;
  onNavigateToContact?: () => void;
  announcement?: string;
  isNotFound?: boolean;
  notFoundPath?: string;
  onNavigateHome?: () => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    domain?: string;
    faviconUrl?: string;
  };
  stats: {
    totalDataUploaded: number;
    totalDataCollected: number;
    totalJobs: number;
    totalActiveWorkers: number;
  };
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onNavigateToLeader,
  onNavigateToServices,
  onNavigateToApply,
  onNavigateToContact,
  announcement,
  isNotFound = false,
  notFoundPath,
  onNavigateHome,
  siteSettings,
  stats,
}) => {
  // Services state & details popup
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.services)) {
          setServices(data.services);
        }
      })
      .catch((err) => console.warn('Failed to load services on landing:', err));
  }, []);
// Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9]">
      {/* Announcement bar */}
      {announcement && (
        <div className="bg-[#11161D] border-b border-[#30363D] py-1.5 px-4 text-center">
          <p className="text-[11.5px] text-[#38BDF8] flex items-center justify-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>{announcement}</span>
          </p>
        </div>
      )}

        {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto px-4 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center">
        {isNotFound ? (
          /* 404 NOT FOUND HERO AREA */
          <div className="max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#280D12] border border-[#5C1D24] mb-3 text-[11px] text-[#F87171]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <span className="font-mono">HTTP 404 &bull; ROUTE_NOT_FOUND</span>
              <span className="text-[#5C1D24]">|</span>
              <span className="text-[#8B949E]">darkdevil.team</span>
            </div>

            <h1 className="text-2xl sm:text-4xl text-[#E6EDF3] tracking-tight font-light mb-2.5">
              404 - Page Not Found
            </h1>

            <div className="p-3 rounded-[6px] bg-[#161B22] border border-[#30363D] max-w-lg mx-auto mb-4 text-left font-mono text-[11px] space-y-1">
              <div className="text-[10px] text-[#8B949E]">Requested Invalid URL:</div>
              <div className="text-[#F87171] break-all">
                {notFoundPath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown')}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={onNavigateHome}
                className="vib-btn-md bg-[#161B22] hover:bg-[#181F2B] text-[#E6EDF3] border border-[#30363D] px-4 flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Return to Main Home (/)</span>
              </button>
              <a
                href="#services"
                className="vib-btn-md bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] px-4"
              >
                <span>Explore Platform Services &darr;</span>
              </a>
            </div>
          </div>
        ) : (
          /* STANDARD MODERN COMPACT HERO AREA */
          <div className="max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#12171F] border border-[#21262D] mb-4 text-[11px] text-[#8B949E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[#E6EDF3] font-normal">Enterprise Dispatch &amp; Micro-Operations</span>
              <span className="text-[#21262D]">|</span>
              <span className="text-[#38BDF8] font-mono">darkdevil.team</span>
            </div>

            <h1 className="text-2xl sm:text-4xl text-[#E6EDF3] tracking-tight font-light mb-3 leading-snug">
              Precision Email, SMS &amp; Data Dispatch Network
            </h1>

            <p className="text-[12.5px] sm:text-[13.5px] text-[#8B949E] max-w-2xl mx-auto mb-6 font-normal leading-relaxed">
              High-throughput transactional distribution, verified lead validation pipelines, and decentralized operator workforce coordination with carrier-grade reliability.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="vib-btn-md bg-[#0284C7] hover:bg-[#0369A1] text-white border border-[#0284C7] px-4 flex items-center gap-2 shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Worker Workspace Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onNavigateToServices ? (
                <button
                  onClick={onNavigateToServices}
                  className="vib-btn-md bg-[#161B22] hover:bg-[#181F2B] text-[#E6EDF3] border border-[#30363D] px-4"
                >
                  <span>Explore Services Catalog</span>
                </button>
              ) : (
                <a
                  href="#services"
                  className="vib-btn-md bg-[#161B22] hover:bg-[#181F2B] text-[#E6EDF3] border border-[#30363D] px-4"
                >
                  <span>Explore Services</span>
                </a>
              )}
              {onNavigateToApply ? (
                <button
                  onClick={onNavigateToApply}
                  className="vib-btn-md bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#21262D] px-4"
                >
                  <span>Apply for Field Ops</span>
                </button>
              ) : (
                <a
                  href="#apply"
                  className="vib-btn-md bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#21262D] px-4"
                >
                  <span>Apply to Join</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Enterprise Capability & Performance Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-4xl mx-auto">
          {/* Card 1: Data Processed */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] uppercase tracking-wider text-[#8B949E] font-medium truncate">
                Dispatched Records
              </span>
              <Zap className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            </div>
            <div>
              <div className="text-[17px] text-[#E6EDF3] font-light font-mono leading-none mb-1">
                {(stats.totalDataUploaded || 148500).toLocaleString()}+
              </div>
              <div className="text-[10px] text-[#22C55E] flex items-center gap-1 font-mono">
                <Check className="w-2.5 h-2.5" />
                <span>Verified Delivery</span>
              </div>
            </div>
          </div>

          {/* Card 2: Deliverability SLA */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] uppercase tracking-wider text-[#8B949E] font-medium truncate">
                Deliverability SLA
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
            </div>
            <div>
              <div className="text-[17px] text-[#22C55E] font-light font-mono leading-none mb-1">
                99.98%
              </div>
              <div className="text-[10px] text-[#8B949E] font-mono truncate">
                DKIM &amp; SPF Enforced
              </div>
            </div>
          </div>

          {/* Card 3: Gateway Latency */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] uppercase tracking-wider text-[#8B949E] font-medium truncate">
                Gateway Latency
              </span>
              <Activity className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            </div>
            <div>
              <div className="text-[17px] text-[#38BDF8] font-light font-mono leading-none mb-1">
                &lt; 120ms
              </div>
              <div className="text-[10px] text-[#8B949E] font-mono truncate">
                Global Anycast Routing
              </div>
            </div>
          </div>

          {/* Card 4: High-Security Storage Architecture */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] uppercase tracking-wider text-[#8B949E] font-medium truncate">
                Storage &amp; Encryption
              </span>
              <Database className="w-3.5 h-3.5 text-[#A855F7] shrink-0" />
            </div>
            <div>
              <div className="text-[17px] text-[#E6EDF3] font-light font-mono leading-none mb-1">
                AES-256 / S3
              </div>
              <div className="text-[10px] text-[#8B949E] font-mono truncate">
                Postgres &amp; Cloudflare R2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Latest 3 Services) */}
      <section className="max-w-[1280px] mx-auto px-4 py-10 border-t border-[#21262D]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-[10.5px] text-[#38BDF8] uppercase tracking-wider font-light block">
              Core Infrastructure &amp; Capabilities
            </span>
            <h2 className="text-lg text-[#E6EDF3] font-light">Team Operations &amp; Services</h2>
          </div>
          {onNavigateToServices && (
            <button
              onClick={onNavigateToServices}
              className="text-[12px] text-[#38BDF8] hover:text-[#7DD3FC] flex items-center gap-1 font-light self-start sm:self-auto transition-colors"
            >
              <span>Explore All Operations &amp; Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Latest 3 Services Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(services.filter((s) => s.status !== 'inactive').length > 0
            ? services.filter((s) => s.status !== 'inactive').slice(0, 3)
            : [
                {
                  id: 'srv_default_1',
                  name: 'B2B Email Campaign Sending',
                  category: 'Email Delivery',
                  price: '$0.05 - $0.15 / send',
                  shortDescription: 'High-inbox delivery protocol with dedicated warmup pools, DKIM authentication, and real-time bounce suppression.',
                  description: 'Comprehensive high-volume email distribution infrastructure. Includes IP rotation pools, SPF/DKIM/DMARC domain authentication setup, custom tracking domain alignment, and real-time bounce suppression algorithms.',
                  status: 'active' as const,
                  createdAt: '2026-03-01',
                },
                {
                  id: 'srv_default_2',
                  name: 'SMS Alert & OTP Verification',
                  category: 'SMS Gateway',
                  price: '$0.08 - $0.25 / SMS',
                  shortDescription: 'Low-latency global SMS routing pipelines with 99.8% delivery SLA and localized gateway failover mechanisms.',
                  description: 'Carrier-grade SMS dispatch networks configured for transactional OTP verification, security authentication notices, and time-critical operational alerts.',
                  status: 'active' as const,
                  createdAt: '2026-03-01',
                },
                {
                  id: 'srv_default_3',
                  name: 'Microjob Proof & Lead Verification',
                  category: 'Data Validation',
                  price: 'Flexible / Task',
                  shortDescription: 'Human-in-the-loop manual & automated verification for high-volume crowdsourced operational microjobs.',
                  description: 'Multi-layer operational quality control service combining distributed human operators with automated regex and syntax parsing engines.',
                  status: 'active' as const,
                  createdAt: '2026-03-01',
                },
              ]
          ).map((srv) => (
            <div
              key={srv.id}
              className="bg-[#161B22] border border-[#30363D] hover:border-[#38BDF8]/50 rounded-[8px] p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-[6px] bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#38BDF8] overflow-hidden shrink-0 group-hover:border-[#38BDF8]/60 transition-colors">
                    {srv.iconUrl ? (
                      <img
                        src={srv.iconUrl}
                        alt={srv.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : srv.category?.toLowerCase().includes('sms') ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : srv.category?.toLowerCase().includes('data') ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>

                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#12171F] text-[#38BDF8] border border-[#2A303C]">
                    {srv.category}
                  </span>
                </div>

                <h3 className="text-[14px] text-[#E6EDF3] font-light mb-1 group-hover:text-white transition-colors">
                  {srv.name}
                </h3>

                <p className="text-[11.5px] text-[#8B949E] line-clamp-2 leading-relaxed mb-3 font-light">
                  {srv.shortDescription || srv.description || 'Professional operational service executed by verified team operators.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#21262D] flex items-center justify-between text-[11px] gap-2">
                <span className="text-[#8B949E] font-mono truncate">
                  Rate: <strong className="text-[#4ADE80] font-normal">{srv.price}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(srv as ServiceItem);
                    setIsDetailModalOpen(true);
                  }}
                  className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#E6EDF3] hover:text-[#38BDF8] border border-[#30363D] hover:border-[#38BDF8]/50 flex items-center gap-1 px-2.5 py-1 text-[11px] shrink-0 transition-all"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Tools Showcase */}
      <section className="max-w-[1280px] mx-auto px-4 py-10 border-t border-[#21262D]">
        <div className="mb-6">
          <span className="text-[10.5px] text-[#38BDF8] uppercase tracking-wider font-light block">
            Integrated Utilities

          </span>
          <h2 className="text-lg text-[#E6EDF3] font-light">Free Worker Tools</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#E6EDF3] font-light">Email Syntax &amp; Duplicate Cleaner</span>
              <span className="text-[10px] text-[#38BDF8] bg-[#12171F] px-1.5 py-0.5 rounded border border-[#2A303C]">Included</span>
            </div>

            {!isNotFound && onOpenLogin ? (
              <button
                onClick={onOpenLogin}
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#C9D1D9] border border-[#30363D] w-full"
              >
                Access Tool in Panel
              </button>
            ) : onNavigateToApply ? (
              <button
                onClick={onNavigateToApply}
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#C9D1D9] border border-[#30363D] w-full"
              >
                Apply for Worker Access
              </button>
            ) : (
              <div className="text-[11px] text-[#8B949E] text-center py-1">
                Available for Active Workers
              </div>
            )}
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#E6EDF3] font-light">International E.164 Phone Cleaner</span>
              <span className="text-[10px] text-[#38BDF8] bg-[#12171F] px-1.5 py-0.5 rounded border border-[#2A303C]">Included</span>
            </div>

            {!isNotFound && onOpenLogin ? (
              <button
                onClick={onOpenLogin}
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#C9D1D9] border border-[#30363D] w-full"
              >
                Access Tool in Panel
              </button>
            ) : onNavigateToApply ? (
              <button
                onClick={onNavigateToApply}
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#C9D1D9] border border-[#30363D] w-full"
              >
                Apply for Worker Access
              </button>
            ) : (
              <div className="text-[11px] text-[#8B949E] text-center py-1">
                Available for Active Workers
              </div>
            )}
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#E6EDF3] font-light">Spam Trigger Word Scanner</span>
              <span className="text-[10px] text-[#38BDF8] bg-[#12171F] px-1.5 py-0.5 rounded border border-[#2A303C]">Included</span>
            </div>

            {!isNotFound && onOpenLogin ? (
              <button
                onClick={onOpenLogin}
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#C9D1D9] border border-[#30363D] w-full"
              >
                Access Tool in Panel
              </button>
            ) : onNavigateToApply ? (
              <button
                onClick={onNavigateToApply}
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#C9D1D9] border border-[#30363D] w-full"
              >
                Apply for Worker Access
              </button>
            ) : (
              <div className="text-[11px] text-[#8B949E] text-center py-1">
                Available for Active Workers
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Forms Section: Only Contact Us on Home Page */}
      <section id="contact" className="max-w-[1280px] mx-auto px-4 py-12 border-t border-[#21262D]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Direct Communication & Support Info */}
          <div className="lg:col-span-5 bg-[#161B22] border border-[#30363D] rounded-[8px] p-5 space-y-4">
            <div>
              <span className="text-[10.5px] text-[#38BDF8] uppercase tracking-wider font-light block mb-0.5">
                Direct Communication
              </span>
              <h2 className="text-base text-[#E6EDF3] font-light">Contact Leadership &amp; Desk</h2>
            </div>

            <p className="text-[12px] text-[#8B949E] leading-relaxed font-light">
              Submit custom dispatch requirements, rate negotiations, enterprise volume agreements, or technical support inquiries directly to our leadership.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-[#8B949E]">Official Direct Mail</div>
                  <div className="text-[12.5px] text-[#E6EDF3] font-mono font-light">
                    support@{siteSettings?.domain || 'darkdevil.team'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-[#8B949E]">Response Guarantee</div>
                  <div className="text-[12px] text-[#E6EDF3] font-light">
                    Under 4 hours &bull; 24/7 Monitored Dispatch Desk
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-[#8B949E]">Confidential Inquiries</div>
                  <div className="text-[12px] text-[#E6EDF3] font-light">
                    Encrypted ticket delivery with authenticated delivery logs
                  </div>
                </div>
              </div>
            </div>

            {onNavigateToApply && (
              <div className="pt-2 border-t border-[#21262D]">
                <div className="text-[11.5px] text-[#8B949E] mb-2 font-light">
                  Looking to join our distributed operator workforce?
                </div>
                <button
                  type="button"
                  onClick={onNavigateToApply}
                  className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#38BDF8] hover:text-[#7DD3FC] border border-[#2A303C] hover:border-[#38BDF8]/40 w-full flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Go to Dedicated Operator Application Page &rarr;</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Contact Us Form */}
          <div className="lg:col-span-7 bg-[#161B22] border border-[#30363D] rounded-[8px] p-5">
            <div className="mb-4">
              <span className="text-[10.5px] text-[#38BDF8] uppercase tracking-wider font-light block mb-0.5">
                Inquiry Ticket
              </span>
              <h2 className="text-base text-[#E6EDF3] font-light">Send Direct Message</h2>
            </div>

            {contactSuccess ? (
              <div className="bg-[#0C2117] border border-[#124D31] text-[#4ADE80] rounded-[6px] p-5 text-[12.5px] space-y-3">
                <div className="flex items-center gap-2 font-light text-[14px]">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                  <span>Message Successfully Dispatched</span>
                </div>
                <p className="text-[12px] text-[#C9D1D9] leading-relaxed font-light">
                  Your inquiry has been logged and assigned a priority ticket ID. Our operations team will respond to your email address promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setContactSuccess(false)}
                  className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#4ADE80] border border-[#124D31] px-3 text-[11px]"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="vib-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="client@organization.com"
                      className="vib-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Subject / Inquired Service</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g. Enterprise 500k monthly SMS / Email Dispatch"
                    className="vib-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Provide details regarding your target volume, timeframe, specifications, and expectations..."
                    className="vib-input min-h-[85px] py-2"
                  />
                </div>

                <div className="pt-1 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#8B949E] font-mono hidden sm:inline">
                    DKIM/TLS Encrypted Transmission
                  </span>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="vib-btn-sm bg-[#0284C7] hover:bg-[#0369A1] text-white border border-[#0284C7] px-5 py-1.5 flex items-center gap-1.5 ml-auto shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{contactSubmitting ? 'Sending Ticket...' : 'Send Message Ticket'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter
        onNavigateHome={onNavigateHome}
        onNavigateToServices={onNavigateToServices}
        onNavigateToApply={onNavigateToApply}
        onNavigateToContact={onNavigateToContact}
        onOpenLogin={!isNotFound ? onOpenLogin : undefined}
        siteSettings={siteSettings}
      />

      {/* POPUP MODAL: Service Full Details */}
      {isDetailModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[620px] bg-[#161B22] border border-[#30363D] rounded-[10px] shadow-2xl flex flex-col relative my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#30363D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#38BDF8] overflow-hidden shrink-0">
                  {selectedService.iconUrl ? (
                    <img
                      src={selectedService.iconUrl}
                      alt={selectedService.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : selectedService.category?.toLowerCase().includes('sms') ? (
                    <MessageSquare className="w-5 h-5" />
                  ) : selectedService.category?.toLowerCase().includes('data') ? (
                    <Zap className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10.5px] font-mono px-2 py-0.2 rounded bg-[#12171F] text-[#38BDF8] border border-[#2A303C]">
                      {selectedService.category}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0C2117] text-[#4ADE80] border border-[#124D31]">
                      Active
                    </span>
                  </div>
                  <h3 className="text-[16px] text-[#E6EDF3] font-normal leading-snug">
                    {selectedService.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-7 h-7 rounded-md bg-[#1C2128] hover:bg-[#282E37] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Pricing & Category Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Pricing / Rate</span>
                  <div className="text-[13px] text-[#4ADE80] font-mono font-light">
                    {selectedService.price || 'Contact for Quote'}
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Service Category</span>
                  <div className="text-[13px] text-[#38BDF8] font-mono font-light">
                    {selectedService.category}
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Service Code</span>
                  <div className="text-[12px] text-[#E6EDF3] font-mono font-light truncate">
                    {selectedService.id}
                  </div>
                </div>
              </div>

              {/* Short Summary */}
              {selectedService.shortDescription && (
                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1 uppercase font-normal">
                    Operational Overview
                  </label>
                  <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[12.5px] text-[#E6EDF3] leading-relaxed font-light">
                    {selectedService.shortDescription}
                  </div>
                </div>
              )}

              {/* Comprehensive Description */}
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1 uppercase font-normal">
                  Full Description &amp; Technical Specifications
                </label>
                <div className="p-3.5 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[12.5px] text-[#C9D1D9] leading-relaxed whitespace-pre-wrap font-light">
                  {selectedService.description || selectedService.shortDescription || 'No additional technical specifications provided for this operational service.'}
                </div>
              </div>

              {/* Verified SLA Badge */}
              <div className="p-3 rounded-[6px] bg-[#0C2117] border border-[#124D31] flex items-center gap-2.5 text-[11.5px] text-[#4ADE80]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Managed by verified operators with daily quota oversight and cryptographic data delivery validation.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3 border-t border-[#30363D] bg-[#12171F] flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] border border-[#30363D] w-full sm:w-auto"
              >
                Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onNavigateToContact && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      onNavigateToContact();
                    }}
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Inquire / Request Service</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
