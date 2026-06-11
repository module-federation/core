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
  patchRouter?: (router: VueRouter.Router) => void;
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
   *
   * Relative paths (not starting with '/') are left untouched — Vue Router
   * resolves them against the parent route, which already carries the basename.
   */
  const prefixPath = (original: string): string => {
    if (!original.startsWith('/')) return original;

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
 * Create a patch function that rewrites path-based navigations to include
 * the basename prefix.  This is needed because createWebHashHistory() does
 * not accept a basename argument, so router.push('/foo') would bypass the
 * prefixed route definitions.
 *
 * By patching push/replace/resolve *before* Vue Router resolves the
 * location we also avoid the "No match found" console warning.
 */
function createHashBasenamePatch(
  basename: string,
): (router: VueRouter.Router) => void {
  const normalized = basename.replace(/\/+$/, '');

  /**
   * Only absolute paths (starting with '/') that don't already carry the
   * basename prefix need rewriting.  Relative segments ('settings'),
   * query-only ('?tab=1'), and hash-only ('#anchor') strings are resolved
   * by Vue Router against the current route and must pass through untouched.
   */
  const needsPrefix = (path: string): boolean =>
    path.startsWith('/') &&
    path !== normalized &&
    !path.startsWith(normalized + '/');

  const prefix = (path: string): string =>
    `${normalized}${path}`.replace(/\/+/g, '/');

  const rewrite = (
    to: VueRouter.RouteLocationRaw,
  ): VueRouter.RouteLocationRaw => {
    if (typeof to === 'string') {
      return needsPrefix(to) ? prefix(to) : to;
    }
    if ('path' in to && typeof to.path === 'string' && needsPrefix(to.path)) {
      return { ...to, path: prefix(to.path) };
    }
    return to;
  };

  return (router) => {
    const originalPush = router.push.bind(router);
    const originalReplace = router.replace.bind(router);
    const originalResolve = router.resolve.bind(router);

    router.push = (to: VueRouter.RouteLocationRaw) => originalPush(rewrite(to));
    router.replace = (to: VueRouter.RouteLocationRaw) =>
      originalReplace(rewrite(to));
    router.resolve = ((to: VueRouter.RouteLocationRaw, ...rest: any[]) =>
      originalResolve(rewrite(to), ...rest)) as typeof router.resolve;
  };
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
  // Store arrays because multiple routes can resolve to the same path
  // (e.g. a parent and a default child with path: '')
  const flatRoutesMap = new Map<string, VueRouter.RouteRecordNormalized[]>();
  const processedRoutes = new Set<VueRouter.RouteRecordNormalized>();

  flatRoutes.forEach((route) => {
    const existing = flatRoutesMap.get(route.path) || [];
    existing.push(route);
    flatRoutesMap.set(route.path, existing);
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
      const candidates = flatRoutesMap.get(fullPath) || [];
      // Find a matching route that:
      // 1. Hasn't been processed yet
      // 2. Isn't the current parent route (avoids circular references when
      //    a child with path: '' resolves to the same absolute path)
      // 3. Matches by name when the child definition specifies one
      const childRoute = candidates.find(
        (r) =>
          !processedRoutes.has(r) &&
          r !== route &&
          (child.name == null || r.name === child.name),
      );

      if (childRoute) {
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
  let patchRouter: ((router: VueRouter.Router) => void) | undefined;

  if (memoryRoute) {
    history = VueRouter.createMemoryHistory(basename);
  } else if (hashRoute) {
    history = VueRouter.createWebHashHistory();
    if (basename) {
      routes = addBasenameToNestedRoutes(routes, basename);
      patchRouter = createHashBasenamePatch(basename);
    }
  } else {
    history = VueRouter.createWebHistory(basename);
  }

  return { history, routes, patchRouter };
}
