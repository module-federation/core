import { extractInterceptionRouteInformation, isInterceptionRouteAppPath } from './interception-routes';
// Identify /.*[param].*/ in route string
const TEST_ROUTE = /\/[^/]*\[[^/]+\][^/]*(?=\/|$)/;
// Identify /[param]/ in route string
const TEST_STRICT_ROUTE = /\/\[[^/]+\](?=\/|$)/;
/**
 * Check if a route is dynamic.
 *
 * @param route - The route to check.
 * @param strict - Whether to use strict mode which prohibits segments with prefixes/suffixes (default: true).
 * @returns Whether the route is dynamic.
 */ export function isDynamicRoute(route, strict) {
    if (strict === void 0) strict = true;
    if (isInterceptionRouteAppPath(route)) {
        route = extractInterceptionRouteInformation(route).interceptedRoute;
    }
    if (strict) {
        return TEST_STRICT_ROUTE.test(route);
    }
    return TEST_ROUTE.test(route);
}

//# sourceMappingURL=is-dynamic.js.map