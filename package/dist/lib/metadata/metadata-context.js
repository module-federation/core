"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createMetadataContext: null,
    createTrackedMetadataContext: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createMetadataContext: function() {
        return createMetadataContext;
    },
    createTrackedMetadataContext: function() {
        return createTrackedMetadataContext;
    }
});
const _dynamicrendering = require("../../server/app-render/dynamic-rendering");
function createMetadataContext(pathname, renderOpts) {
    return {
        pathname,
        trailingSlash: renderOpts.trailingSlash,
        isStaticMetadataRouteFile: false
    };
}
function createTrackedMetadataContext(pathname, renderOpts, workStore) {
    return {
        // Use the regular metadata context, but we trap the pathname access.
        ...createMetadataContext(pathname, renderOpts),
        // Setup the trap around the pathname access so we can track when the
        // pathname is accessed while resolving metadata which would indicate it's
        // being used to resolve a relative URL. If that's the case, we don't want
        // to provide it, and instead we should error.
        get pathname () {
            if (workStore && workStore.isStaticGeneration && workStore.fallbackRouteParams && workStore.fallbackRouteParams.size > 0) {
                (0, _dynamicrendering.trackFallbackParamAccessed)(workStore, 'metadata relative url resolving');
            }
            return pathname;
        }
    };
}

//# sourceMappingURL=metadata-context.js.map