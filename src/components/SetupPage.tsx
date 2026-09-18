import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cloud,
  FileText,
  Upload,
  Download,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Server,
  Zap,
  Check,
  Globe,
  Mail,
  Send,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface SetupPageProps {
  onNavigateHome: () => void;
  onNavigateToLogin: () => void;
  initialSiteSettings?: Partial<SiteSettings>;
}

interface TestResult {
  success: boolean;
  latencyMs?: number;
  message?: string;
  error?: string;
  tablesCount?: number;
  steps?: Array<{ name: string; status: string; detail: string }>;
}

export const SetupPage: React.FC<SetupPageProps> = ({
  onNavigateHome,
  onNavigateToLogin,
  initialSiteSettings,
}) => {
  // Setup steps: 1: Welcome, 2: ENV/Connections, 3: Basic Details, 4: First Admin, 5: Complete/Locked
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAlreadySetup, setIsAlreadySetup] = useState<boolean>(false);
  const [existingAdminCount, setExistingAdminCount] = useState<number>(0);
  const [redirectTimer, setRedirectTimer] = useState<number>(6);

  // Step 2: ENV Configuration states
  const [databaseUrl, setDatabaseUrl] = useState<string>('');
  const [showDbPassword, setShowDbPassword] = useState<boolean>(false);
  const [r2AccountId, setR2AccountId] = useState<string>('');
  const [r2Endpoint, setR2Endpoint] = useState<string>('');
  const [r2AccessKeyId, setR2AccessKeyId] = useState<string>('');
  const [r2SecretAccessKey, setR2SecretAccessKey] = useState<string>('');
  const [showR2Secret, setShowR2Secret] = useState<boolean>(false);
  const [r2BucketName, setR2BucketName] = useState<string>('');
  const [r2PublicUrl, setR2PublicUrl] = useState<string>('');
  const [r2Region, setR2Region] = useState<string>('auto');
  const [rawEnvContent, setRawEnvContent] = useState<string>('');

  // Connection testing states
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatusText, setProgressStatusText] = useState<string>('');
  const [dbTestResult, setDbTestResult] = useState<TestResult | null>(null);
  const [r2TestResult, setR2TestResult] = useState<TestResult | null>(null);
  const [envVerificationError, setEnvVerificationError] = useState<string | null>(null);
  const [envUploadNotice, setEnvUploadNotice] = useState<string | null>(null);

  // Step 3: Basic Details states
  const [siteName, setSiteName] = useState<string>('Team Dark Devil');
  const [domain, setDomain] = useState<string>('darkdevil.team');
  const [supportEmail, setSupportEmail] = useState<string>('support@darkdevil.team');
  const [supportTelegram, setSupportTelegram] = useState<string>('@darkdevil_admin');
  const [announcement, setAnnouncement] = useState<string>(
    '🔥 Notice: Welcome to Team Dark Devil Worker & Operations Platform.'
  );

  // Step 4: First Admin User states
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminFullName, setAdminFullName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Step 5: Finalized details
  const [createdAdminInfo, setCreatedAdminInfo] = useState<{
    id: string;
    username: string;
    email: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check initial setup status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      setPageLoading(true);
      try {
        const res = await fetch('/api/setup/status');
        if (res.ok) {
          const data = await res.json();
          setIsLocked(Boolean(data.isLocked));
          setIsAlreadySetup(Boolean(data.isConfigured || data.isLocked));
          setExistingAdminCount(data.adminCount || 0);

          if (data.siteSettings) {
            if (data.siteSettings.siteName) setSiteName(data.siteSettings.siteName);
            if (data.siteSettings.domain) setDomain(data.siteSettings.domain);
            if (data.siteSettings.supportEmail) setSupportEmail(data.siteSettings.supportEmail);
            if (data.siteSettings.supportTelegram) setSupportTelegram(data.siteSettings.supportTelegram);
            if (data.siteSettings.announcement) setAnnouncement(data.siteSettings.announcement);
            if (data.siteSettings.r2Endpoint) setR2Endpoint(data.siteSettings.r2Endpoint);
            if (data.siteSettings.r2AccessKeyId) setR2AccessKeyId(data.siteSettings.r2AccessKeyId);
            if (data.siteSettings.r2BucketName) setR2BucketName(data.siteSettings.r2BucketName);
            if (data.siteSettings.r2PublicUrl) setR2PublicUrl(data.siteSettings.r2PublicUrl);
            if (data.siteSettings.r2AccountId) setR2AccountId(data.siteSettings.r2AccountId);
            if (data.siteSettings.r2Region) setR2Region(data.siteSettings.r2Region);
          }
        }
      } catch (e) {
        console.warn('Status check warning:', e);
      } finally {
        setPageLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // Automatic countdown redirect when returning to an already setup instance
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAlreadySetup || isLocked) {
      timer = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onNavigateToLogin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAlreadySetup, isLocked, onNavigateToLogin]);

  // Download sample ENV template (.txt)
  const handleDownloadEnvTemplate = () => {
    const templateText = `# =========================================================================
# TEAM DARK DEVIL - ENTERPRISE ENVIRONMENT CONFIGURATION
# =========================================================================

# 1. PostgreSQL Database Configuration (Neon, Cloud SQL, Supabase, or AWS RDS)
DATABASE_URL=postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require

# 2. Cloudflare R2 Object Storage (S3-Compatible Credentials)
R2_ACCOUNT_ID=ae90d59314e423e753db2c5956f1c76d
R2_ENDPOINT=https://ae90d59314e423e753db2c5956f1c76d.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=38be92f366f0b2cd7609c59a406842a1
R2_SECRET_ACCESS_KEY=3ac60f393d1da3dff5fa9b099f95a81a4a17176861293a3fba76e62944856281
R2_BUCKET_NAME=darkdevil-assets
R2_PUBLIC_URL=https://pub-aee370beb1e3411791b4ec4147120a3f.r2.dev
R2_REGION=auto
`;

    const blob = new Blob([templateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'darkdevil_env_template.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse uploaded .txt or .env file
  const handleEnvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || '';
        setRawEnvContent(text);
        let foundKeysCount = 0;
        const lines = text.split('\n');

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;

          const eqIdx = trimmed.indexOf('=');
          if (eqIdx === -1) return;

          const key = trimmed.substring(0, eqIdx).trim();
          let value = trimmed.substring(eqIdx + 1).trim();

          // Strip surrounding quotes
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }

          if (key === 'DATABASE_URL') {
            setDatabaseUrl(value);
            foundKeysCount++;
          } else if (key === 'R2_ACCOUNT_ID') {
            setR2AccountId(value);
            foundKeysCount++;
          } else if (key === 'R2_ENDPOINT') {
            setR2Endpoint(value);
            foundKeysCount++;
          } else if (key === 'R2_ACCESS_KEY_ID') {
            setR2AccessKeyId(value);
            foundKeysCount++;
          } else if (key === 'R2_SECRET_ACCESS_KEY') {
            setR2SecretAccessKey(value);
            foundKeysCount++;
          } else if (key === 'R2_BUCKET_NAME') {
            setR2BucketName(value);
            foundKeysCount++;
          } else if (key === 'R2_PUBLIC_URL') {
            setR2PublicUrl(value);
            foundKeysCount++;
          } else if (key === 'R2_REGION') {
            setR2Region(value);
            foundKeysCount++;
          }
        });

        setEnvUploadNotice(`Successfully loaded ${foundKeysCount} parameters from ${file.name}`);
        setTimeout(() => setEnvUploadNotice(null), 4000);
      } catch (err) {
        setEnvVerificationError('Error parsing uploaded file. Verify file format.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Step 2: Handle Connect & Test button click
  const handleConnectAndVerify = async () => {
    setEnvVerificationError(null);
    setDbTestResult(null);
    setR2TestResult(null);

    // Validation
    if (!databaseUrl.trim()) {
      setEnvVerificationError('PostgreSQL DATABASE_URL is required to connect.');
      return;
    }
    if (!r2Endpoint.trim() || !r2AccessKeyId.trim() || !r2SecretAccessKey.trim() || !r2BucketName.trim()) {
      setEnvVerificationError('Cloudflare R2 Endpoint, Access Key, Secret Key, and Bucket Name are required.');
      return;
    }

    setIsConnecting(true);
    setProgressPercent(15);
    setProgressStatusText('Parsing connection parameters and validating syntax...');

    try {
      // Step 1: Progress step
      await new Promise((r) => setTimeout(r, 400));
      setProgressPercent(35);
      setProgressStatusText('Executing PostgreSQL database handshake & table inspection...');

      // Step 2: Send test request to server
      const testResponse = await fetch('/api/setup/test-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUrl: databaseUrl.trim(),
          r2Endpoint: r2Endpoint.trim(),
          r2AccessKeyId: r2AccessKeyId.trim(),
          r2SecretAccessKey: r2SecretAccessKey.trim(),
          r2BucketName: r2BucketName.trim(),
          r2PublicUrl: r2PublicUrl.trim(),
          r2AccountId: r2AccountId.trim(),
          r2Region: r2Region.trim(),
        }),
      });

      setProgressPercent(75);
      setProgressStatusText('Testing Cloudflare R2 S3 handshake & read/write probe...');

      const testData = await testResponse.json();
      await new Promise((r) => setTimeout(r, 300));

      setDbTestResult(testData.db);
      setR2TestResult(testData.r2);

      if (!testData.success) {
        setProgressPercent(100);
        setProgressStatusText('Diagnostics completed with issues. Check details below.');
        const failedMsgs: string[] = [];
        if (!testData.db?.success) failedMsgs.push(`DB: ${testData.db?.message || 'Connection failed'}`);
        if (!testData.r2?.success) failedMsgs.push(`R2: ${testData.r2?.message || 'Authentication failed'}`);
        setEnvVerificationError(failedMsgs.join(' • '));
        setIsConnecting(false);
        return;
      }

      // Check if existing production database with admin accounts was detected!
      if (testData.alreadyConfigured) {
        setProgressPercent(100);
        setProgressStatusText('Existing platform database & accounts recognized!');

        // Apply env
        await fetch('/api/setup/apply-env', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            databaseUrl: databaseUrl.trim(),
            r2Endpoint: r2Endpoint.trim(),
            r2AccessKeyId: r2AccessKeyId.trim(),
            r2SecretAccessKey: r2SecretAccessKey.trim(),
            r2BucketName: r2BucketName.trim(),
            r2PublicUrl: r2PublicUrl.trim(),
            r2AccountId: r2AccountId.trim(),
            r2Region: r2Region.trim(),
            rawEnvContent,
          }),
        });

        setIsAlreadySetup(true);
        setIsLocked(true);
        setExistingAdminCount(testData.adminCount || 1);
        setIsConnecting(false);
        return;
      }

      // Fresh Database: Apply settings and auto open next setup page (Step 3)
      setProgressPercent(90);
      setProgressStatusText('Persisting verified environment & preparing tables...');

      const applyRes = await fetch('/api/setup/apply-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUrl: databaseUrl.trim(),
          r2Endpoint: r2Endpoint.trim(),
          r2AccessKeyId: r2AccessKeyId.trim(),
          r2SecretAccessKey: r2SecretAccessKey.trim(),
          r2BucketName: r2BucketName.trim(),
          r2PublicUrl: r2PublicUrl.trim(),
          r2AccountId: r2AccountId.trim(),
          r2Region: r2Region.trim(),
          rawEnvContent,
        }),
      });

      if (!applyRes.ok) {
        throw new Error('Could not persist verified environment parameters.');
      }

      setProgressPercent(100);
      setProgressStatusText('Verified successfully! Opening platform details...');

      await new Promise((r) => setTimeout(r, 600));
      setIsConnecting(false);
      setCurrentStep(3);
    } catch (err: any) {
      setProgressPercent(100);
      setIsConnecting(false);
      setEnvVerificationError(err?.message || 'Unexpected error during connection test.');
    }
  };

  // Step 3: Handle Save Basic Details
  const handleSaveBasicDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/setup/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: siteName.trim(),
          domain: domain.trim(),
          supportEmail: supportEmail.trim(),
          supportTelegram: supportTelegram.trim(),
          announcement: announcement.trim(),
        }),
      });
      // Move to Step 4: Create Admin
      setCurrentStep(4);
    } catch (err) {
      // Proceed even on warning
      setCurrentStep(4);
    }
  };

  // Step 4: Create First Root Admin User
  const handleCreateFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminUsername.trim()) {
      setAdminError('Administrator username is required.');
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setAdminError('A valid administrator email address is required.');
      return;
    }
    if (adminPassword.length < 6) {
      setAdminError('Password must be at least 6 characters.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setAdminError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingAdmin(true);

    try {
      const res = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          name: adminFullName.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create root administrator.');
      }

      setCreatedAdminInfo(data.admin);
      setIsLocked(true);
      setCurrentStep(5);
    } catch (err: any) {
      setAdminError(err?.message || 'Error initializing administrator.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER: Loading State
  // ---------------------------------------------------------------------------
  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center bg-[#0B0F17] p-4 text-[#8B949E]">
        <div className="flex items-center gap-2 text-[12px] font-light">
          <RefreshCw className="w-4 h-4 animate-spin text-[#38BDF8]" />
          <span>Probing system configuration status...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Already Setup / Locked Screen (Thank You For Coming Back)
  // ---------------------------------------------------------------------------
  if (isAlreadySetup || isLocked) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 sm:p-5 bg-[#0B0F17]">
        <div className="w-full max-w-[500px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4 relative">
          {/* Header Card */}
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#0E2A1E] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13px] text-[#E6EDF3] font-normal tracking-tight">
                  THANK YOU FOR COMING BACK
                </div>
                <div className="text-[10.5px] text-[#8B949E] font-mono">
                  Platform Setup Completed & Locked
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 font-light">
              SECURED
            </span>
          </div>

          {/* Body Notice */}
          <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-3 text-[12px] text-[#C9D1D9] font-light space-y-2.5">
            <div className="text-[12px] text-[#E6EDF3] font-normal">
              System installation has already been completed.
            </div>
            <p className="text-[#8B949E] text-[11.5px] leading-relaxed">
              Your PostgreSQL database and Cloudflare R2 storage are fully configured and locked.
              To ensure platform integrity and protect production infrastructure, the initial setup
              wizard is permanently locked.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-[#161B22] border border-[#21262D] rounded-[4px] p-2">
                <div className="text-[10px] text-[#8B949E] uppercase font-mono">Database Status</div>
                <div className="text-[11.5px] text-[#22C55E] flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Active & Migrated
                </div>
              </div>
              <div className="bg-[#161B22] border border-[#21262D] rounded-[4px] p-2">
                <div className="text-[10px] text-[#8B949E] uppercase font-mono">Leader Gateway</div>
                <div className="text-[11.5px] text-[#38BDF8] flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  {existingAdminCount > 0 ? `${existingAdminCount} Admin(s) Ready` : 'Ready'}
                </div>
              </div>
            </div>
          </div>

          {/* Auto redirect info & Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] font-light">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                Auto-redirecting to Leader Gateway in {redirectTimer}s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="vib-btn-md bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444] rounded-[6px] text-[12px] font-normal flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Leader Admin Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onNavigateHome}
                className="vib-btn-md bg-[#161B22] hover:bg-[#1C2128] text-[#C9D1D9] border border-[#30363D] rounded-[6px] text-[12px] font-light flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Public Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Step 1 - Welcome & Guideline
  // ---------------------------------------------------------------------------
  if (currentStep === 1) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 sm:p-5 bg-[#0B0F17]">
        <div className="w-full max-w-[560px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#12171F] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
                <Zap className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <div>
                <div className="text-[13px] text-[#E6EDF3] font-normal tracking-tight">
                  PLATFORM CORE SETUP WIZARD
                </div>
                <div className="text-[10px] text-[#8B949E] font-mono">
                  Step 1 of 4 • Guidelines & System Requirements
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-light">
              INITIAL INSTALL
            </span>
          </div>

          {/* Guidelines Box */}
          <div className="space-y-2.5">
            <div className="text-[12px] text-[#E6EDF3] font-normal">
              Before proceeding, make sure you have the following credentials ready:
            </div>

            <div className="space-y-2">
              {/* Item 1: Database */}
              <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center shrink-0 mt-0.5 text-[#38BDF8]">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-[#E6EDF3] font-normal">
                    PostgreSQL Database URL
                  </div>
                  <div className="text-[10.5px] text-[#8B949E] font-light leading-relaxed">
                    Connection string from Neon, Cloud SQL, Supabase, or AWS RDS. Tables and schemas
                    will be automatically configured.
                  </div>
                </div>
              </div>

              {/* Item 2: Cloudflare R2 */}
              <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center shrink-0 mt-0.5 text-[#F59E0B]">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-[#E6EDF3] font-normal">
                    Cloudflare R2 Object Storage
                  </div>
                  <div className="text-[10.5px] text-[#8B949E] font-light leading-relaxed">
                    S3 API Token credentials (Endpoint, Access Key, Secret Key, and Bucket Name) for
                    data files, proofs, and branding assets.
                  </div>
                </div>
              </div>

              {/* Item 3: First Admin Account */}
              <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center shrink-0 mt-0.5 text-[#22C55E]">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-[#E6EDF3] font-normal">
                    Super Administrator Creation
                  </div>
                  <div className="text-[10.5px] text-[#8B949E] font-light leading-relaxed">
                    First root administrator will be stored in <span className="font-mono text-[#E6EDF3]">dd_admin_users</span> with full access.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-[#21262D] pt-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="vib-btn-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] rounded-[6px] text-[12px] font-normal flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Step 2 - ENV Setup & Connection Verification
  // ---------------------------------------------------------------------------
  if (currentStep === 2) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 sm:p-5 bg-[#0B0F17]">
        <div className="w-full max-w-[620px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#12171F] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
                <Server className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <div>
                <div className="text-[13px] text-[#E6EDF3] font-normal tracking-tight">
                  STEP 2 • ENVIRONMENT & CREDENTIALS
                </div>
                <div className="text-[10px] text-[#8B949E] font-mono">
                  Configure Database & Cloudflare R2 Connection
                </div>
              </div>
            </div>

            {/* Quick Actions: Download Template & Upload .txt */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadEnvTemplate}
                title="Download formatted sample template"
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] rounded-[6px] text-[11px] font-light flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#38BDF8]" />
                <span className="hidden sm:inline">Download Template</span>
                <span className="sm:hidden">Template</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload .env or .txt file to auto-populate fields"
                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] rounded-[6px] text-[11px] font-light flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-[#22C55E]" />
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">Upload</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.env,text/plain"
                className="hidden"
                onChange={handleEnvFileUpload}
              />
            </div>
          </div>

          {/* Success / Error Banner */}
          {envUploadNotice && (
            <div className="bg-[#0E2A1E] border border-[#22C55E]/40 text-[#22C55E] rounded-[6px] p-2 text-[11.5px] font-light flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{envUploadNotice}</span>
            </div>
          )}

          {envVerificationError && (
            <div className="bg-[#280D12] border border-[#EF4444]/40 text-[#EF4444] rounded-[6px] p-2 text-[11.5px] font-light flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{envVerificationError}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5">
            {/* 1. Database Section */}
            <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-mono text-[#38BDF8] flex items-center gap-1.5">
                  <Database className="w-3 h-3" />
                  PostgreSQL Connection (DATABASE_URL)
                </span>
                <span className="text-[10px] text-[#8B949E]">Neon / Cloud SQL</span>
              </div>

              <div className="relative">
                <input
                  type={showDbPassword ? 'text' : 'password'}
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  placeholder="postgresql://user:password@host:port/dbname?sslmode=require"
                  className="vib-input pr-8 text-[11.5px] font-mono"
                  disabled={isConnecting}
                />
                <button
                  type="button"
                  onClick={() => setShowDbPassword(!showDbPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
                >
                  {showDbPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {dbTestResult && (
                <div
                  className={`text-[10.5px] font-mono px-2 py-1 rounded flex items-center justify-between ${
                    dbTestResult.success
                      ? 'bg-[#0E2A1E] text-[#22C55E] border border-[#22C55E]/30'
                      : 'bg-[#280D12] text-[#EF4444] border border-[#EF4444]/30'
                  }`}
                >
                  <span>{dbTestResult.message}</span>
                  {dbTestResult.latencyMs !== undefined && (
                    <span className="text-[#8B949E]">{dbTestResult.latencyMs}ms</span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Cloudflare R2 Section */}
            <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-mono text-[#F59E0B] flex items-center gap-1.5">
                  <Cloud className="w-3 h-3" />
                  Cloudflare R2 Object Storage
                </span>
                <span className="text-[10px] text-[#8B949E]">S3 Compatible</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1">R2 Endpoint</label>
                  <input
                    type="text"
                    value={r2Endpoint}
                    onChange={(e) => setR2Endpoint(e.target.value)}
                    placeholder="https://<account_id>.r2.cloudflarestorage.com"
                    className="vib-input text-[11px] font-mono"
                    disabled={isConnecting}
                  />
                </div>

                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1">R2 Bucket Name</label>
                  <input
                    type="text"
                    value={r2BucketName}
                    onChange={(e) => setR2BucketName(e.target.value)}
                    placeholder="darkdevil-assets"
                    className="vib-input text-[11px] font-mono"
                    disabled={isConnecting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1">Access Key ID</label>
                  <input
                    type="text"
                    value={r2AccessKeyId}
                    onChange={(e) => setR2AccessKeyId(e.target.value)}
                    placeholder="38be92f366f0..."
                    className="vib-input text-[11px] font-mono"
                    disabled={isConnecting}
                  />
                </div>

                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1">Secret Access Key</label>
                  <div className="relative">
                    <input
                      type={showR2Secret ? 'text' : 'password'}
                      value={r2SecretAccessKey}
                      onChange={(e) => setR2SecretAccessKey(e.target.value)}
                      placeholder="3ac60f393d1..."
                      className="vib-input pr-8 text-[11px] font-mono"
                      disabled={isConnecting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowR2Secret(!showR2Secret)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
                    >
                      {showR2Secret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1">
                    Public URL / Custom Domain (Optional)
                  </label>
                  <input
                    type="text"
                    value={r2PublicUrl}
                    onChange={(e) => setR2PublicUrl(e.target.value)}
                    placeholder="https://pub-xxx.r2.dev"
                    className="vib-input text-[11px] font-mono"
                    disabled={isConnecting}
                  />
                </div>

                <div>
                  <label className="text-[10.5px] text-[#8B949E] block mb-1">
                    Cloudflare Account ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={r2AccountId}
                    onChange={(e) => setR2AccountId(e.target.value)}
                    placeholder="ae90d593..."
                    className="vib-input text-[11px] font-mono"
                    disabled={isConnecting}
                  />
                </div>
              </div>

              {r2TestResult && (
                <div
                  className={`text-[10.5px] font-mono px-2 py-1 rounded flex items-center justify-between ${
                    r2TestResult.success
                      ? 'bg-[#0E2A1E] text-[#22C55E] border border-[#22C55E]/30'
                      : 'bg-[#280D12] text-[#EF4444] border border-[#EF4444]/30'
                  }`}
                >
                  <span>{r2TestResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar (Visible during connection testing) */}
          {isConnecting && (
            <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#C9D1D9] font-light flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-[#38BDF8]" />
                  {progressStatusText}
                </span>
                <span className="text-[#38BDF8] font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#161B22] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#38BDF8] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-[#21262D] pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={isConnecting}
              className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleConnectAndVerify}
              disabled={isConnecting}
              className="vib-btn-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] rounded-[6px] text-[12px] font-normal flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <span>Connect & Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Step 3 - Basic Details (Platform Settings)
  // ---------------------------------------------------------------------------
  if (currentStep === 3) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 sm:p-5 bg-[#0B0F17]">
        <div className="w-full max-w-[540px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#12171F] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                <Globe className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div>
                <div className="text-[13px] text-[#E6EDF3] font-normal tracking-tight">
                  STEP 3 • BASIC PLATFORM DETAILS
                </div>
                <div className="text-[10px] text-[#8B949E] font-mono">
                  Site Name, Domain, & Support Contacts
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 font-light">
              DB CONNECTED
            </span>
          </div>

          <form onSubmit={handleSaveBasicDetails} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Site / Team Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Team Dark Devil"
                  className="vib-input text-[12px]"
                  required
                />
              </div>

              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Primary Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="darkdevil.team"
                  className="vib-input text-[12px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@darkdevil.team"
                  className="vib-input text-[12px]"
                  required
                />
              </div>

              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Support Telegram Handle</label>
                <input
                  type="text"
                  value={supportTelegram}
                  onChange={(e) => setSupportTelegram(e.target.value)}
                  placeholder="@darkdevil_admin"
                  className="vib-input text-[12px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] text-[#8B949E] block mb-1">Default Announcement Notice</label>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Notice displayed on worker portal..."
                rows={2}
                className="vib-input text-[11.5px] py-1.5 h-auto min-h-[56px] resize-none"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-[#21262D] pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to ENV</span>
              </button>

              <button
                type="submit"
                className="vib-btn-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] rounded-[6px] text-[12px] font-normal flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Create Super Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Step 4 - Create First Admin User
  // ---------------------------------------------------------------------------
  if (currentStep === 4) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 sm:p-5 bg-[#0B0F17]">
        <div className="w-full max-w-[500px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#280D12] border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
                <Shield className="w-4 h-4 text-[#EF4444]" />
              </div>
              <div>
                <div className="text-[13px] text-[#E6EDF3] font-normal tracking-tight">
                  STEP 4 • FIRST ROOT ADMINISTRATOR
                </div>
                <div className="text-[10px] text-[#8B949E] font-mono">
                  Create Super Administrator in dd_admin_users
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 font-light">
              ROOT ROLE
            </span>
          </div>

          {adminError && (
            <div className="bg-[#280D12] border border-[#EF4444]/40 text-[#EF4444] rounded-[6px] p-2 text-[11.5px] font-light flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleCreateFirstAdmin} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="vib-input text-[12px] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="System Administrator"
                  className="vib-input text-[12px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] text-[#8B949E] block mb-1">Admin Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@darkdevil.team"
                className="vib-input text-[12px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Password (Min 6 chars)</label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="vib-input pr-8 text-[12px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
                  >
                    {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1">Confirm Password</label>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vib-input text-[12px]"
                  required
                />
              </div>
            </div>

            <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2.5 text-[11px] text-[#8B949E] font-light leading-relaxed">
              Upon submission, this administrator will be provisioned in the separate{' '}
              <span className="text-[#E6EDF3] font-mono">dd_admin_users</span> table. The setup wizard
              will then be automatically locked for security.
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-[#21262D] pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors cursor-pointer"
                disabled={isSubmittingAdmin}
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmittingAdmin}
                className="vib-btn-md bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444] rounded-[6px] text-[12px] font-normal flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAdmin ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Admin & Locking...</span>
                  </>
                ) : (
                  <>
                    <span>Create Administrator & Complete</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Step 5 - Congratulation & Lock
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 sm:p-5 bg-[#0B0F17]">
      <div className="w-full max-w-[500px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#0E2A1E] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] text-[#E6EDF3] font-normal tracking-tight">
                SETUP COMPLETED SUCCESSFULLY
              </div>
              <div className="text-[10px] text-[#8B949E] font-mono">
                Installation Verified & Locked
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 font-light">
            READY
          </span>
        </div>

        {/* Congratulation Message */}
        <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-3 space-y-2 text-[12px] text-[#C9D1D9] font-light">
          <div className="text-[12.5px] text-[#22C55E] font-normal flex items-center gap-1.5">
            <span>🎉 Congratulations! Platform setup is finalized.</span>
          </div>
          <p className="text-[#8B949E] text-[11.5px] leading-relaxed">
            The initial root administrator has been registered, database tables have been
            synchronized, Cloudflare R2 is active, and this setup portal is now locked to safeguard
            operations.
          </p>

          <div className="border-t border-[#21262D] pt-2 mt-2 space-y-1 text-[11px] font-mono">
            <div className="flex items-center justify-between text-[#8B949E]">
              <span>Admin Username:</span>
              <span className="text-[#E6EDF3]">{createdAdminInfo?.username || adminUsername}</span>
            </div>
            <div className="flex items-center justify-between text-[#8B949E]">
              <span>Role:</span>
              <span className="text-[#EF4444]">Administrator (Root)</span>
            </div>
            <div className="flex items-center justify-between text-[#8B949E]">
              <span>Access Gateway:</span>
              <span className="text-[#38BDF8]">/leader</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="vib-btn-md bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444] rounded-[6px] text-[12px] font-normal flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Leader Admin Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="vib-btn-md bg-[#161B22] hover:bg-[#1C2128] text-[#C9D1D9] border border-[#30363D] rounded-[6px] text-[12px] font-light flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Public Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
