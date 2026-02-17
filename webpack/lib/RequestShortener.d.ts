export = RequestShortener;
/** @typedef {import("./util/identifier").AssociatedObjectForCache} AssociatedObjectForCache */
declare class RequestShortener {
    /**
     * @param {string} dir the directory
     * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
     */
    constructor(dir: string, associatedObjectForCache?: AssociatedObjectForCache | undefined);
    contextify: import("./util/identifier").BindContextCacheForContextResultFn;
    /**
     * @param {string | undefined | null} request the request to shorten
     * @returns {string | undefined | null} the shortened request
     */
    shorten(request: string | undefined | null): string | undefined | null;
}
declare namespace RequestShortener {
    export { AssociatedObjectForCache };
}
type AssociatedObjectForCache = import("./util/identifier").AssociatedObjectForCache;
