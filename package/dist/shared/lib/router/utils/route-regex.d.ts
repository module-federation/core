export interface Group {
    pos: number;
    repeat: boolean;
    optional: boolean;
}
export interface RouteRegex {
    groups: {
        [groupName: string]: Group;
    };
    re: RegExp;
}
type GetNamedRouteRegexOptions = {
    /**
     * Whether to prefix the route keys with the NEXT_INTERCEPTION_MARKER_PREFIX
     * or NEXT_QUERY_PARAM_PREFIX. This is only relevant when creating the
     * routes-manifest during the build.
     */
    prefixRouteKeys: boolean;
    /**
     * Whether to include the suffix in the route regex. This means that when you
     * have something like `/[...slug].json` the `.json` part will be included
     * in the regex, yielding `/(.*).json` as the regex.
     */
    includeSuffix?: boolean;
    /**
     * Whether to include the prefix in the route regex. This means that when you
     * have something like `/[...slug].json` the `/` part will be included
     * in the regex, yielding `^/(.*).json$` as the regex.
     *
     * Note that interception markers will already be included without the need
     */
    includePrefix?: boolean;
    /**
     * Whether to exclude the optional trailing slash from the route regex.
     */
    excludeOptionalTrailingSlash?: boolean;
    /**
     * Whether to backtrack duplicate keys. This is only relevant when creating
     * the routes-manifest during the build.
     */
    backreferenceDuplicateKeys?: boolean;
};
type GetRouteRegexOptions = {
    /**
     * Whether to include extra parts in the route regex. This means that when you
     * have something like `/[...slug].json` the `.json` part will be included
     * in the regex, yielding `/(.*).json` as the regex.
     */
    includeSuffix?: boolean;
    /**
     * Whether to include the prefix in the route regex. This means that when you
     * have something like `/[...slug].json` the `/` part will be included
     * in the regex, yielding `^/(.*).json$` as the regex.
     *
     * Note that interception markers will already be included without the need
     * of adding this option.
     */
    includePrefix?: boolean;
    /**
     * Whether to exclude the optional trailing slash from the route regex.
     */
    excludeOptionalTrailingSlash?: boolean;
};
/**
 * Parses a given parameter from a route to a data structure that can be used
 * to generate the parametrized route.
 * Examples:
 *   - `[[...slug]]` -> `{ key: 'slug', repeat: true, optional: true }`
 *   - `[...slug]` -> `{ key: 'slug', repeat: true, optional: false }`
 *   - `[[foo]]` -> `{ key: 'foo', repeat: false, optional: true }`
 *   - `[bar]` -> `{ key: 'bar', repeat: false, optional: false }`
 *   - `fizz` -> `{ key: 'fizz', repeat: false, optional: false }`
 * @param param - The parameter to parse.
 * @returns The parsed parameter as a data structure.
 */
export declare function parseParameter(param: string): {
    key: string;
    repeat: boolean;
    optional: boolean;
};
/**
 * From a normalized route this function generates a regular expression and
 * a corresponding groups object intended to be used to store matching groups
 * from the regular expression.
 */
export declare function getRouteRegex(normalizedRoute: string, { includeSuffix, includePrefix, excludeOptionalTrailingSlash, }?: GetRouteRegexOptions): RouteRegex;
/**
 * This function extends `getRouteRegex` generating also a named regexp where
 * each group is named along with a routeKeys object that indexes the assigned
 * named group with its corresponding key. When the routeKeys need to be
 * prefixed to uniquely identify internally the "prefixRouteKey" arg should
 * be "true" currently this is only the case when creating the routes-manifest
 * during the build
 */
export declare function getNamedRouteRegex(normalizedRoute: string, options: GetNamedRouteRegexOptions): {
    namedRegex: string;
    routeKeys: {
        [named: string]: string;
    };
    groups: {
        [groupName: string]: Group;
    };
    re: RegExp;
};
/**
 * Generates a named regexp.
 * This is intended to be using for build time only.
 */
export declare function getNamedMiddlewareRegex(normalizedRoute: string, options: {
    catchAll?: boolean;
}): {
    namedRegex: string;
};
export {};
