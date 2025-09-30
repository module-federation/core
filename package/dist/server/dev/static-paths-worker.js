"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "loadStaticPaths", {
    enumerable: true,
    get: function() {
        return loadStaticPaths;
    }
});
require("../require-hook");
require("../node-environment");
const _utils = require("../../build/utils");
const _appsegments = require("../../build/segment-config/app/app-segments");
const _loadcomponents = require("../load-components");
const _setuphttpagentenv = require("../setup-http-agent-env");
const _checks = require("../route-modules/checks");
const _ppr = require("../lib/experimental/ppr");
const _invarianterror = require("../../shared/lib/invariant-error");
const _collectrootparamkeys = require("../../build/segment-config/app/collect-root-param-keys");
const _app = require("../../build/static-paths/app");
const _pages = require("../../build/static-paths/pages");
const _createincrementalcache = require("../../export/helpers/create-incremental-cache");
async function loadStaticPaths({ dir, distDir, pathname, config, httpAgentOptions, locales, defaultLocale, isAppPath, page, isrFlushToDisk, fetchCacheKeyPrefix, maxMemoryCacheSize, requestHeaders, cacheHandler, cacheHandlers, cacheLifeProfiles, nextConfigOutput, buildId, authInterrupts, sriEnabled }) {
    // this needs to be initialized before loadComponents otherwise
    // "use cache" could be missing it's cache handlers
    await (0, _createincrementalcache.createIncrementalCache)({
        dir,
        distDir,
        cacheHandler,
        cacheHandlers,
        requestHeaders,
        fetchCacheKeyPrefix,
        flushToDisk: isrFlushToDisk,
        cacheMaxMemorySize: maxMemoryCacheSize
    });
    // update work memory runtime-config
    require('../../shared/lib/runtime-config.external').setConfig(config);
    (0, _setuphttpagentenv.setHttpClientAndAgentOptions)({
        httpAgentOptions
    });
    const components = await (0, _loadcomponents.loadComponents)({
        distDir,
        // In `pages/`, the page is the same as the pathname.
        page: page || pathname,
        isAppPath,
        isDev: true,
        sriEnabled
    });
    if (isAppPath) {
        const segments = await (0, _appsegments.collectSegments)(components);
        const isRoutePPREnabled = (0, _checks.isAppPageRouteModule)(components.routeModule) && (0, _ppr.checkIsRoutePPREnabled)(config.pprConfig, (0, _utils.reduceAppConfig)(segments));
        const rootParamKeys = (0, _collectrootparamkeys.collectRootParamKeys)(components);
        return (0, _app.buildAppStaticPaths)({
            dir,
            page: pathname,
            dynamicIO: config.dynamicIO,
            segments,
            distDir,
            requestHeaders,
            cacheHandler,
            cacheLifeProfiles,
            isrFlushToDisk,
            fetchCacheKeyPrefix,
            maxMemoryCacheSize,
            ComponentMod: components.ComponentMod,
            nextConfigOutput,
            isRoutePPREnabled,
            buildId,
            authInterrupts,
            rootParamKeys
        });
    } else if (!components.getStaticPaths) {
        // We shouldn't get to this point since the worker should only be called for
        // SSG pages with getStaticPaths.
        throw Object.defineProperty(new _invarianterror.InvariantError(`Failed to load page with getStaticPaths for ${pathname}`), "__NEXT_ERROR_CODE", {
            value: "E605",
            enumerable: false,
            configurable: true
        });
    }
    return (0, _pages.buildPagesStaticPaths)({
        page: pathname,
        getStaticPaths: components.getStaticPaths,
        configFileName: config.configFileName,
        locales,
        defaultLocale
    });
}

//# sourceMappingURL=static-paths-worker.js.map