import type { IncomingHttpHeaders } from 'http';
import type { NextConfig } from '../../../server/config-shared';
import type { MiddlewareConfigMatcherInput } from '../../../build/segment-config/middleware/middleware-config';
export interface MiddlewareSourceConfig {
    matcher?: MiddlewareConfigMatcherInput;
}
/**
 * Checks whether the middleware config will match the provide URL and request
 * information such as headers and cookies. This function is useful for
 * unit tests to assert that middleware is matching (and therefore executing)
 * only when it should be.
 */
export declare function unstable_doesMiddlewareMatch({ config, url, headers, cookies, nextConfig, }: {
    config: MiddlewareSourceConfig;
    url: string;
    headers?: IncomingHttpHeaders;
    cookies?: Record<string, string>;
    nextConfig?: NextConfig;
}): boolean;
