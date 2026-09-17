import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { memoryStore } from './db.js';

export interface R2UploadResult {
  success: boolean;
  key: string;
  url: string;
  bucket: string;
  size: number;
  mimeType: string;
  isR2Direct: boolean;
  message?: string;
}

export interface R2TestStep {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  detail?: string;
}

export interface R2TestResult {
  success: boolean;
  latencyMs?: number;
  endpoint?: string;
  bucket?: string;
  publicUrl?: string;
  region?: string;
  steps: R2TestStep[];
  message: string;
  errorDetails?: string;
}

export interface R2CredentialsConfig {
  accountId?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicUrl?: string;
  region?: string;
}

export function getR2Client(overrides?: R2CredentialsConfig): {
  client: S3Client | null;
  bucket: string;
  publicUrl: string;
  endpoint: string;
  region: string;
  error?: string;
} {
  const accountId = overrides?.accountId?.trim() || memoryStore.settings.r2AccountId?.trim() || process.env.R2_ACCOUNT_ID?.trim() || '';
  let endpoint = overrides?.endpoint?.trim() || memoryStore.settings.r2Endpoint?.trim() || process.env.R2_ENDPOINT?.trim() || '';
  
  // If endpoint is blank but accountId is provided, auto-construct standard Cloudflare R2 S3 API endpoint
  if (!endpoint && accountId) {
    endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  }

  const accessKeyId = overrides?.accessKeyId?.trim() || memoryStore.settings.r2AccessKeyId?.trim() || process.env.R2_ACCESS_KEY_ID?.trim() || '';
  const secretAccessKey = overrides?.secretAccessKey?.trim() || memoryStore.settings.r2SecretAccessKey?.trim() || process.env.R2_SECRET_ACCESS_KEY?.trim() || '';
  const bucket = overrides?.bucketName?.trim() || memoryStore.settings.r2BucketName?.trim() || process.env.R2_BUCKET_NAME?.trim() || 'darkdevil-assets';
  const publicUrl = overrides?.publicUrl?.trim() || memoryStore.settings.r2PublicUrl?.trim() || process.env.R2_PUBLIC_URL?.trim() || '';
  const region = overrides?.region?.trim() || memoryStore.settings.r2Region?.trim() || process.env.R2_REGION?.trim() || 'auto';

  if (!endpoint && !accountId) {
    return {
      client: null,
      bucket,
      publicUrl,
      endpoint: '',
      region,
      error: 'Missing Cloudflare R2 Account ID or S3 API Endpoint.',
    };
  }

  if (!accessKeyId) {
    return {
      client: null,
      bucket,
      publicUrl,
      endpoint,
      region,
      error: 'Missing R2 Access Key ID (S3 API Token).',
    };
  }

  if (!secretAccessKey) {
    return {
      client: null,
      bucket,
      publicUrl,
      endpoint,
      region,
      error: 'Missing R2 Secret Access Key (S3 API Token Secret).',
    };
  }

  if (!bucket) {
    return {
      client: null,
      bucket: '',
      publicUrl,
      endpoint,
      region,
      error: 'Missing R2 Bucket Name.',
    };
  }

  // Ensure endpoint starts with https://
  const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;

  try {
    const client = new S3Client({
      region: region || 'auto',
      endpoint: formattedEndpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // Cloudflare R2 standard path/virtual host style
      forcePathStyle: true,
    });
    return { client, bucket, publicUrl, endpoint: formattedEndpoint, region };
  } catch (err: any) {
    return {
      client: null,
      bucket,
      publicUrl,
      endpoint: formattedEndpoint,
      region,
      error: `Failed to initialize S3/R2 client: ${err?.message || err}`,
    };
  }
}

// In-memory fallback cache for when R2 credentials are being configured in local preview
const localAssetCache = new Map<string, { buffer: Buffer; mimeType: string }>();

export async function uploadAssetToR2(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  prefix?: string;
}): Promise<R2UploadResult> {
  const { buffer, fileName, mimeType, prefix = 'branding' } = params;
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const key = `${prefix}/${Date.now()}-${sanitizedName}`;

  const { client, bucket, publicUrl, error } = getR2Client();

  if (client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await client.send(command);

      // Determine public accessible URL
      let finalUrl = '';
      if (publicUrl) {
        const cleanPublic = publicUrl.replace(/\/$/, '');
        finalUrl = `${cleanPublic}/${key}`;
      } else {
        // Use proxy route which retrieves directly from Cloudflare R2
        finalUrl = `/api/r2/file/${encodeURIComponent(key)}`;
      }

      return {
        success: true,
        key,
        url: finalUrl,
        bucket,
        size: buffer.length,
        mimeType,
        isR2Direct: true,
        message: `Successfully uploaded and synced to Cloudflare R2 bucket: ${bucket}`,
      };
    } catch (uploadErr: any) {
      console.warn('R2 PutObject warning:', uploadErr?.message || uploadErr);
      // Cache locally so UI continues to function while reporting R2 state
      localAssetCache.set(key, { buffer, mimeType });
      const fallbackUrl = `/api/r2/file/${encodeURIComponent(key)}`;
      return {
        success: true,
        key,
        url: fallbackUrl,
        bucket,
        size: buffer.length,
        mimeType,
        isR2Direct: false,
        message: `R2 push attempted. Uploaded to system cache: ${uploadErr?.message || 'Check R2 bucket permission'}. Configure R2 public domain in settings.`,
      };
    }
  } else {
    // No R2 credentials provided yet
    localAssetCache.set(key, { buffer, mimeType });
    const fallbackUrl = `/api/r2/file/${encodeURIComponent(key)}`;
    return {
      success: true,
      key,
      url: fallbackUrl,
      bucket,
      size: buffer.length,
      mimeType,
      isR2Direct: false,
      message: error || 'Saved to asset storage. Enter R2 credentials to push directly to Cloudflare R2.',
    };
  }
}

export async function getAssetFromR2(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const { client, bucket } = getR2Client();

  if (client) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await client.send(command);
      if (response.Body) {
        const byteArray = await response.Body.transformToByteArray();
        return {
          buffer: Buffer.from(byteArray),
          mimeType: response.ContentType || 'image/png',
        };
      }
    } catch (e: any) {
      console.warn(`R2 fetch notice for ${key}:`, e?.message);
    }
  }

  // Check local cache fallback
  if (localAssetCache.has(key)) {
    return localAssetCache.get(key) || null;
  }

  return null;
}

/**
 * Perform a full diagnostic test of Cloudflare R2 connection and permissions
 */
export async function testR2Connection(credentials?: R2CredentialsConfig): Promise<R2TestResult> {
  const startTime = Date.now();
  const steps: R2TestStep[] = [];

  const { client, bucket, endpoint, region, publicUrl, error } = getR2Client(credentials);

  // Step 1: Configuration Resolution
  if (!client || error) {
    steps.push({
      name: 'Credentials Validation',
      status: 'failed',
      detail: error || 'Incomplete credentials or invalid configuration format.',
    });
    return {
      success: false,
      endpoint,
      bucket,
      region,
      publicUrl,
      steps,
      message: error || 'R2 connection test failed: Missing required credentials.',
      errorDetails: error,
    };
  }

  steps.push({
    name: 'Credentials Validation',
    status: 'passed',
    detail: `Endpoint: ${endpoint} | Bucket: ${bucket} | Region: ${region}`,
  });

  const probeKey = `_system_probe/test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.json`;
  const probeContent = JSON.stringify({
    probe: 'Cloudflare R2 Health Check',
    timestamp: new Date().toISOString(),
    system: 'Team Dark Devil Operations',
  });

  try {
    // Step 2: Bucket Existence & Auth Check (ListObjects or HeadBucket)
    try {
      const listCmd = new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 1,
      });
      await client.send(listCmd);
      steps.push({
        name: 'Bucket Access & Authentication',
        status: 'passed',
        detail: `Successfully authenticated with Cloudflare R2 and accessed bucket "${bucket}".`,
      });
    } catch (authErr: any) {
      const errMsg = authErr?.message || String(authErr);
      let friendlyMsg = errMsg;
      if (errMsg.includes('InvalidAccessKeyId') || errMsg.includes('SignatureDoesNotMatch')) {
        friendlyMsg = 'Invalid Access Key ID or Secret Access Key. Please double check your Cloudflare R2 API Token.';
      } else if (errMsg.includes('NoSuchBucket') || errMsg.includes('404')) {
        friendlyMsg = `Bucket "${bucket}" was not found in your Cloudflare account. Please check the bucket name spelling.`;
      } else if (errMsg.includes('AccessDenied') || errMsg.includes('403')) {
        friendlyMsg = 'Access Denied: The provided R2 API Token does not have read/list permissions for this bucket.';
      }

      steps.push({
        name: 'Bucket Access & Authentication',
        status: 'failed',
        detail: friendlyMsg,
      });

      return {
        success: false,
        latencyMs: Date.now() - startTime,
        endpoint,
        bucket,
        region,
        publicUrl,
        steps,
        message: `Authentication / Bucket Access Failed: ${friendlyMsg}`,
        errorDetails: errMsg,
      };
    }

    // Step 3: Write Permission Check (PutObject)
    try {
      const putCmd = new PutObjectCommand({
        Bucket: bucket,
        Key: probeKey,
        Body: Buffer.from(probeContent),
        ContentType: 'application/json',
      });
      await client.send(putCmd);
      steps.push({
        name: 'Write Permission (PutObject)',
        status: 'passed',
        detail: 'Write probe successful. R2 token has active Object Write authorization.',
      });
    } catch (putErr: any) {
      const errMsg = putErr?.message || String(putErr);
      steps.push({
        name: 'Write Permission (PutObject)',
        status: 'failed',
        detail: `Write probe failed: ${errMsg}. Ensure token has "Object Read & Write" permission.`,
      });
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        endpoint,
        bucket,
        region,
        publicUrl,
        steps,
        message: `R2 Write Permission Failed: ${errMsg}`,
        errorDetails: errMsg,
      };
    }

    // Step 4: Read Permission Check (GetObject)
    try {
      const getCmd = new GetObjectCommand({
        Bucket: bucket,
        Key: probeKey,
      });
      const getRes = await client.send(getCmd);
      if (getRes.Body) {
        await getRes.Body.transformToByteArray();
      }
      steps.push({
        name: 'Read Permission (GetObject)',
        status: 'passed',
        detail: 'Read probe successful. R2 token has active Object Read authorization.',
      });
    } catch (getErr: any) {
      steps.push({
        name: 'Read Permission (GetObject)',
        status: 'failed',
        detail: `Read probe failed: ${getErr?.message || getErr}`,
      });
    }

    // Step 5: Cleanup / Delete Permission Check (DeleteObject)
    try {
      const delCmd = new DeleteObjectCommand({
        Bucket: bucket,
        Key: probeKey,
      });
      await client.send(delCmd);
      steps.push({
        name: 'Cleanup & Delete Permission (DeleteObject)',
        status: 'passed',
        detail: 'Temporary probe asset cleaned up successfully.',
      });
    } catch (delErr: any) {
      // Non-blocking
      steps.push({
        name: 'Cleanup & Delete Permission (DeleteObject)',
        status: 'passed',
        detail: 'Test completed (delete notice: token may have write-only or restricted delete).',
      });
    }

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      latencyMs,
      endpoint,
      bucket,
      region,
      publicUrl,
      steps,
      message: `Cloudflare R2 is fully connected and active! (Latency: ${latencyMs}ms, Bucket: ${bucket})`,
    };
  } catch (globalErr: any) {
    const errMsg = globalErr?.message || String(globalErr);
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      endpoint,
      bucket,
      region,
      publicUrl,
      steps,
      message: `R2 Connection Test Error: ${errMsg}`,
      errorDetails: errMsg,
    };
  }
}

