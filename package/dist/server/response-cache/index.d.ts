import type { ResponseCacheEntry, ResponseGenerator, ResponseCacheBase, IncrementalResponseCache } from './types';
import type { RouteKind } from '../route-kind';
export * from './types';
export default class ResponseCache implements ResponseCacheBase {
    private readonly batcher;
    private previousCacheItem?;
    private minimalMode?;
    constructor(minimalMode: boolean);
    get(key: string | null, responseGenerator: ResponseGenerator, context: {
        routeKind: RouteKind;
        isOnDemandRevalidate?: boolean;
        isPrefetch?: boolean;
        incrementalCache: IncrementalResponseCache;
        isRoutePPREnabled?: boolean;
        isFallback?: boolean;
    }): Promise<ResponseCacheEntry | null>;
}
