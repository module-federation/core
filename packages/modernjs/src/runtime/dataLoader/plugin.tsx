import type { Plugin } from '@modern-js/runtime';
import { type RouteObject } from '@modern-js/runtime/router';
import { getInstance } from '@module-federation/enhanced/runtime';
import { MF_ROUTES, DEFAULT_ENTRY } from '../../constant';
import type { RemoteRoutesMap } from '../../cli/server/fetchRemoteFullRoutesMap';
import { injectRemoteRoutes } from './utils';

export const ssrDataLoaderPlugin = ({
  metaName,
  dataLoaderRemotes,
}: {
  metaName: string;
  dataLoaderRemotes: string[];
}): Plugin => {
  return {
    name: '@modern-js/plugin-mf-data-loader',
    post: [`@${metaName}/plugin-router`, '@module-federation/modern-js'],
    setup: () => {
      const remoteRoutesMap: RemoteRoutesMap = {};
      return {
        async beforeRender() {
          if (Object.keys(remoteRoutesMap).length) {
            return;
          }
          const instance = getInstance();
          if (!instance) {
            return;
          }
          if (!instance.options.remotes.length) {
            return;
          }

          await Promise.all(
            instance.options.remotes.map(async (remote) => {
              if (!dataLoaderRemotes.includes(remote.name)) {
                return;
              }
              // Provider only supports one entry currently , so just use main(default entryName)
              const remoteId = `${remote.name}/${DEFAULT_ENTRY}/${MF_ROUTES}`;
              const { routes } = (await instance.loadRemote(remoteId)) as {
                routes: RouteObject[];
              };
              remoteRoutesMap[remote.name] = {
                routes,
              };
            }),
          );
        },
        // runtime plugin not save route , so it needs to inject again when trigger
        modifyRoutes: (routes: RouteObject[]) => {
          injectRemoteRoutes({ entry: { routes } }, remoteRoutesMap);

          return routes;
        },
      };
    },
  };
};
