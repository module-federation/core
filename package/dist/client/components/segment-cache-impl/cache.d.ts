import type { HeadData, LoadingModuleData } from '../../../shared/lib/app-router-context.shared-runtime';
import type { Segment as FlightRouterStateSegment } from '../../../server/app-render/types';
import { type PrefetchTask, type PrefetchSubtaskResult } from './scheduler';
import type { NormalizedHref, NormalizedNextUrl, NormalizedSearch, RouteCacheKey } from './cache-key';
import { type Prefix } from './tuple-map';
import type { FlightRouterState } from '../../../server/app-render/types';
export type RouteTree = {
    key: string;
    segment: FlightRouterStateSegment;
    slots: null | {
        [parallelRouteKey: string]: RouteTree;
    };
    isRootLayout: boolean;
};
type RouteCacheEntryShared = {
    staleAt: number;
    couldBeIntercepted: boolean;
    keypath: null | Prefix<RouteCacheKeypath>;
    next: null | RouteCacheEntry;
    prev: null | RouteCacheEntry;
    size: number;
};
/**
 * Tracks the status of a cache entry as it progresses from no data (Empty),
 * waiting for server data (Pending), and finished (either Fulfilled or
 * Rejected depending on the response from the server.
 */
export declare const enum EntryStatus {
    Empty = 0,
    Pending = 1,
    Fulfilled = 2,
    Rejected = 3
}
type PendingRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Empty | EntryStatus.Pending;
    blockedTasks: Set<PrefetchTask> | null;
    canonicalUrl: null;
    tree: null;
    head: HeadData | null;
    isHeadPartial: true;
    isPPREnabled: false;
};
type RejectedRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Rejected;
    blockedTasks: Set<PrefetchTask> | null;
    canonicalUrl: null;
    tree: null;
    head: null;
    isHeadPartial: true;
    isPPREnabled: boolean;
};
export type FulfilledRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Fulfilled;
    blockedTasks: null;
    canonicalUrl: string;
    tree: RouteTree;
    head: HeadData;
    isHeadPartial: boolean;
    isPPREnabled: boolean;
};
export type RouteCacheEntry = PendingRouteCacheEntry | FulfilledRouteCacheEntry | RejectedRouteCacheEntry;
export declare const enum FetchStrategy {
    PPR = 0,
    Full = 1,
    LoadingBoundary = 2
}
type SegmentCacheEntryShared = {
    staleAt: number;
    fetchStrategy: FetchStrategy;
    revalidating: SegmentCacheEntry | null;
    keypath: null | Prefix<SegmentCacheKeypath>;
    next: null | SegmentCacheEntry;
    prev: null | SegmentCacheEntry;
    size: number;
};
export type EmptySegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Empty;
    rsc: null;
    loading: null;
    isPartial: true;
    promise: null;
};
export type PendingSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Pending;
    rsc: null;
    loading: null;
    isPartial: true;
    promise: null | PromiseWithResolvers<FulfilledSegmentCacheEntry | null>;
};
type RejectedSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Rejected;
    rsc: null;
    loading: null;
    isPartial: true;
    promise: null;
};
export type FulfilledSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Fulfilled;
    rsc: React.ReactNode | null;
    loading: LoadingModuleData | Promise<LoadingModuleData>;
    isPartial: boolean;
    promise: null;
};
export type SegmentCacheEntry = EmptySegmentCacheEntry | PendingSegmentCacheEntry | RejectedSegmentCacheEntry | FulfilledSegmentCacheEntry;
export type NonEmptySegmentCacheEntry = Exclude<SegmentCacheEntry, EmptySegmentCacheEntry>;
type RouteCacheKeypath = [NormalizedHref, NormalizedNextUrl];
type SegmentCacheKeypath = [string, NormalizedSearch];
export declare function getCurrentCacheVersion(): number;
/**
 * Used to clear the client prefetch cache when a server action calls
 * revalidatePath or revalidateTag. Eventually we will support only clearing the
 * segments that were actually affected, but there's more work to be done on the
 * server before the client is able to do this correctly.
 */
export declare function revalidateEntireCache(nextUrl: string | null, tree: FlightRouterState): void;
export declare function readExactRouteCacheEntry(now: number, href: NormalizedHref, nextUrl: NormalizedNextUrl | null): RouteCacheEntry | null;
export declare function readRouteCacheEntry(now: number, key: RouteCacheKey): RouteCacheEntry | null;
export declare function getSegmentKeypathForTask(task: PrefetchTask, route: FulfilledRouteCacheEntry, path: string): Prefix<SegmentCacheKeypath>;
export declare function readSegmentCacheEntry(now: number, routeCacheKey: RouteCacheKey, path: string): SegmentCacheEntry | null;
export declare function waitForSegmentCacheEntry(pendingEntry: PendingSegmentCacheEntry): Promise<FulfilledSegmentCacheEntry | null>;
/**
 * Checks if an entry for a route exists in the cache. If so, it returns the
 * entry, If not, it adds an empty entry to the cache and returns it.
 */
export declare function readOrCreateRouteCacheEntry(now: number, task: PrefetchTask): RouteCacheEntry;
/**
 * Checks if an entry for a segment exists in the cache. If so, it returns the
 * entry, If not, it adds an empty entry to the cache and returns it.
 */
export declare function readOrCreateSegmentCacheEntry(now: number, task: PrefetchTask, route: FulfilledRouteCacheEntry, path: string): SegmentCacheEntry;
export declare function readOrCreateRevalidatingSegmentEntry(now: number, prevEntry: SegmentCacheEntry): SegmentCacheEntry;
export declare function upsertSegmentEntry(now: number, keypath: Prefix<SegmentCacheKeypath>, candidateEntry: SegmentCacheEntry): SegmentCacheEntry | null;
export declare function createDetachedSegmentCacheEntry(staleAt: number): EmptySegmentCacheEntry;
export declare function upgradeToPendingSegment(emptyEntry: EmptySegmentCacheEntry, fetchStrategy: FetchStrategy): PendingSegmentCacheEntry;
export declare function resetRevalidatingSegmentEntry(owner: SegmentCacheEntry): EmptySegmentCacheEntry;
export declare function convertRouteTreeToFlightRouterState(routeTree: RouteTree): FlightRouterState;
export declare function fetchRouteOnCacheMiss(entry: PendingRouteCacheEntry, task: PrefetchTask): Promise<PrefetchSubtaskResult<null> | null>;
export declare function fetchSegmentOnCacheMiss(route: FulfilledRouteCacheEntry, segmentCacheEntry: PendingSegmentCacheEntry, routeKey: RouteCacheKey, segmentPath: string): Promise<PrefetchSubtaskResult<FulfilledSegmentCacheEntry> | null>;
export declare function fetchSegmentPrefetchesUsingDynamicRequest(task: PrefetchTask, route: FulfilledRouteCacheEntry, fetchStrategy: FetchStrategy, dynamicRequestTree: FlightRouterState, spawnedEntries: Map<string, PendingSegmentCacheEntry>): Promise<PrefetchSubtaskResult<null> | null>;
export {};
