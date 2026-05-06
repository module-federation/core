/**
 * Interface for the global cache layer (`globalThis.__FEDERATION__.__NATIVE__.__CACHE_LAYER__`).
 *
 * Metro-core never imports native-cache directly — it only
 * reads this global, keeping the two packages decoupled.
 */
export interface ICacheLayer {
  /**
   * Load a bundle through the cache layer.
   * - 'cache-hit': bundle loaded from disk cache (hash matched)
   * - 'downloaded': bundle freshly downloaded, verified, cached, and eval'd
   * - 'skipped': no expected hash, verification failed, or error — caller should fallback
   */
  loadBundle(
    bundleUrl: string,
  ): Promise<{ status: 'cache-hit' | 'downloaded' | 'skipped' }>;

  /** Register an expected hash for a bundle URL (used for integrity verification). */
  registerBundleHash(bundleUrl: string, hash: string): void;

  /** Register a manifest source for background polling and pre-downloading. */
  registerManifestSource(
    manifestUrl: string,
    extractHashes: (manifest: any, manifestUrl: string) => Map<string, string>,
  ): void;
}
