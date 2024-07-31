import { encodeName, decodeName } from '@module-federation/sdk';
import type { RouteObject } from '@modern-js/runtime/router';
import { DEFAULT_ENTRY, DEFAULT_LAYOUT, MF_ROUTES } from '../../constant';

export type RemoteRoutesMap = Record<string, { routes: RouteObject[] }>;

export type LoaderBundlesRoutes = {
  [entryName: string]: { routes: RouteObject[] };
};
export type NestedRoutes = { [entryName: string]: RouteObject[] };

const SPLIT_SYMBOL = '@';

export function transformName2Prefix(name: string) {
  return `${encodeName(name, '', false)}${SPLIT_SYMBOL}`;
}

export function decodeId(prefix: string) {
  const realPrefix = prefix.split(SPLIT_SYMBOL)[0];
  return decodeName(realPrefix, '', false);
}

export function getRemoteRoutesInfos(
  route: RouteObject,
  remoteRoutesMap: RemoteRoutesMap,
) {
  if (!route.id) {
    return;
  }

  const remoteName = decodeId(route.id);
  const remoteRouteObj = remoteRoutesMap[remoteName];

  if (!remoteRouteObj) {
    return;
  }

  const remoteRoutes = remoteRouteObj.routes[0];

  return {
    routes: remoteRoutes,
    name: remoteName,
    pathName: route.path,
  };
}

export function getRemoteLayoutId(remoteName: string) {
  const prefix = transformName2Prefix(remoteName);
  return `${prefix}${DEFAULT_LAYOUT}`;
}

// only support main entry currently
export function getRemoteId(remoteName: string) {
  return `${remoteName}/${DEFAULT_ENTRY}/${MF_ROUTES}`;
}

export function injectRemoteRoutes(
  initialRoutes: LoaderBundlesRoutes | NestedRoutes,
  remoteRoutesMap: RemoteRoutesMap,
) {
  const traverse = (route: RouteObject) => {
    const remoteRoutesInfos = getRemoteRoutesInfos(route, remoteRoutesMap);

    if (remoteRoutesInfos) {
      const { routes, pathName } = remoteRoutesInfos;
      route.id = routes.id!;
      route.path = pathName;
      if (routes.loader) {
        route.loader = routes.loader;
      }
      if (routes.children) {
        route.children = routes.children;
      }
      if (routes.Component) {
        route.Component = routes.Component;
        if (route.element) {
          delete route.element;
        }
      } else if (routes.element) {
        route.element = routes.element;
        if (route.Component) {
          delete route.Component;
        }
      }

      return;
    }

    route.children?.forEach((r) => {
      traverse(r);
    });
  };

  Object.keys(initialRoutes).forEach((entryName) => {
    const routes = initialRoutes[entryName];
    if (Array.isArray(routes)) {
      routes.forEach((route) => {
        traverse(route);
      });
    } else {
      routes?.routes?.forEach((r) => {
        traverse(r);
      });
    }
  });
}
