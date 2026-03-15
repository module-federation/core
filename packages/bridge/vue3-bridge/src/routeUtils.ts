import * as VueRouter from 'vue-router';

export interface RouteProcessingOptions {
  router: VueRouter.Router;
  basename?: string;
  memoryRoute?: boolean | { entryPath: string };
  hashRoute?: boolean;
}

export interface RouteProcessingResult {
  history: VueRouter.RouterHistory;
  routes: VueRouter.RouteRecordNormalized[];
}

/**
 * Add basename prefix to all nested routes recursively
 *
 * @param routes - route configuration array
 * @param basename - base path prefix
 * @returns processed route configuration
 */
function addBasenameToNestedRoutes(
  routes: VueRouter.RouteRecordNormalized[],
  basename: string,
): VueRouter.RouteRecordNormalized[] {
  /**
   * Join two path segments, collapse multiple slashes, and optionally
   * preserve a trailing slash that was present in the original value.
   * A bare '/' root is never considered an intentional trailing slash.
   */
  const prefixPath = (original: string): string => {
    const hasTrailingSlash = original.length > 1 && original.endsWith('/');
    const normalized =
      `${basename}/${original}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    return hasTrailingSlash ? `${normalized}/` : normalized;
  };

  return routes.map((route) => {
    const updatedRoute: VueRouter.RouteRecordNormalized = {
      ...route,
      path: prefixPath(route.path),
    };

    // Prefix string redirects with basename
    if (typeof route.redirect === 'string') {
      updatedRoute.redirect = prefixPath(route.redirect);
    } else if (
      route.redirect &&
      typeof route.redirect === 'object' &&
      'path' in route.redirect &&
      typeof route.redirect.path === 'string'
    ) {
      updatedRoute.redirect = {
        ...route.redirect,
        path: prefixPath(route.redirect.path),
      };
    }

    // Recursively process child routes
    if (route.children && route.children.length > 0) {
      updatedRoute.children = addBasenameToNestedRoutes(
        route.children as VueRouter.RouteRecordNormalized[],
        basename,
      );
    }

    return updatedRoute;
  });
}

/**
 * Route processing solution based on path analysis
 *
 * @param options - route processing options
 * @returns processed history and routes
 */
export function processRoutes(
  options: RouteProcessingOptions,
): RouteProcessingResult {
  const { router, basename, memoryRoute, hashRoute } = options;

  // Sort routes, try to process parent route first
  const flatRoutes = router
    .getRoutes()
    .sort(
      (a, b) =>
        a.path.split('/').filter((p) => p).length -
        b.path.split('/').filter((p) => p).length,
    );

  // Use Map/Set for O(1) lookup performance
  const flatRoutesMap = new Map<string, VueRouter.RouteRecordNormalized>();
  const processedRoutes = new Set<VueRouter.RouteRecordNormalized>();

  flatRoutes.forEach((route) => {
    flatRoutesMap.set(route.path, route);
  });

  /**
   * Normalize path by removing double slashes and trailing slashes
   */
  const normalizePath = (prefix: string, childPath: string): string => {
    const fullPath = `${prefix}/${childPath}`;
    return fullPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  };

  const processChildren = (
    route: VueRouter.RouteRecordNormalized,
    prefix = '',
  ): VueRouter.RouteRecordNormalized => {
    if (!route.children || route.children.length === 0) {
      return route;
    }

    for (let j = 0; j < route.children.length; j++) {
      const child = route.children[j];
      const fullPath = normalizePath(prefix, child.path);
      const childRoute = flatRoutesMap.get(fullPath);

      if (childRoute && !processedRoutes.has(childRoute)) {
        // Create a new optimized route object with relative path for nested routes
        const relativeChildRoute: VueRouter.RouteRecordNormalized = {
          ...childRoute,
          path: child.path, // Keep the original relative path from static route
        };

        route.children[j] = relativeChildRoute;
        processedRoutes.add(childRoute);

        processChildren(relativeChildRoute, fullPath);
      }
    }

    return route;
  };

  // Reconstruct nested structure
  let routes: VueRouter.RouteRecordNormalized[] = [];

  for (const route of flatRoutes) {
    if (!processedRoutes.has(route)) {
      const processedRoute = processChildren(route, route.path);
      processedRoutes.add(route);
      routes.push(processedRoute);
    }
  }

  let history: VueRouter.RouterHistory;
  if (memoryRoute) {
    // Memory route mode
    history = VueRouter.createMemoryHistory(basename);
  } else if (hashRoute) {
    // Hash route mode
    history = VueRouter.createWebHashHistory();
    // Recursively process nested routes and add basename prefix to all paths
    if (basename) routes = addBasenameToNestedRoutes(routes, basename);
  } else {
    // Default Web History mode
    history = VueRouter.createWebHistory(basename);
  }

  return {
    history,
    routes,
  };
}
