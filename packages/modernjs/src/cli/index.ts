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
    const userModernJSConfig = useConfigContext();
    const enableSSR = Boolean(userModernJSConfig?.server?.ssr);
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
              patchMFConfig(mfConfig, isServer);
              if (isServer) {
                nodePlugin = new ModuleFederationPlugin(mfConfig);
                config.plugins?.push(nodePlugin);
                config.plugins?.push(new StreamingTargetPlugin(mfConfig));
              } else {
                outputDir =
                  config.output?.path || path.resolve(process.cwd(), 'dist');
                browserPlugin = new ModuleFederationPlugin(mfConfig);
                config.plugins?.push(browserPlugin);
              }

              if (mfConfig.async) {
                const asyncBoundaryPluginOptions = {
                  eager: /.federation\/entry/,
                  excludeChunk: (chunk) => chunk.name === mfConfig.name,
                };
                config.plugins?.push(
                  new AsyncBoundaryPlugin(asyncBoundaryPluginOptions),
                );
              }

              if (config.output?.publicPath === 'auto') {
                // TODO: only in dev temp
                const port =
                  userModernJSConfig.dev?.port ||
                  userModernJSConfig.server?.port ||
                  8080;
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
