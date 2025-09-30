"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    UseCacheTimeoutError: null,
    isUseCacheTimeoutError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    UseCacheTimeoutError: function() {
        return UseCacheTimeoutError;
    },
    isUseCacheTimeoutError: function() {
        return isUseCacheTimeoutError;
    }
});
const USE_CACHE_TIMEOUT_ERROR_CODE = 'USE_CACHE_TIMEOUT';
class UseCacheTimeoutError extends Error {
    constructor(){
        super('Filling a cache during prerender timed out, likely because request-specific arguments such as params, searchParams, cookies() or dynamic data were used inside "use cache".'), this.digest = USE_CACHE_TIMEOUT_ERROR_CODE;
    }
}
function isUseCacheTimeoutError(err) {
    if (typeof err !== 'object' || err === null || !('digest' in err) || typeof err.digest !== 'string') {
        return false;
    }
    return err.digest === USE_CACHE_TIMEOUT_ERROR_CODE;
}

//# sourceMappingURL=use-cache-errors.js.map