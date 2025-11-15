import type { CliPluginFuture, AppTools } from '@modern-js/app-tools';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import type { moduleFederationPlugin as MFPluginOptions } from '@module-federation/sdk';
import type { PluginOptions, InternalModernPluginOptions } from '../types';
import { moduleFederationConfigPlugin } from './configPlugin';
import { moduleFederationSSRPlugin } from './ssrPlugin';
import { isWebTarget } from './utils';

export const moduleFederationPlugin = (
  userConfig: PluginOptions = {},
): CliPluginFuture<AppTools> => {
  const internalModernPluginOptions: InternalModernPluginOptions = {
    csrConfig: undefined,
    ssrConfig: undefined,
    browserPlugin: undefined,
    nodePlugin: undefined,
    assetResources: {},
    distOutputDir: '',
    originPluginOptions: userConfig,
    remoteIpStrategy: userConfig?.remoteIpStrategy,
    userConfig: userConfig || {},
    assetFileNames: {},
    fetchServerQuery: userConfig.fetchServerQuery ?? undefined,
  };
  return {
    name: '@modern-js/plugin-module-federation',
    setup: async (api) => {
      api.modifyBundlerChain((chain) => {
        const browserPluginOptions =
          internalModernPluginOptions.csrConfig as MFPluginOptions.ModuleFederationPluginOptions;

        const MFPlugin = RspackModuleFederationPlugin;
        if (isWebTarget(chain.get('target'))) {
          chain
            .plugin('plugin-module-federation')
            .use(MFPlugin, [browserPluginOptions])
            .init((Plugin: typeof MFPlugin, args) => {
              internalModernPluginOptions.browserPlugin = new Plugin(args[0]);
              return internalModernPluginOptions.browserPlugin;
            });
        }
      });

      api._internalServerPlugins(({ plugins }) => {
        plugins.push({
          name: '@module-federation/modern-js/server',
        });
        return { plugins };
      });
    },
    usePlugins: [
      moduleFederationConfigPlugin(internalModernPluginOptions),
      moduleFederationSSRPlugin(
        internalModernPluginOptions as Required<InternalModernPluginOptions>,
      ),
    ],
  };
};

export default moduleFederationPlugin;

export { createModuleFederationConfig } from '@module-federation/enhanced';

export type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
