import path from 'path';
import { createRequire } from 'node:module';
import { encodeName } from '@module-federation/sdk';
import { CALL_NAME_MAP } from '../constant';

import type {
  EnvironmentConfig,
  RsbuildConfig,
  Rspack,
  EnvironmentContext,
  DistPathConfig,
} from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const require = createRequire(import.meta.url);
const resolve = require.resolve;

function resolveOrRequest(request: string): string {
  try {
    return resolve(request);
  } catch {
    return request;
  }
}

function safeRequire<T>(request: string): T | undefined {
  try {
    return require(request) as T;
  } catch {
    return undefined;
  }
}

export const SSR_DIR = 'ssr';
export const SSR_ENV_NAME = 'mf-ssr';
export const ENV_NAME = 'mf';

export function setSSREnv() {
  process.env['MF_SSR_PRJ'] = 'true';
}

const isDev = () => {
  return process.env['NODE_ENV'] === 'development';
};

export function patchNodeConfig(
  config: Rspack.Configuration,
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) {
  config.output ||= {};
  if (config.output.publicPath === 'auto') {
    config.output.publicPath = '';
  }
  config.target = 'async-node';
  // Force node federation output to CJS + async chunk loading.
  // This prevents browser jsonp runtime handlers from leaking into SSR remotes.
  config.output.module = false;
  config.output.chunkFormat = 'commonjs';
  config.output.chunkLoading = 'async-node';
  delete config.output.chunkLoadingGlobal;
  const UniverseEntryChunkTrackerPluginModule = safeRequire<{
    default?: new () => Rspack.RspackPluginInstance;
  }>('@module-federation/node/universe-entry-chunk-tracker-plugin');
  const UniverseEntryChunkTrackerPlugin =
    UniverseEntryChunkTrackerPluginModule?.default;
  config.plugins ||= [];
  if (isDev() && UniverseEntryChunkTrackerPlugin) {
    config.plugins.push(new UniverseEntryChunkTrackerPlugin());
  }

  const uniqueName = mfConfig.name || config.output?.uniqueName;
  const chunkFileName = config.output.chunkFilename;
  if (
    typeof chunkFileName === 'string' &&
    uniqueName &&
    !chunkFileName.includes(uniqueName)
  ) {
    const encodedName = encodeName(uniqueName);
    config.output.chunkFilename = chunkFileName.endsWith('.js')
      ? chunkFileName.replace(/\.js$/, `${encodedName}.js`)
      : `${chunkFileName}${encodedName}`;
  }
}

export function patchSSRRspackConfig(
  config: Rspack.Configuration,
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  ssrDir: string,
  callerName?: string,
  resetEntry = true,
  modifyPublicPath = true,
) {
  config.output ||= {};
  if (modifyPublicPath) {
    if (typeof config.output?.publicPath !== 'string') {
      throw new Error('publicPath must be string!');
    }
    const publicPath = config.output.publicPath;
    if (publicPath !== 'auto') {
      const publicPathWithSSRDir = `${publicPath}${ssrDir}/`;
      config.output.publicPath = publicPathWithSSRDir;
    }
  }

  if (callerName === CALL_NAME_MAP.RSPRESS && resetEntry) {
    // set virtue entry, only need mf entry
    config.entry = 'data:application/node;base64,';
  }
  patchNodeConfig(config, mfConfig);
  return config;
}

export function patchToolsTspack(
  envConfig: EnvironmentConfig,
  fn: (
    config: Rspack.RspackOptions,
    { environment }: { environment: EnvironmentContext },
  ) => void,
) {
  const rspackArr = [];
  if (envConfig.tools?.rspack) {
    if (Array.isArray(envConfig.tools?.rspack)) {
      rspackArr.push(...envConfig.tools?.rspack);
    } else if (typeof envConfig.tools?.rspack === 'function') {
      rspackArr.push(envConfig.tools?.rspack);
    }
  }
  envConfig.tools ||= {};
  envConfig.tools.rspack = [...rspackArr, fn];
}

export function createSSRREnvConfig(
  envConfig: EnvironmentConfig,
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  ssrDir: string,
  rsbuildConfig: RsbuildConfig,
  callerName?: string,
) {
  const rspackArr = [];
  if (envConfig.tools?.rspack) {
    if (Array.isArray(envConfig.tools?.rspack)) {
      rspackArr.push(...envConfig.tools?.rspack);
    } else if (typeof envConfig.tools?.rspack === 'function') {
      rspackArr.push(envConfig.tools?.rspack);
    }
  }
  const ssrEnvConfig: EnvironmentConfig = {
    ...envConfig,
  };
  patchToolsTspack(ssrEnvConfig, (config, { environment }) => {
    if (environment.name !== SSR_ENV_NAME) {
      return;
    }
    patchSSRRspackConfig(config, mfConfig, ssrDir, callerName);
  });
  ssrEnvConfig.output = {
    ...ssrEnvConfig.output,
    // https://rsbuild.rs/config/output/target#other-targets
    // Rsbuild not support all rspack targets, so modify to async-node in modifyRspackConfig
    target: 'node',
    distPath: {
      ...(ssrEnvConfig.output?.distPath as DistPathConfig),
      root: path.join(
        (ssrEnvConfig.output?.distPath as DistPathConfig)?.root ||
          (rsbuildConfig.output?.distPath as DistPathConfig)?.root ||
          '',
        ssrDir,
      ),
    },
    emitAssets: true,
  };
  return ssrEnvConfig;
}

export function patchNodeMFConfig(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) {
  if (mfConfig.remotes) {
    mfConfig.remoteType = 'script';
  }
  mfConfig.exposes = { ...mfConfig.exposes };
  mfConfig.library = {
    ...mfConfig.library,
    name: mfConfig.name,
    type: mfConfig.library?.type ?? 'commonjs-module',
  };
  mfConfig.runtimePlugins = [...(mfConfig.runtimePlugins || [])];

  mfConfig.runtimePlugins.push(
    resolveOrRequest('@module-federation/node/runtimePlugin'),
  );
  if (isDev()) {
    mfConfig.runtimePlugins.push(
      resolveOrRequest(
        '@module-federation/node/record-dynamic-remote-entry-hash-plugin',
      ),
    );
  }
}

export function createSSRMFConfig(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) {
  const ssrMFConfig = {
    ...mfConfig,
  };
  patchNodeMFConfig(ssrMFConfig);
  ssrMFConfig.dts = false;
  ssrMFConfig.dev = false;

  return ssrMFConfig;
}
