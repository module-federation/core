import { InvariantError } from '../../shared/lib/invariant-error';
import { serializeUseCacheCacheStore, parseUseCacheCacheStore } from './cache-store';
/**
 * Serializes a resume data cache into a JSON string for storage or
 * transmission. Handles 'use cache' values, fetch responses, and encrypted
 * bound args for inline server functions.
 *
 * @param resumeDataCache - The immutable cache to serialize
 * @returns A Promise that resolves to the serialized cache as a JSON string, or
 * 'null' if empty
 */ export async function stringifyResumeDataCache(resumeDataCache) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new InvariantError('`stringifyResumeDataCache` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E602",
            enumerable: false,
            configurable: true
        });
    } else {
        if (resumeDataCache.fetch.size === 0 && resumeDataCache.cache.size === 0) {
            return 'null';
        }
        const json = {
            store: {
                fetch: Object.fromEntries(Array.from(resumeDataCache.fetch.entries())),
                cache: Object.fromEntries((await serializeUseCacheCacheStore(resumeDataCache.cache.entries())).filter((entry)=>entry !== null)),
                encryptedBoundArgs: Object.fromEntries(Array.from(resumeDataCache.encryptedBoundArgs.entries()))
            }
        };
        // Compress the JSON string using zlib. As the data we already want to
        // decompress is in memory, we use the synchronous deflateSync function.
        const { deflateSync } = require('node:zlib');
        return deflateSync(JSON.stringify(json)).toString('base64');
    }
}
/**
 * Creates a new empty mutable resume data cache for pre-rendering.
 * Initializes fresh Map instances for both the 'use cache' and fetch caches.
 * Used at the start of pre-rendering to begin collecting cached values.
 *
 * @returns A new empty PrerenderResumeDataCache instance
 */ export function createPrerenderResumeDataCache() {
    return {
        cache: new Map(),
        fetch: new Map(),
        encryptedBoundArgs: new Map(),
        decryptedBoundArgs: new Map()
    };
}
export function createRenderResumeDataCache(prerenderResumeDataCacheOrPersistedCache) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new InvariantError('`createRenderResumeDataCache` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E556",
            enumerable: false,
            configurable: true
        });
    } else {
        if (typeof prerenderResumeDataCacheOrPersistedCache !== 'string') {
            // If the cache is already a prerender cache, we can return it directly,
            // we're just performing a type change.
            return prerenderResumeDataCacheOrPersistedCache;
        }
        if (prerenderResumeDataCacheOrPersistedCache === 'null') {
            return {
                cache: new Map(),
                fetch: new Map(),
                encryptedBoundArgs: new Map(),
                decryptedBoundArgs: new Map()
            };
        }
        // This should be a compressed string. Let's decompress it using zlib.
        // As the data we already want to decompress is in memory, we use the
        // synchronous inflateSync function.
        const { inflateSync } = require('node:zlib');
        const json = JSON.parse(inflateSync(Buffer.from(prerenderResumeDataCacheOrPersistedCache, 'base64')).toString('utf-8'));
        return {
            cache: parseUseCacheCacheStore(Object.entries(json.store.cache)),
            fetch: new Map(Object.entries(json.store.fetch)),
            encryptedBoundArgs: new Map(Object.entries(json.store.encryptedBoundArgs)),
            decryptedBoundArgs: new Map()
        };
    }
}

//# sourceMappingURL=resume-data-cache.js.map