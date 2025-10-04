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
  return routes.map((route) => {
    const updatedRoute: VueRouter.RouteRecordNormalized = {
      ...route,
      path: basename + route.path,
    };

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

  let history: VueRouter.RouterHistory;

  // Get flat runtime routes
  // Sort routes, try to process parent route first
  const flatRoutes = router
    .getRoutes()
    .sort(
      (a, b) =>
        a.path.split('/').filter((p) => p).length -
        b.path.split('/').filter((p) => p).length,
    );
  // Make sure every route is processed
  const processedTag = Array.from({ length: flatRoutes.length }, () => false);
  // Construct map for fast query
  const flatRoutesMap = new Map<string, VueRouter.RouteRecordNormalized>();
  flatRoutes.forEach((route) => {
    flatRoutesMap.set(route.path, route);
  });

  const processChildren = (
    route: VueRouter.RouteRecordNormalized,
    prefix = '',
  ) => {
    if (!route.children || route.children.length === 0) {
      const idx = flatRoutes.findIndex((item) => item === route);
      // mark as processed
      if (idx !== -1) processedTag[idx] = true;
      return route;
    }

    for (let j = 0; j < route.children.length; j++) {
      const child = route.children[j];
      // Theoretical childRoute is always defined,
      // use no `!` for robustness.
      const fullPath = prefix + '/' + child.path;
      const childRoute = flatRoutesMap.get(fullPath);
      if (childRoute) {
        // Create a new route object with relative path for nested routes
        const relativeChildRoute: VueRouter.RouteRecordNormalized = {
          ...childRoute,
          path: child.path, // Keep the original relative path from static route
        };

        route.children.splice(j, 1, relativeChildRoute);
        const idx = flatRoutes.findIndex((item) => item === childRoute);
        // mark as processed
        if (idx !== -1) processedTag[idx] = true;
        // Use the full path for processing deeper children
        processChildren(relativeChildRoute, fullPath);
      }
    }

    return route;
  };

  // Reconstruct nested structure
  let routes: VueRouter.RouteRecordNormalized[] = [];
  let i = 0;
  while (i < flatRoutes.length) {
    if (processedTag[i] === true) {
      i++;
      continue;
    }

    const processedRoute = processChildren(flatRoutes[i], flatRoutes[i].path);

    routes.push(processedRoute);
    processedTag[i] = true;
    i++;
  }

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
