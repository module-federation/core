import path from 'path';
import type { CliPluginFuture, AppTools } from '@modern-js/app-tools';
import type { InternalModernPluginOptions } from '../types';
import {
  patchBundlerConfig,
  getIPV4,
  getMFConfig,
  patchMFConfig,
  addMyTypes2Ignored,
  isWebTarget,
} from './utils';

export function setEnv(enableSSR: boolean) {
  if (enableSSR) {
    process.env['MF_DISABLE_EMIT_STATS'] = 'true';
    process.env['MF_SSR_PRJ'] = 'true';
  }
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
    const enableSSR =
      userConfig.userConfig?.ssr ?? Boolean(modernjsConfig?.server?.ssr);

    api.modifyBundlerChain((chain) => {
      const isWeb = isWebTarget(chain.get('target'));
      // @ts-expect-error chain type is not correct
      addMyTypes2Ignored(chain, isWeb ? ssrConfig : csrConfig);

      const targetMFConfig = isWeb ? ssrConfig : csrConfig;
      patchMFConfig(
        targetMFConfig,
        isWeb,
        userConfig.remoteIpStrategy || 'ipv4',
      );

      patchBundlerConfig({
        // @ts-expect-error chain type is not correct
        chain,
        isServer: isWeb,
        modernjsConfig,
        mfConfig,
        enableSSR,
      });

      userConfig.distOutputDir =
        chain.output.get('path') || path.resolve(process.cwd(), 'dist');
    });
    api.config(() => {
      const bundlerType =
        api.getAppContext().bundlerType === 'rspack' ? 'rspack' : 'webpack';
      const ipv4 = getIPV4();

      if (userConfig.remoteIpStrategy === undefined) {
        if (!enableSSR) {
          userConfig.remoteIpStrategy = 'inherit';
        } else {
          userConfig.remoteIpStrategy = 'ipv4';
        }
      }

      return {
        tools: {
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
