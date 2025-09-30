"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    EntryStatus: null,
    FetchStrategy: null,
    convertRouteTreeToFlightRouterState: null,
    createDetachedSegmentCacheEntry: null,
    fetchRouteOnCacheMiss: null,
    fetchSegmentOnCacheMiss: null,
    fetchSegmentPrefetchesUsingDynamicRequest: null,
    getCurrentCacheVersion: null,
    getSegmentKeypathForTask: null,
    readExactRouteCacheEntry: null,
    readOrCreateRevalidatingSegmentEntry: null,
    readOrCreateRouteCacheEntry: null,
    readOrCreateSegmentCacheEntry: null,
    readRouteCacheEntry: null,
    readSegmentCacheEntry: null,
    resetRevalidatingSegmentEntry: null,
    revalidateEntireCache: null,
    upgradeToPendingSegment: null,
    upsertSegmentEntry: null,
    waitForSegmentCacheEntry: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    EntryStatus: function() {
        return EntryStatus;
    },
    FetchStrategy: function() {
        return FetchStrategy;
    },
    convertRouteTreeToFlightRouterState: function() {
        return convertRouteTreeToFlightRouterState;
    },
    createDetachedSegmentCacheEntry: function() {
        return createDetachedSegmentCacheEntry;
    },
    fetchRouteOnCacheMiss: function() {
        return fetchRouteOnCacheMiss;
    },
    fetchSegmentOnCacheMiss: function() {
        return fetchSegmentOnCacheMiss;
    },
    fetchSegmentPrefetchesUsingDynamicRequest: function() {
        return fetchSegmentPrefetchesUsingDynamicRequest;
    },
    getCurrentCacheVersion: function() {
        return getCurrentCacheVersion;
    },
    getSegmentKeypathForTask: function() {
        return getSegmentKeypathForTask;
    },
    readExactRouteCacheEntry: function() {
        return readExactRouteCacheEntry;
    },
    readOrCreateRevalidatingSegmentEntry: function() {
        return readOrCreateRevalidatingSegmentEntry;
    },
    readOrCreateRouteCacheEntry: function() {
        return readOrCreateRouteCacheEntry;
    },
    readOrCreateSegmentCacheEntry: function() {
        return readOrCreateSegmentCacheEntry;
    },
    readRouteCacheEntry: function() {
        return readRouteCacheEntry;
    },
    readSegmentCacheEntry: function() {
        return readSegmentCacheEntry;
    },
    resetRevalidatingSegmentEntry: function() {
        return resetRevalidatingSegmentEntry;
    },
    revalidateEntireCache: function() {
        return revalidateEntireCache;
    },
    upgradeToPendingSegment: function() {
        return upgradeToPendingSegment;
    },
    upsertSegmentEntry: function() {
        return upsertSegmentEntry;
    },
    waitForSegmentCacheEntry: function() {
        return waitForSegmentCacheEntry;
    }
});
const _approuterheaders = require("../app-router-headers");
const _fetchserverresponse = require("../router-reducer/fetch-server-response");
const _scheduler = require("./scheduler");
const _appbuildid = require("../../app-build-id");
const _createhreffromurl = require("../router-reducer/create-href-from-url");
const _tuplemap = require("./tuple-map");
const _lru = require("./lru");
const _segmentvalueencoding = require("../../../shared/lib/segment-cache/segment-value-encoding");
const _flightdatahelpers = require("../../flight-data-helpers");
const _prefetchcacheutils = require("../router-reducer/prefetch-cache-utils");
const _links = require("../links");
const _segment = require("../../../shared/lib/segment");
var EntryStatus = /*#__PURE__*/ function(EntryStatus) {
    EntryStatus[EntryStatus["Empty"] = 0] = "Empty";
    EntryStatus[EntryStatus["Pending"] = 1] = "Pending";
    EntryStatus[EntryStatus["Fulfilled"] = 2] = "Fulfilled";
    EntryStatus[EntryStatus["Rejected"] = 3] = "Rejected";
    return EntryStatus;
}({});
var FetchStrategy = /*#__PURE__*/ function(FetchStrategy) {
    FetchStrategy[FetchStrategy["PPR"] = 0] = "PPR";
    FetchStrategy[FetchStrategy["Full"] = 1] = "Full";
    FetchStrategy[FetchStrategy["LoadingBoundary"] = 2] = "LoadingBoundary";
    return FetchStrategy;
}({});
const isOutputExportMode = process.env.NODE_ENV === 'production' && process.env.__NEXT_CONFIG_OUTPUT === 'export';
let routeCacheMap = (0, _tuplemap.createTupleMap)();
// We use an LRU for memory management. We must update this whenever we add or
// remove a new cache entry, or when an entry changes size.
// TODO: I chose the max size somewhat arbitrarily. Consider setting this based
// on navigator.deviceMemory, or some other heuristic. We should make this
// customizable via the Next.js config, too.
const maxRouteLruSize = 10 * 1024 * 1024 // 10 MB
;
let routeCacheLru = (0, _lru.createLRU)(maxRouteLruSize, onRouteLRUEviction);
let segmentCacheMap = (0, _tuplemap.createTupleMap)();
// NOTE: Segments and Route entries are managed by separate LRUs. We could
// combine them into a single LRU, but because they are separate types, we'd
// need to wrap each one in an extra LRU node (to maintain monomorphism, at the
// cost of additional memory).
const maxSegmentLruSize = 50 * 1024 * 1024 // 50 MB
;
let segmentCacheLru = (0, _lru.createLRU)(maxSegmentLruSize, onSegmentLRUEviction);
// Incrementing counter used to track cache invalidations.
let currentCacheVersion = 0;
function getCurrentCacheVersion() {
    return currentCacheVersion;
}
function revalidateEntireCache(nextUrl, tree) {
    currentCacheVersion++;
    // Clearing the cache also effectively rejects any pending requests, because
    // when the response is received, it gets written into a cache entry that is
    // no longer reachable.
    // TODO: There's an exception to this case that we don't currently handle
    // correctly: background revalidations. See note in `upsertSegmentEntry`.
    routeCacheMap = (0, _tuplemap.createTupleMap)();
    routeCacheLru = (0, _lru.createLRU)(maxRouteLruSize, onRouteLRUEviction);
    segmentCacheMap = (0, _tuplemap.createTupleMap)();
    segmentCacheLru = (0, _lru.createLRU)(maxSegmentLruSize, onSegmentLRUEviction);
    // Prefetch all the currently visible links again, to re-fill the cache.
    (0, _links.pingVisibleLinks)(nextUrl, tree);
}
function readExactRouteCacheEntry(now, href, nextUrl) {
    const keypath = nextUrl === null ? [
        href
    ] : [
        href,
        nextUrl
    ];
    const existingEntry = routeCacheMap.get(keypath);
    if (existingEntry !== null) {
        // Check if the entry is stale
        if (existingEntry.staleAt > now) {
            // Reuse the existing entry.
            // Since this is an access, move the entry to the front of the LRU.
            routeCacheLru.put(existingEntry);
            return existingEntry;
        } else {
            // Evict the stale entry from the cache.
            deleteRouteFromCache(existingEntry, keypath);
        }
    }
    return null;
}
function readRouteCacheEntry(now, key) {
    // First check if there's a non-intercepted entry. Most routes cannot be
    // intercepted, so this is the common case.
    const nonInterceptedEntry = readExactRouteCacheEntry(now, key.href, null);
    if (nonInterceptedEntry !== null && !nonInterceptedEntry.couldBeIntercepted) {
        // Found a match, and the route cannot be intercepted. We can reuse it.
        return nonInterceptedEntry;
    }
    // There was no match. Check again but include the Next-Url this time.
    return readExactRouteCacheEntry(now, key.href, key.nextUrl);
}
function getSegmentKeypathForTask(task, route, path) {
    // When a prefetch includes dynamic data, the search params are included
    // in the result, so we must include the search string in the segment
    // cache key. (Note that this is true even if the search string is empty.)
    //
    // If we're fetching using PPR, we do not need to include the search params in
    // the cache key, because the search params are treated as dynamic data. The
    // cache entry is valid for all possible search param values.
    const isDynamicTask = task.includeDynamicData || !route.isPPREnabled;
    return isDynamicTask && path.endsWith('/' + _segment.PAGE_SEGMENT_KEY) ? [
        path,
        task.key.search
    ] : [
        path
    ];
}
function readSegmentCacheEntry(now, routeCacheKey, path) {
    if (!path.endsWith('/' + _segment.PAGE_SEGMENT_KEY)) {
        // Fast path. Search params only exist on page segments.
        return readExactSegmentCacheEntry(now, [
            path
        ]);
    }
    // Page segments may or may not contain search params. If they were prefetched
    // using a dynamic request, then we will have an entry with search params.
    // Check for that case first.
    const entryWithSearchParams = readExactSegmentCacheEntry(now, [
        path,
        routeCacheKey.search
    ]);
    if (entryWithSearchParams !== null) {
        return entryWithSearchParams;
    }
    // If we did not find an entry with the given search params, check for a
    // "fallback" entry, where the search params are treated as dynamic data. This
    // is the common case because PPR/static prerenders always treat search params
    // as dynamic.
    //
    // See corresponding logic in `getSegmentKeypathForTask`.
    const entryWithoutSearchParams = readExactSegmentCacheEntry(now, [
        path
    ]);
    return entryWithoutSearchParams;
}
function readExactSegmentCacheEntry(now, keypath) {
    const existingEntry = segmentCacheMap.get(keypath);
    if (existingEntry !== null) {
        // Check if the entry is stale
        if (existingEntry.staleAt > now) {
            // Reuse the existing entry.
            // Since this is an access, move the entry to the front of the LRU.
            segmentCacheLru.put(existingEntry);
            return existingEntry;
        } else {
            // This is a stale entry.
            const revalidatingEntry = existingEntry.revalidating;
            if (revalidatingEntry !== null) {
                // There's a revalidation in progress. Upsert it.
                const upsertedEntry = upsertSegmentEntry(now, keypath, revalidatingEntry);
                if (upsertedEntry !== null && upsertedEntry.staleAt > now) {
                    // We can use the upserted revalidation entry.
                    return upsertedEntry;
                }
            } else {
                // Evict the stale entry from the cache.
                deleteSegmentFromCache(existingEntry, keypath);
            }
        }
    }
    return null;
}
function readRevalidatingSegmentCacheEntry(now, owner) {
    const existingRevalidation = owner.revalidating;
    if (existingRevalidation !== null) {
        if (existingRevalidation.staleAt > now) {
            // There's already a revalidation in progress. Or a previous revalidation
            // failed and it has not yet expired.
            return existingRevalidation;
        } else {
            // Clear the stale revalidation from its owner.
            clearRevalidatingSegmentFromOwner(owner);
        }
    }
    return null;
}
function waitForSegmentCacheEntry(pendingEntry) {
    // Because the entry is pending, there's already a in-progress request.
    // Attach a promise to the entry that will resolve when the server responds.
    let promiseWithResolvers = pendingEntry.promise;
    if (promiseWithResolvers === null) {
        promiseWithResolvers = pendingEntry.promise = createPromiseWithResolvers();
    } else {
    // There's already a promise we can use
    }
    return promiseWithResolvers.promise;
}
function readOrCreateRouteCacheEntry(now, task) {
    const key = task.key;
    const existingEntry = readRouteCacheEntry(now, key);
    if (existingEntry !== null) {
        return existingEntry;
    }
    // Create a pending entry and add it to the cache.
    const pendingEntry = {
        canonicalUrl: null,
        status: 0,
        blockedTasks: null,
        tree: null,
        head: null,
        isHeadPartial: true,
        // Since this is an empty entry, there's no reason to ever evict it. It will
        // be updated when the data is populated.
        staleAt: Infinity,
        // This is initialized to true because we don't know yet whether the route
        // could be intercepted. It's only set to false once we receive a response
        // from the server.
        couldBeIntercepted: true,
        // Similarly, we don't yet know if the route supports PPR.
        isPPREnabled: false,
        // LRU-related fields
        keypath: null,
        next: null,
        prev: null,
        size: 0
    };
    const keypath = key.nextUrl === null ? [
        key.href
    ] : [
        key.href,
        key.nextUrl
    ];
    routeCacheMap.set(keypath, pendingEntry);
    // Stash the keypath on the entry so we know how to remove it from the map
    // if it gets evicted from the LRU.
    pendingEntry.keypath = keypath;
    routeCacheLru.put(pendingEntry);
    return pendingEntry;
}
function readOrCreateSegmentCacheEntry(now, task, route, path) {
    const keypath = getSegmentKeypathForTask(task, route, path);
    const existingEntry = readExactSegmentCacheEntry(now, keypath);
    if (existingEntry !== null) {
        return existingEntry;
    }
    // Create a pending entry and add it to the cache.
    const pendingEntry = createDetachedSegmentCacheEntry(route.staleAt);
    segmentCacheMap.set(keypath, pendingEntry);
    // Stash the keypath on the entry so we know how to remove it from the map
    // if it gets evicted from the LRU.
    pendingEntry.keypath = keypath;
    segmentCacheLru.put(pendingEntry);
    return pendingEntry;
}
function readOrCreateRevalidatingSegmentEntry(now, prevEntry) {
    const existingRevalidation = readRevalidatingSegmentCacheEntry(now, prevEntry);
    if (existingRevalidation !== null) {
        return existingRevalidation;
    }
    const pendingEntry = createDetachedSegmentCacheEntry(prevEntry.staleAt);
    // Background revalidations are not stored directly in the cache map or LRU;
    // they're stashed on the entry that they will (potentially) replace.
    //
    // Note that we don't actually ever clear this field, except when the entry
    // expires. When the revalidation finishes, one of two things will happen:
    //
    //  1) the revalidation is successful, `prevEntry` is removed from the cache
    //     and garbage collected (so there's no point clearing any of its fields)
    //  2) the revalidation fails, and we'll use the `revalidating` field to
    //     prevent subsequent revalidation attempts, until it expires.
    prevEntry.revalidating = pendingEntry;
    return pendingEntry;
}
function upsertSegmentEntry(now, keypath, candidateEntry) {
    // We have a new entry that has not yet been inserted into the cache. Before
    // we do so, we need to confirm whether it takes precedence over the existing
    // entry (if one exists).
    // TODO: We should not upsert an entry if its key was invalidated in the time
    // since the request was made. We can do that by passing the "owner" entry to
    // this function and confirming it's the same as `existingEntry`.
    const existingEntry = readExactSegmentCacheEntry(now, keypath);
    if (existingEntry !== null) {
        if (candidateEntry.isPartial && !existingEntry.isPartial) {
            // Don't replace a full segment with a partial one. A case where this
            // might happen is if the existing segment was fetched via
            // <Link prefetch={true}>.
            // We're going to leave the entry on the owner's `revalidating` field
            // so that it doesn't get revalidated again unnecessarily. Downgrade the
            // Fulfilled entry to Rejected and null out the data so it can be garbage
            // collected. We leave `staleAt` intact to prevent subsequent revalidation
            // attempts only until the entry expires.
            const rejectedEntry = candidateEntry;
            rejectedEntry.status = 3;
            rejectedEntry.loading = null;
            rejectedEntry.rsc = null;
            return null;
        }
        // Evict the existing entry from the cache.
        deleteSegmentFromCache(existingEntry, keypath);
    }
    segmentCacheMap.set(keypath, candidateEntry);
    // Stash the keypath on the entry so we know how to remove it from the map
    // if it gets evicted from the LRU.
    candidateEntry.keypath = keypath;
    segmentCacheLru.put(candidateEntry);
    return candidateEntry;
}
function createDetachedSegmentCacheEntry(staleAt) {
    const emptyEntry = {
        status: 0,
        // Default to assuming the fetch strategy will be PPR. This will be updated
        // when a fetch is actually initiated.
        fetchStrategy: 0,
        revalidating: null,
        rsc: null,
        loading: null,
        staleAt,
        isPartial: true,
        promise: null,
        // LRU-related fields
        keypath: null,
        next: null,
        prev: null,
        size: 0
    };
    return emptyEntry;
}
function upgradeToPendingSegment(emptyEntry, fetchStrategy) {
    const pendingEntry = emptyEntry;
    pendingEntry.status = 1;
    pendingEntry.fetchStrategy = fetchStrategy;
    return pendingEntry;
}
function deleteRouteFromCache(entry, keypath) {
    pingBlockedTasks(entry);
    routeCacheMap.delete(keypath);
    routeCacheLru.delete(entry);
}
function deleteSegmentFromCache(entry, keypath) {
    cancelEntryListeners(entry);
    segmentCacheMap.delete(keypath);
    segmentCacheLru.delete(entry);
    clearRevalidatingSegmentFromOwner(entry);
}
function clearRevalidatingSegmentFromOwner(owner) {
    // Revalidating segments are not stored in the cache directly; they're
    // stored as a field on the entry that they will (potentially) replace. So
    // to dispose of an existing revalidation, we just need to null out the field
    // on the owner.
    const revalidatingSegment = owner.revalidating;
    if (revalidatingSegment !== null) {
        cancelEntryListeners(revalidatingSegment);
        owner.revalidating = null;
    }
}
function resetRevalidatingSegmentEntry(owner) {
    clearRevalidatingSegmentFromOwner(owner);
    const emptyEntry = createDetachedSegmentCacheEntry(owner.staleAt);
    owner.revalidating = emptyEntry;
    return emptyEntry;
}
function onRouteLRUEviction(entry) {
    // The LRU evicted this entry. Remove it from the map.
    const keypath = entry.keypath;
    if (keypath !== null) {
        entry.keypath = null;
        pingBlockedTasks(entry);
        routeCacheMap.delete(keypath);
    }
}
function onSegmentLRUEviction(entry) {
    // The LRU evicted this entry. Remove it from the map.
    const keypath = entry.keypath;
    if (keypath !== null) {
        entry.keypath = null;
        cancelEntryListeners(entry);
        segmentCacheMap.delete(keypath);
    }
}
function cancelEntryListeners(entry) {
    if (entry.status === 1 && entry.promise !== null) {
        // There were listeners for this entry. Resolve them with `null` to indicate
        // that the prefetch failed. It's up to the listener to decide how to handle
        // this case.
        // NOTE: We don't currently propagate the reason the prefetch was canceled
        // but we could by accepting a `reason` argument.
        entry.promise.resolve(null);
        entry.promise = null;
    }
}
function pingBlockedTasks(entry) {
    const blockedTasks = entry.blockedTasks;
    if (blockedTasks !== null) {
        for (const task of blockedTasks){
            (0, _scheduler.pingPrefetchTask)(task);
        }
        entry.blockedTasks = null;
    }
}
function fulfillRouteCacheEntry(entry, tree, head, isHeadPartial, staleAt, couldBeIntercepted, canonicalUrl, isPPREnabled) {
    const fulfilledEntry = entry;
    fulfilledEntry.status = 2;
    fulfilledEntry.tree = tree;
    fulfilledEntry.head = head;
    fulfilledEntry.isHeadPartial = isHeadPartial;
    fulfilledEntry.staleAt = staleAt;
    fulfilledEntry.couldBeIntercepted = couldBeIntercepted;
    fulfilledEntry.canonicalUrl = canonicalUrl;
    fulfilledEntry.isPPREnabled = isPPREnabled;
    pingBlockedTasks(entry);
    return fulfilledEntry;
}
function fulfillSegmentCacheEntry(segmentCacheEntry, rsc, loading, staleAt, isPartial) {
    const fulfilledEntry = segmentCacheEntry;
    fulfilledEntry.status = 2;
    fulfilledEntry.rsc = rsc;
    fulfilledEntry.loading = loading;
    fulfilledEntry.staleAt = staleAt;
    fulfilledEntry.isPartial = isPartial;
    // Resolve any listeners that were waiting for this data.
    if (segmentCacheEntry.promise !== null) {
        segmentCacheEntry.promise.resolve(fulfilledEntry);
        // Free the promise for garbage collection.
        fulfilledEntry.promise = null;
    }
    return fulfilledEntry;
}
function rejectRouteCacheEntry(entry, staleAt) {
    const rejectedEntry = entry;
    rejectedEntry.status = 3;
    rejectedEntry.staleAt = staleAt;
    pingBlockedTasks(entry);
}
function rejectSegmentCacheEntry(entry, staleAt) {
    const rejectedEntry = entry;
    rejectedEntry.status = 3;
    rejectedEntry.staleAt = staleAt;
    if (entry.promise !== null) {
        // NOTE: We don't currently propagate the reason the prefetch was canceled
        // but we could by accepting a `reason` argument.
        entry.promise.resolve(null);
        entry.promise = null;
    }
}
function convertRootTreePrefetchToRouteTree(rootTree) {
    return convertTreePrefetchToRouteTree(rootTree.tree, _segmentvalueencoding.ROOT_SEGMENT_KEY);
}
function convertTreePrefetchToRouteTree(prefetch, key) {
    // Converts the route tree sent by the server into the format used by the
    // cache. The cached version of the tree includes additional fields, such as a
    // cache key for each segment. Since this is frequently accessed, we compute
    // it once instead of on every access. This same cache key is also used to
    // request the segment from the server.
    let slots = null;
    const prefetchSlots = prefetch.slots;
    if (prefetchSlots !== null) {
        slots = {};
        for(let parallelRouteKey in prefetchSlots){
            const childPrefetch = prefetchSlots[parallelRouteKey];
            const childSegment = childPrefetch.segment;
            // TODO: Eventually, the param values will not be included in the response
            // from the server. We'll instead fill them in on the client by parsing
            // the URL. This is where we'll do that.
            const childKey = (0, _segmentvalueencoding.encodeChildSegmentKey)(key, parallelRouteKey, (0, _segmentvalueencoding.encodeSegment)(childSegment));
            slots[parallelRouteKey] = convertTreePrefetchToRouteTree(childPrefetch, childKey);
        }
    }
    return {
        key,
        segment: prefetch.segment,
        slots,
        isRootLayout: prefetch.isRootLayout
    };
}
function convertRootFlightRouterStateToRouteTree(flightRouterState) {
    return convertFlightRouterStateToRouteTree(flightRouterState, _segmentvalueencoding.ROOT_SEGMENT_KEY);
}
function convertFlightRouterStateToRouteTree(flightRouterState, key) {
    let slots = null;
    const parallelRoutes = flightRouterState[1];
    for(let parallelRouteKey in parallelRoutes){
        const childRouterState = parallelRoutes[parallelRouteKey];
        const childSegment = childRouterState[0];
        // TODO: Eventually, the param values will not be included in the response
        // from the server. We'll instead fill them in on the client by parsing
        // the URL. This is where we'll do that.
        const childKey = (0, _segmentvalueencoding.encodeChildSegmentKey)(key, parallelRouteKey, (0, _segmentvalueencoding.encodeSegment)(childSegment));
        const childTree = convertFlightRouterStateToRouteTree(childRouterState, childKey);
        if (slots === null) {
            slots = {
                [parallelRouteKey]: childTree
            };
        } else {
            slots[parallelRouteKey] = childTree;
        }
    }
    // The navigation implementation expects the search params to be included
    // in the segment. However, in the case of a static response, the search
    // params are omitted. So the client needs to add them back in when reading
    // from the Segment Cache.
    //
    // For consistency, we'll do this for dynamic responses, too.
    //
    // TODO: We should move search params out of FlightRouterState and handle them
    // entirely on the client, similar to our plan for dynamic params.
    const originalSegment = flightRouterState[0];
    const segmentWithoutSearchParams = typeof originalSegment === 'string' && originalSegment.startsWith(_segment.PAGE_SEGMENT_KEY) ? _segment.PAGE_SEGMENT_KEY : originalSegment;
    return {
        key,
        segment: segmentWithoutSearchParams,
        slots,
        isRootLayout: flightRouterState[4] === true
    };
}
function convertRouteTreeToFlightRouterState(routeTree) {
    const parallelRoutes = {};
    if (routeTree.slots !== null) {
        for(const parallelRouteKey in routeTree.slots){
            parallelRoutes[parallelRouteKey] = convertRouteTreeToFlightRouterState(routeTree.slots[parallelRouteKey]);
        }
    }
    const flightRouterState = [
        routeTree.segment,
        parallelRoutes,
        null,
        null,
        routeTree.isRootLayout
    ];
    return flightRouterState;
}
async function fetchRouteOnCacheMiss(entry, task) {
    // This function is allowed to use async/await because it contains the actual
    // fetch that gets issued on a cache miss. Notice it writes the result to the
    // cache entry directly, rather than return data that is then written by
    // the caller.
    const key = task.key;
    const href = key.href;
    const nextUrl = key.nextUrl;
    const segmentPath = '/_tree';
    const headers = {
        [_approuterheaders.RSC_HEADER]: '1',
        [_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER]: '1',
        [_approuterheaders.NEXT_ROUTER_SEGMENT_PREFETCH_HEADER]: segmentPath
    };
    if (nextUrl !== null) {
        headers[_approuterheaders.NEXT_URL] = nextUrl;
    }
    // In output: "export" mode, we need to add the segment path to the URL.
    const url = new URL(href);
    const requestUrl = isOutputExportMode ? addSegmentPathToUrlInOutputExportMode(url, segmentPath) : url;
    try {
        const response = await fetchPrefetchResponse(requestUrl, headers);
        if (!response || !response.ok || // 204 is a Cache miss. Though theoretically this shouldn't happen when
        // PPR is enabled, because we always respond to route tree requests, even
        // if it needs to be blockingly generated on demand.
        response.status === 204 || !response.body) {
            // Server responded with an error, or with a miss. We should still cache
            // the response, but we can try again after 10 seconds.
            rejectRouteCacheEntry(entry, Date.now() + 10 * 1000);
            return null;
        }
        // TODO: The canonical URL is the href without the origin. I think
        // historically the reason for this is because the initial canonical URL
        // gets passed as a prop to the top-level React component, which means it
        // needs to be computed during SSR. If it were to include the origin, it
        // would need to always be same as location.origin on the client, to prevent
        // a hydration mismatch. To sidestep this complexity, we omit the origin.
        //
        // However, since this is neither a native URL object nor a fully qualified
        // URL string, we need to be careful about how we use it. To prevent subtle
        // mistakes, we should create a special type for it, instead of just string.
        // Or, we should just use a (readonly) URL object instead. The type of the
        // prop that we pass to seed the initial state does not need to be the same
        // type as the state itself.
        const canonicalUrl = (0, _createhreffromurl.createHrefFromUrl)(new URL(response.redirected ? removeSegmentPathFromURLInOutputExportMode(href, requestUrl.href, response.url) : href));
        // Check whether the response varies based on the Next-Url header.
        const varyHeader = response.headers.get('vary');
        const couldBeIntercepted = varyHeader !== null && varyHeader.includes(_approuterheaders.NEXT_URL);
        // Track when the network connection closes.
        const closed = createPromiseWithResolvers();
        // This checks whether the response was served from the per-segment cache,
        // rather than the old prefetching flow. If it fails, it implies that PPR
        // is disabled on this route.
        const routeIsPPREnabled = response.headers.get(_approuterheaders.NEXT_DID_POSTPONE_HEADER) === '2' || // In output: "export" mode, we can't rely on response headers. But if we
        // receive a well-formed response, we can assume it's a static response,
        // because all data is static in this mode.
        isOutputExportMode;
        if (routeIsPPREnabled) {
            const prefetchStream = createPrefetchResponseStream(response.body, closed.resolve, function onResponseSizeUpdate(size) {
                routeCacheLru.updateSize(entry, size);
            });
            const serverData = await (0, _fetchserverresponse.createFromNextReadableStream)(prefetchStream);
            if (serverData.buildId !== (0, _appbuildid.getAppBuildId)()) {
                // The server build does not match the client. Treat as a 404. During
                // an actual navigation, the router will trigger an MPA navigation.
                // TODO: Consider moving the build ID to a response header so we can check
                // it before decoding the response, and so there's one way of checking
                // across all response types.
                rejectRouteCacheEntry(entry, Date.now() + 10 * 1000);
                return null;
            }
            const staleTimeMs = serverData.staleTime * 1000;
            fulfillRouteCacheEntry(entry, convertRootTreePrefetchToRouteTree(serverData), serverData.head, serverData.isHeadPartial, Date.now() + staleTimeMs, couldBeIntercepted, canonicalUrl, routeIsPPREnabled);
        } else {
            // PPR is not enabled for this route. The server responds with a
            // different format (FlightRouterState) that we need to convert.
            // TODO: We will unify the responses eventually. I'm keeping the types
            // separate for now because FlightRouterState has so many
            // overloaded concerns.
            const prefetchStream = createPrefetchResponseStream(response.body, closed.resolve, function onResponseSizeUpdate(size) {
                routeCacheLru.updateSize(entry, size);
            });
            const serverData = await (0, _fetchserverresponse.createFromNextReadableStream)(prefetchStream);
            writeDynamicTreeResponseIntoCache(Date.now(), task, response, serverData, entry, couldBeIntercepted, canonicalUrl, routeIsPPREnabled);
        }
        if (!couldBeIntercepted && nextUrl !== null) {
            // This route will never be intercepted. So we can use this entry for all
            // requests to this route, regardless of the Next-Url header. This works
            // because when reading the cache we always check for a valid
            // non-intercepted entry first.
            //
            // Re-key the entry. Since we're in an async task, we must first confirm
            // that the entry hasn't been concurrently modified by a different task.
            const currentKeypath = [
                href,
                nextUrl
            ];
            const expectedEntry = routeCacheMap.get(currentKeypath);
            if (expectedEntry === entry) {
                routeCacheMap.delete(currentKeypath);
                const newKeypath = [
                    href
                ];
                routeCacheMap.set(newKeypath, entry);
                // We don't need to update the LRU because the entry is already in it.
                // But since we changed the keypath, we do need to update that, so we
                // know how to remove it from the map if it gets evicted from the LRU.
                entry.keypath = newKeypath;
            } else {
            // Something else modified this entry already. Since the re-keying is
            // just a performance optimization, we can safely skip it.
            }
        }
        // Return a promise that resolves when the network connection closes, so
        // the scheduler can track the number of concurrent network connections.
        return {
            value: null,
            closed: closed.promise
        };
    } catch (error) {
        // Either the connection itself failed, or something bad happened while
        // decoding the response.
        rejectRouteCacheEntry(entry, Date.now() + 10 * 1000);
        return null;
    }
}
async function fetchSegmentOnCacheMiss(route, segmentCacheEntry, routeKey, segmentPath) {
    // This function is allowed to use async/await because it contains the actual
    // fetch that gets issued on a cache miss. Notice it writes the result to the
    // cache entry directly, rather than return data that is then written by
    // the caller.
    //
    // Segment fetches are non-blocking so we don't need to ping the scheduler
    // on completion.
    // Use the canonical URL to request the segment, not the original URL. These
    // are usually the same, but the canonical URL will be different if the route
    // tree response was redirected. To avoid an extra waterfall on every segment
    // request, we pass the redirected URL instead of the original one.
    const url = new URL(route.canonicalUrl, routeKey.href);
    const nextUrl = routeKey.nextUrl;
    const normalizedSegmentPath = segmentPath === _segmentvalueencoding.ROOT_SEGMENT_KEY ? // handling of these requests, we encode the root segment path as
    // `_index` instead of as an empty string. This should be treated as
    // an implementation detail and not as a stable part of the protocol.
    // It just needs to match the equivalent logic that happens when
    // prerendering the responses. It should not leak outside of Next.js.
    '/_index' : segmentPath;
    const headers = {
        [_approuterheaders.RSC_HEADER]: '1',
        [_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER]: '1',
        [_approuterheaders.NEXT_ROUTER_SEGMENT_PREFETCH_HEADER]: normalizedSegmentPath
    };
    if (nextUrl !== null) {
        headers[_approuterheaders.NEXT_URL] = nextUrl;
    }
    const requestUrl = isOutputExportMode ? addSegmentPathToUrlInOutputExportMode(url, normalizedSegmentPath) : url;
    try {
        const response = await fetchPrefetchResponse(requestUrl, headers);
        if (!response || !response.ok || response.status === 204 || // Cache miss
        // This checks whether the response was served from the per-segment cache,
        // rather than the old prefetching flow. If it fails, it implies that PPR
        // is disabled on this route. Theoretically this should never happen
        // because we only issue requests for segments once we've verified that
        // the route supports PPR.
        response.headers.get(_approuterheaders.NEXT_DID_POSTPONE_HEADER) !== '2' && // In output: "export" mode, we can't rely on response headers. But if
        // we receive a well-formed response, we can assume it's a static
        // response, because all data is static in this mode.
        !isOutputExportMode || !response.body) {
            // Server responded with an error, or with a miss. We should still cache
            // the response, but we can try again after 10 seconds.
            rejectSegmentCacheEntry(segmentCacheEntry, Date.now() + 10 * 1000);
            return null;
        }
        // Track when the network connection closes.
        const closed = createPromiseWithResolvers();
        // Wrap the original stream in a new stream that never closes. That way the
        // Flight client doesn't error if there's a hanging promise.
        const prefetchStream = createPrefetchResponseStream(response.body, closed.resolve, function onResponseSizeUpdate(size) {
            segmentCacheLru.updateSize(segmentCacheEntry, size);
        });
        const serverData = await (0, _fetchserverresponse.createFromNextReadableStream)(prefetchStream);
        if (serverData.buildId !== (0, _appbuildid.getAppBuildId)()) {
            // The server build does not match the client. Treat as a 404. During
            // an actual navigation, the router will trigger an MPA navigation.
            // TODO: Consider moving the build ID to a response header so we can check
            // it before decoding the response, and so there's one way of checking
            // across all response types.
            rejectSegmentCacheEntry(segmentCacheEntry, Date.now() + 10 * 1000);
            return null;
        }
        return {
            value: fulfillSegmentCacheEntry(segmentCacheEntry, serverData.rsc, serverData.loading, // TODO: The server does not currently provide per-segment stale time.
            // So we use the stale time of the route.
            route.staleAt, serverData.isPartial),
            // Return a promise that resolves when the network connection closes, so
            // the scheduler can track the number of concurrent network connections.
            closed: closed.promise
        };
    } catch (error) {
        // Either the connection itself failed, or something bad happened while
        // decoding the response.
        rejectSegmentCacheEntry(segmentCacheEntry, Date.now() + 10 * 1000);
        return null;
    }
}
async function fetchSegmentPrefetchesUsingDynamicRequest(task, route, fetchStrategy, dynamicRequestTree, spawnedEntries) {
    const url = new URL(route.canonicalUrl, task.key.href);
    const nextUrl = task.key.nextUrl;
    const headers = {
        [_approuterheaders.RSC_HEADER]: '1',
        [_approuterheaders.NEXT_ROUTER_STATE_TREE_HEADER]: encodeURIComponent(JSON.stringify(dynamicRequestTree))
    };
    if (nextUrl !== null) {
        headers[_approuterheaders.NEXT_URL] = nextUrl;
    }
    // Only set the prefetch header if we're not doing a "full" prefetch. We
    // omit the prefetch header from a full prefetch because it's essentially
    // just a navigation request that happens ahead of time — it should include
    // all the same data in the response.
    if (fetchStrategy !== 1) {
        headers[_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER] = '1';
    }
    try {
        const response = await fetchPrefetchResponse(url, headers);
        if (!response || !response.ok || !response.body) {
            // Server responded with an error, or with a miss. We should still cache
            // the response, but we can try again after 10 seconds.
            rejectSegmentEntriesIfStillPending(spawnedEntries, Date.now() + 10 * 1000);
            return null;
        }
        // Track when the network connection closes.
        const closed = createPromiseWithResolvers();
        let fulfilledEntries = null;
        const prefetchStream = createPrefetchResponseStream(response.body, closed.resolve, function onResponseSizeUpdate(totalBytesReceivedSoFar) {
            // When processing a dynamic response, we don't know how large each
            // individual segment is, so approximate by assiging each segment
            // the average of the total response size.
            if (fulfilledEntries === null) {
                // Haven't received enough data yet to know which segments
                // were included.
                return;
            }
            const averageSize = totalBytesReceivedSoFar / fulfilledEntries.length;
            for (const entry of fulfilledEntries){
                segmentCacheLru.updateSize(entry, averageSize);
            }
        });
        const serverData = await (0, _fetchserverresponse.createFromNextReadableStream)(prefetchStream);
        // Since we did not set the prefetch header, the response from the server
        // will never contain dynamic holes.
        const isResponsePartial = false;
        // Aside from writing the data into the cache, this function also returns
        // the entries that were fulfilled, so we can streamingly update their sizes
        // in the LRU as more data comes in.
        fulfilledEntries = writeDynamicRenderResponseIntoCache(Date.now(), task, response, serverData, isResponsePartial, route, spawnedEntries);
        // Return a promise that resolves when the network connection closes, so
        // the scheduler can track the number of concurrent network connections.
        return {
            value: null,
            closed: closed.promise
        };
    } catch (error) {
        rejectSegmentEntriesIfStillPending(spawnedEntries, Date.now() + 10 * 1000);
        return null;
    }
}
function writeDynamicTreeResponseIntoCache(now, task, response, serverData, entry, couldBeIntercepted, canonicalUrl, routeIsPPREnabled) {
    if (serverData.b !== (0, _appbuildid.getAppBuildId)()) {
        // The server build does not match the client. Treat as a 404. During
        // an actual navigation, the router will trigger an MPA navigation.
        // TODO: Consider moving the build ID to a response header so we can check
        // it before decoding the response, and so there's one way of checking
        // across all response types.
        rejectRouteCacheEntry(entry, now + 10 * 1000);
        return;
    }
    const normalizedFlightDataResult = (0, _flightdatahelpers.normalizeFlightData)(serverData.f);
    if (// A string result means navigating to this route will result in an
    // MPA navigation.
    typeof normalizedFlightDataResult === 'string' || normalizedFlightDataResult.length !== 1) {
        rejectRouteCacheEntry(entry, now + 10 * 1000);
        return;
    }
    const flightData = normalizedFlightDataResult[0];
    if (!flightData.isRootRender) {
        // Unexpected response format.
        rejectRouteCacheEntry(entry, now + 10 * 1000);
        return;
    }
    const flightRouterState = flightData.tree;
    // TODO: Extract to function
    const staleTimeHeaderSeconds = response.headers.get(_approuterheaders.NEXT_ROUTER_STALE_TIME_HEADER);
    const staleTimeMs = staleTimeHeaderSeconds !== null ? parseInt(staleTimeHeaderSeconds, 10) * 1000 : _prefetchcacheutils.STATIC_STALETIME_MS;
    // If the response contains dynamic holes, then we must conservatively assume
    // that any individual segment might contain dynamic holes, and also the
    // head. If it did not contain dynamic holes, then we can assume every segment
    // and the head is completely static.
    const isResponsePartial = response.headers.get(_approuterheaders.NEXT_DID_POSTPONE_HEADER) === '1';
    const fulfilledEntry = fulfillRouteCacheEntry(entry, convertRootFlightRouterStateToRouteTree(flightRouterState), flightData.head, isResponsePartial, now + staleTimeMs, couldBeIntercepted, canonicalUrl, routeIsPPREnabled);
    // If the server sent segment data as part of the response, we should write
    // it into the cache to prevent a second, redundant prefetch request.
    //
    // TODO: When `clientSegmentCache` is enabled, the server does not include
    // segment data when responding to a route tree prefetch request. However,
    // when `clientSegmentCache` is set to "client-only", and PPR is enabled (or
    // the page is fully static), the normal check is bypassed and the server
    // responds with the full page. This is a temporary situation until we can
    // remove the "client-only" option. Then, we can delete this function call.
    writeDynamicRenderResponseIntoCache(now, task, response, serverData, isResponsePartial, fulfilledEntry, null);
}
function rejectSegmentEntriesIfStillPending(entries, staleAt) {
    const fulfilledEntries = [];
    for (const entry of entries.values()){
        if (entry.status === 1) {
            rejectSegmentCacheEntry(entry, staleAt);
        } else if (entry.status === 2) {
            fulfilledEntries.push(entry);
        }
    }
    return fulfilledEntries;
}
function writeDynamicRenderResponseIntoCache(now, task, response, serverData, isResponsePartial, route, spawnedEntries) {
    if (serverData.b !== (0, _appbuildid.getAppBuildId)()) {
        // The server build does not match the client. Treat as a 404. During
        // an actual navigation, the router will trigger an MPA navigation.
        // TODO: Consider moving the build ID to a response header so we can check
        // it before decoding the response, and so there's one way of checking
        // across all response types.
        if (spawnedEntries !== null) {
            rejectSegmentEntriesIfStillPending(spawnedEntries, now + 10 * 1000);
        }
        return null;
    }
    const flightDatas = (0, _flightdatahelpers.normalizeFlightData)(serverData.f);
    if (typeof flightDatas === 'string') {
        // This means navigating to this route will result in an MPA navigation.
        // TODO: We should cache this, too, so that the MPA navigation is immediate.
        return null;
    }
    for (const flightData of flightDatas){
        const seedData = flightData.seedData;
        if (seedData !== null) {
            // The data sent by the server represents only a subtree of the app. We
            // need to find the part of the task tree that matches the response.
            //
            // segmentPath represents the parent path of subtree. It's a repeating
            // pattern of parallel route key and segment:
            //
            //   [string, Segment, string, Segment, string, Segment, ...]
            const segmentPath = flightData.segmentPath;
            let segmentKey = _segmentvalueencoding.ROOT_SEGMENT_KEY;
            for(let i = 0; i < segmentPath.length; i += 2){
                const parallelRouteKey = segmentPath[i];
                const segment = segmentPath[i + 1];
                segmentKey = (0, _segmentvalueencoding.encodeChildSegmentKey)(segmentKey, parallelRouteKey, (0, _segmentvalueencoding.encodeSegment)(segment));
            }
            const staleTimeHeaderSeconds = response.headers.get(_approuterheaders.NEXT_ROUTER_STALE_TIME_HEADER);
            const staleTimeMs = staleTimeHeaderSeconds !== null ? parseInt(staleTimeHeaderSeconds, 10) * 1000 : _prefetchcacheutils.STATIC_STALETIME_MS;
            writeSeedDataIntoCache(now, task, route, now + staleTimeMs, seedData, isResponsePartial, segmentKey, spawnedEntries);
        }
    }
    // Any entry that's still pending was intentionally not rendered by the
    // server, because it was inside the loading boundary. Mark them as rejected
    // so we know not to fetch them again.
    // TODO: If PPR is enabled on some routes but not others, then it's possible
    // that a different page is able to do a per-segment prefetch of one of the
    // segments we're marking as rejected here. We should mark on the segment
    // somehow that the reason for the rejection is because of a non-PPR prefetch.
    // That way a per-segment prefetch knows to disregard the rejection.
    if (spawnedEntries !== null) {
        const fulfilledEntries = rejectSegmentEntriesIfStillPending(spawnedEntries, now + 10 * 1000);
        return fulfilledEntries;
    }
    return null;
}
function writeSeedDataIntoCache(now, task, route, staleAt, seedData, isResponsePartial, key, entriesOwnedByCurrentTask) {
    // This function is used to write the result of a dynamic server request
    // (CacheNodeSeedData) into the prefetch cache. It's used in cases where we
    // want to treat a dynamic response as if it were static. The two examples
    // where this happens are <Link prefetch={true}> (which implicitly opts
    // dynamic data into being static) and when prefetching a PPR-disabled route
    const rsc = seedData[1];
    const loading = seedData[3];
    const isPartial = rsc === null || isResponsePartial;
    // We should only write into cache entries that are owned by us. Or create
    // a new one and write into that. We must never write over an entry that was
    // created by a different task, because that causes data races.
    const ownedEntry = entriesOwnedByCurrentTask !== null ? entriesOwnedByCurrentTask.get(key) : undefined;
    if (ownedEntry !== undefined) {
        fulfillSegmentCacheEntry(ownedEntry, rsc, loading, staleAt, isPartial);
    } else {
        // There's no matching entry. Attempt to create a new one.
        const possiblyNewEntry = readOrCreateSegmentCacheEntry(now, task, route, key);
        if (possiblyNewEntry.status === 0) {
            // Confirmed this is a new entry. We can fulfill it.
            const newEntry = possiblyNewEntry;
            fulfillSegmentCacheEntry(newEntry, rsc, loading, staleAt, isPartial);
        } else {
            // There was already an entry in the cache. But we may be able to
            // replace it with the new one from the server.
            const newEntry = fulfillSegmentCacheEntry(createDetachedSegmentCacheEntry(staleAt), rsc, loading, staleAt, isPartial);
            upsertSegmentEntry(now, getSegmentKeypathForTask(task, route, key), newEntry);
        }
    }
    // Recursively write the child data into the cache.
    const seedDataChildren = seedData[2];
    if (seedDataChildren !== null) {
        for(const parallelRouteKey in seedDataChildren){
            const childSeedData = seedDataChildren[parallelRouteKey];
            if (childSeedData !== null) {
                const childSegment = childSeedData[0];
                writeSeedDataIntoCache(now, task, route, staleAt, childSeedData, isResponsePartial, (0, _segmentvalueencoding.encodeChildSegmentKey)(key, parallelRouteKey, (0, _segmentvalueencoding.encodeSegment)(childSegment)), entriesOwnedByCurrentTask);
            }
        }
    }
}
async function fetchPrefetchResponse(url, headers) {
    const fetchPriority = 'low';
    const response = await (0, _fetchserverresponse.createFetch)(url, headers, fetchPriority);
    if (!response.ok) {
        return null;
    }
    // Check the content type
    if (isOutputExportMode) {
    // In output: "export" mode, we relaxed about the content type, since it's
    // not Next.js that's serving the response. If the status is OK, assume the
    // response is valid. If it's not a valid response, the Flight client won't
    // be able to decode it, and we'll treat it as a miss.
    } else {
        const contentType = response.headers.get('content-type');
        const isFlightResponse = contentType && contentType.startsWith(_approuterheaders.RSC_CONTENT_TYPE_HEADER);
        if (!isFlightResponse) {
            return null;
        }
    }
    return response;
}
function createPrefetchResponseStream(originalFlightStream, onStreamClose, onResponseSizeUpdate) {
    // When PPR is enabled, prefetch streams may contain references that never
    // resolve, because that's how we encode dynamic data access. In the decoded
    // object returned by the Flight client, these are reified into hanging
    // promises that suspend during render, which is effectively what we want.
    // The UI resolves when it switches to the dynamic data stream
    // (via useDeferredValue(dynamic, static)).
    //
    // However, the Flight implementation currently errors if the server closes
    // the response before all the references are resolved. As a cheat to work
    // around this, we wrap the original stream in a new stream that never closes,
    // and therefore doesn't error.
    //
    // While processing the original stream, we also incrementally update the size
    // of the cache entry in the LRU.
    let totalByteLength = 0;
    const reader = originalFlightStream.getReader();
    return new ReadableStream({
        async pull (controller) {
            while(true){
                const { done, value } = await reader.read();
                if (!done) {
                    // Pass to the target stream and keep consuming the Flight response
                    // from the server.
                    controller.enqueue(value);
                    // Incrementally update the size of the cache entry in the LRU.
                    // NOTE: Since prefetch responses are delivered in a single chunk,
                    // it's not really necessary to do this streamingly, but I'm doing it
                    // anyway in case this changes in the future.
                    totalByteLength += value.byteLength;
                    onResponseSizeUpdate(totalByteLength);
                    continue;
                }
                // The server stream has closed. Exit, but intentionally do not close
                // the target stream. We do notify the caller, though.
                onStreamClose();
                return;
            }
        }
    });
}
function addSegmentPathToUrlInOutputExportMode(url, segmentPath) {
    if (isOutputExportMode) {
        // In output: "export" mode, we cannot use a header to encode the segment
        // path. Instead, we append it to the end of the pathname.
        const staticUrl = new URL(url);
        const routeDir = staticUrl.pathname.endsWith('/') ? staticUrl.pathname.substring(0, -1) : staticUrl.pathname;
        const staticExportFilename = (0, _segmentvalueencoding.convertSegmentPathToStaticExportFilename)(segmentPath);
        staticUrl.pathname = routeDir + "/" + staticExportFilename;
        return staticUrl;
    }
    return url;
}
function removeSegmentPathFromURLInOutputExportMode(href, requestUrl, redirectUrl) {
    if (isOutputExportMode) {
        // Reverse of addSegmentPathToUrlInOutputExportMode.
        //
        // In output: "export" mode, we append an extra string to the URL that
        // represents the segment path. If the server performs a redirect, it must
        // include the segment path in new URL.
        //
        // This removes the segment path from the redirected URL to obtain the
        // URL of the page.
        const segmentPath = requestUrl.substring(href.length);
        if (redirectUrl.endsWith(segmentPath)) {
            // Remove the segment path from the redirect URL to get the page URL.
            return redirectUrl.substring(0, redirectUrl.length - segmentPath.length);
        } else {
        // The server redirected to a URL that doesn't include the segment path.
        // This suggests the server may not have been configured correctly, but
        // we'll assume the redirected URL represents the page URL and continue.
        // TODO: Consider printing a warning with a link to a page that explains
        // how to configure redirects and rewrites correctly.
        }
    }
    return redirectUrl;
}
function createPromiseWithResolvers() {
    // Shim of Stage 4 Promise.withResolvers proposal
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    return {
        resolve: resolve,
        reject: reject,
        promise
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=cache.js.map