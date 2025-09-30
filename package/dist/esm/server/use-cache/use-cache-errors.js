const USE_CACHE_TIMEOUT_ERROR_CODE = 'USE_CACHE_TIMEOUT';
export class UseCacheTimeoutError extends Error {
    constructor(){
        super('Filling a cache during prerender timed out, likely because request-specific arguments such as params, searchParams, cookies() or dynamic data were used inside "use cache".'), this.digest = USE_CACHE_TIMEOUT_ERROR_CODE;
    }
}
export function isUseCacheTimeoutError(err) {
    if (typeof err !== 'object' || err === null || !('digest' in err) || typeof err.digest !== 'string') {
        return false;
    }
    return err.digest === USE_CACHE_TIMEOUT_ERROR_CODE;
}

//# sourceMappingURL=use-cache-errors.js.map