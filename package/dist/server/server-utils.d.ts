import type { Rewrite } from '../lib/load-custom-routes';
import type { RouteMatchFn } from '../shared/lib/router/utils/route-matcher';
import type { NextConfig } from './config';
import type { BaseNextRequest } from './base-http';
import type { ParsedUrlQuery } from 'querystring';
import type { UrlWithParsedQuery } from 'url';
import { getNamedRouteRegex } from '../shared/lib/router/utils/route-regex';
import type { IncomingHttpHeaders } from 'http';
export declare function normalizeVercelUrl(req: BaseNextRequest, paramKeys: string[], defaultRouteRegex: ReturnType<typeof getNamedRouteRegex> | undefined): void;
export declare function interpolateDynamicPath(pathname: string, params: ParsedUrlQuery, defaultRouteRegex?: ReturnType<typeof getNamedRouteRegex> | undefined): string;
export declare function normalizeDynamicRouteParams(query: ParsedUrlQuery, defaultRouteRegex: ReturnType<typeof getNamedRouteRegex>, defaultRouteMatches: ParsedUrlQuery, ignoreMissingOptional: boolean): {
    params: ParsedUrlQuery;
    hasValidParams: boolean;
};
export declare function getUtils({ page, i18n, basePath, rewrites, pageIsDynamic, trailingSlash, caseSensitive, }: {
    page: string;
    i18n?: NextConfig['i18n'];
    basePath: string;
    rewrites: {
        fallback?: ReadonlyArray<Rewrite>;
        afterFiles?: ReadonlyArray<Rewrite>;
        beforeFiles?: ReadonlyArray<Rewrite>;
    };
    pageIsDynamic: boolean;
    trailingSlash?: boolean;
    caseSensitive: boolean;
}): {
    handleRewrites: (req: BaseNextRequest, parsedUrl: UrlWithParsedQuery) => {};
    defaultRouteRegex: {
        namedRegex: string;
        routeKeys: {
            [named: string]: string;
        };
        groups: {
            [groupName: string]: import("../shared/lib/router/utils/route-regex").Group;
        };
        re: RegExp;
    } | undefined;
    dynamicRouteMatcher: RouteMatchFn | undefined;
    defaultRouteMatches: ParsedUrlQuery | undefined;
    getParamsFromRouteMatches: (routeMatchesHeader: string) => import("./request/params").Params | null;
    /**
     * Normalize dynamic route params.
     *
     * @param query - The query params to normalize.
     * @param ignoreMissingOptional - Whether to ignore missing optional params.
     * @returns The normalized params and whether they are valid.
     */
    normalizeDynamicRouteParams: (query: ParsedUrlQuery, ignoreMissingOptional: boolean) => {
        params: ParsedUrlQuery;
        hasValidParams: boolean;
    };
    normalizeVercelUrl: (req: BaseNextRequest, paramKeys: string[]) => void;
    interpolateDynamicPath: (pathname: string, params: Record<string, undefined | string | string[]>) => string;
};
export declare function getPreviouslyRevalidatedTags(headers: IncomingHttpHeaders, previewModeId: string | undefined): string[];
