import type { NextConfigComplete } from '../server/config-shared';
import type { Revalidate } from '../server/lib/cache-control';
import '../lib/setup-exception-listeners';
import { Worker } from '../lib/worker';
import { RSC_PREFETCH_SUFFIX, RSC_SUFFIX, RSC_SEGMENTS_DIR_SUFFIX, RSC_SEGMENT_SUFFIX } from '../lib/constants';
import type { Header, Redirect, Rewrite, RouteHas } from '../lib/load-custom-routes';
import type { __ApiPreviewProps } from '../server/api-utils';
import { NEXT_ROUTER_PREFETCH_HEADER, RSC_HEADER, RSC_CONTENT_TYPE_HEADER, NEXT_DID_POSTPONE_HEADER, NEXT_ROUTER_SEGMENT_PREFETCH_HEADER, NEXT_REWRITTEN_PATH_HEADER, NEXT_REWRITTEN_QUERY_HEADER } from '../client/components/app-router-headers';
import { RenderingMode } from './rendering-mode';
import { type PrefetchSegmentDataRoute } from '../server/lib/router-utils/build-prefetch-segment-data-route';
type Fallback = null | boolean | string;
export interface PrerenderManifestRoute {
    dataRoute: string | null;
    experimentalBypassFor?: RouteHas[];
    /**
     * The headers that should be served along side this prerendered route.
     */
    initialHeaders?: Record<string, string>;
    /**
     * The status code that should be served along side this prerendered route.
     */
    initialStatus?: number;
    /**
     * The revalidate value for this route. This might be inferred from:
     * - route segment configs
     * - fetch calls
     * - unstable_cache
     * - "use cache"
     */
    initialRevalidateSeconds: Revalidate;
    /**
     * The expire value for this route, which is inferred from the "use cache"
     * functions that are used by the route, or the expireTime config.
     */
    initialExpireSeconds: number | undefined;
    /**
     * The prefetch data route associated with this page. If not defined, this
     * page does not support prefetching.
     */
    prefetchDataRoute: string | null | undefined;
    /**
     * The dynamic route that this statically prerendered route is based on. If
     * this is null, then the route was not based on a dynamic route.
     */
    srcRoute: string | null;
    /**
     * @deprecated use `renderingMode` instead
     */
    experimentalPPR: boolean | undefined;
    /**
     * The rendering mode for this route. Only `undefined` when not an app router
     * route.
     */
    renderingMode: RenderingMode | undefined;
    /**
     * The headers that are allowed to be used when revalidating this route. These
     * are used internally by Next.js to revalidate routes.
     */
    allowHeader: string[];
}
export interface DynamicPrerenderManifestRoute {
    dataRoute: string | null;
    dataRouteRegex: string | null;
    experimentalBypassFor?: RouteHas[];
    fallback: Fallback;
    /**
     * When defined, it describes the revalidation configuration for the fallback
     * route.
     */
    fallbackRevalidate: Revalidate | undefined;
    /**
     * When defined, it describes the expire configuration for the fallback route.
     */
    fallbackExpire: number | undefined;
    /**
     * The headers that should used when serving the fallback.
     */
    fallbackHeaders?: Record<string, string>;
    /**
     * The status code that should be used when serving the fallback.
     */
    fallbackStatus?: number;
    /**
     * The root params that are unknown for this fallback route.
     */
    fallbackRootParams: readonly string[] | undefined;
    /**
     * The source route that this fallback route is based on. This is a reference
     * so that we can associate this dynamic route with the correct source.
     */
    fallbackSourceRoute: string | undefined;
    prefetchDataRoute: string | null | undefined;
    prefetchDataRouteRegex: string | null | undefined;
    routeRegex: string;
    /**
     * @deprecated use `renderingMode` instead
     */
    experimentalPPR: boolean | undefined;
    /**
     * The rendering mode for this route. Only `undefined` when not an app router
     * route.
     */
    renderingMode: RenderingMode | undefined;
    /**
     * The headers that are allowed to be used when revalidating this route. These
     * are used internally by Next.js to revalidate routes.
     */
    allowHeader: string[];
}
export type PrerenderManifest = {
    version: 4;
    routes: {
        [route: string]: PrerenderManifestRoute;
    };
    dynamicRoutes: {
        [route: string]: DynamicPrerenderManifestRoute;
    };
    notFoundRoutes: string[];
    preview: __ApiPreviewProps;
};
type ManifestBuiltRoute = {
    /**
     * The route pattern used to match requests for this route.
     */
    regex: string;
};
export type ManifestRewriteRoute = ManifestBuiltRoute & Rewrite;
export type ManifestRedirectRoute = ManifestBuiltRoute & Redirect;
export type ManifestHeaderRoute = ManifestBuiltRoute & Header;
export type ManifestRoute = ManifestBuiltRoute & {
    page: string;
    namedRegex?: string;
    routeKeys?: {
        [key: string]: string;
    };
    prefetchSegmentDataRoutes?: PrefetchSegmentDataRoute[];
};
type ManifestDataRoute = {
    page: string;
    routeKeys?: {
        [key: string]: string;
    };
    dataRouteRegex: string;
    namedDataRouteRegex?: string;
};
export type RoutesManifest = {
    version: number;
    pages404: boolean;
    basePath: string;
    redirects: Array<Redirect>;
    rewrites?: Array<ManifestRewriteRoute> | {
        beforeFiles: Array<ManifestRewriteRoute>;
        afterFiles: Array<ManifestRewriteRoute>;
        fallback: Array<ManifestRewriteRoute>;
    };
    headers: Array<ManifestHeaderRoute>;
    staticRoutes: Array<ManifestRoute>;
    dynamicRoutes: Array<ManifestRoute>;
    dataRoutes: Array<ManifestDataRoute>;
    i18n?: {
        domains?: ReadonlyArray<{
            http?: true;
            domain: string;
            locales?: readonly string[];
            defaultLocale: string;
        }>;
        locales: readonly string[];
        defaultLocale: string;
        localeDetection?: false;
    };
    rsc: {
        header: typeof RSC_HEADER;
        didPostponeHeader: typeof NEXT_DID_POSTPONE_HEADER;
        contentTypeHeader: typeof RSC_CONTENT_TYPE_HEADER;
        varyHeader: string;
        prefetchHeader: typeof NEXT_ROUTER_PREFETCH_HEADER;
        suffix: typeof RSC_SUFFIX;
        prefetchSuffix: typeof RSC_PREFETCH_SUFFIX;
        prefetchSegmentHeader: typeof NEXT_ROUTER_SEGMENT_PREFETCH_HEADER;
        prefetchSegmentDirSuffix: typeof RSC_SEGMENTS_DIR_SUFFIX;
        prefetchSegmentSuffix: typeof RSC_SEGMENT_SUFFIX;
    };
    rewriteHeaders: {
        pathHeader: typeof NEXT_REWRITTEN_PATH_HEADER;
        queryHeader: typeof NEXT_REWRITTEN_QUERY_HEADER;
    };
    skipMiddlewareUrlNormalize?: boolean;
    caseSensitive?: boolean;
    /**
     * Configuration related to Partial Prerendering.
     */
    ppr?: {
        /**
         * The chained response for the PPR resume.
         */
        chain: {
            /**
             * The headers that will indicate to Next.js that the request is for a PPR
             * resume.
             */
            headers: Record<string, string>;
        };
    };
};
export interface FunctionsConfigManifest {
    version: number;
    functions: Record<string, {
        maxDuration?: number | undefined;
        runtime?: 'nodejs';
        matchers?: Array<{
            regexp: string;
            originalSource: string;
            has?: Rewrite['has'];
            missing?: Rewrite['has'];
        }>;
    }>;
}
type StaticWorker = typeof import('./worker') & Worker;
export declare function createStaticWorker(config: NextConfigComplete, progress?: {
    run: () => void;
    clear: () => void;
}): StaticWorker;
export default function build(dir: string, reactProductionProfiling: boolean | undefined, debugOutput: boolean | undefined, runLint: boolean | undefined, noMangling: boolean | undefined, appDirOnly: boolean | undefined, isTurbopack: boolean | undefined, experimentalBuildMode: 'default' | 'compile' | 'generate' | 'generate-env', traceUploadUrl: string | undefined): Promise<void>;
export {};
