import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { StreamingTargetPlugin } from '@module-federation/node';
import type {
  PluginOptions,
  BundlerPluginImplementation,
  BundlerPlugin,
} from '../types';
import {
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
  setup: async ({ useConfigContext }) => {
    const useConfig = useConfigContext();
    const enableSSR = Boolean(useConfig?.server?.ssr);
    const mfConfig = await getMFConfig(userConfig);
    let outputDir = '';

    const PluginConstructor: BundlerPluginImplementation =
      userConfig.bundlerPluginImplementation || ModuleFederationPlugin;
    let browserPlugin: BundlerPlugin;
    let nodePlugin: BundlerPlugin;
    return {
      config: () => {
        if (enableSSR) {
          process.env['MF_DISABLE_EMIT_STATS'] = 'true';
        }
        return {
          tools: {
            webpack(config, { isServer }) {
              const envConfig = getTargetEnvConfig(mfConfig, isServer);
              if (isServer) {
                nodePlugin = new PluginConstructor(envConfig);
                // @ts-ignore
                config.plugins?.push(nodePlugin);
                config.plugins?.push(new StreamingTargetPlugin(envConfig));
              } else {
                outputDir =
                  config.output?.path || path.resolve(process.cwd(), 'dist');
                browserPlugin = new PluginConstructor(envConfig);
                // @ts-ignore
                config.plugins?.push(browserPlugin);
              }

              patchWebpackConfig({
                config,
                isServer,
                useConfig,
              });

              const enableAsyncEntry = useConfig.source?.enableAsyncEntry;
              if (!enableAsyncEntry && mfConfig.async) {
                const asyncBoundaryPluginOptions = {
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
