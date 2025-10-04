import * as VueRouter from 'vue-router';

/**
 * Path information
 */
interface PathInfo {
  fullPath: string; // full path, for example: /dashboard/account
  relativePath: string; // relative path, for example: account
  depth: number; // path depth
  children: PathInfo[]; // child path info
}

/**
 * Reconstruct nested routes from flat route array
 * Prioritize static route structure, enrich with runtime data
 * @param flatRoutes - flat route array from getRoutes()
 * @param staticRoutes - original static route configuration
 * @returns nested route array
 */
export function reconstructRoutesByPath(
  flatRoutes: VueRouter.RouteRecordNormalized[],
  staticRoutes: readonly VueRouter.RouteRecordRaw[] = [],
): VueRouter.RouteRecordRaw[] {
  // If we have static routes, use them as the primary structure
  if (staticRoutes && staticRoutes.length > 0) {
    return reconstructByStaticRoutes(flatRoutes, staticRoutes);
  }

  // Fallback to path analysis if no static routes available
  return reconstructByPathAnalysis(flatRoutes);
}

/**
 * Reconstruct routes using static route structure as primary, enriched with runtime data
 */
function reconstructByStaticRoutes(
  flatRoutes: VueRouter.RouteRecordNormalized[],
  staticRoutes: readonly VueRouter.RouteRecordRaw[],
): VueRouter.RouteRecordNormalized[] {
  // Create map of runtime routes for quick lookup
  const runtimeRouteMap = new Map<string, VueRouter.RouteRecordNormalized>();
  flatRoutes.forEach((route) => {
    runtimeRouteMap.set(route.path, route);
  });

  // Recursively process static routes and find corresponding flat routes
  function constructNestedNormalizedRoute(
    staticRoute: VueRouter.RouteRecordRaw,
    parentPath = '',
  ): VueRouter.RouteRecordNormalized | null {
    const fullPath = calculateFullPath(staticRoute, parentPath);
    const flatRoute = runtimeRouteMap.get(fullPath);

    // If no corresponding flat route found, skip this static route
    if (!flatRoute) {
      return null;
    }

    // Start with the flat route (which is already normalized)
    const normalizedRoute: VueRouter.RouteRecordNormalized = {
      ...flatRoute,
    };

    // Process children recursively
    if (staticRoute.children && staticRoute.children.length > 0) {
      const childRoutes: VueRouter.RouteRecordNormalized[] = [];

      staticRoute.children.forEach((childStatic) => {
        const childNormalized = constructNestedNormalizedRoute(
          childStatic,
          fullPath,
        );
        if (childNormalized) {
          // For child routes, update the path to be relative
          const relativePath = calculateRelativePath(
            childNormalized.path,
            fullPath,
          );
          childNormalized.path = relativePath;
          childRoutes.push(childNormalized);
        }
      });

      if (childRoutes.length > 0) {
        normalizedRoute.children = childRoutes;
      }
    }

    return normalizedRoute;
  }

  // Process all static routes and filter out null results
  const results: VueRouter.RouteRecordNormalized[] = [];

  staticRoutes.forEach((staticRoute) => {
    const normalizedRoute = constructNestedNormalizedRoute(staticRoute);
    if (normalizedRoute) {
      results.push(normalizedRoute);
    }
  });

  return results;
}

/**
 * Calculate full path for a static route (considering parent paths)
 */
function calculateFullPath(
  route: VueRouter.RouteRecordRaw,
  parentPath = '',
): string {
  let fullPath = route.path;

  // Handle relative paths
  if (!fullPath.startsWith('/')) {
    fullPath =
      parentPath === '/' ? '/' + fullPath : parentPath + '/' + fullPath;
  }

  // Normalize path (remove double slashes, etc.)
  return fullPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

/**
 * Reconstruct routes by path analysis when no static routes available.
 * Assume that parent path is the prefix of child path.
 */
function reconstructByPathAnalysis(
  flatRoutes: VueRouter.RouteRecordNormalized[],
): VueRouter.RouteRecordRaw[] {
  const routeMap = new Map<string, VueRouter.RouteRecordNormalized>();
  flatRoutes.forEach((route) => {
    routeMap.set(route.path, route);
  });

  // Analyze path hierarchy
  const pathHierarchy = buildPathHierarchy(flatRoutes.map((r) => r.path));

  // Reconstruct nested routes based on hierarchy
  function buildNestedRoute(
    path: string,
    pathInfo: PathInfo,
  ): VueRouter.RouteRecordRaw {
    const route = routeMap.get(path)!;

    const nestedRoute = {
      ...route,
      // Use relative path for nested routes
      path: pathInfo.relativePath,
    };

    // recursively build children
    if (pathInfo.children.length > 0) {
      nestedRoute.children = pathInfo.children.map((childInfo) =>
        buildNestedRoute(childInfo.fullPath, childInfo),
      );
    }

    return nestedRoute;
  }

  // Build top-level routes
  return pathHierarchy.map((pathInfo) =>
    buildNestedRoute(pathInfo.fullPath, pathInfo),
  );
}

/**
 * Construct path hierarchy from flat paths
 *
 * @param paths - All paths array
 * @returns Path hierarchy
 */
function buildPathHierarchy(paths: string[]): PathInfo[] {
  // Make sure parent paths are processed before child paths
  const sortedPaths = paths
    .filter((path) => path !== '')
    .sort((a, b) => {
      const depthA = a.split('/').length;
      const depthB = b.split('/').length;
      if (depthA !== depthB) {
        return depthA - depthB;
      }
      return a.localeCompare(b);
    });

  const pathInfoMap = new Map<string, PathInfo>();
  const rootPaths: PathInfo[] = [];

  sortedPaths.forEach((path) => {
    const segments = path.split('/').filter((s) => s); // Remove empty segments
    const isRoot = path === '/';
    const depth = isRoot ? 0 : segments.length;

    const pathInfo: PathInfo = {
      fullPath: path,
      relativePath: isRoot ? '/' : segments[segments.length - 1] || path,
      depth,
      children: [],
    };

    pathInfoMap.set(path, pathInfo);

    if (isRoot || depth === 1) {
      // Top-level path (root or single-level like /dashboard, /admin)
      rootPaths.push(pathInfo);
    } else {
      const parentPath = findParentPath(path, pathInfoMap);
      if (parentPath) {
        parentPath.children.push(pathInfo);
        // For child routes, the relative path should be the part after the parent path prefix
        pathInfo.relativePath = calculateRelativePath(
          path,
          parentPath.fullPath,
        );
      } else {
        // If parent path not found, treat as top-level path
        rootPaths.push(pathInfo);
      }
    }
  });

  return rootPaths;
}

function findParentPath(
  childPath: string,
  pathInfoMap: Map<string, PathInfo>,
): PathInfo | null {
  const segments = childPath.split('/').filter((s) => s); // Remove empty segments

  // For single-level paths like '/dashboard', don't assign root as parent
  if (segments.length === 1) {
    return null; // Treat as top-level route
  }

  // Look for actual parent path by progressively removing segments
  for (let i = segments.length - 1; i > 0; i--) {
    const possibleParentPath = '/' + segments.slice(0, i).join('/');
    if (pathInfoMap.has(possibleParentPath)) {
      return pathInfoMap.get(possibleParentPath)!;
    }
  }

  // Only use root as parent if it's the actual parent (like /dashboard/profile where /dashboard exists)
  // Don't automatically assign root as parent for top-level paths
  return null;
}

function calculateRelativePath(childPath: string, parentPath: string): string {
  if (parentPath === '/') {
    return childPath.substring(1);
  }

  if (childPath.startsWith(parentPath + '/')) {
    return childPath.substring(parentPath.length + 1);
  }

  const segments = childPath.split('/');
  return segments[segments.length - 1] || childPath;
}
