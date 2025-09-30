import { IncrementalCacheKind, type IncrementalResponseCacheEntry, type ResponseCacheEntry } from './types';
import { RouteKind } from '../route-kind';
export declare function fromResponseCacheEntry(cacheEntry: ResponseCacheEntry): Promise<IncrementalResponseCacheEntry>;
export declare function toResponseCacheEntry(response: IncrementalResponseCacheEntry | null): Promise<ResponseCacheEntry | null>;
export declare function routeKindToIncrementalCacheKind(routeKind: RouteKind): Exclude<IncrementalCacheKind, IncrementalCacheKind.FETCH>;
