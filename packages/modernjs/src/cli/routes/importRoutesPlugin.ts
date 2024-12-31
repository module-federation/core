import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import type { InternalRoutesPluginOptions } from '../../types/routes';
import type { init } from '@module-federation/enhanced/runtime';
import { META_NAME } from '../../constant';
import { type moduleFederationPlugin } from '@module-federation/sdk';

import type { FetchRouteServerPluginOptions } from '../server/fetchRoutePlugin';
import { clearMFCache } from './clearMFCache';

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

export const moduleFederationImportRoutePlugin = ({
  userConfig,
  internalOptions,
  remotePathMap,
  serverPlugin = '@module-federation/modern-js/fetch-router-server-plugin',
  ssrByRouteIdsMap,
  transformRuntimeOptions,
}: InternalRoutesPluginOptions): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation-import-routes',
  pre: ['@modern-js/plugin-module-federation-route'],
  post: ['@modern-js/plugin-router', '@modern-js/plugin-module-federation'],
  setup: async () => {
    if (!userConfig.importRoutes) {
      return;
    }
    const { metaName = META_NAME } = internalOptions;

    const transformRuntimeFn =
      transformRuntimeOptions || _transformRuntimeOptions;

    const dataLoaderRemotes: string[] = [
      ...new Set(Object.values(remotePathMap).map((i) => i.name)),
    ];

    const serverPluginOptions: FetchRouteServerPluginOptions = {
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
          path: '@module-federation/modern-js/routes',
          config: { metaName, dataLoaderRemotes },
        });
        plugins.push({
          name: 'ssrDataLoaderInjectAssets',
          path: '@module-federation/modern-js/routes-inject-assets',
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

      async afterDev() {
        clearMFCache();
      },
    };
  },
});

export default moduleFederationImportRoutePlugin;
