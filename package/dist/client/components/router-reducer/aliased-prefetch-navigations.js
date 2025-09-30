"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    addSearchParamsToPageSegments: null,
    handleAliasedPrefetchEntry: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    addSearchParamsToPageSegments: function() {
        return addSearchParamsToPageSegments;
    },
    handleAliasedPrefetchEntry: function() {
        return handleAliasedPrefetchEntry;
    }
});
const _segment = require("../../../shared/lib/segment");
const _approuter = require("../app-router");
const _applyrouterstatepatchtotree = require("./apply-router-state-patch-to-tree");
const _createhreffromurl = require("./create-href-from-url");
const _createroutercachekey = require("./create-router-cache-key");
const _fillcachewithnewsubtreedata = require("./fill-cache-with-new-subtree-data");
const _handlemutable = require("./handle-mutable");
function handleAliasedPrefetchEntry(navigatedAt, state, flightData, url, mutable) {
    let currentTree = state.tree;
    let currentCache = state.cache;
    const href = (0, _createhreffromurl.createHrefFromUrl)(url);
    let applied;
    if (typeof flightData === 'string') {
        return false;
    }
    for (const normalizedFlightData of flightData){
        // If the segment doesn't have a loading component, we don't need to do anything.
        if (!hasLoadingComponentInSeedData(normalizedFlightData.seedData)) {
            continue;
        }
        let treePatch = normalizedFlightData.tree;
        // Segments are keyed by searchParams (e.g. __PAGE__?{"foo":"bar"}). We might return a less specific, param-less entry,
        // so we ensure that the final tree contains the correct searchParams (reflected in the URL) are provided in the updated FlightRouterState tree.
        // We only do this on the first read, as otherwise we'd be overwriting the searchParams that may have already been set
        treePatch = addSearchParamsToPageSegments(treePatch, Object.fromEntries(url.searchParams));
        const { seedData, isRootRender, pathToSegment } = normalizedFlightData;
        // TODO-APP: remove ''
        const flightSegmentPathWithLeadingEmpty = [
            '',
            ...pathToSegment
        ];
        // Segments are keyed by searchParams (e.g. __PAGE__?{"foo":"bar"}). We might return a less specific, param-less entry,
        // so we ensure that the final tree contains the correct searchParams (reflected in the URL) are provided in the updated FlightRouterState tree.
        // We only do this on the first read, as otherwise we'd be overwriting the searchParams that may have already been set
        treePatch = addSearchParamsToPageSegments(treePatch, Object.fromEntries(url.searchParams));
        let newTree = (0, _applyrouterstatepatchtotree.applyRouterStatePatchToTree)(flightSegmentPathWithLeadingEmpty, currentTree, treePatch, href);
        const newCache = (0, _approuter.createEmptyCacheNode)();
        // The prefetch cache entry was aliased -- this signals that we only fill in the cache with the
        // loading state and not the actual parallel route seed data.
        if (isRootRender && seedData) {
            // Fill in the cache with the new loading / rsc data
            const rsc = seedData[1];
            const loading = seedData[3];
            newCache.loading = loading;
            newCache.rsc = rsc;
            // Construct a new tree and apply the aliased loading state for each parallel route
            fillNewTreeWithOnlyLoadingSegments(navigatedAt, newCache, currentCache, treePatch, seedData);
        } else {
            // Copy rsc for the root node of the cache.
            newCache.rsc = currentCache.rsc;
            newCache.prefetchRsc = currentCache.prefetchRsc;
            newCache.loading = currentCache.loading;
            newCache.parallelRoutes = new Map(currentCache.parallelRoutes);
            // copy the loading state only into the leaf node (the part that changed)
            (0, _fillcachewithnewsubtreedata.fillCacheWithNewSubTreeDataButOnlyLoading)(navigatedAt, newCache, currentCache, normalizedFlightData);
        }
        // If we don't have an updated tree, there's no reason to update the cache, as the tree
        // dictates what cache nodes to render.
        if (newTree) {
            currentTree = newTree;
            currentCache = newCache;
            applied = true;
        }
    }
    if (!applied) {
        return false;
    }
    mutable.patchedTree = currentTree;
    mutable.cache = currentCache;
    mutable.canonicalUrl = href;
    mutable.hashFragment = url.hash;
    return (0, _handlemutable.handleMutable)(state, mutable);
}
function hasLoadingComponentInSeedData(seedData) {
    if (!seedData) return false;
    const parallelRoutes = seedData[2];
    const loading = seedData[3];
    if (loading) {
        return true;
    }
    for(const key in parallelRoutes){
        if (hasLoadingComponentInSeedData(parallelRoutes[key])) {
            return true;
        }
    }
    return false;
}
function fillNewTreeWithOnlyLoadingSegments(navigatedAt, newCache, existingCache, routerState, cacheNodeSeedData) {
    const isLastSegment = Object.keys(routerState[1]).length === 0;
    if (isLastSegment) {
        return;
    }
    for(const key in routerState[1]){
        const parallelRouteState = routerState[1][key];
        const segmentForParallelRoute = parallelRouteState[0];
        const cacheKey = (0, _createroutercachekey.createRouterCacheKey)(segmentForParallelRoute);
        const parallelSeedData = cacheNodeSeedData !== null && cacheNodeSeedData[2][key] !== undefined ? cacheNodeSeedData[2][key] : null;
        let newCacheNode;
        if (parallelSeedData !== null) {
            // New data was sent from the server.
            const rsc = parallelSeedData[1];
            const loading = parallelSeedData[3];
            newCacheNode = {
                lazyData: null,
                // copy the layout but null the page segment as that's not meant to be used
                rsc: segmentForParallelRoute.includes(_segment.PAGE_SEGMENT_KEY) ? null : rsc,
                prefetchRsc: null,
                head: null,
                prefetchHead: null,
                parallelRoutes: new Map(),
                loading,
                navigatedAt
            };
        } else {
            // No data available for this node. This will trigger a lazy fetch
            // during render.
            newCacheNode = {
                lazyData: null,
                rsc: null,
                prefetchRsc: null,
                head: null,
                prefetchHead: null,
                parallelRoutes: new Map(),
                loading: null,
                navigatedAt: -1
            };
        }
        const existingParallelRoutes = newCache.parallelRoutes.get(key);
        if (existingParallelRoutes) {
            existingParallelRoutes.set(cacheKey, newCacheNode);
        } else {
            newCache.parallelRoutes.set(key, new Map([
                [
                    cacheKey,
                    newCacheNode
                ]
            ]));
        }
        fillNewTreeWithOnlyLoadingSegments(navigatedAt, newCacheNode, existingCache, parallelRouteState, parallelSeedData);
    }
}
function addSearchParamsToPageSegments(flightRouterState, searchParams) {
    const [segment, parallelRoutes, ...rest] = flightRouterState;
    // If it's a page segment, modify the segment by adding search params
    if (segment.includes(_segment.PAGE_SEGMENT_KEY)) {
        const newSegment = (0, _segment.addSearchParamsIfPageSegment)(segment, searchParams);
        return [
            newSegment,
            parallelRoutes,
            ...rest
        ];
    }
    // Otherwise, recurse through the parallel routes and return a new tree
    const updatedParallelRoutes = {};
    for (const [key, parallelRoute] of Object.entries(parallelRoutes)){
        updatedParallelRoutes[key] = addSearchParamsToPageSegments(parallelRoute, searchParams);
    }
    return [
        segment,
        updatedParallelRoutes,
        ...rest
    ];
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=aliased-prefetch-navigations.js.map