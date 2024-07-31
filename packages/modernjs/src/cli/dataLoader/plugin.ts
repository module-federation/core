import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import { fs } from '@modern-js/utils';
import type { RouteObject } from '@modern-js/runtime/router';
import type {
  DataLoaderOptions,
  InternalModernPluginOptions,
} from '../../types';
import type { init } from '@module-federation/enhanced/runtime';
import { transformName2Prefix } from '../../runtime/dataLoader/utils';
import { DEFAULT_ENTRY, ROUTE_ID } from '../../constant';
import { META_NAME } from '../../constant';
import { generateRoutes } from './ast';
import { type moduleFederationPlugin } from '@module-federation/sdk';
import { generateRouteFile } from './generateRouteFile';

import type { DataLoaderServerPluginOptions } from '../server/dataLoaderPlugin';
import { patchMFConfig } from './patchMFConfig';
import { clearMFCache } from './clearMFCache';
import path from 'path';

function _transformRuntimeOptions(
  buildOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
): Parameters<typeof init>[0] {
  const remotes = buildOptions.remotes || {};
  const runtimeRemotes = Object.entries(remotes).map((remote) => {
    const [alias, nameAndEntry] = remote;
    const [name, entry] = (nameAndEntry as string).split('@');
    return { name, entry, alias };
  });

  return {
    name: buildOptions.name!,
    remotes: runtimeRemotes,
  };
}

export const moduleFederationDataLoaderPlugin = (
  enable: boolean,
  internalOptions: InternalModernPluginOptions,
  userConfig: DataLoaderOptions,
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation-data-loader',
  pre: ['@modern-js/plugin-module-federation-config'],
  post: ['@modern-js/plugin-router', '@modern-js/plugin-module-federation'],
  setup: async ({ useAppContext }) => {
    if (!enable) {
      return;
    }
    const {
      serverPlugin = '@module-federation/modern-js/data-loader-server',
      transformRuntimeOptions,
    } = userConfig;

    const appContext = useAppContext();

    const name = internalOptions.csrConfig!.name!;
    const { metaName = META_NAME } = internalOptions;
    const internalDirectory = appContext.internalDirectory.replace(
      META_NAME,
      metaName || META_NAME,
    );
    const transformRuntimeFn =
      transformRuntimeOptions || _transformRuntimeOptions;

    const entries: Set<string> = new Set();
    let remotePathMap: Record<string, { name: string; path: string }> = {};
    const ssrByRouteIdsMap: Record<string, string> = {};

    const csrConfig = internalOptions.csrConfig!;

    if (
      typeof csrConfig.remotes === 'object' &&
      Object.keys(csrConfig.remotes).length
    ) {
      const { entries: scanEntries, remotePathMap: scanRemotePathMap } =
        await generateRouteFile({
          appDirectory: appContext.appDirectory,
        });
      scanEntries.forEach((e) => entries.add(e));
      remotePathMap = scanRemotePathMap;
    } else {
      entries.add(DEFAULT_ENTRY);
    }
    const dataLoaderRemotes: string[] = [
      ...new Set(Object.values(remotePathMap).map((i) => i.name)),
    ];

    const serverPluginOptions: DataLoaderServerPluginOptions = {
      runtimeOptions: transformRuntimeFn(internalOptions.csrConfig!),
      dataLoaderRemotes,
      ssrByRouteIdsMap,
    };

    const hasDataLoaderRemotes = () =>
      Boolean(serverPluginOptions.dataLoaderRemotes.length);
    return {
      _internalRuntimePlugins: ({ entrypoint, plugins }) => {
        if (!hasDataLoaderRemotes()) {
          return { entrypoint, plugins };
        }
        plugins.push({
          name: 'ssrDataLoader',
          path: '@module-federation/modern-js/data-loader',
          config: { metaName, dataLoaderRemotes },
        });
        plugins.push({
          name: 'ssrDataLoaderInjectAssets',
          path: '@module-federation/modern-js/data-loader-inject-assets',
          config: { metaName, dataLoaderRemotes },
        });
        return { entrypoint, plugins };
      },
      _internalServerPlugins({ plugins }) {
        if (!hasDataLoaderRemotes()) {
          return { plugins };
        }
        plugins.push({
          name: serverPlugin,
          options: serverPluginOptions,
        });

        return { plugins };
      },

      async modifyFileSystemRoutes(options) {
        const { routes, entrypoint } = options;
        const { entryName } = entrypoint;

        const prefix = transformName2Prefix(internalOptions.csrConfig!.name!);
        const modifyRouteIds = async (route: RouteObject, pathName: string) => {
          const currentPathName = route.path
            ? path.join(pathName, route.path)
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
            await modifyRouteIds(route, entryName);
          }),
        );
        return options;
      },
      config: async () => {
        return {
          tools: {
            // bundlerChain can not keep target order
            rspack(_config, { isServer }) {
              patchMFConfig({
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
              patchMFConfig({
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
      async afterDev() {
        clearMFCache();
      },
    };
  },
});

export default moduleFederationDataLoaderPlugin;

export { generateRoutes };
