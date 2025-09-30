import type { RouteHas } from '../../../lib/load-custom-routes';
export type MiddlewareConfigInput = {
    /**
     * The matcher for the middleware.
     */
    matcher?: string | Array<{
        locale?: false;
        has?: RouteHas[];
        missing?: RouteHas[];
        source: string;
    } | string>;
    /**
     * The regions that the middleware should run in.
     */
    regions?: string | string[];
    /**
     * A glob, or an array of globs, ignoring dynamic code evaluation for specific
     * files. The globs are relative to your application root folder.
     */
    unstable_allowDynamic?: string | string[];
};
