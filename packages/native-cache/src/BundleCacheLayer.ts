import NativeMFECache from './NativeMFECache';
import { CacheManager } from './CacheManager';
import type { MFECacheConfig } from './types';

const LOG_PREFIX = '[MFE-Cache]';

interface ManifestSource {
  containerEntry: string;
  extractHashes: (manifest: any, manifestUrl: string) => Map<string, string>;
  /** Build full download URL from a raw bundle URL (e.g. append dev query params) */
  buildDownloadUrl?: (url: string) => string;
}

export class BundleCacheLayer {
  private cacheManager: CacheManager | null = null;
  private initPromise: Promise<void> | null = null;
  private config: MFECacheConfig;

  // Bundle hash map: bundleUrl (without query params) → expected hash
  // Shared via globalThis.__MFE_BUNDLE_HASHES__ for cross-instance access
  private bundleHashMap: Record<string, string>;

  // Manifest sources for polling: manifestUrl → ManifestSource
  private manifestSources = new Map<string, ManifestSource>();

  // Polling state
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isCheckingUpdates = false;
  private static DEFAULT_POLL_INTERVAL_MS = 5 * 1000; // 5 minutes

  constructor(config: MFECacheConfig = {}) {
    this.config = config;

    // Share bundleHashMap via globalThis for cross-instance access
    this.bundleHashMap =
      (globalThis as any).__MFE_BUNDLE_HASHES__ ??
      ((globalThis as any).__MFE_BUNDLE_HASHES__ = {});

    // Install JSI bindings if available (provides __MFE_readFileSync)
    if (
      NativeMFECache &&
      typeof (NativeMFECache as any).installJSI === 'function'
    ) {
      (NativeMFECache as any).installJSI();
    }
  }

  // --- Registration (called by bundler integration layer) ---

  registerBundleHash(bundleUrl: string, hash: string): void {
    this.bundleHashMap[bundleUrl] = hash;
  }

  registerManifestSource(
    manifestUrl: string,
    containerEntry: string,
    extractHashes: (manifest: any, manifestUrl: string) => Map<string, string>,
    buildDownloadUrl?: (url: string) => string,
  ): void {
    this.manifestSources.set(manifestUrl, {
      containerEntry,
      extractHashes,
      buildDownloadUrl,
    });
  }

  // --- Core loading ---

  /**
   * Load a bundle through the cache layer.
   * - 'cache-hit': bundle loaded from disk cache (hash matched)
   * - 'downloaded': bundle freshly downloaded, verified, cached, and eval'd
   * - 'skipped': no expected hash, verification failed, or error — caller should fallback
   */
  async loadBundle(
    bundleUrl: string,
  ): Promise<{ status: 'cache-hit' | 'downloaded' | 'skipped' }> {
    if (!NativeMFECache) return { status: 'skipped' };

    await this.ensureInitialized();

    try {
      // Strip query params for hash lookup
      const bundleUrlNoQuery = bundleUrl.split('?')[0];
      const expectedHash = this.bundleHashMap[bundleUrlNoQuery] as
        | string
        | undefined;

      // No hash in manifest → can't verify integrity, skip cache
      if (!expectedHash) {
        return { status: 'skipped' };
      }

      const cached = await this.cacheManager!.getCachedBundle(bundleUrl);

      // Determine if cache is valid: hash must match manifest
      const cacheValid =
        cached &&
        cached.metadata.bundleHash &&
        cached.metadata.bundleHash === expectedHash;

      if (cacheValid) {
        // Path A: cache HIT with matching hash — use cached bundle
        this.cacheManager!.updateLastUsedAt(bundleUrl).catch(() => {});
        await this.evalFromFile(cached.filePath);
        return { status: 'cache-hit' };
      } else {
        // Path B: cache MISS or EXPIRED — download fresh bundle
        const remoteName = this.inferRemoteName(bundleUrl);
        const destPath = await this.cacheManager!.getBundleDestPath(
          remoteName,
          bundleUrl,
        );

        const { sha256 } = await NativeMFECache.downloadFile(
          bundleUrl,
          destPath,
        );

        // Checksum verification against manifest hash
        if (sha256 !== expectedHash) {
          try {
            await NativeMFECache.deleteFile(destPath);
          } catch {
            /* ok */
          }
          // Verification failed — caller should fallback to network load
          return { status: 'skipped' };
        }

        await this.cacheManager!.saveBundleToCache(remoteName, destPath, {
          bundleUrl,
          bundleHash: sha256,
        });
        await this.evalFromFile(destPath);
        return { status: 'downloaded' };
      }
    } catch (cacheError) {
      console.warn(
        `${LOG_PREFIX} cache error, falling back to network:`,
        cacheError,
      );
      return { status: 'skipped' };
    }
  }

  // --- Polling: manifest re-check and pre-download ---

  /**
   * Check all known manifests for updated bundles and pre-download them.
   * Returns stats about how many bundles were checked and updated.
   */
  async checkForUpdates(): Promise<{ updated: number; checked: number }> {
    if (!NativeMFECache || this.isCheckingUpdates) {
      return { updated: 0, checked: 0 };
    }

    this.isCheckingUpdates = true;
    let updated = 0;
    let checked = 0;

    try {
      await this.ensureInitialized();

      if (!this.manifestSources.size) return { updated: 0, checked: 0 };

      for (const [manifestUrl, source] of this.manifestSources) {
        try {
          const resp = await fetch(manifestUrl);
          if (!resp.ok) continue;
          const manifest = await resp.json();

          const toContainerUrl =
            source.buildDownloadUrl ?? ((url: string) => url);

          // --- Container bundle hash ---
          const containerHash = manifest?.metaData?.buildInfo?.hash;
          if (containerHash && source.containerEntry) {
            checked++;
            const currentHash = this.bundleHashMap[source.containerEntry];
            if (currentHash !== containerHash) {
              const downloadUrl = toContainerUrl(source.containerEntry);
              const didUpdate = await this.cacheManager!.preDownloadBundle(
                downloadUrl,
                containerHash,
              );
              if (didUpdate) {
                this.bundleHashMap[source.containerEntry] = containerHash;
                updated++;
              }
            }
          }

          // --- Exposed & shared bundle hashes (split bundles) ---
          const newHashes = source.extractHashes(manifest, manifestUrl);

          for (const [bundleUrl, newHash] of newHashes) {
            checked++;
            const currentHash = this.bundleHashMap[bundleUrl];
            if (currentHash === newHash) continue;
            const downloadUrl = source.buildDownloadUrl
              ? source.buildDownloadUrl(bundleUrl)
              : bundleUrl;
            const didUpdate = await this.cacheManager!.preDownloadBundle(
              downloadUrl,
              newHash,
            );
            if (didUpdate) {
              this.bundleHashMap[bundleUrl] = newHash;
              updated++;
            }
          }
        } catch {
          // Non-critical: network error for this manifest, continue with others
        }
      }

      if (updated > 0) {
        console.info(
          `${LOG_PREFIX} poll: ${updated} bundle(s) pre-downloaded out of ${checked} checked`,
        );
      }
    } finally {
      this.isCheckingUpdates = false;
    }

    return { updated, checked };
  }

  startPolling(intervalMs?: number): void {
    this.stopPolling();
    const interval = intervalMs ?? BundleCacheLayer.DEFAULT_POLL_INTERVAL_MS;
    this.pollTimer = setInterval(() => {
      this.checkForUpdates().catch(() => {});
    }, interval);
  }

  stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // --- Private helpers ---

  private async ensureInitialized(): Promise<void> {
    if (this.cacheManager) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const { enablePolling, pollIntervalMs, ...cacheConfig } = this.config;
        const cm = new CacheManager(cacheConfig);
        await cm.initialize();
        this.cacheManager = cm;
      })();
    }
    await this.initPromise;
  }

  /** Read bundle file and eval its source code */
  private evalFromFile(filePath: string): void | Promise<void> {
    if (typeof (globalThis as any).__MFE_readFileSync === 'function') {
      const source = (globalThis as any).__MFE_readFileSync(filePath);
      eval(source);
    } else {
      // Fallback: async read (less ideal — introduces a microtask gap)
      return NativeMFECache!
        .readFile(filePath, 'utf8')
        .then((source: string) => {
          eval(source);
        });
    }
  }

  /** Infer a remote name from a bundle URL for storage path generation */
  private inferRemoteName(url: string): string {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.replace(/^\/+/, '').split('/');
      if (pathParts.length > 0) {
        pathParts[pathParts.length - 1] = pathParts[pathParts.length - 1]
          .split('.')[0]
          .split('?')[0];
      }
      return pathParts.join('/') || 'unknown';
    } catch {
      const last = url.split('/').pop() ?? 'unknown';
      return last.split('.')[0].split('?')[0];
    }
  }
}
