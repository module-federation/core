import type { IncomingMessage } from 'http';
import type { NextParsedUrlQuery } from '../../../../server/request-meta';
import type { RouteHas } from '../../../../lib/load-custom-routes';
import type { BaseNextRequest } from '../../../../server/base-http';
import type { Params } from '../../../../server/request/params';
export declare function matchHas(req: BaseNextRequest | IncomingMessage, query: Params, has?: RouteHas[], missing?: RouteHas[]): false | Params;
export declare function compileNonPath(value: string, params: Params): string;
export declare function parseDestination(args: {
    destination: string;
    params: Readonly<Params>;
    query: Readonly<NextParsedUrlQuery>;
}): {
    pathname: string;
    hostname: string | null | undefined;
    href: string;
    hash: string;
    port?: string | null;
    protocol?: string | null;
    query: import("querystring").ParsedUrlQuery;
    search: string;
};
export declare function prepareDestination(args: {
    appendParamsToQuery: boolean;
    destination: string;
    params: Params;
    query: NextParsedUrlQuery;
}): {
    newUrl: string;
    destQuery: import("querystring").ParsedUrlQuery;
    parsedDestination: {
        pathname: string;
        hostname: string | null | undefined;
        href: string;
        hash: string;
        port?: string | null;
        protocol?: string | null;
        query: import("querystring").ParsedUrlQuery;
        search: string;
    };
};
