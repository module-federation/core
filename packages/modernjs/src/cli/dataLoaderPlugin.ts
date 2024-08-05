import path from 'path';
import { fs, NESTED_ROUTE_SPEC_FILE } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import type { DataLoaderOptions, InternalModernPluginOptions } from '../types';
import { transformName2Prefix } from '../runtime/utils';
import { PLUGIN_IDENTIFIER } from '../constant';
import { MF_ROUTES_KEY, MF_ROUTE_META_KEY } from '../runtime/constant';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { MFModernRouteJson, Route } from '../interfaces/route';

const MF_MODERN_ROUTE_JSON = 'mf-modern-route.json';
function writeMFModernRouteJson({
  routeJsonPath,
  baseName,
  name,
}: {
  name: string;
  routeJsonPath: string;
  baseName: string;
}) {
  const excludeKeys = ['_component'];
  const routeJson = fs.readFileSync(routeJsonPath, 'utf-8');
  const routeJsonContent = JSON.parse(routeJson, (key, value) => {
    if (excludeKeys.includes(key)) {
      return undefined;
    }
    if (!key) {
      return value;
    }
    return value;
  });
  const mfModernRouteJson: MFModernRouteJson = {
    routes: routeJsonContent,
    baseName,
    prefix: transformName2Prefix(name),
  };
  const distDir = path.dirname(routeJsonPath);
  const filePath = path.join(distDir, MF_MODERN_ROUTE_JSON);
  fs.writeFileSync(filePath, JSON.stringify(mfModernRouteJson, null, 2));
}

function addExpose(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  baseName: string,
  pkgName: string,
) {
  const mfMetaExposeFilePath = path.join(
    process.cwd(),
    './node_modules/.federation/routeMeta.js',
  );
  fs.ensureDirSync(path.dirname(mfMetaExposeFilePath));
  fs.writeFileSync(
    mfMetaExposeFilePath,
    `export const baseName = '${baseName}';export const prefix = '${transformName2Prefix(mfConfig.name!)}';`,
  );
  const routesExposeKey = `./${MF_ROUTES_KEY}`;
  const routeMetaKey = `./${MF_ROUTE_META_KEY}`;
  if (!mfConfig.exposes) {
    mfConfig.exposes = {
      [routesExposeKey]: `./node_modules/.${pkgName}/main/routes.js`,
      [routeMetaKey]: mfMetaExposeFilePath,
    };
  } else {
    if (!Array.isArray(mfConfig.exposes)) {
      if (!mfConfig.exposes[routesExposeKey]) {
        mfConfig.exposes[routesExposeKey] =
          `./node_modules/.${pkgName}/main/routes.js`;
      }
      if (!mfConfig.exposes[routeMetaKey]) {
        mfConfig.exposes[routeMetaKey] = mfMetaExposeFilePath;
      }
    }
  }
}
function addShared(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  pkgName: string,
) {
  const alias = `@${pkgName}/runtime/router`;
  if (!mfConfig.shared) {
    mfConfig.shared = {
      [alias]: { singleton: true },
    };
  } else {
    if (!Array.isArray(mfConfig.shared)) {
      mfConfig.shared[alias] = { singleton: true };
    } else {
      mfConfig.shared.push(alias);
    }
  }
}

function _pathMfConfig(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  baseName: string,
  pkgName: string,
) {
  addShared(mfConfig, pkgName);
  addExpose(mfConfig, baseName, pkgName);
}

async function _fetchSSRByRouteIds(
  partialSSRRemotes: string[],
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
): Promise<undefined | string[]> {
  if (!mfConfig.remotes || !Object.keys(mfConfig.remotes).length) {
    return undefined;
  }
  if (!partialSSRRemotes.length) {
    return undefined;
  }

  const remoteMfModernRouteJsonUrls = Object.entries(mfConfig.remotes).map(
    (item) => {
      const [_key, config] = item as [
        string,
        (
          | moduleFederationPlugin.RemotesConfig
          | moduleFederationPlugin.RemotesItem
        ),
      ];
      const entry =
        typeof config === 'string' ? config : (config.external as string);
      const [_name, url] = entry.split('@');
      const mfModernRouteJsonUrl = url.replace(
        new URL(url.startsWith('//') ? `http:${url}` : url).pathname,
        `/${MF_MODERN_ROUTE_JSON}`,
      );
      return mfModernRouteJsonUrl;
    },
  );

  const remoteProviderRouteIds: Set<string> = new Set();
  await Promise.all(
    remoteMfModernRouteJsonUrls.map(async (url) => {
      const rep = await fetch(url);
      const routeJson: MFModernRouteJson =
        (await rep.json()) as MFModernRouteJson;
      const prefix = routeJson.prefix;
      const collectIds = (route: Route) => {
        remoteProviderRouteIds.add(`${prefix}${route.id}`);
        if (route.children) {
          route.children.forEach((r) => {
            collectIds(r);
          });
        }
      };
      Object.values(routeJson.routes).forEach((routeArr) => {
        routeArr.forEach((r) => collectIds(r));
      });
    }),
  );
  console.log(111, [...remoteProviderRouteIds]);
  return [...remoteProviderRouteIds];
}

export const moduleFederationDataLoaderPlugin = (
  enable: boolean,
  internalOptions: InternalModernPluginOptions,
  userConfig: DataLoaderOptions,
): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation-data-loader',
  pre: ['@modern-js/plugin-module-federation-config'],
  post: ['@modern-js/plugin-router', '@modern-js/plugin-module-federation'],
  setup: async ({ useConfigContext }) => {
    if (!enable) {
      return;
    }
    const {
      baseName,
      partialSSRRemotes = [],
      fetchSSRByRouteIds,
      patchMFConfig,
      pkgName = 'modern-js',
    } = userConfig;

    if (!baseName) {
      throw new Error(
        `${PLUGIN_IDENTIFIER} 'baseName' is required if you enable 'dataLoader'!`,
      );
    }
    const modernjsConfig = useConfigContext();
    const enableSSR = Boolean(modernjsConfig?.server?.ssr);
    let routeJsonPath = '';
    const name = internalOptions.csrConfig?.name!;
    return {
      _internalRuntimePlugins: ({ entrypoint, plugins }) => {
        plugins.push({
          name: 'ssrDataLoader',
          path: '@module-federation/modern-js/data-loader',
          config: {},
        });
        return { entrypoint, plugins };
      },
      config: async () => {
        console.log('dataloader plugin config');

        const fetchFn = fetchSSRByRouteIds || _fetchSSRByRouteIds;
        const ssrByRouteIds = await fetchFn(
          partialSSRRemotes,
          internalOptions.csrConfig!,
        );
        console.log('ssrByRouteIds: ', ssrByRouteIds);
        const patchMFConfigFn = patchMFConfig || _pathMfConfig;
        return {
          server: {
            ssrByRouteIds: ssrByRouteIds,
          },
          tools: {
            rspack(_config, { isServer }) {
              if (isServer) {
                patchMFConfigFn(internalOptions.ssrConfig!, baseName, pkgName);
              } else {
                patchMFConfigFn(internalOptions.csrConfig!, baseName, pkgName);
              }
              console.log('dataloader plugin rspack');
            },
            bundlerChain(chain, { isServer }) {
              if (!isServer) {
                routeJsonPath = path.join(
                  chain.output.get('path'),
                  NESTED_ROUTE_SPEC_FILE,
                );
              }
            },
            devServer: {
              before: [
                (req, res, next) => {
                  try {
                    if (
                      // ssrPlugin will host .json file, so just handle csr case
                      !enableSSR &&
                      req.url?.includes(MF_MODERN_ROUTE_JSON)
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
          },
          source: {
            define: {
              MODERN_ROUTER_ID_PREFIX: JSON.stringify(
                transformName2Prefix(name),
              ),
            },
          },
        };
      },

      afterBuild: () => {
        writeMFModernRouteJson({ routeJsonPath, baseName: baseName, name });
      },
      afterDev: () => {
        writeMFModernRouteJson({ routeJsonPath, baseName: baseName, name });
      },
    };
  },
});

export default moduleFederationDataLoaderPlugin;
