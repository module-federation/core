import { pathToRegexp } from 'next/dist/compiled/path-to-regexp';
import { APP_BUILD_MANIFEST, APP_PATHS_MANIFEST, BUILD_MANIFEST, INTERCEPTION_ROUTE_REWRITE_MANIFEST, MIDDLEWARE_BUILD_MANIFEST, MIDDLEWARE_MANIFEST, NEXT_FONT_MANIFEST, PAGES_MANIFEST, SERVER_REFERENCE_MANIFEST, TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST, WEBPACK_STATS } from '../constants';
import { join, posix } from 'path';
import { readFile } from 'fs/promises';
import { deleteCache } from '../../../server/dev/require-cache';
import { writeFileAtomic } from '../../../lib/fs/write-atomic';
import { isInterceptionRouteRewrite } from '../../../lib/generate-interception-routes-rewrites';
import { normalizeRewritesForBuildManifest, srcEmptySsgManifest, processRoute, createEdgeRuntimeManifest } from '../../../build/webpack/plugins/build-manifest-plugin';
import getAssetPathFromRoute from '../router/utils/get-asset-path-from-route';
import { getEntryKey } from './entry-key';
import { getSortedRoutes } from '../router/utils';
import { existsSync } from 'fs';
import { addMetadataIdToRoute, addRouteSuffix, removeRouteSuffix } from '../../../server/dev/turbopack-utils';
import { tryToParsePath } from '../../../lib/try-to-parse-path';
const getManifestPath = (page, distDir, name, type, firstCall)=>{
    let manifestPath = posix.join(distDir, "server", type, type === 'middleware' || type === 'instrumentation' ? '' : type === 'app' ? page : getAssetPathFromRoute(page), name);
    if (firstCall) {
        const isSitemapRoute = /[\\/]sitemap(.xml)?\/route$/.test(page);
        // Check the ambiguity of /sitemap and /sitemap.xml
        if (isSitemapRoute && !existsSync(manifestPath)) {
            manifestPath = getManifestPath(page.replace(/\/sitemap\/route$/, '/sitemap.xml/route'), distDir, name, type, false);
        }
        // existsSync is faster than using the async version
        if (!existsSync(manifestPath) && page.endsWith('/route')) {
            // TODO: Improve implementation of metadata routes, currently it requires this extra check for the variants of the files that can be written.
            let metadataPage = addRouteSuffix(addMetadataIdToRoute(removeRouteSuffix(page)));
            manifestPath = getManifestPath(metadataPage, distDir, name, type, false);
        }
    }
    return manifestPath;
};
async function readPartialManifest(distDir, name, pageName, type) {
    if (type === void 0) type = 'pages';
    const page = pageName;
    const manifestPath = getManifestPath(page, distDir, name, type, true);
    return JSON.parse(await readFile(posix.join(manifestPath), 'utf-8'));
}
export class TurbopackManifestLoader {
    delete(key) {
        this.actionManifests.delete(key);
        this.appBuildManifests.delete(key);
        this.appPathsManifests.delete(key);
        this.buildManifests.delete(key);
        this.fontManifests.delete(key);
        this.middlewareManifests.delete(key);
        this.pagesManifests.delete(key);
        this.webpackStats.delete(key);
    }
    async loadActionManifest(pageName) {
        this.actionManifests.set(getEntryKey('app', 'server', pageName), await readPartialManifest(this.distDir, "" + SERVER_REFERENCE_MANIFEST + ".json", pageName, 'app'));
    }
    async mergeActionManifests(manifests) {
        const manifest = {
            node: {},
            edge: {},
            encryptionKey: this.encryptionKey
        };
        function mergeActionIds(actionEntries, other) {
            for(const key in other){
                var _actionEntries, _key;
                var _;
                const action = (_ = (_actionEntries = actionEntries)[_key = key]) != null ? _ : _actionEntries[_key] = {
                    workers: {},
                    layer: {}
                };
                Object.assign(action.workers, other[key].workers);
                Object.assign(action.layer, other[key].layer);
            }
        }
        for (const m of manifests){
            mergeActionIds(manifest.node, m.node);
            mergeActionIds(manifest.edge, m.edge);
        }
        for(const key in manifest.node){
            const entry = manifest.node[key];
            entry.workers = sortObjectByKey(entry.workers);
            entry.layer = sortObjectByKey(entry.layer);
        }
        for(const key in manifest.edge){
            const entry = manifest.edge[key];
            entry.workers = sortObjectByKey(entry.workers);
            entry.layer = sortObjectByKey(entry.layer);
        }
        return manifest;
    }
    async writeActionManifest() {
        const actionManifest = await this.mergeActionManifests(this.actionManifests.values());
        const actionManifestJsonPath = join(this.distDir, 'server', "" + SERVER_REFERENCE_MANIFEST + ".json");
        const actionManifestJsPath = join(this.distDir, 'server', "" + SERVER_REFERENCE_MANIFEST + ".js");
        const json = JSON.stringify(actionManifest, null, 2);
        deleteCache(actionManifestJsonPath);
        deleteCache(actionManifestJsPath);
        await writeFileAtomic(actionManifestJsonPath, json);
        await writeFileAtomic(actionManifestJsPath, "self.__RSC_SERVER_MANIFEST=" + JSON.stringify(json));
    }
    async loadAppBuildManifest(pageName) {
        this.appBuildManifests.set(getEntryKey('app', 'server', pageName), await readPartialManifest(this.distDir, APP_BUILD_MANIFEST, pageName, 'app'));
    }
    mergeAppBuildManifests(manifests) {
        const manifest = {
            pages: {}
        };
        for (const m of manifests){
            Object.assign(manifest.pages, m.pages);
        }
        manifest.pages = sortObjectByKey(manifest.pages);
        return manifest;
    }
    async writeAppBuildManifest() {
        const appBuildManifest = this.mergeAppBuildManifests(this.appBuildManifests.values());
        const appBuildManifestPath = join(this.distDir, APP_BUILD_MANIFEST);
        deleteCache(appBuildManifestPath);
        await writeFileAtomic(appBuildManifestPath, JSON.stringify(appBuildManifest, null, 2));
    }
    async loadAppPathsManifest(pageName) {
        this.appPathsManifests.set(getEntryKey('app', 'server', pageName), await readPartialManifest(this.distDir, APP_PATHS_MANIFEST, pageName, 'app'));
    }
    async writeAppPathsManifest() {
        const appPathsManifest = this.mergePagesManifests(this.appPathsManifests.values());
        const appPathsManifestPath = join(this.distDir, 'server', APP_PATHS_MANIFEST);
        deleteCache(appPathsManifestPath);
        await writeFileAtomic(appPathsManifestPath, JSON.stringify(appPathsManifest, null, 2));
    }
    async writeWebpackStats() {
        const webpackStats = this.mergeWebpackStats(this.webpackStats.values());
        const path = join(this.distDir, 'server', WEBPACK_STATS);
        deleteCache(path);
        await writeFileAtomic(path, JSON.stringify(webpackStats, null, 2));
    }
    async loadBuildManifest(pageName, type) {
        if (type === void 0) type = 'pages';
        this.buildManifests.set(getEntryKey(type, 'server', pageName), await readPartialManifest(this.distDir, BUILD_MANIFEST, pageName, type));
    }
    async loadWebpackStats(pageName, type) {
        if (type === void 0) type = 'pages';
        this.webpackStats.set(getEntryKey(type, 'client', pageName), await readPartialManifest(this.distDir, WEBPACK_STATS, pageName, type));
    }
    mergeWebpackStats(statsFiles) {
        const entrypoints = {};
        const assets = new Map();
        const chunks = new Map();
        const modules = new Map();
        for (const statsFile of statsFiles){
            if (statsFile.entrypoints) {
                for (const [k, v] of Object.entries(statsFile.entrypoints)){
                    if (!entrypoints[k]) {
                        entrypoints[k] = v;
                    }
                }
            }
            if (statsFile.assets) {
                for (const asset of statsFile.assets){
                    if (!assets.has(asset.name)) {
                        assets.set(asset.name, asset);
                    }
                }
            }
            if (statsFile.chunks) {
                for (const chunk of statsFile.chunks){
                    if (!chunks.has(chunk.name)) {
                        chunks.set(chunk.name, chunk);
                    }
                }
            }
            if (statsFile.modules) {
                for (const module of statsFile.modules){
                    const id = module.id;
                    if (id != null) {
                        // Merge the chunk list for the module. This can vary across endpoints.
                        const existing = modules.get(id);
                        if (existing == null) {
                            modules.set(id, module);
                        } else if (module.chunks != null && existing.chunks != null) {
                            for (const chunk of module.chunks){
                                if (!existing.chunks.includes(chunk)) {
                                    existing.chunks.push(chunk);
                                }
                            }
                        }
                    }
                }
            }
        }
        return {
            entrypoints,
            assets: [
                ...assets.values()
            ],
            chunks: [
                ...chunks.values()
            ],
            modules: [
                ...modules.values()
            ]
        };
    }
    mergeBuildManifests(manifests) {
        const manifest = {
            pages: {
                '/_app': []
            },
            // Something in next.js depends on these to exist even for app dir rendering
            devFiles: [],
            ampDevFiles: [],
            polyfillFiles: [],
            lowPriorityFiles: [
                "static/" + this.buildId + "/_ssgManifest.js",
                "static/" + this.buildId + "/_buildManifest.js"
            ],
            rootMainFiles: [],
            ampFirstPages: []
        };
        for (const m of manifests){
            Object.assign(manifest.pages, m.pages);
            if (m.rootMainFiles.length) manifest.rootMainFiles = m.rootMainFiles;
            // polyfillFiles should always be the same, so we can overwrite instead of actually merging
            if (m.polyfillFiles.length) manifest.polyfillFiles = m.polyfillFiles;
        }
        manifest.pages = sortObjectByKey(manifest.pages);
        return manifest;
    }
    async writeBuildManifest(entrypoints, devRewrites, productionRewrites) {
        var _devRewrites_beforeFiles, _devRewrites_afterFiles, _devRewrites_fallback;
        const rewrites = productionRewrites != null ? productionRewrites : {
            ...devRewrites,
            beforeFiles: ((_devRewrites_beforeFiles = devRewrites == null ? void 0 : devRewrites.beforeFiles) != null ? _devRewrites_beforeFiles : []).map(processRoute),
            afterFiles: ((_devRewrites_afterFiles = devRewrites == null ? void 0 : devRewrites.afterFiles) != null ? _devRewrites_afterFiles : []).map(processRoute),
            fallback: ((_devRewrites_fallback = devRewrites == null ? void 0 : devRewrites.fallback) != null ? _devRewrites_fallback : []).map(processRoute)
        };
        const buildManifest = this.mergeBuildManifests(this.buildManifests.values());
        const buildManifestPath = join(this.distDir, BUILD_MANIFEST);
        const middlewareBuildManifestPath = join(this.distDir, 'server', "" + MIDDLEWARE_BUILD_MANIFEST + ".js");
        const interceptionRewriteManifestPath = join(this.distDir, 'server', "" + INTERCEPTION_ROUTE_REWRITE_MANIFEST + ".js");
        deleteCache(buildManifestPath);
        deleteCache(middlewareBuildManifestPath);
        deleteCache(interceptionRewriteManifestPath);
        await writeFileAtomic(buildManifestPath, JSON.stringify(buildManifest, null, 2));
        await writeFileAtomic(middlewareBuildManifestPath, // we use globalThis here because middleware can be node
        // which doesn't have "self"
        createEdgeRuntimeManifest(buildManifest));
        const interceptionRewrites = JSON.stringify(rewrites.beforeFiles.filter(isInterceptionRouteRewrite));
        await writeFileAtomic(interceptionRewriteManifestPath, "self.__INTERCEPTION_ROUTE_REWRITE_MANIFEST=" + JSON.stringify(interceptionRewrites) + ";");
        const pagesKeys = [
            ...entrypoints.page.keys()
        ];
        if (entrypoints.global.app) {
            pagesKeys.push('/_app');
        }
        if (entrypoints.global.error) {
            pagesKeys.push('/_error');
        }
        const sortedPageKeys = getSortedRoutes(pagesKeys);
        const content = {
            __rewrites: normalizeRewritesForBuildManifest(rewrites),
            ...Object.fromEntries(sortedPageKeys.map((pathname)=>[
                    pathname,
                    [
                        "static/chunks/pages" + (pathname === '/' ? '/index' : pathname) + ".js"
                    ]
                ])),
            sortedPages: sortedPageKeys
        };
        const buildManifestJs = "self.__BUILD_MANIFEST = " + JSON.stringify(content) + ";self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()";
        await writeFileAtomic(join(this.distDir, 'static', this.buildId, '_buildManifest.js'), buildManifestJs);
        await writeFileAtomic(join(this.distDir, 'static', this.buildId, '_ssgManifest.js'), srcEmptySsgManifest);
    }
    async writeClientMiddlewareManifest() {
        var _middlewareManifest_middleware_;
        const middlewareManifest = this.mergeMiddlewareManifests(this.middlewareManifests.values());
        const matchers = (middlewareManifest == null ? void 0 : (_middlewareManifest_middleware_ = middlewareManifest.middleware['/']) == null ? void 0 : _middlewareManifest_middleware_.matchers) || [];
        const clientMiddlewareManifestPath = join(this.distDir, 'static', this.buildId, "" + TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST);
        deleteCache(clientMiddlewareManifestPath);
        await writeFileAtomic(clientMiddlewareManifestPath, JSON.stringify(matchers, null, 2));
    }
    async writeFallbackBuildManifest() {
        const fallbackBuildManifest = this.mergeBuildManifests([
            this.buildManifests.get(getEntryKey('pages', 'server', '_app')),
            this.buildManifests.get(getEntryKey('pages', 'server', '_error'))
        ].filter(Boolean));
        const fallbackBuildManifestPath = join(this.distDir, "fallback-" + BUILD_MANIFEST);
        deleteCache(fallbackBuildManifestPath);
        await writeFileAtomic(fallbackBuildManifestPath, JSON.stringify(fallbackBuildManifest, null, 2));
    }
    async loadFontManifest(pageName, type) {
        if (type === void 0) type = 'pages';
        this.fontManifests.set(getEntryKey(type, 'server', pageName), await readPartialManifest(this.distDir, "" + NEXT_FONT_MANIFEST + ".json", pageName, type));
    }
    mergeFontManifests(manifests) {
        const manifest = {
            app: {},
            appUsingSizeAdjust: false,
            pages: {},
            pagesUsingSizeAdjust: false
        };
        for (const m of manifests){
            Object.assign(manifest.app, m.app);
            Object.assign(manifest.pages, m.pages);
            manifest.appUsingSizeAdjust = manifest.appUsingSizeAdjust || m.appUsingSizeAdjust;
            manifest.pagesUsingSizeAdjust = manifest.pagesUsingSizeAdjust || m.pagesUsingSizeAdjust;
        }
        manifest.app = sortObjectByKey(manifest.app);
        manifest.pages = sortObjectByKey(manifest.pages);
        return manifest;
    }
    async writeNextFontManifest() {
        const fontManifest = this.mergeFontManifests(this.fontManifests.values());
        const json = JSON.stringify(fontManifest, null, 2);
        const fontManifestJsonPath = join(this.distDir, 'server', "" + NEXT_FONT_MANIFEST + ".json");
        const fontManifestJsPath = join(this.distDir, 'server', "" + NEXT_FONT_MANIFEST + ".js");
        deleteCache(fontManifestJsonPath);
        deleteCache(fontManifestJsPath);
        await writeFileAtomic(fontManifestJsonPath, json);
        await writeFileAtomic(fontManifestJsPath, "self.__NEXT_FONT_MANIFEST=" + JSON.stringify(json));
    }
    /**
   * @returns If the manifest was written or not
   */ async loadMiddlewareManifest(pageName, type) {
        const middlewareManifestPath = getManifestPath(pageName, this.distDir, MIDDLEWARE_MANIFEST, type, true);
        // middlewareManifest is actually "edge manifest" and not all routes are edge runtime. If it is not written we skip it.
        if (!existsSync(middlewareManifestPath)) {
            return false;
        }
        this.middlewareManifests.set(getEntryKey(type === 'middleware' || type === 'instrumentation' ? 'root' : type, 'server', pageName), await readPartialManifest(this.distDir, MIDDLEWARE_MANIFEST, pageName, type));
        return true;
    }
    getMiddlewareManifest(key) {
        return this.middlewareManifests.get(key);
    }
    deleteMiddlewareManifest(key) {
        return this.middlewareManifests.delete(key);
    }
    mergeMiddlewareManifests(manifests) {
        const manifest = {
            version: 3,
            middleware: {},
            sortedMiddleware: [],
            functions: {}
        };
        let instrumentation = undefined;
        for (const m of manifests){
            Object.assign(manifest.functions, m.functions);
            Object.assign(manifest.middleware, m.middleware);
            if (m.instrumentation) {
                instrumentation = m.instrumentation;
            }
        }
        manifest.functions = sortObjectByKey(manifest.functions);
        manifest.middleware = sortObjectByKey(manifest.middleware);
        const updateFunctionDefinition = (fun)=>{
            var _instrumentation_files;
            return {
                ...fun,
                files: [
                    ...(_instrumentation_files = instrumentation == null ? void 0 : instrumentation.files) != null ? _instrumentation_files : [],
                    ...fun.files
                ]
            };
        };
        for (const key of Object.keys(manifest.middleware)){
            const value = manifest.middleware[key];
            manifest.middleware[key] = updateFunctionDefinition(value);
        }
        for (const key of Object.keys(manifest.functions)){
            const value = manifest.functions[key];
            manifest.functions[key] = updateFunctionDefinition(value);
        }
        for (const fun of Object.values(manifest.functions).concat(Object.values(manifest.middleware))){
            for (const matcher of fun.matchers){
                if (!matcher.regexp) {
                    matcher.regexp = pathToRegexp(matcher.originalSource, [], {
                        delimiter: '/',
                        sensitive: false,
                        strict: true
                    }).source.replaceAll('\\/', '/');
                }
            }
        }
        manifest.sortedMiddleware = Object.keys(manifest.middleware);
        return manifest;
    }
    async writeMiddlewareManifest() {
        const middlewareManifest = this.mergeMiddlewareManifests(this.middlewareManifests.values());
        // Normalize regexes as it uses path-to-regexp
        for(const key in middlewareManifest.middleware){
            middlewareManifest.middleware[key].matchers.forEach((matcher)=>{
                if (!matcher.regexp.startsWith('^')) {
                    const parsedPage = tryToParsePath(matcher.regexp);
                    if (parsedPage.error || !parsedPage.regexStr) {
                        throw Object.defineProperty(new Error("Invalid source: " + matcher.regexp), "__NEXT_ERROR_CODE", {
                            value: "E442",
                            enumerable: false,
                            configurable: true
                        });
                    }
                    matcher.regexp = parsedPage.regexStr;
                }
            });
        }
        const middlewareManifestPath = join(this.distDir, 'server', MIDDLEWARE_MANIFEST);
        deleteCache(middlewareManifestPath);
        await writeFileAtomic(middlewareManifestPath, JSON.stringify(middlewareManifest, null, 2));
    }
    async loadPagesManifest(pageName) {
        this.pagesManifests.set(getEntryKey('pages', 'server', pageName), await readPartialManifest(this.distDir, PAGES_MANIFEST, pageName));
    }
    mergePagesManifests(manifests) {
        const manifest = {};
        for (const m of manifests){
            Object.assign(manifest, m);
        }
        return sortObjectByKey(manifest);
    }
    async writePagesManifest() {
        const pagesManifest = this.mergePagesManifests(this.pagesManifests.values());
        const pagesManifestPath = join(this.distDir, 'server', PAGES_MANIFEST);
        deleteCache(pagesManifestPath);
        await writeFileAtomic(pagesManifestPath, JSON.stringify(pagesManifest, null, 2));
    }
    async writeManifests(param) {
        let { devRewrites, productionRewrites, entrypoints } = param;
        await this.writeActionManifest();
        await this.writeAppBuildManifest();
        await this.writeAppPathsManifest();
        await this.writeBuildManifest(entrypoints, devRewrites, productionRewrites);
        await this.writeFallbackBuildManifest();
        await this.writeMiddlewareManifest();
        await this.writeClientMiddlewareManifest();
        await this.writeNextFontManifest();
        await this.writePagesManifest();
        if (process.env.TURBOPACK_STATS != null) {
            await this.writeWebpackStats();
        }
    }
    constructor({ distDir, buildId, encryptionKey }){
        this.actionManifests = new Map();
        this.appBuildManifests = new Map();
        this.appPathsManifests = new Map();
        this.buildManifests = new Map();
        this.fontManifests = new Map();
        this.middlewareManifests = new Map();
        this.pagesManifests = new Map();
        this.webpackStats = new Map();
        this.distDir = distDir;
        this.buildId = buildId;
        this.encryptionKey = encryptionKey;
    }
}
function sortObjectByKey(obj) {
    return Object.keys(obj).sort().reduce((acc, key)=>{
        acc[key] = obj[key];
        return acc;
    }, {});
}

//# sourceMappingURL=manifest-loader.js.map