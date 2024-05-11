import { moduleFederationPlugin } from '@module-federation/sdk';
import path from 'path';
import { bundle } from '@modern-js/node-bundle-require';
import { PluginOptions } from '../types';

const defaultPath = path.resolve(process.cwd(), 'module-federation.config.ts');

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
  if (typeof mfConfig.async !== 'undefined') {
    mfConfig.async = true;
  }
  if (isServer) {
    mfConfig.library = {
      type: 'commonjs-module',
      name: mfConfig.name,
    };
  }
};
