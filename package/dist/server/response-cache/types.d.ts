import type { OutgoingHttpHeaders } from 'http';
import type RenderResult from '../render-result';
import type { CacheControl, Revalidate } from '../lib/cache-control';
import type { RouteKind } from '../route-kind';
export interface ResponseCacheBase {
    get(key: string | null, responseGenerator: ResponseGenerator, context: {
        isOnDemandRevalidate?: boolean;
        isPrefetch?: boolean;
        incrementalCache: IncrementalCache;
        /**
         * This is a hint to the cache to help it determine what kind of route
         * this is so it knows where to look up the cache entry from. If not
         * provided it will test the filesystem to check.
         */
        routeKind: RouteKind;
        /**
         * True if this is a fallback request.
         */
        isFallback?: boolean;
        /**
         * True if the route is enabled for PPR.
         */
        isRoutePPREnabled?: boolean;
    }): Promise<ResponseCacheEntry | null>;
}
export interface ServerComponentsHmrCache {
    get(key: string): CachedFetchData | undefined;
    set(key: string, data: CachedFetchData): void;
}
export type CachedFetchData = {
    headers: Record<string, string>;
    body: string;
    url: string;
    status?: number;
};
export declare const enum CachedRouteKind {
    APP_PAGE = "APP_PAGE",
    APP_ROUTE = "APP_ROUTE",
    PAGES = "PAGES",
    FETCH = "FETCH",
    REDIRECT = "REDIRECT",
    IMAGE = "IMAGE"
}
export interface CachedFetchValue {
    kind: CachedRouteKind.FETCH;
    data: CachedFetchData;
    tags?: string[];
    revalidate: number;
}
export interface CachedRedirectValue {
    kind: CachedRouteKind.REDIRECT;
    props: Object;
}
export interface CachedAppPageValue {
    kind: CachedRouteKind.APP_PAGE;
    html: RenderResult;
    rscData: Buffer | undefined;
    status: number | undefined;
    postponed: string | undefined;
    headers: OutgoingHttpHeaders | undefined;
    segmentData: Map<string, Buffer> | undefined;
}
export interface CachedPageValue {
    kind: CachedRouteKind.PAGES;
    html: RenderResult;
    pageData: Object;
    status: number | undefined;
    headers: OutgoingHttpHeaders | undefined;
}
export interface CachedRouteValue {
    kind: CachedRouteKind.APP_ROUTE;
    body: Buffer;
    status: number;
    headers: OutgoingHttpHeaders;
}
export interface CachedImageValue {
    kind: CachedRouteKind.IMAGE;
    etag: string;
    upstreamEtag: string;
    buffer: Buffer;
    extension: string;
    isMiss?: boolean;
    isStale?: boolean;
}
export interface IncrementalCachedAppPageValue {
    kind: CachedRouteKind.APP_PAGE;
    html: string;
    rscData: Buffer | undefined;
    headers: OutgoingHttpHeaders | undefined;
    postponed: string | undefined;
    status: number | undefined;
    segmentData: Map<string, Buffer> | undefined;
}
export interface IncrementalCachedPageValue {
    kind: CachedRouteKind.PAGES;
    html: string;
    pageData: Object;
    headers: OutgoingHttpHeaders | undefined;
    status: number | undefined;
}
export interface IncrementalResponseCacheEntry {
    cacheControl?: CacheControl;
    /**
     * timestamp in milliseconds to revalidate after
     */
    revalidateAfter?: Revalidate;
    /**
     * `-1` here dictates a blocking revalidate should be used
     */
    isStale?: boolean | -1;
    isMiss?: boolean;
    isFallback: boolean | undefined;
    value: Exclude<IncrementalCacheValue, CachedFetchValue> | null;
}
export interface IncrementalFetchCacheEntry {
    /**
     * `-1` here dictates a blocking revalidate should be used
     */
    isStale?: boolean | -1;
    value: CachedFetchValue;
}
export type IncrementalCacheEntry = IncrementalResponseCacheEntry | IncrementalFetchCacheEntry;
export type IncrementalCacheValue = CachedRedirectValue | IncrementalCachedPageValue | IncrementalCachedAppPageValue | CachedImageValue | CachedFetchValue | CachedRouteValue;
export type ResponseCacheValue = CachedRedirectValue | CachedPageValue | CachedAppPageValue | CachedImageValue | CachedRouteValue;
export type ResponseCacheEntry = {
    cacheControl?: CacheControl;
    value: ResponseCacheValue | null;
    isStale?: boolean | -1;
    isMiss?: boolean;
    isFallback: boolean | undefined;
};
/**
 * @param hasResolved whether the responseGenerator has resolved it's promise
 * @param previousCacheEntry the previous cache entry if it exists or the current
 */
export type ResponseGenerator = (state: {
    hasResolved: boolean;
    previousCacheEntry?: IncrementalResponseCacheEntry | null;
    isRevalidating?: boolean;
}) => Promise<ResponseCacheEntry | null>;
export declare const enum IncrementalCacheKind {
    APP_PAGE = "APP_PAGE",
    APP_ROUTE = "APP_ROUTE",
    PAGES = "PAGES",
    FETCH = "FETCH",
    IMAGE = "IMAGE"
}
export interface GetIncrementalFetchCacheContext {
    kind: IncrementalCacheKind.FETCH;
    revalidate?: Revalidate;
    fetchUrl?: string;
    fetchIdx?: number;
    tags?: string[];
    softTags?: string[];
}
export interface GetIncrementalResponseCacheContext {
    kind: Exclude<IncrementalCacheKind, IncrementalCacheKind.FETCH>;
    /**
     * True if the route is enabled for PPR.
     */
    isRoutePPREnabled?: boolean;
    /**
     * True if this is a fallback request.
     */
    isFallback: boolean;
}
export interface SetIncrementalFetchCacheContext {
    fetchCache: true;
    fetchUrl?: string;
    fetchIdx?: number;
    tags?: string[];
}
export interface SetIncrementalResponseCacheContext {
    fetchCache?: false;
    cacheControl?: CacheControl;
    /**
     * True if the route is enabled for PPR.
     */
    isRoutePPREnabled?: boolean;
    /**
     * True if this is a fallback request.
     */
    isFallback?: boolean;
}
export interface IncrementalResponseCache {
    get(cacheKey: string, ctx: GetIncrementalResponseCacheContext): Promise<IncrementalResponseCacheEntry | null>;
    set(key: string, data: Exclude<IncrementalCacheValue, CachedFetchValue> | null, ctx: SetIncrementalResponseCacheContext): Promise<void>;
}
export interface IncrementalCache extends IncrementalResponseCache {
    get(cacheKey: string, ctx: GetIncrementalFetchCacheContext): Promise<IncrementalFetchCacheEntry | null>;
    get(cacheKey: string, ctx: GetIncrementalResponseCacheContext): Promise<IncrementalResponseCacheEntry | null>;
    set(key: string, data: CachedFetchValue | null, ctx: SetIncrementalFetchCacheContext): Promise<void>;
    set(key: string, data: Exclude<IncrementalCacheValue, CachedFetchValue> | null, ctx: SetIncrementalResponseCacheContext): Promise<void>;
}
