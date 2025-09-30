import type { CacheFs } from '../../../shared/lib/utils';
import type { PrerenderManifest } from '../../../build';
import { type IncrementalCacheValue, type IncrementalCache as IncrementalCacheType, type IncrementalResponseCacheEntry, type IncrementalFetchCacheEntry, type GetIncrementalFetchCacheContext, type GetIncrementalResponseCacheContext, type CachedFetchValue, type SetIncrementalFetchCacheContext, type SetIncrementalResponseCacheContext } from '../../response-cache';
import type { DeepReadonly } from '../../../shared/lib/deep-readonly';
export interface CacheHandlerContext {
    fs?: CacheFs;
    dev?: boolean;
    flushToDisk?: boolean;
    serverDistDir?: string;
    maxMemoryCacheSize?: number;
    fetchCacheKeyPrefix?: string;
    prerenderManifest?: PrerenderManifest;
    revalidatedTags: string[];
    _requestHeaders: IncrementalCache['requestHeaders'];
}
export interface CacheHandlerValue {
    lastModified?: number;
    age?: number;
    cacheState?: string;
    value: IncrementalCacheValue | null;
}
export declare class CacheHandler {
    constructor(_ctx: CacheHandlerContext);
    get(_cacheKey: string, _ctx: GetIncrementalFetchCacheContext | GetIncrementalResponseCacheContext): Promise<CacheHandlerValue | null>;
    set(_cacheKey: string, _data: IncrementalCacheValue | null, _ctx: SetIncrementalFetchCacheContext | SetIncrementalResponseCacheContext): Promise<void>;
    revalidateTag(..._args: Parameters<IncrementalCache['revalidateTag']>): Promise<void>;
    resetRequestCache(): void;
}
export declare class IncrementalCache implements IncrementalCacheType {
    readonly dev?: boolean;
    readonly disableForTestmode?: boolean;
    readonly cacheHandler?: CacheHandler;
    readonly hasCustomCacheHandler: boolean;
    readonly prerenderManifest: DeepReadonly<PrerenderManifest>;
    readonly requestHeaders: Record<string, undefined | string | string[]>;
    readonly requestProtocol?: 'http' | 'https';
    readonly allowedRevalidateHeaderKeys?: string[];
    readonly minimalMode?: boolean;
    readonly fetchCacheKeyPrefix?: string;
    readonly revalidatedTags?: string[];
    readonly isOnDemandRevalidate?: boolean;
    private readonly locks;
    /**
     * The cache controls for routes. This will source the values from the
     * prerender manifest until the in-memory cache is updated with new values.
     */
    private readonly cacheControls;
    constructor({ fs, dev, flushToDisk, minimalMode, serverDistDir, requestHeaders, requestProtocol, maxMemoryCacheSize, getPrerenderManifest, fetchCacheKeyPrefix, CurCacheHandler, allowedRevalidateHeaderKeys, }: {
        fs?: CacheFs;
        dev: boolean;
        minimalMode?: boolean;
        serverDistDir?: string;
        flushToDisk?: boolean;
        requestProtocol?: 'http' | 'https';
        allowedRevalidateHeaderKeys?: string[];
        requestHeaders: IncrementalCache['requestHeaders'];
        maxMemoryCacheSize?: number;
        getPrerenderManifest: () => DeepReadonly<PrerenderManifest>;
        fetchCacheKeyPrefix?: string;
        CurCacheHandler?: typeof CacheHandler;
    });
    private calculateRevalidate;
    _getPathname(pathname: string, fetchCache?: boolean): string;
    resetRequestCache(): void;
    lock(cacheKey: string): Promise<() => Promise<void>>;
    revalidateTag(tags: string | string[]): Promise<void>;
    generateCacheKey(url: string, init?: RequestInit | Request): Promise<string>;
    get(cacheKey: string, ctx: GetIncrementalFetchCacheContext): Promise<IncrementalFetchCacheEntry | null>;
    get(cacheKey: string, ctx: GetIncrementalResponseCacheContext): Promise<IncrementalResponseCacheEntry | null>;
    set(pathname: string, data: CachedFetchValue | null, ctx: SetIncrementalFetchCacheContext): Promise<void>;
    set(pathname: string, data: Exclude<IncrementalCacheValue, CachedFetchValue> | null, ctx: SetIncrementalResponseCacheContext): Promise<void>;
}
