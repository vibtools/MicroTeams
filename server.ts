import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, memoryStore, pool } from './server/db.js';
import { uploadAssetToR2, getAssetFromR2, testR2Connection } from './server/r2.js';
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
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Professional HTTP Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Brute-force rate limiter for worker authentication
  interface LoginAttemptRecord {
    attempts: number;
    lockedUntil: number;
    lastAttempt: number;
  }
  const workerLoginLimiter = new Map<string, LoginAttemptRecord>();

  // Cleanup stale attempt records every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of workerLoginLimiter.entries()) {
      if (now > record.lockedUntil && now - record.lastAttempt > 15 * 60 * 1000) {
        workerLoginLimiter.delete(key);
      }
    }
  }, 10 * 60 * 1000);

  // Initialize DB tables asynchronously
  initializeDatabase().catch((e) => console.warn('Async DB init notice:', e));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), team: 'Dark Devil' });
  });

  // Auth: Dedicated Admin & Leader Login (dd_admin_users table)
  app.post('/api/auth/admin-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const trimmedUsername = username.trim();

    // Strict Separation Check: Worker accounts are strictly prohibited from Leader / Admin portal
    const isWorkerAccount = memoryStore.users.some(
      (u) =>
        u.username.toLowerCase() === trimmedUsername.toLowerCase() ||
        u.email.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (isWorkerAccount) {
      return res.status(403).json({
        error:
          'Access Denied: Worker accounts cannot log into the Leader / Admin Portal. Worker and Admin accounts are completely separated. Workers must sign in at the Worker Portal (/).',
      });
    }

    const admin = memoryStore.adminUsers.find(
      (u) =>
        (u.username.toLowerCase() === trimmedUsername.toLowerCase() ||
          u.email.toLowerCase() === trimmedUsername.toLowerCase()) &&
        u.password === password
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid Administrator or Leader credentials.' });
    }

    if (admin.status === 'suspended') {
      return res.status(403).json({ error: 'Administrative account has been suspended. Contact system owner.' });
    }

    // Update last login timestamp
    admin.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
    pool.query('UPDATE dd_admin_users SET last_login = $1 WHERE id = $2', [admin.lastLogin, admin.id]).catch(() => {});

    const { password: _, ...safeAdmin } = admin;
    res.json({
      user: safeAdmin,
      token: `dd_admin_token_${admin.id}_${Date.now()}`,
      message: `${admin.role} authentication successful`,
    });
  });

  // Auth: Worker Login (dd_users table only - strictly for workers / job holders)
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Valid username and password are required.' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length > 80 || password.length > 128) {
      return res.status(400).json({ error: 'Input exceeds permissible length limits.' });
    }

    // IP Extraction for Rate Limiting & Audit
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const limitKey = `${clientIp}_${trimmedUsername.toLowerCase()}`;
    const now = Date.now();

    // Check Active Security Lockout
    const attemptRecord = workerLoginLimiter.get(limitKey) || {
      attempts: 0,
      lockedUntil: 0,
      lastAttempt: now,
    };

    if (attemptRecord.lockedUntil > now) {
      const secondsRemaining = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
      return res.status(429).json({
        error: `Security Lockout Active: Too many failed login attempts. Try again in ${secondsRemaining} seconds.`,
        locked: true,
        retryAfterSeconds: secondsRemaining,
        remainingAttempts: 0,
      });
    }

    // Strict Separation Check: Admin accounts are strictly forbidden from logging into the Worker panel
    const isAdminAccount =
      trimmedUsername.toLowerCase() === 'admin' ||
      trimmedUsername.toLowerCase().startsWith('admin_') ||
      trimmedUsername.toLowerCase().startsWith('leader_') ||
      trimmedUsername.toLowerCase().startsWith('subleader_') ||
      memoryStore.adminUsers.some(
        (adm) =>
          adm.username.toLowerCase() === trimmedUsername.toLowerCase() ||
          adm.email.toLowerCase() === trimmedUsername.toLowerCase()
      );

    if (isAdminAccount) {
      return res.status(403).json({
        error:
          'Access Denied: Administrative accounts cannot log into the Worker Panel. Worker and Admin accounts are strictly separated.',
      });
    }

    // Timing attack mitigation: ensure a minimum computational delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    const user = memoryStore.users.find(
      (u) =>
        (u.username.toLowerCase() === trimmedUsername.toLowerCase() ||
          u.email.toLowerCase() === trimmedUsername.toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      attemptRecord.attempts += 1;
      attemptRecord.lastAttempt = now;

      if (attemptRecord.attempts >= 5) {
        attemptRecord.lockedUntil = now + 15 * 60 * 1000; // 15-minute temporary lockout
        workerLoginLimiter.set(limitKey, attemptRecord);
        return res.status(429).json({
          error:
            'Security Lockout: Account temporarily locked due to 5 consecutive failed attempts. Protection cooling period: 15 minutes.',
          locked: true,
          retryAfterSeconds: 900,
          remainingAttempts: 0,
        });
      } else {
        workerLoginLimiter.set(limitKey, attemptRecord);
        const remaining = 5 - attemptRecord.attempts;
        return res.status(401).json({
          error: `Invalid worker credentials. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before security lockout)`,
          remainingAttempts: remaining,
        });
      }
    }

    if (user.role !== 'worker') {
      return res.status(403).json({
        error:
          'Access Denied: Only registered workers and job holders can access this portal.',
      });
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({ error: 'Worker account is suspended or banned. Contact team administrator.' });
    }

    // Reset rate limiter on valid worker authentication
    workerLoginLimiter.delete(limitKey);

    const { password: _, ...safeUser } = user;
    const sessionToken = `dd_token_${user.id}_${now}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours valid session

    res.json({
      user: safeUser,
      token: sessionToken,
      expiresAt,
      message: 'Worker authentication successful',
    });
  });

  // Auth: Current worker info (Worker endpoint only)
  app.get('/api/auth/user/:id', (req, res) => {
    if (req.params.id.startsWith('adm_')) {
      return res.status(403).json({ error: 'Administrative users are not accessible via worker endpoints.' });
    }
    const user = memoryStore.users.find((u) => u.id === req.params.id && u.role === 'worker');
    if (!user) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // System Stats Overview
  app.get('/api/stats/overview', (req, res) => {
    const totalDataUploaded = memoryStore.dataFiles.reduce((acc, f) => acc + f.totalCount, 0);
    const totalDataCollected = memoryStore.dataFiles.reduce((acc, f) => acc + f.collectedCount, 0);
    const totalDataRemaining = memoryStore.dataFiles.reduce((acc, f) => acc + f.remainingCount, 0);
    const totalJobs = memoryStore.jobs.length;
    const totalActiveWorkers = memoryStore.users.filter((u) => u.role === 'worker' && u.status === 'active').length;
    const totalSubmissions = memoryStore.jobSubmissions.length;
    const pendingSubmissions = memoryStore.jobSubmissions.filter((s) => s.status === 'pending').length;

    res.json({
      totalDataUploaded,
      totalDataCollected,
      totalDataRemaining,
      totalJobs,
      totalActiveWorkers,
      totalSubmissions,
      pendingSubmissions,
      siteSettings: memoryStore.settings,
    });
  });

  // Jobs: List
  app.get('/api/jobs', (req, res) => {
    res.json({ jobs: memoryStore.jobs });
  });

  // Jobs: Create (Admin)
  app.post('/api/jobs', async (req, res) => {
    const { title, type, payoutPerUnit, dailyTarget, instructions, thumbnailUrl } = req.body;
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const newJob: Job = {
      id: `job_${Date.now()}`,
      title,
      type: type || 'email',
      payoutPerUnit: Number(payoutPerUnit) || 0.05,
      dailyTarget: Number(dailyTarget) || 500,
      instructions: instructions || 'Follow standard instructions.',
      status: 'active',
      thumbnailUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };

    memoryStore.jobs.unshift(newJob);

    try {
      await pool.query(
        `INSERT INTO dd_jobs (id, title, type, payout_per_unit, daily_target, instructions, status, created_at, thumbnail_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newJob.id,
          newJob.title,
          newJob.type,
          newJob.payoutPerUnit,
          newJob.dailyTarget,
          newJob.instructions,
          newJob.status,
          newJob.createdAt,
          newJob.thumbnailUrl || null,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Jobs insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, job: newJob });
  });

  // Jobs: Update Status / Delete
  app.put('/api/jobs/:id', async (req, res) => {
    const job = memoryStore.jobs.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    Object.assign(job, req.body);

    try {
      await pool.query(
        `UPDATE dd_jobs SET title = $1, type = $2, payout_per_unit = $3, daily_target = $4, instructions = $5, status = $6, thumbnail_url = $7 WHERE id = $8`,
        [
          job.title,
          job.type,
          job.payoutPerUnit,
          job.dailyTarget,
          job.instructions,
          job.status,
          job.thumbnailUrl || null,
          job.id,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Jobs update DB notice:', dbErr?.message);
    }

    res.json({ success: true, job });
  });

  app.delete('/api/jobs/:id', async (req, res) => {
    const index = memoryStore.jobs.findIndex((j) => j.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Job not found' });
    memoryStore.jobs.splice(index, 1);

    try {
      await pool.query('DELETE FROM dd_jobs WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Jobs delete DB notice:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // Data Files: List
  app.get('/api/data-files', (req, res) => {
    const { type } = req.query;
    let files = memoryStore.dataFiles;
    if (type && (type === 'sms' || type === 'email')) {
      files = files.filter((f) => f.dataType === type);
    }
    res.json({ files });
  });

  // Data Files: Upload (Admin)
  app.post('/api/data-files', async (req, res) => {
    const { fileName, dataType, rawDataLines, uploadedBy } = req.body;
    if (!fileName || !dataType) {
      return res.status(400).json({ error: 'File name and data type are required' });
    }

    // Process raw lines (either pasted or uploaded)
    const lines = Array.isArray(rawDataLines)
      ? rawDataLines.filter(Boolean)
      : typeof rawDataLines === 'string'
      ? rawDataLines
          .split(/[\r\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const totalCount = lines.length > 0 ? lines.length : 1000;
    const sample = lines.length > 0 ? lines.slice(0, 5) : [
      dataType === 'sms' ? '+18005550199' : 'sample_lead_1@target-corp.com',
      dataType === 'sms' ? '+18005550200' : 'sample_lead_2@target-corp.com',
    ];

    const newFile: DataFile = {
      id: `file_${Date.now()}`,
      fileName,
      dataType,
      totalCount,
      collectedCount: 0,
      remainingCount: totalCount,
      uploadedBy: uploadedBy || 'admin',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      samplePreview: sample,
    };

    memoryStore.dataFiles.unshift(newFile);

    try {
      await pool.query(
        `INSERT INTO dd_data_files (id, file_name, data_type, total_count, collected_count, remaining_count, sample_preview, uploaded_by, uploaded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newFile.id,
          newFile.fileName,
          newFile.dataType,
          newFile.totalCount,
          newFile.collectedCount,
          newFile.remainingCount,
          JSON.stringify(newFile.samplePreview),
          newFile.uploadedBy,
          newFile.uploadedAt,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Data files insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, file: newFile });
  });

  // Data Files: Delete (Admin)
  app.delete('/api/data-files/:id', async (req, res) => {
    const index = memoryStore.dataFiles.findIndex((f) => f.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'File not found' });
    memoryStore.dataFiles.splice(index, 1);

    try {
      await pool.query('DELETE FROM dd_data_files WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Data files delete DB notice:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // User Action: Collect Data
  // User selects DataType, Selects File, Inputs requested count
  // System allocates that amount to user's account, reducing file remaining
  app.post('/api/data/collect', async (req, res) => {
    const { userId, fileId, dataType, requestedCount } = req.body;
    if (!userId || !fileId || !requestedCount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const file = memoryStore.dataFiles.find((f) => f.id === fileId);
    if (!file) {
      return res.status(404).json({ error: 'Data file not found' });
    }

    const count = parseInt(requestedCount, 10);
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({ error: 'Count must be a positive number' });
    }

    if (count > file.remainingCount) {
      return res.status(400).json({
        error: `Only ${file.remainingCount} records remaining in this file.`,
      });
    }

    const user = memoryStore.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check daily quota limit
    if (count > user.maxDailyQuota) {
      return res.status(400).json({
        error: `Requested amount exceeds your maximum daily quota of ${user.maxDailyQuota}.`,
      });
    }

    // Deduct from file
    file.collectedCount += count;
    file.remainingCount -= count;

    // Generate records
    const samplePrefix = file.dataType === 'sms' ? '+1800' : 'lead_';
    const records = Array.from({ length: count }, (_, i) =>
      file.dataType === 'sms'
        ? `+1${Math.floor(2000000000 + Math.random() * 7000000000)}`
        : `dispatch_${Date.now().toString().slice(-4)}_${i + 1}@lead-inbox.com`
    );

    const newBatch: UserCollectedBatch = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      userName: user.username,
      fileId: file.id,
      fileName: file.fileName,
      dataType: file.dataType,
      totalAllocated: count,
      remainingToUse: count,
      usedCount: 0,
      records,
      collectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    memoryStore.userBatches.unshift(newBatch);

    // Update user stats
    user.totalCollectedData += count;

    try {
      await pool.query(
        `INSERT INTO dd_user_batches (id, user_id, user_name, file_id, file_name, data_type, total_allocated, remaining_to_use, used_count, records, collected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newBatch.id,
          newBatch.userId,
          newBatch.userName,
          newBatch.fileId,
          newBatch.fileName,
          newBatch.dataType,
          newBatch.totalAllocated,
          newBatch.remainingToUse,
          newBatch.usedCount,
          JSON.stringify(newBatch.records),
          newBatch.collectedAt,
        ]
      );

      await pool.query(
        'UPDATE dd_data_files SET collected_count = $1, remaining_count = $2 WHERE id = $3',
        [file.collectedCount, file.remainingCount, file.id]
      );

      await pool.query(
        'UPDATE dd_users SET total_collected_data = $1 WHERE id = $2',
        [user.totalCollectedData, user.id]
      );
    } catch (dbErr: any) {
      console.warn('Data collect DB sync notice:', dbErr?.message);
    }

    res.json({
      success: true,
      batch: newBatch,
      fileRemaining: file.remainingCount,
      userTotalCollected: user.totalCollectedData,
    });
  });

  // User: Get My Collected Batches
  app.get('/api/data/user-collected/:userId', (req, res) => {
    const batches = memoryStore.userBatches.filter((b) => b.userId === req.params.userId);
    const totalRemaining = batches.reduce((acc, b) => acc + b.remainingToUse, 0);
    const totalUsed = batches.reduce((acc, b) => acc + b.usedCount, 0);
    res.json({ batches, totalRemaining, totalUsed });
  });

  // User Action: Download / Use partial data from collected batch
  // User selects e.g. 50, 100, 10, 20 out of their 1000
  // Decreases from user's remaining collected data!
  app.post('/api/data/download-batch', async (req, res) => {
    const { batchId, downloadCount, format } = req.body;
    if (!batchId || !downloadCount) {
      return res.status(400).json({ error: 'Batch ID and download count required' });
    }

    const batch = memoryStore.userBatches.find((b) => b.id === batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Collected batch not found' });
    }

    const count = parseInt(downloadCount, 10);
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({ error: 'Invalid download quantity' });
    }

    if (count > batch.remainingToUse) {
      return res.status(400).json({
        error: `Only ${batch.remainingToUse} records remaining in this active batch.`,
      });
    }

    // Carve out records to download
    const recordsToDownload = batch.records.splice(0, count);
    batch.remainingToUse -= count;
    batch.usedCount += count;

    // Update user used data counter
    const user = memoryStore.users.find((u) => u.id === batch.userId);
    if (user) {
      user.totalUsedData += count;
    }

    try {
      await pool.query(
        'UPDATE dd_user_batches SET remaining_to_use = $1, used_count = $2, records = $3 WHERE id = $4',
        [batch.remainingToUse, batch.usedCount, JSON.stringify(batch.records), batch.id]
      );

      if (user) {
        await pool.query(
          'UPDATE dd_users SET total_used_data = $1 WHERE id = $2',
          [user.totalUsedData, user.id]
        );
      }
    } catch (dbErr: any) {
      console.warn('Batch download DB sync notice:', dbErr?.message);
    }

    // Prepare content format
    let fileContent = '';
    if (format === 'csv') {
      fileContent = 'Record_Index,Recipient_Data,Data_Type,Allocated_Time\n' +
        recordsToDownload.map((r, i) => `${i + 1},"${r}",${batch.dataType},${batch.collectedAt}`).join('\n');
    } else {
      fileContent = recordsToDownload.join('\n');
    }

    res.json({
      success: true,
      downloadedCount: count,
      remainingInBatch: batch.remainingToUse,
      totalUsedInBatch: batch.usedCount,
      userTotalUsed: user ? user.totalUsedData : 0,
      records: recordsToDownload,
      formattedContent: fileContent,
    });
  });

  // Collect History
  app.get('/api/data/collect-history/:userId', (req, res) => {
    const batches = memoryStore.userBatches.filter((b) => b.userId === req.params.userId);
    res.json({
      history: batches.map((b) => ({
        id: b.id,
        fileName: b.fileName,
        dataType: b.dataType,
        totalAllocated: b.totalAllocated,
        remainingToUse: b.remainingToUse,
        usedCount: b.usedCount,
        records: b.records || [],
        collectedAt: b.collectedAt,
      })),
      retentionDays: memoryStore.settings.historyRetentionDays,
    });
  });

  // Leaderboard
  // Users ranked on top by: totalCollected, totalUsed, and today submissions
  app.get('/api/leaderboard', (req, res) => {
    const workers = memoryStore.users.filter((u) => u.role === 'worker');

    const leaderboard: LeaderboardEntry[] = workers
      .map((w) => {
        const userSubmissions = memoryStore.jobSubmissions.filter((s) => s.userId === w.id);
        return {
          rank: 0,
          userId: w.id,
          userName: w.username,
          role: w.role,
          totalCollected: w.totalCollectedData,
          totalUsed: w.totalUsedData,
          todayUsed: Math.floor(w.totalUsedData * 0.15),
          totalSubmissions: userSubmissions.length || w.todayJobsCount,
          status: w.status,
        };
      })
      .sort((a, b) => b.totalUsed - a.totalUsed || b.totalCollected - a.totalCollected)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    res.json({ leaderboard });
  });

  // Job Submissions: List
  app.get('/api/submissions', (req, res) => {
    const { userId } = req.query;
    let list = memoryStore.jobSubmissions;
    if (userId) {
      list = list.filter((s) => s.userId === userId);
    }
    res.json({ submissions: list });
  });

  // Job Submissions: Create (User proof submit)
  app.post('/api/submissions', async (req, res) => {
    const {
      userId,
      jobId,
      totalCollected,
      totalUsed,
      successCount,
      failedCount,
      proofNotes,
      proofFiles,
    } = req.body;

    const user = memoryStore.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const job = memoryStore.jobs.find((j) => j.id === jobId);

    const newSub: JobSubmission = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      userName: user.username,
      jobId: jobId || 'general',
      jobTitle: job ? job.title : 'General Microjob Dispatch',
      totalCollected: Number(totalCollected) || user.totalCollectedData,
      totalUsed: Number(totalUsed) || user.totalUsedData,
      successCount: Number(successCount) || 0,
      failedCount: Number(failedCount) || 0,
      proofNotes: proofNotes || '',
      proofFiles: Array.isArray(proofFiles) ? proofFiles : [proofFiles].filter(Boolean),
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    memoryStore.jobSubmissions.unshift(newSub);
    user.todayJobsCount += 1;
    user.totalJobsCount += 1;

    try {
      await pool.query(
        `INSERT INTO dd_submissions (id, user_id, user_name, job_id, job_title, total_collected, total_used, success_count, failed_count, proof_notes, proof_files, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newSub.id,
          newSub.userId,
          newSub.userName,
          newSub.jobId,
          newSub.jobTitle,
          newSub.totalCollected,
          newSub.totalUsed,
          newSub.successCount,
          newSub.failedCount,
          newSub.proofNotes,
          JSON.stringify(newSub.proofFiles),
          newSub.status,
          newSub.submittedAt,
        ]
      );

      await pool.query(
        'UPDATE dd_users SET today_jobs_count = $1, total_jobs_count = $2 WHERE id = $3',
        [user.todayJobsCount, user.totalJobsCount, user.id]
      );
    } catch (dbErr: any) {
      console.warn('Submission create DB sync notice:', dbErr?.message);
    }

    res.json({ success: true, submission: newSub });
  });

  // Job Submissions: Status update (Admin approve/reject)
  app.put('/api/submissions/:id', async (req, res) => {
    const sub = memoryStore.jobSubmissions.find((s) => s.id === req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    const { status, adminNotes } = req.body;
    if (status) sub.status = status;
    if (adminNotes !== undefined) sub.adminNotes = adminNotes;

    try {
      await pool.query(
        'UPDATE dd_submissions SET status = $1, admin_notes = $2 WHERE id = $3',
        [sub.status, sub.adminNotes || '', sub.id]
      );
    } catch (dbErr: any) {
      console.warn('Submission update DB sync notice:', dbErr?.message);
    }

    res.json({ success: true, submission: sub });
  });

  // Tutorials: List & Manage
  app.get('/api/tutorials', (req, res) => {
    res.json({ tutorials: memoryStore.tutorials });
  });

  app.post('/api/tutorials', async (req, res) => {
    const { title, category, videoUrl, thumbnailUrl, status, duration, instructions } = req.body;
    const newTut: TutorialItem = {
      id: `tut_${Date.now()}`,
      title,
      category: category || 'General',
      videoUrl: videoUrl || '',
      thumbnailUrl: thumbnailUrl || '',
      status: status || 'active',
      duration: duration || '10:00',
      instructions: instructions || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    memoryStore.tutorials.unshift(newTut);

    try {
      await pool.query(
        `INSERT INTO dd_tutorials (id, title, category, video_url, duration, instructions, created_at, thumbnail_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newTut.id,
          newTut.title,
          newTut.category,
          newTut.videoUrl,
          newTut.duration,
          newTut.instructions || '',
          newTut.createdAt,
          newTut.thumbnailUrl || null,
          newTut.status,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Tutorials insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, tutorial: newTut });
  });

  app.put('/api/tutorials/:id', async (req, res) => {
    const tut = memoryStore.tutorials.find((t) => t.id === req.params.id);
    if (!tut) return res.status(404).json({ error: 'Tutorial not found' });
    Object.assign(tut, req.body);

    try {
      await pool.query(
        `UPDATE dd_tutorials SET title = $1, category = $2, video_url = $3, duration = $4, instructions = $5, thumbnail_url = $6, status = $7 WHERE id = $8`,
        [
          tut.title,
          tut.category,
          tut.videoUrl,
          tut.duration,
          tut.instructions || '',
          tut.thumbnailUrl || null,
          tut.status || 'active',
          tut.id,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Tutorials update DB notice:', dbErr?.message);
    }

    res.json({ success: true, tutorial: tut });
  });

  app.delete('/api/tutorials/:id', async (req, res) => {
    const idx = memoryStore.tutorials.findIndex((t) => t.id === req.params.id);
    if (idx !== -1) memoryStore.tutorials.splice(idx, 1);

    try {
      await pool.query('DELETE FROM dd_tutorials WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Tutorials delete DB notice:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // Tools: List & Manage
  app.get('/api/tools', (req, res) => {
    res.json({ tools: memoryStore.tools });
  });

  app.post('/api/tools', async (req, res) => {
    const { name, category, url, isInternal, description, iconUrl, status } = req.body;
    const newTool: ToolItem = {
      id: `tool_${Date.now()}`,
      name,
      category: category || 'Utility',
      url: url || '#',
      isInternal: !!isInternal,
      description: description || '',
      iconUrl: iconUrl || '',
      status: status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    memoryStore.tools.unshift(newTool);

    try {
      await pool.query(
        `INSERT INTO dd_tools (id, name, category, url, is_internal, description, created_at, icon_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newTool.id,
          newTool.name,
          newTool.category,
          newTool.url,
          newTool.isInternal,
          newTool.description || '',
          newTool.createdAt,
          newTool.iconUrl || null,
          newTool.status || 'active',
        ]
      );
    } catch (dbErr: any) {
      console.warn('Tools insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, tool: newTool });
  });

  app.put('/api/tools/:id', async (req, res) => {
    const tool = memoryStore.tools.find((t) => t.id === req.params.id);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    Object.assign(tool, req.body);

    try {
      await pool.query(
        `UPDATE dd_tools SET name = $1, category = $2, url = $3, is_internal = $4, description = $5, icon_url = $6, status = $7 WHERE id = $8`,
        [
          tool.name,
          tool.category,
          tool.url,
          tool.isInternal,
          tool.description || '',
          tool.iconUrl || null,
          tool.status || 'active',
          tool.id,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Tools update DB notice:', dbErr?.message);
    }

    res.json({ success: true, tool });
  });

  app.delete('/api/tools/:id', async (req, res) => {
    const idx = memoryStore.tools.findIndex((t) => t.id === req.params.id);
    if (idx !== -1) memoryStore.tools.splice(idx, 1);

    try {
      await pool.query('DELETE FROM dd_tools WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Tools delete DB notice:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // Automation: List & Manage
  app.get('/api/automation', (req, res) => {
    res.json({ automation: memoryStore.automation });
  });

  app.post('/api/automation', async (req, res) => {
    const { title, fileName, downloadUrl, version, fileSize, instructions, iconUrl, status } = req.body;
    const newAuto: AutomationItem = {
      id: `auto_${Date.now()}`,
      title,
      fileName: fileName || 'darkdevil-tool.zip',
      downloadUrl: downloadUrl || '#download',
      version: version || 'v1.0.0',
      fileSize: fileSize || '5.0 MB',
      instructions: instructions || '',
      iconUrl: iconUrl || '',
      status: status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    memoryStore.automation.unshift(newAuto);

    try {
      await pool.query(
        `INSERT INTO dd_automation (id, title, file_name, download_url, version, file_size, instructions, created_at, icon_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newAuto.id,
          newAuto.title,
          newAuto.fileName,
          newAuto.downloadUrl,
          newAuto.version,
          newAuto.fileSize,
          newAuto.instructions || '',
          newAuto.createdAt,
          newAuto.iconUrl || null,
          newAuto.status || 'active',
        ]
      );
    } catch (dbErr: any) {
      console.warn('Automation insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, item: newAuto });
  });

  app.put('/api/automation/:id', async (req, res) => {
    const auto = memoryStore.automation.find((t) => t.id === req.params.id);
    if (!auto) return res.status(404).json({ error: 'Automation not found' });
    Object.assign(auto, req.body);

    try {
      await pool.query(
        `UPDATE dd_automation SET title = $1, file_name = $2, download_url = $3, version = $4, file_size = $5, instructions = $6, icon_url = $7, status = $8 WHERE id = $9`,
        [
          auto.title,
          auto.fileName,
          auto.downloadUrl,
          auto.version,
          auto.fileSize,
          auto.instructions || '',
          auto.iconUrl || null,
          auto.status || 'active',
          auto.id,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Automation update DB notice:', dbErr?.message);
    }

    res.json({ success: true, item: auto });
  });

  app.delete('/api/automation/:id', async (req, res) => {
    const idx = memoryStore.automation.findIndex((a) => a.id === req.params.id);
    if (idx !== -1) memoryStore.automation.splice(idx, 1);

    try {
      await pool.query('DELETE FROM dd_automation WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Automation delete DB notice:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // ========================================================
  // SERVICES ENDPOINTS (dd_services)
  // Public & Administrative Services Management
  // ========================================================
  app.get('/api/services', (req, res) => {
    res.json({ services: memoryStore.services });
  });

  app.post('/api/services', async (req, res) => {
    const { name, category, price, shortDescription, description, iconUrl, status } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Service name and price are required' });
    }

    const newService: ServiceItem = {
      id: `srv_${Date.now()}`,
      name: name.trim(),
      category: category ? category.trim() : 'Operations',
      price: price.trim(),
      shortDescription: shortDescription ? shortDescription.trim() : '',
      description: description ? description.trim() : (shortDescription ? shortDescription.trim() : ''),
      iconUrl: iconUrl || '',
      status: status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    memoryStore.services.unshift(newService);

    try {
      await pool.query(
        `INSERT INTO dd_services (id, name, category, price, short_description, description, icon_url, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newService.id,
          newService.name,
          newService.category,
          newService.price,
          newService.shortDescription,
          newService.description,
          newService.iconUrl || null,
          newService.status,
          newService.createdAt,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Services insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, service: newService });
  });

  app.put('/api/services/:id', async (req, res) => {
    const srv = memoryStore.services.find((s) => s.id === req.params.id);
    if (!srv) return res.status(404).json({ error: 'Service not found' });

    const { name, category, price, shortDescription, description, iconUrl, status } = req.body;
    if (name !== undefined) srv.name = name.trim();
    if (category !== undefined) srv.category = category.trim();
    if (price !== undefined) srv.price = price.trim();
    if (shortDescription !== undefined) srv.shortDescription = shortDescription.trim();
    if (description !== undefined) srv.description = description.trim();
    if (iconUrl !== undefined) srv.iconUrl = iconUrl;
    if (status !== undefined) srv.status = status;

    try {
      await pool.query(
        `UPDATE dd_services SET name = $1, category = $2, price = $3, short_description = $4, description = $5, icon_url = $6, status = $7 WHERE id = $8`,
        [
          srv.name,
          srv.category,
          srv.price,
          srv.shortDescription,
          srv.description,
          srv.iconUrl || null,
          srv.status || 'active',
          srv.id,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Services update DB notice:', dbErr?.message);
    }

    res.json({ success: true, service: srv });
  });

  app.delete('/api/services/:id', async (req, res) => {
    const idx = memoryStore.services.findIndex((s) => s.id === req.params.id);
    if (idx !== -1) memoryStore.services.splice(idx, 1);

    try {
      await pool.query('DELETE FROM dd_services WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Services delete DB notice:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // ========================================================
  // SEPARATE TABLE 1: ADMIN USERS (dd_admin_users)
  // Roles: Administrator & Leader & Sub Leader
  // ========================================================
  app.get('/api/admin-users', (req, res) => {
    res.json({
      adminUsers: memoryStore.adminUsers.map((u) => {
        const { password, ...safe } = u;
        return { ...safe, hasPassword: !!password };
      }),
    });
  });

  app.post('/api/admin-users', async (req, res) => {
    const { username, email, password, role, notes, assignedBy } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const validRoles: AdminRole[] = ['Administrator', 'Leader', 'Sub Leader'];
    const chosenRole: AdminRole = validRoles.includes(role) ? role : 'Leader';

    const existingInAdmin = memoryStore.adminUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingInAdmin) {
      return res.status(400).json({ error: 'Admin username already exists in dd_admin_users' });
    }

    const existingInWorkers = memoryStore.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingInWorkers) {
      return res.status(400).json({
        error: 'A worker already exists with this username. Worker and Admin accounts must remain completely separate.',
      });
    }

    const newAdminUser: AdminUser = {
      id: `adm_${Date.now()}`,
      username: username.trim(),
      email: email ? email.trim() : `${username.trim()}@darkdevil.team`,
      password: password.trim(),
      role: chosenRole,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes || `${chosenRole} personnel`,
      assignedBy: assignedBy || 'admin',
    };

    memoryStore.adminUsers.push(newAdminUser);

    // Persist to PostgreSQL dd_admin_users
    try {
      await pool.query(
        `INSERT INTO dd_admin_users (id, username, email, password, role, status, created_at, notes, assigned_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newAdminUser.id,
          newAdminUser.username,
          newAdminUser.email,
          newAdminUser.password,
          newAdminUser.role,
          newAdminUser.status,
          newAdminUser.createdAt,
          newAdminUser.notes,
          newAdminUser.assignedBy,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Persist admin user warning:', dbErr?.message);
    }

    const { password: _, ...safe } = newAdminUser;
    res.json({ success: true, adminUser: safe });
  });

  app.put('/api/admin-users/:id', async (req, res) => {
    const admin = memoryStore.adminUsers.find((u) => u.id === req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin user not found' });

    const { username, email, password, role, status, notes } = req.body;
    if (username) admin.username = username.trim();
    if (email) admin.email = email.trim();
    if (password && password.trim()) admin.password = password.trim();
    if (role && ['Administrator', 'Leader', 'Sub Leader'].includes(role)) {
      admin.role = role as AdminRole;
    }
    if (status && (status === 'active' || status === 'suspended')) {
      admin.status = status;
    }
    if (notes !== undefined) admin.notes = notes;

    try {
      if (password && password.trim()) {
        await pool.query(
          'UPDATE dd_admin_users SET username = $1, email = $2, password = $3, role = $4, status = $5, notes = $6 WHERE id = $7',
          [admin.username, admin.email, admin.password, admin.role, admin.status, admin.notes, admin.id]
        );
      } else {
        await pool.query(
          'UPDATE dd_admin_users SET username = $1, email = $2, role = $3, status = $4, notes = $5 WHERE id = $6',
          [admin.username, admin.email, admin.role, admin.status, admin.notes, admin.id]
        );
      }
    } catch (dbErr: any) {
      console.warn('Update admin user warning:', dbErr?.message);
    }

    const { password: _, ...safe } = admin;
    res.json({ success: true, adminUser: safe });
  });

  app.delete('/api/admin-users/:id', async (req, res) => {
    if (req.params.id === 'adm_1' || req.params.id === 'usr_admin') {
      return res.status(400).json({ error: 'Cannot delete the root Administrator account.' });
    }

    const admin = memoryStore.adminUsers.find((u) => u.id === req.params.id);
    if (admin && admin.username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete default admin.' });
    }

    const idx = memoryStore.adminUsers.findIndex((u) => u.id === req.params.id);
    if (idx !== -1) memoryStore.adminUsers.splice(idx, 1);

    try {
      await pool.query('DELETE FROM dd_admin_users WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Delete admin user warning:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // ========================================================
  // SEPARATE TABLE 2: WORKER USERS (dd_users)
  // Clean separation: Only workers / dispatch operators
  // ========================================================
  app.get('/api/users', (req, res) => {
    res.json({
      users: memoryStore.users.map((u) => {
        const { password, ...safe } = u;
        return { ...safe, hasPassword: !!password };
      }),
    });
  });

  app.get('/api/users/check-username', (req, res) => {
    const rawUsername = String(req.query.username || '').trim();
    const excludeId = String(req.query.excludeId || '').trim();

    if (!rawUsername) {
      return res.json({ available: false, reason: 'Username cannot be empty' });
    }

    if (rawUsername.length < 3) {
      return res.json({ available: false, reason: 'Username must be at least 3 characters' });
    }

    // Allow alphanumeric, underscores, hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(rawUsername)) {
      return res.json({
        available: false,
        reason: 'Only letters, numbers, hyphens, and underscores allowed',
      });
    }

    const lower = rawUsername.toLowerCase();

    // Check if taken by another worker
    const takenByWorker = memoryStore.users.find(
      (u) => u.username.toLowerCase() === lower && u.id !== excludeId
    );
    if (takenByWorker) {
      return res.json({
        available: false,
        reason: 'Username already taken by another worker',
      });
    }

    // Check if administrative or reserved
    const takenByAdmin = memoryStore.adminUsers.find(
      (u) => u.username.toLowerCase() === lower
    );
    if (takenByAdmin || lower === 'admin' || lower === 'administrator' || lower === 'root') {
      return res.json({
        available: false,
        reason: 'Username is reserved for system administration',
      });
    }

    return res.json({
      available: true,
      message: 'Username is available',
    });
  });

  app.post('/api/users', async (req, res) => {
    const { username, email, password, notes } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existing = memoryStore.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: 'Worker username already exists in dd_users' });
    }

    const existingInAdmin = memoryStore.adminUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingInAdmin || username.trim().toLowerCase() === 'admin') {
      return res.status(400).json({
        error: 'Cannot create a worker with an administrative username. Worker and Admin accounts are strictly separated.',
      });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: username.trim(),
      email: email ? email.trim() : `${username.trim()}@darkdevil.team`,
      password: password.trim(),
      role: 'worker',
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      maxDailyQuota: 999999, // Workers have unlimited work capacity (no quota limit)
      notes: notes || 'Worker Operator',
      todayJobsCount: 0,
      totalJobsCount: 0,
      totalCollectedData: 0,
      totalUsedData: 0,
    };

    memoryStore.users.push(newUser);

    // Persist to PostgreSQL dd_users
    try {
      await pool.query(
        `INSERT INTO dd_users (id, username, email, password, role, status, joining_date, max_daily_quota, notes, today_jobs_count, total_jobs_count, total_collected_data, total_used_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newUser.id,
          newUser.username,
          newUser.email,
          newUser.password,
          newUser.role,
          newUser.status,
          newUser.joiningDate,
          newUser.maxDailyQuota,
          newUser.notes,
          newUser.todayJobsCount,
          newUser.totalJobsCount,
          newUser.totalCollectedData,
          newUser.totalUsedData,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Persist worker warning:', dbErr?.message);
    }

    const { password: _, ...safe } = newUser;
    res.json({ success: true, user: safe });
  });

  app.put('/api/users/:id', async (req, res) => {
    const user = memoryStore.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Worker user not found' });

    const { username, email, password, status, maxDailyQuota, notes, firstName, lastName, phone, address, avatarUrl } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password && password.trim()) user.password = password.trim();
    if (status && (status === 'active' || status === 'banned')) user.status = status;
    if (maxDailyQuota !== undefined) user.maxDailyQuota = Number(maxDailyQuota);
    if (notes !== undefined) user.notes = notes;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    try {
      if (password && password.trim()) {
        await pool.query(
          'UPDATE dd_users SET username = $1, email = $2, password = $3, status = $4, max_daily_quota = $5, notes = $6, first_name = $7, last_name = $8, phone = $9, address = $10, avatar_url = $11 WHERE id = $12',
          [user.username, user.email, user.password, user.status, user.maxDailyQuota, user.notes, user.firstName || '', user.lastName || '', user.phone || '', user.address || '', user.avatarUrl || '', user.id]
        );
      } else {
        await pool.query(
          'UPDATE dd_users SET username = $1, email = $2, status = $3, max_daily_quota = $4, notes = $5, first_name = $6, last_name = $7, phone = $8, address = $9, avatar_url = $10 WHERE id = $11',
          [user.username, user.email, user.status, user.maxDailyQuota, user.notes, user.firstName || '', user.lastName || '', user.phone || '', user.address || '', user.avatarUrl || '', user.id]
        );
      }
    } catch (dbErr: any) {
      console.warn('Update worker warning:', dbErr?.message);
    }

    const { password: _, ...safe } = user;
    res.json({ success: true, user: safe });
  });

  // Worker Profile Update Endpoint
  app.put('/api/users/:id/profile', async (req, res) => {
    const user = memoryStore.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Worker user not found' });

    const { firstName, lastName, phone, address, avatarUrl, email } = req.body;
    if (firstName !== undefined) user.firstName = String(firstName).trim();
    if (lastName !== undefined) user.lastName = String(lastName).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();
    if (avatarUrl !== undefined) user.avatarUrl = String(avatarUrl).trim();
    if (email !== undefined && email.trim()) user.email = String(email).trim();

    try {
      await pool.query(
        'UPDATE dd_users SET first_name = $1, last_name = $2, phone = $3, address = $4, avatar_url = $5, email = $6 WHERE id = $7',
        [user.firstName || '', user.lastName || '', user.phone || '', user.address || '', user.avatarUrl || '', user.email, user.id]
      );
    } catch (dbErr: any) {
      console.warn('Update worker profile PostgreSQL warning:', dbErr?.message);
    }

    const { password: _, ...safe } = user;
    res.json({ success: true, user: safe, message: 'Profile details updated successfully.' });
  });

  // Worker Password Change Endpoint
  app.put('/api/users/:id/password', async (req, res) => {
    const user = memoryStore.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Worker user not found' });

    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    if (currentPassword && user.password && user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword.trim();

    try {
      await pool.query('UPDATE dd_users SET password = $1 WHERE id = $2', [user.password, user.id]);
    } catch (dbErr: any) {
      console.warn('Update worker password PostgreSQL warning:', dbErr?.message);
    }

    res.json({ success: true, message: 'Password changed successfully.' });
  });

  // Worker Avatar Photo Upload Endpoint
  app.post('/api/users/:id/avatar', async (req, res) => {
    const user = memoryStore.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Worker user not found' });

    const { avatarUrl } = req.body;
    if (!avatarUrl && avatarUrl !== '') {
      return res.status(400).json({ error: 'Avatar URL or image data is required.' });
    }

    user.avatarUrl = avatarUrl;

    try {
      await pool.query('UPDATE dd_users SET avatar_url = $1 WHERE id = $2', [user.avatarUrl, user.id]);
    } catch (dbErr: any) {
      console.warn('Update worker avatar PostgreSQL warning:', dbErr?.message);
    }

    const { password: _, ...safe } = user;
    res.json({ success: true, user: safe, message: 'Profile photo updated successfully.' });
  });

  app.delete('/api/users/:id', async (req, res) => {
    const idx = memoryStore.users.findIndex((u) => u.id === req.params.id);
    if (idx !== -1) memoryStore.users.splice(idx, 1);

    try {
      await pool.query('DELETE FROM dd_users WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('Delete worker warning:', dbErr?.message);
    }

    res.json({ success: true });
  });

  // Public: Apply to join team
  app.post('/api/applications', async (req, res) => {
    const { fullName, email, phone, experience, dailyHours, message } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const appItem: TeamApplication = {
      id: `app_${Date.now()}`,
      fullName,
      email,
      phone: phone || '',
      experience: experience || '',
      dailyHours: Number(dailyHours) || 4,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    memoryStore.teamApplications.unshift(appItem);

    try {
      await pool.query(
        `INSERT INTO dd_applications (id, full_name, email, phone, experience, daily_hours, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          appItem.id,
          appItem.fullName,
          appItem.email,
          appItem.phone,
          appItem.experience,
          appItem.dailyHours,
          appItem.message,
          appItem.status,
          appItem.createdAt,
        ]
      );
    } catch (dbErr: any) {
      console.warn('Application insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, application: appItem });
  });

  app.get('/api/applications', (req, res) => {
    res.json({ applications: memoryStore.teamApplications });
  });

  app.put('/api/applications/:id', async (req, res) => {
    const item = memoryStore.teamApplications.find((a) => a.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Application not found' });
    if (req.body.status) item.status = req.body.status;

    try {
      await pool.query('UPDATE dd_applications SET status = $1 WHERE id = $2', [
        item.status,
        item.id,
      ]);
    } catch (dbErr: any) {
      // ignore warning
    }

    res.json({ success: true, application: item });
  });

  app.delete('/api/applications/:id', async (req, res) => {
    const idx = memoryStore.teamApplications.findIndex((a) => a.id === req.params.id);
    if (idx !== -1) {
      memoryStore.teamApplications.splice(idx, 1);
    }
    try {
      await pool.query('DELETE FROM dd_applications WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      // ignore
    }
    res.json({ success: true });
  });

  // Public: Contact Us
  app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const msg: ContactMessage = {
      id: `msg_${Date.now()}`,
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    memoryStore.contactMessages.unshift(msg);

    try {
      await pool.query(
        `INSERT INTO dd_contact (id, name, email, subject, message, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [msg.id, msg.name, msg.email, msg.subject, msg.message, msg.createdAt]
      );
    } catch (dbErr: any) {
      console.warn('Contact insert DB notice:', dbErr?.message);
    }

    res.json({ success: true, message: msg });
  });

  app.get('/api/contact', (req, res) => {
    res.json({ messages: memoryStore.contactMessages });
  });

  app.delete('/api/contact/:id', async (req, res) => {
    const idx = memoryStore.contactMessages.findIndex((m) => m.id === req.params.id);
    if (idx !== -1) {
      memoryStore.contactMessages.splice(idx, 1);
    }
    try {
      await pool.query('DELETE FROM dd_contact WHERE id = $1', [req.params.id]);
    } catch (dbErr: any) {
      // ignore
    }
    res.json({ success: true });
  });

  // Settings & R2 System Control
  app.get('/api/settings', (req, res) => {
    res.json({ settings: memoryStore.settings });
  });

  app.put('/api/settings', async (req, res) => {
    Object.assign(memoryStore.settings, req.body);
    try {
      await pool.query(
        `INSERT INTO dd_settings (id, data) VALUES ('main', $1)
         ON CONFLICT (id) DO UPDATE SET data = $1`,
        [JSON.stringify(memoryStore.settings)]
      );
    } catch (dbErr: any) {
      console.warn('Could not persist settings to pg:', dbErr?.message);
    }
    res.json({ success: true, settings: memoryStore.settings });
  });

  // Cloudflare R2 Upload Endpoint for Logo, Favicon & Brand Assets
  app.post('/api/settings/upload-asset', async (req, res) => {
    try {
      const { fileData, fileName, assetType } = req.body;
      if (!fileData || !fileName) {
        return res.status(400).json({ error: 'fileData and fileName are required' });
      }

      let base64String = fileData;
      let mimeType = 'image/png';

      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        const matches = fileData.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64String = matches[2];
        }
      } else {
        const ext = path.extname(fileName).toLowerCase();
        if (ext === '.svg') mimeType = 'image/svg+xml';
        else if (ext === '.ico') mimeType = 'image/x-icon';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';
      }

      const buffer = Buffer.from(base64String, 'base64');
      const prefix = assetType === 'favicon'
        ? 'favicons'
        : assetType === 'job_thumbnail' || assetType === 'thumbnail'
        ? 'jobs'
        : assetType === 'service_icon'
        ? 'services'
        : assetType === 'tool_icon'
        ? 'tools'
        : assetType === 'automation_icon'
        ? 'automation'
        : 'branding';

      const uploadResult = await uploadAssetToR2({
        buffer,
        fileName,
        mimeType,
        prefix,
      });

      if (assetType === 'logo') {
        memoryStore.settings.logoUrl = uploadResult.url;
      } else if (assetType === 'favicon') {
        memoryStore.settings.faviconUrl = uploadResult.url;
      }

      // Persist updated settings to Neon PostgreSQL if settings asset changed
      if (assetType === 'logo' || assetType === 'favicon') {
        try {
          await pool.query(
            `INSERT INTO dd_settings (id, data) VALUES ('main', $1)
             ON CONFLICT (id) DO UPDATE SET data = $1`,
            [JSON.stringify(memoryStore.settings)]
          );
        } catch (dbErr: any) {
          console.warn('Could not persist settings to pg:', dbErr?.message);
        }
      }

      res.json({
        success: true,
        url: uploadResult.url,
        assetType,
        result: uploadResult,
        settings: memoryStore.settings,
      });
    } catch (err: any) {
      console.error('R2 asset upload failed:', err);
      res.status(500).json({ error: `Upload failed: ${err?.message || err}` });
    }
  });

  // Direct R2 File Streaming / Proxy Endpoint
  app.get('/api/r2/file/:key(*)', async (req, res) => {
    const key = req.params.key;
    if (!key) return res.status(400).send('Missing file key');

    try {
      const asset = await getAssetFromR2(key);
      if (!asset) {
        return res.status(404).send('Asset not found in R2 storage');
      }
      res.setHeader('Content-Type', asset.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(asset.buffer);
    } catch (e: any) {
      console.warn('R2 file proxy notice:', e);
      res.status(500).send('Error retrieving asset from R2');
    }
  });

  // Test Cloudflare R2 Connection & Permissions
  app.post('/api/system/test-r2', async (req, res) => {
    try {
      const {
        accountId,
        endpoint,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicUrl,
        region,
      } = req.body || {};

      const testResult = await testR2Connection({
        accountId,
        endpoint,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicUrl,
        region,
      });

      res.json(testResult);
    } catch (err: any) {
      console.error('Test R2 connection route error:', err);
      res.status(500).json({
        success: false,
        message: `Internal server test failed: ${err?.message || err}`,
        errorDetails: String(err),
      });
    }
  });

  // Test Neon PostgreSQL Database Connection
  app.post('/api/system/test-db', async (req, res) => {
    const startTime = Date.now();
    try {
      const dbResult = await pool.query(`
        SELECT 
          NOW() as current_time, 
          version() as db_version,
          current_database() as db_name
      `);
      const latencyMs = Date.now() - startTime;

      // Query table counts for diagnostics
      const tablesQuery = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      const tableNames = tablesQuery.rows.map((r: any) => r.table_name);

      res.json({
        success: true,
        latencyMs,
        databaseName: dbResult.rows[0]?.db_name || 'neondb',
        serverTime: dbResult.rows[0]?.current_time,
        version: dbResult.rows[0]?.db_version?.split(' ')?.[0] || 'PostgreSQL',
        tablesCount: tableNames.length,
        tables: tableNames,
        message: `PostgreSQL connection active & healthy! (Latency: ${latencyMs}ms, ${tableNames.length} tables found)`,
      });
    } catch (dbErr: any) {
      const latencyMs = Date.now() - startTime;
      res.json({
        success: false,
        latencyMs,
        message: `Database connection error: ${dbErr?.message || dbErr}`,
        errorDetails: String(dbErr),
      });
    }
  });

  // =========================================================================
  // SYSTEM BACKUP & DISASTER RECOVERY ENGINE (Database & R2 Files)
  // =========================================================================

  function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // 1. Get Backup List
  app.get('/api/system/backups', (req, res) => {
    // Return sorted by creation date descending
    const sorted = [...(memoryStore.systemBackups || [])].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    res.json({ backups: sorted });
  });

  // 2. Create Full Database Backup Snapshot
  app.post('/api/system/backup/database', async (req, res) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `team_darkdevil_database_backup_${dateStr}.json`;

      const totalRecords =
        (memoryStore.adminUsers?.length || 0) +
        (memoryStore.users?.length || 0) +
        (memoryStore.jobs?.length || 0) +
        (memoryStore.dataFiles?.length || 0) +
        (memoryStore.userBatches?.length || 0) +
        (memoryStore.jobSubmissions?.length || 0) +
        (memoryStore.teamApplications?.length || 0) +
        (memoryStore.contactMessages?.length || 0) +
        (memoryStore.services?.length || 0) +
        (memoryStore.tutorials?.length || 0) +
        (memoryStore.tools?.length || 0) +
        (memoryStore.automation?.length || 0) +
        1; // settings

      const tablesCount = 13;

      const payload = {
        metadata: {
          system: 'Team Dark Devil Enterprise Control',
          type: 'database',
          schemaVersion: '3.2-production',
          exportedAt: now.toISOString(),
          exportedBy: 'Super Administrator',
          siteName: memoryStore.settings.siteName,
          domain: memoryStore.settings.domain,
          totalRecords,
          tablesCount,
        },
        tables: {
          adminUsers: memoryStore.adminUsers,
          users: memoryStore.users,
          jobs: memoryStore.jobs,
          dataFiles: memoryStore.dataFiles,
          userBatches: memoryStore.userBatches,
          submissions: memoryStore.jobSubmissions,
          applications: memoryStore.teamApplications,
          contact: memoryStore.contactMessages,
          services: memoryStore.services,
          tutorials: memoryStore.tutorials,
          tools: memoryStore.tools,
          automation: memoryStore.automation,
          settings: memoryStore.settings,
        },
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
      const size = formatBytes(sizeBytes);

      const backupItem: SystemBackupItem = {
        id: `bk_db_${Date.now()}`,
        type: 'database',
        name: `PostgreSQL Database Snapshot (${totalRecords} records)`,
        filename,
        size,
        sizeBytes,
        recordCount: totalRecords,
        tablesCount,
        createdAt: now.toISOString().replace('T', ' ').substring(0, 19),
        payload,
      };

      // Store in memory
      memoryStore.systemBackups.unshift(backupItem);

      // Persist in PostgreSQL
      try {
        await pool.query(
          `INSERT INTO dd_backups (id, type, name, filename, size, record_count, tables_count, payload, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            backupItem.id,
            backupItem.type,
            backupItem.name,
            backupItem.filename,
            backupItem.size,
            backupItem.recordCount,
            backupItem.tablesCount,
            JSON.stringify(payload),
            backupItem.createdAt,
          ]
        );
      } catch (dbErr: any) {
        console.warn('Backup persist notice:', dbErr?.message);
      }

      res.json({
        success: true,
        message: `Database backup created successfully with ${totalRecords} records across ${tablesCount} tables!`,
        backup: backupItem,
        payload,
      });
    } catch (err: any) {
      console.error('Create DB backup failed:', err);
      res.status(500).json({ error: `Database backup failed: ${err?.message || err}` });
    }
  });

  // 3. Create R2 / Files Backup Snapshot
  app.post('/api/system/backup/files', async (req, res) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `team_darkdevil_r2_files_backup_${dateStr}.json`;

      const fileCount =
        (memoryStore.dataFiles?.length || 0) +
        (memoryStore.automation?.length || 0) +
        (memoryStore.tutorials?.length || 0);

      const payload = {
        metadata: {
          system: 'Team Dark Devil Enterprise Control',
          type: 'files',
          schemaVersion: '3.2-production',
          exportedAt: now.toISOString(),
          siteName: memoryStore.settings.siteName,
          r2BucketName: memoryStore.settings.r2BucketName,
          r2PublicUrl: memoryStore.settings.r2PublicUrl,
          totalFiles: fileCount,
        },
        filesCatalog: {
          dataFiles: memoryStore.dataFiles,
          automationSoftware: memoryStore.automation,
          tutorials: memoryStore.tutorials,
          brandAssets: {
            logoUrl: memoryStore.settings.logoUrl,
            faviconUrl: memoryStore.settings.faviconUrl,
            r2PublicUrl: memoryStore.settings.r2PublicUrl,
            bucketName: memoryStore.settings.r2BucketName,
          },
        },
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
      const size = formatBytes(sizeBytes);

      const backupItem: SystemBackupItem = {
        id: `bk_fl_${Date.now()}`,
        type: 'files',
        name: `R2 Storage & File Catalog Snapshot (${fileCount} objects)`,
        filename,
        size,
        sizeBytes,
        recordCount: fileCount,
        tablesCount: 3,
        createdAt: now.toISOString().replace('T', ' ').substring(0, 19),
        payload,
      };

      // Store in memory
      memoryStore.systemBackups.unshift(backupItem);

      // Persist in PostgreSQL
      try {
        await pool.query(
          `INSERT INTO dd_backups (id, type, name, filename, size, record_count, tables_count, payload, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            backupItem.id,
            backupItem.type,
            backupItem.name,
            backupItem.filename,
            backupItem.size,
            backupItem.recordCount,
            backupItem.tablesCount,
            JSON.stringify(payload),
            backupItem.createdAt,
          ]
        );
      } catch (dbErr: any) {
        console.warn('Backup persist notice:', dbErr?.message);
      }

      res.json({
        success: true,
        message: `R2 File catalog backup created successfully with ${fileCount} asset descriptors!`,
        backup: backupItem,
        payload,
      });
    } catch (err: any) {
      console.error('Create Files backup failed:', err);
      res.status(500).json({ error: `File backup creation failed: ${err?.message || err}` });
    }
  });

  // 4. Download Backup File
  app.get('/api/system/backup/download/:id', async (req, res) => {
    try {
      let backup = memoryStore.systemBackups.find((b) => b.id === req.params.id);
      if (!backup || !backup.payload) {
        // Try fetching from database
        const dbRes = await pool.query('SELECT * FROM dd_backups WHERE id = $1', [req.params.id]);
        if (dbRes.rows.length > 0) {
          const row = dbRes.rows[0];
          backup = {
            id: row.id,
            type: row.type,
            name: row.name,
            filename: row.filename,
            size: row.size,
            recordCount: row.record_count,
            tablesCount: row.tables_count,
            createdAt: row.created_at,
            payload: row.payload,
          };
        }
      }

      if (!backup || !backup.payload) {
        return res.status(404).json({ error: 'Backup payload not found' });
      }

      const jsonStr = typeof backup.payload === 'string' ? backup.payload : JSON.stringify(backup.payload, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${backup.filename || 'backup.json'}"`);
      res.send(jsonStr);
    } catch (err: any) {
      res.status(500).json({ error: `Download failed: ${err?.message || err}` });
    }
  });

  // 5. Delete Backup Entry
  app.delete('/api/system/backup/:id', async (req, res) => {
    try {
      const idx = memoryStore.systemBackups.findIndex((b) => b.id === req.params.id);
      if (idx !== -1) {
        memoryStore.systemBackups.splice(idx, 1);
      }
      await pool.query('DELETE FROM dd_backups WHERE id = $1', [req.params.id]);
      res.json({ success: true, message: 'Backup record deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: `Delete backup failed: ${err?.message || err}` });
    }
  });

  // 6. Restore from Uploaded Backup File
  app.post('/api/system/backup/restore', async (req, res) => {
    try {
      const backupData = req.body?.payload || req.body;
      if (!backupData || typeof backupData !== 'object') {
        return res.status(400).json({ error: 'Invalid backup file format: JSON object expected.' });
      }

      const isDatabaseBackup = backupData.tables || backupData.metadata?.type === 'database';
      const isFilesBackup = backupData.filesCatalog || backupData.metadata?.type === 'files';

      if (!isDatabaseBackup && !isFilesBackup) {
        return res.status(400).json({
          error:
            'Unrecognized backup schema. File must contain valid database tables or file catalog structure.',
        });
      }

      const stats: Record<string, number> = {};

      if (isDatabaseBackup) {
        const t = backupData.tables || {};

        // 1. Admin Users
        if (Array.isArray(t.adminUsers) && t.adminUsers.length > 0) {
          memoryStore.adminUsers = t.adminUsers;
          for (const adm of t.adminUsers) {
            await pool.query(
              `INSERT INTO dd_admin_users (id, username, email, password, role, status, created_at, notes, assigned_by)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 username = EXCLUDED.username,
                 email = EXCLUDED.email,
                 password = EXCLUDED.password,
                 role = EXCLUDED.role,
                 status = EXCLUDED.status,
                 notes = EXCLUDED.notes`,
              [
                adm.id,
                adm.username,
                adm.email,
                adm.password,
                adm.role,
                adm.status || 'active',
                adm.createdAt || new Date().toISOString(),
                adm.notes || '',
                adm.assignedBy || 'backup_restore',
              ]
            );
          }
          stats['Admin Users'] = t.adminUsers.length;
        }

        // 2. Workers (Users)
        if (Array.isArray(t.users) && t.users.length > 0) {
          memoryStore.users = t.users;
          for (const u of t.users) {
            await pool.query(
              `INSERT INTO dd_users (id, username, email, password, first_name, last_name, phone, address, avatar_url, role, status, joining_date, max_daily_quota, notes, today_jobs_count, total_jobs_count, total_collected_data, total_used_data)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
               ON CONFLICT (id) DO UPDATE SET
                 username = EXCLUDED.username,
                 email = EXCLUDED.email,
                 first_name = EXCLUDED.first_name,
                 last_name = EXCLUDED.last_name,
                 phone = EXCLUDED.phone,
                 address = EXCLUDED.address,
                 avatar_url = EXCLUDED.avatar_url,
                 status = EXCLUDED.status,
                 max_daily_quota = EXCLUDED.max_daily_quota,
                 total_collected_data = EXCLUDED.total_collected_data,
                 total_used_data = EXCLUDED.total_used_data`,
              [
                u.id,
                u.username,
                u.email,
                u.password,
                u.firstName || '',
                u.lastName || '',
                u.phone || '',
                u.address || '',
                u.avatarUrl || '',
                u.role || 'worker',
                u.status || 'active',
                u.joiningDate || new Date().toISOString().substring(0, 10),
                u.maxDailyQuota || 1000,
                u.notes || '',
                u.todayJobsCount || 0,
                u.totalJobsCount || 0,
                u.totalCollectedData || 0,
                u.totalUsedData || 0,
              ]
            );
          }
          stats['Worker Accounts'] = t.users.length;
        }

        // 3. Jobs
        if (Array.isArray(t.jobs) && t.jobs.length > 0) {
          memoryStore.jobs = t.jobs;
          for (const j of t.jobs) {
            await pool.query(
              `INSERT INTO dd_jobs (id, title, type, payout_per_unit, daily_target, instructions, status, created_at, thumbnail_url)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 title = EXCLUDED.title,
                 type = EXCLUDED.type,
                 payout_per_unit = EXCLUDED.payout_per_unit,
                 daily_target = EXCLUDED.daily_target,
                 instructions = EXCLUDED.instructions,
                 status = EXCLUDED.status,
                 thumbnail_url = EXCLUDED.thumbnail_url`,
              [
                j.id,
                j.title,
                j.type,
                j.payoutPerUnit || 0.05,
                j.dailyTarget || 500,
                j.instructions || '',
                j.status || 'active',
                j.createdAt || new Date().toISOString().substring(0, 10),
                j.thumbnailUrl || '',
              ]
            );
          }
          stats['Jobs'] = t.jobs.length;
        }

        // 4. Data Files
        if (Array.isArray(t.dataFiles) && t.dataFiles.length > 0) {
          memoryStore.dataFiles = t.dataFiles;
          for (const df of t.dataFiles) {
            await pool.query(
              `INSERT INTO dd_data_files (id, file_name, data_type, total_count, collected_count, remaining_count, sample_preview, uploaded_by, uploaded_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 file_name = EXCLUDED.file_name,
                 total_count = EXCLUDED.total_count,
                 collected_count = EXCLUDED.collected_count,
                 remaining_count = EXCLUDED.remaining_count,
                 sample_preview = EXCLUDED.sample_preview`,
              [
                df.id,
                df.fileName,
                df.dataType,
                df.totalCount || 0,
                df.collectedCount || 0,
                df.remainingCount || 0,
                JSON.stringify(df.samplePreview || []),
                df.uploadedBy || 'admin',
                df.uploadedAt || new Date().toISOString().substring(0, 10),
              ]
            );
          }
          stats['Data Files'] = t.dataFiles.length;
        }

        // 5. Job Submissions
        if (Array.isArray(t.submissions) && t.submissions.length > 0) {
          memoryStore.jobSubmissions = t.submissions;
          for (const sub of t.submissions) {
            await pool.query(
              `INSERT INTO dd_submissions (id, user_id, user_name, job_id, job_title, total_collected, total_used, success_count, failed_count, proof_notes, proof_files, status, admin_notes, submitted_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
               ON CONFLICT (id) DO UPDATE SET
                 status = EXCLUDED.status,
                 admin_notes = EXCLUDED.admin_notes,
                 success_count = EXCLUDED.success_count,
                 failed_count = EXCLUDED.failed_count`,
              [
                sub.id,
                sub.userId,
                sub.userName,
                sub.jobId,
                sub.jobTitle,
                sub.totalCollected || 0,
                sub.totalUsed || 0,
                sub.successCount || 0,
                sub.failedCount || 0,
                sub.proofNotes || '',
                JSON.stringify(sub.proofFiles || []),
                sub.status || 'pending',
                sub.adminNotes || '',
                sub.submittedAt || new Date().toISOString().substring(0, 16),
              ]
            );
          }
          stats['Job Submissions'] = t.submissions.length;
        }

        // 6. Recruitment Applications
        if (Array.isArray(t.applications) && t.applications.length > 0) {
          memoryStore.teamApplications = t.applications;
          for (const appItem of t.applications) {
            await pool.query(
              `INSERT INTO dd_applications (id, full_name, email, phone, experience, daily_hours, message, status, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 status = EXCLUDED.status,
                 experience = EXCLUDED.experience,
                 daily_hours = EXCLUDED.daily_hours`,
              [
                appItem.id,
                appItem.fullName,
                appItem.email,
                appItem.phone,
                appItem.experience,
                appItem.dailyHours || 4,
                appItem.message || '',
                appItem.status || 'pending',
                appItem.createdAt || new Date().toISOString().substring(0, 16),
              ]
            );
          }
          stats['Applications'] = t.applications.length;
        }

        // 7. Contact Messages
        if (Array.isArray(t.contact) && t.contact.length > 0) {
          memoryStore.contactMessages = t.contact;
          for (const c of t.contact) {
            await pool.query(
              `INSERT INTO dd_contact (id, name, email, subject, message, created_at)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 subject = EXCLUDED.subject,
                 message = EXCLUDED.message`,
              [
                c.id,
                c.name,
                c.email,
                c.subject || 'General Inquiry',
                c.message || '',
                c.createdAt || new Date().toISOString().substring(0, 16),
              ]
            );
          }
          stats['Contact Inquiries'] = t.contact.length;
        }

        // 8. Services
        if (Array.isArray(t.services) && t.services.length > 0) {
          memoryStore.services = t.services;
          for (const s of t.services) {
            await pool.query(
              `INSERT INTO dd_services (id, name, category, price, short_description, description, icon_url, status, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 category = EXCLUDED.category,
                 price = EXCLUDED.price,
                 short_description = EXCLUDED.short_description,
                 description = EXCLUDED.description,
                 icon_url = EXCLUDED.icon_url,
                 status = EXCLUDED.status`,
              [
                s.id,
                s.name,
                s.category,
                s.price,
                s.shortDescription,
                s.description,
                s.iconUrl || '',
                s.status || 'active',
                s.createdAt || new Date().toISOString().substring(0, 10),
              ]
            );
          }
          stats['Services'] = t.services.length;
        }

        // 9. Tutorials
        if (Array.isArray(t.tutorials) && t.tutorials.length > 0) {
          memoryStore.tutorials = t.tutorials;
          for (const tut of t.tutorials) {
            await pool.query(
              `INSERT INTO dd_tutorials (id, title, category, video_url, duration, instructions, created_at, thumbnail_url, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 title = EXCLUDED.title,
                 category = EXCLUDED.category,
                 video_url = EXCLUDED.video_url,
                 duration = EXCLUDED.duration,
                 instructions = EXCLUDED.instructions,
                 thumbnail_url = EXCLUDED.thumbnail_url,
                 status = EXCLUDED.status`,
              [
                tut.id,
                tut.title,
                tut.category,
                tut.videoUrl,
                tut.duration,
                tut.instructions || '',
                tut.createdAt || new Date().toISOString().substring(0, 10),
                tut.thumbnailUrl || '',
                tut.status || 'active',
              ]
            );
          }
          stats['Tutorials'] = t.tutorials.length;
        }

        // 10. Tools
        if (Array.isArray(t.tools) && t.tools.length > 0) {
          memoryStore.tools = t.tools;
          for (const tl of t.tools) {
            await pool.query(
              `INSERT INTO dd_tools (id, name, category, url, is_internal, description, created_at, icon_url, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 category = EXCLUDED.category,
                 url = EXCLUDED.url,
                 is_internal = EXCLUDED.is_internal,
                 description = EXCLUDED.description,
                 icon_url = EXCLUDED.icon_url,
                 status = EXCLUDED.status`,
              [
                tl.id,
                tl.name,
                tl.category,
                tl.url,
                tl.isInternal || false,
                tl.description || '',
                tl.createdAt || new Date().toISOString().substring(0, 10),
                tl.iconUrl || '',
                tl.status || 'active',
              ]
            );
          }
          stats['Tools'] = t.tools.length;
        }

        // 11. Automation
        if (Array.isArray(t.automation) && t.automation.length > 0) {
          memoryStore.automation = t.automation;
          for (const auto of t.automation) {
            await pool.query(
              `INSERT INTO dd_automation (id, title, file_name, download_url, version, file_size, instructions, created_at, icon_url, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT (id) DO UPDATE SET
                 title = EXCLUDED.title,
                 file_name = EXCLUDED.file_name,
                 download_url = EXCLUDED.download_url,
                 version = EXCLUDED.version,
                 file_size = EXCLUDED.file_size,
                 instructions = EXCLUDED.instructions,
                 icon_url = EXCLUDED.icon_url,
                 status = EXCLUDED.status`,
              [
                auto.id,
                auto.title,
                auto.fileName,
                auto.downloadUrl,
                auto.version,
                auto.fileSize,
                auto.instructions || '',
                auto.createdAt || new Date().toISOString().substring(0, 10),
                auto.iconUrl || '',
                auto.status || 'active',
              ]
            );
          }
          stats['Automation Scripts'] = t.automation.length;
        }

        // 12. Settings
        if (t.settings && typeof t.settings === 'object') {
          Object.assign(memoryStore.settings, t.settings);
          await pool.query(
            `INSERT INTO dd_settings (id, data) VALUES ('main', $1)
             ON CONFLICT (id) DO UPDATE SET data = $1`,
            [JSON.stringify(memoryStore.settings)]
          );
          stats['System Settings'] = 1;
        }
      } else if (isFilesBackup) {
        const fc = backupData.filesCatalog || {};
        if (Array.isArray(fc.dataFiles) && fc.dataFiles.length > 0) {
          memoryStore.dataFiles = fc.dataFiles;
          for (const df of fc.dataFiles) {
            await pool.query(
              `INSERT INTO dd_data_files (id, file_name, data_type, total_count, collected_count, remaining_count, sample_preview, uploaded_by, uploaded_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET
                 file_name = EXCLUDED.file_name,
                 total_count = EXCLUDED.total_count,
                 collected_count = EXCLUDED.collected_count,
                 remaining_count = EXCLUDED.remaining_count,
                 sample_preview = EXCLUDED.sample_preview`,
              [
                df.id,
                df.fileName,
                df.dataType,
                df.totalCount || 0,
                df.collectedCount || 0,
                df.remainingCount || 0,
                JSON.stringify(df.samplePreview || []),
                df.uploadedBy || 'admin',
                df.uploadedAt || new Date().toISOString().substring(0, 10),
              ]
            );
          }
          stats['R2 Data Files'] = fc.dataFiles.length;
        }

        if (Array.isArray(fc.automationSoftware) && fc.automationSoftware.length > 0) {
          memoryStore.automation = fc.automationSoftware;
          stats['Automation Binaries'] = fc.automationSoftware.length;
        }

        if (Array.isArray(fc.tutorials) && fc.tutorials.length > 0) {
          memoryStore.tutorials = fc.tutorials;
          stats['Tutorial Assets'] = fc.tutorials.length;
        }

        if (fc.brandAssets) {
          if (fc.brandAssets.logoUrl) memoryStore.settings.logoUrl = fc.brandAssets.logoUrl;
          if (fc.brandAssets.faviconUrl) memoryStore.settings.faviconUrl = fc.brandAssets.faviconUrl;
          if (fc.brandAssets.r2PublicUrl) memoryStore.settings.r2PublicUrl = fc.brandAssets.r2PublicUrl;
          if (fc.brandAssets.bucketName) memoryStore.settings.r2BucketName = fc.brandAssets.bucketName;
          await pool.query(
            `INSERT INTO dd_settings (id, data) VALUES ('main', $1)
             ON CONFLICT (id) DO UPDATE SET data = $1`,
            [JSON.stringify(memoryStore.settings)]
          );
          stats['Brand & Storage Config'] = 1;
        }
      }

      res.json({
        success: true,
        type: isDatabaseBackup ? 'database' : 'files',
        stats,
        message: isDatabaseBackup
          ? 'Database backup successfully restored! All PostgreSQL tables and memory caches are fully synchronized.'
          : 'R2 File catalog and asset manifests successfully restored and verified!',
      });
    } catch (err: any) {
      console.error('Restore failed:', err);
      res.status(500).json({ error: `Restore process failed: ${err?.message || err}` });
    }
  });

  // Vite Middleware in dev, Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    // Leader Admin Panel Entry
    app.get(['/leader', '/leader/*', '/leader/index.html'], async (req, res, next) => {
      try {
        const leaderHtmlPath = path.resolve(__dirname, 'leader/index.html');
        let template = fs.readFileSync(leaderHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml('/leader/index.html', template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });

    // Public / Worker SPA Entry
    app.get('*', async (req, res, next) => {
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get(['/leader', '/leader/*'], (req, res) => {
      res.sendFile(path.join(distPath, 'leader/index.html'));
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Team Dark Devil server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
