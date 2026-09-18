export type Role = 'worker';
export type AdminRole = 'Administrator' | 'Leader' | 'Sub Leader';
export type DataType = 'sms' | 'email';
export type JobType = 'sms' | 'email' | 'microjob';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type UserStatus = 'active' | 'banned' | 'suspended';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  notes?: string;
  assignedBy?: string;
  hasPassword?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
  joiningDate: string;
  maxDailyQuota: number;
  notes?: string;
  todayJobsCount: number;
  totalJobsCount: number;
  totalCollectedData: number;
  totalUsedData: number;
  hasPassword?: boolean;
}

export interface Job {
  id: string;
  title: string;
  type: JobType;
  payoutPerUnit: number;
  dailyTarget: number;
  instructions: string;
  status: 'active' | 'inactive';
  createdAt: string;
  thumbnailUrl?: string;
}

export interface DataFile {
  id: string;
  fileName: string;
  dataType: DataType;
  totalCount: number;
  collectedCount: number;
  remainingCount: number;
  samplePreview?: string[];
  uploadedBy: string;
  uploadedAt: string;
}

export interface UserCollectedBatch {
  id: string;
  userId: string;
  userName: string;
  fileId: string;
  fileName: string;
  dataType: DataType;
  totalAllocated: number;
  remainingToUse: number;
  usedCount: number;
  records: string[];
  collectedAt: string;
}

export interface JobSubmission {
  id: string;
  userId: string;
  userName: string;
  jobId: string;
  jobTitle: string;
  totalCollected: number;
  totalUsed: number;
  successCount: number;
  failedCount: number;
  proofNotes: string;
  proofFiles: string[];
  status: SubmissionStatus;
  adminNotes?: string;
  submittedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  role: Role;
  totalCollected: number;
  totalUsed: number;
  todayUsed: number;
  totalSubmissions: number;
  status: UserStatus;
}

export interface TutorialItem {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'active' | 'inactive';
  duration: string;
  instructions?: string;
  createdAt: string;
}

export interface ToolItem {
  id: string;
  name: string;
  category: string;
  url: string;
  isInternal: boolean;
  description?: string;
  iconUrl?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface AutomationItem {
  id: string;
  title: string;
  fileName: string;
  downloadUrl: string;
  version: string;
  fileSize: string;
  instructions?: string;
  iconUrl?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface TeamApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  dailyHours: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SystemBackupItem {
  id: string;
  type: 'database' | 'files';
  name: string;
  filename: string;
  size: string;
  sizeBytes?: number;
  recordCount: number;
  tablesCount?: number;
  checksum?: string;
  createdAt: string;
  payload?: any;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  description: string;
  iconUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  domain: string;
  announcement: string;
  supportEmail: string;
  supportTelegram: string;
  historyRetentionDays: number;
  r2AccountId?: string;
  r2Endpoint: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicUrl: string;
  r2Region?: string;
  logoUrl?: string;
  faviconUrl?: string;
  setupCompleted?: boolean;
  setupLocked?: boolean;
  setupCompletedAt?: string;
}

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseServiceAccountKey {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

export interface FirebaseSettings {
  clientConfig: FirebaseClientConfig;
  serviceAccount: FirebaseServiceAccountKey | null;
  clientStatus?: 'not_configured' | 'verified' | 'failed';
  serviceAccountStatus?: 'not_configured' | 'verified' | 'failed';
  lastClientTestAt?: string;
  lastClientTestMessage?: string;
  lastServiceTestAt?: string;
  lastServiceTestMessage?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type ChatSenderRole = 'admin' | 'leader' | 'sub_leader' | 'worker' | 'system';

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: ChatSenderRole;
  senderAvatar?: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  text: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>; // e.g. { '👍': ['user1', 'user2'] }
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'channel' | 'direct' | 'announcement';
  description?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  membersCount?: number;
  isOnline?: boolean;
  isPinned?: boolean;
  badge?: string;
}

