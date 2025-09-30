import type { PrerenderManifest } from '../../../build';
import type { DeepReadonly } from '../../../shared/lib/deep-readonly';
import type { CacheControl } from '../cache-control';
/**
 * A shared cache of cache controls for routes. This cache is used so we don't
 * have to modify the prerender manifest when we want to update the cache
 * control for a route.
 */
export declare class SharedCacheControls {
    /**
     * The prerender manifest that contains the initial cache controls for
     * routes.
     */
    private readonly prerenderManifest;
    /**
     * The in-memory cache of cache lives for routes. This cache is populated when
     * the cache is updated with new cache lives.
     */
    private static readonly cacheControls;
    constructor(
    /**
     * The prerender manifest that contains the initial cache controls for
     * routes.
     */
    prerenderManifest: DeepReadonly<Pick<PrerenderManifest, 'routes' | 'dynamicRoutes'>>);
    /**
     * Try to get the cache control value for a route. This will first try to get
     * the value from the in-memory cache. If the value is not present in the
     * in-memory cache, it will be sourced from the prerender manifest.
     *
     * @param route the route to get the cache control for
     * @returns the cache control for the route, or undefined if the values
     *          are not present in the in-memory cache or the prerender manifest
     */
    get(route: string): CacheControl | undefined;
    /**
     * Set the cache control for a route.
     *
     * @param route the route to set the cache control for
     * @param cacheControl the cache control for the route
     */
    set(route: string, cacheControl: CacheControl): void;
    /**
     * Clear the in-memory cache of cache controls for routes.
     */
    clear(): void;
}
