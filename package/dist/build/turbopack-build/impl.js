"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    turbopackBuild: null,
    waitForShutdown: null,
    workerMain: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    turbopackBuild: function() {
        return turbopackBuild;
    },
    waitForShutdown: function() {
        return waitForShutdown;
    },
    workerMain: function() {
        return workerMain;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _turbopackwarning = require("../../lib/turbopack-warning");
const _utils = require("../../shared/lib/turbopack/utils");
const _buildcontext = require("../build-context");
const _swc = require("../swc");
const _handleentrypoints = require("../handle-entrypoints");
const _manifestloader = require("../../shared/lib/turbopack/manifest-loader");
const _fs = require("fs");
const _constants = require("../../shared/lib/constants");
const _config = /*#__PURE__*/ _interop_require_default(require("../../server/config"));
const _utils1 = require("../../export/utils");
const _storage = require("../../telemetry/storage");
const _trace = require("../../trace");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function turbopackBuild() {
    var _config_experimental, _config_turbopack, _config_experimental1;
    await (0, _turbopackwarning.validateTurboNextConfig)({
        dir: _buildcontext.NextBuildContext.dir,
        isDev: false
    });
    const config = _buildcontext.NextBuildContext.config;
    const dir = _buildcontext.NextBuildContext.dir;
    const distDir = _buildcontext.NextBuildContext.distDir;
    const buildId = _buildcontext.NextBuildContext.buildId;
    const encryptionKey = _buildcontext.NextBuildContext.encryptionKey;
    const previewProps = _buildcontext.NextBuildContext.previewProps;
    const hasRewrites = _buildcontext.NextBuildContext.hasRewrites;
    const rewrites = _buildcontext.NextBuildContext.rewrites;
    const appDirOnly = _buildcontext.NextBuildContext.appDirOnly;
    const noMangling = _buildcontext.NextBuildContext.noMangling;
    const startTime = process.hrtime();
    const bindings = await (0, _swc.loadBindings)(config == null ? void 0 : (_config_experimental = config.experimental) == null ? void 0 : _config_experimental.useWasmBinary);
    const dev = false;
    // const supportedBrowsers = await getSupportedBrowsers(dir, dev)
    const supportedBrowsers = [
        'last 1 Chrome versions, last 1 Firefox versions, last 1 Safari versions, last 1 Edge versions'
    ];
    const persistentCaching = (0, _utils.isPersistentCachingEnabled)(config);
    const project = await bindings.turbo.createProject({
        projectPath: dir,
        rootPath: ((_config_turbopack = config.turbopack) == null ? void 0 : _config_turbopack.root) || config.outputFileTracingRoot || dir,
        distDir,
        nextConfig: config,
        jsConfig: await (0, _utils.getTurbopackJsConfig)(dir, config),
        watch: {
            enable: false
        },
        dev,
        env: process.env,
        defineEnv: (0, _swc.createDefineEnv)({
            isTurbopack: true,
            clientRouterFilters: _buildcontext.NextBuildContext.clientRouterFilters,
            config,
            dev,
            distDir,
            fetchCacheKeyPrefix: config.experimental.fetchCacheKeyPrefix,
            hasRewrites,
            // Implemented separately in Turbopack, doesn't have to be passed here.
            middlewareMatchers: undefined
        }),
        buildId,
        encryptionKey,
        previewProps,
        browserslistQuery: supportedBrowsers.join(', '),
        noMangling
    }, {
        persistentCaching,
        memoryLimit: (_config_experimental1 = config.experimental) == null ? void 0 : _config_experimental1.turbopackMemoryLimit,
        dependencyTracking: persistentCaching
    });
    try {
        // Write an empty file in a known location to signal this was built with Turbopack
        await _fs.promises.writeFile(_path.default.join(distDir, 'turbopack'), '');
        await _fs.promises.mkdir(_path.default.join(distDir, 'server'), {
            recursive: true
        });
        await _fs.promises.mkdir(_path.default.join(distDir, 'static', buildId), {
            recursive: true
        });
        await _fs.promises.writeFile(_path.default.join(distDir, 'package.json'), JSON.stringify({
            type: 'commonjs'
        }, null, 2));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const entrypoints = await project.writeAllEntrypointsToDisk(appDirOnly);
        const manifestLoader = new _manifestloader.TurbopackManifestLoader({
            buildId,
            distDir,
            encryptionKey
        });
        const topLevelErrors = [];
        const topLevelWarnings = [];
        for (const issue of entrypoints.issues){
            if (issue.severity === 'error' || issue.severity === 'fatal') {
                topLevelErrors.push((0, _utils.formatIssue)(issue));
            } else if ((0, _utils.isRelevantWarning)(issue)) {
                topLevelWarnings.push((0, _utils.formatIssue)(issue));
            }
        }
        if (topLevelWarnings.length > 0) {
            console.warn(`Turbopack build encountered ${topLevelWarnings.length} warnings:\n${topLevelWarnings.join('\n')}`);
        }
        if (topLevelErrors.length > 0) {
            throw Object.defineProperty(new Error(`Turbopack build failed with ${topLevelErrors.length} errors:\n${topLevelErrors.join('\n')}`), "__NEXT_ERROR_CODE", {
                value: "E425",
                enumerable: false,
                configurable: true
            });
        }
        const currentEntrypoints = await (0, _handleentrypoints.rawEntrypointsToEntrypoints)(entrypoints);
        const promises = [];
        if (!appDirOnly) {
            for (const [page, route] of currentEntrypoints.page){
                promises.push((0, _handleentrypoints.handleRouteType)({
                    page,
                    route,
                    manifestLoader
                }));
            }
        }
        for (const [page, route] of currentEntrypoints.app){
            promises.push((0, _handleentrypoints.handleRouteType)({
                page,
                route,
                manifestLoader
            }));
        }
        await Promise.all(promises);
        await Promise.all([
            manifestLoader.loadBuildManifest('_app'),
            manifestLoader.loadPagesManifest('_app'),
            manifestLoader.loadFontManifest('_app'),
            manifestLoader.loadPagesManifest('_document'),
            manifestLoader.loadBuildManifest('_error'),
            manifestLoader.loadPagesManifest('_error'),
            manifestLoader.loadFontManifest('_error'),
            entrypoints.instrumentation && manifestLoader.loadMiddlewareManifest('instrumentation', 'instrumentation'),
            entrypoints.middleware && await manifestLoader.loadMiddlewareManifest('middleware', 'middleware')
        ]);
        await manifestLoader.writeManifests({
            devRewrites: undefined,
            productionRewrites: rewrites,
            entrypoints: currentEntrypoints
        });
        const shutdownPromise = project.shutdown();
        const time = process.hrtime(startTime);
        return {
            duration: time[0] + time[1] / 1e9,
            buildTraceContext: undefined,
            shutdownPromise
        };
    } catch (err) {
        await project.shutdown();
        throw err;
    }
}
let shutdownPromise;
async function workerMain(workerData) {
    // setup new build context from the serialized data passed from the parent
    Object.assign(_buildcontext.NextBuildContext, workerData.buildContext);
    /// load the config because it's not serializable
    _buildcontext.NextBuildContext.config = await (0, _config.default)(_constants.PHASE_PRODUCTION_BUILD, _buildcontext.NextBuildContext.dir);
    // Matches handling in build/index.ts
    // https://github.com/vercel/next.js/blob/84f347fc86f4efc4ec9f13615c215e4b9fb6f8f0/packages/next/src/build/index.ts#L815-L818
    // Ensures the `config.distDir` option is matched.
    if ((0, _utils1.hasCustomExportOutput)(_buildcontext.NextBuildContext.config)) {
        _buildcontext.NextBuildContext.config.distDir = '.next';
    }
    // Clone the telemetry for worker
    const telemetry = new _storage.Telemetry({
        distDir: _buildcontext.NextBuildContext.config.distDir
    });
    (0, _trace.setGlobal)('telemetry', telemetry);
    const result = await turbopackBuild();
    shutdownPromise = result.shutdownPromise;
    return result;
}
async function waitForShutdown() {
    if (shutdownPromise) {
        await shutdownPromise;
    }
}

//# sourceMappingURL=impl.js.map