import type { CliPluginFuture, AppTools } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin as WebpackModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import type { moduleFederationPlugin as MFPluginOptions } from '@module-federation/sdk';
import type { PluginOptions, InternalModernPluginOptions } from '../types';
import { moduleFederationConfigPlugin } from './configPlugin';
import { moduleFederationSSRPlugin } from './ssrPlugin';
import { WebpackPluginInstance } from '@rspack/core';

export const moduleFederationPlugin = (
  userConfig: PluginOptions = {},
): CliPluginFuture<AppTools> => {
  const internalModernPluginOptions: InternalModernPluginOptions = {
    csrConfig: undefined,
    ssrConfig: undefined,
    browserPlugin: undefined,
    nodePlugin: undefined,
    distOutputDir: '',
    originPluginOptions: userConfig,
    remoteIpStrategy: userConfig?.remoteIpStrategy,
    userConfig,
  };
  return {
    name: '@modern-js/plugin-module-federation',
    setup: async (api) => {
      const modernjsConfig = api.getConfig();
      api.config(() => {
        return {
          tools: {
            rspack(config, { isServer }) {
              const browserPluginOptions =
                internalModernPluginOptions.csrConfig as MFPluginOptions.ModuleFederationPluginOptions;
              if (!isServer) {
                internalModernPluginOptions.browserPlugin =
                  new RspackModuleFederationPlugin(browserPluginOptions);
                config.plugins?.push(internalModernPluginOptions.browserPlugin);
              }
            },
            webpack(config, { isServer }) {
              const browserPluginOptions =
                internalModernPluginOptions.csrConfig as MFPluginOptions.ModuleFederationPluginOptions;
              if (!isServer) {
                internalModernPluginOptions.browserPlugin =
                  new WebpackModuleFederationPlugin(browserPluginOptions);
                config.plugins?.push(
                  internalModernPluginOptions.browserPlugin as WebpackPluginInstance,
                );
              }
              const enableAsyncEntry = modernjsConfig.source?.enableAsyncEntry;
              if (!enableAsyncEntry && browserPluginOptions.async !== false) {
                const asyncBoundaryPluginOptions =
                  typeof browserPluginOptions.async === 'object'
                    ? browserPluginOptions.async
                    : {
                        eager: (module) =>
                          module && /\.federation/.test(module?.request || ''),
                        excludeChunk: (chunk) =>
                          chunk.name === browserPluginOptions.name,
                      };
                config.plugins?.push(
                  new AsyncBoundaryPlugin(asyncBoundaryPluginOptions) as any,
                );
              }
            },
          },
        };
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
