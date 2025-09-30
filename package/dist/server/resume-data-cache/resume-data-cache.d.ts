import { type UseCacheCacheStore, type FetchCacheStore, type EncryptedBoundArgsCacheStore, type DecryptedBoundArgsCacheStore } from './cache-store';
/**
 * An immutable version of the resume data cache used during rendering.
 * This cache is read-only and cannot be modified once created.
 */
export interface RenderResumeDataCache {
    /**
     * A read-only Map store for values cached by the 'use cache' React hook.
     * The 'set' operation is omitted to enforce immutability.
     */
    readonly cache: Omit<UseCacheCacheStore, 'set'>;
    /**
     * A read-only Map store for cached fetch responses.
     * The 'set' operation is omitted to enforce immutability.
     */
    readonly fetch: Omit<FetchCacheStore, 'set'>;
    /**
     * A read-only Map store for encrypted bound args of inline server functions.
     * The 'set' operation is omitted to enforce immutability.
     */
    readonly encryptedBoundArgs: Omit<EncryptedBoundArgsCacheStore, 'set'>;
    /**
     * A read-only Map store for decrypted bound args of inline server functions.
     * This is only intended for in-memory usage during pre-rendering, and must
     * not be persisted in the resume store. The 'set' operation is omitted to
     * enforce immutability.
     */
    readonly decryptedBoundArgs: Omit<DecryptedBoundArgsCacheStore, 'set'>;
}
/**
 * A mutable version of the resume data cache used during pre-rendering.
 * This cache allows both reading and writing of cached values.
 */
export interface PrerenderResumeDataCache {
    /**
     * A mutable Map store for values cached by the 'use cache' React hook.
     * Supports both 'get' and 'set' operations to build the cache during
     * pre-rendering.
     */
    readonly cache: UseCacheCacheStore;
    /**
     * A mutable Map store for cached fetch responses.
     * Supports both 'get' and 'set' operations to build the cache during
     * pre-rendering.
     */
    readonly fetch: FetchCacheStore;
    /**
     * A mutable Map store for encrypted bound args of inline server functions.
     * Supports both 'get' and 'set' operations to build the cache during
     * pre-rendering.
     */
    readonly encryptedBoundArgs: EncryptedBoundArgsCacheStore;
    /**
     * A mutable Map store for decrypted bound args of inline server functions.
     * This is only intended for in-memory usage during pre-rendering, and must
     * not be persisted in the resume store. Supports both 'get' and 'set'
     * operations to build the cache during pre-rendering.
     */
    readonly decryptedBoundArgs: DecryptedBoundArgsCacheStore;
}
/**
 * Serializes a resume data cache into a JSON string for storage or
 * transmission. Handles 'use cache' values, fetch responses, and encrypted
 * bound args for inline server functions.
 *
 * @param resumeDataCache - The immutable cache to serialize
 * @returns A Promise that resolves to the serialized cache as a JSON string, or
 * 'null' if empty
 */
export declare function stringifyResumeDataCache(resumeDataCache: RenderResumeDataCache | PrerenderResumeDataCache): Promise<string>;
/**
 * Creates a new empty mutable resume data cache for pre-rendering.
 * Initializes fresh Map instances for both the 'use cache' and fetch caches.
 * Used at the start of pre-rendering to begin collecting cached values.
 *
 * @returns A new empty PrerenderResumeDataCache instance
 */
export declare function createPrerenderResumeDataCache(): PrerenderResumeDataCache;
/**
 * Creates an immutable render resume data cache from either:
 * 1. An existing prerender cache instance
 * 2. A serialized cache string
 *
 * @param prerenderResumeDataCache - A PrerenderResumeDataCache instance to convert to immutable
 * @param persistedCache - A serialized cache string to parse
 * @returns An immutable RenderResumeDataCache instance
 */
export declare function createRenderResumeDataCache(prerenderResumeDataCache: PrerenderResumeDataCache): RenderResumeDataCache;
export declare function createRenderResumeDataCache(persistedCache: string): RenderResumeDataCache;
