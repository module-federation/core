export type BundleStatus =
  | 'active'
  | 'pendingUpdate'
  | 'broken'
  | 'pendingCleanup';

export interface BundleMetadata {
  remoteName: string;
  bundleHash: string;
  buildVersion: string;
  filePath: string;
  bundleUrl: string;
  downloadedAt: number;
  lastUsedAt: number;
  status: BundleStatus;
  retryCount: number;
  lastRetryAt: number | null;
}

export interface CachedBundleResult {
  source: 'memory' | 'disk';
  filePath: string;
  metadata: BundleMetadata;
}

/**
 * Unified configuration for the MFE cache layer.
 */
export interface MFECacheConfig {
  /** Custom bundle storage directory */
  bundleDir?: string;
  /** Max total cache size in bytes before eviction (default: 20MB) */
  maxCacheSizeBytes?: number;
  /** Max age in milliseconds before a bundle is considered stale (default: 7 days) */
  maxAgeMs?: number;
  /** Minimum cache size in bytes to keep even if all bundles are stale (default: 0) */
  minCacheSizeBytes?: number;
  /** Whether to enable automatic polling for manifest updates (default: true) */
  enablePolling?: boolean;
  /** Polling interval in milliseconds (default: 5 minutes) */
  pollIntervalMs?: number;
}
