import type { FederationHost } from '@module-federation/enhanced/runtime';
import type { RouteObject } from '@modern-js/runtime/router';

export type RemoteRoutesMap = Record<string, { routes: RouteObject[] }>;

export async function fetchRemoteFullRoutesMap(options: {
  remotePath: string;
  instance: FederationHost;
  dataLoaderRemotes: string[];
}) {
  const { instance, remotePath, dataLoaderRemotes } = options;

  const { remotes } = instance.options;
  const remoteRoutesMap: RemoteRoutesMap = {};

  if (!remotes.length) {
    return remoteRoutesMap;
  }

  await Promise.all(
    remotes.map(async (remote) => {
      if (!dataLoaderRemotes.includes(remote.name)) {
        return;
      }
      const remoteId = `${remote.name}/${remotePath}`;
      const { routes } = (await instance.loadRemote(remoteId)) as {
        routes: RouteObject[];
      };
      remoteRoutesMap[remote.name] = {
        routes,
      };
    }),
  );
  return remoteRoutesMap;
}

export function getSSRByRouteIds(
  dataLoaderRemotes: string[],
  remoteRoutesMap: RemoteRoutesMap,
): undefined | string[] {
  const remoteProviderRouteIds: Set<string> = new Set();

  const collectIds = (route: RouteObject) => {
    remoteProviderRouteIds.add(route.id!);
    if (route.children) {
      route.children.forEach((r) => {
        collectIds(r);
      });
    }
  };
  Object.entries(remoteRoutesMap).forEach((item) => {
    const [remoteName, routesObj] = item;
    if (!dataLoaderRemotes.includes(remoteName)) {
      return;
    }
    const { routes } = routesObj;
    routes.forEach((route) => {
      collectIds(route);
    });
  });

  return [...remoteProviderRouteIds];
}
