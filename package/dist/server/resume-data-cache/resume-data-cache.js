"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createPrerenderResumeDataCache: null,
    createRenderResumeDataCache: null,
    stringifyResumeDataCache: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createPrerenderResumeDataCache: function() {
        return createPrerenderResumeDataCache;
    },
    createRenderResumeDataCache: function() {
        return createRenderResumeDataCache;
    },
    stringifyResumeDataCache: function() {
        return stringifyResumeDataCache;
    }
});
const _invarianterror = require("../../shared/lib/invariant-error");
const _cachestore = require("./cache-store");
async function stringifyResumeDataCache(resumeDataCache) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new _invarianterror.InvariantError('`stringifyResumeDataCache` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E602",
            enumerable: false,
            configurable: true
        });
    } else {
        if (resumeDataCache.fetch.size === 0 && resumeDataCache.cache.size === 0) {
            return 'null';
        }
        const json = {
            store: {
                fetch: Object.fromEntries(Array.from(resumeDataCache.fetch.entries())),
                cache: Object.fromEntries((await (0, _cachestore.serializeUseCacheCacheStore)(resumeDataCache.cache.entries())).filter((entry)=>entry !== null)),
                encryptedBoundArgs: Object.fromEntries(Array.from(resumeDataCache.encryptedBoundArgs.entries()))
            }
        };
        // Compress the JSON string using zlib. As the data we already want to
        // decompress is in memory, we use the synchronous deflateSync function.
        const { deflateSync } = require('node:zlib');
        return deflateSync(JSON.stringify(json)).toString('base64');
    }
}
function createPrerenderResumeDataCache() {
    return {
        cache: new Map(),
        fetch: new Map(),
        encryptedBoundArgs: new Map(),
        decryptedBoundArgs: new Map()
    };
}
function createRenderResumeDataCache(prerenderResumeDataCacheOrPersistedCache) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new _invarianterror.InvariantError('`createRenderResumeDataCache` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E556",
            enumerable: false,
            configurable: true
        });
    } else {
        if (typeof prerenderResumeDataCacheOrPersistedCache !== 'string') {
            // If the cache is already a prerender cache, we can return it directly,
            // we're just performing a type change.
            return prerenderResumeDataCacheOrPersistedCache;
        }
        if (prerenderResumeDataCacheOrPersistedCache === 'null') {
            return {
                cache: new Map(),
                fetch: new Map(),
                encryptedBoundArgs: new Map(),
                decryptedBoundArgs: new Map()
            };
        }
        // This should be a compressed string. Let's decompress it using zlib.
        // As the data we already want to decompress is in memory, we use the
        // synchronous inflateSync function.
        const { inflateSync } = require('node:zlib');
        const json = JSON.parse(inflateSync(Buffer.from(prerenderResumeDataCacheOrPersistedCache, 'base64')).toString('utf-8'));
        return {
            cache: (0, _cachestore.parseUseCacheCacheStore)(Object.entries(json.store.cache)),
            fetch: new Map(Object.entries(json.store.fetch)),
            encryptedBoundArgs: new Map(Object.entries(json.store.encryptedBoundArgs)),
            decryptedBoundArgs: new Map()
        };
    }
}

//# sourceMappingURL=resume-data-cache.js.map