import React, { useState, useEffect } from 'react';
import { getEmbedVideoUrl } from '../utils';
import {
  LayoutDashboard,
  Briefcase,
  Database,
  Trophy,
  Send,
  Video,
  Wrench,
  Bot,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
  FileText,
  AlertCircle,
  Plus,
  Play,
  Upload,
  Infinity as InfinityIcon,
  Mail,
  Phone,
  ShieldAlert,
  X,
  Image as ImageIcon,
  Crown,
  Gift,
  Zap,
  User as UserIcon,
  Eye,
  ChevronDown,
  FileSpreadsheet,
  ArrowLeft,
  History,
  CheckCircle,
} from 'lucide-react';
import { UserProfileTab } from './UserProfileTab';
import {
  User,
  Job,
  DataFile,
  UserCollectedBatch,
  JobSubmission,
  LeaderboardEntry,
  TutorialItem,
  ToolItem,
  AutomationItem,
} from '../types';

interface UserPanelProps {
  user: User;
  onRefreshUser: () => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({ user, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'jobs' | 'data' | 'leaderboard' | 'submit' | 'tutorial' | 'tools' | 'automation' | 'profile'
  >('dashboard');

  // Live Data States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [userBatches, setUserBatches] = useState<UserCollectedBatch[]>([]);
  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [automation, setAutomation] = useState<AutomationItem[]>([]);
  const [retentionDays, setRetentionDays] = useState(30);

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedBatchForDownload, setSelectedBatchForDownload] = useState<UserCollectedBatch | null>(null);

  // Collect Modal Form
  const [collectType, setCollectType] = useState<'email' | 'sms'>('email');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [collectQuantity, setCollectQuantity] = useState<number>(500);
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectMsg, setCollectMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Download/Use Modal Form
  const [downloadCount, setDownloadCount] = useState<number>(50);
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'csv'>('txt');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadedResult, setDownloadedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Job Submission Form
  const [submitJobId, setSubmitJobId] = useState<string>('');
  const [submitSuccessCount, setSubmitSuccessCount] = useState<number>(0);
  const [submitFailedCount, setSubmitFailedCount] = useState<number>(0);
  const [submitProofNotes, setSubmitProofNotes] = useState<string>('');
  const [submitProofFiles, setSubmitProofFiles] = useState<File[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search/Filter states
  const [dataFileFilter, setDataFileFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [tutorialSearch, setTutorialSearch] = useState('');
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [autoSearchQuery, setAutoSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<TutorialItem | null>(null);

  // Data Tab - Collect History states
  const [showAllHistoryView, setShowAllHistoryView] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [viewingBatchRecords, setViewingBatchRecords] = useState<UserCollectedBatch | null>(null);
  const [activeExportDropdownId, setActiveExportDropdownId] = useState<string | null>(null);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewCopied, setPreviewCopied] = useState(false);

  // Interactive Tools state
  const [toolsSubTab, setToolsSubTab] = useState<'public' | 'internal'>('public');
  const [toolTab, setToolTab] = useState<'emailCleaner' | 'phoneCleaner' | 'spamChecker'>('emailCleaner');

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [cleanerReport, setCleanerReport] = useState<{
    total: number;
    valid: number;
    duplicates: number;
    invalid: number;
    disposable: number;
    validEmails: string[];
    domainStats: Record<string, number>;
  } | null>(null);
  const [phoneReport, setPhoneReport] = useState<{
    total: number;
    valid: number;
    invalid: number;
    validPhones: string[];
    prefixStats: Record<string, number>;
  } | null>(null);
  const [spamReport, setSpamReport] = useState<{
    totalWords: number;
    charCount: number;
    triggerCount: number;
    riskScore: number;
    triggersFound: { word: string; count: number; severity: 'high' | 'medium' | 'low' }[];
    readabilityScore: string;
  } | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<'manual' | '30s'>('manual');

  useEffect(() => {
    if (autoRefreshInterval !== '30s') return;
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  // Fetch all user panel data
  const fetchData = async () => {
    try {
      const [
        jobsRes,
        filesRes,
        batchesRes,
        subsRes,
        leaderRes,
        tutsRes,
        toolsRes,
        autoRes,
        histRes,
      ] = await Promise.all([
        fetch('/api/jobs').then((r) => r.json()),
        fetch('/api/data-files').then((r) => r.json()),
        fetch(`/api/data/user-collected/${user.id}`).then((r) => r.json()),
        fetch(`/api/submissions?userId=${user.id}`).then((r) => r.json()),
        fetch('/api/leaderboard').then((r) => r.json()),
        fetch('/api/tutorials').then((r) => r.json()),
        fetch('/api/tools').then((r) => r.json()),
        fetch('/api/automation').then((r) => r.json()),
        fetch(`/api/data/collect-history/${user.id}`).then((r) => r.json()),
      ]);

      if (jobsRes.jobs) setJobs(jobsRes.jobs);
      if (filesRes.files) {
        setDataFiles(filesRes.files);
        if (!selectedFileId && filesRes.files.length > 0) {
          setSelectedFileId(filesRes.files[0].id);
        }
      }
      if (batchesRes.batches) setUserBatches(batchesRes.batches);
      if (subsRes.submissions) setSubmissions(subsRes.submissions);
      if (leaderRes.leaderboard) setLeaderboard(leaderRes.leaderboard);
      if (tutsRes.tutorials) setTutorials(tutsRes.tutorials);
      if (toolsRes.tools) setTools(toolsRes.tools);
      if (autoRes.automation) setAutomation(autoRes.automation);
      if (histRes.retentionDays) setRetentionDays(histRes.retentionDays);
    } catch (e) {
      console.error('Failed to load user panel data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  // Handle Collect Data
  const handleCollectData = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollectMsg(null);
    setCollectLoading(true);

    try {
      const res = await fetch('/api/data/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fileId: selectedFileId,
          dataType: collectType,
          requestedCount: collectQuantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to collect data');
      }

      setCollectMsg({ type: 'success', text: `Successfully collected ${collectQuantity} records!` });
      onRefreshUser();
      await fetchData();

      setTimeout(() => {
        setIsCollectModalOpen(false);
        setCollectMsg(null);
      }, 1200);
    } catch (err: any) {
      setCollectMsg({ type: 'error', text: err.message });
    } finally {
      setCollectLoading(false);
    }
  };

  // Open download/use modal for a batch
  const handleOpenDownloadModal = (batch: UserCollectedBatch) => {
    setSelectedBatchForDownload(batch);
    setDownloadCount(Math.min(batch.remainingToUse, 100));
    setDownloadedResult(null);
    setCopied(false);
    setIsDownloadModalOpen(true);
  };

  // Process partial download from user batch
  const handleDownloadBatch = async () => {
    if (!selectedBatchForDownload) return;
    setDownloadLoading(true);
    setCopied(false);

    try {
      const res = await fetch('/api/data/download-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatchForDownload.id,
          downloadCount,
          format: downloadFormat,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Download failed');

      setDownloadedResult(data.formattedContent);

      // Trigger automatic browser file download
      const blob = new Blob([data.formattedContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DarkDevil_${selectedBatchForDownload.dataType}_${downloadCount}_records.${downloadFormat}`;
      link.click();
      URL.revokeObjectURL(url);

      onRefreshUser();
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error downloading batch');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Copy downloaded content to clipboard
  const handleCopyClipboard = () => {
    if (!downloadedResult) return;
    navigator.clipboard.writeText(downloadedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Collect History Batch in TXT / CSV / Excel format
  const handleExportBatch = (batch: UserCollectedBatch, format: 'txt' | 'csv' | 'excel') => {
    if (!batch || !batch.records || batch.records.length === 0) {
      alert('No data records available in this batch to export.');
      return;
    }
    const safeFileName = (batch.fileName || 'data').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'txt') {
      const content = batch.records.join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Batch_${batch.id}_${safeFileName}_${batch.dataType}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const header = batch.dataType === 'email' ? 'No,Email_Address' : 'No,Phone_Number';
      const rows = batch.records.map((r, i) => `${i + 1},"${(r || '').replace(/"/g, '""')}"`);
      const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Batch_${batch.id}_${safeFileName}_${batch.dataType}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const isEmail = batch.dataType === 'email';
      const colName = isEmail ? 'Email Address' : 'Phone Number';
      const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Data">
   <Alignment ss:Horizontal="Left"/>
  </Style>
  <Style ss:ID="Index">
   <Alignment ss:Horizontal="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Collected Batch">
  <Table>
   <Column ss:Width="60"/>
   <Column ss:Width="320"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">#</Data></Cell>
    <Cell><Data ss:Type="String">${colName}</Data></Cell>
   </Row>`;
      const xmlRows = batch.records.map((r, i) => `   <Row>
    <Cell ss:StyleID="Index"><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell ss:StyleID="Data"><Data ss:Type="String">${(r || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</Data></Cell>
   </Row>`).join('\n');
      const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;
      const excelContent = `${xmlHeader}\n${xmlRows}\n${xmlFooter}`;
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Batch_${batch.id}_${safeFileName}_${batch.dataType}.xls`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setActiveExportDropdownId(null);
  };

  // Submit Job Work Proof
  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          jobId: submitJobId,
          totalCollected: user.totalCollectedData,
          totalUsed: user.totalUsedData,
          successCount: submitSuccessCount,
          failedCount: submitFailedCount,
          proofNotes: submitProofNotes,
          proofFiles: submitProofFiles.map(f => f.name),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmitMsg({ type: 'success', text: 'Work proof submitted successfully. Leader will review.' });
      setSubmitProofNotes('');
      setSubmitProofFiles([]);
      onRefreshUser();
      await fetchData();
    } catch (err: any) {
      setSubmitMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Run Client-Side Interactive Tool
  const runTool = () => {
    const rawLines = toolInput.split('\n').map((l) => l.trim()).filter(Boolean);

    if (toolTab === 'emailCleaner') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const seen = new Set<string>();
      const valid: string[] = [];
      let duplicates = 0;
      let invalid = 0;
      let disposable = 0;
      const domainStats: Record<string, number> = {};
      const disposableDomains = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'trashmail.com', 'dispostable.com', 'yopmail.com'];

      rawLines.forEach((line) => {
        const email = line.toLowerCase();
        if (!emailRegex.test(email)) {
          invalid++;
        } else if (seen.has(email)) {
          duplicates++;
        } else {
          seen.add(email);
          const domain = email.split('@')[1] || 'unknown';
          if (disposableDomains.includes(domain)) {
            disposable++;
          } else {
            valid.push(email);
            domainStats[domain] = (domainStats[domain] || 0) + 1;
          }
        }
      });

      setCleanerReport({
        total: rawLines.length,
        valid: valid.length,
        duplicates,
        invalid,
        disposable,
        validEmails: valid,
        domainStats,
      });

      setToolOutput(
        `# Cleaned List (${valid.length} valid, ${duplicates} duplicates removed, ${invalid} invalid removed)\n` +
          valid.join('\n')
      );
    } else if (toolTab === 'phoneCleaner') {
      let validCount = 0;
      let invalidCount = 0;
      const validPhones: string[] = [];
      const prefixStats: Record<string, number> = {};

      rawLines.forEach((line) => {
        const digits = line.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          invalidCount++;
        } else {
          let formatted = '';
          if (line.startsWith('+')) {
            formatted = `+${digits}`;
          } else if (digits.length === 10) {
            formatted = `+1${digits}`;
          } else if (digits.startsWith('1') && digits.length === 11) {
            formatted = `+${digits}`;
          } else {
            formatted = `+${digits}`;
          }
          validCount++;
          validPhones.push(formatted);
          const prefix = formatted.substring(0, 3);
          prefixStats[prefix] = (prefixStats[prefix] || 0) + 1;
        }
      });

      setPhoneReport({
        total: rawLines.length,
        valid: validCount,
        invalid: invalidCount,
        validPhones,
        prefixStats,
      });

      setToolOutput(
        `# Formatted E.164 Phones (${validCount} valid, ${invalidCount} invalid)\n` +
          validPhones.join('\n')
      );
    } else if (toolTab === 'spamChecker') {
      const text = toolInput.trim();
      const lower = text.toLowerCase();
      const words = text.split(/\s+/).filter(Boolean);

      const spamKeywords: { word: string; severity: 'high' | 'medium' | 'low' }[] = [
        { word: '100% free', severity: 'high' },
        { word: 'free gift', severity: 'high' },
        { word: 'earn money', severity: 'high' },
        { word: 'act now', severity: 'high' },
        { word: 'no risk', severity: 'medium' },
        { word: 'winner', severity: 'high' },
        { word: 'cash bonus', severity: 'high' },
        { word: 'urgent', severity: 'medium' },
        { word: 'risk free', severity: 'medium' },
        { word: 'buy now', severity: 'high' },
        { word: 'guaranteed', severity: 'medium' },
        { word: 'million dollars', severity: 'high' },
        { word: 'claim now', severity: 'high' },
        { word: 'limited time', severity: 'low' },
        { word: 'exclusive deal', severity: 'low' },
        { word: 'congratulations', severity: 'high' },
        { word: 'no obligation', severity: 'medium' },
        { word: 'double your income', severity: 'high' },
        { word: 'fast cash', severity: 'high' },
      ];

      const foundMap: Record<string, { count: number; severity: 'high' | 'medium' | 'low' }> = {};
      let totalTriggers = 0;

      spamKeywords.forEach((item) => {
        const regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = lower.match(regex);
        if (matches && matches.length > 0) {
          foundMap[item.word] = { count: matches.length, severity: item.severity };
          totalTriggers += matches.length;
        }
      });

      const triggersFound = Object.entries(foundMap).map(([word, data]) => ({
        word,
        count: data.count,
        severity: data.severity,
      }));

      const riskScore = Math.min(100, Math.round((totalTriggers / Math.max(1, words.length / 15)) * 100));

      setSpamReport({
        totalWords: words.length,
        charCount: text.length,
        triggerCount: totalTriggers,
        riskScore,
        triggersFound,
        readabilityScore: words.length > 50 ? 'Good (Professional)' : 'Short Copy',
      });

      setToolOutput(
        `# Spam Trigger Scan Report\n- Total Words: ${words.length}\n- Risk Score: ${riskScore}%\n- Triggers Detected: ${totalTriggers}\n\n` +
          (triggersFound.length === 0
            ? 'No high-risk spam triggers detected.'
            : triggersFound.map((t) => `- [${t.severity.toUpperCase()}] "${t.word}" (${t.count}x)`).join('\n'))
      );
    }
  };

  const handleToolFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setToolInput((prev) => (prev ? prev + '\n' + text : text));
      }
    };
    reader.readAsText(file);
  };

  const exportCleanerResults = (format: 'txt' | 'csv' | 'xls') => {
    if (!cleanerReport || cleanerReport.validEmails.length === 0) return;
    let content = '';
    let filename = `cleaned_emails.${format === 'xls' ? 'xls' : format}`;
    let mime = 'text/plain';

    if (format === 'txt') {
      content = cleanerReport.validEmails.join('\n');
      mime = 'text/plain';
    } else if (format === 'csv') {
      content = 'Email,Domain,MX_Status\n' + cleanerReport.validEmails.map((e) => `${e},${e.split('@')[1]},VALID_MX`).join('\n');
      filename = 'cleaned_emails.csv';
      mime = 'text/csv';
    } else if (format === 'xls') {
      content = 'Email\tDomain\tMX_Status\n' + cleanerReport.validEmails.map((e) => `${e}\t${e.split('@')[1]}\tVALID_MX`).join('\n');
      filename = 'cleaned_emails.xls';
      mime = 'application/vnd.ms-excel';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCleanerResultsToClipboard = () => {
    if (!cleanerReport || cleanerReport.validEmails.length === 0) return;
    navigator.clipboard.writeText(cleanerReport.validEmails.join('\n'));
    alert('Cleaned results copied to clipboard!');
  };

  const exportPhoneResults = (format: 'txt' | 'csv' | 'xls') => {
    if (!phoneReport || phoneReport.validPhones.length === 0) return;
    let content = '';
    let filename = `formatted_phones.${format === 'xls' ? 'xls' : format}`;
    let mime = 'text/plain';

    if (format === 'txt') {
      content = phoneReport.validPhones.join('\n');
      mime = 'text/plain';
    } else if (format === 'csv') {
      content = 'Phone_E164,Status\n' + phoneReport.validPhones.map((p) => `${p},VALID_E164`).join('\n');
      filename = 'formatted_phones.csv';
      mime = 'text/csv';
    } else if (format === 'xls') {
      content = 'Phone_E164\tStatus\n' + phoneReport.validPhones.map((p) => `${p}\tVALID_E164`).join('\n');
      filename = 'formatted_phones.xls';
      mime = 'application/vnd.ms-excel';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPhoneResultsToClipboard = () => {
    if (!phoneReport || phoneReport.validPhones.length === 0) return;
    navigator.clipboard.writeText(phoneReport.validPhones.join('\n'));
    alert('Formatted E.164 phones copied to clipboard!');
  };

  const exportSpamResults = (format: 'txt' | 'csv' | 'xls') => {
    if (!spamReport || spamReport.triggersFound.length === 0) return;
    let content = '';
    let filename = `spam_audit_report.${format === 'xls' ? 'xls' : format}`;
    let mime = 'text/plain';

    if (format === 'txt') {
      content = `SPAM AUDIT REPORT\nRisk Score: ${spamReport.riskScore}%\nTotal Triggers: ${spamReport.triggerCount}\n\nTriggers:\n` +
        spamReport.triggersFound.map((t) => `${t.severity.toUpperCase()}: ${t.word} (${t.count}x)`).join('\n');
      mime = 'text/plain';
    } else if (format === 'csv') {
      content = 'Trigger_Phrase,Severity,Frequency\n' + spamReport.triggersFound.map((t) => `"${t.word}",${t.severity},${t.count}`).join('\n');
      filename = 'spam_audit_report.csv';
      mime = 'text/csv';
    } else if (format === 'xls') {
      content = 'Trigger_Phrase\tSeverity\tFrequency\n' + spamReport.triggersFound.map((t) => `${t.word}\t${t.severity}\t${t.count}`).join('\n');
      filename = 'spam_audit_report.xls';
      mime = 'application/vnd.ms-excel';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySpamResultsToClipboard = () => {
    if (!spamReport) return;
    const text = `Spam Audit Report - Risk Score: ${spamReport.riskScore}% (${spamReport.triggerCount} triggers found)`;
    navigator.clipboard.writeText(text);
    alert('Spam audit report copied to clipboard!');
  };

  // Filtered files for collection
  const availableFiles = dataFiles.filter((f) => {
    if (dataFileFilter === 'all') return true;
    return f.dataType === dataFileFilter;
  });

  const selectedFile = dataFiles.find((f) => f.id === selectedFileId);

  return (
    <div className="max-w-[1280px] mx-auto px-2 sm:px-4 py-3 sm:py-5 flex flex-col md:flex-row gap-3">
      {/* Groupwise Compact Sidebar (Width: 196px) */}
      <aside className="w-full md:w-[196px] shrink-0 bg-[#0B0F17] border border-[#30363D] rounded-[8px] p-2 flex flex-col gap-3">
        {/* User Identity Chip */}
        <div
          onClick={() => setActiveTab('profile')}
          className="p-2 rounded-[6px] bg-[#12171F] hover:bg-[#181F2B] border border-[#21262D] hover:border-[#38BDF8]/50 cursor-pointer transition-colors group"
          title="Click to manage profile"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 border border-[#2563EB] flex items-center justify-center text-[10px] text-[#38BDF8] font-light overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{user.username.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-[#E6EDF3] font-light truncate group-hover:text-[#38BDF8] transition-colors">
                {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
              </div>
              <div className="text-[10px] text-[#22C55E] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>Active Worker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Nav: Group 1 - Operations */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            WORKBENCH
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'jobs'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs</span>
            <span className="ml-auto text-[10px] text-[#8B949E] font-mono">{jobs.filter(j => j.status === 'active').length}</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'data'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data</span>
            <span className="ml-auto text-[10px] text-[#38BDF8] font-mono">
              {userBatches.reduce((acc, b) => acc + b.remainingToUse, 0)}</span>
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'submit'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>JobSubmit</span>
          </button>
        </div>

        {/* Sidebar Nav: Group 2 - Stats & Performance */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            COMMUNITY
          </div>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Leaderbord</span>
          </button>
        </div>

        {/* Sidebar Nav: Group 3 - Knowledge & Resources */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            RESOURCES
          </div>

          <button
            onClick={() => setActiveTab('tutorial')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'tutorial'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Toutorial</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'tools'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
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
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Automation</span>
          </button>
        </div>

        {/* Sidebar Nav: Group 4 - Account & Profile */}
        <div className="space-y-1">
          <div className="px-2 text-[9.5px] uppercase tracking-wider text-[#6E7681] font-light">
            ACCOUNT
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full min-h-[28px] px-2 py-1 rounded-[6px] text-left text-[12px] flex items-center gap-2 border-l-2 transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#12171F] text-[#E6EDF3] border-[#30363D] border-l-[#38BDF8] font-light'
                : 'text-[#8B949E] hover:text-[#E6EDF3] border-l-transparent hover:bg-[#181F2B]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Profile</span>
          </button>
        </div>

        {/* Bottom Quick Stats */}
        <div className="mt-auto p-2 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[11px] space-y-1">
          <div className="flex justify-between text-[#8B949E]">
            <span>Today Job:</span>
            <span className="font-mono text-[#E6EDF3]">{user.todayJobsCount}</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>Total Used:</span>
            <span className="font-mono text-[#38BDF8]">{user.totalUsedData}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#0D1117] space-y-3">
        {/* ========================================================
            TAB 1: DASHBOARD
        ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <span className="text-[10.5px] text-[#8B949E] block mb-1">My Today Job</span>
                <span className="text-lg text-[#E6EDF3] font-light font-mono">{user.todayJobsCount}</span>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <span className="text-[10.5px] text-[#8B949E] block mb-1">Total Job Today</span>
                <span className="text-lg text-[#22C55E] font-light font-mono">
                  {submissions.filter((s) => s.submittedAt?.startsWith(new Date().toISOString().split('T')[0])).length || user.todayJobsCount}
</span>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <span className="text-[10.5px] text-[#8B949E] block mb-1">My Joining Day</span>
                <span className="text-[12px] text-[#E6EDF3] font-mono">{user.joiningDate}</span>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
                <span className="text-[10.5px] text-[#8B949E] block mb-1">Work Capacity</span>
                <span className="text-[13px] text-[#22C55E] font-light font-mono flex items-center gap-1.5 mt-1">
                  <InfinityIcon className="w-4 h-4 text-[#22C55E]" />
                  <span>Unlimited</span>
                </span>
              </div>
            </div>

            {/* Data Holding Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] text-[#8B949E] block mb-0.5">Total Collected Data</span>
                  <span className="text-xl text-[#E6EDF3] font-light font-mono">{user.totalCollectedData.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('data');
                    setIsCollectModalOpen(true);
                  }}
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Collect Data</span>
                </button>
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] text-[#8B949E] block mb-0.5">Total Download / Uses Data</span>
                  <span className="text-xl text-[#38BDF8] font-light font-mono">{user.totalUsedData.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setActiveTab('data')}
                  className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#C9D1D9] border border-[#30363D]"
                >
                  <Download className="w-3 h-3" />
                  <span>Use Data</span>
                </button>
              </div>
            </div>

            {/* Recent Work / Available Jobs Quick Table */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#E6EDF3] font-light">Available Jobs</span>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="text-[11px] text-[#38BDF8] hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-1.5">
                {jobs.filter(j => j.status === 'active').slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="p-2 rounded-[6px] bg-[#12171F] border border-[#21262D] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[12px] text-[#E6EDF3] font-light truncate">{job.title}</div>
                      <div className="text-[10.5px] text-[#8B949E] flex items-center gap-2">
                        <span className="uppercase text-[#38BDF8]">[{job.type}]</span>
                        <span>Rate: ${job.payoutPerUnit}</span>
                        <span>Target: {job.dailyTarget}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSubmitJobId(job.id);
                        setActiveTab('submit');
                      }}
                      className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#C9D1D9] border border-[#30363D]"
                    >
                      Select Job
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: JOBS (Admin added jobs in Card Grid)
        ======================================================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] text-[#E6EDF3] font-light">Jobs</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-[#161B22] border border-[#30363D] rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAutoRefreshInterval('manual')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${autoRefreshInterval === 'manual' ? 'bg-[#21262D] text-[#E6EDF3]' : 'text-[#8B949E] hover:text-[#E6EDF3]'}`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoRefreshInterval('30s')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${autoRefreshInterval === '30s' ? 'bg-[#238636] text-white' : 'text-[#8B949E] hover:text-[#E6EDF3]'}`}
                  >
                    30s Poll
                  </button>
                </div>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="vib-input pl-9 py-1.5 w-[180px]"
                  />
                </div>
                <span className="text-[11px] text-[#8B949E] font-mono px-2 py-1 rounded bg-[#161B22] border border-[#30363D]">
                  {jobs.filter((j) => j.status === 'active').length} Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {jobs
                .filter((j) => j.status === 'active' && j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()))
                .map((job) => (
                  <div
                    key={job.id}
                    className="bg-[#161B22] border border-[#30363D] hover:border-[#38BDF8] transition-colors rounded-[8px] overflow-hidden flex flex-col"
                  >
                    {/* Thumbnail */}
                    {job.thumbnailUrl ? (
                      <div className="h-28 bg-[#0D1117] border-b border-[#30363D] overflow-hidden shrink-0">
                        <img src={job.thumbnailUrl} alt={job.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-28 bg-[#0D1117] border-b border-[#30363D] shrink-0 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-[#21262D]" />
                      </div>
                    )}

                    <div className="p-3.5 flex flex-col flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] text-[#E6EDF3] font-light leading-tight">
                          {job.title}
                        </h4>
                        <span className="text-[11px] text-[#22C55E] font-mono font-light shrink-0 bg-[#0C2117] px-1.5 py-0.5 rounded border border-[#124D31]">
                          ${job.payoutPerUnit} / unit
</span>
                      </div>

                      <div className="text-[11px] text-[#8B949E] font-mono flex items-center justify-between">
                        <span>Type: <span className="text-[#38BDF8] uppercase">{job.type}</span></span>
                        <span>Target: {job.dailyTarget} units</span>
                      </div>

                      <div className="p-2 rounded bg-[#12171F] border border-[#21262D] text-[11px] text-[#8B949E] line-clamp-3">
                        {job.instructions}
                      </div>

                      <div className="flex-1" />

                      <div className="pt-3 border-t border-[#30363D] flex items-center justify-between">
                        <span className="text-[10px] text-[#8B949E]">Added: {job.createdAt}</span>
                        <button
                          onClick={() => {
                            setSubmitJobId(job.id);
                            setActiveTab('submit');
                          }}
                          className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] transition-colors"
                        >
                          <span>Select Job</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {jobs.filter((j) => j.status === 'active' && j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).length === 0 && (
              <div className="text-center py-10 bg-[#161B22] border border-[#30363D] rounded-[8px]">
                <Briefcase className="w-8 h-8 mx-auto text-[#30363D] mb-2" />
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: DATA (Admin Uploaded Data Files + User Collection & Download)
        ======================================================== */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {showAllHistoryView ? (
              /* ========================================================
                 SEPARATE PAGE: ALL COLLECT HISTORY
              ======================================================== */
              <div className="space-y-4">
                {/* Navigation & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161B22] border border-[#30363D] rounded-[8px] p-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllHistoryView(false)}
                      className="vib-btn-sm bg-[#12171F] hover:bg-[#1C2331] text-[#E6EDF3] border border-[#30363D] flex items-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Back to Data</span>
                    </button>
                    <div>
                      <h2 className="text-[14px] text-[#E6EDF3] font-normal flex items-center gap-2">
                        <span>Collect History</span>
                        <span className="text-[10.5px] font-mono text-[#38BDF8] bg-[#0D2136] px-2 py-0.5 rounded border border-[#153456]">
                          {userBatches.length} Total Batches
                        </span>
                      </h2>
                      <p className="text-[10.5px] text-[#8B949E]">
                        Complete record of data allocated to your worker account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] text-[#8B949E] px-2.5 py-1 rounded bg-[#12171F] border border-[#21262D] flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#EAB308]" />
                      <span>Retention: <strong className="text-[#E6EDF3] font-mono">{retentionDays} Days</strong></span>
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#161B22] border border-[#30363D] rounded-[8px] p-2.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search by Batch ID or file name..."
                      className="vib-input pl-8 text-[11.5px] py-1.5"
                    />
                    {historySearchQuery && (
                      <button
                        onClick={() => setHistorySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    {(['all', 'email', 'sms'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setHistoryTypeFilter(type)}
                        className={`px-2.5 py-1 rounded-[4px] border uppercase transition-colors ${
                          historyTypeFilter === type
                            ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                            : 'border-[#30363D] text-[#8B949E] hover:bg-[#1C2331]'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All History Table */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 space-y-2">
                  {(() => {
                    const filteredBatches = userBatches.filter((b) => {
                      if (historyTypeFilter !== 'all' && b.dataType !== historyTypeFilter) return false;
                      if (historySearchQuery.trim()) {
                        const q = historySearchQuery.toLowerCase().trim();
                        return (b.id && b.id.toLowerCase().includes(q)) || (b.fileName && b.fileName.toLowerCase().includes(q));
                      }
                      return true;
                    });

                    if (filteredBatches.length === 0) {
                      return (
                        <div className="p-8 text-center rounded-[6px] bg-[#12171F] border border-[#21262D] text-[11.5px] text-[#8B949E] space-y-1">
                          <History className="w-6 h-6 text-[#8B949E]/60 mx-auto mb-2" />
                          <div>No history batches found matching the filter.</div>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-[#21262D] text-[#8B949E] text-[10px]">
                              <th className="py-2 px-2.5">Batch ID</th>
                              <th className="py-2 px-2.5">File Name</th>
                              <th className="py-2 px-2.5">Type</th>
                              <th className="py-2 px-2.5 font-mono">Allocated</th>
                              <th className="py-2 px-2.5 font-mono">Used</th>
                              <th className="py-2 px-2.5 font-mono">Remaining</th>
                              <th className="py-2 px-2.5">Collection Date</th>
                              <th className="py-2 px-2.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBatches.map((b) => (
                              <tr key={b.id} className="border-b border-[#21262D]/50 hover:bg-[#12171F]">
                                <td className="py-2 px-2.5 font-mono text-[#8B949E]">{b.id}</td>
                                <td className="py-2 px-2.5 text-[#E6EDF3] font-light max-w-[200px] truncate">{b.fileName}</td>
                                <td className="py-2 px-2.5">
                                  <span
                                    className={`text-[9.5px] uppercase px-1.5 py-0.5 rounded border ${
                                      b.dataType === 'email'
                                        ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]/40'
                                        : 'bg-[#12171F] text-[#22C55E] border-[#22C55E]/40'
                                    }`}
                                  >
                                    {b.dataType}
                                  </span>
                                </td>
                                <td className="py-2 px-2.5 font-mono text-[#E6EDF3]">{b.totalAllocated}</td>
                                <td className="py-2 px-2.5 font-mono text-[#22C55E]">{b.usedCount}</td>
                                <td className="py-2 px-2.5 font-mono text-[#38BDF8]">{b.remainingToUse}</td>
                                <td className="py-2 px-2.5 text-[#8B949E]">{b.collectedAt}</td>
                                <td className="py-2 px-2.5 text-right">
                                  <div className="inline-flex items-center gap-1.5 relative">
                                    {/* View Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setViewingBatchRecords(b);
                                        setPreviewSearch('');
                                        setPreviewCopied(false);
                                      }}
                                      className="vib-btn-sm bg-[#12171F] hover:bg-[#1C2331] text-[#38BDF8] border border-[#30363D] flex items-center gap-1"
                                      title="View & Preview all data"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>View</span>
                                    </button>

                                    {/* Export Dropdown Button */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveExportDropdownId(activeExportDropdownId === b.id ? null : b.id)
                                        }
                                        className="vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] flex items-center gap-1"
                                      >
                                        <Download className="w-3 h-3 text-[#38BDF8]" />
                                        <span>Export</span>
                                        <ChevronDown className="w-3 h-3 text-[#8B949E]" />
                                      </button>

                                      {activeExportDropdownId === b.id && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-20"
                                            onClick={() => setActiveExportDropdownId(null)}
                                          />
                                          <div className="absolute right-0 top-full mt-1 w-36 bg-[#161B22] border border-[#30363D] rounded-[6px] shadow-xl py-1 z-30 text-left">
                                            <button
                                              type="button"
                                              onClick={() => handleExportBatch(b, 'txt')}
                                              className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                                            >
                                              <FileText className="w-3 h-3 text-[#8B949E]" />
                                              <span>Plain TXT (.txt)</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleExportBatch(b, 'csv')}
                                              className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                                            >
                                              <Database className="w-3 h-3 text-[#8B949E]" />
                                              <span>CSV File (.csv)</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleExportBatch(b, 'excel')}
                                              className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                                            >
                                              <FileSpreadsheet className="w-3 h-3 text-[#22C55E]" />
                                              <span>Excel Sheet (.xls)</span>
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* ========================================================
                 MAIN DATA OVERVIEW PAGE
              ======================================================== */
              <>
                {/* Header & Collect Data CTA */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-[8px] bg-[#161B22] border border-[#30363D]">
                  <div>
                    <span className="text-[10.5px] text-[#8B949E] block">Total Data Available</span>
                    <span className="text-xl text-[#38BDF8] font-light font-mono">
                      {dataFiles.reduce((acc, f) => acc + f.remainingCount, 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#8B949E] ml-2">records</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCollectModalOpen(true)}
                      className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Collect Data</span>
                    </button>
                  </div>
                </div>

                {/* Admin Uploaded File List Section */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12px] text-[#E6EDF3] font-light">Data Files</span>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => setDataFileFilter('all')}
                        className={`px-2 py-0.5 rounded-[4px] border ${
                          dataFileFilter === 'all'
                            ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                            : 'border-[#30363D] text-[#8B949E]'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setDataFileFilter('email')}
                        className={`px-2 py-0.5 rounded-[4px] border ${
                          dataFileFilter === 'email'
                            ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                            : 'border-[#30363D] text-[#8B949E]'
                        }`}
                      >
                        Email Data
                      </button>
                      <button
                        onClick={() => setDataFileFilter('sms')}
                        className={`px-2 py-0.5 rounded-[4px] border ${
                          dataFileFilter === 'sms'
                            ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                            : 'border-[#30363D] text-[#8B949E]'
                        }`}
                      >
                        SMS Data
                      </button>
                    </div>
                  </div>

                  {/* Files Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11.5px]">
                      <thead>
                        <tr className="border-b border-[#21262D] text-[#8B949E] text-[10.5px]">
                          <th className="py-1.5 px-2">File Name</th>
                          <th className="py-1.5 px-2">Type</th>
                          <th className="py-1.5 px-2 font-mono">Total Uploaded</th>
                          <th className="py-1.5 px-2 font-mono">Collected by Users</th>
                          <th className="py-1.5 px-2 font-mono">Remaining</th>
                          <th className="py-1.5 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableFiles.map((file) => (
                          <tr key={file.id} className="border-b border-[#21262D]/60 hover:bg-[#12171F]">
                            <td className="py-2 px-2 text-[#E6EDF3] font-light max-w-[200px] truncate">
                              {file.fileName}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`text-[9.5px] uppercase px-1 py-0.5 rounded border ${
                                  file.dataType === 'email'
                                    ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]/40'
                                    : 'bg-[#12171F] text-[#22C55E] border-[#22C55E]/40'
                                }`}
                              >
                                {file.dataType}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-mono text-[#8B949E]">{file.totalCount.toLocaleString()}</td>
                            <td className="py-2 px-2 font-mono text-[#8B949E]">{file.collectedCount.toLocaleString()}</td>
                            <td className="py-2 px-2 font-mono text-[#38BDF8] font-light">
                              {file.remainingCount.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => {
                                  setSelectedFileId(file.id);
                                  setCollectType(file.dataType);
                                  setIsCollectModalOpen(true);
                                }}
                                className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#38BDF8] border border-[#30363D]"
                              >
                                Collect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Collected Data Section (User's Allocated Batches) */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#E6EDF3] font-light">Collected Batches</span>
                    <span className="text-[11px] text-[#8B949E]">
                      Balance: <strong className="text-[#38BDF8] font-mono">{userBatches.reduce((acc, b) => acc + b.remainingToUse, 0)}</strong>
                    </span>
                  </div>

                  {userBatches.length === 0 ? (
                    <div className="p-4 text-center rounded-[6px] bg-[#12171F] border border-[#21262D] text-[11.5px] text-[#8B949E]">
                      No data batches collected yet. Click &quot;Collect Data&quot; to allocate sending data to your account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userBatches.map((batch) => (
                        <div
                          key={batch.id}
                          className="p-2.5 rounded-[6px] bg-[#12171F] border border-[#21262D] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[12px] text-[#E6EDF3] font-light">{batch.fileName}</span>
                              <span className="text-[9.5px] uppercase px-1 rounded bg-[#161B22] border border-[#30363D] text-[#8B949E]">
                                {batch.dataType}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8B949E] flex items-center gap-3 font-mono">
                              <span>Allocated: {batch.totalAllocated}</span>
                              <span className="text-[#22C55E]">Used: {batch.usedCount}</span>
                              <span className="text-[#38BDF8]">Remaining: {batch.remainingToUse}</span>
                              <span>Time: {batch.collectedAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              disabled={batch.remainingToUse <= 0}
                              onClick={() => handleOpenDownloadModal(batch)}
                              className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white border border-[#2563EB]"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download / Use</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collect History Section (Showing Latest 2 Batches) */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#E6EDF3] font-light">Collect History</span>
                      <span className="text-[10px] text-[#8B949E] px-1.5 py-0.5 rounded bg-[#12171F] border border-[#21262D]">
                        Latest 2 of {userBatches.length}
                      </span>
                      <span className="text-[10px] text-[#8B949E] px-2 py-0.5 rounded bg-[#12171F] border border-[#21262D]">
                        Retention: {retentionDays} Days
                      </span>
                    </div>

                    {userBatches.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistoryView(true)}
                        className="vib-btn-sm bg-[#12171F] hover:bg-[#1C2331] text-[#38BDF8] border border-[#30363D] flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <History className="w-3 h-3 text-[#38BDF8]" />
                        <span>View all history ({userBatches.length})</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {userBatches.length === 0 ? (
                    <div className="p-4 text-center rounded-[6px] bg-[#12171F] border border-[#21262D] text-[11.5px] text-[#8B949E]">
                      No history recorded yet. Collect data above to view allocation history.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#21262D] text-[#8B949E] text-[10px]">
                            <th className="py-1.5 px-2">Batch ID</th>
                            <th className="py-1.5 px-2">File</th>
                            <th className="py-1.5 px-2">Type</th>
                            <th className="py-1.5 px-2 font-mono">Allocated</th>
                            <th className="py-1.5 px-2 font-mono">Used</th>
                            <th className="py-1.5 px-2 font-mono">Remaining</th>
                            <th className="py-1.5 px-2">Date</th>
                            <th className="py-1.5 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userBatches.slice(0, 2).map((b) => (
                            <tr key={b.id} className="border-b border-[#21262D]/40 hover:bg-[#12171F]">
                              <td className="py-1.5 px-2 font-mono text-[#8B949E]">{b.id}</td>
                              <td className="py-1.5 px-2 text-[#E6EDF3] max-w-[160px] truncate">{b.fileName}</td>
                              <td className="py-1.5 px-2">
                                <span
                                  className={`text-[9.5px] uppercase px-1.5 py-0.5 rounded border ${
                                    b.dataType === 'email'
                                      ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]/40'
                                      : 'bg-[#12171F] text-[#22C55E] border-[#22C55E]/40'
                                  }`}
                                >
                                  {b.dataType}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 font-mono text-[#E6EDF3]">{b.totalAllocated}</td>
                              <td className="py-1.5 px-2 font-mono text-[#22C55E]">{b.usedCount}</td>
                              <td className="py-1.5 px-2 font-mono text-[#38BDF8]">{b.remainingToUse}</td>
                              <td className="py-1.5 px-2 text-[#8B949E]">{b.collectedAt}</td>
                              <td className="py-1.5 px-2 text-right">
                                <div className="inline-flex items-center gap-1.5 relative">
                                  {/* View Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setViewingBatchRecords(b);
                                      setPreviewSearch('');
                                      setPreviewCopied(false);
                                    }}
                                    className="vib-btn-sm bg-[#12171F] hover:bg-[#1C2331] text-[#38BDF8] border border-[#30363D] flex items-center gap-1"
                                    title="View & Preview all records"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>

                                  {/* Export Dropdown Button */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveExportDropdownId(activeExportDropdownId === b.id ? null : b.id)
                                      }
                                      className="vib-btn-sm bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3 text-[#38BDF8]" />
                                      <span>Export</span>
                                      <ChevronDown className="w-3 h-3 text-[#8B949E]" />
                                    </button>

                                    {activeExportDropdownId === b.id && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-20"
                                          onClick={() => setActiveExportDropdownId(null)}
                                        />
                                        <div className="absolute right-0 top-full mt-1 w-36 bg-[#161B22] border border-[#30363D] rounded-[6px] shadow-xl py-1 z-30 text-left">
                                          <button
                                            type="button"
                                            onClick={() => handleExportBatch(b, 'txt')}
                                            className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                                          >
                                            <FileText className="w-3 h-3 text-[#8B949E]" />
                                            <span>Plain TXT (.txt)</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleExportBatch(b, 'csv')}
                                            className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                                          >
                                            <Database className="w-3 h-3 text-[#8B949E]" />
                                            <span>CSV File (.csv)</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleExportBatch(b, 'excel')}
                                            className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                                          >
                                            <FileSpreadsheet className="w-3 h-3 text-[#22C55E]" />
                                            <span>Excel Sheet (.xls)</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            
            {/* Top Section: Podium & Rewards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Podium (Gamified) spans 2 columns */}
                <div className="lg:col-span-2 bg-[#161B22] border border-[#30363D] rounded-[8px] p-5 pt-8 flex flex-col justify-end relative min-h-[300px] overflow-hidden">
                    {/* Decor background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
                    
                    <div className="flex items-end justify-center gap-3 sm:gap-6 z-10 w-full">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center flex-1 max-w-[100px]">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[1]?.userName || 'user2'}`} className="w-11 h-11 bg-[#12171F] rounded-full border-2 border-[#9CA3AF] mb-1.5 shrink-0" alt="2nd place" />
                            <span className="text-[11.5px] font-light text-[#D1D5DB] mb-1 truncate max-w-[90px] text-center">{leaderboard[1]?.userName || '-'}</span>
                            <div className="w-full h-20 bg-[#12171F] border border-[#9CA3AF]/40 flex flex-col items-center justify-start pt-2.5 rounded-t-lg">
                                <span className="text-[#9CA3AF] text-lg font-light">2</span>
                                <span className="text-[10px] text-[#8B949E] mt-1 font-mono">{leaderboard[1]?.totalCollected?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                        
                        {/* 1st Place */}
                        <div className="flex flex-col items-center flex-1 max-w-[110px]">
                            <Crown className="text-[#FBBF24] w-5 h-5 mb-1 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[0]?.userName || 'user1'}`} className="w-13 h-13 bg-[#12171F] rounded-full border-2 border-[#FBBF24] mb-1.5 shrink-0" alt="1st place" />
                            <span className="text-[12.5px] font-normal text-white mb-1 truncate max-w-[100px] text-center">{leaderboard[0]?.userName || '-'}</span>
                            <div className="w-full h-28 bg-[#EAB308]/10 border border-[#FBBF24]/50 flex flex-col items-center justify-start pt-2.5 rounded-t-lg shadow-sm">
                                <span className="text-[#FBBF24] text-2xl font-light">1</span>
                                <span className="text-[11px] text-[#FEF08A] mt-1.5 font-mono">{leaderboard[0]?.totalCollected?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center flex-1 max-w-[100px]">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[2]?.userName || 'user3'}`} className="w-11 h-11 bg-[#12171F] rounded-full border-2 border-[#D97706] mb-1.5 shrink-0" alt="3rd place" />
                            <span className="text-[11.5px] font-light text-[#D1D5DB] mb-1 flex items-center justify-center truncate max-w-[90px] text-center">
                                {leaderboard[2]?.userName || '-'} 
                                {leaderboard[2]?.userId === user.id && <span className="ml-1 px-1 bg-blue-500/20 text-[#38BDF8] text-[9px] rounded">You</span>}
                            </span>
                            <div className="w-full h-16 bg-[#12171F] border border-[#D97706]/40 flex flex-col items-center justify-start pt-2 rounded-t-lg">
                                <span className="text-[#D97706] text-lg font-light">3</span>
                                <span className="text-[10px] text-[#8B949E] mt-1 font-mono">{leaderboard[2]?.totalCollected?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performers Widget (Compact UI) */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[13px] font-light text-[#E6EDF3] flex items-center">
                            <Zap className="w-3.5 h-3.5 text-[#38BDF8] mr-1.5" /> Top Performers
                        </h2>
                        <span className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20 font-mono">Elite</span>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                        {leaderboard.slice(0, 3).map((entry, idx) => (
                            <div key={entry.userId} className="flex justify-between items-center bg-[#12171F] p-2 rounded-[6px] border border-[#21262D]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={`text-[11px] font-light w-4 text-center shrink-0 ${idx === 0 ? 'text-[#FBBF24]' : idx === 1 ? 'text-[#9CA3AF]' : 'text-[#D97706]'}`}>#{idx + 1}</span>
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userName}`} className="w-6 h-6 rounded-full bg-[#161B22] border border-[#30363D] shrink-0" alt="" />
                                    <span className="text-[12px] text-[#C9D1D9] font-light truncate">{entry.userName}</span>
                                </div>
                                <div className="flex flex-col items-end shrink-0 pl-2">
                                    <span className="text-[11.5px] font-mono text-[#22C55E]">{entry.totalCollected.toLocaleString()}</span>
                                    <span className="text-[9.5px] text-[#8B949E]">Collected</span>
                                </div>
                            </div>
                        ))}
                        {leaderboard.length < 3 && (
                            <div className="text-[11px] text-[#6E7681] italic px-2">More workers needed...</div>
                        )}
                    </div>
                </div>
            </div>
            {/* Bottom Section: Compact Data Table */}
            <div className="bg-[#111827]/70 backdrop-blur-md border border-[#1f2937] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-1px_rgba(0,0,0,0.3)] rounded-[8px] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f2937] flex justify-between items-center bg-[#111827]/50">
                    <h3 className="text-xs font-light text-[#e5e7eb]">Live Rankings</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-center text-[12px] uppercase tracking-wider text-[#9ca3af] border-b border-[#374151] bg-[#1f2937]/40 w-16">Rank</th>
                                <th className="px-3 py-2 text-[12px] uppercase tracking-wider text-[#9ca3af] border-b border-[#374151] bg-[#1f2937]/40">User Name</th>
                                <th className="px-3 py-2 text-[12px] uppercase tracking-wider text-[#9ca3af] border-b border-[#374151] bg-[#1f2937]/40 text-right">Total Collected</th>
                                <th className="px-3 py-2 text-[12px] uppercase tracking-wider text-[#9ca3af] border-b border-[#374151] bg-[#1f2937]/40 text-right">Total Uses Data</th>
                                <th className="px-3 py-2 text-[12px] uppercase tracking-wider text-[#9ca3af] border-b border-[#374151] bg-[#1f2937]/40 text-right">Submit Jobs</th>
                                <th className="px-3 py-2 text-center text-[12px] uppercase tracking-wider text-[#9ca3af] border-b border-[#374151] bg-[#1f2937]/40 w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry) => (
                                <tr key={entry.userId} className="hover:bg-[#374151]/30 transition-colors">
                                    <td className="px-3 py-2 text-center border-b border-[#374151]">
                                        <span className={`font-light ${entry.rank === 1 ? 'text-[#facc15]' : entry.rank === 2 ? 'text-[#9ca3af]' : entry.rank === 3 ? 'text-[#d97706]' : 'text-[#d1d5db]'}`}>
                                            {entry.rank}

                                    </span>
                                    </td>
                                    <td className="px-3 py-2 border-b border-[#374151]">
                                        <div className="flex items-center">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userName}`} className="w-6 h-6 rounded-full bg-[#1f2937] mr-2 border border-[#374151]" />
                                            <span className="font-light text-white">{entry.userName}</span>
                                            {entry.userId === user.id && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded bg-[#374151] text-[#d1d5db] text-[9px] border border-[#4b5563]">You</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#d1d5db] border-b border-[#374151]">{entry.totalCollected.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-mono text-[#60a5fa] border-b border-[#374151]">{entry.totalUsed.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-mono text-[#4ade80] border-b border-[#374151]">{entry.totalSubmissions}</td>
                                    <td className="px-3 py-2 text-center border-b border-[#374151]">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-light bg-[#14532d]/30 text-[#4ade80] border border-[#166534]/50">Active</span>
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
            TAB 5: JOB SUBMIT (Proof Submission)
        ======================================================== */}
        {activeTab === 'submit' && (
          <div className="space-y-3">
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4">

              {submitMsg && (
                <div
                  className={`mb-3 p-2.5 rounded-[6px] text-[11.5px] border ${
                    submitMsg.type === 'success'
                      ? 'bg-[#0C2117] border-[#124D31] text-[#4ADE80]'
                      : 'bg-[#280D12] border-[#5C1D24] text-[#F87171]'
                  }`}
                >
                  {submitMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmitJob} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium">Select Job</label>
                  <select
                    value={submitJobId}
                    onChange={(e) => setSubmitJobId(e.target.value)}
                    required
                    className="vib-input"
                  >
                    <option value="">-- Choose Job --</option>
                    {jobs.filter(j => j.status === 'active').map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} (${j.payoutPerUnit} / unit)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pre-filled default user statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium">
                      Total Collected Data (Default Set)
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={user.totalCollectedData}
                      className="vib-input bg-[#11161D] text-[#8B949E] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium">
                      Total Downloaded / Used Data
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={user.totalUsedData}
                      className="vib-input bg-[#11161D] text-[#38BDF8] cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                {/* User Input Counts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium">
                      Success Send Count
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={submitSuccessCount}
                      onChange={(e) => setSubmitSuccessCount(Number(e.target.value))}
                      placeholder="e.g. 250"
                      className="vib-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium">
                      Failed / Bounced Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={submitFailedCount}
                      onChange={(e) => setSubmitFailedCount(Number(e.target.value))}
                      placeholder="e.g. 5"
                      className="vib-input font-mono"
                    />
                  </div>
                </div>

                {/* Proof Notes */}
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium">
                    Proof Notes &amp; Dispatch Log Details
                  </label>
                  <textarea
                    rows={2}
                    value={submitProofNotes}
                    onChange={(e) => setSubmitProofNotes(e.target.value)}
                    placeholder="Sent via SMTP port 587, 0 spam bounces, logs verified..."
                    className="vib-input min-h-[50px] py-1.5"
                  />
                </div>

                {/* File Upload Zone */}
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1.5 font-medium flex items-center justify-between">
                    <span>Upload Proof Screenshots (Multiple)</span>
                    {submitProofFiles.length > 0 && (
                      <span className="text-[#38BDF8] text-[10px] bg-[#12171F] px-2 py-0.5 rounded-full border border-[#21262D]">
                        {submitProofFiles.length} file(s) selected</span>

                    )}
                  </label>
                  
                  <div className="relative group overflow-hidden">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.csv,.txt"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSubmitProofFiles(Array.from(e.target.files));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center border border-dashed border-[#30363D] group-hover:border-[#38BDF8] group-hover:bg-[#12171F] rounded-[8px] bg-[#0D1117] py-6 transition-all duration-300">
                      <div className="w-10 h-10 rounded-full bg-[#161B22] border border-[#21262D] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4 text-[#8B949E] group-hover:text-[#38BDF8] transition-colors" />
                      </div>
                      <span className="text-[12px] text-[#C9D1D9] font-medium">Click or drag files to upload</span>
                    </div>
                  </div>

                  {/* Selected Files List */}
                  {submitProofFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {submitProofFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#12171F] border border-[#21262D] rounded-[6px] px-3 py-2 hover:border-[#30363D] transition-colors">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-6 h-6 rounded bg-[#0D1117] border border-[#30363D] flex items-center justify-center shrink-0">
                              <ImageIcon className="w-3 h-3 text-[#38BDF8]" />
                            </div>
                            <span className="text-[11px] text-[#E6EDF3] truncate font-mono">{f.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubmitProofFiles(submitProofFiles.filter((_, idx) => idx !== i))}
                            className="w-6 h-6 rounded hover:bg-[#280D12] text-[#8B949E] hover:text-[#F87171] border border-transparent hover:border-[#5C1D24] transition-colors p-0 flex items-center justify-center shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="vib-btn-sm h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] w-full text-[13px] font-medium mt-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  {submitLoading ? 'Submitting...' : 'Submit Job Proof'}
                </button>
              </form>
            </div>

            {/* Submissions History Table */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 space-y-2">

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#21262D] text-[#8B949E] text-[10px]">
                      <th className="py-1 px-2">ID</th>
                      <th className="py-1 px-2">Job Title</th>
                      <th className="py-1 px-2 font-mono">Success</th>
                      <th className="py-1 px-2 font-mono">Failed</th>
                      <th className="py-1 px-2">Time</th>
                      <th className="py-1 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-[#21262D]/40">
                        <td className="py-1.5 px-2 font-mono text-[#8B949E]">{s.id}</td>
                        <td className="py-1.5 px-2 text-[#E6EDF3] max-w-[200px] truncate">{s.jobTitle}</td>
                        <td className="py-1.5 px-2 font-mono text-[#22C55E]">{s.successCount}</td>
                        <td className="py-1.5 px-2 font-mono text-[#EF4444]">{s.failedCount}</td>
                        <td className="py-1.5 px-2 text-[#8B949E]">{s.submittedAt}</td>
                        <td className="py-1.5 px-2 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                              s.status === 'approved'
                                ? 'bg-[#0C2117] text-[#4ADE80] border border-[#124D31]'
                                : s.status === 'rejected'
                                ? 'bg-[#280D12] text-[#F87171] border border-[#5C1D24]'
                                : 'bg-[#12171F] text-[#F59E0B] border border-[#523912]'
                            }`}
                          >
                            {s.status}

                        </span>
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
            TAB 6: TUTORIALS (YouTube-like video cards + search)
        ======================================================== */}
        {activeTab === 'tutorial' && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] rounded-[8px] p-2">
              <Search className="w-3.5 h-3.5 text-[#8B949E] ml-1" />
              <input
                type="text"
                value={tutorialSearch}
                onChange={(e) => setTutorialSearch(e.target.value)}
                placeholder="Search tutorials by title, category, or instructions..."
                className="bg-transparent text-[12px] text-[#E6EDF3] w-full focus:outline-none"
              />
            </div>

            {/* Video Player Modal / Active View if selected */}
            {selectedVideo && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#E6EDF3] font-light">{selectedVideo.title}</span>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3]"
                  >
                    Close Player &times;
                  </button>
                </div>
                <div className="aspect-video w-full rounded-[6px] overflow-hidden bg-black">
                  <iframe
                    src={getEmbedVideoUrl(selectedVideo.videoUrl)}
                    title={selectedVideo.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
                <p className="text-[11.5px] text-[#8B949E]">{selectedVideo.instructions}</p>
              </div>
            )}

            {/* Grid of Tutorial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tutorials
                .filter(
                  (t) =>
                    t.title.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
                    t.category.toLowerCase().includes(tutorialSearch.toLowerCase())
                )
                .map((tut) => (
                  <div
                    key={tut.id}
                    onClick={() => setSelectedVideo(tut)}
                    className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 cursor-pointer hover:border-[#38BDF8] transition-colors flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-video rounded-[6px] bg-[#0B0F17] flex items-center justify-center mb-2 border border-[#21262D] overflow-hidden">
                        {tut.thumbnailUrl ? (
                          <>
                            <img src={tut.thumbnailUrl} alt={tut.title} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 group-hover:bg-[#2563EB]/80 transition-colors">
                                <Play className="w-4 h-4 ml-1" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#2563EB]/80 flex items-center justify-center text-white z-10 group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          </div>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 text-[9.5px] font-mono px-1 rounded bg-black/80 text-white z-10">
                          {tut.duration}
</span>
                      </div>
                      <span className="text-[9.5px] uppercase font-mono text-[#38BDF8]">{tut.category}</span>
                      <h4 className="text-[12px] text-[#E6EDF3] font-light leading-tight mt-0.5 line-clamp-2">
                        {tut.title}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#21262D] text-[10px] text-[#8B949E] flex justify-between">
                      <span>Added: {tut.createdAt}</span>
                      <span className="text-[#38BDF8]">Watch &rarr;</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: TOOLS (Admin listed tools + Interactive utilities)
        ======================================================== */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            
            {/* Header, Search Box, and Sub-Tab Navigation in Single Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-[14px] text-[#E6EDF3] font-light shrink-0">Tools</h3>
              </div>

              {/* Search Box */}
              <div className="relative flex items-center flex-1 max-w-[280px]">
                <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={toolsSubTab === 'public' ? "Search public tools..." : "Search tools..."}
                  value={toolSearchQuery}
                  onChange={(e) => setToolSearchQuery(e.target.value)}
                  className="vib-input pl-9 py-1.5 w-full"
                />
              </div>
              
              {/* Sub Tab Controls (Public | Internal) */}
              <div className="flex items-center p-1 bg-[#0B0F17] border border-[#21262D] rounded-[8px] shrink-0">
                <button
                  onClick={() => {
                    setToolsSubTab('public');
                    setToolSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-[6px] text-[11px] font-light transition-all ${
                    toolsSubTab === 'public'
                      ? 'bg-[#161B22] text-[#38BDF8] shadow-sm border border-[#30363D]'
                      : 'text-[#8B949E] hover:text-[#E6EDF3] border border-transparent'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => {
                    setToolsSubTab('internal');
                    setToolSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-[6px] text-[11px] font-light transition-all ${
                    toolsSubTab === 'internal'
                      ? 'bg-[#161B22] text-[#38BDF8] shadow-sm border border-[#30363D]'
                      : 'text-[#8B949E] hover:text-[#E6EDF3] border border-transparent'
                  }`}
                >
                  Internal
                </button>
              </div>
            </div>

            {/* Content Container */}
            {toolsSubTab === 'public' ? (
              /* --- PUBLIC TOOLS (External tools from DB) --- */
              <div className="space-y-4">
                {/* Tools Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools
                    .filter((t) => !t.isInternal && t.status !== 'inactive')
                    .filter((t) => !toolSearchQuery.trim() || t.name.toLowerCase().includes(toolSearchQuery.trim().toLowerCase()) || (t.category && t.category.toLowerCase().includes(toolSearchQuery.trim().toLowerCase())))
                    .map((item) => (
                      <div key={item.id} className="group relative bg-[#161B22] border border-[#30363D] hover:border-[#38BDF8]/40 rounded-[12px] p-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(56,189,248,0.07)] flex flex-col h-full overflow-hidden">
                        
                        {/* Header: Icon + Title */}
                        <div className="flex items-start gap-3 mb-4 pr-10">
                          <div className="w-12 h-12 shrink-0 rounded-[10px] bg-[#0B0F17] border border-[#30363D] overflow-hidden flex items-center justify-center shadow-inner group-hover:border-[#38BDF8]/30 transition-colors">
                            {item.iconUrl ? (
                              <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Wrench className="w-6 h-6 text-[#8B949E] group-hover:text-[#38BDF8] transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="text-[14px] text-[#E6EDF3] font-normal truncate group-hover:text-[#38BDF8] transition-colors" title={item.name}>
                              {item.name}
                            </h4>
                            <div className="text-[11px] text-[#38BDF8] font-mono mt-0.5 truncate" title={item.category || 'Utility'}>
                              {item.category || 'Utility'}
                            </div>
                          </div>
                        </div>

                        {/* Body: Instructions / Description */}
                        <div className="flex-1 mb-4">
                            
                        </div>

                        {/* Footer: Action Button */}
                        <div className="pt-3 border-t border-[#30363D]/50 flex items-center justify-end">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#12171F] hover:bg-[#2563EB] text-[#38BDF8] hover:text-white border border-[#30363D] hover:border-[#2563EB] rounded-full px-5 py-1.5 transition-all font-light text-[11px] flex items-center gap-1.5"
                          >
                            <span>Launch</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                  ))}
                </div>

                {tools.filter((t) => !t.isInternal && t.status !== 'inactive').filter((t) => !toolSearchQuery.trim() || t.name.toLowerCase().includes(toolSearchQuery.trim().toLowerCase()) || (t.category && t.category.toLowerCase().includes(toolSearchQuery.trim().toLowerCase()))).length === 0 && (
                  <div className="text-center py-16 bg-[#161B22] border border-[#30363D] rounded-[12px]">
                    <Wrench className="w-10 h-10 mx-auto text-[#30363D] mb-3" />
                    <h3 className="text-[14px] text-[#E6EDF3] font-light mb-1">No public tools found</h3>
                  </div>
                )}
              </div>
            ) : (
              /* --- INTERNAL TOOLS (Interactive built-in tools) --- */
              <div className="space-y-4">
                
                {/* Internal Tools Navigation Menu */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[12px] p-2 overflow-x-auto custom-scrollbar">
                  <div className="flex items-center min-w-max gap-2">
                    <button
                      onClick={() => {
                        setToolTab('emailCleaner');
                        setToolOutput('');
                      }}
                      className={`px-4 py-2 rounded-[8px] text-[12px] font-light transition-all flex items-center gap-2 ${
                        toolTab === 'emailCleaner'
                          ? 'bg-[#12171F] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                          : 'text-[#8B949E] border border-transparent hover:text-[#E6EDF3] hover:bg-[#1C2128]'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email Duplicate &amp; MX Cleaner
                    </button>
                    <button
                      onClick={() => {
                        setToolTab('phoneCleaner');
                        setToolOutput('');
                      }}
                      className={`px-4 py-2 rounded-[8px] text-[12px] font-light transition-all flex items-center gap-2 ${
                        toolTab === 'phoneCleaner'
                          ? 'bg-[#12171F] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                          : 'text-[#8B949E] border border-transparent hover:text-[#E6EDF3] hover:bg-[#1C2128]'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      Phone E.164 Formatter
                    </button>
                    <button
                      onClick={() => {
                        setToolTab('spamChecker');
                        setToolOutput('');
                      }}
                      className={`px-4 py-2 rounded-[8px] text-[12px] font-light transition-all flex items-center gap-2 ${
                        toolTab === 'spamChecker'
                          ? 'bg-[#12171F] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                          : 'text-[#8B949E] border border-transparent hover:text-[#E6EDF3] hover:bg-[#1C2128]'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Spam Trigger Scanner
                    </button>
                  </div>
                </div>

                {/* Internal Tool Engine UI */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-[12px] p-5 shadow-sm">
                  
                  {/* Tool Explanation */}
                  <div className="mb-5 border-b border-[#21262D] pb-4">
                    <h4 className="text-[14px] text-[#E6EDF3] font-light flex items-center gap-2">
                      {toolTab === 'emailCleaner' && <><Mail className="w-4 h-4 text-[#38BDF8]" /> Email Duplicate &amp; MX Cleaner</>}
                      {toolTab === 'phoneCleaner' && <><Phone className="w-4 h-4 text-[#38BDF8]" /> Phone E.164 Formatter</>}
                      {toolTab === 'spamChecker' && <><ShieldAlert className="w-4 h-4 text-[#38BDF8]" /> Spam Trigger Scanner</>}
                    </h4>
                      {toolTab === 'emailCleaner' && "Paste a list of email addresses. This tool removes exact duplicates, fixes bad formatting, and extracts domains to a clean list."}
                      {toolTab === 'phoneCleaner' && "Paste raw phone numbers. Formats to standard international E.164 format, removing dashes and brackets automatically."}
                      {toolTab === 'spamChecker' && "Paste email copy or SMS text. Scans against 250+ known spam trigger phrases that degrade delivery rates."}

                  </div>

                  {toolTab === 'emailCleaner' ? (
                    <div className="space-y-5">
                      {/* Side-by-side 2-column compact grid for Input TextArea & File Upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Column 1: Input TextArea */}
                        <div className="flex flex-col bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3.5">
                          <label className="flex items-center justify-between text-[11.5px] font-light text-[#E6EDF3] mb-2">
                            <span>Manual Text Input</span>
                            <span className="text-[#8B949E] font-mono text-[10px]">Paste raw emails</span>
                          </label>
                          <textarea
                            value={toolInput}
                            onChange={(e) => setToolInput(e.target.value)}
                            placeholder="john@domain.com\nsmith@corp.com\njohn@domain.com\ninvalid-email"
                            className="w-full bg-[#161B22] border border-[#30363D] rounded-[6px] p-2.5 text-[11.5px] text-[#C9D1D9] font-mono placeholder-[#484F58] focus:outline-none focus:border-[#38BDF8] resize-none h-[140px]"
                          />
                        </div>

                        {/* Column 2: File Upload (.txt, .csv, .xlsx) */}
                        <div className="flex flex-col bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3.5">
                          <label className="flex items-center justify-between text-[11.5px] font-light text-[#E6EDF3] mb-2">
                            <span>File Upload (.txt, .csv, .xlsx)</span>
                            <span className="text-[#8B949E] font-mono text-[10px]">Auto-append lines</span>
                          </label>
                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#30363D] hover:border-[#38BDF8]/50 rounded-[6px] p-4 text-center bg-[#161B22] transition-colors relative cursor-pointer">
                            <input
                              type="file"
                              accept=".txt,.csv,.xlsx,.xls"
                              onChange={handleToolFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload className="w-5 h-5 text-[#38BDF8] mb-1.5" />
                            <div className="text-[12px] text-[#E6EDF3] font-light">Click or drop file here</div>
                            <div className="text-[10px] text-[#8B949E] mt-0.5">Supports TXT, CSV, Excel records</div>
                          </div>
                        </div>
                      </div>

                      {/* Execute Processor Button */}
                      <button
                        onClick={runTool}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-[8px] font-light text-[12.5px] transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        Execute Email Duplicate &amp; MX Cleaner Engine
                      </button>

                      {/* Status Cards & Reports (No Result Textarea) */}
                      {cleanerReport && (
                        <div className="space-y-4 pt-3 border-t border-[#21262D]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-[13px] text-[#E6EDF3] font-light flex items-center gap-2">
                              <Check className="w-4 h-4 text-[#22C55E]" />
                              Processor Report &amp; MX Analysis
                            </h4>
                            
                            {/* Export Action Bar */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => exportCleanerResults('txt')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#38BDF8] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export TXT
                              </button>
                              <button
                                onClick={() => exportCleanerResults('csv')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#22C55E] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export CSV
                              </button>
                              <button
                                onClick={() => exportCleanerResults('xls')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#F59E0B] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export Excel
                              </button>
                              <button
                                onClick={copyCleanerResultsToClipboard}
                                className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                Copy to Clipboard
                              </button>
                            </div>
                          </div>

                          {/* 4 Status Cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Total Processed</div>
                              <div className="text-[18px] text-[#E6EDF3] font-mono">{cleanerReport.total}</div>
                              <div className="text-[10px] text-[#8B949E] mt-0.5">Input lines parsed</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Valid MX Emails</div>
                              <div className="text-[18px] text-[#22C55E] font-mono">{cleanerReport.valid}</div>
                              <div className="text-[10px] text-[#22C55E] mt-0.5">Ready for dispatch</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Duplicates Removed</div>
                              <div className="text-[18px] text-[#F59E0B] font-mono">{cleanerReport.duplicates}</div>
                              <div className="text-[10px] text-[#F59E0B] mt-0.5">Exact matches dropped</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Invalid / Disposable</div>
                              <div className="text-[18px] text-[#EF4444] font-mono">{cleanerReport.invalid + cleanerReport.disposable}</div>
                              <div className="text-[10px] text-[#EF4444] mt-0.5">Syntax errors &amp; trash</div>
                            </div>
                          </div>

                          {/* Domain breakdown summary */}
                          <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3 space-y-2">
                            <h5 className="text-[11.5px] text-[#E6EDF3] font-light">Top Valid Domains Breakdown</h5>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(cleanerReport.domainStats).slice(0, 8).map(([dom, count]) => (
                                <span key={dom} className="px-2 py-1 bg-[#161B22] border border-[#30363D] rounded text-[10.5px] font-mono text-[#38BDF8]">
                                  @{dom}: <strong className="text-[#E6EDF3]">{count}</strong>
                                </span>
                              ))}
                              {Object.keys(cleanerReport.domainStats).length === 0 && (
                                <span className="text-[11px] text-[#8B949E]">No valid domains found yet.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : toolTab === 'phoneCleaner' ? (
                    <div className="space-y-5">
                      {/* Side-by-side 2-column compact grid for Input TextArea & File Upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Column 1: Input TextArea */}
                        <div className="flex flex-col bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3.5">
                          <label className="flex items-center justify-between text-[11.5px] font-light text-[#E6EDF3] mb-2">
                            <span>Manual Text Input</span>
                            <span className="text-[#8B949E] font-mono text-[10px]">Paste raw phone numbers</span>
                          </label>
                          <textarea
                            value={toolInput}
                            onChange={(e) => setToolInput(e.target.value)}
                            placeholder="01711223344&#10;+1 (800) 555-0199&#10;447911123401"
                            className="w-full bg-[#161B22] border border-[#30363D] rounded-[6px] p-2.5 text-[11.5px] text-[#C9D1D9] font-mono placeholder-[#484F58] focus:outline-none focus:border-[#38BDF8] resize-none h-[140px]"
                          />
                        </div>

                        {/* Column 2: File Upload (.txt, .csv, .xlsx) */}
                        <div className="flex flex-col bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3.5">
                          <label className="flex items-center justify-between text-[11.5px] font-light text-[#E6EDF3] mb-2">
                            <span>File Upload (.txt, .csv, .xlsx)</span>
                            <span className="text-[#8B949E] font-mono text-[10px]">Auto-append lines</span>
                          </label>
                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#30363D] hover:border-[#38BDF8]/50 rounded-[6px] p-4 text-center bg-[#161B22] transition-colors relative cursor-pointer">
                            <input
                              type="file"
                              accept=".txt,.csv,.xlsx,.xls"
                              onChange={handleToolFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload className="w-5 h-5 text-[#38BDF8] mb-1.5" />
                            <div className="text-[12px] text-[#E6EDF3] font-light">Click or drop file here</div>
                            <div className="text-[10px] text-[#8B949E] mt-0.5">Supports TXT, CSV, Excel records</div>
                          </div>
                        </div>
                      </div>

                      {/* Execute Processor Button */}
                      <button
                        onClick={runTool}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-[8px] font-light text-[12.5px] transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        Execute Phone E.164 Formatter Engine
                      </button>

                      {/* Status Cards & Reports */}
                      {phoneReport && (
                        <div className="space-y-4 pt-3 border-t border-[#21262D]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-[13px] text-[#E6EDF3] font-light flex items-center gap-2">
                              <Check className="w-4 h-4 text-[#22C55E]" />
                              Formatter Report &amp; E.164 Analysis
                            </h4>
                            
                            {/* Export Action Bar */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => exportPhoneResults('txt')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#38BDF8] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export TXT
                              </button>
                              <button
                                onClick={() => exportPhoneResults('csv')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#22C55E] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export CSV
                              </button>
                              <button
                                onClick={() => exportPhoneResults('xls')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#F59E0B] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export Excel
                              </button>
                              <button
                                onClick={copyPhoneResultsToClipboard}
                                className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                Copy to Clipboard
                              </button>
                            </div>
                          </div>

                          {/* 3 Status Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Total Processed</div>
                              <div className="text-[18px] text-[#E6EDF3] font-mono">{phoneReport.total}</div>
                              <div className="text-[10px] text-[#8B949E] mt-0.5">Input lines parsed</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Valid E.164 Phones</div>
                              <div className="text-[18px] text-[#22C55E] font-mono">{phoneReport.valid}</div>
                              <div className="text-[10px] text-[#22C55E] mt-0.5">Internationally formatted</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Invalid / Malformed</div>
                              <div className="text-[18px] text-[#EF4444] font-mono">{phoneReport.invalid}</div>
                              <div className="text-[10px] text-[#EF4444] mt-0.5">Length &amp; digit errors</div>
                            </div>
                          </div>

                          {/* Prefix breakdown summary */}
                          <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3 space-y-2">
                            <h5 className="text-[11.5px] text-[#E6EDF3] font-light">International Country Prefixes Breakdown</h5>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(phoneReport.prefixStats).slice(0, 8).map(([pref, count]) => (
                                <span key={pref} className="px-2 py-1 bg-[#161B22] border border-[#30363D] rounded text-[10.5px] font-mono text-[#38BDF8]">
                                  {pref}*: <strong className="text-[#E6EDF3]">{count}</strong>
                                </span>
                              ))}
                              {Object.keys(phoneReport.prefixStats).length === 0 && (
                                <span className="text-[11px] text-[#8B949E]">No valid prefixes found yet.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Side-by-side 2-column compact grid for Input TextArea & File Upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Column 1: Input TextArea */}
                        <div className="flex flex-col bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3.5">
                          <label className="flex items-center justify-between text-[11.5px] font-light text-[#E6EDF3] mb-2">
                            <span>Manual Copy / Email Text Input</span>
                            <span className="text-[#8B949E] font-mono text-[10px]">Paste marketing copy</span>
                          </label>
                          <textarea
                            value={toolInput}
                            onChange={(e) => setToolInput(e.target.value)}
                            placeholder="Congratulations! You won a 100% free cash bonus. Act now urgent, limited time offer!"
                            className="w-full bg-[#161B22] border border-[#30363D] rounded-[6px] p-2.5 text-[11.5px] text-[#C9D1D9] font-mono placeholder-[#484F58] focus:outline-none focus:border-[#38BDF8] resize-none h-[140px]"
                          />
                        </div>

                        {/* Column 2: File Upload (.txt, .csv, .docx) */}
                        <div className="flex flex-col bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3.5">
                          <label className="flex items-center justify-between text-[11.5px] font-light text-[#E6EDF3] mb-2">
                            <span>File Upload (.txt, .csv, .docx)</span>
                            <span className="text-[#8B949E] font-mono text-[10px]">Auto-append text</span>
                          </label>
                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#30363D] hover:border-[#38BDF8]/50 rounded-[6px] p-4 text-center bg-[#161B22] transition-colors relative cursor-pointer">
                            <input
                              type="file"
                              accept=".txt,.csv,.docx,.doc,.rtf"
                              onChange={handleToolFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload className="w-5 h-5 text-[#38BDF8] mb-1.5" />
                            <div className="text-[12px] text-[#E6EDF3] font-light">Click or drop file here</div>
                            <div className="text-[10px] text-[#8B949E] mt-0.5">Supports TXT, CSV, document records</div>
                          </div>
                        </div>
                      </div>

                      {/* Execute Processor Button */}
                      <button
                        onClick={runTool}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-[8px] font-light text-[12.5px] transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        Execute Spam Trigger Scan Engine
                      </button>

                      {/* Status Cards & Reports */}
                      {spamReport && (
                        <div className="space-y-4 pt-3 border-t border-[#21262D]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-[13px] text-[#E6EDF3] font-light flex items-center gap-2">
                              <Check className="w-4 h-4 text-[#22C55E]" />
                              Spam Audit &amp; Risk Report
                            </h4>
                            
                            {/* Export Action Bar */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => exportSpamResults('txt')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#38BDF8] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export TXT
                              </button>
                              <button
                                onClick={() => exportSpamResults('csv')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#22C55E] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export CSV
                              </button>
                              <button
                                onClick={() => exportSpamResults('xls')}
                                className="px-2.5 py-1 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#F59E0B] text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Export Excel
                              </button>
                              <button
                                onClick={copySpamResultsToClipboard}
                                className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] rounded-[6px] font-light flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                Copy Report
                              </button>
                            </div>
                          </div>

                          {/* 3 Status Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Spam Risk Score</div>
                              <div className={`text-[18px] font-mono ${spamReport.riskScore > 40 ? 'text-[#EF4444]' : spamReport.riskScore > 15 ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                                {spamReport.riskScore}%
                              </div>
                              <div className="text-[10px] text-[#8B949E] mt-0.5">Inbox delivery risk</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Triggers Detected</div>
                              <div className="text-[18px] text-[#F59E0B] font-mono">{spamReport.triggerCount}</div>
                              <div className="text-[10px] text-[#F59E0B] mt-0.5">High-risk phrases</div>
                            </div>
                            <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3">
                              <div className="text-[11px] text-[#8B949E] mb-1">Total Word Count</div>
                              <div className="text-[18px] text-[#E6EDF3] font-mono">{spamReport.totalWords}</div>
                              <div className="text-[10px] text-[#8B949E] mt-0.5">{spamReport.readabilityScore}</div>
                            </div>
                          </div>

                          {/* Trigger phrases breakdown summary */}
                          <div className="bg-[#0D1117] border border-[#30363D] rounded-[8px] p-3 space-y-2">
                            <h5 className="text-[11.5px] text-[#E6EDF3] font-light">Detected Spam Triggers Breakdown</h5>
                            <div className="flex flex-wrap gap-2">
                              {spamReport.triggersFound.map((t) => (
                                <span key={t.word} className={`px-2.5 py-1 rounded text-[10.5px] font-mono border ${
                                  t.severity === 'high' ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]' :
                                  t.severity === 'medium' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]' :
                                  'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
                                }`}>
                                  "{t.word}" ({t.count}x) — <span className="uppercase text-[9px]">{t.severity}</span>
                                </span>
                              ))}
                              {spamReport.triggersFound.length === 0 && (
                                <span className="text-[11px] text-[#22C55E]">🎉 Clean copy! No spam trigger keywords detected.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 8: AUTOMATION (Admin files/scripts to download)
        ======================================================== */}
        {activeTab === 'automation' && (() => {
          const filteredAutomation = automation.filter(t => {
            if (t.status === 'inactive') return false;
            const query = autoSearchQuery.trim().toLowerCase();
            return !query || 
                   t.title.toLowerCase().includes(query) || 
                   t.fileName.toLowerCase().includes(query);
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] text-[#E6EDF3] font-light">Automation Packages</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={autoSearchQuery}
                      onChange={(e) => setAutoSearchQuery(e.target.value)}
                      className="vib-input pl-9 py-1.5 w-[200px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAutomation.map((item) => (
                  <div key={item.id} className="group relative bg-[#161B22] border border-[#30363D] hover:border-[#38BDF8]/40 rounded-[12px] p-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(56,189,248,0.07)] flex flex-col h-full overflow-hidden">
                    
                    {/* Top Right: Status / Version badge */}
                    <div className="absolute top-4 right-4">
                       <span className="uppercase text-[#38BDF8] font-mono text-[9px] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded-sm font-light border border-[#38BDF8]/20">
                         {item.version}
</span>
                    </div>

                    {/* Header: Icon + Title */}
                    <div className="flex items-start gap-3 mb-4 pr-10">
                      <div className="w-12 h-12 shrink-0 rounded-[10px] bg-[#0B0F17] border border-[#30363D] overflow-hidden flex items-center justify-center shadow-inner group-hover:border-[#38BDF8]/30 transition-colors">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <Bot className="w-6 h-6 text-[#8B949E] group-hover:text-[#38BDF8] transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-[14px] text-[#E6EDF3] font-normal truncate group-hover:text-[#38BDF8] transition-colors" title={item.title}>
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-[#8B949E] font-mono mt-0.5 truncate" title={item.fileName}>
                          {item.fileName}
                        </div>
                      </div>
                    </div>

                    {/* Body: Instructions / Description */}
                    <div className="flex-1 mb-4">
                        {item.instructions || "No description provided for this automation package. Click GET to download the executable."}

                    </div>

                    {/* Footer: Size + Action Button */}
                    <div className="pt-3 border-t border-[#30363D]/50 flex items-center justify-between">
                      <span className="text-[11px] text-[#8B949E] font-mono flex items-center gap-1.5">
                        <Download className="w-3 h-3" />
                        {item.fileSize}

                      </span>
                      <button
                        onClick={() => {
                          const content = `DarkDevil Automation Package: ${item.title}\nVersion: ${item.version}\nInstructions: ${item.instructions || 'N/A'}\nUser Token: ${user.id}\nStatus: Active Node`;
                          const blob = new Blob([content], { type: 'application/octet-stream' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = item.fileName;
                          a.click();
                        }}
                        className="bg-[#12171F] hover:bg-[#2563EB] text-[#38BDF8] hover:text-white border border-[#30363D] hover:border-[#2563EB] rounded-full px-5 py-1.5 transition-all font-light text-[11px] flex items-center gap-1.5"
                      >
                        <span>GET</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredAutomation.length === 0 && (
                <div className="text-center py-16 bg-[#161B22] border border-[#30363D] rounded-[12px]">
                  <Bot className="w-10 h-10 mx-auto text-[#30363D] mb-3" />
                  <h3 className="text-[14px] text-[#E6EDF3] font-light mb-1">No packages found</h3>
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================
            TAB: USER PROFILE
        ======================================================== */}
        {activeTab === 'profile' && (
          <UserProfileTab user={user} onRefreshUser={onRefreshUser} />
        )}
      </main>

      {/* ========================================================
          POPUP MODAL: COLLECT DATA
      ======================================================== */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[420px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 text-[#C9D1D9] relative">
            <button
              onClick={() => setIsCollectModalOpen(false)}
              className="absolute top-3 right-3 text-[#8B949E] hover:text-[#E6EDF3]"
            >
              &times;
            </button>

            <h3 className="text-[14px] text-[#E6EDF3] font-light mb-3">Collect Data</h3>

            {collectMsg && (
              <div
                className={`mb-3 p-2 rounded-[6px] text-[11.5px] border ${
                  collectMsg.type === 'success'
                    ? 'bg-[#0C2117] border-[#124D31] text-[#4ADE80]'
                    : 'bg-[#280D12] border-[#5C1D24] text-[#F87171]'
                }`}
              >
                {collectMsg.text}
              </div>
            )}

            <form onSubmit={handleCollectData} className="space-y-3">
              {/* Select Data Type */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Select Data Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCollectType('email');
                      const firstEmail = dataFiles.find((f) => f.dataType === 'email');
                      if (firstEmail) setSelectedFileId(firstEmail.id);
                    }}
                    className={`py-1.5 px-3 rounded-[6px] text-[11.5px] border text-center font-light ${
                      collectType === 'email'
                        ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                        : 'border-[#30363D] text-[#8B949E]'
                    }`}
                  >
                    Email Data
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCollectType('sms');
                      const firstSms = dataFiles.find((f) => f.dataType === 'sms');
                      if (firstSms) setSelectedFileId(firstSms.id);
                    }}
                    className={`py-1.5 px-3 rounded-[6px] text-[11.5px] border text-center font-light ${
                      collectType === 'sms'
                        ? 'bg-[#12171F] text-[#22C55E] border-[#22C55E]'
                        : 'border-[#30363D] text-[#8B949E]'
                    }`}
                  >
                    SMS Data
                  </button>
                </div>
              </div>

              {/* Select Data File: shows fileName - total - collected - remaining */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Select Data File (fileName - total - collected - remaining)
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  required
                  className="vib-input"
                >
                  {dataFiles
                    .filter((f) => f.dataType === collectType)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fileName} (Total: {f.totalCount} - Collected: {f.collectedCount} - Rem: {f.remainingCount})
                      </option>
                    ))}
                </select>
              </div>

              {selectedFile && (
                <div className="p-2 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[10.5px] text-[#8B949E] space-y-0.5 font-mono">
                  <div>Available in File: <strong className="text-[#38BDF8]">{selectedFile.remainingCount}</strong></div>
                  <div>Daily Work Capacity: <strong className="text-[#22C55E]">Unlimited (No Limit)</strong></div>
                </div>
              )}

              {/* Total to Collect */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Total Data Amount to Collect
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedFile ? selectedFile.remainingCount : 5000}
                  value={collectQuantity}
                  onChange={(e) => setCollectQuantity(Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="vib-input font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] border border-[#30363D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collectLoading || !selectedFile || selectedFile.remainingCount <= 0}
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                >
                  {collectLoading ? 'Allocating...' : 'Confirm Collect Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP MODAL: DOWNLOAD / USE COLLECTED DATA
      ======================================================== */}
      {isDownloadModalOpen && selectedBatchForDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[440px] bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 text-[#C9D1D9] relative">
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-3 right-3 text-[#8B949E] hover:text-[#E6EDF3]"
            >
              &times;
            </button>

            <h3 className="text-[14px] text-[#E6EDF3] font-light mb-1">Download Data</h3>
            <div className="text-[11.5px] text-[#8B949E] mb-3">
              Batch: <span className="text-[#E6EDF3] font-mono">{selectedBatchForDownload.fileName}</span> (Available: {selectedBatchForDownload.remainingToUse})
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  How many records do you want to download now?
                </label>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {[10, 20, 50, 100, 250].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDownloadCount(Math.min(preset, selectedBatchForDownload.remainingToUse))}
                      className="px-2 py-0.5 rounded text-[10.5px] bg-[#12171F] border border-[#2A303C] text-[#38BDF8]"
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDownloadCount(selectedBatchForDownload.remainingToUse)}
                    className="px-2 py-0.5 rounded text-[10.5px] bg-[#12171F] border border-[#2A303C] text-[#22C55E]"
                  >
                    All ({selectedBatchForDownload.remainingToUse})
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={selectedBatchForDownload.remainingToUse}
                  value={downloadCount}
                  onChange={(e) => setDownloadCount(Number(e.target.value))}
                  className="vib-input font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Download Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDownloadFormat('txt')}
                    className={`py-1.5 px-3 rounded-[6px] text-[11.5px] border font-light ${
                      downloadFormat === 'txt'
                        ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                        : 'border-[#30363D] text-[#8B949E]'
                    }`}
                  >
                    Plain TXT (1 per line)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadFormat('csv')}
                    className={`py-1.5 px-3 rounded-[6px] text-[11.5px] border font-light ${
                      downloadFormat === 'csv'
                        ? 'bg-[#12171F] text-[#38BDF8] border-[#38BDF8]'
                        : 'border-[#30363D] text-[#8B949E]'
                    }`}
                  >
                    CSV Spreadsheet
                  </button>
                </div>
              </div>

              <div className="p-2 rounded-[6px] bg-[#12171F] border border-[#21262D] text-[10.5px] text-[#8B949E]">
                Notice: Downloading decreases your remaining balance by {downloadCount} and records it under &quot;Used Data&quot;.
              </div>

              {downloadedResult && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#4ADE80]">Downloaded {downloadCount} records:</span>
                    <button
                      type="button"
                      onClick={handleCopyClipboard}
                      className="text-[#38BDF8] hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    readOnly
                    value={downloadedResult}
                    className="vib-input font-mono text-[10.5px] min-h-[90px] py-1.5 bg-[#0B0F17]"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#181F2B] text-[#8B949E] border border-[#30363D]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBatch}
                  disabled={downloadLoading || downloadCount <= 0 || downloadCount > selectedBatchForDownload.remainingToUse}
                  className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB]"
                >
                  {downloadLoading ? 'Processing...' : 'Download & Deduct Balance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP MODAL: VIEW / PREVIEW ALL BATCH DATA SHEET
      ======================================================== */}
      {viewingBatchRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#161B22] border border-[#30363D] rounded-[10px] text-[#C9D1D9] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in-50 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#30363D] flex items-start justify-between bg-[#12171F]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[14px] text-[#E6EDF3] font-normal flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#38BDF8]" />
                    <span>Batch Data Preview</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#8B949E] bg-[#161B22] px-2 py-0.5 rounded border border-[#21262D]">
                    ID: {viewingBatchRecords.id}
                  </span>
                  <span
                    className={`text-[9.5px] uppercase px-1.5 py-0.5 rounded border ${
                      viewingBatchRecords.dataType === 'email'
                        ? 'bg-[#0D2136] text-[#38BDF8] border-[#153456]'
                        : 'bg-[#0D2B1D] text-[#22C55E] border-[#134E35]'
                    }`}
                  >
                    {viewingBatchRecords.dataType}
                  </span>
                </div>
                <div className="text-[11px] text-[#8B949E] flex items-center gap-3 flex-wrap font-mono">
                  <span>File: <strong className="text-[#E6EDF3] font-sans">{viewingBatchRecords.fileName}</strong></span>
                  <span>&bull;</span>
                  <span>Total Allocated: <strong className="text-[#38BDF8]">{viewingBatchRecords.totalAllocated}</strong></span>
                  <span>&bull;</span>
                  <span>Used: <strong className="text-[#22C55E]">{viewingBatchRecords.usedCount}</strong></span>
                  <span>&bull;</span>
                  <span>Remaining: <strong className="text-[#FBBF24]">{viewingBatchRecords.remainingToUse}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingBatchRecords(null)}
                className="p-1.5 rounded-[6px] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                title="Close Sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Toolbar: Search inside & Copy All & Export */}
            <div className="p-3 border-b border-[#21262D] bg-[#0D1117] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  placeholder={`Search ${viewingBatchRecords.dataType === 'email' ? 'email' : 'phone'} records...`}
                  className="vib-input pl-8 text-[11px] py-1 bg-[#161B22]"
                />
                {previewSearch && (
                  <button
                    onClick={() => setPreviewSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const content = (viewingBatchRecords.records || []).join('\n');
                    navigator.clipboard.writeText(content);
                    setPreviewCopied(true);
                    setTimeout(() => setPreviewCopied(false), 2000);
                  }}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#E6EDF3] border border-[#30363D] flex items-center gap-1.5"
                >
                  {previewCopied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3 text-[#38BDF8]" />}
                  <span>{previewCopied ? 'Copied All!' : 'Copy All'}</span>
                </button>

                {/* Export dropdown inside sheet preview */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExportDropdownId(
                        activeExportDropdownId === 'modal_preview' ? null : 'modal_preview'
                      )
                    }
                    className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Data</span>
                    <ChevronDown className="w-3 h-3 opacity-80" />
                  </button>

                  {activeExportDropdownId === 'modal_preview' && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setActiveExportDropdownId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-36 bg-[#161B22] border border-[#30363D] rounded-[6px] shadow-2xl py-1 z-30 text-left">
                        <button
                          type="button"
                          onClick={() => handleExportBatch(viewingBatchRecords, 'txt')}
                          className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                        >
                          <FileText className="w-3 h-3 text-[#8B949E]" />
                          <span>Plain TXT (.txt)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportBatch(viewingBatchRecords, 'csv')}
                          className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                        >
                          <Database className="w-3 h-3 text-[#8B949E]" />
                          <span>CSV File (.csv)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportBatch(viewingBatchRecords, 'excel')}
                          className="w-full text-left px-3 py-1.5 text-[10.5px] text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#38BDF8] flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-[#22C55E]" />
                          <span>Excel Sheet (.xls)</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto p-0 bg-[#0B0F17] custom-scrollbar min-h-[260px] max-h-[460px]">
              {(() => {
                const records = viewingBatchRecords.records || [];
                const filtered = previewSearch.trim()
                  ? records.filter((r) => r.toLowerCase().includes(previewSearch.toLowerCase().trim()))
                  : records;

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-[11.5px] text-[#8B949E]">
                      {records.length === 0
                        ? 'No records in this batch.'
                        : 'No records matching search query.'}
                    </div>
                  );
                }

                return (
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead className="sticky top-0 bg-[#161B22] border-b border-[#21262D] z-10 text-[#8B949E] text-[10px]">
                      <tr>
                        <th className="py-2 px-3 w-16 text-center border-r border-[#21262D]">#</th>
                        <th className="py-2 px-3">
                          {viewingBatchRecords.dataType === 'email' ? 'Email Address' : 'Phone Number / SMS'}
                        </th>
                        <th className="py-2 px-3 w-20 text-right">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262D]/40">
                      {filtered.map((record, index) => (
                        <tr
                          key={index}
                          className="hover:bg-[#161B22]/70 group transition-colors"
                        >
                          <td className="py-1.5 px-3 text-center text-[#8B949E] border-r border-[#21262D]/60 select-none text-[10px]">
                            {index + 1}
                          </td>
                          <td className="py-1.5 px-3 text-[#E6EDF3] break-all select-all font-light">
                            {record}
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(record)}
                              className="text-[10px] text-[#8B949E] hover:text-[#38BDF8] opacity-60 group-hover:opacity-100 transition-opacity"
                              title="Copy row"
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#30363D] bg-[#12171F] flex items-center justify-between">
              <div className="text-[11px] text-[#8B949E]">
                Showing{' '}
                <strong className="text-[#E6EDF3] font-mono">
                  {previewSearch.trim()
                    ? (viewingBatchRecords.records || []).filter((r) =>
                        r.toLowerCase().includes(previewSearch.toLowerCase().trim())
                      ).length
                    : (viewingBatchRecords.records || []).length}
                </strong>{' '}
                of <span className="font-mono">{(viewingBatchRecords.records || []).length}</span> records
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingBatchRecords(null)}
                  className="vib-btn-sm bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D]"
                >
                  Close Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
