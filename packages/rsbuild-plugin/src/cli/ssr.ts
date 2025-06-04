import path from 'path';
import { encodeName } from '@module-federation/sdk';
import type { EnvironmentConfig, Rspack } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

export const SSR_DIR = 'ssr';
export const SSR_ENV_NAME = 'mf-ssr';

export function setSSREnv() {
  process.env['MF_DISABLE_EMIT_STATS'] = 'true';
  process.env['MF_SSR_PRJ'] = 'true';
}

const isDev = () => {
  return process.env.NODE_ENV === 'development';
};

export function patchSSRRspackConfig(
  config: Rspack.Configuration,
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) {
  if (typeof config.output?.publicPath !== 'string') {
    throw new Error('publicPath must be string!');
  }
  const publicPath = config.output.publicPath;
  if (publicPath === 'auto') {
    throw new Error('publicPath can not be "auto"!');
  }
  config.output.publicPath = `${config.output.publicPath}${SSR_DIR}/`;
  config.target = 'async-node';
  // @module-federation/node/universe-entry-chunk-tracker-plugin only export cjs
  const UniverseEntryChunkTrackerPlugin =
    require('@module-federation/node/universe-entry-chunk-tracker-plugin').default;
  config.plugins ||= [];
  isDev() && config.plugins.push(new UniverseEntryChunkTrackerPlugin());

  const uniqueName = mfConfig.name || config.output?.uniqueName;
  const chunkFileName = config.output.chunkFilename;
  if (
    typeof chunkFileName === 'string' &&
    uniqueName &&
    !chunkFileName.includes(uniqueName)
  ) {
    const suffix = `${encodeName(uniqueName)}-[chunkhash].js`;
    config.output.chunkFilename = chunkFileName.replace('.js', suffix);
  }

  return config;
}

export function createSSRREnvConfig(
  envConfig: EnvironmentConfig,
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) {
  const ssrEnvConfig: EnvironmentConfig = {
    ...envConfig,
    tools: {
      rspack: (config, { environment }) => {
        if (environment.name !== SSR_ENV_NAME) {
          return;
        }
        patchSSRRspackConfig(config, mfConfig);
      },
    },
  };
  ssrEnvConfig.output = {
    ...ssrEnvConfig.output,
    // https://rsbuild.rs/config/output/target#other-targets
    // Rsbuild not support all rspack targets, so modify to async-node in modifyRspackConfig
    target: 'node',
    distPath: {
      ...ssrEnvConfig.output?.distPath,
      root: path.join(ssrEnvConfig.output?.distPath?.root || '', SSR_DIR),
    },
  };
  return ssrEnvConfig;
}

export function createSSRMFConfig(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) {
  const ssrMFConfig = {
    ...mfConfig,
    exposes: { ...mfConfig.exposes },
    library: {
      ...mfConfig.library,
      name: mfConfig.name,
      type: mfConfig.library?.type ?? 'commonjs-module',
    },
    dts: false,
    dev: false,
  };

  ssrMFConfig.runtimePlugins ||= [];
  ssrMFConfig.runtimePlugins.push(
    require.resolve('@module-federation/node/runtimePlugin'),
  );
  if (isDev()) {
    ssrMFConfig.runtimePlugins.push(
      require.resolve(
        '@module-federation/node/record-dynamic-remote-entry-hash-plugin',
      ),
    );
  }

  return ssrMFConfig;
}
