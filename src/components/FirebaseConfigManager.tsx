import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Upload,
  Key,
  ShieldCheck,
  Globe,
  Database,
  Server,
  FileCode,
} from 'lucide-react';
import { FirebaseClientConfig, FirebaseServiceAccountKey, FirebaseSettings } from '../types';

interface FirebaseConfigManagerProps {
  currentUsername: string;
}

const DEFAULT_PROVIDED_CLIENT_CONFIG: FirebaseClientConfig = {
  apiKey: 'AIzaSyAQY0GEBJuYsE3dO5L-Y3iT832Wfc4t1ag',
  authDomain: 'teamchat-b81fe.firebaseapp.com',
  projectId: 'teamchat-b81fe',
  storageBucket: 'teamchat-b81fe.firebasestorage.app',
  messagingSenderId: '1049335643050',
  appId: '1:1049335643050:web:ff97c01ce85718082a89d3',
};

const DEFAULT_PROVIDED_SERVICE_ACCOUNT_JSON = JSON.stringify(
  {
    type: 'service_account',
    project_id: 'teamchat-b81fe',
    private_key_id: '3bbfd05ef86a2dcee28f19f90ff4cfad7d7fcd29',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCptbFAdTJM0tCz\n8SfseWR3QGpZn/IbrZjzE6Cd0px4yv3ooaNeAGb6Td9RDQfhBvcHBkHQm4ChpAEn\nSewQqMrI2YLCPVv4FiF3O6YmEZ6lew0dKlbQW38NME/IfXqiYqkUn+t8446pVStR\nfQYrcL4QxqQxBElL7zBnBBLz29UJklyzOySWvmYUhLN/gFvL/AOAZQO/rIUzhy0W\n17uY5H3uZtrLoAT7csKKCfM0f1xN7G4HaBNXFPp39WHTtE0hha4U5aoH1aOakf7h\nQ7YylqdczvAfrrR/K2yXkHy2TKYKYfWXAREGp15U7I1BBnx+qcqMYEN6sYypzb/n\nFpRIERJjAgMBAAECggEASg3QHk3lmJNHYbXCE5S3C7huj9RVC9HZE3zFkgikoasG\nV9wskui/BsszPsVeYkmtQoHu9y3b1+zeWfwOSAi3kCQlxEeNGbjieoprSmJW5WPI\nCal/f2TlkGY78kMa38AIgsjzs6gCiQ5ynBjft9X3AhAD9qWlrD5f0xv6fzG2iPmA\nIAhGe0fBlje/6YrQXqNVNFqGndbjr/Q186EB13g6IQvuMCJ9CE1eyLkZESvMiFtk\noJ0HTAbBz0gVhm5gDEjGmuxqGfLYrfgfT5f1YGcxt8I7VlznaoMaRys+Msa7HOij\nVPyMx1FFLUnYcG1sYNbQx7dHpjZm3zEX9w+DsOuy/QKBgQDftbd9aDgA/iS3GYHE\nW6ByLi5td2GdfmQefMqDYRCliq8BbrPCXS6bLrN7Ayud2BFGdSg9SVcueC1AWb+g\nam5cdnvS6VOuVKQJzDPWVHJ9CasDy289ziBLHeEJ+lT7MABxEdbqyFp3tCa2fXF8\nEZNBJpHV58a0NSs1CpxVXWY1DwKBgQDCNJ9lCBxMiGMOJI8eomWITzikSerUT3MU\nC8DyHve5LAqtox36Kfpz2W8v+KwULoUEBgR8fp1TWJSVWCL6a46e8WRrdOuOpqkK\nBxKGRSUXPEOtzd6rYf+m5Bh3wGdZ96/dzNaqrY2mSB9kGPhmap2XiEeB2ZCUOCyw\nrmzNZinVbQKBgQCPrHsd1ZMyQAaAeac33sjazAIRV7yfk47lbav6WJqCVuEygFB+\noa3PCF1Iwa5/f0cJAzFGuxV8yL33OCyz7+bVB1tbB3Mw4TdA+57HJhEpcM4eb8cP\n4JQo6hWffOCbOibud1CaFPbVLiQ2y7XYwsjZ7NV4lZSuI/+N3zSsNoHvzQKBgDTo\n31BIQGV9dvdAcJmZBu53HuhrlwXWy3R3q06Lr1QMsrAR07X3P9vWLlu0dTVeYzDw\nbsJ4QGaXqItzorv1F7sn6wL3rMGFmGI6AQsBxZQqAApXH0Y0AdG3LQ9bJQ021Pwp\ntYZ0mDXoSl0cDHjirSK+pzSyUJiBIXPVYaEoJ1eVAoGBAIhu8RQwbNESINy5PMMM\nTC+P0yQ35/0AxYyG/vWAkQkUsNRRHqOb8gtJ9YlyVBwtdcnCL4xyg2fWfY1GGspM\nTsq/Dh3JIPgmhjP4qUj4QbhjQrG5oCpLzxMrnLszQIo6+AAnC/jWHxzsoIEjYh0p\nx/mhW1jbKOYnRvikYSzcgiBO\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-fbsvc@teamchat-b81fe.iam.gserviceaccount.com',
    client_id: '110610668558114799509',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40teamchat-b81fe.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  },
  null,
  2
);

export const FirebaseConfigManager: React.FC<FirebaseConfigManagerProps> = ({ currentUsername }) => {
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState<FirebaseSettings | null>(null);

  // Client Config Form State
  const [clientConfig, setClientConfig] = useState<FirebaseClientConfig>(DEFAULT_PROVIDED_CLIENT_CONFIG);
  const [quickPasteCode, setQuickPasteCode] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);

  // Client Config Test State
  const [testingClient, setTestingClient] = useState(false);
  const [clientTestResult, setClientTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    details?: any;
  } | null>(null);
  const [savingClient, setSavingClient] = useState(false);
  const [clientSaveMsg, setClientSaveMsg] = useState<string | null>(null);

  // Service Account Form State
  const [serviceAccountRaw, setServiceAccountRaw] = useState(DEFAULT_PROVIDED_SERVICE_ACCOUNT_JSON);
  const [parsedServiceAccount, setParsedServiceAccount] = useState<FirebaseServiceAccountKey | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Service Account Test State
  const [testingService, setTestingService] = useState(false);
  const [serviceTestResult, setServiceTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    details?: any;
  } | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [serviceSaveMsg, setServiceSaveMsg] = useState<string | null>(null);

  // Load current saved config from NEON database on mount
  const fetchCurrentConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/firebase/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfigData(data.config);
        if (data.config.clientConfig && data.config.clientConfig.apiKey) {
          setClientConfig(data.config.clientConfig);
        }
        if (data.config.serviceAccount) {
          setParsedServiceAccount(data.config.serviceAccount);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentConfig();
    try {
      const parsed = JSON.parse(DEFAULT_PROVIDED_SERVICE_ACCOUNT_JSON);
      setParsedServiceAccount(parsed);
    } catch {
      // ignore
    }
  }, []);

  const handleServiceAccountChange = (val: string) => {
    setServiceAccountRaw(val);
    setServiceSaveMsg(null);
    setServiceTestResult(null);
    if (!val.trim()) {
      setParsedServiceAccount(null);
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(val);
      setParsedServiceAccount(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
      setParsedServiceAccount(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleServiceAccountChange(content);
      }
    };
    reader.readAsText(file);
  };

  const parsePastedConfig = () => {
    if (!quickPasteCode.trim()) return;
    try {
      const apiKeyMatch = quickPasteCode.match(/apiKey\s*:\s*["']([^"']+)["']/);
      const authDomainMatch = quickPasteCode.match(/authDomain\s*:\s*["']([^"']+)["']/);
      const projectIdMatch = quickPasteCode.match(/projectId\s*:\s*["']([^"']+)["']/);
      const storageBucketMatch = quickPasteCode.match(/storageBucket\s*:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = quickPasteCode.match(/messagingSenderId\s*:\s*["']([^"']+)["']/);
      const appIdMatch = quickPasteCode.match(/appId\s*:\s*["']([^"']+)["']/);
      const measurementIdMatch = quickPasteCode.match(/measurementId\s*:\s*["']([^"']+)["']/);

      if (apiKeyMatch && projectIdMatch) {
        setClientConfig({
          apiKey: apiKeyMatch[1],
          authDomain: authDomainMatch ? authDomainMatch[1] : '',
          projectId: projectIdMatch[1],
          storageBucket: storageBucketMatch ? storageBucketMatch[1] : '',
          messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
          appId: appIdMatch ? appIdMatch[1] : '',
          measurementId: measurementIdMatch ? measurementIdMatch[1] : undefined,
        });
        setShowPasteModal(false);
        setQuickPasteCode('');
        return;
      }

      const parsed = JSON.parse(quickPasteCode);
      if (parsed.apiKey && parsed.projectId) {
        setClientConfig({
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || '',
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
          measurementId: parsed.measurementId || undefined,
        });
        setShowPasteModal(false);
        setQuickPasteCode('');
      }
    } catch {
      // parse failed
    }
  };

  const handleTestClientConfig = async () => {
    setTestingClient(true);
    setClientTestResult(null);
    setClientSaveMsg(null);
    try {
      const res = await fetch('/api/admin/firebase/test-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientConfig),
      });
      const data = await res.json();
      if (data.success) {
        setClientTestResult({
          success: true,
          message: data.message || 'Client configuration verified.',
          latencyMs: data.latencyMs,
          details: data.details,
        });
      } else {
        setClientTestResult({
          success: false,
          message: data.error || 'Firebase client test failed.',
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setClientTestResult({
        success: false,
        message: err.message || 'Network error while testing client configuration.',
      });
    } finally {
      setTestingClient(false);
    }
  };

  const handleSaveClientConfig = async () => {
    setSavingClient(true);
    setClientSaveMsg(null);
    try {
      const res = await fetch('/api/admin/firebase/save-client-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientConfig,
          updatedBy: currentUsername,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClientSaveMsg('Client Config saved.');
        fetchCurrentConfig();
      } else {
        setClientSaveMsg(`Failed to save: ${data.error}`);
      }
    } catch (err: any) {
      setClientSaveMsg(`Error: ${err.message}`);
    } finally {
      setSavingClient(false);
    }
  };

  const handleTestServiceAccount = async () => {
    setTestingService(true);
    setServiceTestResult(null);
    setServiceSaveMsg(null);
    try {
      const res = await fetch('/api/admin/firebase/test-service-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAccount: serviceAccountRaw }),
      });
      const data = await res.json();
      if (data.success) {
        setServiceTestResult({
          success: true,
          message: data.message || 'Service Account verified successfully.',
          latencyMs: data.latencyMs,
          details: data.details,
        });
      } else {
        setServiceTestResult({
          success: false,
          message: data.error || 'Failed to authenticate Service Account.',
        });
      }
    } catch (err: any) {
      setServiceTestResult({
        success: false,
        message: err.message || 'Network error while testing Service Account.',
      });
    } finally {
      setTestingService(false);
    }
  };

  const handleSaveServiceAccount = async () => {
    setSavingService(true);
    setServiceSaveMsg(null);
    try {
      const res = await fetch('/api/admin/firebase/save-service-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceAccount: serviceAccountRaw,
          updatedBy: currentUsername,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setServiceSaveMsg('Service Account JSON saved.');
        fetchCurrentConfig();
      } else {
        setServiceSaveMsg(`Failed to save: ${data.error}`);
      }
    } catch (err: any) {
      setServiceSaveMsg(`Error: ${err.message}`);
    } finally {
      setSavingService(false);
    }
  };

  return (
    <div className="space-y-2.5 font-normal text-[#E6EDF3]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#0E131F] border border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[12.5px] font-medium text-[#E6EDF3]">Firebase Configuration</h3>
          <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-mono">
            Teams Chat
          </span>
        </div>

        <button
          type="button"
          onClick={fetchCurrentConfig}
          disabled={loading}
          className="min-h-[24px] px-2 py-0.5 rounded-[4px] bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] text-[10.5px] text-[#C9D1D9] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-[#8B949E] ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {/* Status KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-2 rounded-[6px] bg-[#0E131F] border border-[#21262D]">
          <div className="text-[9.5px] text-[#8B949E] flex items-center justify-between">
            <span>Client Config</span>
            <Globe className="w-3 h-3 text-[#38BDF8]" />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {configData?.clientStatus === 'verified' || clientTestResult?.success ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                <span className="text-[11px] text-[#22C55E] font-medium">Verified</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-[#F59E0B]" />
                <span className="text-[11px] text-[#F59E0B] font-medium">Pending</span>
              </>
            )}
          </div>
        </div>

        <div className="p-2 rounded-[6px] bg-[#0E131F] border border-[#21262D]">
          <div className="text-[9.5px] text-[#8B949E] flex items-center justify-between">
            <span>Service Account IAM</span>
            <Key className="w-3 h-3 text-[#F59E0B]" />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {configData?.serviceAccountStatus === 'verified' || serviceTestResult?.success ? (
              <>
                <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                <span className="text-[11px] text-[#22C55E] font-medium">Verified</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-[#8B949E]" />
                <span className="text-[11px] text-[#8B949E] font-medium">Not Verified</span>
              </>
            )}
          </div>
        </div>

        <div className="p-2 rounded-[6px] bg-[#0E131F] border border-[#21262D]">
          <div className="text-[9.5px] text-[#8B949E] flex items-center justify-between">
            <span>Project ID</span>
            <Server className="w-3 h-3 text-[#38BDF8]" />
          </div>
          <div className="mt-0.5">
            <span className="text-[11px] font-mono text-[#E6EDF3] truncate block">
              {clientConfig.projectId || 'teamchat-b81fe'}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-[6px] bg-[#0E131F] border border-[#21262D]">
          <div className="text-[9.5px] text-[#8B949E] flex items-center justify-between">
            <span>Credential Storage</span>
            <Database className="w-3 h-3 text-[#22C55E]" />
          </div>
          <div className="mt-0.5">
            <span className="text-[10.5px] font-mono text-[#22C55E]">NEON dd_firebase_config</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Client Config, Right = Service Account */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Section 1: Client Config */}
        <div className="p-2.5 rounded-[6px] bg-[#0E131F] border border-[#21262D] space-y-2">
          <div className="flex items-center justify-between border-b border-[#21262D] pb-1.5">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="text-[11.5px] font-medium text-[#E6EDF3]">Firebase Client Config</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setClientConfig(DEFAULT_PROVIDED_CLIENT_CONFIG)}
                className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#38BDF8] border border-[#30363D] hover:bg-[#1C2128] transition-colors cursor-pointer"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => setShowPasteModal(true)}
                className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#C9D1D9] border border-[#30363D] hover:bg-[#1C2128] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="w-2.5 h-2.5" />
                <span>Paste Code</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
            <div className="sm:col-span-2 space-y-0.5">
              <label className="text-[9.5px] text-[#8B949E]">apiKey</label>
              <input
                type="text"
                value={clientConfig.apiKey}
                onChange={(e) => {
                  setClientConfig({ ...clientConfig, apiKey: e.target.value });
                  setClientTestResult(null);
                  setClientSaveMsg(null);
                }}
                placeholder="AIzaSy..."
                className="w-full h-[26px] px-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9.5px] text-[#8B949E]">projectId</label>
              <input
                type="text"
                value={clientConfig.projectId}
                onChange={(e) => {
                  setClientConfig({ ...clientConfig, projectId: e.target.value });
                  setClientTestResult(null);
                  setClientSaveMsg(null);
                }}
                placeholder="teamchat-b81fe"
                className="w-full h-[26px] px-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9.5px] text-[#8B949E]">authDomain</label>
              <input
                type="text"
                value={clientConfig.authDomain}
                onChange={(e) => setClientConfig({ ...clientConfig, authDomain: e.target.value })}
                placeholder="teamchat-b81fe.firebaseapp.com"
                className="w-full h-[26px] px-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9.5px] text-[#8B949E]">storageBucket</label>
              <input
                type="text"
                value={clientConfig.storageBucket}
                onChange={(e) => setClientConfig({ ...clientConfig, storageBucket: e.target.value })}
                placeholder="teamchat-b81fe.firebasestorage.app"
                className="w-full h-[26px] px-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9.5px] text-[#8B949E]">messagingSenderId</label>
              <input
                type="text"
                value={clientConfig.messagingSenderId}
                onChange={(e) => setClientConfig({ ...clientConfig, messagingSenderId: e.target.value })}
                placeholder="1049335643050"
                className="w-full h-[26px] px-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-0.5">
              <label className="text-[9.5px] text-[#8B949E]">appId</label>
              <input
                type="text"
                value={clientConfig.appId}
                onChange={(e) => setClientConfig({ ...clientConfig, appId: e.target.value })}
                placeholder="1:1049335643050:web:ff97c01ce85718082a89d3"
                className="w-full h-[26px] px-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono focus:border-[#38BDF8] focus:outline-none"
              />
            </div>
          </div>

          {/* Test Feedback */}
          {clientTestResult && (
            <div
              className={`p-1.5 rounded-[4px] text-[10.5px] border flex items-start gap-1.5 ${
                clientTestResult.success
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              }`}
            >
              {clientTestResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[10.5px] leading-tight">{clientTestResult.message}</div>
                {clientTestResult.latencyMs && (
                  <div className="text-[9.5px] opacity-80 mt-0.5 font-mono">
                    Latency: {clientTestResult.latencyMs}ms
                  </div>
                )}
              </div>
            </div>
          )}

          {clientSaveMsg && (
            <div className="p-1.5 rounded-[4px] text-[10px] bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>{clientSaveMsg}</span>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#21262D]">
            <button
              type="button"
              onClick={handleTestClientConfig}
              disabled={testingClient || !clientConfig.apiKey || !clientConfig.projectId}
              className="min-h-[26px] px-2.5 py-0.5 rounded-[4px] bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] text-[10.5px] text-[#38BDF8] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${testingClient ? 'animate-spin' : ''}`} />
              <span>{testingClient ? 'Testing...' : 'Test Client Config'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveClientConfig}
              disabled={savingClient || !clientConfig.apiKey || !clientConfig.projectId}
              className="min-h-[26px] px-2.5 py-0.5 rounded-[4px] bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B0F17] text-[10.5px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className={`w-3 h-3 ${savingClient ? 'animate-pulse' : ''}`} />
              <span>{savingClient ? 'Saving...' : 'Save Client Config'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Service Account JSON */}
        <div className="p-2.5 rounded-[6px] bg-[#0E131F] border border-[#21262D] space-y-2">
          <div className="flex items-center justify-between border-b border-[#21262D] pb-1.5">
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[11.5px] font-medium text-[#E6EDF3]">Service Account JSON</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleServiceAccountChange(DEFAULT_PROVIDED_SERVICE_ACCOUNT_JSON)}
                className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#F59E0B] border border-[#30363D] hover:bg-[#1C2128] transition-colors cursor-pointer"
              >
                Reset Default
              </button>
              <label className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#C9D1D9] border border-[#30363D] hover:bg-[#1C2128] transition-colors flex items-center gap-1 cursor-pointer">
                <Upload className="w-2.5 h-2.5 text-[#38BDF8]" />
                <span>Upload JSON</span>
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Parsed summary badge */}
          {parsedServiceAccount ? (
            <div className="p-1.5 rounded-[4px] bg-[#0B0F17] border border-[#21262D] space-y-0.5 text-[10px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-mono">
                <div className="truncate text-[#C9D1D9]">
                  <span className="text-[#6E7681]">Project:</span> {parsedServiceAccount.project_id}
                </div>
                <div className="truncate text-[#C9D1D9]">
                  <span className="text-[#6E7681]">Key ID:</span> {parsedServiceAccount.private_key_id?.slice(0, 10)}...
                </div>
                <div className="sm:col-span-2 truncate text-[#38BDF8]">
                  <span className="text-[#6E7681]">Client:</span> {parsedServiceAccount.client_email}
                </div>
              </div>
            </div>
          ) : jsonError ? (
            <div className="p-1.5 rounded-[4px] bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">JSON Error: {jsonError}</span>
            </div>
          ) : null}

          {/* JSON Textarea */}
          <div className="space-y-0.5">
            <textarea
              rows={8}
              value={serviceAccountRaw}
              onChange={(e) => handleServiceAccountChange(e.target.value)}
              placeholder='{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "..."\n}'
              className="w-full p-2 rounded-[4px] bg-[#0B0F17] border border-[#30363D] text-[#C9D1D9] text-[10px] font-mono leading-relaxed focus:border-[#F59E0B] focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>

          {/* Service Test Feedback Box */}
          {serviceTestResult && (
            <div
              className={`p-1.5 rounded-[4px] text-[10.5px] border flex items-start gap-1.5 ${
                serviceTestResult.success
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              }`}
            >
              {serviceTestResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[10.5px] leading-tight">{serviceTestResult.message}</div>
                {serviceTestResult.latencyMs && (
                  <div className="text-[9.5px] opacity-80 mt-0.5 font-mono">
                    Latency: {serviceTestResult.latencyMs}ms
                  </div>
                )}
              </div>
            </div>
          )}

          {serviceSaveMsg && (
            <div className="p-1.5 rounded-[4px] text-[10px] bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>{serviceSaveMsg}</span>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#21262D]">
            <button
              type="button"
              onClick={handleTestServiceAccount}
              disabled={testingService || !parsedServiceAccount}
              className="min-h-[26px] px-2.5 py-0.5 rounded-[4px] bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] text-[10.5px] text-[#F59E0B] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${testingService ? 'animate-spin' : ''}`} />
              <span>{testingService ? 'Testing...' : 'Test Service Account'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveServiceAccount}
              disabled={savingService || !parsedServiceAccount}
              className="min-h-[26px] px-2.5 py-0.5 rounded-[4px] bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0B0F17] text-[10.5px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className={`w-3 h-3 ${savingService ? 'animate-pulse' : ''}`} />
              <span>{savingService ? 'Saving...' : 'Save Service Account'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paste Modal for Client Config */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0B0F17] border border-[#30363D] rounded-[6px] p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-1.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#E6EDF3]">
                <FileCode className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Paste Firebase Config Code</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-[#8B949E] hover:text-[#E6EDF3] text-[13px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={7}
              value={quickPasteCode}
              onChange={(e) => setQuickPasteCode(e.target.value)}
              placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "teamchat-b81fe.firebaseapp.com",\n  projectId: "teamchat-b81fe",\n  storageBucket: "teamchat-b81fe.firebasestorage.app",\n  messagingSenderId: "1049335643050",\n  appId: "1:..."\n};`}
              className="w-full p-2 rounded-[4px] bg-[#12171F] border border-[#30363D] text-[#E6EDF3] text-[10.5px] font-mono leading-relaxed focus:border-[#38BDF8] focus:outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#21262D]">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="min-h-[24px] px-2.5 py-0.5 rounded-[4px] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] text-[10.5px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={parsePastedConfig}
                className="min-h-[24px] px-3 py-0.5 rounded-[4px] bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B0F17] text-[10.5px] font-medium transition-colors cursor-pointer"
              >
                Parse &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
