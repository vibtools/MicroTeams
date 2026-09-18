import pg from 'pg';
import dotenv from 'dotenv';
import {
  User,
  AdminUser,
  AdminRole,
  Job,
  DataFile,
  UserCollectedBatch,
  JobSubmission,
  TutorialItem,
  ToolItem,
  AutomationItem,
  TeamApplication,
  ContactMessage,
  ServiceItem,
  SiteSettings,
  SystemBackupItem,
  LeaderboardEntry,
  FirebaseSettings,
} from '../src/types.js';

dotenv.config();

const { Pool } = pg;

export let isDbConnected = false;
let realPool: pg.Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    realPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=require') || process.env.PGSSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : undefined,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      max: 10,
    });
  } catch (poolErr) {
    console.warn('PostgreSQL pool creation notice:', poolErr);
    realPool = null;
  }
}

export const pool = {
  query: async (queryTextOrConfig: any, values?: any[]): Promise<any> => {
    if (!isDbConnected || !realPool) {
      return { rows: [], rowCount: 0 };
    }
    try {
      return await realPool.query(queryTextOrConfig, values);
    } catch (err: any) {
      console.warn('DB query notice (resilient fallback):', err?.message || err);
      return { rows: [], rowCount: 0 };
    }
  },
  connect: async (): Promise<any> => {
    if (!isDbConnected || !realPool) {
      return {
        query: async () => ({ rows: [], rowCount: 0 }),
        release: () => {},
      };
    }
    return await realPool.connect();
  },
};

// Resilient in-memory state synchronized with database
export const memoryStore = {
  // Dedicated Separate Table: dd_admin_users (Administrator, Leader, Sub Leader)
  adminUsers: [] as AdminUser[],
  // Dedicated Separate Table: dd_users (Workers only)
  users: [] as User[],
  jobs: [] as Job[],
  dataFiles: [] as DataFile[],
  userBatches: [] as UserCollectedBatch[],
  jobSubmissions: [] as JobSubmission[],
  tutorials: [] as TutorialItem[],
  tools: [] as ToolItem[],
  automation: [] as AutomationItem[],
  teamApplications: [] as TeamApplication[],
  contactMessages: [] as ContactMessage[],
  services: [
    {
      id: 'srv_1',
      name: 'B2B Email Campaign Sending',
      category: 'Email Dispatch',
      price: '$0.05 - $0.15 / send',
      shortDescription: 'Enterprise-grade bulk and personalized cold outreach with high inbox deliverability.',
      description: 'High-deliverability targeted B2B cold email delivery infrastructure. Includes SPF, DKIM, and DMARC domain validation, dedicated IP pools, custom merge fields, automated throttling, bounce and spam-trap filtering, and real-time open/click telemetry for marketing teams.',
      iconUrl: '',
      status: 'active',
      createdAt: '2025-01-10',
    },
    {
      id: 'srv_2',
      name: 'SMS Alert & OTP Verification',
      category: 'SMS Gateway',
      price: '$0.08 - $0.25 / SMS',
      shortDescription: 'High-throughput transactional and marketing SMS with instant carrier gateway delivery.',
      description: 'Carrier-grade global mobile text delivery with instant gateway turnaround. Supports short codes, alphanumeric sender IDs, two-factor authentication (2FA/OTP), promotional campaigns, webhook delivery receipts, and automated carrier compliance.',
      iconUrl: '',
      status: 'active',
      createdAt: '2025-01-12',
    },
    {
      id: 'srv_3',
      name: 'Microjob Proof & Lead Verification',
      category: 'Human Intelligence',
      price: 'Flexible / Task',
      shortDescription: 'Distributed worker validation for lead enrichment, proofs, and QA checks.',
      description: 'On-demand human workforce verification pipeline. Ideal for complex web audits, signup verifications, data scraping sanity checks, manual document parsing, and quality assurance workflows backed by leader-reviewed proof checkpoints.',
      iconUrl: '',
      status: 'active',
      createdAt: '2025-01-15',
    },
    {
      id: 'srv_4',
      name: 'Data Scrubbing & International Format Cleaning',
      category: 'Data Processing',
      price: '$0.02 - $0.05 / row',
      shortDescription: 'Automated syntax correction, duplicate deduplication, and E.164 phone formatting.',
      description: 'Comprehensive data cleansing algorithms for enterprise spreadsheets and contact databases. Automated deduplication, international E.164 phone formatting, MX record email verification, and invalid syntax removal ready for high-speed dispatch.',
      iconUrl: '',
      status: 'active',
      createdAt: '2025-02-01',
    },
  ] as ServiceItem[],
  settings: {
    siteName: 'Team Dark Devil',
    domain: 'darkdevil.team',
    announcement: '🔥 Notice: US Email Q1 files updated. All approved submissions get 5% bonus today.',
    supportEmail: 'support@darkdevil.team',
    supportTelegram: '@darkdevil_admin',
    historyRetentionDays: 30,
    r2Endpoint: process.env.R2_ENDPOINT || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.R2_BUCKET_NAME || '',
    r2PublicUrl: process.env.R2_PUBLIC_URL || '',
    logoUrl: '',
    faviconUrl: '',
  } as SiteSettings,
  systemBackups: [] as SystemBackupItem[],
  firebaseSettings: {
    clientConfig: {
      apiKey: 'AIzaSyAQY0GEBJuYsE3dO5L-Y3iT832Wfc4t1ag',
      authDomain: 'teamchat-b81fe.firebaseapp.com',
      projectId: 'teamchat-b81fe',
      storageBucket: 'teamchat-b81fe.firebasestorage.app',
      messagingSenderId: '1049335643050',
      appId: '1:1049335643050:web:ff97c01ce85718082a89d3',
    },
    serviceAccount: null,
    clientStatus: 'not_configured',
    serviceAccountStatus: 'not_configured',
  } as FirebaseSettings,
};

// Initialize PostgreSQL database schema if available
export async function initializeDatabase() {
  if (!process.env.DATABASE_URL || !realPool) {
    console.log('[AI Studio] PostgreSQL not configured (DATABASE_URL not set) — operating in fast resilient in-memory mode.');
    return;
  }

  let client: pg.PoolClient | null = null;
  try {
    client = await realPool.connect();
    isDbConnected = true;
    console.log('Successfully connected to PostgreSQL database!');

    await client.query(`
      CREATE TABLE IF NOT EXISTS dd_admin_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(128) NOT NULL,
        password VARCHAR(128) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'Administrator',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at VARCHAR(64) NOT NULL,
        last_login VARCHAR(64),
        notes TEXT,
        assigned_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS dd_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(128) NOT NULL,
        password VARCHAR(128) NOT NULL,
        first_name VARCHAR(128),
        last_name VARCHAR(128),
        phone VARCHAR(64),
        address TEXT,
        avatar_url TEXT,
        role VARCHAR(32) NOT NULL DEFAULT 'worker',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        joining_date VARCHAR(32) NOT NULL,
        max_daily_quota INT NOT NULL DEFAULT 1000,
        notes TEXT,
        today_jobs_count INT DEFAULT 0,
        total_jobs_count INT DEFAULT 0,
        total_collected_data INT DEFAULT 0,
        total_used_data INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS dd_jobs (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(32) NOT NULL,
        payout_per_unit NUMERIC(10, 4) NOT NULL DEFAULT 0.05,
        daily_target INT NOT NULL DEFAULT 500,
        instructions TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_data_files (
        id VARCHAR(64) PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        data_type VARCHAR(32) NOT NULL,
        total_count INT NOT NULL DEFAULT 0,
        collected_count INT NOT NULL DEFAULT 0,
        remaining_count INT NOT NULL DEFAULT 0,
        sample_preview JSONB,
        uploaded_by VARCHAR(64) NOT NULL,
        uploaded_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_user_batches (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        user_name VARCHAR(64) NOT NULL,
        file_id VARCHAR(64) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        data_type VARCHAR(32) NOT NULL,
        total_allocated INT NOT NULL DEFAULT 0,
        remaining_to_use INT NOT NULL DEFAULT 0,
        used_count INT NOT NULL DEFAULT 0,
        records JSONB,
        collected_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_submissions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        user_name VARCHAR(64) NOT NULL,
        job_id VARCHAR(64) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        total_collected INT NOT NULL DEFAULT 0,
        total_used INT NOT NULL DEFAULT 0,
        success_count INT NOT NULL DEFAULT 0,
        failed_count INT NOT NULL DEFAULT 0,
        proof_notes TEXT,
        proof_files JSONB,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        admin_notes TEXT,
        submitted_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_tutorials (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(64) NOT NULL,
        video_url VARCHAR(255) NOT NULL,
        duration VARCHAR(32) NOT NULL,
        instructions TEXT,
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_tools (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(64) NOT NULL,
        url TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        description TEXT,
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_automation (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        download_url TEXT NOT NULL,
        version VARCHAR(32) NOT NULL,
        file_size VARCHAR(32) NOT NULL,
        instructions TEXT,
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_applications (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(128) NOT NULL,
        email VARCHAR(128) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        experience TEXT,
        daily_hours INT NOT NULL,
        message TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_contact (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT,
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_backups (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        size VARCHAR(64) NOT NULL,
        record_count INT DEFAULT 0,
        tables_count INT DEFAULT 0,
        checksum VARCHAR(64),
        payload JSONB,
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_services (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(64) NOT NULL,
        price VARCHAR(64) NOT NULL,
        short_description TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_url TEXT,
        status VARCHAR(32) DEFAULT 'active',
        created_at VARCHAR(64) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_settings (
        id VARCHAR(32) PRIMARY KEY DEFAULT 'main',
        data JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dd_firebase_config (
        id VARCHAR(32) PRIMARY KEY DEFAULT 'main',
        client_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        service_account JSONB,
        client_status VARCHAR(32) DEFAULT 'not_configured',
        service_account_status VARCHAR(32) DEFAULT 'not_configured',
        last_client_test_at VARCHAR(64),
        last_client_test_message TEXT,
        last_service_test_at VARCHAR(64),
        last_service_test_message TEXT,
        updated_at VARCHAR(64),
        updated_by VARCHAR(64)
      );

      ALTER TABLE dd_users ADD COLUMN IF NOT EXISTS first_name VARCHAR(128);
      ALTER TABLE dd_users ADD COLUMN IF NOT EXISTS last_name VARCHAR(128);
      ALTER TABLE dd_users ADD COLUMN IF NOT EXISTS phone VARCHAR(64);
      ALTER TABLE dd_users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE dd_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

      ALTER TABLE dd_jobs ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      ALTER TABLE dd_tutorials ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      ALTER TABLE dd_tutorials ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active';
      ALTER TABLE dd_tools ADD COLUMN IF NOT EXISTS icon_url TEXT;
      ALTER TABLE dd_tools ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active';
      ALTER TABLE dd_automation ADD COLUMN IF NOT EXISTS icon_url TEXT;
      ALTER TABLE dd_automation ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active';
    `);

    // 1. Separate Table: dd_admin_users (Administrator, Leader, Sub Leader)
    // Load legitimate admin accounts from PostgreSQL into memory store (no hardcoded accounts seeded)
    const loadedAdmins = await client.query('SELECT * FROM dd_admin_users ORDER BY created_at ASC');
    if (loadedAdmins.rows.length > 0) {
      memoryStore.adminUsers = loadedAdmins.rows.map((row) => ({
        id: row.id,
        username: row.username,
        email: row.email,
        password: row.password,
        role: row.role as AdminRole,
        status: row.status as 'active' | 'suspended',
        createdAt: row.created_at,
        lastLogin: row.last_login || undefined,
        notes: row.notes || undefined,
        assignedBy: row.assigned_by || undefined,
      }));
      console.log(`Loaded ${memoryStore.adminUsers.length} admin accounts from dd_admin_users`);
    } else {
      memoryStore.adminUsers = [];
    }

    // 2. Separate Table: dd_users (Workers only - clean separation from admin users)
    // Remove any legacy admin record from dd_users if present
    await client.query("DELETE FROM dd_users WHERE username = 'admin' OR role = 'admin'");

    // Load legitimate workers from PostgreSQL into memory store (no hardcoded workers seeded)
    const loadedUsers = await client.query("SELECT * FROM dd_users WHERE role = 'worker' ORDER BY joining_date ASC");
    if (loadedUsers.rows.length > 0) {
      memoryStore.users = loadedUsers.rows.map((row) => ({
        id: row.id,
        username: row.username,
        email: row.email,
        password: row.password,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        phone: row.phone || '',
        address: row.address || '',
        avatarUrl: row.avatar_url || '',
        role: 'worker',
        status: row.status,
        joiningDate: row.joining_date,
        maxDailyQuota: row.max_daily_quota,
        notes: row.notes || '',
        todayJobsCount: row.today_jobs_count || 0,
        totalJobsCount: row.total_jobs_count || 0,
        totalCollectedData: row.total_collected_data || 0,
        totalUsedData: row.total_used_data || 0,
      }));
    } else {
      memoryStore.users = [];
    }

    // Restore saved settings if present
    try {
      const settRes = await client.query('SELECT data FROM dd_settings WHERE id = $1', ['main']);
      if (settRes.rows.length > 0 && settRes.rows[0].data) {
        Object.assign(memoryStore.settings, settRes.rows[0].data);
        console.log('Restored site settings from PostgreSQL dd_settings');
      }
    } catch (settErr: any) {
      console.warn('Settings load notice:', settErr?.message);
    }

    // Restore Firebase settings if present
    try {
      const fbRes = await client.query('SELECT * FROM dd_firebase_config WHERE id = $1', ['main']);
      if (fbRes.rows.length > 0) {
        const row = fbRes.rows[0];
        memoryStore.firebaseSettings = {
          clientConfig: row.client_config || memoryStore.firebaseSettings.clientConfig,
          serviceAccount: row.service_account || null,
          clientStatus: row.client_status || 'not_configured',
          serviceAccountStatus: row.service_account_status || 'not_configured',
          lastClientTestAt: row.last_client_test_at || undefined,
          lastClientTestMessage: row.last_client_test_message || undefined,
          lastServiceTestAt: row.last_service_test_at || undefined,
          lastServiceTestMessage: row.last_service_test_message || undefined,
          updatedAt: row.updated_at || undefined,
          updatedBy: row.updated_by || undefined,
        };
        console.log('Restored Firebase configuration from PostgreSQL dd_firebase_config');
      }
    } catch (fbErr: any) {
      console.warn('Firebase config load notice:', fbErr?.message);
    }

    // Restore arrays from DB
    try {
      const jobsRes = await client.query('SELECT * FROM dd_jobs ORDER BY created_at DESC');
      memoryStore.jobs = jobsRes.rows.map(row => ({
        id: row.id, title: row.title, type: row.type, payoutPerUnit: parseFloat(row.payout_per_unit), dailyTarget: row.daily_target, instructions: row.instructions, status: row.status, createdAt: row.created_at, thumbnailUrl: row.thumbnail_url || undefined
      })) as Job[];

      const dataFilesRes = await client.query('SELECT * FROM dd_data_files ORDER BY uploaded_at DESC');
      memoryStore.dataFiles = dataFilesRes.rows.map(row => ({
        id: row.id, fileName: row.file_name, dataType: row.data_type, totalCount: row.total_count, collectedCount: row.collected_count, remainingCount: row.remaining_count, samplePreview: row.sample_preview || [], uploadedBy: row.uploaded_by, uploadedAt: row.uploaded_at
      })) as DataFile[];

      const userBatchesRes = await client.query('SELECT * FROM dd_user_batches ORDER BY collected_at DESC');
      memoryStore.userBatches = userBatchesRes.rows.map(row => ({
        id: row.id, userId: row.user_id, userName: row.user_name, fileId: row.file_id, fileName: row.file_name, dataType: row.data_type, totalAllocated: row.total_allocated, remainingToUse: row.remaining_to_use, usedCount: row.used_count, records: row.records || [], collectedAt: row.collected_at
      })) as UserCollectedBatch[];

      const subRes = await client.query('SELECT * FROM dd_submissions ORDER BY submitted_at DESC');
      memoryStore.jobSubmissions = subRes.rows.map(row => ({
        id: row.id, userId: row.user_id, userName: row.user_name, jobId: row.job_id, jobTitle: row.job_title, totalCollected: row.total_collected, totalUsed: row.total_used, successCount: row.success_count, failedCount: row.failed_count, proofNotes: row.proof_notes, proofFiles: row.proof_files || [], status: row.status, adminNotes: row.admin_notes || '', submittedAt: row.submitted_at
      })) as JobSubmission[];

      const tutRes = await client.query('SELECT * FROM dd_tutorials ORDER BY created_at DESC');
      memoryStore.tutorials = tutRes.rows.map(row => ({
        id: row.id, title: row.title, category: row.category, videoUrl: row.video_url, duration: row.duration, instructions: row.instructions, createdAt: row.created_at, thumbnailUrl: row.thumbnail_url || undefined, status: row.status || 'active'
      })) as TutorialItem[];

      const toolsRes = await client.query('SELECT * FROM dd_tools ORDER BY created_at DESC');
      memoryStore.tools = toolsRes.rows.map(row => ({
        id: row.id, name: row.name, category: row.category, url: row.url, isInternal: row.is_internal, description: row.description, createdAt: row.created_at, iconUrl: row.icon_url || undefined, status: row.status || 'active'
      })) as ToolItem[];

      const autoRes = await client.query('SELECT * FROM dd_automation ORDER BY created_at DESC');
      memoryStore.automation = autoRes.rows.map(row => ({
        id: row.id, title: row.title, fileName: row.file_name, downloadUrl: row.download_url, version: row.version, fileSize: row.file_size, instructions: row.instructions, createdAt: row.created_at, iconUrl: row.icon_url || undefined, status: row.status || 'active'
      })) as AutomationItem[];

      const appsRes = await client.query('SELECT * FROM dd_applications ORDER BY created_at DESC');
      memoryStore.teamApplications = appsRes.rows.map(row => ({
        id: row.id, fullName: row.full_name, email: row.email, phone: row.phone, experience: row.experience, dailyHours: row.daily_hours, message: row.message, status: row.status, createdAt: row.created_at
      })) as TeamApplication[];

      const contactRes = await client.query('SELECT * FROM dd_contact ORDER BY created_at DESC');
      memoryStore.contactMessages = contactRes.rows.map(row => ({
        id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, createdAt: row.created_at
      })) as ContactMessage[];

      // Services restore / seed
      const servicesRes = await client.query('SELECT * FROM dd_services ORDER BY created_at DESC');
      if (servicesRes.rows.length === 0) {
        for (const srv of memoryStore.services) {
          await client.query(
            `INSERT INTO dd_services (id, name, category, price, short_description, description, icon_url, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [
              srv.id,
              srv.name,
              srv.category,
              srv.price,
              srv.shortDescription,
              srv.description,
              srv.iconUrl || '',
              srv.status,
              srv.createdAt,
            ]
          );
        }
      } else {
        memoryStore.services = servicesRes.rows.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          price: row.price,
          shortDescription: row.short_description,
          description: row.description,
          iconUrl: row.icon_url || undefined,
          status: row.status || 'active',
          createdAt: row.created_at,
        })) as ServiceItem[];
      }

      // Backups load
      const backupsRes = await client.query('SELECT * FROM dd_backups ORDER BY created_at DESC');
      if (backupsRes.rows.length > 0) {
        memoryStore.systemBackups = backupsRes.rows.map((row) => ({
          id: row.id,
          type: row.type as 'database' | 'files',
          name: row.name,
          filename: row.filename,
          size: row.size,
          recordCount: row.record_count || 0,
          tablesCount: row.tables_count || 0,
          checksum: row.checksum || undefined,
          payload: row.payload || undefined,
          createdAt: row.created_at,
        })) as SystemBackupItem[];
      }

      console.log('Restored all entities from PostgreSQL');
    } catch (dbErr: any) {
      console.warn('DB load notice:', dbErr?.message);
    }

    if (client) {
      client.release();
    }
    console.log('PostgreSQL database tables ready!');
  } catch (err: any) {
    isDbConnected = false;
    if (client) {
      try { client.release(); } catch (_) {}
    }
    console.warn('PostgreSQL initialization notice (continuing with in-memory resilient mirror):', err?.message || err);
  }
}

/**
 * Diagnostics probe for checking a PostgreSQL connection
 */
export async function testDatabaseConnection(connectionString?: string) {
  const connStr = connectionString?.trim() || process.env.DATABASE_URL?.trim();
  if (!connStr) {
    return {
      success: false,
      latencyMs: 0,
      message: 'No DATABASE_URL provided or configured.',
      error: 'Empty connection string',
    };
  }

  const startTime = Date.now();
  let tempPool: pg.Pool | null = null;
  try {
    tempPool = new Pool({
      connectionString: connStr,
      ssl: connStr.includes('sslmode=require') || process.env.PGSSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
      max: 2,
    });

    const client = await tempPool.connect();
    const dbResult = await client.query(`
      SELECT 
        NOW() as current_time, 
        version() as db_version,
        current_database() as db_name
    `);

    // Check tables in public schema
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableNames = tablesQuery.rows.map((r: any) => r.table_name);

    let adminCount = 0;
    const hasAdminTable = tableNames.includes('dd_admin_users');
    if (hasAdminTable) {
      try {
        const adminRes = await client.query('SELECT COUNT(*) FROM dd_admin_users');
        adminCount = parseInt(adminRes.rows[0]?.count || '0', 10);
      } catch (_) {}
    }

    client.release();
    await tempPool.end();

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      latencyMs,
      databaseName: dbResult.rows[0]?.db_name || 'postgresql',
      version: dbResult.rows[0]?.db_version?.split(' ')?.[0] || 'PostgreSQL',
      serverTime: dbResult.rows[0]?.current_time,
      tablesCount: tableNames.length,
      tables: tableNames,
      hasAdminTable,
      adminCount,
      message: `PostgreSQL connection verified! (Latency: ${latencyMs}ms, ${tableNames.length} tables found)`,
    };
  } catch (err: any) {
    if (tempPool) {
      try { await tempPool.end(); } catch (_) {}
    }
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: `Connection failed: ${err?.message || err}`,
      error: String(err),
    };
  }
}

/**
 * Reconnect PostgreSQL pool dynamically with new credentials and initialize tables
 */
export async function reconnectDatabase(newConnectionString: string): Promise<boolean> {
  if (!newConnectionString) return false;

  if (realPool) {
    try { await realPool.end(); } catch (_) {}
    realPool = null;
    isDbConnected = false;
  }

  process.env.DATABASE_URL = newConnectionString;

  try {
    realPool = new Pool({
      connectionString: newConnectionString,
      ssl: newConnectionString.includes('sslmode=require') || process.env.PGSSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    await initializeDatabase();
    return isDbConnected;
  } catch (err) {
    console.error('Failed to reconnect database:', err);
    return false;
  }
}

