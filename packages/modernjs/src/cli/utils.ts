import type {
  webpack,
  UserConfig,
  AppTools,
  Rspack,
} from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/sdk';
import path from 'path';
import { bundle } from '@modern-js/node-bundle-require';
import { PluginOptions } from '../types';

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
  return mfConfig;
};

export const patchMFConfig = (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  isServer: boolean,
) => {
  const runtimePlugins = [...(mfConfig.runtimePlugins || [])];
  const runtimePluginPath = path.resolve(
    __dirname,
    './mfRuntimePlugins/shared-strategy.js',
  );
  if (!runtimePlugins.includes(runtimePluginPath)) {
    runtimePlugins.push(
      path.resolve(__dirname, './mfRuntimePlugins/shared-strategy.js'),
    );
  }

  if (isServer) {
    const nodeHmrPluginPath = require.resolve(
      '@module-federation/node/record-dynamic-remote-entry-hash-plugin',
    );
    if (!runtimePlugins.includes(nodeHmrPluginPath)) {
      runtimePlugins.push(nodeHmrPluginPath);
    }
  }

  if (typeof mfConfig.async === 'undefined') {
    mfConfig.async = true;
  }

  return { ...mfConfig, runtimePlugins };
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
      const suffix = `-[chunkhash].js`;
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
