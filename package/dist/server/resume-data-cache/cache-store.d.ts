import type { CacheEntry } from '../lib/cache-handlers/types';
import type { CachedFetchValue } from '../response-cache/types';
/**
 * A generic cache store type that provides a subset of Map functionality
 */
type CacheStore<T> = Pick<Map<string, T>, 'entries' | 'keys' | 'size' | 'get' | 'set'>;
/**
 * A cache store specifically for fetch cache values
 */
export type FetchCacheStore = CacheStore<CachedFetchValue>;
/**
 * A cache store for encrypted bound args of inline server functions.
 */
export type EncryptedBoundArgsCacheStore = CacheStore<string>;
/**
 * An in-memory-only cache store for decrypted bound args of inline server
 * functions.
 */
export type DecryptedBoundArgsCacheStore = CacheStore<string>;
/**
 * Serialized format for "use cache" entries
 */
export interface UseCacheCacheStoreSerialized {
    value: string;
    tags: string[];
    stale: number;
    timestamp: number;
    expire: number;
    revalidate: number;
}
/**
 * A cache store specifically for "use cache" values that stores promises of
 * cache entries.
 */
export type UseCacheCacheStore = CacheStore<Promise<CacheEntry>>;
/**
 * Parses serialized cache entries into a UseCacheCacheStore
 * @param entries - The serialized entries to parse
 * @returns A new UseCacheCacheStore containing the parsed entries
 */
export declare function parseUseCacheCacheStore(entries: Iterable<[string, UseCacheCacheStoreSerialized]>): UseCacheCacheStore;
/**
 * Serializes UseCacheCacheStore entries into an array of key-value pairs
 * @param entries - The store entries to stringify
 * @returns A promise that resolves to an array of key-value pairs with serialized values
 */
export declare function serializeUseCacheCacheStore(entries: IterableIterator<[string, Promise<CacheEntry>]>): Promise<Array<[string, UseCacheCacheStoreSerialized] | null>>;
export {};
