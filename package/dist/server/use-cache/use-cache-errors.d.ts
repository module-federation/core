declare const USE_CACHE_TIMEOUT_ERROR_CODE = "USE_CACHE_TIMEOUT";
export declare class UseCacheTimeoutError extends Error {
    digest: typeof USE_CACHE_TIMEOUT_ERROR_CODE;
    constructor();
}
export declare function isUseCacheTimeoutError(err: unknown): err is UseCacheTimeoutError;
export {};
