import type {
  webpack,
  UserConfig,
  AppTools,
  Rspack,
  Bundler,
} from '@modern-js/app-tools';
import { moduleFederationPlugin, encodeName } from '@module-federation/sdk';
import path from 'path';
import os from 'os';
import { bundle } from '@modern-js/node-bundle-require';
import { PluginOptions } from '../types';
import { LOCALHOST, PLUGIN_IDENTIFIER } from '../constant';
import { BundlerConfig } from '../interfaces/bundler';

const defaultPath = path.resolve(process.cwd(), 'module-federation.config.ts');
const isDev = process.env.NODE_ENV === 'development';

export type ConfigType<T> = T extends 'webpack'
  ? webpack.Configuration
  : T extends 'rspack'
    ? Rspack.Configuration
    : never;

export const getMFConfig = async (
  userConfig: PluginOptions,
): Promise<moduleFederationPlugin.ModuleFederationPluginOptions> => {
  const { config, configPath } = userConfig;
  if (config) {
    return config;
  }
  const mfConfigPath = configPath ? configPath : defaultPath;

  const preBundlePath = await bundle(mfConfigPath);
  const mfConfig = (await import(preBundlePath))
    .default as unknown as moduleFederationPlugin.ModuleFederationPluginOptions;

  return mfConfig;
};

const injectRuntimePlugins = (
  runtimePlugin: string,
  runtimePlugins: string[],
): void => {
  if (!runtimePlugins.includes(runtimePlugin)) {
    runtimePlugins.push(runtimePlugin);
  }
};

const replaceRemoteUrl = (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  remoteIpStrategy?: 'ipv4' | 'inherit',
) => {
  if (remoteIpStrategy && remoteIpStrategy === 'inherit') {
    return;
  }
  if (!mfConfig.remotes) {
    return;
  }
  const ipv4 = getIPV4();
  const handleRemoteObject = (
    remoteObject: moduleFederationPlugin.RemotesObject,
  ) => {
    Object.keys(remoteObject).forEach((remoteKey) => {
      const remote = remoteObject[remoteKey];
      // no support array items yet
      if (Array.isArray(remote)) {
        return;
      }
      if (typeof remote === 'string' && remote.includes(LOCALHOST)) {
        remoteObject[remoteKey] = remote.replace(LOCALHOST, ipv4);
      }
      if (
        typeof remote === 'object' &&
        !Array.isArray(remote.external) &&
        remote.external.includes(LOCALHOST)
      ) {
        remote.external = remote.external.replace(LOCALHOST, ipv4);
      }
    });
  };
  if (Array.isArray(mfConfig.remotes)) {
    mfConfig.remotes.forEach((remoteObject) => {
      if (typeof remoteObject === 'string') {
        return;
      }
      handleRemoteObject(remoteObject);
    });
  } else if (typeof mfConfig.remotes !== 'string') {
    handleRemoteObject(mfConfig.remotes);
  }
};

const patchDTSConfig = (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  isServer: boolean,
) => {
  if (isServer) {
    return;
  }
  const ModernJSRuntime = '@modern-js/runtime/mf';
  if (mfConfig.dts !== false) {
    if (typeof mfConfig.dts === 'boolean' || mfConfig.dts === undefined) {
      mfConfig.dts = {
        consumeTypes: {
          runtimePkgs: [ModernJSRuntime],
        },
      };
    } else if (
      mfConfig.dts?.consumeTypes ||
      mfConfig.dts?.consumeTypes === undefined
    ) {
      if (
        typeof mfConfig.dts.consumeTypes === 'boolean' ||
        mfConfig.dts?.consumeTypes === undefined
      ) {
        mfConfig.dts.consumeTypes = {
          runtimePkgs: [ModernJSRuntime],
        };
      } else {
        mfConfig.dts.consumeTypes.runtimePkgs =
          mfConfig.dts.consumeTypes.runtimePkgs || [];
        if (!mfConfig.dts.consumeTypes.runtimePkgs.includes(ModernJSRuntime)) {
          mfConfig.dts.consumeTypes.runtimePkgs.push(ModernJSRuntime);
        }
      }
    }
  }
};

export const patchMFConfig = (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  isServer: boolean,
  remoteIpStrategy?: 'ipv4' | 'inherit',
) => {
  replaceRemoteUrl(mfConfig, remoteIpStrategy);
  if (mfConfig.remoteType === undefined) {
    mfConfig.remoteType = 'script';
  }
  if (!mfConfig.name) {
    throw new Error(`${PLUGIN_IDENTIFIER} mfConfig.name can not be empty!`);
  }
  const runtimePlugins = [...(mfConfig.runtimePlugins || [])];

  patchDTSConfig(mfConfig, isServer);

  injectRuntimePlugins(
    path.resolve(__dirname, './mfRuntimePlugins/shared-strategy.js'),
    runtimePlugins,
  );

  if (isDev) {
    injectRuntimePlugins(
      path.resolve(__dirname, './mfRuntimePlugins/resolve-entry-ipv4.js'),
      runtimePlugins,
    );
  }

  if (isServer) {
    injectRuntimePlugins(
      require.resolve('@module-federation/node/runtimePlugin'),
      runtimePlugins,
    );
    if (isDev) {
      injectRuntimePlugins(
        require.resolve(
          '@module-federation/node/record-dynamic-remote-entry-hash-plugin',
        ),
        runtimePlugins,
      );
    }

    injectRuntimePlugins(
      path.resolve(__dirname, './mfRuntimePlugins/inject-node-fetch.js'),
      runtimePlugins,
    );

    if (!mfConfig.library) {
      mfConfig.library = {
        type: 'commonjs-module',
        name: mfConfig.name,
      };
    } else {
      if (!mfConfig.library.type) {
        mfConfig.library.type = 'commonjs-module';
      }
      if (!mfConfig.library.name) {
        mfConfig.library.name = mfConfig.name;
      }
    }
  }

  mfConfig.runtimePlugins = runtimePlugins;

  if (!isServer) {
    if (mfConfig.library?.type === 'commonjs-module') {
      mfConfig.library.type = 'global';
    }
    return mfConfig;
  }

  mfConfig.dts = false;
  mfConfig.dev = false;

  return mfConfig;
};

export function patchIgnoreWarning<T extends Bundler>(
  bundlerConfig: BundlerConfig<T>,
) {
  bundlerConfig.ignoreWarnings = bundlerConfig.ignoreWarnings || [];
  const ignoredMsgs = [
    'external script',
    'process.env.WS_NO_BUFFER_UTIL',
    `Can't resolve 'utf-8-validate`,
  ];
  bundlerConfig.ignoreWarnings.push((warning) => {
    if (ignoredMsgs.some((msg) => warning.message.includes(msg))) {
      return true;
    }
    return false;
  });
}
export function patchBundlerConfig<T extends Bundler>(options: {
  bundlerConfig: BundlerConfig<T>;
  isServer: boolean;
  modernjsConfig: UserConfig<AppTools>;
  bundlerType: Bundler;
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
}) {
  const { bundlerConfig, modernjsConfig, isServer, mfConfig, bundlerType } =
    options;
  const enableSSR = Boolean(modernjsConfig.server?.ssr);

  delete bundlerConfig.optimization?.runtimeChunk;

  patchIgnoreWarning(bundlerConfig);

  if (bundlerType === 'webpack') {
    bundlerConfig.watchOptions = bundlerConfig.watchOptions || {};
    if (!Array.isArray(bundlerConfig.watchOptions.ignored)) {
      if (bundlerConfig.watchOptions.ignored) {
        bundlerConfig.watchOptions.ignored = [
          bundlerConfig.watchOptions.ignored as string,
        ];
      } else {
        bundlerConfig.watchOptions.ignored = [];
      }
    }
    if (mfConfig.dts !== false) {
      if (
        typeof mfConfig.dts === 'object' &&
        typeof mfConfig.dts.consumeTypes === 'object' &&
        mfConfig.dts.consumeTypes.remoteTypesFolder
      ) {
        bundlerConfig.watchOptions.ignored.push(
          `**/${mfConfig.dts.consumeTypes.remoteTypesFolder}/**`,
        );
      } else {
        bundlerConfig.watchOptions.ignored.push('**/@mf-types/**');
      }
    } else {
      bundlerConfig.watchOptions.ignored.push('**/@mf-types/**');
    }
  }
  if (bundlerConfig.output) {
    if (!bundlerConfig.output?.chunkLoadingGlobal) {
      bundlerConfig.output.chunkLoadingGlobal = `chunk_${mfConfig.name}`;
    }
    if (!bundlerConfig.output?.uniqueName) {
      bundlerConfig.output.uniqueName = mfConfig.name;
    }
  }

  if (!isServer) {
    autoDeleteSplitChunkCacheGroups(mfConfig, bundlerConfig);
  }

  if (
    !isServer &&
    enableSSR &&
    typeof bundlerConfig.optimization?.splitChunks === 'object' &&
    bundlerConfig.optimization.splitChunks.cacheGroups
  ) {
    bundlerConfig.optimization.splitChunks.chunks = 'async';
    console.warn(
      `${PLUGIN_IDENTIFIER} splitChunks.chunks = async is not allowed with stream SSR mode, it will auto changed to "async"`,
    );
  }

  if (isDev && bundlerConfig.output?.publicPath === 'auto') {
    // TODO: only in dev temp
    const port =
      modernjsConfig.dev?.port || modernjsConfig.server?.port || 8080;
    const publicPath = `http://localhost:${port}/`;
    bundlerConfig.output.publicPath = publicPath;
  }

  if (isServer && enableSSR) {
    const { output } = bundlerConfig;
    const uniqueName = mfConfig.name || output?.uniqueName;
    const chunkFileName = output?.chunkFilename;
    if (
      output &&
      typeof chunkFileName === 'string' &&
      uniqueName &&
      !chunkFileName.includes(uniqueName)
    ) {
      const suffix = `${encodeName(uniqueName)}-[chunkhash].js`;
      output.chunkFilename = chunkFileName.replace('.js', suffix);
    }
  }
  // modernjs project has the same entry for server/client, add polyfill:false to skip compile error in browser target
  if (isDev && enableSSR && !isServer) {
    bundlerConfig.resolve!.fallback = {
      ...bundlerConfig.resolve!.fallback,
      crypto: false,
      stream: false,
      vm: false,
    };
  }

  if (
    modernjsConfig.deploy?.microFrontend &&
    Object.keys(mfConfig.exposes || {}).length
  ) {
    if (!bundlerConfig.optimization) {
      bundlerConfig.optimization = {};
    }
    bundlerConfig.optimization.usedExports = false;
  }
}

const localIpv4 = '127.0.0.1';

const getIpv4Interfaces = (): os.NetworkInterfaceInfo[] => {
  try {
    const interfaces = os.networkInterfaces();
    const ipv4Interfaces: os.NetworkInterfaceInfo[] = [];

    Object.values(interfaces).forEach((detail) => {
      detail?.forEach((detail) => {
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof detail.family === 'string' ? 'IPv4' : 4;

        if (detail.family === familyV4Value && detail.address !== localIpv4) {
          ipv4Interfaces.push(detail);
        }
      });
    });
    return ipv4Interfaces;
  } catch (_err) {
    return [];
  }
};

export const getIPV4 = (): string => {
  const ipv4Interfaces = getIpv4Interfaces();
  const ipv4Interface = ipv4Interfaces[0] || { address: localIpv4 };
  return ipv4Interface.address;
};

// lib-polyfill.js: include core-js，@babel/runtime，@swc/helpers，tslib.
// lib-react.js: include react，react-dom.
// lib-router.js: include react-router，react-router-dom，history，@remix-run/router.
// lib-lodash.js: include lodash，lodash-es.
// lib-antd.js: include antd.
// lib-arco.js: include @arco-design/web-react.
// lib-semi.js: include @douyinfe/semi-ui.
// lib-axios.js: include axios.

const SPLIT_CHUNK_MAP = {
  REACT: 'lib-react',
  ROUTER: 'lib-router',
  LODASH: 'lib-lodash',
  ANTD: 'lib-antd',
  ARCO: 'lib-arco',
  SEMI: 'lib-semi',
  AXIOS: 'lib-axios',
};
const SHARED_SPLIT_CHUNK_MAP = {
  react: SPLIT_CHUNK_MAP.REACT,
  'react-dom': SPLIT_CHUNK_MAP.REACT,
  'react-router': SPLIT_CHUNK_MAP.ROUTER,
  'react-router-dom': SPLIT_CHUNK_MAP.ROUTER,
  '@remix-run/router': SPLIT_CHUNK_MAP.ROUTER,
  lodash: SPLIT_CHUNK_MAP.LODASH,
  'lodash-es': SPLIT_CHUNK_MAP.LODASH,
  antd: SPLIT_CHUNK_MAP.ANTD,
  '@arco-design/web-react': SPLIT_CHUNK_MAP.ARCO,
  '@douyinfe/semi-ui': SPLIT_CHUNK_MAP.SEMI,
  axios: SPLIT_CHUNK_MAP.AXIOS,
};

function autoDeleteSplitChunkCacheGroups<T extends Bundler>(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  bundlerConfig: BundlerConfig<T>,
) {
  if (!mfConfig.shared) {
    return;
  }
  if (
    !bundlerConfig.optimization?.splitChunks ||
    !bundlerConfig.optimization.splitChunks.cacheGroups
  ) {
    return;
  }
  const arrayShared = Array.isArray(mfConfig.shared)
    ? mfConfig.shared
    : Object.keys(mfConfig.shared);
  for (const shared of arrayShared) {
    const splitChunkKey =
      SHARED_SPLIT_CHUNK_MAP[shared as keyof typeof SHARED_SPLIT_CHUNK_MAP];
    if (!splitChunkKey) {
      continue;
    }
    if (bundlerConfig.optimization.splitChunks.cacheGroups[splitChunkKey]) {
      delete bundlerConfig.optimization.splitChunks.cacheGroups[splitChunkKey];
    }
  }
}
