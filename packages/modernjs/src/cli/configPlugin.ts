import path from 'path';
import type {
  CliPlugin,
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
}) {
  const { mfConfig, config, isServer, modernjsConfig, bundlerType } = options;

  patchMFConfig(mfConfig, isServer);

  // let browserPlugin: BundlerPlugin | undefined = undefined;
  // let nodePlugin: BundlerPlugin | undefined= undefined;
  // let distOutputDir = '';
  // const envConfig = getTargetEnvConfig(mfConfig, isServer);
  // if (isServer) {
  //   // nodePlugin = new MFBundlerPlugin(envConfig);
  //   // config.plugins?.push(nodePlugin);
  //   config.plugins?.push(new StreamingTargetPlugin(mfConfig));
  //   if (isDev) {
  //     config.plugins?.push(new EntryChunkTrackerPlugin());
  //   }
  // } else {
  //   // distOutputDir =
  //   //   config.output?.path || path.resolve(process.cwd(), 'dist');
  //   // browserPlugin = new MFBundlerPlugin(envConfig);
  //   // config.plugins?.push(browserPlugin);
  // }

  patchBundlerConfig({
    bundlerConfig: config,
    isServer,
    modernjsConfig,
    mfConfig,
  });

  if (bundlerType === 'webpack') {
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push((warning) => {
      if (warning.message.includes('external script')) {
        return true;
      }
      return false;
    });
  }

  // return {
  //   distOutputDir
  // }
}

export const moduleFederationConfigPlugin = (
  userConfig: InternalModernPluginOptions,
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation-config',
  post: ['@modern-js/plugin-module-federation'],
  setup: async ({ useConfigContext, useAppContext }) => {
    console.log('config plugin');

    const modernjsConfig = useConfigContext();
    const mfConfig = await getMFConfig(userConfig.originPluginOptions);
    const csrConfig =
      userConfig.csrConfig || JSON.parse(JSON.stringify(mfConfig));
    const ssrConfig =
      userConfig.ssrConfig || JSON.parse(JSON.stringify(mfConfig));
    userConfig.ssrConfig = ssrConfig;
    userConfig.csrConfig = csrConfig;

    return {
      config: async () => {
        const bundlerType =
          useAppContext().bundlerType === 'rspack' ? 'rspack' : 'webpack';
        const ipv4 = getIPV4();

        return {
          tools: {
            rspack(config, { isServer }) {
              modifyBundlerConfig({
                bundlerType,
                mfConfig: isServer ? ssrConfig : csrConfig,
                config,
                isServer,
                modernjsConfig,
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
              });

              userConfig.distOutputDir =
                config.output?.path || path.resolve(process.cwd(), 'dist');
            },
            devServer: {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':
                  'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers':
                  'X-Requested-With, content-type, Authorization',
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
            },
          },
          dev: {
            assetPrefix: modernjsConfig?.dev?.assetPrefix
              ? modernjsConfig.dev.assetPrefix
              : true,
          },
        };
      },
    };
  },
});

export default moduleFederationConfigPlugin;
