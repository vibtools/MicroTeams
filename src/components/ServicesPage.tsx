import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  ArrowRight,
  CheckCircle2,
  Mail,
  Zap,
  Shield,
  Server,
  ChevronRight,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Tag,
  Clock,
  Briefcase,
} from 'lucide-react';
import { ServiceItem } from '../types';
import { PublicFooter } from './PublicFooter';

interface ServicesPageProps {
  onNavigateToContact?: () => void;
  onNavigateToApply?: () => void;
  onNavigateHome?: () => void;
  onNavigateToServices?: () => void;
  onOpenLogin?: () => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    domain?: string;
    announcement?: string;
  };
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigateToContact,
  onNavigateToApply,
  onNavigateHome,
  onNavigateToServices,
  onOpenLogin,
  siteSettings,
}) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.services)) {
          setServices(data.services);
        }
      }
    } catch (err) {
      console.warn('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category || 'Operations')))];

  const filteredServices = services.filter((srv) => {
    // Only show active services in public view
    if (srv.status === 'inactive') return false;

    const matchesCat = selectedCategory === 'all' || srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      srv.name.toLowerCase().includes(query) ||
      srv.category.toLowerCase().includes(query) ||
      (srv.shortDescription && srv.shortDescription.toLowerCase().includes(query)) ||
      (srv.description && srv.description.toLowerCase().includes(query));

    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('email') || cat.includes('campaign')) return <Mail className="w-4 h-4" />;
    if (cat.includes('sms') || cat.includes('message') || cat.includes('otp')) return <MessageSquare className="w-4 h-4" />;
    if (cat.includes('data') || cat.includes('lead')) return <Zap className="w-4 h-4" />;
    if (cat.includes('security') || cat.includes('verify')) return <Shield className="w-4 h-4" />;
    if (cat.includes('infra') || cat.includes('cloud')) return <Server className="w-4 h-4" />;
    return <Layers className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9]">
      {/* Announcement banner if available */}
      {siteSettings?.announcement && (
        <div className="bg-[#11161D] border-b border-[#30363D] py-1.5 px-4 text-center">
          <p className="text-[11.5px] text-[#38BDF8] flex items-center justify-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>{siteSettings.announcement}</span>
          </p>
        </div>
      )}

      {/* Hero Header */}
      <section className="border-b border-[#21262D] bg-[#12171F]/60">
        <div className="max-w-[1280px] mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161B22] border border-[#30363D] text-[11px] text-[#38BDF8] mb-4">
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Enterprise Capabilities &amp; Work Operations</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-light text-[#E6EDF3] tracking-tight mb-3">
            Team Operations &amp; Specialized Services
          </h1>
          <p className="text-[13px] sm:text-[14.5px] text-[#8B949E] max-w-2xl mx-auto font-light leading-relaxed">
            High-volume distributed operations, dedicated data verification pipelines, enterprise delivery channels, and customized microjob workflows managed by {siteSettings?.siteName || 'Team Dark Devil'}.
          </p>

          {/* Quick Stat Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-8">
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left">
              <span className="text-[10.5px] text-[#8B949E] block mb-0.5 uppercase">Delivery Rate</span>
              <span className="text-[16px] font-mono text-[#4ADE80] font-light">99.8% SLA</span>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left">
              <span className="text-[10.5px] text-[#8B949E] block mb-0.5 uppercase">Active Operators</span>
              <span className="text-[16px] font-mono text-[#38BDF8] font-light">24/7 Dispatch</span>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left">
              <span className="text-[10.5px] text-[#8B949E] block mb-0.5 uppercase">Daily Capacity</span>
              <span className="text-[16px] font-mono text-[#E6EDF3] font-light">1M+ Records</span>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 text-left">
              <span className="text-[10.5px] text-[#8B949E] block mb-0.5 uppercase">Turnaround</span>
              <span className="text-[16px] font-mono text-[#F59E0B] font-light">Instant / Same-Day</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Controls + Grid */}
      <section className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Search and Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-light capitalize whitespace-nowrap transition-colors ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#2563EB] text-white border border-[#2563EB]'
                    : 'bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] hover:bg-[#1C2128]'
                }`}
              >
                {cat === 'all' ? 'All Services' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-[280px] shrink-0">
            <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vib-input pl-9 text-[12px] w-full"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-[12.5px] text-[#8B949E]">Loading operational services...</span>
          </div>
        )}

        {/* Services Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-[#161B22] border border-[#30363D] hover:border-[#38BDF8]/50 rounded-[8px] p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Icon & Category Tag */}
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="w-10 h-10 rounded-[8px] bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#38BDF8] overflow-hidden shrink-0 group-hover:border-[#38BDF8]/60 transition-colors">
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
                      ) : (
                        getCategoryIcon(srv.category)
                      )}
                    </div>

                    <span className="text-[10.5px] px-2 py-0.5 rounded font-mono bg-[#12171F] text-[#38BDF8] border border-[#2A303C]">
                      {srv.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] text-[#E6EDF3] font-light mb-1.5 group-hover:text-white transition-colors">
                    {srv.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-[12px] text-[#8B949E] leading-relaxed line-clamp-3 mb-4 font-light">
                    {srv.shortDescription || srv.description || 'Professional operational service executed by verified team operators.'}
                  </p>
                </div>

                {/* Bottom Footer: Price & Details Action Button */}
                <div className="pt-3.5 border-t border-[#21262D] flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6E7681] uppercase font-light">Rate / Pricing</span>
                    <span className="text-[12.5px] font-mono text-[#4ADE80] font-light">
                      {srv.price || 'Contact for Quote'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService(srv);
                      setIsDetailModalOpen(true);
                    }}
                    className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#E6EDF3] hover:text-[#38BDF8] border border-[#30363D] hover:border-[#38BDF8]/50 flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] transition-all"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-12 text-center max-w-md mx-auto my-8">
            <Layers className="w-10 h-10 text-[#6E7681] mx-auto mb-3" />
            <h3 className="text-[14px] text-[#E6EDF3] font-light mb-1">No Services Found</h3>
            <p className="text-[12px] text-[#8B949E] mb-4">
              {searchQuery
                ? `No services matched your search query "${searchQuery}".`
                : 'No operational services are currently listed in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="vib-btn-sm bg-[#12171F] text-[#38BDF8] border border-[#30363D]"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Bottom CTA Box */}
        <div className="mt-14 bg-[#12171F] border border-[#30363D] rounded-[10px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider">Custom Enterprise Operations</span>
            <h3 className="text-[18px] text-[#E6EDF3] font-light">Need a tailored high-volume operational pipeline?</h3>
            <p className="text-[12.5px] text-[#8B949E] max-w-xl font-light">
              We engineer dedicated custom solutions for large-scale email outreach, targeted SMS verification channels, and high-security data management.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {onNavigateToContact && (
              <button
                onClick={onNavigateToContact}
                className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] px-4 py-2 text-[12.5px] flex items-center gap-1.5 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Operations Team</span>
              </button>
            )}

            {onNavigateToApply && (
              <button
                onClick={onNavigateToApply}
                className="vib-btn-sm bg-[#161B22] hover:bg-[#1C2128] text-[#C9D1D9] hover:text-white border border-[#30363D] px-4 py-2 text-[12.5px] flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Join As Operator</span>
              </button>
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
        onOpenLogin={onOpenLogin}
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
                  ) : (
                    getCategoryIcon(selectedService.category)
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
              {/* Rate & Category Stats Bar */}
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
