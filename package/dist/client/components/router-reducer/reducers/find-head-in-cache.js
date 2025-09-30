"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "findHeadInCache", {
    enumerable: true,
    get: function() {
        return findHeadInCache;
    }
});
const _createroutercachekey = require("../create-router-cache-key");
function findHeadInCache(cache, parallelRoutes) {
    return findHeadInCacheImpl(cache, parallelRoutes, '');
}
function findHeadInCacheImpl(cache, parallelRoutes, keyPrefix) {
    const isLastItem = Object.keys(parallelRoutes).length === 0;
    if (isLastItem) {
        // Returns the entire Cache Node of the segment whose head we will render.
        return [
            cache,
            keyPrefix
        ];
    }
    // First try the 'children' parallel route if it exists
    // when starting from the "root", this corresponds with the main page component
    if (parallelRoutes.children) {
        const [segment, childParallelRoutes] = parallelRoutes.children;
        const childSegmentMap = cache.parallelRoutes.get('children');
        if (childSegmentMap) {
            const cacheKey = (0, _createroutercachekey.createRouterCacheKey)(segment);
            const cacheNode = childSegmentMap.get(cacheKey);
            if (cacheNode) {
                const item = findHeadInCacheImpl(cacheNode, childParallelRoutes, keyPrefix + '/' + cacheKey);
                if (item) return item;
            }
        }
    }
    // if we didn't find metadata in the page slot, check the other parallel routes
    for(const key in parallelRoutes){
        if (key === 'children') continue; // already checked above
        const [segment, childParallelRoutes] = parallelRoutes[key];
        const childSegmentMap = cache.parallelRoutes.get(key);
        if (!childSegmentMap) {
            continue;
        }
        const cacheKey = (0, _createroutercachekey.createRouterCacheKey)(segment);
        const cacheNode = childSegmentMap.get(cacheKey);
        if (!cacheNode) {
            continue;
        }
        const item = findHeadInCacheImpl(cacheNode, childParallelRoutes, keyPrefix + '/' + cacheKey);
        if (item) {
            return item;
        }
    }
    return null;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=find-head-in-cache.js.map