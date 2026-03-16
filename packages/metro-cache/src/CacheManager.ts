import NativeMFECache from './NativeMFECache';
import type {
  BundleMetadata,
  BundleStatus,
  CachedBundleResult,
  CacheManagerConfig,
} from './types';

const LOG_PREFIX = '[MFE-Cache]';

// Simple KV interface — will use MMKV when available, falls back to in-memory
interface KVStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  getAllKeys(): string[];
}

function createMemoryKV(): KVStore {
  const store = new Map<string, string>();
  return {
    getString: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
    delete: (key) => store.delete(key),
    getAllKeys: () => Array.from(store.keys()),
  };
}

function createMMKVStore(instanceId: string): KVStore {
  try {
    const { MMKV } = require('react-native-mmkv');
    return new MMKV({ id: instanceId });
  } catch {
    console.warn(
      `${LOG_PREFIX} react-native-mmkv not available, using in-memory store`,
    );
    return createMemoryKV();
  }
}

function shortHash(url: string): string {
  // Simple hash for MMKV key — not crypto, just for key uniqueness
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export class CacheManager {
  private kv: KVStore;
  private bundleDir: string = '';
  private config: CacheManagerConfig;

  // In-memory indexes
  private urlIndex = new Map<string, BundleMetadata>();
  private activeVersions = new Map<string, BundleMetadata>();
  private previousVersions = new Map<string, BundleMetadata | null>();

  private initialized = false;

  constructor(config: CacheManagerConfig = {}) {
    this.config = config;
    this.kv = createMMKVStore(config.mmkvInstanceId ?? 'mfe-cache');
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

    // Rebuild in-memory indexes from MMKV
    const allKeys = this.kv.getAllKeys();
    for (const key of allKeys) {
      if (!key.startsWith('mfe:bundle:')) continue;
      try {
        const raw = this.kv.getString(key);
        if (!raw) continue;
        const meta: BundleMetadata = JSON.parse(raw);
        this.urlIndex.set(meta.bundleUrl, meta);
      } catch {
        // corrupted entry, skip
      }
    }

    // If MMKV is not available (in-memory store), try to recover from disk manifest
    if (this.urlIndex.size === 0) {
      await this.recoverFromDiskManifest();
    }

    // Rebuild active/previous pointers
    const remoteNames = new Set<string>();
    for (const meta of this.urlIndex.values()) {
      remoteNames.add(meta.remoteName);
    }
    for (const name of remoteNames) {
      const activeUrl = this.kv.getString(`mfe:active:${name}`);
      if (activeUrl) {
        const meta = this.urlIndex.get(activeUrl);
        if (meta) this.activeVersions.set(name, meta);
      }
      const prevUrl = this.kv.getString(`mfe:previous:${name}`);
      if (prevUrl) {
        const meta = this.urlIndex.get(prevUrl);
        this.previousVersions.set(name, meta ?? null);
      }
    }

    // If we recovered from disk but active pointers are empty, rebuild them
    if (this.urlIndex.size > 0 && this.activeVersions.size === 0) {
      for (const meta of this.urlIndex.values()) {
        if (meta.status === 'active') {
          this.activeVersions.set(meta.remoteName, meta);
          this.kv.set(`mfe:active:${meta.remoteName}`, meta.bundleUrl);
        }
      }
    }

    // Check host build hash
    const storedHostHash = this.kv.getString('mfe:hostBuildHash');
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
      this.kv.set('mfe:hostBuildHash', currentHostHash);
    }

    // Activate pending updates (cold start)
    for (const meta of this.urlIndex.values()) {
      if (meta.status === 'pendingUpdate') {
        await this.activatePendingUpdate(meta.remoteName);
      }
    }

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
    _bundleUrl: string,
  ): Promise<string> {
    return `${this.bundleDir}/${remoteName}/${remoteName}.bundle`;
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

    // Version rotation: current → previous, delete older
    const currentActive = this.activeVersions.get(remoteName);
    if (currentActive && currentActive.bundleUrl !== meta.bundleUrl) {
      const oldPrevious = this.previousVersions.get(remoteName);
      if (oldPrevious) {
        await this.deleteBundleFiles(oldPrevious);
        this.removeBundleMetadata(oldPrevious);
      }
      this.previousVersions.set(remoteName, currentActive);
      this.kv.set(`mfe:previous:${remoteName}`, currentActive.bundleUrl);
    }

    // Save new as active
    this.urlIndex.set(meta.bundleUrl, meta);
    this.activeVersions.set(remoteName, meta);
    this.persistBundleMetadata(meta);
    this.kv.set(`mfe:active:${remoteName}`, meta.bundleUrl);

    // Persist manifest to disk for recovery without MMKV
    await this.saveDiskManifest();

    return meta;
  }

  async savePendingUpdate(
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
      status: 'pendingUpdate',
      retryCount: 0,
      lastRetryAt: null,
    };

    this.urlIndex.set(meta.bundleUrl, meta);
    this.persistBundleMetadata(meta);
    return meta;
  }

  async activatePendingUpdate(
    remoteName: string,
  ): Promise<BundleMetadata | null> {
    // Find pending update for this remote
    let pending: BundleMetadata | null = null;
    for (const meta of this.urlIndex.values()) {
      if (meta.remoteName === remoteName && meta.status === 'pendingUpdate') {
        pending = meta;
        break;
      }
    }
    if (!pending) return null;

    pending.status = 'active';
    // Rotate versions
    return this.saveBundleToCache(remoteName, pending.filePath, {
      bundleUrl: pending.bundleUrl,
      bundleHash: pending.bundleHash,
      buildVersion: pending.buildVersion,
    });
  }

  async markBroken(remoteName: string, bundleUrl: string): Promise<void> {
    const meta = this.urlIndex.get(bundleUrl);
    if (!meta) return;
    meta.status = 'broken';
    meta.retryCount = 0;
    meta.lastRetryAt = null;
    this.persistBundleMetadata(meta);
    console.warn(`${LOG_PREFIX} marked broken: ${remoteName} @ ${bundleUrl}`);
  }

  async getPreviousValidVersion(
    remoteName: string,
  ): Promise<BundleMetadata | null> {
    const prev = this.previousVersions.get(remoteName);
    if (!prev || prev.status === 'broken') return null;
    if (NativeMFECache) {
      const exists = await NativeMFECache.fileExists(prev.filePath);
      if (!exists) return null;
    }
    return prev;
  }

  getCurrentBundleUrl(remoteName: string): string | null {
    return this.activeVersions.get(remoteName)?.bundleUrl ?? null;
  }

  async updateLastUsedAt(remoteName: string): Promise<void> {
    const meta = this.activeVersions.get(remoteName);
    if (!meta) return;
    meta.lastUsedAt = Date.now();
    this.persistBundleMetadata(meta);
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
    this.activeVersions.delete(remoteName);
    this.previousVersions.delete(remoteName);
    this.kv.delete(`mfe:active:${remoteName}`);
    this.kv.delete(`mfe:previous:${remoteName}`);
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

  /** Persist all metadata to a JSON file on disk so it survives JS reloads without MMKV */
  private async saveDiskManifest(): Promise<void> {
    if (!NativeMFECache) return;
    try {
      const manifest: Record<string, any> = {
        bundles: Array.from(this.urlIndex.values()),
        active: Object.fromEntries(
          Array.from(this.activeVersions.entries()).map(([k, v]) => [
            k,
            v.bundleUrl,
          ]),
        ),
        previous: Object.fromEntries(
          Array.from(this.previousVersions.entries())
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, v!.bundleUrl]),
        ),
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

  /** Recover cache index from disk manifest (fallback when MMKV is unavailable) */
  private async recoverFromDiskManifest(): Promise<void> {
    if (!NativeMFECache) return;
    try {
      const exists = await NativeMFECache.fileExists(this.manifestPath);
      if (!exists) return;
      const raw = await NativeMFECache.readFile(this.manifestPath, 'utf8');
      const manifest = JSON.parse(raw);
      if (!Array.isArray(manifest.bundles)) return;

      for (const meta of manifest.bundles as BundleMetadata[]) {
        // Verify the bundle file still exists
        const fileOk = await NativeMFECache.fileExists(meta.filePath);
        if (!fileOk) continue;
        this.urlIndex.set(meta.bundleUrl, meta);
        // Also populate the in-memory KV so the rest of initialize() works
        this.persistBundleMetadata(meta);
      }

      // Restore active/previous pointers into KV
      if (manifest.active) {
        for (const [name, url] of Object.entries(manifest.active)) {
          this.kv.set(`mfe:active:${name}`, url as string);
        }
      }
      if (manifest.previous) {
        for (const [name, url] of Object.entries(manifest.previous)) {
          this.kv.set(`mfe:previous:${name}`, url as string);
        }
      }

      console.info(
        `${LOG_PREFIX} recovered ${this.urlIndex.size} bundles from disk manifest`,
      );
    } catch {
      // manifest corrupted or unreadable, start fresh
    }
  }

  private persistBundleMetadata(meta: BundleMetadata): void {
    const key = `mfe:bundle:${meta.remoteName}:${shortHash(meta.bundleUrl)}`;
    this.kv.set(key, JSON.stringify(meta));
  }

  private removeBundleMetadata(meta: BundleMetadata): void {
    const key = `mfe:bundle:${meta.remoteName}:${shortHash(meta.bundleUrl)}`;
    this.kv.delete(key);
    this.urlIndex.delete(meta.bundleUrl);
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
}
