// Share the instance module in the next-shared layer
import { workUnitAsyncStorageInstance } from './work-unit-async-storage-instance' with {
    'turbopack-transition': 'next-shared'
};
import { NEXT_HMR_REFRESH_HASH_COOKIE } from '../../client/components/app-router-headers';
export { workUnitAsyncStorageInstance as workUnitAsyncStorage };
export function getExpectedRequestStore(callingExpression) {
    const workUnitStore = workUnitAsyncStorageInstance.getStore();
    if (!workUnitStore) {
        throwForMissingRequestStore(callingExpression);
    }
    switch(workUnitStore.type){
        case 'request':
            return workUnitStore;
        case 'prerender':
        case 'prerender-ppr':
        case 'prerender-legacy':
            // This should not happen because we should have checked it already.
            throw Object.defineProperty(new Error(`\`${callingExpression}\` cannot be called inside a prerender. This is a bug in Next.js.`), "__NEXT_ERROR_CODE", {
                value: "E401",
                enumerable: false,
                configurable: true
            });
        case 'cache':
            throw Object.defineProperty(new Error(`\`${callingExpression}\` cannot be called inside "use cache". Call it outside and pass an argument instead. Read more: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
                value: "E37",
                enumerable: false,
                configurable: true
            });
        case 'unstable-cache':
            throw Object.defineProperty(new Error(`\`${callingExpression}\` cannot be called inside unstable_cache. Call it outside and pass an argument instead. Read more: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", {
                value: "E69",
                enumerable: false,
                configurable: true
            });
        default:
            const _exhaustiveCheck = workUnitStore;
            return _exhaustiveCheck;
    }
}
export function throwForMissingRequestStore(callingExpression) {
    throw Object.defineProperty(new Error(`\`${callingExpression}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
        value: "E251",
        enumerable: false,
        configurable: true
    });
}
export function getPrerenderResumeDataCache(workUnitStore) {
    if (workUnitStore.type === 'prerender' || workUnitStore.type === 'prerender-ppr') {
        return workUnitStore.prerenderResumeDataCache;
    }
    return null;
}
export function getRenderResumeDataCache(workUnitStore) {
    if (workUnitStore.type !== 'prerender-legacy' && workUnitStore.type !== 'cache' && workUnitStore.type !== 'unstable-cache') {
        if (workUnitStore.type === 'request') {
            return workUnitStore.renderResumeDataCache;
        }
        // We return the mutable resume data cache here as an immutable version of
        // the cache as it can also be used for reading.
        return workUnitStore.prerenderResumeDataCache;
    }
    return null;
}
export function getHmrRefreshHash(workStore, workUnitStore) {
    var _workUnitStore_cookies_get;
    if (!workStore.dev) {
        return undefined;
    }
    return workUnitStore.type === 'cache' || workUnitStore.type === 'prerender' ? workUnitStore.hmrRefreshHash : workUnitStore.type === 'request' ? (_workUnitStore_cookies_get = workUnitStore.cookies.get(NEXT_HMR_REFRESH_HASH_COOKIE)) == null ? void 0 : _workUnitStore_cookies_get.value : undefined;
}
/**
 * Returns a draft mode provider only if draft mode is enabled.
 */ export function getDraftModeProviderForCacheScope(workStore, workUnitStore) {
    if (workStore.isDraftMode) {
        switch(workUnitStore.type){
            case 'cache':
            case 'unstable-cache':
            case 'request':
                return workUnitStore.draftMode;
            default:
                return undefined;
        }
    }
    return undefined;
}

//# sourceMappingURL=work-unit-async-storage.external.js.map