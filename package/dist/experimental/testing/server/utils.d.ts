import type { IncomingHttpHeaders } from 'http';
import type { BaseNextRequest } from '../../../server/base-http';
import type { NextResponse } from '../../../server/web/exports';
export declare function constructRequest({ url, headers, cookies, }: {
    url: string;
    headers?: IncomingHttpHeaders;
    cookies?: Record<string, string>;
}): BaseNextRequest;
/**
 * Returns the URL of the redirect if the response is a redirect response or
 * returns null if the response is not.
 */
export declare function getRedirectUrl(response: NextResponse): string | null;
/**
 * Checks whether the provided response is a rewrite response to a different
 * URL.
 */
export declare function isRewrite(response: NextResponse): boolean;
/**
 * Returns the URL of the response rewrite if the response is a rewrite, or
 * returns null if the response is not.
 */
export declare function getRewrittenUrl(response: NextResponse): string | null;
