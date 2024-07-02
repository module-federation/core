import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin as WebpackModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import {
  StreamingTargetPlugin,
  EntryChunkTrackerPlugin,
} from '@module-federation/node';
import type { PluginOptions, BundlerPlugin } from '../types';
import {
  ConfigType,
  getMFConfig,
  getTargetEnvConfig,
  patchWebpackConfig,
  getIPV4,
} from './utils';
import { updateStatsAndManifest } from './manifest';
import { MODERN_JS_SERVER_DIR, PLUGIN_IDENTIFIER } from '../constant';

const SSR_PLUGIN_IDENTIFIER = 'mfPluginSSR';
const isDev = process.env.NODE_ENV === 'development';

export const moduleFederationPlugin = (
  userConfig: PluginOptions = {},
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation',
  setup: async ({ useConfigContext, useAppContext }) => {
    const modernjsConfig = useConfigContext();
    const enableSSR = Boolean(modernjsConfig?.server?.ssr);
    const mfConfig = await getMFConfig(userConfig);
    let outputDir = '';

    let browserPlugin: BundlerPlugin;
    let nodePlugin: BundlerPlugin;
    return {
      config: async () => {
        const bundlerType =
          useAppContext().bundlerType === 'rspack' ? 'rspack' : 'webpack';

        const WebpackPluginConstructor =
          userConfig.webpackPluginImplementation ||
          WebpackModuleFederationPlugin;
        const RspackPluginConstructor =
          userConfig.rspackPluginImplementation || RspackModuleFederationPlugin;

        const MFBundlerPlugin =
          bundlerType === 'rspack'
            ? RspackPluginConstructor
            : WebpackPluginConstructor;

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
            // @ts-expect-error the compiler version can not be equal, so it usually throw type errors
            config.plugins?.push(nodePlugin);
            // @ts-expect-error the compiler version can not be equal, so it usually throw type errors
            config.plugins?.push(new StreamingTargetPlugin(envConfig));
            if (isDev) {
              // @ts-expect-error the compiler version can not be equal, so it usually throw type errors
              config.plugins?.push(new EntryChunkTrackerPlugin());
            }
          } else {
            outputDir =
              config.output?.path || path.resolve(process.cwd(), 'dist');
            browserPlugin = new MFBundlerPlugin(envConfig);
            // @ts-expect-error the compiler version can not be equal, so it usually throw type errors
            config.plugins?.push(browserPlugin);
          }

          patchWebpackConfig({
            bundlerConfig: config,
            isServer,
            modernjsConfig,
            mfConfig: envConfig,
          });
        };

        const ipv4 = getIPV4();

        return {
          tools: {
            rspack(config) {
              if (enableSSR) {
                throw new Error(
                  `${PLUGIN_IDENTIFIER} not support ssr for rspack bundler yet!`,
                );
              }
              modifyBundlerConfig(config, false);
            },
            webpack(config, { isServer }) {
              // @ts-ignore
              modifyBundlerConfig(config, isServer);
              const enableAsyncEntry = modernjsConfig.source?.enableAsyncEntry;
              if (!enableAsyncEntry && mfConfig.async !== false) {
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
              config.ignoreWarnings = config.ignoreWarnings || [];
              config.ignoreWarnings.push((warning) => {
                if (warning.message.includes('external script')) {
                  return true;
                }
                return false;
              });
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
                      (req.url?.includes('.json') &&
                        !req.url?.includes('hot-update'))
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
                    if (process.env.FEDERATION_DEBUG) {
                      console.error(err);
                    }
                    next();
                  }
                },
              ],
            },
            bundlerChain(chain, { isServer }) {
              if (isDev && !isServer) {
                chain.externals({
                  '@module-federation/node/utils': 'NOT_USED_IN_BROWSER',
                });
              }
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
      modifyEntryImports({ entrypoint, imports }: any) {
        if (!enableSSR || !isDev) {
          return {
            entrypoint,
            imports,
          };
        }
        imports.push({
          value: '@module-federation/modern-js/ssr-runtime',
          specifiers: [{ imported: SSR_PLUGIN_IDENTIFIER }],
        });

        return {
          entrypoint,
          imports,
        };
      },

      modifyEntryRuntimePlugins({ entrypoint, plugins }) {
        if (!enableSSR || !isDev) {
          return {
            entrypoint,
            plugins,
          };
        }

        plugins.unshift({
          name: SSR_PLUGIN_IDENTIFIER,
          options: JSON.stringify({}),
        });

        return {
          entrypoint,
          plugins,
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
