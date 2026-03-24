import NativeMFECache from './NativeMFECache';
import type {
  BundleMetadata,
  CachedBundleResult,
  CacheManagerConfig,
} from './types';

const LOG_PREFIX = '[MFE-Cache]';

// Default configuration values
const DEFAULT_MAX_CACHE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_MIN_CACHE_SIZE_BYTES = 0;

export class CacheManager {
  private bundleDir: string = '';
  private config: CacheManagerConfig;

  // In-memory index: bundleUrl → BundleMetadata
  private urlIndex = new Map<string, BundleMetadata>();

  private initialized = false;

  constructor(config: CacheManagerConfig = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!NativeMFECache) {
      console.warn(
        `${LOG_PREFIX} NativeMFECache not available, cache disabled`,
      );
      return;
    }

    // Determine bundle storage directory
    const docDir = await NativeMFECache.getDocumentDirectory();
    this.bundleDir = this.config.bundleDir ?? `${docDir}/mfe-bundles`;

    // Recover indexes from disk manifest
    await this.recoverFromDiskManifest();

    // Check host build hash
    const storedHostHash =
      this.urlIndex.size > 0 ? (this as any)._hostBuildHash : undefined;
    const currentHostHash = (globalThis as any).__MF_HOST_BUILD_HASH__;
    if (
      storedHostHash &&
      currentHostHash &&
      storedHostHash !== currentHostHash
    ) {
      console.info(
        `${LOG_PREFIX} host build changed, invalidating all remote caches`,
      );
      await this.invalidateAllCaches();
    }
    if (currentHostHash) {
      (this as any)._hostBuildHash = currentHostHash;
    }

    // Perform LRU eviction on cold start
    await this.evictLRU();

    this.initialized = true;
    console.info(
      `${LOG_PREFIX} initialized, ${this.urlIndex.size} cached bundles`,
    );
  }

  async getCachedBundle(bundleUrl: string): Promise<CachedBundleResult | null> {
    const meta = this.urlIndex.get(bundleUrl);
    if (!meta || meta.status !== 'active') return null;

    // Verify file still exists on disk
    if (NativeMFECache) {
      const exists = await NativeMFECache.fileExists(meta.filePath);
      if (!exists) {
        // File gone, remove from index
        this.removeBundleMetadata(meta);
        return null;
      }
    }

    return { source: 'disk', filePath: meta.filePath, metadata: meta };
  }

  async getBundleDestPath(
    remoteName: string,
    bundleUrl: string,
  ): Promise<string> {
    // Use host_port/pathname as storage path to avoid name conflicts across hosts
    // e.g. http://localhost:8082/mini.bundle → localhost_8082/mini.bundle
    // e.g. https://cdn.example.com/miniApp/mini.bundle → cdn.example.com/miniApp/mini.bundle
    // e.g. https://cdn.example.com/miniApp/shared/lodash.bundle → cdn.example.com/miniApp/shared/lodash.bundle
    try {
      const url = new URL(bundleUrl);
      // Replace ':' with '_' in host (filesystem-safe)
      const hostDir = url.host.replace(/:/g, '_');
      // Remove leading slash from pathname
      const pathname = url.pathname.replace(/^\/+/, '');
      return `${this.bundleDir}/${hostDir}/${pathname}`;
    } catch {
      // Fallback for non-URL paths
      return `${this.bundleDir}/${remoteName}/${remoteName}.bundle`;
    }
  }

  async saveBundleToCache(
    remoteName: string,
    filePath: string,
    metadata: {
      bundleUrl: string;
      bundleHash?: string;
      buildVersion?: string;
    },
  ): Promise<BundleMetadata> {
    const now = Date.now();
    const meta: BundleMetadata = {
      remoteName,
      bundleHash: metadata.bundleHash ?? '',
      buildVersion: metadata.buildVersion ?? '',
      filePath,
      bundleUrl: metadata.bundleUrl,
      downloadedAt: now,
      lastUsedAt: now,
      status: 'active',
      retryCount: 0,
      lastRetryAt: null,
    };

    this.urlIndex.set(meta.bundleUrl, meta);

    // Persist manifest to disk
    await this.saveDiskManifest();

    return meta;
  }

  async updateLastUsedAt(bundleUrl: string): Promise<void> {
    const meta = this.urlIndex.get(bundleUrl);
    if (!meta) {
      return;
    }
    meta.lastUsedAt = Date.now();
    await this.saveDiskManifest();
  }

  getAllMetadata(): BundleMetadata[] {
    return Array.from(this.urlIndex.values());
  }

  async removeAll(remoteName: string): Promise<void> {
    for (const meta of this.urlIndex.values()) {
      if (meta.remoteName === remoteName) {
        await this.deleteBundleFiles(meta);
        this.removeBundleMetadata(meta);
      }
    }
  }

  /**
   * Pre-download a bundle if its hash has changed.
   * Returns true if a new version was downloaded, false if skipped or failed.
   */
  async preDownloadBundle(
    bundleUrl: string,
    newHash: string,
  ): Promise<boolean> {
    if (!NativeMFECache) return false;

    const existing = this.urlIndex.get(bundleUrl);
    // Already cached with same hash — skip
    if (existing?.bundleHash === newHash) return false;

    const remoteName = existing?.remoteName ?? this.inferRemoteName(bundleUrl);
    const destPath = await this.getBundleDestPath(remoteName, bundleUrl);

    try {
      const { sha256 } = await NativeMFECache.downloadFile(bundleUrl, destPath);

      // Verify downloaded content matches expected hash
      if (sha256 !== newHash) {
        try {
          await NativeMFECache.deleteFile(destPath);
        } catch {
          /* ok */
        }
        return false;
      }

      await this.saveBundleToCache(remoteName, destPath, {
        bundleUrl,
        bundleHash: sha256,
      });

      console.info(`${LOG_PREFIX} pre-downloaded updated bundle: ${bundleUrl}`);
      return true;
    } catch {
      return false;
    }
  }

  async invalidateAllCaches(): Promise<void> {
    const remoteNames = new Set<string>();
    for (const meta of this.urlIndex.values()) {
      remoteNames.add(meta.remoteName);
    }
    for (const name of remoteNames) {
      await this.removeAll(name);
    }
    // Remove disk manifest
    if (NativeMFECache) {
      try {
        await NativeMFECache.deleteFile(this.manifestPath);
      } catch {
        /* ok */
      }
    }
    console.info(`${LOG_PREFIX} all caches invalidated`);
  }

  // --- Private helpers ---

  private get manifestPath(): string {
    return `${this.bundleDir}/cache-manifest.json`;
  }

  /** Persist all metadata to a JSON file on disk */
  private async saveDiskManifest(): Promise<void> {
    if (!NativeMFECache) return;
    try {
      // Store filePath as relative to bundleDir so it survives app UUID changes
      const bundles = Array.from(this.urlIndex.values()).map((meta) => ({
        ...meta,
        filePath: meta.filePath.startsWith(this.bundleDir)
          ? meta.filePath.slice(this.bundleDir.length + 1)
          : meta.filePath,
      }));
      const manifest: Record<string, any> = {
        bundles,
      };
      await NativeMFECache.writeFile(
        this.manifestPath,
        JSON.stringify(manifest),
        'utf8',
      );
    } catch {
      // non-critical
    }
  }

  /** Recover cache index from disk manifest */
  private async recoverFromDiskManifest(): Promise<void> {
    if (!NativeMFECache) return;
    try {
      const exists = await NativeMFECache.fileExists(this.manifestPath);
      if (!exists) return;
      const raw = await NativeMFECache.readFile(this.manifestPath, 'utf8');
      const manifest = JSON.parse(raw);
      if (!Array.isArray(manifest.bundles)) return;

      for (const meta of manifest.bundles as BundleMetadata[]) {
        // Resolve relative filePath back to absolute using current bundleDir
        if (!meta.filePath.startsWith('/')) {
          meta.filePath = `${this.bundleDir}/${meta.filePath}`;
        }
        // Verify the bundle file still exists
        const fileOk = await NativeMFECache.fileExists(meta.filePath);
        if (!fileOk) continue;
        this.urlIndex.set(meta.bundleUrl, meta);
      }

      console.info(
        `${LOG_PREFIX} recovered ${this.urlIndex.size} bundles from disk manifest`,
      );
    } catch {
      // manifest corrupted or unreadable, start fresh
    }
  }

  private removeBundleMetadata(meta: BundleMetadata): void {
    this.urlIndex.delete(meta.bundleUrl);
  }

  /** Infer a remote name from a bundle URL for storage path generation */
  private inferRemoteName(url: string): string {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.replace(/^\/+/, '').split('/');
      if (pathParts.length > 0) {
        pathParts[pathParts.length - 1] =
          pathParts[pathParts.length - 1].split('.')[0];
      }
      return pathParts.join('/') || 'unknown';
    } catch {
      const last = url.split('/').pop() ?? 'unknown';
      return last.split('.')[0];
    }
  }

  private async deleteBundleFiles(meta: BundleMetadata): Promise<void> {
    if (!NativeMFECache) return;
    try {
      const exists = await NativeMFECache.fileExists(meta.filePath);
      if (exists) {
        await NativeMFECache.deleteFile(meta.filePath);
      }
    } catch (e) {
      console.warn(`${LOG_PREFIX} failed to delete ${meta.filePath}:`, e);
    }
  }

  /**
   * Evict bundles based on LRU policy.
   * Rules:
   * 1. Only evict bundles older than maxAgeMs (stale)
   * 2. Stop if total size drops below maxCacheSizeBytes
   * 3. Never go below minCacheSizeBytes
   *
   * Fresh bundles (within maxAgeMs) are never evicted, even if over size limit.
   */
  async evictLRU(): Promise<void> {
    if (!NativeMFECache) return;

    const maxSize =
      this.config.maxCacheSizeBytes ?? DEFAULT_MAX_CACHE_SIZE_BYTES;
    const maxAge = this.config.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
    const minSize =
      this.config.minCacheSizeBytes ?? DEFAULT_MIN_CACHE_SIZE_BYTES;

    const now = Date.now();

    // Single pass: compute total size and collect stale candidates
    let currentSize = 0;
    const candidates: Array<{ meta: BundleMetadata; size: number }> = [];
    for (const meta of this.urlIndex.values()) {
      let size = 0;
      try {
        size = await NativeMFECache.getFileSize(meta.filePath);
      } catch {
        continue; // Skip files we can't stat
      }
      currentSize += size;
      if (now - meta.lastUsedAt > maxAge) {
        candidates.push({ meta, size });
      }
    }
    // No stale bundles to evict
    if (candidates.length === 0) {
      return;
    }
    candidates.sort((a, b) => a.meta.lastUsedAt - b.meta.lastUsedAt);

    let evictedCount = 0;
    let evictedSize = 0;

    for (const { meta, size } of candidates) {
      // Stop if we're under the max size limit
      if (currentSize < maxSize) {
        break;
      }
      // Never go below min cache size
      if (currentSize - size < minSize) {
        break;
      }

      // Evict this stale bundle
      await this.deleteBundleFiles(meta);
      this.removeBundleMetadata(meta);
      currentSize -= size;
      evictedCount++;
      evictedSize += size;
    }

    if (evictedCount > 0) {
      await this.saveDiskManifest();
    }
  }
}
