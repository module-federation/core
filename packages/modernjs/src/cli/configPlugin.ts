import path from 'path';
import type {
  CliPluginFuture,
  AppTools,
  UserConfig,
  Bundler,
} from '@modern-js/app-tools';
import type { BundlerConfig } from '../interfaces/bundler';
import type { InternalModernPluginOptions } from '../types';
import {
  patchBundlerConfig,
  getIPV4,
  getMFConfig,
  patchMFConfig,
  addMyTypes2Ignored,
} from './utils';
import { moduleFederationPlugin } from '@module-federation/sdk';

export function setEnv(enableSSR: boolean) {
  if (enableSSR) {
    process.env['MF_DISABLE_EMIT_STATS'] = 'true';
    process.env['MF_SSR_PRJ'] = 'true';
  }
}

export function modifyBundlerConfig<T extends Bundler>(options: {
  bundlerType: Bundler;
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  config: BundlerConfig<T>;
  isServer: boolean;
  modernjsConfig: UserConfig<AppTools>;
  remoteIpStrategy?: 'ipv4' | 'inherit';
}) {
  const {
    mfConfig,
    config,
    isServer,
    modernjsConfig,
    remoteIpStrategy = 'ipv4',
    bundlerType,
  } = options;

  patchMFConfig(mfConfig, isServer, remoteIpStrategy);

  patchBundlerConfig({
    bundlerType,
    bundlerConfig: config,
    isServer,
    modernjsConfig,
    mfConfig,
  });
}

export const moduleFederationConfigPlugin = (
  userConfig: InternalModernPluginOptions,
): CliPluginFuture<AppTools> => ({
  name: '@modern-js/plugin-module-federation-config',
  pre: ['@modern-js/plugin-initialize'],
  post: ['@modern-js/plugin-module-federation'],
  setup: async (api) => {
    const modernjsConfig = api.getConfig();
    const mfConfig = await getMFConfig(userConfig.originPluginOptions);
    const csrConfig =
      userConfig.csrConfig || JSON.parse(JSON.stringify(mfConfig));
    const ssrConfig =
      userConfig.ssrConfig || JSON.parse(JSON.stringify(mfConfig));
    userConfig.ssrConfig = ssrConfig;
    userConfig.csrConfig = csrConfig;

    api.config(() => {
      const bundlerType =
        api.getAppContext().bundlerType === 'rspack' ? 'rspack' : 'webpack';
      const ipv4 = getIPV4();
      const enableSSR =
        userConfig.userConfig?.ssr === false
          ? false
          : Boolean(modernjsConfig?.server?.ssr);

      if (userConfig.remoteIpStrategy === undefined) {
        if (!enableSSR) {
          userConfig.remoteIpStrategy = 'inherit';
        } else {
          userConfig.remoteIpStrategy = 'ipv4';
        }
      }

      return {
        tools: {
          bundlerChain(chain, { isServer }) {
            addMyTypes2Ignored(chain, isServer ? ssrConfig : csrConfig);
          },
          rspack(config, { isServer }) {
            modifyBundlerConfig({
              bundlerType,
              mfConfig: isServer ? ssrConfig : csrConfig,
              config,
              isServer,
              modernjsConfig,
              remoteIpStrategy: userConfig.remoteIpStrategy,
            });
            userConfig.distOutputDir =
              config.output?.path || path.resolve(process.cwd(), 'dist');
          },
          webpack(config, { isServer }) {
            modifyBundlerConfig({
              bundlerType,
              mfConfig: isServer ? ssrConfig : csrConfig,
              config,
              isServer,
              modernjsConfig,
              remoteIpStrategy: userConfig.remoteIpStrategy,
            });

            userConfig.distOutputDir =
              config.output?.path || path.resolve(process.cwd(), 'dist');
          },
          devServer: {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods':
                'GET, POST, PUT, DELETE, PATCH, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
          },
        },
        source: {
          alias: {
            '@modern-js/runtime/mf': require.resolve(
              '@module-federation/modern-js/runtime',
            ),
          },
          define: {
            FEDERATION_IPV4: JSON.stringify(ipv4),
            REMOTE_IP_STRATEGY: JSON.stringify(userConfig.remoteIpStrategy),
          },
          enableAsyncEntry:
            bundlerType === 'rspack'
              ? (modernjsConfig.source?.enableAsyncEntry ?? true)
              : modernjsConfig.source?.enableAsyncEntry,
        },
        dev: {
          assetPrefix: modernjsConfig?.dev?.assetPrefix
            ? modernjsConfig.dev.assetPrefix
            : true,
        },
      };
    });
  },
});

export default moduleFederationConfigPlugin;
