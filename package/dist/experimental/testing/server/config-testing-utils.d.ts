import type { IncomingHttpHeaders } from 'node:http';
import type { NextConfig } from '../../../server/config-shared';
import { NextResponse } from '../../../server/web/exports';
/**
 * Tests the logic of `headers`, `redirects`, and `rewrites` in `next.config.js`.
 * Given the provided next config, this function will return a `NextResponse`
 * with the result of running the request through the custom routes.
 *
 * @example Test whether a given URL results in a redirect.
 * ```
 * import { unstable_getResponseFromNextConfig, getRedirectUrl } from 'next/server/testing'
 * const response = await unstable_getResponseFromNextConfig({
 *   url: 'https://nextjs.org/test',
 *   nextConfig: {
 *    async redirects() {
 *     return [
 *       { source: '/test', destination: '/test2', permanent: false },
 *     ]
 *    },
 *   }
 * });
 * expect(response.status).toEqual(307);
 * expect(getRedirectUrl(response)).toEqual('https://nextjs.org/test2');
 * ```
 */
export declare function unstable_getResponseFromNextConfig({ url, nextConfig, headers, cookies, }: {
    url: string;
    nextConfig: NextConfig;
    headers?: IncomingHttpHeaders;
    cookies?: Record<string, string>;
}): Promise<NextResponse>;
