import path from 'path';
import { fs } from '@modern-js/utils';
import { transformName2Prefix } from '../../runtime/routes/utils';
import { META_NAME } from '../../constant';
import { traverseRouteFiles } from './traverseRouteFiles';
import { moduleFederationExportRoutePlugin } from './exportRoutePlugin';
import { moduleFederationImportRoutePlugin } from './importRoutesPlugin';
import { addShared } from './utils';
import { DEFAULT_ENTRY, ROUTE_ID } from '../../constant';

import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import type { RouteObject } from '@modern-js/runtime/router';
import type {
  RoutesPluginOptions,
  InternalRoutesPluginOptions,
} from '../../types/routes';

export const moduleFederationRoutesPlugin = ({
  userConfig,
  internalOptions,
  serverPlugin,
  transformRuntimeOptions,
}: RoutesPluginOptions): CliPlugin<AppTools> => {
  const entries: Set<string> = new Set();
  const remotePathMap: Record<string, { name: string; path: string }> = {};
  const ssrByRouteIdsMap: Record<string, string> = {};

  const internalRoutesPluginOptions: InternalRoutesPluginOptions = {
    userConfig,
    internalOptions,
    entries,
    remotePathMap,
    ssrByRouteIdsMap,
    serverPlugin,
    transformRuntimeOptions,
  };
  return {
    name: '@modern-js/plugin-module-federation-route',
    pre: ['@modern-js/plugin-module-federation-config'],
    setup: async ({ useAppContext }) => {
      if (!userConfig.exportRoutes && !userConfig.importRoutes) {
        return;
      }
      const appContext = useAppContext();

      const name = internalOptions.csrConfig!.name!;
      const { metaName = META_NAME } = internalOptions;
      const internalDirectory = appContext.internalDirectory.replace(
        META_NAME,
        metaName || META_NAME,
      );

      const csrConfig = internalOptions.csrConfig!;

      if (
        typeof csrConfig.remotes === 'object' &&
        Object.keys(csrConfig.remotes).length
      ) {
        const { entries: scanEntries } = await traverseRouteFiles({
          appDirectory: appContext.appDirectory,
          generateRouteFile: userConfig.importRoutes,
          remotePathMap,
        });
        scanEntries.forEach((e) => entries.add(e));
      } else {
        entries.add(DEFAULT_ENTRY);
      }

      return {
        config: async () => {
          return {
            tools: {
              // bundlerChain can not keep target order
              rspack(_config, { isServer }) {
                addShared({
                  mfConfig: isServer
                    ? internalOptions.ssrConfig!
                    : internalOptions.csrConfig!,
                  metaName,
                  isServer,
                  internalDirectory,
                  entries,
                });
              },
              // bundlerChain can not keep target order
              webpack(_config, { isServer }) {
                addShared({
                  mfConfig: isServer
                    ? internalOptions.ssrConfig!
                    : internalOptions.csrConfig!,
                  metaName,
                  isServer,
                  internalDirectory,
                  entries,
                });
              },
            },
            source: {
              define: {
                MODERN_ROUTER_ID_PREFIX: JSON.stringify(
                  transformName2Prefix(name),
                ),
              },
            },
          };
        },
        async modifyFileSystemRoutes(options) {
          const { routes, entrypoint } = options;
          const { entryName } = entrypoint;

          const prefix = transformName2Prefix(internalOptions.csrConfig!.name!);
          const modifyRouteIds = async (
            route: RouteObject,
            pathName: string,
          ) => {
            const currentPathName = route.path
              ? path.join('/', pathName, route.path)
              : pathName;
            if (route.id) {
              const originalId = route.id;
              //@ts-ignore save original id
              route.originalId = originalId;

              const remoteInfo = remotePathMap[currentPathName];
              if (remoteInfo) {
                const { path, name } = remoteInfo;
                const remoteIdPrefix = transformName2Prefix(name);
                const isLayout = Boolean(route.children);
                const newId = `${remoteIdPrefix}${isLayout ? 'layout' : 'page'}`;
                ssrByRouteIdsMap[originalId] = newId;
                const content = fs.readFileSync(path, 'utf-8');
                await fs.writeFile(path, content.replace(ROUTE_ID, originalId));
                route.id = newId;
              } else {
                route.id = `${prefix}${route.id}`;
              }

              route.children &&
                (await Promise.all(
                  route.children.map(async (r) => {
                    return await modifyRouteIds(r, currentPathName);
                  }),
                ));
            }
          };
          await Promise.all(
            routes.map(async (route) => {
              await modifyRouteIds(
                route,
                entryName === DEFAULT_ENTRY ? '' : entryName,
              );
            }),
          );
          return options;
        },
      };
    },
    usePlugins: [
      moduleFederationExportRoutePlugin(internalRoutesPluginOptions),
      moduleFederationImportRoutePlugin(internalRoutesPluginOptions),
    ],
  };
};

export default moduleFederationRoutesPlugin;
