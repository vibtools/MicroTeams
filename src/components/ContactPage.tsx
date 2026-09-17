import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Globe,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { PublicFooter } from './PublicFooter';

interface ContactPageProps {
  onNavigateHome: () => void;
  onNavigateToServices?: () => void;
  onNavigateToApply?: () => void;
  onOpenLogin?: () => void;
  siteSettings?: {
    siteName?: string;
    domain?: string;
    logoUrl?: string;
  };
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
  onNavigateToServices,
  onNavigateToApply,
  onOpenLogin,
  siteSettings,
}) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || 'General Inquiry',
          message: form.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Unable to deliver message. Please try again.');
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

        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#161B22] border border-[#30363D] text-[11px] text-[#8B949E]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span>Support Desk Online</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-[650px] mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-[#E6EDF3] tracking-tight">
          Contact {siteSettings?.siteName || 'Team Dark Devil'}
        </h1>
        <p className="text-[13px] text-[#8B949E] mt-2 leading-relaxed">
          Send us a message and our team will get back to you.
        </p>
      </div>

      {/* Grid: Contact Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Channels */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-[10px] bg-[#161B22] border border-[#30363D] space-y-4">
            <h2 className="text-[15px] font-normal text-[#E6EDF3] flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#38BDF8]" />
              <span>Official Channels</span>
            </h2>
            <p className="text-[12.5px] text-[#8B949E] leading-relaxed">
              We monitor all incoming inquiries 24/7 with an average response time of under 4 hours.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-[8px] bg-[#0D1117] border border-[#21262D] flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-light text-[#E6EDF3]">Email Inquiries</div>
                  <div className="text-[11.5px] text-[#8B949E] font-mono">support@{siteSettings?.domain || 'darkdevil.team'}</div>
                  <div className="text-[10px] text-[#6E7681] mt-0.5">Encrypted PGP Available</div>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#0D1117] border border-[#21262D] flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-light text-[#E6EDF3]">Direct Telegram Desk</div>
                  <div className="text-[11.5px] text-[#8B949E] font-mono">@DarkDevil_HQ</div>
                  <div className="text-[10px] text-[#6E7681] mt-0.5">For urgent team matters</div>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#0D1117] border border-[#21262D] flex items-start gap-3">
                <Globe className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-light text-[#E6EDF3]">System Domain</div>
                  <div className="text-[11.5px] text-[#8B949E] font-mono">https://{siteSettings?.domain || 'darkdevil.team'}</div>
                  <div className="text-[10px] text-[#6E7681] mt-0.5">TLS 1.3 High-Grade Gateway</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[10px] bg-[#12171F] border border-[#2A303C] text-[12px] text-[#8B949E] space-y-2">
            <div className="flex items-center gap-2 text-[#E6EDF3] font-light text-[13px]">
              <Shield className="w-4 h-4 text-[#38BDF8]" />
              <span>Confidentiality Guaranteed</span>
            </div>
            <p className="leading-relaxed">
              All communications are routed through secure, encrypted internal servers. We do not
              share inquiries or partner details with third parties.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-7 rounded-[10px] bg-[#161B22] border border-[#30363D] shadow-xl">
            <div className="mb-5">
              <h2 className="text-[17px] font-normal text-[#E6EDF3]">Send a Direct Message</h2>
              <p className="text-[12.5px] text-[#8B949E] mt-1">
                Fill in the details below. Required fields are marked with an asterisk (*).
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
                <h3 className="text-base font-normal text-[#E6EDF3]">Message Dispatched</h3>
                <p className="text-[13px] text-[#A7F3D0] max-w-[420px] mx-auto leading-relaxed">
                  Thank you for reaching out. Your inquiry has been logged in our secure inbox and a team
                  representative will respond to your provided email address shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#E6EDF3] border border-[#30363D] mt-2 inline-flex items-center gap-1.5"
                >
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                      Your Name <span className="text-[#F87171]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
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
                      placeholder="alex@organization.com"
                      className="vib-input text-[13px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Campaign Volume Inquiry / Technical Question"
                    className="vib-input text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] text-[#8B949E] mb-1.5 font-light">
                    Your Message <span className="text-[#F87171]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide detailed information regarding your inquiry..."
                    className="vib-input text-[13px] py-2.5 min-h-[120px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="vib-btn-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] w-full font-light justify-center flex items-center gap-2 py-2.5 text-[13px] shadow-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
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
      onNavigateToApply={onNavigateToApply}
      onNavigateToContact={() => {}}
      onOpenLogin={onOpenLogin}
      siteSettings={siteSettings}
    />
  </div>
);
};
