import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { StreamingTargetPlugin } from '@module-federation/node';
import type { PluginOptions } from '../types';
import { getMFConfig, patchMFConfig } from './utils';
import { updateStatsAndManifest } from './manifest';
import { MODERN_JS_SERVER_DIR } from '../constant';

export const moduleFederationPlugin = (
  userConfig: PluginOptions = {},
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation',
  setup: async ({ useConfigContext }) => {
    const useConfig = useConfigContext();
    const enableSSR = Boolean(useConfig?.server?.ssr);
    const isStreamSSR =
      typeof useConfig?.server?.ssr === 'object'
        ? useConfig?.server?.ssr?.mode === 'stream'
        : false;
    const mfConfig = await getMFConfig(userConfig);
    let outputDir = '';

    let browserPlugin: ModuleFederationPlugin;
    let nodePlugin: ModuleFederationPlugin;
    return {
      config: () => {
        if (enableSSR) {
          process.env['MF_DISABLE_EMIT_STATS'] = 'true';
        }
        return {
          tools: {
            webpack(config, { isServer }) {
              delete config.optimization?.runtimeChunk;
              patchMFConfig(mfConfig);
              if (isServer) {
                nodePlugin = new ModuleFederationPlugin({
                  library: {
                    type: 'commonjs-module',
                    name: mfConfig.name,
                  },
                  ...mfConfig,
                });
                config.plugins?.push(nodePlugin);
                config.plugins?.push(new StreamingTargetPlugin(mfConfig));
              } else {
                outputDir =
                  config.output?.path || path.resolve(process.cwd(), 'dist');
                browserPlugin = new ModuleFederationPlugin(mfConfig);
                config.plugins?.push(browserPlugin);

                if (
                  enableSSR &&
                  isStreamSSR &&
                  typeof config.optimization?.splitChunks === 'object' &&
                  config.optimization.splitChunks.cacheGroups
                ) {
                  config.optimization.splitChunks.chunks = 'async';
                  console.warn(
                    '[Modern.js Module Federation] splitChunks.chunks = async is not allowed with stream SSR mode, it will auto changed to "async"',
                  );
                }
              }

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

              if (config.output?.publicPath === 'auto') {
                // TODO: only in dev temp
                const port =
                  useConfig.dev?.port || useConfig.server?.port || 8080;
                const publicPath = `http://localhost:${port}/`;
                config.output.publicPath = publicPath;
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
                      req.url?.includes('remoteEntry.js') ||
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
