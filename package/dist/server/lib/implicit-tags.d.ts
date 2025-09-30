import type { FallbackRouteParams } from '../request/fallback-params';
import { type LazyResult } from './lazy-result';
export interface ImplicitTags {
    /**
     * For legacy usage, the implicit tags are passed to the incremental cache
     * handler in `get` calls.
     */
    readonly tags: string[];
    /**
     * Modern cache handlers don't receive implicit tags. Instead, the implicit
     * tags' expirations are stored in the work unit store, and used to compare
     * with a cache entry's timestamp.
     *
     * Note: This map contains lazy results so that we can evaluate them when the
     * first cache entry is read. It allows us to skip fetching the expiration
     * values if no caches are read at all.
     */
    readonly expirationsByCacheKind: Map<string, LazyResult<number>>;
}
export declare function getImplicitTags(page: string, url: {
    pathname: string;
    search?: string;
}, fallbackRouteParams: null | FallbackRouteParams): Promise<ImplicitTags>;
