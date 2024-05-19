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
) => {
  mfConfig.runtimePlugins = mfConfig.runtimePlugins || [];
  const runtimePluginPath = path.resolve(
    __dirname,
    './mfRuntimePlugins/shared-strategy.js',
  );
  if (!mfConfig.runtimePlugins.includes(runtimePluginPath)) {
    mfConfig.runtimePlugins.push(
      path.resolve(__dirname, './mfRuntimePlugins/shared-strategy.js'),
    );
  }
  if (typeof mfConfig.async === 'undefined') {
    mfConfig.async = true;
  }
};

export function getTargetEnvConfig(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  isServer: boolean,
) {
  patchMFConfig(mfConfig);
  if (isServer) {
    return {
      library: {
        type: 'commonjs-module',
        name: mfConfig.name,
      },
      ...mfConfig,
    };
  }
  if (mfConfig.library?.type === 'commonjs-module') {
    return {
      ...mfConfig,
      library: {
        ...mfConfig.library,
        type: 'global',
      },
    };
  }
  return mfConfig;
}

export function patchWebpackConfig<T>(options: {
  bundlerConfig: ConfigType<T>;
  isServer: boolean;
  modernjsConfig: UserConfig<AppTools>;
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
}) {
  const { bundlerConfig, modernjsConfig, isServer, mfConfig } = options;
  const isStreamSSR =
    typeof modernjsConfig?.server?.ssr === 'object'
      ? modernjsConfig?.server?.ssr?.mode === 'stream'
      : false;

  delete bundlerConfig.optimization?.runtimeChunk;

  if (
    !isServer &&
    isStreamSSR &&
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

  if (isServer && isStreamSSR) {
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
}
