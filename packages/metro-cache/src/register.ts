import { BundleCacheLayer } from './BundleCacheLayer';
import type { MFECacheConfig } from './types';

/**
 * Register the MFE cache layer on globalThis.
 *
 * Call this once at app startup (before any remote bundle loading).
 * metro-core reads `globalThis.__MFE_CACHE_LAYER__` — it never
 * imports metro-cache directly, keeping the two packages decoupled.
 *
 * @example
 * ```ts
 * import { register } from '@module-federation/metro-cache';
 *
 * register({
 *   maxCacheSizeBytes: 50 * 1024 * 1024,
 *   maxAgeMs: 3 * 24 * 60 * 60 * 1000,
 *   enablePolling: true,
 *   pollIntervalMs: 10 * 60 * 1000,
 * });
 * ```
 */
export function register(config: MFECacheConfig = {}): BundleCacheLayer {
  // Re-use existing instance if already registered
  if ((globalThis as any).__MFE_CACHE_LAYER__) {
    return (globalThis as any).__MFE_CACHE_LAYER__;
  }

  const cacheLayer = new BundleCacheLayer(config);
  (globalThis as any).__MFE_CACHE_LAYER__ = cacheLayer;

  // Expose manual polling APIs on globalThis
  (globalThis as any).__MFE_CHECK_UPDATES__ = () =>
    cacheLayer.checkForUpdates();
  (globalThis as any).__MFE_START_UPDATE_POLLING__ = (intervalMs?: number) =>
    cacheLayer.startPolling(intervalMs);
  (globalThis as any).__MFE_STOP_UPDATE_POLLING__ = () =>
    cacheLayer.stopPolling();

  // Auto-start polling unless explicitly disabled
  const { enablePolling = true, pollIntervalMs } = config;
  if (enablePolling) {
    cacheLayer.startPolling(pollIntervalMs);
  }

  return cacheLayer;
}
