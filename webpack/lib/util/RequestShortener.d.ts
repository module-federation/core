export = RequestShortener;
/** @import { AssociatedObjectForCache } from "./identifier" */
/**
 * Shortens absolute or verbose request strings so diagnostics and stats output
 * can be rendered relative to a chosen base directory.
 */
declare class RequestShortener {
    /**
     * Binds a context-aware shortening function to the provided directory and
     * optional cache owner.
     * @param {string} dir the directory
     * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
     */
    constructor(dir: string, associatedObjectForCache?: AssociatedObjectForCache | undefined);
    contextify: import("./identifier").BindContextCacheForContextResultFn;
    /**
     * Returns a request string rewritten relative to the configured directory
     * when one is provided.
     * @param {string | undefined | null} request the request to shorten
     * @returns {string | undefined | null} the shortened request
     */
    shorten(request: string | undefined | null): string | undefined | null;
}
import type { AssociatedObjectForCache } from "./identifier";
