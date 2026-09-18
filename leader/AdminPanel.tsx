import React, { useState, useEffect } from 'react';
import { updatePageSEO } from '../src/utils/seo';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Database,
  FileCheck,
  Video,
  Wrench,
  Bot,
  Settings,
  Cloud,
  Plus,
  Trash2,
  Edit2,
  Ban,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Upload,
  Save,
  HardDrive,
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Shield,
  Award,
  UserCheck,
  KeyRound,
  Infinity as InfinityIcon,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Mail,
  Phone,
  Calendar,
  Search,
  Copy,
  Check,
  X,
  FileText,
  FileSpreadsheet,
  FileUp,
  Sparkles,
  ChevronRight,
  Layers,
  RefreshCw,
  Zap,
  Server,
  Globe,
  Activity,
  HardDriveDownload,
  HardDriveUpload,
  Download,
  FileArchive,
  RotateCcw,
  FolderArchive,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  User,
  AdminUser,
  AdminRole,
  Job,
  DataFile,
  JobSubmission,
  TeamApplication,
  ContactMessage,
  TutorialItem,
  ToolItem,
  AutomationItem,
  ServiceItem,
  SiteSettings,
  SystemBackupItem,
} from '../src/types';

interface AdminPanelProps {
  currentUser: AdminUser | User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'admin-users' | 'users' | 'applications' | 'contacts' | 'data' | 'jobs' | 'submissions' | 'services' | 'tutorials' | 'tools' | 'automation' | 'settings' | 'system' | 'profile'
  >('dashboard');

  // Dynamic SEO meta tag injection on tab navigation via utility script
  useEffect(() => {
    const tabTitles: Record<string, { title: string; desc: string }> = {
      'dashboard': { title: 'Admin Dashboard | Team Dark Devil', desc: 'Enterprise overview, performance trends, and quick statistics.' },
      'admin-users': { title: 'Admin Team Control | Team Dark Devil', desc: 'Manage administrative accounts, security roles, and permissions.' },
      'users': { title: 'Worker Personnel Management | Team Dark Devil', desc: 'Monitor and provision field personnel and active worker accounts.' },
      'applications': { title: 'Team Applications | Team Dark Devil', desc: 'Review and approve join applications and worker onboarding requests.' },
      'contacts': { title: 'Support Messages & Inquiries | Team Dark Devil', desc: 'Review incoming contact messages and support inquiries.' },
      'data': { title: 'Data Pipeline Ingestion | Team Dark Devil', desc: 'Manage data files, Excel imports, and batch record distribution.' },
      'jobs': { title: 'Microjob Orchestration | Team Dark Devil', desc: 'Create, assign, and monitor active microjobs and tasks.' },
      'submissions': { title: 'Job Submissions & Approvals | Team Dark Devil', desc: 'Review worker job proofs and approve payouts.' },
      'services': { title: 'Email & SMS Dispatch Services | Team Dark Devil', desc: 'Configure and monitor email sending and SMS dispatch services.' },
      'tutorials': { title: 'Worker Tutorials & Training | Team Dark Devil', desc: 'Manage training tutorials and educational modules.' },
      'tools': { title: 'Software Tools & Binaries | Team Dark Devil', desc: 'Distribute software tools and executable packages to workers.' },
      'automation': { title: 'Automation Scripts & Bots | Team Dark Devil', desc: 'Manage automated bots and background automation scripts.' },
      'settings': { title: 'Platform Settings & Configurations | Team Dark Devil', desc: 'Configure site parameters, branding, and API credentials.' },
      'system': { title: 'System Backup & Disaster Recovery | Team Dark Devil', desc: 'Neon PostgreSQL database backups, R2 file manifests, and restore engine.' },
      'profile': { title: 'Admin Profile Management | Team Dark Devil', desc: 'Manage your administrator account settings and credentials with real-time DB sync.' },
    };

    const currentMeta = tabTitles[activeTab] || {
      title: 'Team Dark Devil - Enterprise Control Center',
      desc: 'Microjob, email sending, and SMS sending worker team management platform.'
    };

    updatePageSEO({
      title: currentMeta.title,
      description: currentMeta.desc,
      url: window.location.href,
    });
  }, [activeTab]);

  // State collections
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminRoleFilter, setAdminRoleFilter] = useState<'all' | 'Administrator' | 'Leader' | 'Sub Leader'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [automation, setAutomation] = useState<AutomationItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Team Dark Devil',
    domain: 'darkdevil.team',
    announcement: '',
    supportEmail: 'support@darkdevil.team',
    supportTelegram: '@darkdevil_admin',
    historyRetentionDays: 30,
    r2AccountId: '',
    r2Endpoint: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: '',
    r2BucketName: 'darkdevil-assets',
    r2PublicUrl: '',
    r2Region: 'auto',
    logoUrl: '',
    faviconUrl: '',
  });

  // Admin Profile state & Realtime DB Sync Handler
  const [profileUsername, setProfileUsername] = useState(currentUser.username || '');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`/api/admin-users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileUsername,
          email: profileEmail,
          password: profilePassword ? profilePassword : undefined,
          role: currentUser.role,
          status: 'active',
          notes: (currentUser as any).notes || 'Admin profile update',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMsg({ type: 'success', text: 'Admin profile updated and synchronized with PostgreSQL dd_admin_users successfully!' });
        setProfilePassword('');
        const updated = { ...currentUser, username: profileUsername, email: profileEmail };
        localStorage.setItem('dd_leader_user', JSON.stringify(updated));
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Network error updating profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Cloudflare R2 Connection Testing & State
  const [isTestingR2, setIsTestingR2] = useState(false);
  const [r2TestProgressStage, setR2TestProgressStage] = useState<string>('');
  const [r2TestResult, setR2TestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    endpoint?: string;
    bucket?: string;
    publicUrl?: string;
    region?: string;
    steps: { name: string; status: 'passed' | 'failed' | 'skipped'; detail?: string }[];
    message: string;
    errorDetails?: string;
  } | null>(null);
  const [showR2SecretKey, setShowR2SecretKey] = useState(false);
  const [isSavingR2Settings, setIsSavingR2Settings] = useState(false);
  const [r2SaveNotice, setR2SaveNotice] = useState<string | null>(null);

  // PostgreSQL Database Test State
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    databaseName?: string;
    serverTime?: string;
    version?: string;
    tablesCount?: number;
    tables?: string[];
    message: string;
    errorDetails?: string;
  } | null>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Modal / Form states
  const [isAdminUserModalOpen, setIsAdminUserModalOpen] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [adminUserFormData, setAdminUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Leader' as AdminRole,
    status: 'active' as 'active' | 'suspended',
    notes: '',
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'worker',
    notes: '',
  });
  const [usernameCheck, setUsernameCheck] = useState<{
    status: 'idle' | 'checking' | 'available' | 'unavailable';
    message: string;
  }>({ status: 'idle', message: '' });

  const [isUploadDataModalOpen, setIsUploadDataModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    fileName: '',
    dataType: 'email' as 'email' | 'sms',
    rawLines: '',
  });
  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadFileStats, setUploadFileStats] = useState<{
    originalFileName: string;
    totalDetected: number;
    duplicatesRemoved: number;
    uniqueCount: number;
    fileSizeStr: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobFormData, setJobFormData] = useState({
    title: '',
    type: 'email' as 'email' | 'sms' | 'microjob',
    payoutPerUnit: 0.05,
    dailyTarget: 500,
    instructions: '',
    thumbnailUrl: '',
  });
  const [isUploadingJobThumbnail, setIsUploadingJobThumbnail] = useState(false);
  const jobThumbnailInputRef = React.useRef<HTMLInputElement>(null);

  const handleJobThumbnailUploadToR2 = async (file: File) => {
    if (!file) return;
    setIsUploadingJobThumbnail(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch('/api/settings/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64data,
            fileName: file.name,
            assetType: 'job_thumbnail',
          }),
        });
        
        const data = await res.json();
        if (data.success && data.url) {
          setJobFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
        } else {
          alert(`Job thumbnail upload failed: ${data.error || 'Unknown error'}`);
        }
        setIsUploadingJobThumbnail(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Check connection'}`);
      setIsUploadingJobThumbnail(false);
    }
  };

  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [tutFormData, setTutFormData] = useState({
    id: '',
    title: '',
    category: 'Email Sending',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '10:00',
    instructions: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [tutorialSearchQuery, setTutorialSearchQuery] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const handleThumbnailUploadToR2 = async (file: File) => {
    if (!file) return;
    setIsUploadingThumbnail(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch('/api/settings/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64data,
            fileName: file.name,
            assetType: 'thumbnail', // Will upload to R2 and return URL
          }),
        });
        
        const data = await res.json();
        if (data.success && data.url) {
          setTutFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
        } else {
          alert(`Thumbnail upload failed: ${data.error || 'Unknown error'}`);
        }
        setIsUploadingThumbnail(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Check connection'}`);
      setIsUploadingThumbnail(false);
    }
  };

  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [toolFormData, setToolFormData] = useState({
    id: '',
    name: '',
    category: 'Utility',
    url: '',
    isInternal: false,
    description: '',
    iconUrl: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [isUploadingToolIcon, setIsUploadingToolIcon] = useState(false);

  const handleToolIconUploadToR2 = async (file: File) => {
    if (!file) return;
    setIsUploadingToolIcon(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch('/api/settings/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64data,
            fileName: file.name,
            assetType: 'tool_icon',
          }),
        });
        
        const data = await res.json();
        if (data.success && data.url) {
          setToolFormData((prev) => ({ ...prev, iconUrl: data.url }));
        } else {
          alert(`Icon upload failed: ${data.error || 'Unknown error'}`);
        }
        setIsUploadingToolIcon(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Check connection'}`);
      setIsUploadingToolIcon(false);
    }
  };

  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoFormData, setAutoFormData] = useState({
    id: '',
    title: '',
    fileName: '',
    downloadUrl: '',
    version: 'v1.0.0',
    fileSize: '5 MB',
    instructions: '',
    iconUrl: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [autoSearchQuery, setAutoSearchQuery] = useState('');
  const [isUploadingAutoIcon, setIsUploadingAutoIcon] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    id: '',
    name: '',
    category: 'Operations',
    price: '',
    shortDescription: '',
    description: '',
    iconUrl: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [isUploadingServiceIcon, setIsUploadingServiceIcon] = useState(false);

  const handleServiceIconUploadToR2 = async (file: File) => {
    if (!file) return;
    setIsUploadingServiceIcon(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch('/api/settings/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64data,
            fileName: file.name,
            assetType: 'service_icon',
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setServiceFormData((prev) => ({ ...prev, iconUrl: data.url }));
        } else {
          alert(`Icon upload failed: ${data.error || 'Unknown error'}`);
        }
        setIsUploadingServiceIcon(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Check connection'}`);
      setIsUploadingServiceIcon(false);
    }
  };

  const handleAutoIconUploadToR2 = async (file: File) => {
    if (!file) return;
    setIsUploadingAutoIcon(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch('/api/settings/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64data,
            fileName: file.name,
            assetType: 'auto_icon',
          }),
        });
        
        const data = await res.json();
        if (data.success && data.url) {
          setAutoFormData((prev) => ({ ...prev, iconUrl: data.url }));
        } else {
          alert(`Icon upload failed: ${data.error || 'Unknown error'}`);
        }
        setIsUploadingAutoIcon(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Check connection'}`);
      setIsUploadingAutoIcon(false);
    }
  };

  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // System Backup & Disaster Recovery States
  const [backups, setBackups] = useState<SystemBackupItem[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState<'database' | 'files' | null>(null);
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [backupProgressStage, setBackupProgressStage] = useState<string>('');
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [restoreProgressStage, setRestoreProgressStage] = useState<string>('');
  const [restoreSuccessStats, setRestoreSuccessStats] = useState<{
    type: string;
    stats: Record<string, number>;
    message: string;
  } | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [uploadedBackupFile, setUploadedBackupFile] = useState<{
    name: string;
    sizeStr: string;
    type: 'database' | 'files' | 'unknown';
    recordsCount?: number;
    tablesCount?: number;
    exportedAt?: string;
    payload: any;
  } | null>(null);

  const fileBackupInputRef = React.useRef<HTMLInputElement>(null);
  const dbBackupInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to trigger direct browser file download
  const downloadJsonFile = (payload: any, filename: string) => {
    const jsonStr = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Create Database Backup Handler
  const handleCreateDatabaseBackup = async () => {
    if (isCreatingBackup) return;
    setIsCreatingBackup('database');
    setBackupProgress(15);
    setBackupProgressStage('Querying Neon PostgreSQL active tables...');
    setBackupSuccessMessage(null);

    const step1 = setTimeout(() => {
      setBackupProgress(40);
      setBackupProgressStage('Serializing workers, jobs, data files & submissions...');
    }, 350);

    const step2 = setTimeout(() => {
      setBackupProgress(70);
      setBackupProgressStage('Generating full database snapshot & data signatures...');
    }, 700);

    const step3 = setTimeout(() => {
      setBackupProgress(90);
      setBackupProgressStage('Compressing JSON backup snapshot archive...');
    }, 1050);

    try {
      const res = await fetch('/api/system/backup/database', { method: 'POST' });
      const data = await res.json();
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);

      if (data.success && data.backup) {
        setBackupProgress(100);
        setBackupProgressStage('Database backup generated successfully!');
        setBackups((prev) => [data.backup, ...prev.filter((b) => b.id !== data.backup.id)]);
        setBackupSuccessMessage(data.message || 'Database backup snapshot created successfully!');

        // Trigger automatic instant browser download
        if (data.payload) {
          downloadJsonFile(data.payload, data.backup.filename);
        }
      } else {
        alert(`Backup error: ${data.error || 'Failed to create database backup'}`);
      }
    } catch (err: any) {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      alert(`Network error creating database backup: ${err.message || err}`);
    } finally {
      setTimeout(() => {
        setIsCreatingBackup(null);
        setBackupProgress(0);
        setBackupProgressStage('');
      }, 1200);
    }
  };

  // Create File Backup Handler
  const handleCreateFileBackup = async () => {
    if (isCreatingBackup) return;
    setIsCreatingBackup('files');
    setBackupProgress(15);
    setBackupProgressStage('Scanning Cloudflare R2 bucket & file descriptors...');
    setBackupSuccessMessage(null);

    const step1 = setTimeout(() => {
      setBackupProgress(45);
      setBackupProgressStage('Packing data files, automation software & tutorial assets...');
    }, 350);

    const step2 = setTimeout(() => {
      setBackupProgress(75);
      setBackupProgressStage('Generating storage manifests & endpoint descriptors...');
    }, 700);

    const step3 = setTimeout(() => {
      setBackupProgress(92);
      setBackupProgressStage('Finalizing R2 storage package...');
    }, 1050);

    try {
      const res = await fetch('/api/system/backup/files', { method: 'POST' });
      const data = await res.json();
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);

      if (data.success && data.backup) {
        setBackupProgress(100);
        setBackupProgressStage('File catalog backup generated successfully!');
        setBackups((prev) => [data.backup, ...prev.filter((b) => b.id !== data.backup.id)]);
        setBackupSuccessMessage(data.message || 'R2 file catalog backup created successfully!');

        // Trigger automatic instant browser download
        if (data.payload) {
          downloadJsonFile(data.payload, data.backup.filename);
        }
      } else {
        alert(`Backup error: ${data.error || 'Failed to create file backup'}`);
      }
    } catch (err: any) {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      alert(`Network error creating file backup: ${err.message || err}`);
    } finally {
      setTimeout(() => {
        setIsCreatingBackup(null);
        setBackupProgress(0);
        setBackupProgressStage('');
      }, 1200);
    }
  };

  // Download Existing Backup from Table
  const handleDownloadBackup = async (b: SystemBackupItem) => {
    if (b.payload) {
      downloadJsonFile(b.payload, b.filename);
      return;
    }
    const link = document.createElement('a');
    link.href = `/api/system/backup/download/${b.id}`;
    link.download = b.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Backup Entry
  const handleDeleteBackup = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this backup record?')) return;
    try {
      const res = await fetch(`/api/system/backup/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBackups((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Delete backup error:', err);
    }
  };

  // Handle Backup File Upload for Restore
  const handleBackupFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetHint?: 'database' | 'files') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    setRestoreSuccessStats(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let detectedType: 'database' | 'files' | 'unknown' = 'unknown';
        let records = 0;
        let tables = 0;
        let exportedAt = '';

        if (parsed.metadata) {
          if (parsed.metadata.type === 'database') detectedType = 'database';
          else if (parsed.metadata.type === 'files') detectedType = 'files';
          records = parsed.metadata.totalRecords || parsed.metadata.totalFiles || 0;
          tables = parsed.metadata.tablesCount || 0;
          exportedAt = parsed.metadata.exportedAt || '';
        }

        if (detectedType === 'unknown') {
          if (parsed.tables || (parsed.users && parsed.jobs)) {
            detectedType = 'database';
          } else if (parsed.filesCatalog || parsed.dataFiles) {
            detectedType = 'files';
          } else if (targetHint) {
            detectedType = targetHint;
          }
        }

        const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

        setUploadedBackupFile({
          name: file.name,
          sizeStr,
          type: detectedType,
          recordsCount: records,
          tablesCount: tables,
          exportedAt,
          payload: parsed,
        });
      } catch (err: any) {
        setRestoreError(`Invalid JSON backup file: ${err.message || 'File is corrupted or not valid JSON'}`);
        setUploadedBackupFile(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Run Restore Process
  const handleRunRestore = async () => {
    if (!uploadedBackupFile) return;

    const confirmMsg =
      uploadedBackupFile.type === 'database'
        ? `RESTORE DATABASE WARNING:\nRestoring will merge and synchronize all database tables (Workers, Jobs, Submissions, Services, Settings) with this snapshot.\n\nFile: ${uploadedBackupFile.name}\n\nDo you want to proceed with restore?`
        : `RESTORE FILES WARNING:\nRestoring will synchronize R2 file manifests and catalog descriptors with this backup.\n\nFile: ${uploadedBackupFile.name}\n\nDo you want to proceed with restore?`;

    if (!window.confirm(confirmMsg)) return;

    setIsRestoring(true);
    setRestoreProgress(15);
    setRestoreProgressStage('Verifying backup payload integrity and metadata signatures...');
    setRestoreError(null);
    setRestoreSuccessStats(null);

    const step1 = setTimeout(() => {
      setRestoreProgress(45);
      setRestoreProgressStage('Synchronizing records into Neon PostgreSQL database...');
    }, 450);

    const step2 = setTimeout(() => {
      setRestoreProgress(75);
      setRestoreProgressStage('Rebuilding memory store cache and active entities...');
    }, 900);

    const step3 = setTimeout(() => {
      setRestoreProgress(92);
      setRestoreProgressStage('Validating relational links and refreshing platform state...');
    }, 1350);

    try {
      const res = await fetch('/api/system/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: uploadedBackupFile.payload }),
      });

      const data = await res.json();
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);

      if (data.success) {
        setRestoreProgress(100);
        setRestoreProgressStage('Disaster recovery restoration completed successfully!');
        setRestoreSuccessStats({
          type: data.type || uploadedBackupFile.type,
          stats: data.stats || {},
          message: data.message || 'All entities synchronized and active!',
        });
        // Reload all admin panel data in real-time
        await fetchAdminData();
        setUploadedBackupFile(null);
      } else {
        setRestoreError(data.error || 'Restore failed on server.');
      }
    } catch (err: any) {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      setRestoreError(`Network error during restore: ${err.message || err}`);
    } finally {
      setTimeout(() => {
        setIsRestoring(false);
        setRestoreProgress(0);
        setRestoreProgressStage('');
      }, 1200);
    }
  };

  // Submission filter & modal state
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<JobSubmission | null>(null);
  const [isSubmissionDetailModalOpen, setIsSubmissionDetailModalOpen] = useState(false);
  const [viewingProofFile, setViewingProofFile] = useState<string | null>(null);

  // Helper for file display
  const getFileNameFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.split('/').pop() || 'Proof_File');
    } catch {
      return url.split('/').pop()?.split('?')[0] || 'Proof_File';
    }
  };
  const isImageFile = (url: string) => /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url.split('?')[0]);

  // Application detail modal & filter state
  const [selectedApplication, setSelectedApplication] = useState<TeamApplication | null>(null);
  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState(false);
  const [appFilterStatus, setAppFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoadingAppId, setActionLoadingAppId] = useState<string | null>(null);

  // Contact detail modal & state
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      return;
    }
    setDeletingContactId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (selectedContact?.id === id) {
          setIsContactModalOpen(false);
          setSelectedContact(null);
        }
      } else {
        alert('Failed to delete contact message');
      }
    } catch (e) {
      console.error('Delete contact error:', e);
      alert('Error deleting contact message');
    } finally {
      setDeletingContactId(null);
    }
  };

  const handleCopyContactField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      const [
        adminUsersRes,
        usersRes,
        filesRes,
        jobsRes,
        subsRes,
        appsRes,
        contactsRes,
        servicesRes,
        tutsRes,
        toolsRes,
        autoRes,
        settRes,
        backupsRes,
      ] = await Promise.all([
        fetch('/api/admin-users').then((r) => r.json()).catch(() => ({ adminUsers: [] })),
        fetch('/api/users').then((r) => r.json()).catch(() => ({ users: [] })),
        fetch('/api/data-files').then((r) => r.json()).catch(() => ({ files: [] })),
        fetch('/api/jobs').then((r) => r.json()).catch(() => ({ jobs: [] })),
        fetch('/api/submissions').then((r) => r.json()).catch(() => ({ submissions: [] })),
        fetch('/api/applications').then((r) => r.json()).catch(() => ({ applications: [] })),
        fetch('/api/contact').then((r) => r.json()).catch(() => ({ messages: [] })),
        fetch('/api/services').then((r) => r.json()).catch(() => ({ services: [] })),
        fetch('/api/tutorials').then((r) => r.json()).catch(() => ({ tutorials: [] })),
        fetch('/api/tools').then((r) => r.json()).catch(() => ({ tools: [] })),
        fetch('/api/automation').then((r) => r.json()).catch(() => ({ automation: [] })),
        fetch('/api/settings').then((r) => r.json()).catch(() => ({ settings: null })),
        fetch('/api/system/backups').then((r) => r.json()).catch(() => ({ backups: [] })),
      ]);

      if (adminUsersRes.adminUsers) setAdminUsers(adminUsersRes.adminUsers);
      if (usersRes.users) setUsers(usersRes.users);
      if (filesRes.files) setDataFiles(filesRes.files);
      if (jobsRes.jobs) setJobs(jobsRes.jobs);
      if (subsRes.submissions) setSubmissions(subsRes.submissions);
      if (appsRes.applications) setApplications(appsRes.applications);
      if (contactsRes.messages) setContacts(contactsRes.messages);
      if (servicesRes.services) setServices(servicesRes.services);
      if (tutsRes.tutorials) setTutorials(tutsRes.tutorials);
      if (toolsRes.tools) setTools(toolsRes.tools);
      if (autoRes.automation) setAutomation(autoRes.automation);
      if (settRes.settings) setSiteSettings(settRes.settings);
      if (backupsRes.backups) setBackups(backupsRes.backups);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Real-time worker username availability check
  useEffect(() => {
    if (!isUserModalOpen) {
      setUsernameCheck({ status: 'idle', message: '' });
      return;
    }

    const trimmed = userFormData.username.trim();
    if (!trimmed) {
      setUsernameCheck({ status: 'idle', message: '' });
      return;
    }

    if (editingUser && trimmed.toLowerCase() === editingUser.username.toLowerCase()) {
      setUsernameCheck({ status: 'available', message: 'Current worker username (Kept)' });
      return;
    }

    if (trimmed.length < 3) {
      setUsernameCheck({
        status: 'unavailable',
        message: 'Username must be at least 3 characters',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameCheck({
        status: 'unavailable',
        message: 'Only letters, numbers, hyphens, and underscores are allowed',
      });
      return;
    }

    setUsernameCheck({ status: 'checking', message: 'Checking availability...' });

    const timer = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          username: trimmed,
          ...(editingUser ? { excludeId: editingUser.id } : {}),
        });
        const res = await fetch(`/api/users/check-username?${queryParams.toString()}`);
        const data = await res.json();

        if (data.available) {
          setUsernameCheck({ status: 'available', message: 'Username is available' });
        } else {
          setUsernameCheck({
            status: 'unavailable',
            message: data.reason || 'Username is not available',
          });
        }
      } catch (err) {
        // Fallback local check
        const isTakenLocally = users.some(
          (u) =>
            u.username.toLowerCase() === trimmed.toLowerCase() &&
            (!editingUser || u.id !== editingUser.id)
        );
        if (isTakenLocally) {
          setUsernameCheck({ status: 'unavailable', message: 'Username is already taken' });
        } else {
          setUsernameCheck({ status: 'available', message: 'Username is available' });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [userFormData.username, isUserModalOpen, editingUser, users]);

  // Admin User Actions (dd_admin_users)
  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdminUser) {
        const res = await fetch(`/api/admin-users/${editingAdminUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminUserFormData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update admin account');
      } else {
        const res = await fetch('/api/admin-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...adminUserFormData,
            assignedBy: currentUser.username,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create admin account');
      }
      setIsAdminUserModalOpen(false);
      setEditingAdminUser(null);
      setAdminUserFormData({
        username: '',
        email: '',
        password: '',
        role: 'Leader',
        status: 'active',
        notes: '',
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error saving administrative account');
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await fetch(`/api/admin-users/${adminId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchAdminData();
  };

  const handleDeleteAdminUser = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this administrative user account?')) return;
    const res = await fetch(`/api/admin-users/${adminId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to delete administrative account');
      return;
    }
    fetchAdminData();
  };

  // User Actions: Create / Edit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameCheck.status === 'unavailable') {
      alert(usernameCheck.message || 'Please choose an available worker username.');
      return;
    }

    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userFormData.username.trim(),
            email: userFormData.email.trim(),
            password: userFormData.password ? userFormData.password.trim() : undefined,
            notes: userFormData.notes,
            maxDailyQuota: 999999, // Unlimited capacity for workers
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to update worker user');
          return;
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userFormData.username.trim(),
            email: userFormData.email.trim(),
            password: userFormData.password.trim(),
            role: 'worker',
            notes: userFormData.notes,
            maxDailyQuota: 999999, // Unlimited capacity for workers
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to create worker account');
          return;
        }
      }

      setIsUserModalOpen(false);
      setEditingUser(null);
      setUserFormData({
        username: '',
        email: '',
        password: '',
        role: 'worker',
        notes: '',
      });
      setUsernameCheck({ status: 'idle', message: '' });
      fetchAdminData();
    } catch (e) {
      alert('Error saving worker user');
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchAdminData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user account?')) return;
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    fetchAdminData();
  };

  // Helpers for Data File Email / Phone Detection & Deduplication
  const extractAndDeduplicateEmails = (text: string) => {
    // Matches standard email format across arbitrary text, CSV columns, or raw rows without headers
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    const uniqueMap = new Map<string, string>();
    let duplicates = 0;

    for (const match of matches) {
      const clean = match.trim().toLowerCase();
      // Basic check: must contain domain dot and minimum length
      if (clean.includes('.') && clean.length > 5) {
        if (!uniqueMap.has(clean)) {
          uniqueMap.set(clean, clean);
        } else {
          duplicates++;
        }
      }
    }

    return {
      uniqueList: Array.from(uniqueMap.values()),
      totalDetected: matches.length,
      duplicatesRemoved: duplicates,
    };
  };

  const extractAndDeduplicatePhones = (text: string) => {
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,9}/g;
    const matches = text.match(phoneRegex) || [];
    const uniqueMap = new Map<string, string>();
    let duplicates = 0;

    for (const match of matches) {
      const clean = match.replace(/[^\d+]/g, '');
      if (clean.length >= 8) {
        if (!uniqueMap.has(clean)) {
          uniqueMap.set(clean, clean);
        } else {
          duplicates++;
        }
      }
    }

    return {
      uniqueList: Array.from(uniqueMap.values()),
      totalDetected: matches.length,
      duplicatesRemoved: duplicates,
    };
  };

  const formatByteSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processRawDataText = (
    text: string,
    incomingFileName?: string,
    incomingFileSize?: number
  ) => {
    const isEmail = uploadFormData.dataType === 'email';
    const result = isEmail
      ? extractAndDeduplicateEmails(text)
      : extractAndDeduplicatePhones(text);

    setUploadFormData((prev) => ({
      ...prev,
      fileName: incomingFileName !== undefined ? incomingFileName : prev.fileName,
      rawLines: result.uniqueList.join('\n'),
    }));

    setUploadFileStats({
      originalFileName: incomingFileName || uploadFormData.fileName || 'Pasted Content',
      totalDetected: result.totalDetected,
      duplicatesRemoved: result.duplicatesRemoved,
      uniqueCount: result.uniqueList.length,
      fileSizeStr: incomingFileSize ? formatByteSize(incomingFileSize) : '',
    });
  };

  const processIncomingFile = (file: File) => {
    setIsParsingFile(true);
    // Auto-fill file name with uploaded file name (user can edit/rename)
    setUploadFormData((prev) => ({
      ...prev,
      fileName: file.name,
    }));

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result;
          const workbook = XLSX.read(buffer, { type: 'array' });
          let combinedText = '';
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            if (worksheet) {
              const sheetCsv = XLSX.utils.sheet_to_csv(worksheet);
              combinedText += ' ' + sheetCsv;
            }
          }
          processRawDataText(combinedText, file.name, file.size);
        } catch (err) {
          alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.onerror = () => {
        alert('Error reading Excel file.');
        setIsParsingFile(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV, TXT, TSV, or any raw text file
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = (evt.target?.result as string) || '';
          processRawDataText(text, file.name, file.size);
        } catch (err) {
          alert('Error processing file.');
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.onerror = () => {
        alert('Error reading file.');
        setIsParsingFile(false);
      };
      reader.readAsText(file);
    }
  };

  const handleRawFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processIncomingFile(file);
    e.target.value = '';
  };

  // Open Upload Modal with clean state
  const handleOpenUploadDataModal = () => {
    setUploadFormData({ fileName: '', dataType: 'email', rawLines: '' });
    setUploadMode('file');
    setUploadFileStats(null);
    setIsParsingFile(false);
    setIsUploadDataModalOpen(true);
  };

  // Data File Upload Action
  const handleUploadDataFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.fileName.trim()) {
      alert('Please provide a File Name.');
      return;
    }
    if (!uploadFormData.rawLines.trim()) {
      alert('Please upload a file with data or paste raw lines.');
      return;
    }
    try {
      const res = await fetch('/api/data-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadFormData.fileName.trim(),
          dataType: uploadFormData.dataType,
          rawDataLines: uploadFormData.rawLines,
          uploadedBy: currentUser.username,
        }),
      });
      if (res.ok) {
        setIsUploadDataModalOpen(false);
        setUploadFormData({ fileName: '', dataType: 'email', rawLines: '' });
        setUploadFileStats(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload data file');
      }
    } catch (e) {
      alert('Error uploading data file');
    }
  };

  const handleDeleteDataFile = async (fileId: string) => {
    if (!confirm('Delete this data file and remaining balance?')) return;
    await fetch(`/api/data-files/${fileId}`, { method: 'DELETE' });
    fetchAdminData();
  };

  // Job Actions
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingJobId ? `/api/jobs/${editingJobId}` : '/api/jobs';
    const method = editingJobId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobFormData),
    });
    setIsJobModalOpen(false);
    setEditingJobId(null);
    setJobFormData({
      title: '',
      type: 'email',
      payoutPerUnit: 0.05,
      dailyTarget: 500,
      instructions: '',
      thumbnailUrl: '',
    });
    fetchAdminData();
  };

  const handleEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setJobFormData({
      title: job.title,
      type: job.type,
      payoutPerUnit: job.payoutPerUnit,
      dailyTarget: job.dailyTarget,
      instructions: job.instructions,
      thumbnailUrl: job.thumbnailUrl || '',
    });
    setIsJobModalOpen(true);
  };

  const handleToggleJobStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchAdminData();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Delete this campaign job?')) return;
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
    fetchAdminData();
  };

  // Submission Status Update
  const handleUpdateSubmission = async (subId: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/submissions/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAdminData();
  };

  // Application Accept & Auto Worker Account Create
  const handleApproveApplication = async (app: TeamApplication) => {
    if (!confirm(`Approve application from ${app.fullName} and create a worker account?`)) {
      return;
    }
    setActionLoadingAppId(app.id);
    try {
      const generatedPassword = 'user' + Math.floor(1000 + Math.random() * 9000);
      const baseCleanName = app.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = (baseCleanName.slice(0, 10) || 'worker') + Math.floor(10 + Math.random() * 89);

      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: app.email,
          password: generatedPassword,
          role: 'worker',
          maxDailyQuota: 999999, // Unlimited work capacity
          notes: `Recruited via Application: ${app.fullName} (Phone: ${app.phone || 'N/A'})`,
        }),
      });

      if (!userRes.ok) {
        const errorData = await userRes.json();
        alert(errorData.error || 'Failed to create worker account');
        return;
      }

      const appRes = await fetch(`/api/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (appRes.ok) {
        if (selectedApplication && selectedApplication.id === app.id) {
          setSelectedApplication({ ...selectedApplication, status: 'approved' });
        }
        alert(
          `Application approved successfully!\n\n` +
            `Worker Account Created:\n` +
            `• Username: ${username}\n` +
            `• Password: ${generatedPassword}\n` +
            `• Email: ${app.email}\n` +
            `• Capacity: Unlimited`
        );
        fetchAdminData();
      }
    } catch (err) {
      alert('An error occurred while approving application.');
    } finally {
      setActionLoadingAppId(null);
    }
  };

  // Application Reject
  const handleRejectApplication = async (app: TeamApplication) => {
    if (!confirm(`Are you sure you want to mark the application from ${app.fullName} as Rejected?`)) {
      return;
    }
    setActionLoadingAppId(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        if (selectedApplication && selectedApplication.id === app.id) {
          setSelectedApplication({ ...selectedApplication, status: 'rejected' });
        }
        alert(`Application from ${app.fullName} marked as Rejected.`);
        fetchAdminData();
      } else {
        alert('Failed to update application status.');
      }
    } catch (err) {
      alert('Error updating application status.');
    } finally {
      setActionLoadingAppId(null);
    }
  };

  const handleCopyApplicationField = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteSettings),
    });
    alert('Settings updated successfully!');
  };

  // Upload Logo or Favicon to Cloudflare R2
  const handleFileUploadToR2 = async (file: File, assetType: 'logo' | 'favicon') => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    if (assetType === 'logo') setIsUploadingLogo(true);
    else setIsUploadingFavicon(true);
    setUploadStatusMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/settings/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            assetType,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          const updatedSettings = {
            ...siteSettings,
            [assetType === 'logo' ? 'logoUrl' : 'faviconUrl']: data.url,
          };
          setSiteSettings(updatedSettings);

          setUploadStatusMsg(
            `✓ ${assetType === 'logo' ? 'Logo' : 'Favicon'} saved & pushed to Cloudflare R2! URL: ${data.url}`
          );

          // Update current browser tab favicon if favicon was uploaded
          if (assetType === 'favicon') {
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.url;
          }
        } else {
          alert(`Upload to R2 failed: ${data.error || 'Check server configuration'}`);
        }
      } catch (err: any) {
        alert(`Error uploading file to R2: ${err?.message || err}`);
      } finally {
        if (assetType === 'logo') setIsUploadingLogo(false);
        else setIsUploadingFavicon(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Test Cloudflare R2 Connection & Permissions
  const handleTestR2Connection = async () => {
    setIsTestingR2(true);
    setR2TestResult(null);
    setR2TestProgressStage('Step 1/3: Initializing client & connecting to S3 endpoint...');

    const timer1 = setTimeout(() => {
      setR2TestProgressStage('Step 2/3: Authenticating S3 token & validating bucket access...');
    }, 400);

    const timer2 = setTimeout(() => {
      setR2TestProgressStage('Step 3/3: Running read/write permission probe & latency check...');
    }, 900);

    try {
      const res = await fetch('/api/system/test-r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: siteSettings.r2AccountId,
          endpoint: siteSettings.r2Endpoint,
          accessKeyId: siteSettings.r2AccessKeyId,
          secretAccessKey: siteSettings.r2SecretAccessKey,
          bucketName: siteSettings.r2BucketName,
          publicUrl: siteSettings.r2PublicUrl,
          region: siteSettings.r2Region,
        }),
      });
      const data = await res.json();
      setR2TestResult(data);
    } catch (err: any) {
      setR2TestResult({
        success: false,
        steps: [
          {
            name: 'Network Request',
            status: 'failed',
            detail: `Failed to contact server API: ${err?.message || err}`,
          },
        ],
        message: `Connection test error: ${err?.message || 'Server request failed'}`,
        errorDetails: String(err),
      });
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsTestingR2(false);
      setR2TestProgressStage('');
    }
  };

  // Test Neon PostgreSQL Connection
  const handleTestDbConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch('/api/system/test-db', { method: 'POST' });
      const data = await res.json();
      setDbTestResult(data);
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: `Database ping failed: ${err?.message || err}`,
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  // Save R2 Configuration specifically
  const handleSaveR2Settings = async () => {
    setIsSavingR2Settings(true);
    setR2SaveNotice(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setR2SaveNotice('✓ Cloudflare R2 credentials saved successfully!');
        setTimeout(() => setR2SaveNotice(null), 4000);
      } else {
        setR2SaveNotice('✕ Failed to save settings.');
      }
    } catch (e: any) {
      setR2SaveNotice(`✕ Error saving: ${e?.message || e}`);
    } finally {
      setIsSavingR2Settings(false);
    }
  };

  // R2 Backup Trigger
  const handleTriggerBackup = async () => {
    setBackupMessage('Initiating Cloudflare R2 snapshot backup...');
    const res = await fetch('/api/system/backup', { method: 'POST' });
    const data = await res.json();
    setBackupMessage(data.message || 'Backup completed successfully.');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-2 sm:px-4 py-3 sm:py-5 flex flex-col md:flex-row gap-3">
      {/* Groupwise Compact Sidebar (Width: 196px) */}
      <aside className="w-full md:w-[196px] shrink-0 bg-[#0B0F17] border border-[#30363D] rounded-[8px] p-2 flex flex-col gap-3">
        {/* Admin Tag */}
        <div className="p-2 rounded-[6px] bg-[#12171F] border border-[#21262D]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EF4444]/20 border border-[#EF4444] flex items-center justify-center text-[10px] text-[#F87171] font-light">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-[#E6EDF3] font-light truncate">{currentUser.username}</div>
              <div className="text-[10px] text-[#EF4444] font-light">Leader Root Control</div>
            </div>
          </div>
        </div>

        {/* Dashboard button */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Group 1: Team & Personnel */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            TEAM &amp; PERSONNEL
          </div>

          <button
            onClick={() => setActiveTab('admin-users')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'admin-users'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Admin Team</span>
            <span className="ml-auto text-[10px] font-mono text-[#EF4444]">{adminUsers.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'users'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Workers</span>
            <span className="ml-auto text-[10px] font-mono text-[#8B949E]">{users.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'applications'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Applications</span>
            <span className="ml-auto text-[10px] font-mono text-[#22C55E]">
              {applications.filter((a) => a.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'contacts'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Contacts</span>
            <span className="ml-auto text-[10px] font-mono text-[#38BDF8]">
              {contacts.length}
            </span>
          </button>
        </div>

        {/* Group 2: Operations */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            OPERATIONS
          </div>

          <button
            onClick={() => setActiveTab('data')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'data'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Upload</span>
            <span className="ml-auto text-[10px] font-mono text-[#8B949E]">{dataFiles.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'jobs'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs Manager</span>
            <span className="ml-auto text-[10px] font-mono text-[#8B949E]">{jobs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'submissions'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Job Submits</span>
            <span className="ml-auto text-[10px] font-mono text-[#F59E0B]">
              {submissions.filter((s) => s.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'services'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Services</span>
            <span className="ml-auto text-[10px] font-mono text-[#38BDF8]">{services.length}</span>
          </button>
        </div>

        {/* Group 3: Resources */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            RESOURCES
          </div>

          <button
            onClick={() => setActiveTab('tutorials')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'tutorials'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Tutorials</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'tools'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'automation'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Automation</span>
          </button>
        </div>

        {/* Group 4: System */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            SYSTEM
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Admin Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'system'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#EF4444] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>R2 / Database</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 bg-[#0D1117] space-y-3">
        {/* ========================================================
            TAB: ADMIN DASHBOARD
        ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <div className="text-[11px] text-[#8B949E] mb-1">Total Workers</div>
                <div className="text-[20px] text-[#E6EDF3] font-light">{users.length}</div>
                <div className="text-[10px] text-[#22C55E] mt-1 flex items-center gap-1">
                  <span>Active field personnel</span>
                </div>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <div className="text-[11px] text-[#8B949E] mb-1">Active Jobs</div>
                <div className="text-[20px] text-[#38BDF8] font-light">{jobs.filter(j => j.status === 'active').length}</div>
                <div className="text-[10px] text-[#8B949E] mt-1">Microjob tasks available</div>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <div className="text-[11px] text-[#8B949E] mb-1">Pending Submissions</div>
                <div className="text-[20px] text-[#F59E0B] font-light">{submissions.filter(s => s.status === 'pending').length}</div>
                <div className="text-[10px] text-[#8B949E] mt-1">Awaiting leader review</div>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <div className="text-[11px] text-[#8B949E] mb-1">Pending Applications</div>
                <div className="text-[20px] text-[#EF4444] font-light">{applications.filter(a => a.status === 'pending').length}</div>
                <div className="text-[10px] text-[#8B949E] mt-1">Join requests</div>
              </div>
            </div>

            {/* Weekly Task Performance Trends Widget */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[13px] text-[#E6EDF3] font-light">Weekly Task Performance Trends</h3>
                  <p className="text-[11px] text-[#8B949E]">Overview of completed vs approved microjob submissions across the week.</p>
                </div>
                <span className="text-[10.5px] text-[#22C55E] font-mono px-2 py-0.5 rounded bg-[#0C2117] border border-[#124D31]">
                  Live Sync Active
                </span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { day: 'Mon', tasks: 142, approved: 130 },
                    { day: 'Tue', tasks: 185, approved: 170 },
                    { day: 'Wed', tasks: 210, approved: 195 },
                    { day: 'Thu', tasks: 290, approved: 275 },
                    { day: 'Fri', tasks: 340, approved: 320 },
                    { day: 'Sat', tasks: 280, approved: 265 },
                    { day: 'Sun', tasks: 390, approved: 375 },
                  ]} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                    <XAxis dataKey="day" stroke="#8B949E" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8B949E" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#12171F', borderColor: '#30363D', fontSize: '11.5px', color: '#E6EDF3' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="tasks" name="Tasks Submitted" stroke="#38BDF8" strokeWidth={2} dot={true} />
                    <Line type="monotone" dataKey="approved" name="Approved Payouts" stroke="#22C55E" strokeWidth={2} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Operations Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3.5 space-y-2">
                <h4 className="text-[12px] text-[#E6EDF3] font-light">System &amp; Infrastructure Status</h4>
                <div className="space-y-1 text-[11px] text-[#8B949E]">
                  <div className="flex justify-between py-1 border-b border-[#21262D]">
                    <span>Database Engine:</span>
                    <span className="text-[#22C55E] font-mono">Neon PostgreSQL (Connected)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#21262D]">
                    <span>Object Storage:</span>
                    <span className="text-[#38BDF8] font-mono">Cloudflare R2 S3 API</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Admin Accounts:</span>
                    <span className="text-[#E6EDF3] font-mono">{adminUsers.length} Active Staff</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3.5 space-y-2">
                <h4 className="text-[12px] text-[#E6EDF3] font-light">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="p-2 bg-[#12171F] hover:bg-[#1E2530] border border-[#21262D] rounded text-left text-[11px] text-[#E6EDF3] transition-colors cursor-pointer"
                  >
                    <div className="font-light">Manage Jobs</div>
                    <div className="text-[10px] text-[#8B949E]">{jobs.length} total jobs</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="p-2 bg-[#12171F] hover:bg-[#1E2530] border border-[#21262D] rounded text-left text-[11px] text-[#E6EDF3] transition-colors cursor-pointer"
                  >
                    <div className="font-light">Review Submits</div>
                    <div className="text-[10px] text-[#F59E0B]">{submissions.filter(s => s.status === 'pending').length} pending</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-2 bg-[#12171F] hover:bg-[#1E2530] border border-[#21262D] rounded text-left text-[11px] text-[#E6EDF3] transition-colors cursor-pointer"
                  >
                    <div className="font-light">Worker Personnel</div>
                    <div className="text-[10px] text-[#38BDF8]">{users.length} workers</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('system')}
                    className="p-2 bg-[#12171F] hover:bg-[#1E2530] border border-[#21262D] rounded text-left text-[11px] text-[#E6EDF3] transition-colors cursor-pointer"
                  >
                    <div className="font-light">System &amp; DB</div>
                    <div className="text-[10px] text-[#22C55E]">Postgres &amp; R2</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 0: ADMIN USERS (Table: dd_admin_users)
            Roles: Administrator & Leader & Sub Leader
        ======================================================== */}
        {activeTab === 'admin-users' && (
          <div className="space-y-3">
            {/* Header & Create Button */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#E6EDF3] font-light">Administrative Staff &amp; Leadership</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#280D12] text-[#EF4444] border border-[#5C1D24]">
                    Table: dd_admin_users
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingAdminUser(null);
                  setAdminUserFormData({
                    username: '',
                    email: '',
                    password: '',
                    role: 'Leader',
                    status: 'active',
                    notes: '',
                  });
                  setIsAdminUserModalOpen(true);
                }}
                className="vib-btn-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white border border-[#DC2626]"
              >
                <Plus className="w-3 h-3" />
                <span>Create Admin / Leader</span>
              </button>
            </div>

            {/* 3 Role Distribution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Administrator */}
              <div className="p-2.5 rounded-[6px] bg-[#161B22] border border-[#5C1D24]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[6px] bg-[#280D12] border border-[#5C1D24] flex items-center justify-center text-[#EF4444]">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#E6EDF3] font-light">Administrator</div>
                    <div className="text-[10px] text-[#8B949E]">Root &amp; System Control</div>
                  </div>
                </div>
                <div className="text-[16px] font-mono font-normal text-[#EF4444]">
                  {adminUsers.filter((u) => u.role === 'Administrator' || (u.role as string) === 'admin').length}
                </div>
              </div>

              {/* Leader */}
              <div className="p-2.5 rounded-[6px] bg-[#161B22] border border-[#4D3800]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[6px] bg-[#271E0B] border border-[#4D3800] flex items-center justify-center text-[#F59E0B]">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#E6EDF3] font-light">Leader</div>
                    <div className="text-[10px] text-[#8B949E]">Ops &amp; Work Dispatch</div>
                  </div>
                </div>
                <div className="text-[16px] font-mono font-normal text-[#F59E0B]">
                  {adminUsers.filter((u) => u.role === 'Leader').length}
                </div>
              </div>

              {/* Sub Leader */}
              <div className="p-2.5 rounded-[6px] bg-[#161B22] border border-[#164E63]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[6px] bg-[#0D2847] border border-[#164E63] flex items-center justify-center text-[#38BDF8]">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#E6EDF3] font-light">Sub Leader</div>
                    <div className="text-[10px] text-[#8B949E]">QA &amp; Verification</div>
                  </div>
                </div>
                <div className="text-[16px] font-mono font-normal text-[#38BDF8]">
                  {adminUsers.filter((u) => u.role === 'Sub Leader').length}
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 border-b border-[#21262D] pb-2 text-[11px]">
              <span className="text-[#8B949E] text-[10.5px] uppercase font-mono mr-1">Role Filter:</span>
              <button
                type="button"
                onClick={() => setAdminRoleFilter('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  adminRoleFilter === 'all'
                    ? 'bg-[#21262D] text-[#E6EDF3] font-light'
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                All ({adminUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminRoleFilter('Administrator')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  adminRoleFilter === 'Administrator'
                    ? 'bg-[#280D12] text-[#EF4444] border border-[#5C1D24] font-light'
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                Administrator ({adminUsers.filter((u) => u.role === 'Administrator' || (u.role as string) === 'admin').length})
              </button>
              <button
                type="button"
                onClick={() => setAdminRoleFilter('Leader')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  adminRoleFilter === 'Leader'
                    ? 'bg-[#271E0B] text-[#F59E0B] border border-[#4D3800] font-light'
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                Leader ({adminUsers.filter((u) => u.role === 'Leader').length})
              </button>
              <button
                type="button"
                onClick={() => setAdminRoleFilter('Sub Leader')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  adminRoleFilter === 'Sub Leader'
                    ? 'bg-[#0D2847] text-[#38BDF8] border border-[#164E63] font-light'
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                Sub Leader ({adminUsers.filter((u) => u.role === 'Sub Leader').length})
              </button>
            </div>

            {/* Admin Table */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                      <th className="py-2 px-3">Admin Username / Email</th>
                      <th className="py-2 px-3">Administrative Role</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Notes / Department</th>
                      <th className="py-2 px-3">Last Login</th>
                      <th className="py-2 px-3">Created</th>
                      <th className="py-2 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers
                      .filter((u) => {
                        if (adminRoleFilter === 'all') return true;
                        if (adminRoleFilter === 'Administrator') return u.role === 'Administrator' || (u.role as string) === 'admin';
                        return u.role === adminRoleFilter;
                      })
                      .map((u) => {
                        const isRootAdmin = u.username.toLowerCase() === 'admin' || u.id === 'adm_1';
                        return (
                          <tr key={u.id} className="border-b border-[#21262D] hover:bg-[#12171F]/60">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#E6EDF3] font-light">{u.username}</span>
                                {isRootAdmin && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#280D12] text-[#EF4444] border border-[#5C1D24]">
                                    ROOT
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#8B949E]">{u.email}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              {u.role === 'Administrator' || (u.role as string) === 'admin' ? (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#280D12] text-[#EF4444] border border-[#5C1D24] font-light inline-flex items-center gap-1">
                                  <Shield className="w-2.5 h-2.5" />
                                  <span>Administrator</span>
                                </span>
                              ) : u.role === 'Leader' ? (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#271E0B] text-[#F59E0B] border border-[#4D3800] font-light inline-flex items-center gap-1">
                                  <Award className="w-2.5 h-2.5" />
                                  <span>Leader</span>
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D2847] text-[#38BDF8] border border-[#164E63] font-light inline-flex items-center gap-1">
                                  <UserCheck className="w-2.5 h-2.5" />
                                  <span>Sub Leader</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                  u.status === 'active'
                                    ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                                    : 'bg-[#280D12] text-[#F87171] border-[#5C1D24]'
                                }`}
                              >
                                {u.status}
                      </span>
                            </td>
                            <td className="py-2.5 px-3 text-[#8B949E] text-[11px] max-w-[160px] truncate">
                              {u.notes || '—'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10.5px] text-[#8B949E]">
                              {u.lastLogin || 'Never'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10.5px] text-[#6E7681]">
                              {u.createdAt}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingAdminUser(u);
                                    setAdminUserFormData({
                                      username: u.username,
                                      email: u.email,
                                      password: '',
                                      role: (['Administrator', 'Leader', 'Sub Leader'].includes(u.role)
                                        ? u.role
                                        : 'Leader') as AdminRole,
                                      status: u.status,
                                      notes: u.notes || '',
                                    });
                                    setIsAdminUserModalOpen(true);
                                  }}
                                  className="p-1 rounded bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D]"
                                  title="Edit Admin Account"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {!isRootAdmin && (
                                  <>
                                    <button
                                      onClick={() => handleToggleAdminStatus(u.id, u.status)}
                                      className={`p-1 rounded border text-[10px] ${
                                        u.status === 'active'
                                          ? 'bg-[#161B22] text-[#F87171] border-[#30363D]'
                                          : 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                                      }`}
                                      title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                    >
                                      <Ban className="w-3 h-3" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteAdminUser(u.id)}
                                      className="p-1 rounded bg-[#280D12] text-[#F87171] border border-[#5C1D24]"
                                      title="Delete Admin Account"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: WORKERS (Table: dd_users)
            Clean separation: Only Worker / Dispatch Operators
        ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#E6EDF3] font-light">Worker Personnel Management</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12171F] text-[#38BDF8] border border-[#38BDF8]/40">
                    Table: dd_users
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserFormData({
                    username: '',
                    email: '',
                    password: '',
                    role: 'worker',
                    notes: '',
                  });
                  setUsernameCheck({ status: 'idle', message: '' });
                  setIsUserModalOpen(true);
                }}
                className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
              >
                <Plus className="w-3 h-3" />
                <span>Create Worker</span>
              </button>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                      <th className="py-2 px-3">Worker Username / Email</th>
                      <th className="py-2 px-3">Work Capacity</th>
                      <th className="py-2 px-3 font-mono">Collected Data</th>
                      <th className="py-2 px-3 font-mono">Used Data</th>
                      <th className="py-2 px-3 font-mono">Completed Jobs</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Joining Date</th>
                      <th className="py-2 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#21262D] hover:bg-[#12171F]/60">
                        <td className="py-2.5 px-3">
                          <div className="text-[#E6EDF3] font-light">{u.username}</div>
                          <div className="text-[10px] text-[#8B949E]">{u.email}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="inline-flex items-center gap-1 text-[#22C55E] text-[11px] font-light">
                            <InfinityIcon className="w-3.5 h-3.5" />
                            <span>Unlimited</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#E6EDF3]">
                          {(u.totalCollectedData || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#38BDF8]">
                          {(u.totalUsedData || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#4ADE80]">
                          {(u.totalJobsCount || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded border ${
                              u.status === 'active'
                                ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                                : 'bg-[#280D12] text-[#F87171] border-[#5C1D24]'
                            }`}
                          >
                            {u.status}
                      </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10.5px] text-[#6E7681]">
                          {u.joiningDate}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserFormData({
                                  username: u.username,
                                  email: u.email,
                                  password: '',
                                  role: 'worker',
                                  notes: u.notes || '',
                                });
                                setUsernameCheck({
                                  status: 'available',
                                  message: 'Current worker username (Kept)',
                                });
                                setIsUserModalOpen(true);
                              }}
                              className="p-1 rounded bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D]"
                              title="Edit Worker Account"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => handleBanUser(u.id, u.status)}
                              className={`p-1 rounded border text-[10px] ${
                                u.status === 'active'
                                  ? 'bg-[#161B22] text-[#F87171] border-[#30363D]'
                                  : 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                              }`}
                              title={u.status === 'active' ? 'Suspend Worker' : 'Activate Worker'}
                            >
                              <Ban className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded bg-[#280D12] text-[#F87171] border border-[#5C1D24]"
                              title="Delete Worker Account"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: DATA MANAGEMENT
        ======================================================== */}
        {activeTab === 'data' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px] text-[#E6EDF3] font-light">Data Pipelines &amp; File Inventory</div>
              <button
                onClick={handleOpenUploadDataModal}
                className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Data File</span>
              </button>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 font-mono">Total Lines</th>
                      <th className="py-2 px-3 font-mono">Collected</th>
                      <th className="py-2 px-3 font-mono">Remaining</th>
                      <th className="py-2 px-3">Uploaded</th>
                      <th className="py-2 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataFiles.map((f) => (
                      <tr key={f.id} className="border-b border-[#21262D] hover:bg-[#12171F]/60">
                        <td className="py-2.5 px-3 text-[#E6EDF3] font-light max-w-[220px] truncate">
                          {f.fileName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[9.5px] uppercase font-mono px-1 py-0.5 rounded bg-[#12171F] border border-[#2A303C] text-[#38BDF8]">
                            {f.dataType}
                      </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#8B949E]">{f.totalCount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-[#8B949E]">{f.collectedCount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-[#38BDF8] font-light">
                          {f.remainingCount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-[#8B949E] text-[10.5px]">{f.uploadedAt}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteDataFile(f.id)}
                            className="p-1 rounded bg-[#280D12] text-[#F87171] border border-[#5C1D24]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: JOBS MANAGER
        ======================================================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] text-[#E6EDF3] font-light">Campaign Dispatch Jobs</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="vib-input pl-8 py-1.5 w-[200px]"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingJobId(null);
                    setJobFormData({
                      title: '',
                      type: 'email',
                      payoutPerUnit: 0.05,
                      dailyTarget: 500,
                      instructions: '',
                      thumbnailUrl: '',
                    });
                    setIsJobModalOpen(true);
                  }}
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Job</span>
                </button>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {jobs
                .filter((j) => j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()))
                .map((j) => (
                  <div
                    key={j.id}
                    className={`bg-[#161B22] border rounded-[8px] overflow-hidden flex flex-col ${
                      j.status === 'inactive' ? 'border-[#30363D] opacity-75' : 'border-[#21262D]'
                    }`}
                  >
                    {/* Thumbnail */}
                    {j.thumbnailUrl ? (
                      <div className="h-28 bg-[#0D1117] border-b border-[#30363D] overflow-hidden shrink-0">
                        <img src={j.thumbnailUrl} alt={j.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-28 bg-[#0D1117] border-b border-[#30363D] shrink-0 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-[#21262D]" />
                      </div>
                    )}

                    <div className="p-3.5 flex flex-col flex-1 space-y-3">
                      {/* Title & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] text-[#E6EDF3] font-light leading-tight">
                          {j.title}
                        </h4>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                            j.status === 'active'
                              ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                              : 'bg-[#2A1215] text-[#F87171] border-[#6B1D24]'
                          }`}
                        >
                          {j.status}
                      </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#8B949E]">
                        <div className="bg-[#0D1117] border border-[#21262D] rounded p-1.5 flex flex-col items-center">
                          <span className="text-[#38BDF8]">${j.payoutPerUnit.toFixed(2)}</span>
                          <span className="text-[9px] uppercase mt-0.5">Payout</span>
                        </div>
                        <div className="bg-[#0D1117] border border-[#21262D] rounded p-1.5 flex flex-col items-center">
                          <span className="text-[#C9D1D9]">{j.dailyTarget}</span>
                          <span className="text-[9px] uppercase mt-0.5">Target</span>
                        </div>
                      </div>

                      {/* Info Pills */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#12171F] border border-[#2A303C] text-[#38BDF8]">
                          {j.type}</span>
                        <span className="text-[10px] text-[#8B949E] font-mono">
                          {j.createdAt}
                      </span>
                      </div>

                      <div className="flex-1" />

                      {/* Actions */}
                      <div className="pt-2 border-t border-[#30363D] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleJobStatus(j)}
                          className={`text-[11px] font-light px-2 py-1 rounded transition-colors ${
                            j.status === 'active'
                              ? 'text-[#F87171] hover:bg-[#2A1215]'
                              : 'text-[#4ADE80] hover:bg-[#0C2117]'
                          }`}
                        >
                          {j.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditJob(j)}
                            className="p-1.5 text-[#38BDF8] hover:bg-[#12171F] rounded transition-colors"
                            title="Edit Job"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteJob(j.id)}
                            className="p-1.5 text-[#F87171] hover:bg-[#2A1215] rounded transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {jobs.filter((j) => j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).length === 0 && (
              <div className="text-center py-10 bg-[#161B22] border border-[#30363D] rounded-[8px]">
                <Briefcase className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: SUBMISSIONS REVIEW
        ======================================================== */}
        {activeTab === 'submissions' && (() => {
          const filteredSubmissions = submissions.filter((s) => {
            const matchesStatus = submissionStatusFilter === 'all' || s.status === submissionStatusFilter;
            const query = submissionSearchQuery.trim().toLowerCase();
            const matchesSearch =
              !query ||
              s.userName.toLowerCase().includes(query) ||
              s.jobTitle.toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
          });

          return (
            <div className="space-y-4">
              {/* Header & Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] text-[#E6EDF3] font-light">Worker Proof Submissions</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-[#12171F] rounded-[6px] border border-[#30363D] overflow-hidden p-0.5">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSubmissionStatusFilter(status as any)}
                        className={`px-3 py-1 text-[11px] font-light rounded-[4px] capitalize transition-colors ${
                          submissionStatusFilter === status
                            ? 'bg-[#21262D] text-[#E6EDF3] shadow-sm'
                            : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#1C2128]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search worker or job..."
                      value={submissionSearchQuery}
                      onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                      className="vib-input pl-8 py-1.5 w-[200px]"
                    />
                  </div>
                </div>
              </div>

              {/* Submissions Compact Table */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Worker</th>
                        <th className="py-2 px-3">Job Title</th>
                        <th className="py-2 px-3 font-mono">Success</th>
                        <th className="py-2 px-3 font-mono">Failed</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((s) => (
                        <tr key={s.id} className="border-b border-[#21262D] hover:bg-[#1C2128] transition-colors group">
                          <td className="py-2.5 px-3 text-[#8B949E] font-mono">{new Date(s.submittedAt).toLocaleDateString()}</td>
                          <td className="py-2.5 px-3 text-[#E6EDF3] font-light">{s.userName}</td>
                          <td className="py-2.5 px-3 text-[#C9D1D9] max-w-[180px] truncate">{s.jobTitle}</td>
                          <td className="py-2.5 px-3 font-mono text-[#22C55E]">{s.successCount}</td>
                          <td className="py-2.5 px-3 font-mono text-[#EF4444]">{s.failedCount}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                                s.status === 'approved'
                                  ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                                  : s.status === 'rejected'
                                  ? 'bg-[#2A1215] text-[#F87171] border-[#6B1D24]'
                                  : 'bg-[#12171F] text-[#F59E0B] border-[#523912]'
                              }`}
                            >
                              {s.status}
                      </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedSubmission(s);
                                setIsSubmissionDetailModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] text-[10.5px] transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-10">
                    <FileCheck className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB 5: APPLICATIONS
        ======================================================== */}
        {activeTab === 'applications' && (() => {
          const pendingCount = applications.filter((a) => a.status === 'pending').length;
          const approvedCount = applications.filter((a) => a.status === 'approved').length;
          const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

          const filteredApplications = applications.filter((app) => {
            const matchesStatus =
              appFilterStatus === 'all' || app.status === appFilterStatus;
            const query = appSearchQuery.trim().toLowerCase();
            const matchesSearch =
              !query ||
              app.fullName.toLowerCase().includes(query) ||
              app.email.toLowerCase().includes(query) ||
              (app.phone && app.phone.toLowerCase().includes(query)) ||
              (app.experience && app.experience.toLowerCase().includes(query));
            return matchesStatus && matchesSearch;
          });

          return (
            <div className="space-y-3">
              {/* Header & Filter Controls Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] text-[#E6EDF3] font-light">Recruitment Applications</h3>
                    <span className="text-[11px] text-[#38BDF8] font-mono px-2 py-0.5 rounded bg-[#0D2136] border border-[#153456]">
                      {applications.length} Total
                      </span>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter Pills */}
                  <div className="inline-flex rounded-[6px] bg-[#12171F] p-0.5 border border-[#30363D]">
                    <button
                      onClick={() => setAppFilterStatus('all')}
                      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-light transition-colors ${
                        appFilterStatus === 'all'
                          ? 'bg-[#21262D] text-[#E6EDF3]'
                          : 'text-[#8B949E] hover:text-[#C9D1D9]'
                      }`}
                    >
                      All ({applications.length})
                    </button>
                    <button
                      onClick={() => setAppFilterStatus('pending')}
                      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-light transition-colors ${
                        appFilterStatus === 'pending'
                          ? 'bg-[#3B2D12] text-[#FBBF24]'
                          : 'text-[#8B949E] hover:text-[#C9D1D9]'
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setAppFilterStatus('approved')}
                      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-light transition-colors ${
                        appFilterStatus === 'approved'
                          ? 'bg-[#0C2117] text-[#22C55E]'
                          : 'text-[#8B949E] hover:text-[#C9D1D9]'
                      }`}
                    >
                      Approved ({approvedCount})
                    </button>
                    <button
                      onClick={() => setAppFilterStatus('rejected')}
                      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-light transition-colors ${
                        appFilterStatus === 'rejected'
                          ? 'bg-[#2A1215] text-[#F87171]'
                          : 'text-[#8B949E] hover:text-[#C9D1D9]'
                      }`}
                    >
                      Rejected ({rejectedCount})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8B949E]" />
                    <input
                      type="text"
                      placeholder="Search applicant..."
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-[11.5px] bg-[#12171F] border border-[#30363D] rounded-[6px] text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>
              </div>

              {/* Compact Applications Table */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2.5 px-3">Applicant Information</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Daily Hours</th>
                        <th className="py-2.5 px-3">Experience</th>
                        <th className="py-2.5 px-3 font-mono">Applied At</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262D]">
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#8B949E]">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <FileText className="w-7 h-7 text-[#484F58]" />
                              <span className="text-[12px] text-[#C9D1D9] font-light">No applications found</span>
                              <span className="text-[11px] text-[#8B949E]">
                                {appSearchQuery || appFilterStatus !== 'all'
                                  ? 'Try changing your search query or filter.'
                                  : 'No recruitment applications have been received yet.'}</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-[#1C2128]/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#38BDF8] font-normal text-[11px] shrink-0 uppercase">
                                  {app.fullName.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[#E6EDF3] font-light truncate max-w-[180px]">
                                    {app.fullName}
                                  </div>
                                  <div className="text-[10.5px] text-[#8B949E] font-mono truncate max-w-[180px]">
                                    {app.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11.5px] text-[#C9D1D9] whitespace-nowrap">
                              {app.phone || <span className="text-[#8B949E]">—</span>}
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11.5px] text-[#E6EDF3]">
                              <span className="inline-flex items-center gap-1 text-[#38BDF8]">
                                <Clock className="w-3 h-3" />
                                {app.dailyHours || 4}h/day
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-[#8B949E] text-[11.5px] max-w-[200px]">
                              <div className="truncate" title={app.experience}>
                                {app.experience || '—'}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11px] text-[#8B949E] whitespace-nowrap">
                              {app.createdAt}
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {app.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-[#3B2D12] text-[#FBBF24] border border-[#785412] font-light">
                                  <Clock className="w-2.5 h-2.5" />
                                  Pending
                                  </span>
                              )}
                              {app.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-[#0C2117] text-[#22C55E] border border-[#124D31] font-light">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  Approved
                                  </span>
                              )}
                              {app.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-[#2A1215] text-[#F87171] border border-[#6B1D24] font-light">
                                  <XCircle className="w-2.5 h-2.5" />
                                  Rejected
                                  </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {/* View Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setIsAppDetailModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded bg-[#161B22] hover:bg-[#1C2128] text-[#38BDF8] hover:text-[#7DD3FC] border border-[#30363D] text-[11px] font-light inline-flex items-center gap-1 transition-colors"
                                  title="View full application details"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </button>

                                {/* Approve Button */}
                                <button
                                  type="button"
                                  onClick={() => handleApproveApplication(app)}
                                  disabled={app.status === 'approved' || actionLoadingAppId === app.id}
                                  className="px-2 py-1 rounded bg-[#0E2E1D] hover:bg-[#14422B] text-[#22C55E] border border-[#1A5C38] text-[11px] font-light inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title={app.status === 'approved' ? 'Already approved' : 'Approve & Create Worker Account'}
                                >
                                  {actionLoadingAppId === app.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  <span>Approve</span>
                                </button>

                                {/* Reject Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRejectApplication(app)}
                                  disabled={app.status === 'rejected' || actionLoadingAppId === app.id}
                                  className="px-2 py-1 rounded bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] border border-[#5C2329] text-[11px] font-light inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title={app.status === 'rejected' ? 'Already rejected' : 'Reject Application'}
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB: CONTACTS / PUBLIC INQUIRIES
        ======================================================== */}
        {activeTab === 'contacts' && (() => {
          const filteredContacts = contacts.filter((c) => {
            const query = contactSearchQuery.trim().toLowerCase();
            return (
              !query ||
              c.name.toLowerCase().includes(query) ||
              c.email.toLowerCase().includes(query) ||
              c.subject.toLowerCase().includes(query) ||
              c.message.toLowerCase().includes(query)
            );
          });

          return (
            <div className="space-y-3">
              {/* Header & Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] text-[#E6EDF3] font-light">Public Contact Inquiries</h3>
                  <span className="text-[11px] text-[#38BDF8] font-mono px-2 py-0.5 rounded bg-[#0D2136] border border-[#153456]">
                    {contacts.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8B949E]" />
                    <input
                      type="text"
                      placeholder="Search inquiries (name, email, topic)..."
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-[11.5px] bg-[#12171F] border border-[#30363D] rounded-[6px] text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchAdminData}
                    className="p-1.5 rounded-[6px] bg-[#12171F] hover:bg-[#1C2128] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] transition-colors"
                    title="Refresh inquiries"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Compact Contacts Table */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2.5 px-3">Contact Person</th>
                        <th className="py-2.5 px-3">Subject / Topic</th>
                        <th className="py-2.5 px-3">Message Preview</th>
                        <th className="py-2.5 px-3 font-mono">Received At</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262D]">
                      {filteredContacts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[#8B949E]">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Mail className="w-7 h-7 text-[#484F58]" />
                              <span className="text-[12px] text-[#C9D1D9] font-light">No contact messages found</span>
                              <span className="text-[11px] text-[#8B949E]">
                                {contactSearchQuery
                                  ? 'Try changing your search keywords.'
                                  : 'No public contact inquiries have been received yet.'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredContacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-[#1C2128]/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#38BDF8] font-normal text-[11px] shrink-0 uppercase">
                                  {contact.name ? contact.name.slice(0, 2) : 'DD'}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[#E6EDF3] font-light truncate max-w-[160px]">
                                    {contact.name}
                                  </div>
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="text-[10.5px] text-[#38BDF8] hover:underline font-mono truncate max-w-[160px] block"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="text-[11.5px] text-[#E6EDF3] font-light truncate max-w-[200px]" title={contact.subject}>
                                {contact.subject || 'General Inquiry'}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-[#8B949E] text-[11.5px] max-w-[300px]">
                              <div className="truncate" title={contact.message}>
                                {contact.message}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11px] text-[#8B949E] whitespace-nowrap">
                              {contact.createdAt}
                            </td>

                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {/* View Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setIsContactModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded bg-[#161B22] hover:bg-[#1C2128] text-[#38BDF8] hover:text-[#7DD3FC] border border-[#30363D] text-[11px] font-light inline-flex items-center gap-1 transition-colors"
                                  title="View full contact details"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContact(contact.id)}
                                  disabled={deletingContactId === contact.id}
                                  className="px-2 py-1 rounded bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] border border-[#5C2329] text-[11px] font-light inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title="Delete message"
                                >
                                  {deletingContactId === contact.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB: SERVICES MANAGEMENT
        ======================================================== */}
        {activeTab === 'services' && (() => {
          const filteredServices = services.filter((s) => {
            const query = serviceSearchQuery.trim().toLowerCase();
            return (
              !query ||
              s.name.toLowerCase().includes(query) ||
              s.category.toLowerCase().includes(query) ||
              (s.shortDescription && s.shortDescription.toLowerCase().includes(query)) ||
              (s.description && s.description.toLowerCase().includes(query))
            );
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="text-[14px] text-[#E6EDF3] font-light">Team Operations &amp; Services</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161B22] border border-[#30363D] text-[#38BDF8]">
                      {services.length} Total
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="vib-input pl-8 py-1.5 w-[200px]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setServiceFormData({
                        id: '',
                        name: '',
                        category: 'Operations',
                        price: '',
                        shortDescription: '',
                        description: '',
                        iconUrl: '',
                        status: 'active',
                      });
                      setIsServiceModalOpen(true);
                    }}
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2.5 px-3 w-[52px]">Icon</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Service Name &amp; Category</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Pricing / Rate</th>
                        <th className="py-2.5 px-3 min-w-[240px]">Short Description</th>
                        <th className="py-2.5 px-3 w-[100px]">Status</th>
                        <th className="py-2.5 px-3 text-right w-[110px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((srv) => (
                        <tr
                          key={srv.id}
                          className="border-b border-[#21262D] hover:bg-[#1C2128] transition-colors group"
                        >
                          <td className="py-2.5 px-3">
                            <div className="w-9 h-9 rounded-[6px] bg-[#0B0F17] border border-[#30363D] overflow-hidden relative flex items-center justify-center shrink-0">
                              {srv.iconUrl ? (
                                <img
                                  src={srv.iconUrl}
                                  alt={srv.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Layers className="w-4 h-4 text-[#38BDF8]" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div
                              className={`font-normal ${
                                srv.status === 'inactive' ? 'text-[#8B949E]' : 'text-[#E6EDF3]'
                              } line-clamp-1`}
                            >
                              {srv.name}
                            </div>
                            <div className="text-[10px] text-[#38BDF8] mt-0.5 inline-block font-mono">
                              {srv.category}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[11px] text-[#22C55E] bg-[#0C2117] px-2 py-0.5 rounded border border-[#124D31]">
                              {srv.price || 'Free / Included'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="text-[11px] text-[#8B949E] line-clamp-2 max-w-[340px]">
                              {srv.shortDescription || srv.description || 'No description provided.'}
                            </p>
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={async () => {
                                const newStatus = srv.status === 'active' ? 'inactive' : 'active';
                                await fetch(`/api/services/${srv.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus }),
                                });
                                fetchAdminData();
                              }}
                              className={`text-[9.5px] uppercase font-mono px-2 py-0.5 rounded border transition-colors ${
                                srv.status === 'active'
                                  ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31] hover:bg-[#123122]'
                                  : 'bg-[#2A1215] text-[#F87171] border-[#6B1D24] hover:bg-[#3D1A1F]'
                              }`}
                              title="Click to toggle status"
                            >
                              {srv.status || 'active'}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setServiceFormData({
                                    id: srv.id,
                                    name: srv.name,
                                    category: srv.category || 'Operations',
                                    price: srv.price || '',
                                    shortDescription: srv.shortDescription || '',
                                    description: srv.description || '',
                                    iconUrl: srv.iconUrl || '',
                                    status: (srv.status as any) || 'active',
                                  });
                                  setIsServiceModalOpen(true);
                                }}
                                className="p-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                                title="Edit Service"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to delete "${srv.name}"?`)) return;
                                  await fetch(`/api/services/${srv.id}`, { method: 'DELETE' });
                                  fetchAdminData();
                                }}
                                className="p-1.5 rounded bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] transition-colors"
                                title="Delete Service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <Layers className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
                    <p className="text-[12.5px] text-[#8B949E]">
                      {serviceSearchQuery ? 'No services found matching your query.' : 'No services configured yet.'}
                    </p>
                    <button
                      onClick={() => {
                        setServiceFormData({
                          id: '',
                          name: '',
                          category: 'Operations',
                          price: '',
                          shortDescription: '',
                          description: '',
                          iconUrl: '',
                          status: 'active',
                        });
                        setIsServiceModalOpen(true);
                      }}
                      className="mt-3 vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Service</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB 6: TUTORIALS MANAGEMENT
        ======================================================== */}
        {activeTab === 'tutorials' && (() => {
          const filteredTutorials = tutorials.filter(t => {
            const query = tutorialSearchQuery.trim().toLowerCase();
            return !query || 
                   t.title.toLowerCase().includes(query) || 
                   t.category.toLowerCase().includes(query);
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] text-[#E6EDF3] font-light">Video Tutorials</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tutorials..."
                      value={tutorialSearchQuery}
                      onChange={(e) => setTutorialSearchQuery(e.target.value)}
                      className="vib-input pl-8 py-1.5 w-[200px]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setTutFormData({
                        id: '',
                        title: '',
                        category: 'Email Sending',
                        videoUrl: '',
                        thumbnailUrl: '',
                        duration: '10:00',
                        instructions: '',
                        status: 'active',
                      });
                      setIsTutorialModalOpen(true);
                    }}
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Video</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2 px-3 w-[60px]">Video</th>
                        <th className="py-2 px-3 min-w-[200px]">Title & Category</th>
                        <th className="py-2 px-3 font-mono">Duration</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTutorials.map((tut) => (
                        <tr key={tut.id} className="border-b border-[#21262D] hover:bg-[#1C2128] transition-colors group">
                          <td className="py-2 px-3">
                            <div className="w-[60px] h-[34px] rounded-[4px] bg-[#0B0F17] border border-[#30363D] overflow-hidden relative flex items-center justify-center">
                              {tut.thumbnailUrl ? (
                                <img src={tut.thumbnailUrl} alt={tut.title} className="w-full h-full object-cover opacity-80" />
                              ) : (
                                <Video className="w-4 h-4 text-[#8B949E]" />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className={`font-light ${tut.status === 'inactive' ? 'text-[#8B949E]' : 'text-[#E6EDF3]'} line-clamp-1`}>{tut.title}</div>
                            <div className="text-[10px] text-[#38BDF8] font-mono mt-0.5">{tut.category}</div>
                          </td>
                          <td className="py-2 px-3 text-[#8B949E] font-mono">{tut.duration}</td>
                          <td className="py-2 px-3">
                            <button
                              onClick={async () => {
                                const newStatus = tut.status === 'active' ? 'inactive' : 'active';
                                await fetch(`/api/tutorials/${tut.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                fetchAdminData();
                              }}
                              className={`text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                tut.status === 'active'
                                  ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31] hover:bg-[#123122]'
                                  : 'bg-[#2A1215] text-[#F87171] border-[#6B1D24] hover:bg-[#3D1A1F]'
                              }`}
                            >
                              {tut.status || 'active'}
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setTutFormData({
                                    id: tut.id,
                                    title: tut.title,
                                    category: tut.category,
                                    videoUrl: tut.videoUrl,
                                    thumbnailUrl: tut.thumbnailUrl || '',
                                    duration: tut.duration,
                                    instructions: tut.instructions || '',
                                    status: tut.status || 'active',
                                  });
                                  setIsTutorialModalOpen(true);
                                }}
                                className="p-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                                title="Edit Video"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this tutorial?')) return;
                                  await fetch(`/api/tutorials/${tut.id}`, { method: 'DELETE' });
                                  fetchAdminData();
                                }}
                                className="p-1.5 rounded bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] transition-colors"
                                title="Delete Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTutorials.length === 0 && (
                  <div className="text-center py-8">
                    <Video className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB 7: TOOLS MANAGEMENT
        ======================================================== */}
        {activeTab === 'tools' && (() => {
          const filteredTools = tools.filter(t => {
            const query = toolSearchQuery.trim().toLowerCase();
            return !query || 
                   t.name.toLowerCase().includes(query) || 
                   t.category.toLowerCase().includes(query);
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] text-[#E6EDF3] font-light">Worker Tools Configuration</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={toolSearchQuery}
                      onChange={(e) => setToolSearchQuery(e.target.value)}
                      className="vib-input pl-8 py-1.5 w-[200px]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setToolFormData({
                        id: '',
                        name: '',
                        category: 'Utility',
                        url: '',
                        isInternal: false,
                        description: '',
                        iconUrl: '',
                        status: 'active',
                      });
                      setIsToolModalOpen(true);
                    }}
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tool</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2 px-3 w-[50px]">Icon</th>
                        <th className="py-2 px-3 min-w-[200px]">Tool Name & Category</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTools.map((t) => (
                        <tr key={t.id} className="border-b border-[#21262D] hover:bg-[#1C2128] transition-colors group">
                          <td className="py-2 px-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#0B0F17] border border-[#30363D] overflow-hidden relative flex items-center justify-center">
                              {t.iconUrl ? (
                                <img src={t.iconUrl} alt={t.name} className="w-full h-full object-cover" />
                              ) : (
                                <Wrench className="w-4 h-4 text-[#8B949E]" />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className={`font-light ${t.status === 'inactive' ? 'text-[#8B949E]' : 'text-[#E6EDF3]'} line-clamp-1`}>{t.name}</div>
                            <div className="text-[10px] text-[#38BDF8] mt-0.5 truncate max-w-[250px]">{t.category} &bull; {t.url}</div>
                          </td>
                          <td className="py-2 px-3 text-[#8B949E] font-mono">
                            {t.isInternal ? <span className="text-[#A78BFA]">Internal</span> : <span className="text-[#34D399]">External</span>}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={async () => {
                                const newStatus = t.status === 'active' ? 'inactive' : 'active';
                                await fetch(`/api/tools/${t.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                fetchAdminData();
                              }}
                              className={`text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                t.status === 'active'
                                  ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31] hover:bg-[#123122]'
                                  : 'bg-[#2A1215] text-[#F87171] border-[#6B1D24] hover:bg-[#3D1A1F]'
                              }`}
                            >
                              {t.status || 'active'}
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setToolFormData({
                                    id: t.id,
                                    name: t.name,
                                    category: t.category,
                                    url: t.url,
                                    isInternal: t.isInternal,
                                    description: t.description || '',
                                    iconUrl: t.iconUrl || '',
                                    status: t.status || 'active',
                                  });
                                  setIsToolModalOpen(true);
                                }}
                                className="p-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                                title="Edit Tool"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this tool?')) return;
                                  await fetch(`/api/tools/${t.id}`, { method: 'DELETE' });
                                  fetchAdminData();
                                }}
                                className="p-1.5 rounded bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] transition-colors"
                                title="Delete Tool"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTools.length === 0 && (
                  <div className="text-center py-8">
                    <Wrench className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB 8: AUTOMATION MANAGEMENT
        ======================================================== */}
        {activeTab === 'automation' && (() => {
          const filteredAutomation = automation.filter(t => {
            const query = autoSearchQuery.trim().toLowerCase();
            return !query || 
                   t.title.toLowerCase().includes(query) || 
                   t.fileName.toLowerCase().includes(query);
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] text-[#E6EDF3] font-light">Automation Packages &amp; Scripts</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={autoSearchQuery}
                      onChange={(e) => setAutoSearchQuery(e.target.value)}
                      className="vib-input pl-8 py-1.5 w-[200px]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAutoFormData({
                        id: '',
                        title: '',
                        fileName: '',
                        downloadUrl: '',
                        version: 'v1.0.0',
                        fileSize: '5 MB',
                        instructions: '',
                        iconUrl: '',
                        status: 'active',
                      });
                      setIsAutoModalOpen(true);
                    }}
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Package</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#12171F] text-[10.5px] text-[#8B949E]">
                        <th className="py-2 px-3 w-[50px]">Icon</th>
                        <th className="py-2 px-3 min-w-[200px]">Package Title & Info</th>
                        <th className="py-2 px-3 font-mono">Size</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAutomation.map((item) => (
                        <tr key={item.id} className="border-b border-[#21262D] hover:bg-[#1C2128] transition-colors group">
                          <td className="py-2 px-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#0B0F17] border border-[#30363D] overflow-hidden relative flex items-center justify-center">
                              {item.iconUrl ? (
                                <img src={item.iconUrl} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <Bot className="w-4 h-4 text-[#8B949E]" />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className={`font-light ${item.status === 'inactive' ? 'text-[#8B949E]' : 'text-[#E6EDF3]'} line-clamp-1`}>{item.title}</div>
                            <div className="text-[10px] text-[#38BDF8] mt-0.5 truncate max-w-[250px]">{item.fileName} &bull; {item.version}</div>
                          </td>
                          <td className="py-2 px-3 text-[#8B949E] font-mono">{item.fileSize}</td>
                          <td className="py-2 px-3">
                            <button
                              onClick={async () => {
                                const newStatus = item.status === 'active' ? 'inactive' : 'active';
                                await fetch(`/api/automation/${item.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                fetchAdminData();
                              }}
                              className={`text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                item.status === 'active'
                                  ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31] hover:bg-[#123122]'
                                  : 'bg-[#2A1215] text-[#F87171] border-[#6B1D24] hover:bg-[#3D1A1F]'
                              }`}
                            >
                              {item.status || 'active'}
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setAutoFormData({
                                    id: item.id,
                                    title: item.title,
                                    fileName: item.fileName,
                                    downloadUrl: item.downloadUrl,
                                    version: item.version,
                                    fileSize: item.fileSize,
                                    instructions: item.instructions || '',
                                    iconUrl: item.iconUrl || '',
                                    status: item.status || 'active',
                                  });
                                  setIsAutoModalOpen(true);
                                }}
                                className="p-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                                title="Edit Package"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this package?')) return;
                                  await fetch(`/api/automation/${item.id}`, { method: 'DELETE' });
                                  fetchAdminData();
                                }}
                                className="p-1.5 rounded bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] transition-colors"
                                title="Delete Package"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredAutomation.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            TAB 9: SITE SETTINGS
        ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            {/* Cloudflare R2 Brand Identity Assets: Logo & Favicon Upload */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#21262D] pb-3">
                <div>
                  <span className="text-[13px] text-[#E6EDF3] font-light block">
                    Website Brand Identity (Cloudflare R2 Storage)
                      </span>
                </div>
                <span className="text-[10.5px] font-mono text-[#38BDF8] px-2 py-0.5 rounded bg-[#0D2847] border border-[#164E63] shrink-0 self-start sm:self-auto">
                  Bucket: {siteSettings.r2BucketName || 'darkdevil-assets'}
                      </span>
              </div>

              {uploadStatusMsg && (
                <div className="p-2.5 rounded-[6px] bg-[#0C2117] border border-[#124D31] text-[11.5px] text-[#22C55E] flex items-center justify-between">
                  <span>{uploadStatusMsg}</span>
                  <button
                    onClick={() => setUploadStatusMsg(null)}
                    className="text-[#8B949E] hover:text-[#E6EDF3] text-[11px] ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Website Logo Upload Card */}
                <div className="p-3.5 rounded-[8px] bg-[#0D1117] border border-[#30363D] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
                      <span className="text-[12px] text-[#E6EDF3] font-light">Site Navbar Logo</span>
                    </div>
                    {siteSettings.logoUrl ? (
                      <span className="text-[10px] text-[#22C55E] px-1.5 py-0.5 rounded bg-[#0C2117] border border-[#124D31]">
                        R2 Active
                                  </span>
                    ) : (
                      <span className="text-[10px] text-[#8B949E] px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D]">
                        Default Icon
                                  </span>
                    )}
                  </div>

                  {/* Logo Live Preview Area */}
                  <div className="h-20 rounded-[6px] bg-[#161B22] border border-dashed border-[#30363D] flex items-center justify-center p-2 overflow-hidden">
                    {siteSettings.logoUrl ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={siteSettings.logoUrl}
                          alt="Platform Logo"
                          className="max-h-12 max-w-full object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-[9px] text-[#8B949E] truncate max-w-[200px]">
                          Previewing from R2
                      </span>
                      </div>
                    ) : (
                      <div className="text-center text-[#8B949E]">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40 text-[#8B949E]" />
                        <span className="text-[10.5px]">No custom logo uploaded yet</span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".png,.svg,.jpg,.jpeg,.webp,.gif,image/*"
                          className="hidden"
                          disabled={isUploadingLogo}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUploadToR2(file, 'logo');
                          }}
                        />
                        <span
                          className={`vib-btn-sm w-full bg-[#161B22] hover:bg-[#1C2128] text-[#38BDF8] border border-[#30363D] flex items-center justify-center gap-1.5 cursor-pointer ${
                            isUploadingLogo ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Uploading to Cloudflare R2...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Select &amp; Upload Logo to R2</span>
                            </>
                          )}</span>
                      </label>

                      {siteSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setSiteSettings({ ...siteSettings, logoUrl: '' })}
                          className="vib-btn-sm bg-[#280D12] hover:bg-[#3D141B] text-[#F87171] border border-[#5C1D24]"
                          title="Reset to default icon"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8B949E] mb-0.5">R2 Logo Public URL</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={siteSettings.logoUrl || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                          placeholder="https://... or /api/r2/file/..."
                          className="vib-input text-[11px] font-mono"
                        />
                        {siteSettings.logoUrl && (
                          <a
                            href={siteSettings.logoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-[6px] bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#38BDF8]"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[9.5px] text-[#6E7681] mt-0.5 block">
                        Recommended: Transparent PNG or SVG, 120-240px wide by 30-48px high.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Website Favicon Upload Card */}
                <div className="p-3.5 rounded-[8px] bg-[#0D1117] border border-[#30363D] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
                        <span className="text-[9px] font-light">★</span>
                      </div>
                      <span className="text-[12px] text-[#E6EDF3] font-light">Browser Tab Favicon</span>
                    </div>
                    {siteSettings.faviconUrl ? (
                      <span className="text-[10px] text-[#22C55E] px-1.5 py-0.5 rounded bg-[#0C2117] border border-[#124D31]">
                        R2 Active
                                  </span>
                    ) : (
                      <span className="text-[10px] text-[#8B949E] px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D]">
                        Default Icon
                                  </span>
                    )}
                  </div>

                  {/* Favicon Live Tab Mock Preview */}
                  <div className="h-20 rounded-[6px] bg-[#161B22] border border-dashed border-[#30363D] flex items-center justify-center p-2">
                    <div className="w-full max-w-[240px] px-3 py-1.5 rounded-t-[6px] bg-[#0D1117] border border-[#30363D] border-b-0 flex items-center gap-2 shadow-sm">
                      {siteSettings.faviconUrl ? (
                        <img
                          src={siteSettings.faviconUrl}
                          alt="Favicon"
                          className="w-4 h-4 object-contain rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded bg-[#EF4444] text-[8px] text-white flex items-center justify-center font-light">
                          D
                        </div>
                      )}
                      <span className="text-[11px] text-[#E6EDF3] truncate flex-1 font-light">
                        {siteSettings.siteName || 'Team Dark Devil'}</span>
                      <span className="text-[9px] text-[#8B949E]">✕</span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                          className="hidden"
                          disabled={isUploadingFavicon}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUploadToR2(file, 'favicon');
                          }}
                        />
                        <span
                          className={`vib-btn-sm w-full bg-[#161B22] hover:bg-[#1C2128] text-[#EF4444] border border-[#30363D] flex items-center justify-center gap-1.5 cursor-pointer ${
                            isUploadingFavicon ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {isUploadingFavicon ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Uploading to Cloudflare R2...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Select &amp; Upload Favicon to R2</span>
                            </>
                          )}</span>
                      </label>

                      {siteSettings.faviconUrl && (
                        <button
                          type="button"
                          onClick={() => setSiteSettings({ ...siteSettings, faviconUrl: '' })}
                          className="vib-btn-sm bg-[#280D12] hover:bg-[#3D141B] text-[#F87171] border border-[#5C1D24]"
                          title="Reset to default favicon"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8B949E] mb-0.5">R2 Favicon Public URL</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={siteSettings.faviconUrl || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, faviconUrl: e.target.value })}
                          placeholder="https://... or /api/r2/file/..."
                          className="vib-input text-[11px] font-mono"
                        />
                        {siteSettings.faviconUrl && (
                          <a
                            href={siteSettings.faviconUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-[6px] bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#38BDF8]"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[9.5px] text-[#6E7681] mt-0.5 block">
                        Recommended: Square .ico, .png, or .svg (32x32px or 64x64px).
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Site Branding & Metadata Form */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 space-y-3">
              <span className="text-[12.5px] text-[#E6EDF3] font-light block">
                General Platform Metadata &amp; Policies
              </span>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">Site / Team Name</label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">Domain</label>
                    <input
                      type="text"
                      value={siteSettings.domain}
                      onChange={(e) => setSiteSettings({ ...siteSettings, domain: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Top Announcement Banner</label>
                  <input
                    type="text"
                    value={siteSettings.announcement}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                    placeholder="e.g. Notice: US Email files updated..."
                    className="vib-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">Support Email</label>
                    <input
                      type="email"
                      value={siteSettings.supportEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">Support Telegram Handle</label>
                    <input
                      type="text"
                      value={siteSettings.supportTelegram}
                      onChange={(e) => setSiteSettings({ ...siteSettings, supportTelegram: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">
                    Worker Collect Data History Retention (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={siteSettings.historyRetentionDays}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, historyRetentionDays: Number(e.target.value) })
                    }
                    className="vib-input font-mono"
                  />
                  <span className="text-[10px] text-[#8B949E] mt-0.5 block">
                    Controls how long worker collection archives remain downloadable as TXT.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Platform Settings</span>
                  </button>
                  <span className="text-[10.5px] text-[#8B949E]">
                    Saves settings permanently to Neon PostgreSQL &amp; memory cache.
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            ADMIN PROFILE MANAGEMENT VIEW
        ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-2xl bg-[#161B22] border border-[#30363D] rounded-[8px] p-4">
            <div>
              <h3 className="text-[13px] text-[#E6EDF3] font-light flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Admin Profile Management &amp; Real-time DB Sync</span>
              </h3>
              <p className="text-[11px] text-[#8B949E] mt-0.5">
                Update your administrator credentials (`dd_admin_users` table) with real-time synchronization.
              </p>
            </div>

            {profileMsg && (
              <div className={`p-3 rounded-lg border text-[11.5px] ${profileMsg.type === 'success' ? 'bg-[#0C2117] border-[#124D31] text-[#22C55E]' : 'bg-[#280D12] border-[#5C1D24] text-[#EF4444]'}`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Admin ID / Identifier</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.id}
                  className="vib-input bg-[#0D1117] text-[#8B949E] cursor-not-allowed text-[11.5px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#E6EDF3] mb-1">Assigned Role</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.role}
                  className="vib-input bg-[#0D1117] text-[#38BDF8] cursor-not-allowed font-mono uppercase text-[11.5px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#E6EDF3] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  className="vib-input text-[11.5px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#E6EDF3] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="vib-input text-[11.5px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#E6EDF3] mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="vib-input text-[11.5px]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="vib-btn-sm bg-[#238636] hover:bg-[#2ea043] text-white border border-[#2ea043] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{profileLoading ? 'Synchronizing...' : 'Save & Sync Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 10: SYSTEM CONTROL / R2 & NEON POSTGRES DATABASE
        ======================================================== */}
        {activeTab === 'system' && (
          <div className="space-y-3">
            {/* Top Overview Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
              <div>
                <h3 className="text-[13px] text-[#E6EDF3] font-light flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#38BDF8]" />
                  <span>Cloudflare R2 Object Storage &amp; Database Infrastructure</span>
                </h3>
                <p className="text-[11px] text-[#8B949E] mt-0.5">
                  Configure Cloudflare R2 S3 API credentials, execute real-time permission probes, and verify PostgreSQL database connectivity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10.5px] px-2 py-0.5 rounded bg-[#0B1E2E] text-[#38BDF8] border border-[#1E3A8A]/50 flex items-center gap-1 font-mono">
                  <Server className="w-3 h-3" />
                  <span>Dual Storage Active</span>
                </span>
              </div>
            </div>

            {/* Cloudflare R2 Storage Infrastructure Card */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-[13px] text-[#E6EDF3] font-light">
                    Cloudflare R2 Storage Credentials (A to Z Configuration)
                  </span>
                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#1C1F26] text-[#8B949E] border border-[#30363D]">
                    S3 API Compatible
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {siteSettings.r2BucketName && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#12171F] text-[#38BDF8] border border-[#21262D]">
                      Bucket: {siteSettings.r2BucketName}
                    </span>
                  )}
                </div>
              </div>

              {/* R2 Credentials Form Grid */}
              <div className="space-y-3">
                {/* Row 1: Account ID & Storage Region */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#8B949E] flex items-center gap-1">
                        <span>Cloudflare Account ID</span>
                        <span className="text-[10px] text-[#6E7681]">(32-char hex string)</span>
                      </label>
                      {siteSettings.r2AccountId && !siteSettings.r2Endpoint && (
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = siteSettings.r2AccountId?.trim();
                            if (trimmed) {
                              setSiteSettings({
                                ...siteSettings,
                                r2Endpoint: `https://${trimmed}.r2.cloudflarestorage.com`,
                              });
                            }
                          }}
                          className="text-[10px] text-[#38BDF8] hover:underline"
                        >
                          Auto-fill S3 Endpoint
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={siteSettings.r2AccountId || ''}
                      onChange={(e) => {
                        const accId = e.target.value;
                        setSiteSettings((prev) => ({
                          ...prev,
                          r2AccountId: accId,
                          // If endpoint is currently empty or was standard, auto update
                          r2Endpoint:
                            !prev.r2Endpoint || prev.r2Endpoint.includes('.r2.cloudflarestorage.com')
                              ? accId.trim()
                                ? `https://${accId.trim()}.r2.cloudflarestorage.com`
                                : ''
                              : prev.r2Endpoint,
                        }));
                      }}
                      placeholder="e.g. 2b3f14a87e59c03b8214d023f2b23a91"
                      className="vib-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">
                      Storage Region / Hint
                    </label>
                    <select
                      value={siteSettings.r2Region || 'auto'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, r2Region: e.target.value })}
                      className="vib-input font-mono"
                    >
                      <option value="auto">auto (Global Anycast - Recommended)</option>
                      <option value="wnam">wnam (Western North America)</option>
                      <option value="enam">enam (Eastern North America)</option>
                      <option value="weur">weur (Western Europe)</option>
                      <option value="eeur">eeur (Eastern Europe)</option>
                      <option value="apac">apac (Asia-Pacific)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: S3 API Endpoint & Bucket Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">
                      R2 S3 API Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={siteSettings.r2Endpoint}
                      onChange={(e) => setSiteSettings({ ...siteSettings, r2Endpoint: e.target.value })}
                      placeholder="https://<accountid>.r2.cloudflarestorage.com"
                      className="vib-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">
                      R2 Bucket Name
                    </label>
                    <input
                      type="text"
                      value={siteSettings.r2BucketName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, r2BucketName: e.target.value })}
                      placeholder="e.g. darkdevil-assets"
                      className="vib-input font-mono"
                    />
                  </div>
                </div>

                {/* Row 3: Access Key ID & Secret Access Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1">
                      R2 Access Key ID (S3 API Token Key)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.r2AccessKeyId}
                      onChange={(e) => setSiteSettings({ ...siteSettings, r2AccessKeyId: e.target.value })}
                      placeholder="e.g. 7f9a1b2c3d4e5f6a7b8c9d0e"
                      className="vib-input font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#8B949E]">
                        R2 Secret Access Key (S3 API Token Secret)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowR2SecretKey(!showR2SecretKey)}
                        className="text-[10px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1"
                      >
                        {showR2SecretKey ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showR2SecretKey ? 'text' : 'password'}
                        value={siteSettings.r2SecretAccessKey}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, r2SecretAccessKey: e.target.value })
                        }
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="vib-input font-mono pr-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Public Domain / Custom CDN URL */}
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">
                    Public Domain / Custom CDN Domain (R2.dev or Custom Domain URL)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.r2PublicUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, r2PublicUrl: e.target.value })}
                    placeholder="https://pub-xxxxxx.r2.dev or https://cdn.darkdevil.team"
                    className="vib-input font-mono"
                  />
                  <span className="text-[10px] text-[#6E7681] mt-0.5 block">
                    When configured, public images, icons, and worker files will be served directly from this CDN domain.
                  </span>
                </div>
              </div>

              {/* Action Buttons: Test Connection & Save */}
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#21262D]">
                <button
                  type="button"
                  disabled={isTestingR2}
                  onClick={handleTestR2Connection}
                  className="vib-btn-sm bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white border border-[#0284C7] flex items-center gap-1.5 shadow-sm"
                >
                  {isTestingR2 ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>{isTestingR2 ? 'Testing R2 Connection...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingR2Settings}
                  onClick={handleSaveR2Settings}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#1C2128] text-[#E6EDF3] border border-[#30363D] flex items-center gap-1.5"
                >
                  {isSavingR2Settings ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#38BDF8]" />
                  )}
                  <span>Save R2 Configuration</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerBackup}
                  className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] flex items-center gap-1.5 ml-auto"
                >
                  <HardDrive className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Execute R2 Snapshot Backup</span>
                </button>
              </div>

              {/* Save Notification Notice */}
              {r2SaveNotice && (
                <div
                  className={`p-2.5 rounded-[6px] text-[11.5px] border ${
                    r2SaveNotice.startsWith('✓')
                      ? 'bg-[#0C2117] border-[#124D31] text-[#22C55E]'
                      : 'bg-[#280D12] border-[#5C1D24] text-[#EF4444]'
                  }`}
                >
                  {r2SaveNotice}
                </div>
              )}

              {/* In-Progress Testing Banner */}
              {isTestingR2 && (
                <div className="p-3 rounded-[6px] bg-[#0F1B2B] border border-[#1E3A8A] text-[#38BDF8] space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                    <span className="text-[12px] font-medium">Running Cloudflare R2 Connection &amp; Permissions Probe...</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#93C5FD] pl-6">
                    {r2TestProgressStage || 'Probing Cloudflare endpoints and checking S3 token authorizations...'}
                  </div>
                </div>
              )}

              {/* Test Results Card (Compact & User-Friendly) */}
              {r2TestResult && !isTestingR2 && (
                <div
                  className={`p-3.5 rounded-[8px] border space-y-3 transition-all ${
                    r2TestResult.success
                      ? 'bg-[#0A1F16] border-[#124D31]'
                      : 'bg-[#1F1013] border-[#5C1D24]'
                  }`}
                >
                  {/* Header with status & latency */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {r2TestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                      )}
                      <span
                        className={`text-[12.5px] font-medium ${
                          r2TestResult.success ? 'text-[#22C55E]' : 'text-[#EF4444]'
                        }`}
                      >
                        {r2TestResult.success
                          ? 'Cloudflare R2 Connection Verified & Fully Operational'
                          : 'Cloudflare R2 Connection Failed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {r2TestResult.latencyMs !== undefined && (
                        <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-[#12171F] text-[#38BDF8] border border-[#21262D]">
                          Latency: {r2TestResult.latencyMs}ms
                        </span>
                      )}
                      {r2TestResult.bucket && (
                        <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-[#12171F] text-[#8B949E] border border-[#21262D]">
                          Bucket: {r2TestResult.bucket}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Message */}
                  <div className="text-[11.5px] text-[#C9D1D9] leading-relaxed">
                    {r2TestResult.message}
                  </div>

                  {/* Step-by-Step Diagnostic Checklist */}
                  {r2TestResult.steps && r2TestResult.steps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10.5px] uppercase tracking-wider text-[#8B949E] font-medium">
                        Diagnostic Verification Steps:
                      </div>
                      <div className="space-y-1">
                        {r2TestResult.steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2 text-[11px] p-1.5 rounded bg-[#12171F]/80 border border-[#21262D]"
                          >
                            {step.status === 'passed' ? (
                              <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0 flex-1">
                              <span
                                className={`font-medium ${
                                  step.status === 'passed' ? 'text-[#E6EDF3]' : 'text-[#EF4444]'
                                }`}
                              >
                                {step.name}:
                              </span>{' '}
                              <span className="text-[#8B949E] font-mono text-[10.5px]">
                                {step.detail || (step.status === 'passed' ? 'OK' : 'Failed')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Troubleshooting Guidance on Failure */}
                  {!r2TestResult.success && (
                    <div className="p-2.5 rounded-[6px] bg-[#12171F] border border-[#30363D] text-[11px] text-[#8B949E] space-y-1">
                      <div className="text-[#F87171] font-medium">সমাধানের নির্দেশিকা (Fix Instructions):</div>
                      <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                        <li>
                          <strong>Account ID / S3 Endpoint:</strong> Cloudflare ড্যাশবোর্ডে গিয়ে R2 Overview থেকে Account ID সঠিক কিনা নিশ্চিত করুন।
                        </li>
                        <li>
                          <strong>S3 API Token:</strong> R2 &gt; Manage R2 API Tokens এ যান এবং <code>Object Read &amp; Write</code> পারমিশন সহ একটি নতুন Token তৈরি করে Access Key &amp; Secret Key বসান।
                        </li>
                        <li>
                          <strong>Bucket Name:</strong> Bucket টি Cloudflare R2 তে বিদ্যমান আছে কিনা তা পরীক্ষা করুন।
                        </li>
                      </ul>
                      {r2TestResult.errorDetails && (
                        <div className="mt-2 text-[10px] font-mono text-[#EF4444] bg-[#181114] p-1.5 rounded border border-[#5C1D24] overflow-x-auto">
                          Error: {r2TestResult.errorDetails}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Backup Trigger Notice */}
              {backupMessage && (
                <div className="p-2.5 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[11.5px] text-[#38BDF8] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>{backupMessage}</span>
                </div>
              )}
            </div>

            {/* Neon PostgreSQL Connection & Schema Infrastructure Card */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[12.5px] text-[#E6EDF3] font-light">
                    Neon PostgreSQL Database Infrastructure
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] text-[#22C55E] px-2 py-0.5 rounded bg-[#0C2117] border border-[#124D31] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                    <span>Active Connection</span>
                  </span>

                  <button
                    type="button"
                    disabled={isTestingDb}
                    onClick={handleTestDbConnection}
                    className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#E6EDF3] border border-[#30363D] flex items-center gap-1 text-[11px]"
                  >
                    {isTestingDb ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Activity className="w-3 h-3 text-[#22C55E]" />
                    )}
                    <span>{isTestingDb ? 'Testing DB...' : 'Test DB Connection'}</span>
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[11px] font-mono space-y-1 text-[#8B949E]">
                <div className="flex items-center justify-between">
                  <span>HOST: ep-dawn-firefly-b3rxe5jo-pooler.c-4.ap-southeast-1.aws.neon.tech</span>
                  <span className="text-[#38BDF8]">Port: 5432</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DATABASE: neondb</span>
                  <span>USER: neondb_owner</span>
                </div>
                <div>SSLMODE: require | CHANNEL BINDING: require | POOL: active</div>
              </div>

              {/* DB Test Result Banner */}
              {dbTestResult && (
                <div
                  className={`p-2.5 rounded-[6px] border text-[11.5px] space-y-2 ${
                    dbTestResult.success
                      ? 'bg-[#0C2117] border-[#124D31] text-[#22C55E]'
                      : 'bg-[#280D12] border-[#5C1D24] text-[#EF4444]'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-1.5">
                      {dbTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span>{dbTestResult.message}</span>
                    </div>
                    {dbTestResult.latencyMs !== undefined && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12171F] text-[#38BDF8] border border-[#21262D]">
                        {dbTestResult.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {dbTestResult.tables && dbTestResult.tables.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] text-[#8B949E] uppercase tracking-wider mb-1">
                        Active Database Tables ({dbTestResult.tables.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {dbTestResult.tables.map((tbl, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#12171F] text-[#8B949E] border border-[#21262D]"
                          >
                            {tbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================================
                SYSTEM BACKUP & DISASTER RECOVERY SECTION (AT BOTTOM)
            ======================================================== */}
            <div className="space-y-4 pt-2">
              {/* Hidden File Inputs for Restore */}
              <input
                ref={fileBackupInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleBackupFileUpload(e, 'files')}
              />
              <input
                ref={dbBackupInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleBackupFileUpload(e, 'database')}
              />

              {/* Main Backup & Disaster Recovery Container */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 space-y-4">
                {/* Header with Title & Badges */}
                <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
                  <div className="flex items-center gap-2">
                    <HardDriveDownload className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="text-[13px] text-[#E6EDF3] font-light">
                      System Backup &amp; Disaster Recovery
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1E2E] text-[#38BDF8] border border-[#1E3A8A]/50">
                      {backups.length} Saved Snapshots
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0C2117] text-[#22C55E] border border-[#124D31] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                      <span>Dual Snapshot Engine Ready</span>
                    </span>
                  </div>
                </div>

                {/* Backup Creation Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Action 1: Create File Backup */}
                  <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-3.5 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[6px] bg-[#1C1F26] border border-[#30363D] flex items-center justify-center text-[#F59E0B]">
                          <FolderArchive className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[12.5px] text-[#E6EDF3] font-medium">Cloudflare R2 Files Backup</div>
                          <div className="text-[10.5px] text-[#8B949E] font-mono mt-0.5">
                            {dataFiles.length} Data Files • {automation.length} Software Binaries • {tutorials.length} Tutorials
                          </div>
                        </div>
                      </div>

                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#161B22] text-[#F59E0B] border border-[#21262D]">
                        R2 Catalog
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10.5px] text-[#8B949E]">
                        Generates downloadable JSON storage manifest.
                      </span>

                      <button
                        type="button"
                        disabled={isCreatingBackup !== null}
                        onClick={handleCreateFileBackup}
                        className="vib-btn-sm bg-[#161B22] hover:bg-[#1E2530] text-[#F59E0B] border border-[#F59E0B]/40 hover:border-[#F59E0B] flex items-center gap-1.5 text-[11px] disabled:opacity-50"
                      >
                        {isCreatingBackup === 'files' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileArchive className="w-3.5 h-3.5" />
                        )}
                        <span>{isCreatingBackup === 'files' ? 'Creating...' : 'Create File Backup'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Action 2: Create Database Backup */}
                  <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-3.5 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[6px] bg-[#1C1F26] border border-[#30363D] flex items-center justify-center text-[#22C55E]">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[12.5px] text-[#E6EDF3] font-medium">Neon PostgreSQL Database Backup</div>
                          <div className="text-[10.5px] text-[#8B949E] font-mono mt-0.5">
                            13 PostgreSQL Tables • {users.length} Workers • {jobs.length} Jobs • {submissions.length} Submissions
                          </div>
                        </div>
                      </div>

                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#161B22] text-[#22C55E] border border-[#21262D]">
                        Full SQL Dump
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10.5px] text-[#8B949E]">
                        Exports all tables, credentials &amp; platform settings.
                      </span>

                      <button
                        type="button"
                        disabled={isCreatingBackup !== null}
                        onClick={handleCreateDatabaseBackup}
                        className="vib-btn-sm bg-[#0C2117] hover:bg-[#123824] text-[#22C55E] border border-[#22C55E]/40 hover:border-[#22C55E] flex items-center gap-1.5 text-[11px] disabled:opacity-50"
                      >
                        {isCreatingBackup === 'database' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isCreatingBackup === 'database' ? 'Exporting...' : 'Create Database Backup'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated Backup Creation Progress Bar */}
                {isCreatingBackup && (
                  <div className="bg-[#12171F] border border-[#38BDF8]/40 rounded-[6px] p-3 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-[#38BDF8]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="font-medium">
                          {isCreatingBackup === 'database'
                            ? 'Creating Database Backup Snapshot...'
                            : 'Packing Cloudflare R2 Asset Archive...'}
                        </span>
                      </div>
                      <span className="font-mono text-[#E6EDF3]">{backupProgress}%</span>
                    </div>

                    <div className="w-full bg-[#1C2128] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#38BDF8] h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${backupProgress}%` }}
                      ></div>
                    </div>

                    <div className="text-[10.5px] text-[#8B949E] font-mono truncate">
                      Stage: {backupProgressStage}
                    </div>
                  </div>
                )}

                {/* Backup Creation Success Message Banner */}
                {backupSuccessMessage && (
                  <div className="p-2.5 rounded-[6px] bg-[#0C2117] border border-[#124D31] text-[11.5px] text-[#22C55E] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                      <span>{backupSuccessMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBackupSuccessMessage(null)}
                      className="text-[#8B949E] hover:text-[#E6EDF3] text-[11px]"
                    >
                      &times;
                    </button>
                  </div>
                )}

                {/* Created Backup Snapshots Table */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#E6EDF3] font-light">Backup History &amp; Downloads</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#12171F] text-[#8B949E] border border-[#21262D]">
                        {backups.length} Records
                      </span>
                    </div>

                    {backups.length > 0 && (
                      <button
                        type="button"
                        onClick={fetchAdminData}
                        className="text-[10.5px] text-[#38BDF8] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh List</span>
                      </button>
                    )}
                  </div>

                  {backups.length === 0 ? (
                    <div className="p-4 rounded-[6px] bg-[#12171F] border border-[#21262D] text-center space-y-2">
                      <div className="text-[#8B949E] text-[11.5px]">
                        No backup archives generated yet. Click &quot;Create Database Backup&quot; or &quot;Create File Backup&quot; above to capture a snapshot.
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-[#21262D] rounded-[6px]">
                      <table className="w-full text-left text-[11.5px] text-[#C9D1D9]">
                        <thead className="bg-[#12171F] text-[#8B949E] text-[10.5px] uppercase tracking-wider border-b border-[#21262D]">
                          <tr>
                            <th className="py-2 px-3 font-medium">Backup File</th>
                            <th className="py-2 px-3 font-medium">Type</th>
                            <th className="py-2 px-3 font-medium">Contents</th>
                            <th className="py-2 px-3 font-medium">Size</th>
                            <th className="py-2 px-3 font-medium">Created Date</th>
                            <th className="py-2 px-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262D] bg-[#161B22]">
                          {backups.map((b) => (
                            <tr key={b.id} className="hover:bg-[#1C2128]/60 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  {b.type === 'database' ? (
                                    <Database className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                                  ) : (
                                    <FolderArchive className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                                  )}
                                  <div>
                                    <div className="font-mono text-[#E6EDF3] text-[11px] leading-tight">
                                      {b.filename}
                                    </div>
                                    <div className="text-[10px] text-[#8B949E]">{b.name}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-3">
                                <span
                                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded border ${
                                    b.type === 'database'
                                      ? 'bg-[#0C2117] text-[#22C55E] border-[#124D31]'
                                      : 'bg-[#1F190B] text-[#F59E0B] border-[#4A3B18]'
                                  }`}
                                >
                                  {b.type === 'database' ? 'DATABASE (SQL)' : 'R2 ASSETS'}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 text-[11px] font-mono text-[#8B949E]">
                                {b.type === 'database'
                                  ? `${b.recordCount} records • ${b.tablesCount || 13} tables`
                                  : `${b.recordCount} asset records`}
                              </td>

                              <td className="py-2.5 px-3 font-mono text-[#38BDF8] text-[11px]">
                                {b.size}
                              </td>

                              <td className="py-2.5 px-3 text-[#8B949E] font-mono text-[10.5px]">
                                {b.createdAt}
                              </td>

                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadBackup(b)}
                                    title="Download Backup JSON"
                                    className="p-1 rounded bg-[#12171F] hover:bg-[#1E2530] text-[#38BDF8] border border-[#21262D] hover:border-[#38BDF8]"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBackup(b.id)}
                                    title="Delete Backup Record"
                                    className="p-1 rounded bg-[#12171F] hover:bg-[#280D12] text-[#8B949E] hover:text-[#EF4444] border border-[#21262D] hover:border-[#5C1D24]"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ========================================================
                    RESTORE & DISASTER RECOVERY RESTORATION ENGINE
                ======================================================== */}
                <div className="pt-3 border-t border-[#21262D] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-[12.5px] text-[#E6EDF3] font-light">
                        Restore Backup File &amp; Disaster Recovery
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8B949E] font-mono">
                      Safe Schema Synchronization
                    </span>
                  </div>

                  {/* Two Upload Triggers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => fileBackupInputRef.current?.click()}
                      className="p-3 rounded-[6px] bg-[#12171F] hover:bg-[#181F2B] border border-[#21262D] hover:border-[#F59E0B] text-left flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#F59E0B] group-hover:border-[#F59E0B]">
                          <ArrowUpFromLine className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[12px] text-[#E6EDF3] font-medium">Upload R2 Backup</div>
                          <div className="text-[10px] text-[#8B949E]">Select R2 files catalog JSON</div>
                        </div>
                      </div>
                      <span className="text-[10.5px] text-[#F59E0B] font-mono px-2 py-0.5 rounded bg-[#161B22] border border-[#21262D]">
                        Browse .json
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => dbBackupInputRef.current?.click()}
                      className="p-3 rounded-[6px] bg-[#12171F] hover:bg-[#181F2B] border border-[#21262D] hover:border-[#22C55E] text-left flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#22C55E] group-hover:border-[#22C55E]">
                          <Database className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[12px] text-[#E6EDF3] font-medium">Upload Database Backup</div>
                          <div className="text-[10px] text-[#8B949E]">Select PostgreSQL database snapshot JSON</div>
                        </div>
                      </div>
                      <span className="text-[10.5px] text-[#22C55E] font-mono px-2 py-0.5 rounded bg-[#161B22] border border-[#21262D]">
                        Browse .json
                      </span>
                    </button>
                  </div>

                  {/* Selected Uploaded File Preview & Run Restore Action */}
                  {uploadedBackupFile && (
                    <div className="p-3.5 rounded-[6px] bg-[#12171F] border border-[#38BDF8]/50 space-y-3 animate-fadeIn">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#38BDF8]" />
                          <div>
                            <div className="text-[12px] text-[#E6EDF3] font-medium flex items-center gap-2">
                              <span>Selected Backup: {uploadedBackupFile.name}</span>
                              <span
                                className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border ${
                                  uploadedBackupFile.type === 'database'
                                    ? 'bg-[#0C2117] text-[#22C55E] border-[#124D31]'
                                    : 'bg-[#1F190B] text-[#F59E0B] border-[#4A3B18]'
                                }`}
                              >
                                {uploadedBackupFile.type === 'database' ? 'DATABASE SNAPSHOT' : 'R2 ASSET BACKUP'}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-[#8B949E] font-mono mt-0.5">
                              Size: {uploadedBackupFile.sizeStr}
                              {uploadedBackupFile.recordsCount ? ` • ${uploadedBackupFile.recordsCount} records detected` : ''}
                              {uploadedBackupFile.exportedAt ? ` • Exported: ${uploadedBackupFile.exportedAt.substring(0, 16)}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUploadedBackupFile(null)}
                            disabled={isRestoring}
                            className="text-[11px] text-[#8B949E] hover:text-[#EF4444] px-2 py-1 rounded bg-[#161B22] border border-[#21262D]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isRestoring}
                            onClick={handleRunRestore}
                            className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] flex items-center gap-1.5 text-[11.5px] disabled:opacity-50"
                          >
                            {isRestoring ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            <span>{isRestoring ? 'Restoring...' : 'Run Restore Engine'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restore In-Progress Animated Progress Bar */}
                  {isRestoring && (
                    <div className="bg-[#12171F] border border-[#2563EB]/50 rounded-[6px] p-3 space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-[#38BDF8]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="font-medium">Executing Disaster Recovery Restore...</span>
                        </div>
                        <span className="font-mono text-[#E6EDF3]">{restoreProgress}%</span>
                      </div>

                      <div className="w-full bg-[#1C2128] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${restoreProgress}%` }}
                        ></div>
                      </div>

                      <div className="text-[10.5px] text-[#8B949E] font-mono truncate">
                        Stage: {restoreProgressStage}
                      </div>
                    </div>
                  )}

                  {/* Restore Error Banner */}
                  {restoreError && (
                    <div className="p-2.5 rounded-[6px] bg-[#280D12] border border-[#5C1D24] text-[11.5px] text-[#EF4444] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                        <span>{restoreError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRestoreError(null)}
                        className="text-[#8B949E] hover:text-[#EF4444] text-[11px]"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {/* Restore Success Statistics Card */}
                  {restoreSuccessStats && (
                    <div className="p-3.5 rounded-[6px] bg-[#0C2117] border border-[#124D31] text-[11.5px] text-[#22C55E] space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between font-medium">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                          <span>{restoreSuccessStats.message}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRestoreSuccessStats(null)}
                          className="text-[#8B949E] hover:text-[#22C55E] text-[11px]"
                        >
                          &times;
                        </button>
                      </div>

                      {Object.keys(restoreSuccessStats.stats).length > 0 && (
                        <div className="pt-1 border-t border-[#124D31]/60">
                          <div className="text-[10px] text-[#8B949E] uppercase tracking-wider mb-1">
                            Restored Entity Breakdown:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(restoreSuccessStats.stats).map(([k, v], idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#12171F] text-[#E6EDF3] border border-[#21262D]"
                              >
                                {k}: <strong className="text-[#22C55E] font-medium">{v}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 0: CREATE / EDIT ADMIN USER (dd_admin_users) */}
      {isAdminUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[420px] bg-[#161B22] border border-[#5C1D24] rounded-[8px] p-4 text-[#C9D1D9] relative shadow-2xl">
            <button
              onClick={() => setIsAdminUserModalOpen(false)}
              className="absolute top-3 right-3 text-[#8B949E] hover:text-[#E6EDF3]"
            >
              &times;
            </button>

            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[14px] text-[#E6EDF3] font-light">
                {editingAdminUser ? 'Edit Administrative Account' : 'Create Administrative Account'}
              </h3>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#280D12] text-[#EF4444] border border-[#5C1D24]">
                dd_admin_users
              </span>
            </div>

            <form onSubmit={handleSaveAdminUser} className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={adminUserFormData.username}
                  onChange={(e) => setAdminUserFormData({ ...adminUserFormData, username: e.target.value })}
                  placeholder="e.g. leader_alex"
                  className="vib-input"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={adminUserFormData.email}
                  onChange={(e) => setAdminUserFormData({ ...adminUserFormData, email: e.target.value })}
                  placeholder="alex@darkdevil.team"
                  className="vib-input"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Password {editingAdminUser && '(Leave blank to retain current password)'}
                </label>
                <input
                  type="password"
                  required={!editingAdminUser}
                  value={adminUserFormData.password}
                  onChange={(e) => setAdminUserFormData({ ...adminUserFormData, password: e.target.value })}
                  placeholder="••••••••"
                  className="vib-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Administrative Role</label>
                  <select
                    value={adminUserFormData.role}
                    onChange={(e) =>
                      setAdminUserFormData({ ...adminUserFormData, role: e.target.value as AdminRole })
                    }
                    className="vib-input font-light"
                  >
                    <option value="Administrator">Administrator (Root)</option>
                    <option value="Leader">Leader (Operations)</option>
                    <option value="Sub Leader">Sub Leader (Verification)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Status</label>
                  <select
                    value={adminUserFormData.status}
                    onChange={(e) =>
                      setAdminUserFormData({
                        ...adminUserFormData,
                        status: e.target.value as 'active' | 'suspended',
                      })
                    }
                    className="vib-input"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Department / Security Notes</label>
                <input
                  type="text"
                  value={adminUserFormData.notes}
                  onChange={(e) => setAdminUserFormData({ ...adminUserFormData, notes: e.target.value })}
                  placeholder="e.g. Lead Operations Supervisor"
                  className="vib-input"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminUserModalOpen(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] border border-[#30363D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="vib-btn-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white border border-[#DC2626]"
                >
                  Save Administrative Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT WORKER (dd_users) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[400px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 text-[#C9D1D9] relative">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-3 right-3 text-[#8B949E] hover:text-[#E6EDF3]"
            >
              &times;
            </button>

            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[14px] text-[#E6EDF3] font-light">
                {editingUser ? 'Edit Worker Account' : 'Create Worker Account'}
              </h3>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#12171F] text-[#38BDF8] border border-[#38BDF8]/40">
                dd_users
              </span>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] text-[#8B949E]">
                    Worker Username <span className="text-[#F87171]">*</span>
                  </label>
                  {usernameCheck.status !== 'idle' && (
                    <div className="flex items-center gap-1 text-[10.5px]">
                      {usernameCheck.status === 'checking' && (
                        <span className="text-[#8B949E] flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-[#38BDF8]" />
                          <span>Checking...</span>
                        </span>
                      )}
                      {usernameCheck.status === 'available' && (
                        <span className="text-[#22C55E] flex items-center gap-1 font-light">
                          <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                          <span>Available</span>
                        </span>
                      )}
                      {usernameCheck.status === 'unavailable' && (
                        <span className="text-[#F87171] flex items-center gap-1 font-light">
                          <XCircle className="w-3 h-3 text-[#EF4444]" />
                          <span>Not Available</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      username: e.target.value.replace(/\s+/g, ''),
                    })
                  }
                  placeholder="e.g. worker_john"
                  className={`vib-input font-mono ${
                    usernameCheck.status === 'available'
                      ? 'border-[#22C55E]/60 focus:border-[#22C55E]'
                      : usernameCheck.status === 'unavailable'
                      ? 'border-[#EF4444]/60 focus:border-[#EF4444]'
                      : ''
                  }`}
                />
                {usernameCheck.message && (
                  <p
                    className={`text-[10px] mt-1 flex items-center gap-1 ${
                      usernameCheck.status === 'available'
                        ? 'text-[#22C55E]'
                        : usernameCheck.status === 'unavailable'
                        ? 'text-[#F87171]'
                        : 'text-[#8B949E]'
                    }`}
                  >
                    {usernameCheck.status === 'unavailable' && (
                      <AlertCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{usernameCheck.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="worker@darkdevil.team"
                  className="vib-input"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Password {editingUser && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="••••••••"
                  className="vib-input"
                />
              </div>

              <div className="p-2.5 rounded-[6px] bg-[#12171F] border border-[#21262D] flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#22C55E] shrink-0 mt-0.5">
                  <InfinityIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-snug">
                  <span className="text-[#E6EDF3] font-light block">Daily Quota: Unlimited</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Worker Notes</label>
                <input
                  type="text"
                  value={userFormData.notes}
                  onChange={(e) => setUserFormData({ ...userFormData, notes: e.target.value })}
                  placeholder="Division or special instructions..."
                  className="vib-input"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] border border-[#30363D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={usernameCheck.status === 'unavailable' || usernameCheck.status === 'checking'}
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Worker Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DATA FILE */}
      {isUploadDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-[540px] bg-[#161B22] border border-[#30363D] rounded-[10px] shadow-2xl p-5 text-[#C9D1D9] relative max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#30363D]">
              <div>
                <h3 className="text-[14.5px] text-[#E6EDF3] font-normal mt-0.5">
                  Upload Sending Data File
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadDataModalOpen(false)}
                className="w-7 h-7 rounded-md bg-[#1C2128] hover:bg-[#282E37] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDataFile} className="space-y-4 pt-3 overflow-y-auto pr-1">
              {/* Mode Switcher: Raw File Upload vs Manual Paste */}
              <div className="flex rounded-[6px] bg-[#12171F] p-1 border border-[#30363D]">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-1.5 px-3 rounded-[4px] text-[11.5px] font-light transition-colors flex items-center justify-center gap-1.5 ${
                    uploadMode === 'file'
                      ? 'bg-[#21262D] text-[#38BDF8] shadow-sm'
                      : 'text-[#8B949E] hover:text-[#C9D1D9]'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Raw File Upload (CSV, TXT, Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('paste')}
                  className={`flex-1 py-1.5 px-3 rounded-[4px] text-[11.5px] font-light transition-colors flex items-center justify-center gap-1.5 ${
                    uploadMode === 'paste'
                      ? 'bg-[#21262D] text-[#38BDF8] shadow-sm'
                      : 'text-[#8B949E] hover:text-[#C9D1D9]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Manual Paste</span>
                </button>
              </div>

              {/* MODE 1: RAW FILE UPLOAD */}
              {uploadMode === 'file' && (
                <div className="space-y-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRawFileUpload}
                    accept=".csv,.txt,.xlsx,.xls,.tsv,text/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden"
                  />

                  {/* Dropzone Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingFile(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingFile(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        processIncomingFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`cursor-pointer border-2 border-dashed rounded-[8px] p-5 text-center transition-all ${
                      isDraggingFile
                        ? 'border-[#38BDF8] bg-[#38BDF8]/10'
                        : 'border-[#30363D] hover:border-[#4B5563] bg-[#0D1117] hover:bg-[#12171F]'
                    }`}
                  >
                    {isParsingFile ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#38BDF8]" />
                        <span className="text-[12px] text-[#E6EDF3] font-light">
                          Parsing file &amp; auto-detecting emails...
                        </span>
                        <span className="text-[10.5px] text-[#8B949E]">
                          Removing duplicates and extracting clean records
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#38BDF8]">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[12.5px] font-light text-[#E6EDF3] block">
                            Click to select or drag &amp; drop file here
                          </span>
                          <span className="text-[10.5px] text-[#8B949E] block">
                            CSV, TXT, Excel (.xlsx, .xls) — Any raw format, no headers required
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#38BDF8] bg-[#0D2136] px-2.5 py-1 rounded border border-[#153456]">
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-detects emails anywhere in the file and removes duplicates</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extraction Stats Card */}
                  {uploadFileStats && (
                    <div className="p-3 rounded-[6px] bg-[#0C2117] border border-[#124D31] text-[11.5px] flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#22C55E] font-light">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Extracted {uploadFileStats.uniqueCount} Unique{' '}
                            {uploadFormData.dataType === 'email' ? 'Emails' : 'Phone Numbers'}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-[#8B949E] font-mono">
                          Source:{' '}
                          <span className="text-[#C9D1D9]">
                            {uploadFileStats.originalFileName}
                          </span>{' '}
                          {uploadFileStats.fileSizeStr && `(${uploadFileStats.fileSizeStr})`} • Detected:{' '}
                          {uploadFileStats.totalDetected} • Duplicates Filtered:{' '}
                          {uploadFileStats.duplicatesRemoved}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10.5px] text-[#38BDF8] hover:underline shrink-0"
                      >
                        Change File
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: MANUAL PASTE */}
              {uploadMode === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-[#8B949E]">
                      Paste Raw Data Lines (Emails or Phone numbers)
                    </label>
                    <button
                      type="button"
                      onClick={() => processRawDataText(uploadFormData.rawLines)}
                      disabled={!uploadFormData.rawLines.trim()}
                      className="text-[10.5px] text-[#38BDF8] hover:text-[#7DD3FC] inline-flex items-center gap-1 disabled:opacity-40"
                      title="Run email detection and deduplication on pasted content"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Detect &amp; Deduplicate</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={uploadFormData.rawLines}
                    onChange={(e) => {
                      setUploadFormData({ ...uploadFormData, rawLines: e.target.value });
                    }}
                    placeholder={
                      uploadFormData.dataType === 'email'
                        ? 'ceo@target.com\nmarketing@target.com\noperations@target.com\n...or paste table content'
                        : '+18005550199\n+18005550200\n+18005550201'
                    }
                    className="vib-input font-mono text-[11px] min-h-[100px] py-1.5"
                  />
                  <div className="text-[10px] text-[#8B949E] flex items-center justify-between">
                    <span>You can paste emails in any format, comma-separated or row-separated.</span>
                    <button
                      type="button"
                      onClick={() => setUploadFormData({ ...uploadFormData, rawLines: '' })}
                      className="text-[#F87171] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* FORM FIELD: File Name (Auto-filled from upload, editable/renamable) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8B949E]">
                    File Name
                  </label>
                  <span className="text-[10px] text-[#8B949E]">
                    {uploadMode === 'file'
                      ? '(Auto-filled from uploaded file - you can edit or rename)'
                      : '(Enter custom file name manually)'}</span>
                </div>
                <input
                  type="text"
                  required
                  value={uploadFormData.fileName}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, fileName: e.target.value })}
                  placeholder={
                    uploadMode === 'file'
                      ? 'Upload a file to auto-fill or type name...'
                      : 'e.g. US_Enterprise_Leads_Batch_1.txt'
                  }
                  className="vib-input font-mono"
                />
              </div>

              {/* FORM FIELD: Data Type */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Data Type</label>
                <select
                  value={uploadFormData.dataType}
                  onChange={(e) => {
                    const newType = e.target.value as 'email' | 'sms';
                    setUploadFormData((prev) => ({ ...prev, dataType: newType }));
                    // If text exists, re-clean for new type
                    if (uploadFormData.rawLines) {
                      const result =
                        newType === 'email'
                          ? extractAndDeduplicateEmails(uploadFormData.rawLines)
                          : extractAndDeduplicatePhones(uploadFormData.rawLines);
                      setUploadFormData((prev) => ({
                        ...prev,
                        dataType: newType,
                        rawLines: result.uniqueList.join('\n'),
                      }));
                    }
                  }}
                  className="vib-input"
                >
                  <option value="email">Email Sending Data</option>
                  <option value="sms">SMS Sending Data</option>
                </select>
              </div>

              {/* CLEANED DATA PREVIEW (if records exist) */}
              {uploadFormData.rawLines && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[#8B949E]">Cleaned Unique Records Preview:</span>
                    <span className="text-[#38BDF8] font-mono">
                      {uploadFormData.rawLines.split('\n').filter(Boolean).length} Unique Records Ready
                      </span>
                  </div>
                  <textarea
                    rows={3}
                    value={uploadFormData.rawLines}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, rawLines: e.target.value })}
                    className="vib-input font-mono text-[10.5px] min-h-[60px] max-h-[90px] py-1 bg-[#0D1117] text-[#8B949E]"
                  />
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-2 border-t border-[#30363D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadDataModalOpen(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] border border-[#30363D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFormData.fileName.trim() || !uploadFormData.rawLines.trim()}
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" />
                  <span>
                    Upload &amp; Activate File
                    {uploadFormData.rawLines && (
                      <span className="ml-1 opacity-90 font-mono">
                        ({uploadFormData.rawLines.split('\n').filter(Boolean).length})
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE/EDIT JOB */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-[480px] bg-[#161B22] border border-[#30363D] rounded-[10px] shadow-2xl p-5 text-[#C9D1D9] relative max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-[#30363D]">
              <div>
                  Campaign Configuration

                <h3 className="text-[14.5px] text-[#E6EDF3] font-normal mt-0.5">
                  {editingJobId ? 'Edit Dispatch Job' : 'Add New Dispatch Job'}
                </h3>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="w-7 h-7 rounded-md bg-[#1C2128] hover:bg-[#282E37] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 pt-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  placeholder="e.g. EU Banking Alert SMS Dispatch"
                  className="vib-input"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1.5 flex items-center justify-between">
                  <span>Campaign Thumbnail Image</span>
                  {jobFormData.thumbnailUrl && (
                    <span className="text-[9.5px] font-mono text-[#38BDF8] bg-[#0D2136] px-1.5 py-0.5 rounded border border-[#153456]">
                      R2 Hosted Asset
                    </span>
                  )}
                </label>

                {/* Upload & URL Control Bar */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={jobFormData.thumbnailUrl}
                      onChange={(e) => setJobFormData({ ...jobFormData, thumbnailUrl: e.target.value })}
                      placeholder="https://... or upload image to Cloudflare R2"
                      className="vib-input text-[11.5px] flex-1 font-mono"
                    />

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={jobThumbnailInputRef}
                      accept="image/*"
                      disabled={isUploadingJobThumbnail}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleJobThumbnailUploadToR2(file);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                    {/* Upload Trigger Button */}
                    <button
                      type="button"
                      disabled={isUploadingJobThumbnail}
                      onClick={() => jobThumbnailInputRef.current?.click()}
                      className={`vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                        isUploadingJobThumbnail ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploadingJobThumbnail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                          <span>Uploading R2...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Image Preview Box */}
                  {jobFormData.thumbnailUrl ? (
                    <div className="relative p-2 rounded-[8px] bg-[#0D1117] border border-[#30363D] flex items-center gap-3">
                      <div className="w-24 h-16 rounded-[6px] bg-[#161B22] border border-[#21262D] overflow-hidden shrink-0 relative flex items-center justify-center">
                        <img
                          src={jobFormData.thumbnailUrl}
                          alt="Job Thumbnail Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                        {isUploadingJobThumbnail && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-[11px] text-[#E6EDF3] font-light flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          <span className="truncate">Thumbnail Attached &amp; Live</span>
                        </div>
                        <p className="text-[10px] text-[#8B949E] font-mono truncate">
                          {jobFormData.thumbnailUrl}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => jobThumbnailInputRef.current?.click()}
                            className="text-[10.5px] text-[#38BDF8] hover:underline"
                          >
                            Replace Image
                          </button>
                          <span className="text-[#30363D]">&bull;</span>
                          <button
                            type="button"
                            onClick={() => setJobFormData((prev) => ({ ...prev, thumbnailUrl: '' }))}
                            className="text-[10.5px] text-[#F87171] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => jobThumbnailInputRef.current?.click()}
                      className="border border-dashed border-[#30363D] hover:border-[#4B5563] bg-[#0D1117]/60 hover:bg-[#12171F] rounded-[8px] p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2.5"
                    >
                      <ImageIcon className="w-4 h-4 text-[#8B949E]" />
                      <span className="text-[11px] text-[#8B949E]">
                        Click to upload thumbnail from device (auto-pushed to Cloudflare R2)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Type</label>
                  <select
                    value={jobFormData.type}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, type: e.target.value as any })
                    }
                    className="vib-input"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="microjob">Microjob</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Payout ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={jobFormData.payoutPerUnit}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, payoutPerUnit: Number(e.target.value) })
                    }
                    className="vib-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Target</label>
                  <input
                    type="number"
                    required
                    value={jobFormData.dailyTarget}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, dailyTarget: Number(e.target.value) })
                    }
                    className="vib-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Instructions for Workers</label>
                <textarea
                  rows={4}
                  required
                  value={jobFormData.instructions}
                  onChange={(e) => setJobFormData({ ...jobFormData, instructions: e.target.value })}
                  placeholder="Specify sending delays, headers, proof requirements..."
                  className="vib-input min-h-[80px] py-2"
                />
              </div>

              <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] border border-[#30363D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                >
                  {editingJobId ? 'Save Changes' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TUTORIAL */}
      {isTutorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[500px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-5 text-[#C9D1D9] relative my-auto shadow-2xl">
            <button
              onClick={() => setIsTutorialModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B949E] hover:text-[#E6EDF3] bg-[#21262D] rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-[16px] text-[#E6EDF3] font-light mb-4 flex items-center gap-2">
              <Video className="w-4 h-4 text-[#38BDF8]" />
              {tutFormData.id ? 'Edit Video Tutorial' : 'Add Video Tutorial'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const method = tutFormData.id ? 'PUT' : 'POST';
                const url = tutFormData.id ? `/api/tutorials/${tutFormData.id}` : '/api/tutorials';
                
                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(tutFormData),
                });
                setIsTutorialModalOpen(false);
                fetchAdminData();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4 sm:col-span-2">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Video Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., How to submit a task"
                      value={tutFormData.title}
                      onChange={(e) => setTutFormData({ ...tutFormData, title: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light flex items-center justify-between">
                      <span>Video URL</span>
                      <span className="text-[9px] text-[#38BDF8] lowercase">Supports YT, Drive, OneDrive, Archive</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={tutFormData.videoUrl}
                      onChange={(e) => setTutFormData({ ...tutFormData, videoUrl: e.target.value })}
                      className="vib-input font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Thumbnail Image</label>
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="https://... (Optional)"
                            value={tutFormData.thumbnailUrl}
                            onChange={(e) => setTutFormData({ ...tutFormData, thumbnailUrl: e.target.value })}
                            className="vib-input font-mono text-[11px] flex-1"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingThumbnail}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleThumbnailUploadToR2(file);
                              }}
                            />
                            <button
                              type="button"
                              disabled={isUploadingThumbnail}
                              className={`vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] whitespace-nowrap flex items-center gap-1.5 ${
                                isUploadingThumbnail ? 'opacity-50' : ''
                              }`}
                            >
                              {isUploadingThumbnail ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Upload</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="w-[100px] h-[56px] shrink-0 bg-[#0B0F17] border border-[#30363D] rounded-[4px] overflow-hidden flex items-center justify-center relative">
                        {tutFormData.thumbnailUrl ? (
                          <>
                            <img src={tutFormData.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            {isUploadingThumbnail && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                              </div>
                            )}
                          </>
                        ) : (
                          isUploadingThumbnail ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                          ) : (
                            <Video className="w-4 h-4 text-[#30363D]" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Category</label>
                  <input
                    type="text"
                    value={tutFormData.category}
                    onChange={(e) => setTutFormData({ ...tutFormData, category: e.target.value })}
                    className="vib-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 10:00"
                    value={tutFormData.duration}
                    onChange={(e) => setTutFormData({ ...tutFormData, duration: e.target.value })}
                    className="vib-input font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#30363D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B949E]">Status:</span>
                  <select
                    value={tutFormData.status}
                    onChange={(e) => setTutFormData({ ...tutFormData, status: e.target.value as any })}
                    className="vib-input py-1 text-[11px] w-[100px]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTutorialModalOpen(false)}
                    className="vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {tutFormData.id ? 'Save Changes' : 'Publish Video'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TOOL */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[500px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-5 text-[#C9D1D9] relative my-auto shadow-2xl">
            <button
              onClick={() => setIsToolModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B949E] hover:text-[#E6EDF3] bg-[#21262D] rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-[16px] text-[#E6EDF3] font-light mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#38BDF8]" />
              {toolFormData.id ? 'Edit Worker Tool' : 'Add Worker Tool'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const method = toolFormData.id ? 'PUT' : 'POST';
                const url = toolFormData.id ? `/api/tools/${toolFormData.id}` : '/api/tools';
                
                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(toolFormData),
                });
                setIsToolModalOpen(false);
                fetchAdminData();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4 sm:col-span-2">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Tool Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mailer Pro"
                      value={toolFormData.name}
                      onChange={(e) => setToolFormData({ ...toolFormData, name: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Target URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={toolFormData.url}
                      onChange={(e) => setToolFormData({ ...toolFormData, url: e.target.value })}
                      className="vib-input font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Tool Icon</label>
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="https://... (Optional)"
                            value={toolFormData.iconUrl}
                            onChange={(e) => setToolFormData({ ...toolFormData, iconUrl: e.target.value })}
                            className="vib-input font-mono text-[11px] flex-1"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingToolIcon}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleToolIconUploadToR2(file);
                              }}
                            />
                            <button
                              type="button"
                              disabled={isUploadingToolIcon}
                              className={`vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] whitespace-nowrap flex items-center gap-1.5 ${
                                isUploadingToolIcon ? 'opacity-50' : ''
                              }`}
                            >
                              {isUploadingToolIcon ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Upload</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 shrink-0 bg-[#0B0F17] border border-[#30363D] rounded-[4px] overflow-hidden flex items-center justify-center relative">
                        {toolFormData.iconUrl ? (
                          <>
                            <img src={toolFormData.iconUrl} alt="Icon preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            {isUploadingToolIcon && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                              </div>
                            )}
                          </>
                        ) : (
                          isUploadingToolIcon ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                          ) : (
                            <Wrench className="w-4 h-4 text-[#30363D]" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Description</label>
                    <textarea
                      placeholder="Briefly describe what this tool does..."
                      value={toolFormData.description}
                      onChange={(e) => setToolFormData({ ...toolFormData, description: e.target.value })}
                      className="vib-input min-h-[60px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Category</label>
                  <input
                    type="text"
                    value={toolFormData.category}
                    onChange={(e) => setToolFormData({ ...toolFormData, category: e.target.value })}
                    className="vib-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Type</label>
                  <select
                    value={toolFormData.isInternal ? 'internal' : 'external'}
                    onChange={(e) => setToolFormData({ ...toolFormData, isInternal: e.target.value === 'internal' })}
                    className="vib-input py-1.5"
                  >
                    <option value="external">External Link</option>
                    <option value="internal">Internal Utility</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#30363D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B949E]">Status:</span>
                  <select
                    value={toolFormData.status}
                    onChange={(e) => setToolFormData({ ...toolFormData, status: e.target.value as any })}
                    className="vib-input py-1 text-[11px] w-[100px]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsToolModalOpen(false)}
                    className="vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {toolFormData.id ? 'Save Changes' : 'Publish Tool'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD AUTOMATION */}
      {isAutoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[500px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-5 text-[#C9D1D9] relative my-auto shadow-2xl">
            <button
              onClick={() => setIsAutoModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B949E] hover:text-[#E6EDF3] bg-[#21262D] rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-[16px] text-[#E6EDF3] font-light mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#38BDF8]" />
              {autoFormData.id ? 'Edit Automation Script' : 'Add Automation Script'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const method = autoFormData.id ? 'PUT' : 'POST';
                const url = autoFormData.id ? `/api/automation/${autoFormData.id}` : '/api/automation';
                
                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(autoFormData),
                });
                setIsAutoModalOpen(false);
                fetchAdminData();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4 sm:col-span-2">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Package Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Auto Responder v2"
                      value={autoFormData.title}
                      onChange={(e) => setAutoFormData({ ...autoFormData, title: e.target.value })}
                      className="vib-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Download URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={autoFormData.downloadUrl}
                      onChange={(e) => setAutoFormData({ ...autoFormData, downloadUrl: e.target.value })}
                      className="vib-input font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Package Icon</label>
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="https://... (Optional)"
                            value={autoFormData.iconUrl}
                            onChange={(e) => setAutoFormData({ ...autoFormData, iconUrl: e.target.value })}
                            className="vib-input font-mono text-[11px] flex-1"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingAutoIcon}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAutoIconUploadToR2(file);
                              }}
                            />
                            <button
                              type="button"
                              disabled={isUploadingAutoIcon}
                              className={`vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] whitespace-nowrap flex items-center gap-1.5 ${
                                isUploadingAutoIcon ? 'opacity-50' : ''
                              }`}
                            >
                              {isUploadingAutoIcon ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Upload</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 shrink-0 bg-[#0B0F17] border border-[#30363D] rounded-[4px] overflow-hidden flex items-center justify-center relative">
                        {autoFormData.iconUrl ? (
                          <>
                            <img src={autoFormData.iconUrl} alt="Icon preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            {isUploadingAutoIcon && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                              </div>
                            )}
                          </>
                        ) : (
                          isUploadingAutoIcon ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                          ) : (
                            <Bot className="w-4 h-4 text-[#30363D]" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., tool-v2.zip"
                    value={autoFormData.fileName}
                    onChange={(e) => setAutoFormData({ ...autoFormData, fileName: e.target.value })}
                    className="vib-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Version</label>
                  <input
                    type="text"
                    placeholder="e.g., v1.0.0"
                    value={autoFormData.version}
                    onChange={(e) => setAutoFormData({ ...autoFormData, version: e.target.value })}
                    className="vib-input font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">File Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 5.2 MB"
                    value={autoFormData.fileSize}
                    onChange={(e) => setAutoFormData({ ...autoFormData, fileSize: e.target.value })}
                    className="vib-input font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Run setup.exe as admin"
                    value={autoFormData.instructions}
                    onChange={(e) => setAutoFormData({ ...autoFormData, instructions: e.target.value })}
                    className="vib-input"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#30363D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B949E]">Status:</span>
                  <select
                    value={autoFormData.status}
                    onChange={(e) => setAutoFormData({ ...autoFormData, status: e.target.value as any })}
                    className="vib-input py-1 text-[11px] w-[100px]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoModalOpen(false)}
                    className="vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {autoFormData.id ? 'Save Changes' : 'Publish Script'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[540px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-5 text-[#C9D1D9] relative my-auto shadow-2xl">
            <button
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B949E] hover:text-[#E6EDF3] bg-[#21262D] rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-[16px] text-[#E6EDF3] font-light mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              {serviceFormData.id ? 'Edit Team Service' : 'Add Team Service'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const method = serviceFormData.id ? 'PUT' : 'POST';
                const url = serviceFormData.id ? `/api/services/${serviceFormData.id}` : '/api/services';

                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(serviceFormData),
                });
                setIsServiceModalOpen(false);
                fetchAdminData();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Service Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ultra-High Inbox Email Dispatch"
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    className="vib-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Email Operations"
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="vib-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Price / Rate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., $0.05 - $0.15 / send"
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    className="vib-input font-mono text-[11px]"
                  />
                </div>

                {/* Service Icon Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">Service Icon</label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="text"
                          placeholder="https://... or upload image"
                          value={serviceFormData.iconUrl}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, iconUrl: e.target.value })}
                          className="vib-input font-mono text-[11px] flex-1"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingServiceIcon}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleServiceIconUploadToR2(file);
                            }}
                          />
                          <button
                            type="button"
                            disabled={isUploadingServiceIcon}
                            className={`vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] whitespace-nowrap flex items-center gap-1.5 ${
                              isUploadingServiceIcon ? 'opacity-50' : ''
                            }`}
                          >
                            {isUploadingServiceIcon ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>Upload R2</span>
                          </button>
                        </div>
                      </div>
                      <span className="text-[9.5px] text-[#6E7681]">
                        Upload an icon image or paste any image/vector URL.
                      </span>
                    </div>

                    <div className="w-12 h-12 shrink-0 bg-[#0B0F17] border border-[#30363D] rounded-[6px] overflow-hidden flex items-center justify-center relative">
                      {serviceFormData.iconUrl ? (
                        <>
                          <img
                            src={serviceFormData.iconUrl}
                            alt="Service preview"
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                          {isUploadingServiceIcon && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                            </div>
                          )}
                        </>
                      ) : isUploadingServiceIcon ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                      ) : (
                        <Layers className="w-5 h-5 text-[#30363D]" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">
                    Short Description (For Cards)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview for cards..."
                    value={serviceFormData.shortDescription}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, shortDescription: e.target.value })}
                    className="vib-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 uppercase font-light">
                    Full Description (For Details Popup)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed operational workflow, security specs, SLAs, deliverables..."
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    className="vib-input min-h-[90px]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#30363D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B949E]">Status:</span>
                  <select
                    value={serviceFormData.status}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, status: e.target.value as any })}
                    className="vib-input py-1 text-[11px] w-[100px]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {serviceFormData.id ? 'Save Changes' : 'Publish Service'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW APPLICATION DETAILS */}
      {isAppDetailModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-[560px] bg-[#161B22] border border-[#30363D] rounded-[10px] shadow-2xl text-[#C9D1D9] relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#30363D] bg-[#12171F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#38BDF8]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-normal text-[#E6EDF3]">
                    Recruitment Application Details
                  </h3>
                  <div className="text-[10.5px] text-[#8B949E] font-mono">
                    ID: {selectedApplication.id} • Applied: {selectedApplication.createdAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAppDetailModalOpen(false)}
                className="w-7 h-7 rounded-md bg-[#1C2128] hover:bg-[#282E37] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Candidate Highlight Card */}
              <div className="p-3.5 rounded-[8px] bg-[#0D1117] border border-[#30363D] flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#38BDF8] font-light text-[15px] shrink-0 uppercase">
                    {selectedApplication.fullName.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-light text-[#E6EDF3]">
                      {selectedApplication.fullName}
                    </h4>
                    <span className="text-[11.5px] text-[#8B949E] font-mono block">
                      {selectedApplication.email}
                      </span>
                  </div>
                </div>
                <div>
                  {selectedApplication.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#3B2D12] text-[#FBBF24] border border-[#785412] font-light">
                      <Clock className="w-3 h-3" />
                      Pending Review
                                  </span>
                  )}
                  {selectedApplication.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#0C2117] text-[#22C55E] border border-[#124D31] font-light">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                                  </span>
                  )}
                  {selectedApplication.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#2A1215] text-[#F87171] border border-[#6B1D24] font-light">
                      <XCircle className="w-3 h-3" />
                      Rejected
                                  </span>
                  )}
                </div>
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Email Address</span>
                  <div className="flex items-center justify-between gap-1">
                    <a
                      href={`mailto:${selectedApplication.email}`}
                      className="text-[12px] text-[#38BDF8] hover:underline font-mono truncate"
                    >
                      {selectedApplication.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyApplicationField(selectedApplication.email, 'email')}
                      className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded hover:bg-[#161B22]"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Phone / WhatsApp</span>
                  <div className="flex items-center justify-between gap-1">
                    <a
                      href={`tel:${selectedApplication.phone}`}
                      className="text-[12px] text-[#E6EDF3] hover:underline font-mono"
                    >
                      {selectedApplication.phone || 'N/A'}
                    </a>
                    {selectedApplication.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopyApplicationField(selectedApplication.phone, 'phone')}
                        className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded hover:bg-[#161B22]"
                        title="Copy phone"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Daily Commitment</span>
                  <div className="text-[12px] text-[#E6EDF3] font-light font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{selectedApplication.dailyHours || 4} Hours / Day</span>
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Submission Date</span>
                  <div className="text-[12px] text-[#E6EDF3] font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8B949E]" />
                    <span>{selectedApplication.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Experience Details */}
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1 uppercase font-normal">
                  Experience &amp; Background
                </label>
                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[12px] text-[#C9D1D9] leading-relaxed">
                  {selectedApplication.experience || 'No previous experience description provided.'}
                </div>
              </div>

              {/* Cover Letter / Message */}
              <div>
                <label className="text-[10.5px] text-[#8B949E] block mb-1 uppercase font-normal">
                  Applicant Cover Message
                </label>
                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[12px] text-[#C9D1D9] leading-relaxed italic">
                  {selectedApplication.message ? (
                    `"${selectedApplication.message}"`
                  ) : (
                    <span className="text-[#8B949E] not-italic">No additional cover message provided.</span>
                  )}
                </div>
              </div>

              {/* Status Note Banner */}
              {selectedApplication.status === 'approved' && (
                <div className="p-3 rounded-[6px] bg-[#0C2117] border border-[#124D31] flex items-center gap-2 text-[11.5px] text-[#22C55E]">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Worker account has been created. The worker has unlimited daily capacity on the portal.
                      </span>
                </div>
              )}
              {selectedApplication.status === 'rejected' && (
                <div className="p-3 rounded-[6px] bg-[#2A1215] border border-[#6B1D24] flex items-center gap-2 text-[11.5px] text-[#F87171]">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    This recruitment application is currently marked as Rejected.
                      </span>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3 border-t border-[#30363D] bg-[#12171F] flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsAppDetailModalOpen(false)}
                className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] border border-[#30363D] w-full sm:w-auto"
              >
                Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedApplication.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleRejectApplication(selectedApplication)}
                    disabled={actionLoadingAppId === selectedApplication.id}
                    className="vib-btn-sm bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] border border-[#5C2329] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoadingAppId === selectedApplication.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Reject Application</span>
                  </button>
                )}

                {selectedApplication.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApproveApplication(selectedApplication)}
                    disabled={actionLoadingAppId === selectedApplication.id}
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoadingAppId === selectedApplication.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Approve &amp; Create Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CONTACT DETAILS */}
      {isContactModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-[560px] bg-[#161B22] border border-[#30363D] rounded-[10px] shadow-2xl text-[#C9D1D9] relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#30363D] bg-[#12171F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0284C7]/15 border border-[#0284C7]/30 flex items-center justify-center text-[#38BDF8]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-normal text-[#E6EDF3]">
                    Contact Inquiry Details
                  </h3>
                  <div className="text-[10.5px] text-[#8B949E] font-mono">
                    ID: {selectedContact.id} • Received: {selectedContact.createdAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="w-7 h-7 rounded-md bg-[#1C2128] hover:bg-[#282E37] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Sender Card */}
              <div className="p-3.5 rounded-[8px] bg-[#0D1117] border border-[#30363D] flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#38BDF8] font-light text-[15px] shrink-0 uppercase">
                    {selectedContact.name ? selectedContact.name.slice(0, 2) : 'DD'}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-light text-[#E6EDF3]">
                      {selectedContact.name}
                    </h4>
                    <span className="text-[11.5px] text-[#8B949E] font-mono block">
                      {selectedContact.email}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-0.5 rounded-full bg-[#0D2136] text-[#38BDF8] border border-[#153456] font-light">
                  Public Ticket
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Sender Email</span>
                  <div className="flex items-center justify-between gap-1">
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-[12px] text-[#38BDF8] hover:underline font-mono truncate"
                    >
                      {selectedContact.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyContactField(selectedContact.email, 'email')}
                      className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded hover:bg-[#161B22]"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D]">
                  <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-normal">Received Date / Time</span>
                  <div className="text-[12px] text-[#E6EDF3] font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8B949E]" />
                    <span>{selectedContact.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10.5px] text-[#8B949E] uppercase font-normal">
                    Subject / Service Topic
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyContactField(selectedContact.subject, 'subject')}
                    className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] inline-flex items-center gap-1"
                  >
                    {copiedField === 'subject' ? (
                      <span className="text-[#22C55E] flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[12.5px] text-[#E6EDF3] font-light">
                  {selectedContact.subject || 'General Inquiry'}
                </div>
              </div>

              {/* Message Details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10.5px] text-[#8B949E] uppercase font-normal">
                    Message Body
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyContactField(selectedContact.message, 'message')}
                    className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] inline-flex items-center gap-1"
                  >
                    {copiedField === 'message' ? (
                      <span className="text-[#22C55E] flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Full Text</span>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[12.5px] text-[#C9D1D9] leading-relaxed whitespace-pre-wrap font-light max-h-[220px] overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3 border-t border-[#30363D] bg-[#12171F] flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] border border-[#30363D] w-full sm:w-auto"
              >
                Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  disabled={deletingContactId === selectedContact.id}
                  className="vib-btn-sm bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] border border-[#5C2329] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {deletingContactId === selectedContact.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Message</span>
                </button>

                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || 'Inquiry')}`}
                  className="vib-btn-sm bg-[#0284C7] hover:bg-[#0369A1] text-white border border-[#0284C7] flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSION DETAILS */}
      {isSubmissionDetailModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[600px] bg-[#161B22] border border-[#30363D] rounded-[10px] shadow-2xl flex flex-col relative my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#30363D]">
              <div>
                <span className="text-[10px] text-[#38BDF8] uppercase tracking-wider font-normal block mb-0.5">
                  Submission Details
                </span>

                <h3 className="text-[15px] text-[#E6EDF3] font-normal flex items-center gap-2">
                  <span>{selectedSubmission.jobTitle}</span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                      selectedSubmission.status === 'approved'
                        ? 'bg-[#0C2117] text-[#4ADE80] border-[#124D31]'
                        : selectedSubmission.status === 'rejected'
                        ? 'bg-[#2A1215] text-[#F87171] border-[#6B1D24]'
                        : 'bg-[#12171F] text-[#F59E0B] border-[#523912]'
                    }`}
                  >
                    {selectedSubmission.status}
                  </span>
                </h3>
                <p className="text-[11.5px] text-[#8B949E] mt-1">
                  Submitted by <strong className="text-[#C9D1D9]">{selectedSubmission.userName}</strong> on {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>

              </div>
              <button
                onClick={() => setIsSubmissionDetailModalOpen(false)}
                className="w-7 h-7 rounded-md bg-[#1C2128] hover:bg-[#282E37] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#12171F] border border-[#30363D] p-3 rounded-[6px]">
                  <div className="text-[10px] text-[#8B949E] uppercase mb-1">Total Collected</div>
                  <div className="text-[14px] text-[#E6EDF3] font-mono">{selectedSubmission.totalCollected}</div>
                </div>
                <div className="bg-[#12171F] border border-[#30363D] p-3 rounded-[6px]">
                  <div className="text-[10px] text-[#8B949E] uppercase mb-1">Total Used</div>
                  <div className="text-[14px] text-[#E6EDF3] font-mono">{selectedSubmission.totalUsed}</div>
                </div>
                <div className="bg-[#0C2117] border border-[#124D31] p-3 rounded-[6px]">
                  <div className="text-[10px] text-[#4ADE80] uppercase mb-1">Success</div>
                  <div className="text-[14px] text-[#4ADE80] font-mono font-light">{selectedSubmission.successCount}</div>
                </div>
                <div className="bg-[#2A1215] border border-[#6B1D24] p-3 rounded-[6px]">
                  <div className="text-[10px] text-[#F87171] uppercase mb-1">Failed</div>
                  <div className="text-[14px] text-[#F87171] font-mono font-light">{selectedSubmission.failedCount}</div>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] text-[#E6EDF3] font-light mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8B949E]" />
                  Proof Notes
                </h4>
                <div className="bg-[#12171F] border border-[#30363D] rounded-[6px] p-3 text-[12px] text-[#C9D1D9] whitespace-pre-wrap">
                  {selectedSubmission.proofNotes || <span className="text-[#8B949E] italic">No proof notes provided.</span>}
                </div>
              </div>

              {selectedSubmission.proofFiles && selectedSubmission.proofFiles.length > 0 && (
                <div>
                  <h4 className="text-[12px] text-[#E6EDF3] font-light mb-1.5 flex items-center gap-1.5">
                    <FileUp className="w-3.5 h-3.5 text-[#8B949E]" />
                    Uploaded Proof Files
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedSubmission.proofFiles.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setViewingProofFile(file)}
                        className="bg-[#12171F] hover:bg-[#1C2128] border border-[#30363D] rounded-[6px] p-2.5 text-[11.5px] text-[#38BDF8] flex items-center gap-2 transition-colors text-left"
                      >
                        <span className="shrink-0 text-[#8B949E] font-mono">#{idx + 1}</span>
                        <span className="truncate flex-1">{getFileNameFromUrl(file)}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#8B949E]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3 border-t border-[#30363D] bg-[#12171F] flex items-center justify-between gap-3 rounded-b-[10px]">
              <button
                onClick={() => setIsSubmissionDetailModalOpen(false)}
                className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] border border-[#30363D]"
              >
                Close
              </button>
              
              {selectedSubmission.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleUpdateSubmission(selectedSubmission.id, 'rejected');
                      setIsSubmissionDetailModalOpen(false);
                    }}
                    className="vib-btn-sm bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] border border-[#5C2329]"
                  >
                    Reject Submission
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateSubmission(selectedSubmission.id, 'approved');
                      setIsSubmissionDetailModalOpen(false);
                    }}
                    className="vib-btn-sm bg-[#0C2117] hover:bg-[#124D31] text-[#4ADE80] border border-[#124D31]"
                  >
                    Approve Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FULL PAGE FILE VIEWER */}
      {viewingProofFile && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0D1117]/95 backdrop-blur-md">
          {/* Viewer Header */}
          <div className="flex items-center justify-between p-4 bg-[#161B22] border-b border-[#30363D]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#12171F] border border-[#30363D] flex items-center justify-center text-[#38BDF8]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] text-[#E6EDF3] font-light max-w-[300px] sm:max-w-[500px] truncate">
                  {getFileNameFromUrl(viewingProofFile)}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={viewingProofFile}
                target="_blank"
                rel="noreferrer"
                className="vib-btn-sm bg-[#1C2128] hover:bg-[#21262D] text-[#38BDF8] border border-[#30363D] flex items-center gap-1.5"
                title="Open in new tab"
              >
                <span>Open Original</span>
              </a>
              <button
                onClick={() => setViewingProofFile(null)}
                className="vib-btn-sm bg-[#2D1518] hover:bg-[#3D1C20] text-[#F87171] border border-[#5C2329] flex items-center gap-1.5 ml-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>
          
          {/* Viewer Content */}
          <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {isImageFile(viewingProofFile) ? (
              <img
                src={viewingProofFile}
                alt="Proof"
                className="max-w-full max-h-full object-contain rounded-[4px] shadow-2xl border border-[#30363D]"
              />
            ) : (
              <iframe
                src={viewingProofFile}
                title="Document Viewer"
                className="w-full h-full max-w-5xl bg-white rounded-[4px] border border-[#30363D] shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
