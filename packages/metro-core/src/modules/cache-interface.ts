export interface ICacheManager {
  initialize(): Promise<void>;
  getCachedBundle(
    bundleUrl: string,
  ): Promise<{ source: string; filePath: string; metadata: any } | null>;
  getBundleDestPath(remoteName: string, bundleUrl: string): Promise<string>;
  saveBundleToCache(
    remoteName: string,
    filePath: string,
    metadata: {
      bundleUrl: string;
      bundleHash?: string;
      buildVersion?: string;
    },
  ): Promise<any>;
  updateLastUsedAt(remoteName: string): Promise<void>;
  markBroken(remoteName: string, bundleUrl: string): Promise<void>;
  getCurrentBundleUrl(remoteName: string): string | null;
  getPreviousValidVersion(remoteName: string): Promise<any | null>;
  invalidateAllCaches(): Promise<void>;
}

export interface ICacheNative {
  downloadFile(
    url: string,
    destPath: string,
  ): Promise<{ sha256: string; bytesWritten: number }>;
  evaluateJavaScript(filePath: string, sourceURL: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}

/**
 * Try to load metro-cache at runtime.
 * Returns null if not installed (graceful degradation).
 */
export function tryLoadCacheModule(): {
  CacheManager: new (config?: any) => ICacheManager;
  NativeMFECache: ICacheNative;
} | null {
  try {
    const mod = require('@module-federation/metro-cache');
    if (mod?.NativeMFECache && mod?.CacheManager) {
      return {
        CacheManager: mod.CacheManager,
        NativeMFECache: mod.NativeMFECache,
      };
    }
    return null;
  } catch {
    return null;
  }
}
