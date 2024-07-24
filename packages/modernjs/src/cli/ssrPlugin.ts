import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import type { InternalModernPluginOptions } from '../types';
import { ModuleFederationPlugin } from '@module-federation/enhanced';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { EntryChunkTrackerPlugin } from '@module-federation/node';
import { updateStatsAndManifest } from './manifest';
import { MODERN_JS_SERVER_DIR, PLUGIN_IDENTIFIER } from '../constant';
import { isDev } from './constant';

export function setEnv() {
  process.env['MF_DISABLE_EMIT_STATS'] = 'true';
  process.env['MF_SSR_PRJ'] = 'true';
}

export const moduleFederationSSRPlugin = (
  userConfig: Required<InternalModernPluginOptions>,
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation-ssr',
  pre: [
    '@modern-js/plugin-module-federation-config',
    '@modern-js/plugin-module-federation',
  ],
  setup: async ({ useConfigContext }) => {
    const modernjsConfig = useConfigContext();
    const enableSSR = Boolean(modernjsConfig?.server?.ssr);
    if (!enableSSR) {
      return {};
    }

    setEnv();
    return {
      _internalRuntimePlugins: ({ entrypoint, plugins }) => {
        if (!isDev) {
          return { entrypoint, plugins };
        }
        plugins.push({
          name: 'mfSSR',
          path: '@module-federation/modern-js/ssr-runtime',
          config: {},
        });
        return { entrypoint, plugins };
      },
      config: async () => {
        return {
          tools: {
            rspack(config, { isServer }) {
              if (isServer) {
                // throw new Error(
                //   `${PLUGIN_IDENTIFIER} Not support rspack ssr mode yet !`,
                // );
                if (!userConfig.nodePlugin) {
                  userConfig.nodePlugin = new RspackModuleFederationPlugin(
                    userConfig.ssrConfig,
                  );
                  // @ts-ignore
                  config.plugins?.push(userConfig.nodePlugin);
                }
              } else {
                userConfig.distOutputDir =
                  userConfig.distOutputDir ||
                  config.output?.path ||
                  path.resolve(process.cwd(), 'dist');
              }
            },
            webpack(config, { isServer }) {
              if (isServer) {
                if (!userConfig.nodePlugin) {
                  userConfig.nodePlugin = new ModuleFederationPlugin(
                    userConfig.ssrConfig,
                  );
                  // @ts-ignore
                  config.plugins?.push(userConfig.nodePlugin);
                }
                // config.plugins?.push(
                //   new StreamingTargetPlugin(userConfig.nodePlugin),
                // );
                if (isDev) {
                  config.plugins?.push(new EntryChunkTrackerPlugin());
                }
              } else {
                userConfig.distOutputDir =
                  userConfig.distOutputDir ||
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
        };
      },
      afterBuild: () => {
        const { nodePlugin, browserPlugin, distOutputDir } = userConfig;
        updateStatsAndManifest(nodePlugin, browserPlugin, distOutputDir);
      },
      afterDev: () => {
        const { nodePlugin, browserPlugin, distOutputDir } = userConfig;
        updateStatsAndManifest(nodePlugin, browserPlugin, distOutputDir);
      },
    };
  },
});

export default moduleFederationSSRPlugin;
