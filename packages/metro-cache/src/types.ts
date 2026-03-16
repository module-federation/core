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

export interface CacheManagerConfig {
  mmkvInstanceId?: string;
  bundleDir?: string;
}
