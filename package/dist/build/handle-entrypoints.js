"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    handleRouteType: null,
    rawEntrypointsToEntrypoints: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    handleRouteType: function() {
        return handleRouteType;
    },
    rawEntrypointsToEntrypoints: function() {
        return rawEntrypointsToEntrypoints;
    }
});
const _entrykey = require("../shared/lib/turbopack/entry-key");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("./output/log"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function rawEntrypointsToEntrypoints(entrypointsOp) {
    const page = new Map();
    const app = new Map();
    for (const [pathname, route] of entrypointsOp.routes){
        switch(route.type){
            case 'page':
            case 'page-api':
                page.set(pathname, route);
                break;
            case 'app-page':
                {
                    for (const p of route.pages){
                        app.set(p.originalName, {
                            type: 'app-page',
                            ...p
                        });
                    }
                    break;
                }
            case 'app-route':
                {
                    app.set(route.originalName, route);
                    break;
                }
            default:
                _log.info(`skipping ${pathname} (${route.type})`);
                break;
        }
    }
    return {
        global: {
            app: entrypointsOp.pagesAppEndpoint,
            document: entrypointsOp.pagesDocumentEndpoint,
            error: entrypointsOp.pagesErrorEndpoint,
            instrumentation: entrypointsOp.instrumentation,
            middleware: entrypointsOp.middleware
        },
        page,
        app
    };
}
async function handleRouteType({ page, route, manifestLoader }) {
    const shouldCreateWebpackStats = process.env.TURBOPACK_STATS != null;
    switch(route.type){
        case 'page':
            {
                const serverKey = (0, _entrykey.getEntryKey)('pages', 'server', page);
                await manifestLoader.loadBuildManifest(page);
                await manifestLoader.loadPagesManifest(page);
                const middlewareManifestWritten = await manifestLoader.loadMiddlewareManifest(page, 'pages');
                if (!middlewareManifestWritten) {
                    manifestLoader.deleteMiddlewareManifest(serverKey);
                }
                await manifestLoader.loadFontManifest('/_app', 'pages');
                await manifestLoader.loadFontManifest(page, 'pages');
                if (shouldCreateWebpackStats) {
                    await manifestLoader.loadWebpackStats(page, 'pages');
                }
                break;
            }
        case 'page-api':
            {
                const key = (0, _entrykey.getEntryKey)('pages', 'server', page);
                await manifestLoader.loadPagesManifest(page);
                const middlewareManifestWritten = await manifestLoader.loadMiddlewareManifest(page, 'pages');
                if (!middlewareManifestWritten) {
                    manifestLoader.deleteMiddlewareManifest(key);
                }
                break;
            }
        case 'app-page':
            {
                const key = (0, _entrykey.getEntryKey)('app', 'server', page);
                const middlewareManifestWritten = await manifestLoader.loadMiddlewareManifest(page, 'app');
                if (!middlewareManifestWritten) {
                    manifestLoader.deleteMiddlewareManifest(key);
                }
                await manifestLoader.loadAppBuildManifest(page);
                await manifestLoader.loadBuildManifest(page, 'app');
                await manifestLoader.loadAppPathsManifest(page);
                await manifestLoader.loadActionManifest(page);
                await manifestLoader.loadFontManifest(page, 'app');
                if (shouldCreateWebpackStats) {
                    await manifestLoader.loadWebpackStats(page, 'app');
                }
                break;
            }
        case 'app-route':
            {
                const key = (0, _entrykey.getEntryKey)('app', 'server', page);
                await manifestLoader.loadAppPathsManifest(page);
                const middlewareManifestWritten = await manifestLoader.loadMiddlewareManifest(page, 'app');
                if (!middlewareManifestWritten) {
                    manifestLoader.deleteMiddlewareManifest(key);
                }
                break;
            }
        default:
            {
                throw Object.defineProperty(new Error(`unknown route type ${route.type} for ${page}`), "__NEXT_ERROR_CODE", {
                    value: "E316",
                    enumerable: false,
                    configurable: true
                });
            }
    }
}

//# sourceMappingURL=handle-entrypoints.js.map