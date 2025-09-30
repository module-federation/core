import { IncrementalCache } from '../../server/lib/incremental-cache';
export declare function createIncrementalCache({ cacheHandler, cacheMaxMemorySize, fetchCacheKeyPrefix, distDir, dir, flushToDisk, cacheHandlers, requestHeaders, }: {
    cacheHandler?: string;
    cacheMaxMemorySize?: number;
    fetchCacheKeyPrefix?: string;
    distDir: string;
    dir: string;
    flushToDisk?: boolean;
    requestHeaders?: Record<string, string | string[] | undefined>;
    cacheHandlers?: Record<string, string | undefined>;
}): Promise<IncrementalCache>;
