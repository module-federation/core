import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPluginFuture, AppTools } from '@modern-js/app-tools';
import type { InternalModernPluginOptions } from '../types';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import UniverseEntryChunkTrackerPlugin from '@module-federation/node/universe-entry-chunk-tracker-plugin';
import { updateStatsAndManifest } from './manifest';
import { isDev } from './constant';
import logger from './logger';

export function setEnv() {
  process.env['MF_DISABLE_EMIT_STATS'] = 'true';
  process.env['MF_SSR_PRJ'] = 'true';
}

export const moduleFederationSSRPlugin = (
  pluginOptions: Required<InternalModernPluginOptions>,
): CliPluginFuture<AppTools> => ({
  name: '@modern-js/plugin-module-federation-ssr',
  pre: [
    '@modern-js/plugin-module-federation-config',
    '@modern-js/plugin-module-federation',
  ],
  setup: async (api) => {
    const modernjsConfig = api.getConfig();
    const enableSSR =
      pluginOptions.userConfig?.ssr === false
        ? false
        : Boolean(modernjsConfig?.server?.ssr);
    if (!enableSSR) {
      return;
    }

    setEnv();

    api._internalRuntimePlugins(({ entrypoint, plugins }) => {
      if (!isDev) {
        return { entrypoint, plugins };
      }
      plugins.push({
        name: 'mfSSR',
        path: '@module-federation/modern-js/ssr-runtime',
        config: {},
      });
      return { entrypoint, plugins };
    });
    api.config(() => {
      return {
        tools: {
          rspack(config, { isServer }) {
            if (isServer) {
              // throw new Error(
              //   `${PLUGIN_IDENTIFIER} Not support rspack ssr mode yet !`,
              // );
              if (!pluginOptions.nodePlugin) {
                pluginOptions.nodePlugin = new RspackModuleFederationPlugin(
                  pluginOptions.ssrConfig,
                );
                // @ts-ignore
                config.plugins?.push(pluginOptions.nodePlugin);
              }
            } else {
              pluginOptions.distOutputDir =
                pluginOptions.distOutputDir ||
                config.output?.path ||
                path.resolve(process.cwd(), 'dist');
            }
          },
          webpack(config, { isServer }) {
            if (isServer) {
              if (!pluginOptions.nodePlugin) {
                pluginOptions.nodePlugin = new ModuleFederationPlugin(
                  pluginOptions.ssrConfig,
                );
                // @ts-ignore
                config.plugins?.push(pluginOptions.nodePlugin);
              }
            } else {
              pluginOptions.distOutputDir =
                pluginOptions.distOutputDir ||
                config.output?.path ||
                path.resolve(process.cwd(), 'dist');
            }
          },
          devServer: {
            before: [
              (req, res, next) => {
                if (!enableSSR) {
                  next();
                  return;
                }
                try {
                  if (
                    req.url?.includes('.json') &&
                    !req.url?.includes('hot-update')
                  ) {
                    const filepath = path.join(process.cwd(), `dist${req.url}`);
                    fs.statSync(filepath);
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader(
                      'Access-Control-Allow-Methods',
                      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                    );
                    res.setHeader('Access-Control-Allow-Headers', '*');
                    fs.createReadStream(filepath).pipe(res);
                  } else {
                    next();
                  }
                } catch (err) {
                  logger.debug(err);
                  next();
                }
              },
            ],
          },
          bundlerChain(chain, { isServer }) {
            if (isServer) {
              chain.target('async-node');
              if (isDev) {
                chain
                  .plugin('UniverseEntryChunkTrackerPlugin')
                  .use(UniverseEntryChunkTrackerPlugin);
              }
            }
            if (isDev && !isServer) {
              chain.externals({
                '@module-federation/node/utils': 'NOT_USED_IN_BROWSER',
              });
            }
          },
        },
      };
    });
    api.onAfterBuild(() => {
      const { nodePlugin, browserPlugin, distOutputDir } = pluginOptions;
      updateStatsAndManifest(nodePlugin, browserPlugin, distOutputDir);
    });
    api.onDevCompileDone(() => {
      const { nodePlugin, browserPlugin, distOutputDir } = pluginOptions;
      updateStatsAndManifest(nodePlugin, browserPlugin, distOutputDir);
    });
  },
});

export default moduleFederationSSRPlugin;
