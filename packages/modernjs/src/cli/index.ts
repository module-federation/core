import path from 'path';
import { fs } from '@modern-js/utils';
import type {
  CliPlugin,
  AppTools,
  webpack,
  Rspack,
} from '@modern-js/app-tools';
import {
  ModuleFederationPlugin as WebpackModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { StreamingTargetPlugin } from '@module-federation/node';
import type { PluginOptions, BundlerPlugin } from '../types';
import {
  ConfigType,
  getMFConfig,
  getTargetEnvConfig,
  patchMFConfig,
  patchWebpackConfig,
} from './utils';
import { updateStatsAndManifest } from './manifest';
import { MODERN_JS_SERVER_DIR } from '../constant';

export const moduleFederationPlugin = (
  userConfig: PluginOptions = {},
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation',
  setup: async ({ useConfigContext, useAppContext }) => {
    const useConfig = useConfigContext();
    const enableSSR = Boolean(useConfig?.server?.ssr);
    const mfConfig = await getMFConfig(userConfig);
    let outputDir = '';
    const bundlerType =
      useAppContext().bundlerType === 'rspack' ? 'rspack' : 'webpack';

    const WebpackPluginConstructor =
      userConfig.webpackPluginImplementation || WebpackModuleFederationPlugin;
    const RspackPluginConstructor =
      userConfig.webpackPluginImplementation || RspackModuleFederationPlugin;

    const MFBundlerPlugin =
      bundlerType === 'rspack'
        ? RspackPluginConstructor
        : WebpackPluginConstructor;

    let browserPlugin: BundlerPlugin;
    let nodePlugin: BundlerPlugin;
    return {
      config: () => {
        if (enableSSR) {
          process.env['MF_DISABLE_EMIT_STATS'] = 'true';
          process.env['MF_SSR_PRJ'] = 'true';
        }

        const modifyBundlerConfig = <T extends 'webpack' | 'rspack'>(
          config: ConfigType<T>,
          isServer: boolean,
        ) => {
          const envConfig = getTargetEnvConfig(mfConfig, isServer);
          if (isServer) {
            nodePlugin = new MFBundlerPlugin(envConfig);
            // @ts-ignore
            config.plugins?.push(nodePlugin);
            // @ts-ignore
            config.plugins?.push(new StreamingTargetPlugin(envConfig));
          } else {
            outputDir =
              config.output?.path || path.resolve(process.cwd(), 'dist');
            browserPlugin = new MFBundlerPlugin(envConfig);
            // @ts-ignore
            config.plugins?.push(browserPlugin);
          }

          patchWebpackConfig({
            config,
            isServer,
            useConfig,
          });
        };

        return {
          tools: {
            rspack(config) {
              // not support ssr yet
              modifyBundlerConfig(config, false);
            },
            webpack(config, { isServer }) {
              modifyBundlerConfig(config, isServer);
              const enableAsyncEntry = useConfig.source?.enableAsyncEntry;
              if (
                mfConfig.async ||
                (!enableAsyncEntry && mfConfig.async !== false)
              ) {
                const asyncBoundaryPluginOptions =
                  typeof mfConfig.async === 'object'
                    ? mfConfig.async
                    : {
                        eager: (module) =>
                          module && /\.federation/.test(module?.request || ''),
                        excludeChunk: (chunk) => chunk.name === mfConfig.name,
                      };
                config.plugins?.push(
                  new AsyncBoundaryPlugin(asyncBoundaryPluginOptions),
                );
              }
            },
            devServer: {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':
                  'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers':
                  'X-Requested-With, content-type, Authorization',
              },
              before: [
                (req, res, next) => {
                  if (!enableSSR) {
                    next();
                    return;
                  }
                  try {
                    const SERVER_PREFIX = `/${MODERN_JS_SERVER_DIR}`;
                    if (
                      req.url?.startsWith(SERVER_PREFIX) ||
                      req.url?.includes('.json')
                    ) {
                      const filepath = path.join(
                        process.cwd(),
                        `dist${req.url}`,
                      );
                      fs.statSync(filepath);
                      res.setHeader('Access-Control-Allow-Origin', '*');
                      res.setHeader(
                        'Access-Control-Allow-Methods',
                        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                      );
                      res.setHeader(
                        'Access-Control-Allow-Headers',
                        'X-Requested-With, content-type, Authorization',
                      );
                      fs.createReadStream(filepath).pipe(res);
                    } else {
                      next();
                    }
                  } catch (err) {
                    console.error(err);
                    next();
                  }
                },
              ],
            },
          },
          source: {
            alias: {
              '@modern-js/runtime/mf': require.resolve(
                '@module-federation/modern-js/runtime',
              ),
            },
          },
          dev: {
            assetPrefix: useConfig?.dev?.assetPrefix
              ? useConfig.dev.assetPrefix
              : true,
          },
        };
      },
      afterBuild: () => {
        if (enableSSR) {
          updateStatsAndManifest(nodePlugin, browserPlugin, outputDir);
        }
      },
      afterDev: () => {
        if (enableSSR) {
          updateStatsAndManifest(nodePlugin, browserPlugin, outputDir);
        }
      },
    };
  },
});

export default moduleFederationPlugin;

export { createModuleFederationConfig } from '@module-federation/enhanced';
