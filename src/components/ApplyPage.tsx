import React, { useState } from 'react';
import {
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  ArrowLeft,
  DollarSign,
  Award,
  Sparkles,
} from 'lucide-react';
import { PublicFooter } from './PublicFooter';

interface ApplyPageProps {
  onNavigateHome: () => void;
  onOpenLogin: () => void;
  onNavigateToServices?: () => void;
  onNavigateToContact?: () => void;
  siteSettings?: {
    siteName?: string;
    domain?: string;
  };
}

export const ApplyPage: React.FC<ApplyPageProps> = ({
  onNavigateHome,
  onOpenLogin,
  onNavigateToServices,
  onNavigateToContact,
  siteSettings,
}) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    dailyHours: 4,
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          experience: form.experience.trim(),
          dailyHours: Number(form.dailyHours),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSuccess(true);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        dailyHours: 4,
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'Unable to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0D1117] text-[#C9D1D9]">
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-[12px] text-[#8B949E]">
          Already have an account?{' '}
          <button
            onClick={onOpenLogin}
            className="text-[#38BDF8] hover:underline font-light ml-1"
          >
            Worker Login
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center max-w-[650px] mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-[#E6EDF3] tracking-tight">
          Join {siteSettings?.siteName || 'Team Dark Devil'}
        </h1>
        <p className="text-[13px] text-[#8B949E] mt-2 leading-relaxed">
          Submit your application to become a field worker.
        </p>
      </div>

      {/* Grid: Benefits + Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Perks & Requirements */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-[10px] bg-[#161B22] border border-[#30363D] space-y-4">
            <h2 className="text-[15px] font-normal text-[#E6EDF3] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#38BDF8]" />
              <span>Worker Program Highlights</span>
            </h2>

            <div className="space-y-3.5 text-[12.5px]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#22C55E] shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#E6EDF3] font-light block">Verified Data Allocations</span>
                  <span className="text-[#8B949E] leading-relaxed">
                    Clean, validated B2B email lists and carrier-verified SMS number batches dispatched daily.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#E6EDF3] font-light block">Flexible Working Hours</span>
                  <span className="text-[#8B949E] leading-relaxed">
                    Work at your own pace. Fulfill your assigned daily volume quota during your active shifts.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#FBBF24] shrink-0 mt-0.5">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#E6EDF3] font-light block">Performance Bonuses</span>
                  <span className="text-[#8B949E] leading-relaxed">
                    Higher deliverability rates unlock quota increases and top performer tier bonuses.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-[#12171F] border border-[#2A303C] flex items-center justify-center text-[#A855F7] shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#E6EDF3] font-light block">Dedicated Operator Tooling</span>
                  <span className="text-[#8B949E] leading-relaxed">
                    Access to our pre-configured automation templates, rotation scripts, and video guides.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[10px] bg-[#12171F] border border-[#2A303C] text-[12px] text-[#8B949E] space-y-2">
            <span className="text-[#E6EDF3] font-light block text-[13px]">
              Minimum Requirements
            </span>
            <ul className="list-disc list-inside space-y-1 text-[#8B949E]">
              <li>Stable internet connection and PC or Android terminal</li>
              <li>Basic knowledge of email or SMS sending protocols</li>
              <li>Commitment to meet agreed daily volume quotas</li>
              <li>Professional communication with team leadership</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-7 rounded-[10px] bg-[#161B22] border border-[#30363D] shadow-xl">
            <div className="mb-5">
              <h2 className="text-[17px] font-normal text-[#E6EDF3]">Worker Application Form</h2>
              <p className="text-[12.5px] text-[#8B949E] mt-1">
                Fill out the application below. Accounts are administrator-verified prior to activation.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-[6px] bg-[#280D12] border border-[#5C1D24] text-[#F87171] text-[12px] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="p-6 rounded-[8px] bg-[#0E2F1B] border border-[#166534] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#166534]/50 border border-[#22C55E] flex items-center justify-center mx-auto text-[#22C55E]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-normal text-[#E6EDF3]">Application Submitted Successfully</h3>
                <p className="text-[13px] text-[#A7F3D0] max-w-[430px] mx-auto leading-relaxed">
                  Your worker profile has been submitted to team leadership. Once reviewed, your workspace
                  username and password will be sent to your provided email address.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#E6EDF3] border border-[#30363D] inline-flex items-center gap-1.5"
                  >
                    <span>Submit Another Application</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                      Full Name <span className="text-[#F87171]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="vib-input text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                      Email Address <span className="text-[#F87171]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="worker@gmail.com"
                      className="vib-input text-[13px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                      WhatsApp / Telegram / Phone
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000 or @username"
                      className="vib-input text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                      Daily Available Hours
                    </label>
                    <select
                      value={form.dailyHours}
                      onChange={(e) => setForm({ ...form, dailyHours: Number(e.target.value) })}
                      className="vib-input text-[13px]"
                    >
                      <option value={2}>2 - 4 Hours / Day (Part Time)</option>
                      <option value={4}>4 - 6 Hours / Day (Standard)</option>
                      <option value={8}>8+ Hours / Day (Full Time Dedicated)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                    Relevant Sending Experience
                  </label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. SMTP bulk mailers, SMS gateways, Termux script automation..."
                    className="vib-input text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                    Hardware / Software Setup &amp; Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your equipment (e.g. Windows PC, Android phones, private proxy/VPN capabilities)..."
                    className="vib-input text-[13px] py-2 min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="vib-btn-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] w-full font-light justify-center flex items-center gap-2 py-2.5 text-[13px] shadow-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Processing Application...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Worker Application</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>

    <PublicFooter
      onNavigateHome={onNavigateHome}
      onNavigateToServices={onNavigateToServices}
      onNavigateToApply={() => {}}
      onNavigateToContact={onNavigateToContact}
      onOpenLogin={onOpenLogin}
      siteSettings={siteSettings}
    />
  </div>
);
};
