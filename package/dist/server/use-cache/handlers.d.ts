import type { CacheHandlerCompat } from '../lib/cache-handlers/types';
/**
 * Initialize the cache handlers.
 * @returns `true` if the cache handlers were initialized, `false` if they were already initialized.
 */
export declare function initializeCacheHandlers(): boolean;
/**
 * Get a cache handler by kind.
 * @param kind - The kind of cache handler to get.
 * @returns The cache handler, or `undefined` if it does not exist.
 * @throws If the cache handlers are not initialized.
 */
export declare function getCacheHandler(kind: string): CacheHandlerCompat | undefined;
/**
 * Get a set iterator over the cache handlers.
 * @returns An iterator over the cache handlers, or `undefined` if they are not
 * initialized.
 */
export declare function getCacheHandlers(): SetIterator<CacheHandlerCompat> | undefined;
/**
 * Get a map iterator over the cache handlers (keyed by kind).
 * @returns An iterator over the cache handler entries, or `undefined` if they
 * are not initialized.
 * @throws If the cache handlers are not initialized.
 */
export declare function getCacheHandlerEntries(): MapIterator<[string, CacheHandlerCompat]> | undefined;
/**
 * Set a cache handler by kind.
 * @param kind - The kind of cache handler to set.
 * @param cacheHandler - The cache handler to set.
 */
export declare function setCacheHandler(kind: string, cacheHandler: CacheHandlerCompat): void;
