import * as VueRouter from 'vue-router';
import { reconstructRoutesByPath } from './pathBasedRouteUtils';

export interface RouteProcessingOptions {
  router: VueRouter.Router;
  basename?: string;
  memoryRoute?: boolean | { entryPath: string };
  hashRoute?: boolean;
}

export interface RouteProcessingResult {
  history: VueRouter.RouterHistory;
  routes: VueRouter.RouteRecordRaw[];
}

/**
 * Add basename prefix to all nested routes recursively
 *
 * @param routes - route configuration array
 * @param basename - base path prefix
 * @returns processed route configuration
 */
function addBasenameToNestedRoutes(
  routes: VueRouter.RouteRecordRaw[],
  basename: string,
): VueRouter.RouteRecordRaw[] {
  return routes.map((route) => {
    const updatedRoute = {
      ...route,
      path: basename + route.path,
    };

    // Recursively process child routes
    if (route.children && route.children.length > 0) {
      updatedRoute.children = addBasenameToNestedRoutes(
        route.children,
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
export function processRoutesWithPathAnalysis(
  options: RouteProcessingOptions,
): RouteProcessingResult {
  const { router, basename, memoryRoute, hashRoute } = options;

  let history: VueRouter.RouterHistory;

  // Get flat runtime routes
  const flatRoutes = router.getRoutes();
  const staticRoutes = router.options.routes;

  // Reconstruct nested structure
  let routes: VueRouter.RouteRecordRaw[] = reconstructRoutesByPath(
    flatRoutes,
    staticRoutes,
  );

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
