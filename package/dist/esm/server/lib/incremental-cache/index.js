import { IncrementalCacheKind, CachedRouteKind } from '../../response-cache';
import FileSystemCache from './file-system-cache';
import { normalizePagePath } from '../../../shared/lib/page-path/normalize-page-path';
import { CACHE_ONE_YEAR, PRERENDER_REVALIDATE_HEADER } from '../../../lib/constants';
import { toRoute } from '../to-route';
import { SharedCacheControls } from './shared-cache-controls';
import { getPrerenderResumeDataCache, getRenderResumeDataCache, workUnitAsyncStorage } from '../../app-render/work-unit-async-storage.external';
import { InvariantError } from '../../../shared/lib/invariant-error';
import { getPreviouslyRevalidatedTags } from '../../server-utils';
import { workAsyncStorage } from '../../app-render/work-async-storage.external';
export class CacheHandler {
    // eslint-disable-next-line
    constructor(_ctx){}
    async get(_cacheKey, _ctx) {
        return {};
    }
    async set(_cacheKey, _data, _ctx) {}
    async revalidateTag(..._args) {}
    resetRequestCache() {}
}
export class IncrementalCache {
    constructor({ fs, dev, flushToDisk, minimalMode, serverDistDir, requestHeaders, requestProtocol, maxMemoryCacheSize, getPrerenderManifest, fetchCacheKeyPrefix, CurCacheHandler, allowedRevalidateHeaderKeys }){
        var _this_prerenderManifest_preview, _this_prerenderManifest;
        this.locks = new Map();
        const debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        this.hasCustomCacheHandler = Boolean(CurCacheHandler);
        const cacheHandlersSymbol = Symbol.for('@next/cache-handlers');
        const _globalThis = globalThis;
        if (!CurCacheHandler) {
            // if we have a global cache handler available leverage it
            const globalCacheHandler = _globalThis[cacheHandlersSymbol];
            if (globalCacheHandler == null ? void 0 : globalCacheHandler.FetchCache) {
                CurCacheHandler = globalCacheHandler.FetchCache;
            } else {
                if (fs && serverDistDir) {
                    if (debug) {
                        console.log('using filesystem cache handler');
                    }
                    CurCacheHandler = FileSystemCache;
                }
            }
        } else if (debug) {
            console.log('using custom cache handler', CurCacheHandler.name);
        }
        if (process.env.__NEXT_TEST_MAX_ISR_CACHE) {
            // Allow cache size to be overridden for testing purposes
            maxMemoryCacheSize = parseInt(process.env.__NEXT_TEST_MAX_ISR_CACHE, 10);
        }
        this.dev = dev;
        this.disableForTestmode = process.env.NEXT_PRIVATE_TEST_PROXY === 'true';
        // this is a hack to avoid Webpack knowing this is equal to this.minimalMode
        // because we replace this.minimalMode to true in production bundles.
        const minimalModeKey = 'minimalMode';
        this[minimalModeKey] = minimalMode;
        this.requestHeaders = requestHeaders;
        this.requestProtocol = requestProtocol;
        this.allowedRevalidateHeaderKeys = allowedRevalidateHeaderKeys;
        this.prerenderManifest = getPrerenderManifest();
        this.cacheControls = new SharedCacheControls(this.prerenderManifest);
        this.fetchCacheKeyPrefix = fetchCacheKeyPrefix;
        let revalidatedTags = [];
        if (requestHeaders[PRERENDER_REVALIDATE_HEADER] === ((_this_prerenderManifest = this.prerenderManifest) == null ? void 0 : (_this_prerenderManifest_preview = _this_prerenderManifest.preview) == null ? void 0 : _this_prerenderManifest_preview.previewModeId)) {
            this.isOnDemandRevalidate = true;
        }
        if (minimalMode) {
            var _this_prerenderManifest_preview1, _this_prerenderManifest1;
            revalidatedTags = getPreviouslyRevalidatedTags(requestHeaders, (_this_prerenderManifest1 = this.prerenderManifest) == null ? void 0 : (_this_prerenderManifest_preview1 = _this_prerenderManifest1.preview) == null ? void 0 : _this_prerenderManifest_preview1.previewModeId);
        }
        if (CurCacheHandler) {
            this.cacheHandler = new CurCacheHandler({
                dev,
                fs,
                flushToDisk,
                serverDistDir,
                revalidatedTags,
                maxMemoryCacheSize,
                _requestHeaders: requestHeaders,
                fetchCacheKeyPrefix
            });
        }
    }
    calculateRevalidate(pathname, fromTime, dev, isFallback) {
        // in development we don't have a prerender-manifest
        // and default to always revalidating to allow easier debugging
        if (dev) return Math.floor(performance.timeOrigin + performance.now() - 1000);
        const cacheControl = this.cacheControls.get(toRoute(pathname));
        // if an entry isn't present in routes we fallback to a default
        // of revalidating after 1 second unless it's a fallback request.
        const initialRevalidateSeconds = cacheControl ? cacheControl.revalidate : isFallback ? false : 1;
        const revalidateAfter = typeof initialRevalidateSeconds === 'number' ? initialRevalidateSeconds * 1000 + fromTime : initialRevalidateSeconds;
        return revalidateAfter;
    }
    _getPathname(pathname, fetchCache) {
        return fetchCache ? pathname : normalizePagePath(pathname);
    }
    resetRequestCache() {
        var _this_cacheHandler_resetRequestCache, _this_cacheHandler;
        (_this_cacheHandler = this.cacheHandler) == null ? void 0 : (_this_cacheHandler_resetRequestCache = _this_cacheHandler.resetRequestCache) == null ? void 0 : _this_cacheHandler_resetRequestCache.call(_this_cacheHandler);
    }
    async lock(cacheKey) {
        let unlockNext = ()=>Promise.resolve();
        const existingLock = this.locks.get(cacheKey);
        if (existingLock) {
            await existingLock;
        }
        const newLock = new Promise((resolve)=>{
            unlockNext = async ()=>{
                resolve();
                this.locks.delete(cacheKey) // Remove the lock upon release
                ;
            };
        });
        this.locks.set(cacheKey, newLock);
        return unlockNext;
    }
    async revalidateTag(tags) {
        var _this_cacheHandler;
        return (_this_cacheHandler = this.cacheHandler) == null ? void 0 : _this_cacheHandler.revalidateTag(tags);
    }
    // x-ref: https://github.com/facebook/react/blob/2655c9354d8e1c54ba888444220f63e836925caa/packages/react/src/ReactFetch.js#L23
    async generateCacheKey(url, init = {}) {
        // this should be bumped anytime a fix is made to cache entries
        // that should bust the cache
        const MAIN_KEY_PREFIX = 'v3';
        const bodyChunks = [];
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        if (init.body) {
            // handle ReadableStream body
            if (typeof init.body.getReader === 'function') {
                const readableBody = init.body;
                const chunks = [];
                try {
                    await readableBody.pipeTo(new WritableStream({
                        write (chunk) {
                            if (typeof chunk === 'string') {
                                chunks.push(encoder.encode(chunk));
                                bodyChunks.push(chunk);
                            } else {
                                chunks.push(chunk);
                                bodyChunks.push(decoder.decode(chunk, {
                                    stream: true
                                }));
                            }
                        }
                    }));
                    // Flush the decoder.
                    bodyChunks.push(decoder.decode());
                    // Create a new buffer with all the chunks.
                    const length = chunks.reduce((total, arr)=>total + arr.length, 0);
                    const arrayBuffer = new Uint8Array(length);
                    // Push each of the chunks into the new array buffer.
                    let offset = 0;
                    for (const chunk of chunks){
                        arrayBuffer.set(chunk, offset);
                        offset += chunk.length;
                    }
                    ;
                    init._ogBody = arrayBuffer;
                } catch (err) {
                    console.error('Problem reading body', err);
                }
            } else if (typeof init.body.keys === 'function') {
                const formData = init.body;
                init._ogBody = init.body;
                for (const key of new Set([
                    ...formData.keys()
                ])){
                    const values = formData.getAll(key);
                    bodyChunks.push(`${key}=${(await Promise.all(values.map(async (val)=>{
                        if (typeof val === 'string') {
                            return val;
                        } else {
                            return await val.text();
                        }
                    }))).join(',')}`);
                }
            // handle blob body
            } else if (typeof init.body.arrayBuffer === 'function') {
                const blob = init.body;
                const arrayBuffer = await blob.arrayBuffer();
                bodyChunks.push(await blob.text());
                init._ogBody = new Blob([
                    arrayBuffer
                ], {
                    type: blob.type
                });
            } else if (typeof init.body === 'string') {
                bodyChunks.push(init.body);
                init._ogBody = init.body;
            }
        }
        const headers = typeof (init.headers || {}).keys === 'function' ? Object.fromEntries(init.headers) : Object.assign({}, init.headers);
        // w3c trace context headers can break request caching and deduplication
        // so we remove them from the cache key
        if ('traceparent' in headers) delete headers['traceparent'];
        if ('tracestate' in headers) delete headers['tracestate'];
        const cacheString = JSON.stringify([
            MAIN_KEY_PREFIX,
            this.fetchCacheKeyPrefix || '',
            url,
            init.method,
            headers,
            init.mode,
            init.redirect,
            init.credentials,
            init.referrer,
            init.referrerPolicy,
            init.integrity,
            init.cache,
            bodyChunks
        ]);
        if (process.env.NEXT_RUNTIME === 'edge') {
            function bufferToHex(buffer) {
                return Array.prototype.map.call(new Uint8Array(buffer), (b)=>b.toString(16).padStart(2, '0')).join('');
            }
            const buffer = encoder.encode(cacheString);
            return bufferToHex(await crypto.subtle.digest('SHA-256', buffer));
        } else {
            const crypto1 = require('crypto');
            return crypto1.createHash('sha256').update(cacheString).digest('hex');
        }
    }
    async get(cacheKey, ctx) {
        var _this_cacheHandler, _cacheData_value;
        // Unlike other caches if we have a resume data cache, we use it even if
        // testmode would normally disable it or if requestHeaders say 'no-cache'.
        if (ctx.kind === IncrementalCacheKind.FETCH) {
            const workUnitStore = workUnitAsyncStorage.getStore();
            const resumeDataCache = workUnitStore ? getRenderResumeDataCache(workUnitStore) : null;
            if (resumeDataCache) {
                const memoryCacheData = resumeDataCache.fetch.get(cacheKey);
                if ((memoryCacheData == null ? void 0 : memoryCacheData.kind) === CachedRouteKind.FETCH) {
                    return {
                        isStale: false,
                        value: memoryCacheData
                    };
                }
            }
        }
        // we don't leverage the prerender cache in dev mode
        // so that getStaticProps is always called for easier debugging
        if (this.disableForTestmode || this.dev && (ctx.kind !== IncrementalCacheKind.FETCH || this.requestHeaders['cache-control'] === 'no-cache')) {
            return null;
        }
        cacheKey = this._getPathname(cacheKey, ctx.kind === IncrementalCacheKind.FETCH);
        const cacheData = await ((_this_cacheHandler = this.cacheHandler) == null ? void 0 : _this_cacheHandler.get(cacheKey, ctx));
        if (ctx.kind === IncrementalCacheKind.FETCH) {
            var _cacheData_value1;
            if (!cacheData) {
                return null;
            }
            if (((_cacheData_value1 = cacheData.value) == null ? void 0 : _cacheData_value1.kind) !== CachedRouteKind.FETCH) {
                var _cacheData_value2;
                throw Object.defineProperty(new InvariantError(`Expected cached value for cache key ${JSON.stringify(cacheKey)} to be a "FETCH" kind, got ${JSON.stringify((_cacheData_value2 = cacheData.value) == null ? void 0 : _cacheData_value2.kind)} instead.`), "__NEXT_ERROR_CODE", {
                    value: "E653",
                    enumerable: false,
                    configurable: true
                });
            }
            const workStore = workAsyncStorage.getStore();
            const combinedTags = [
                ...ctx.tags || [],
                ...ctx.softTags || []
            ];
            // if a tag was revalidated we don't return stale data
            if (combinedTags.some((tag)=>{
                var _this_revalidatedTags, _workStore_pendingRevalidatedTags;
                return ((_this_revalidatedTags = this.revalidatedTags) == null ? void 0 : _this_revalidatedTags.includes(tag)) || (workStore == null ? void 0 : (_workStore_pendingRevalidatedTags = workStore.pendingRevalidatedTags) == null ? void 0 : _workStore_pendingRevalidatedTags.includes(tag));
            })) {
                return null;
            }
            const revalidate = ctx.revalidate || cacheData.value.revalidate;
            const age = (performance.timeOrigin + performance.now() - (cacheData.lastModified || 0)) / 1000;
            const isStale = age > revalidate;
            const data = cacheData.value.data;
            return {
                isStale,
                value: {
                    kind: CachedRouteKind.FETCH,
                    data,
                    revalidate
                }
            };
        } else if ((cacheData == null ? void 0 : (_cacheData_value = cacheData.value) == null ? void 0 : _cacheData_value.kind) === CachedRouteKind.FETCH) {
            throw Object.defineProperty(new InvariantError(`Expected cached value for cache key ${JSON.stringify(cacheKey)} not to be a ${JSON.stringify(ctx.kind)} kind, got "FETCH" instead.`), "__NEXT_ERROR_CODE", {
                value: "E652",
                enumerable: false,
                configurable: true
            });
        }
        let entry = null;
        const { isFallback } = ctx;
        const cacheControl = this.cacheControls.get(toRoute(cacheKey));
        let isStale;
        let revalidateAfter;
        if ((cacheData == null ? void 0 : cacheData.lastModified) === -1) {
            isStale = -1;
            revalidateAfter = -1 * CACHE_ONE_YEAR;
        } else {
            revalidateAfter = this.calculateRevalidate(cacheKey, (cacheData == null ? void 0 : cacheData.lastModified) || performance.timeOrigin + performance.now(), this.dev ?? false, ctx.isFallback);
            isStale = revalidateAfter !== false && revalidateAfter < performance.timeOrigin + performance.now() ? true : undefined;
        }
        if (cacheData) {
            entry = {
                isStale,
                cacheControl,
                revalidateAfter,
                value: cacheData.value,
                isFallback
            };
        }
        if (!cacheData && this.prerenderManifest.notFoundRoutes.includes(cacheKey)) {
            // for the first hit after starting the server the cache
            // may not have a way to save notFound: true so if
            // the prerender-manifest marks this as notFound then we
            // return that entry and trigger a cache set to give it a
            // chance to update in-memory entries
            entry = {
                isStale,
                value: null,
                cacheControl,
                revalidateAfter,
                isFallback
            };
            this.set(cacheKey, entry.value, {
                ...ctx,
                cacheControl
            });
        }
        return entry;
    }
    async set(pathname, data, ctx) {
        // Even if we otherwise disable caching for testMode or if no fetchCache is
        // configured we still always stash results in the resume data cache if one
        // exists. This is because this is a transient in memory cache that
        // populates caches ahead of a dynamic render in dev mode to allow the RSC
        // debug info to have the right environment associated to it.
        if ((data == null ? void 0 : data.kind) === CachedRouteKind.FETCH) {
            const workUnitStore = workUnitAsyncStorage.getStore();
            const prerenderResumeDataCache = workUnitStore ? getPrerenderResumeDataCache(workUnitStore) : null;
            if (prerenderResumeDataCache) {
                prerenderResumeDataCache.fetch.set(pathname, data);
            }
        }
        if (this.disableForTestmode || this.dev && !ctx.fetchCache) return;
        pathname = this._getPathname(pathname, ctx.fetchCache);
        // FetchCache has upper limit of 2MB per-entry currently
        const itemSize = JSON.stringify(data).length;
        if (ctx.fetchCache && // we don't show this error/warning when a custom cache handler is being used
        // as it might not have this limit
        !this.hasCustomCacheHandler && itemSize > 2 * 1024 * 1024) {
            if (this.dev) {
                throw Object.defineProperty(new Error(`Failed to set Next.js data cache, items over 2MB can not be cached (${itemSize} bytes)`), "__NEXT_ERROR_CODE", {
                    value: "E86",
                    enumerable: false,
                    configurable: true
                });
            }
            return;
        }
        try {
            var _this_cacheHandler;
            if (!ctx.fetchCache && ctx.cacheControl) {
                this.cacheControls.set(toRoute(pathname), ctx.cacheControl);
            }
            await ((_this_cacheHandler = this.cacheHandler) == null ? void 0 : _this_cacheHandler.set(pathname, data, ctx));
        } catch (error) {
            console.warn('Failed to update prerender cache for', pathname, error);
        }
    }
}

//# sourceMappingURL=index.js.map