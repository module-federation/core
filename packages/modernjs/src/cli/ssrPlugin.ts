import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPluginFuture, AppTools } from '@modern-js/app-tools';
import type { InternalModernPluginOptions } from '../types';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import UniverseEntryChunkTrackerPlugin from '@module-federation/node/universe-entry-chunk-tracker-plugin';
import { updateStatsAndManifest } from './manifest';
import { isDev } from './constant';
import { MODERN_JS_SERVER_DIR } from '../constant';
import logger from './logger';
import { isWebTarget } from './utils';

export function setEnv() {
  process.env['MF_DISABLE_EMIT_STATS'] = 'true';
  process.env['MF_SSR_PRJ'] = 'true';
}
export const CHAIN_MF_PLUGIN_ID = 'plugin-module-federation-server';
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
      pluginOptions.userConfig?.ssr ?? Boolean(modernjsConfig?.server?.ssr);
    let csrOutputPath = '';
    let ssrOutputPath = '';

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
    api.modifyBundlerChain((chain, { isServer }) => {
      const bundlerType =
        api.getAppContext().bundlerType === 'rspack' ? 'rspack' : 'webpack';
      const MFPlugin =
        bundlerType === 'webpack'
          ? ModuleFederationPlugin
          : RspackModuleFederationPlugin;

      const isWeb = isWebTarget(chain.get('target'));

      if (!isWeb) {
        if (!chain.plugins.has(CHAIN_MF_PLUGIN_ID)) {
          chain
            .plugin(CHAIN_MF_PLUGIN_ID)
            .use(MFPlugin, [pluginOptions.ssrConfig])
            .init((Plugin: typeof MFPlugin, args) => {
              pluginOptions.nodePlugin = new Plugin(args[0]);
              return pluginOptions.nodePlugin;
            });
        }
      }

      if (!isWeb) {
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

      if (isServer) {
        ssrOutputPath =
          chain.output.get('path') ||
          path.resolve(process.cwd(), `dist/${MODERN_JS_SERVER_DIR}`);
      } else {
        csrOutputPath =
          chain.output.get('path') || path.resolve(process.cwd(), 'dist');
      }
    });
    api.config(() => {
      return {
        tools: {
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
        },
      };
    });
    api.onAfterBuild(() => {
      const { nodePlugin, browserPlugin, distOutputDir } = pluginOptions;
      updateStatsAndManifest(
        nodePlugin,
        browserPlugin,
        distOutputDir,
        path.relative(csrOutputPath, ssrOutputPath),
      );
    });
    api.onDevCompileDone(() => {
      const { nodePlugin, browserPlugin, distOutputDir } = pluginOptions;
      updateStatsAndManifest(
        nodePlugin,
        browserPlugin,
        distOutputDir,
        path.relative(csrOutputPath, ssrOutputPath),
      );
    });
  },
});

export default moduleFederationSSRPlugin;
