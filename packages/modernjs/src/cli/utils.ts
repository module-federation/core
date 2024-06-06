import type {
  webpack,
  UserConfig,
  AppTools,
  Rspack,
} from '@modern-js/app-tools';
import { moduleFederationPlugin, encodeName } from '@module-federation/sdk';
import path from 'path';
import { bundle } from '@modern-js/node-bundle-require';
import { PluginOptions } from '../types';
import dns from 'dns';
import { LOCALHOST } from '../constant';

const defaultPath = path.resolve(process.cwd(), 'module-federation.config.ts');

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

  await replaceRemoteUrl(mfConfig);
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

const replaceRemoteUrl = async (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
): Promise<void> => {
  if (!mfConfig.remotes) {
    return;
  }
  const ipv4 = await lookupIpv4();
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

export const patchMFConfig = (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  isServer: boolean,
) => {
  const isDev = process.env.NODE_ENV === 'development';
  const runtimePlugins = [...(mfConfig.runtimePlugins || [])];

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
  }

  if (typeof mfConfig.async === 'undefined') {
    mfConfig.async = true;
  }

  if (!isServer) {
    return {
      ...mfConfig,
      runtimePlugins,
      dts:
        mfConfig.dts === false
          ? false
          : {
              generateTypes: false,
              consumeTypes: false,
              ...(typeof mfConfig.dts === 'object' ? mfConfig.dts : {}),
            },
      dev:
        mfConfig.dev === false
          ? false
          : {
              disableHotTypesReload: true,
              disableLiveReload: false,
              injectWebClient: true,
              ...(typeof mfConfig.dev === 'object' ? mfConfig.dev : {}),
            },
    };
  }

  return {
    ...mfConfig,
    runtimePlugins,
    dts: false,
    dev: false,
  };
};

export function getTargetEnvConfig(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  isServer: boolean,
) {
  const patchedMFConfig = patchMFConfig(mfConfig, isServer);
  if (isServer) {
    return {
      library: {
        type: 'commonjs-module',
        name: mfConfig.name,
      },
      ...patchedMFConfig,
    };
  }

  if (patchedMFConfig.library?.type === 'commonjs-module') {
    return {
      ...patchedMFConfig,
      library: {
        ...mfConfig.library,
        type: 'global',
      },
    };
  }

  return patchedMFConfig;
}

export function patchWebpackConfig<T>(options: {
  bundlerConfig: ConfigType<T>;
  isServer: boolean;
  modernjsConfig: UserConfig<AppTools>;
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
}) {
  const { bundlerConfig, modernjsConfig, isServer, mfConfig } = options;
  const enableSSR = Boolean(modernjsConfig.server?.ssr);

  delete bundlerConfig.optimization?.runtimeChunk;

  if (
    !isServer &&
    enableSSR &&
    typeof bundlerConfig.optimization?.splitChunks === 'object' &&
    bundlerConfig.optimization.splitChunks.cacheGroups
  ) {
    bundlerConfig.optimization.splitChunks.chunks = 'async';
    console.warn(
      '[Modern.js Module Federation] splitChunks.chunks = async is not allowed with stream SSR mode, it will auto changed to "async"',
    );
  }

  if (bundlerConfig.output?.publicPath === 'auto') {
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
  const isDev = process.env.NODE_ENV === 'development';
  // modernjs project has the same entry for server/client, add polyfill:false to skip compile error in browser target
  if (isDev && enableSSR && !isServer) {
    bundlerConfig.resolve!.fallback = {
      ...bundlerConfig.resolve!.fallback,
      crypto: false,
      stream: false,
      vm: false,
    };
  }
}

export const lookupIpv4 = async (): Promise<string> => {
  try {
    const res = await dns.promises.lookup(LOCALHOST, { family: 4 });
    return res.address;
  } catch (err) {
    return '127.0.0.1';
  }
};
