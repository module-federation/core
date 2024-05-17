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
  config: ConfigType<T>;
  isServer: boolean;
  useConfig: UserConfig<AppTools>;
}) {
  const { config, useConfig, isServer } = options;
  const enableSSR = Boolean(useConfig?.server?.ssr);
  const isStreamSSR =
    typeof useConfig?.server?.ssr === 'object'
      ? useConfig?.server?.ssr?.mode === 'stream'
      : false;

  delete config.optimization?.runtimeChunk;

  if (
    !isServer &&
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

  if (config.output?.publicPath === 'auto') {
    // TODO: only in dev temp
    const port = useConfig.dev?.port || useConfig.server?.port || 8080;
    const publicPath = `http://localhost:${port}/`;
    config.output.publicPath = publicPath;
  }
}
