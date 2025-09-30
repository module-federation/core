import path from 'path';
import { IncrementalCache } from '../../server/lib/incremental-cache';
import { hasNextSupport } from '../../server/ci-info';
import { nodeFs } from '../../server/lib/node-fs-methods';
import { interopDefault } from '../../lib/interop-default';
import { formatDynamicImportPath } from '../../lib/format-dynamic-import-path';
import { initializeCacheHandlers, setCacheHandler } from '../../server/use-cache/handlers';
export async function createIncrementalCache({ cacheHandler, cacheMaxMemorySize, fetchCacheKeyPrefix, distDir, dir, flushToDisk, cacheHandlers, requestHeaders }) {
    // Custom cache handler overrides.
    let CacheHandler;
    if (cacheHandler) {
        CacheHandler = interopDefault(await import(formatDynamicImportPath(dir, cacheHandler)).then((mod)=>mod.default || mod));
    }
    if (cacheHandlers && initializeCacheHandlers()) {
        for (const [kind, handler] of Object.entries(cacheHandlers)){
            if (!handler) continue;
            setCacheHandler(kind, interopDefault(await import(formatDynamicImportPath(dir, handler)).then((mod)=>mod.default || mod)));
        }
    }
    const incrementalCache = new IncrementalCache({
        dev: false,
        requestHeaders: requestHeaders || {},
        flushToDisk,
        maxMemoryCacheSize: cacheMaxMemorySize,
        fetchCacheKeyPrefix,
        getPrerenderManifest: ()=>({
                version: 4,
                routes: {},
                dynamicRoutes: {},
                preview: {
                    previewModeEncryptionKey: '',
                    previewModeId: '',
                    previewModeSigningKey: ''
                },
                notFoundRoutes: []
            }),
        fs: nodeFs,
        serverDistDir: path.join(distDir, 'server'),
        CurCacheHandler: CacheHandler,
        minimalMode: hasNextSupport
    });
    globalThis.__incrementalCache = incrementalCache;
    return incrementalCache;
}

//# sourceMappingURL=create-incremental-cache.js.map