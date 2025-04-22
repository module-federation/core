import path from 'path';
import { bundle } from '@modern-js/node-bundle-require';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { pathToFileURL } from 'url';

const DEFAULT_CONFIG_PATH = 'module-federation.config.ts';

export const getConfigPath = (userConfigPath?: string) => {
  const defaultPath = path.resolve(process.cwd(), DEFAULT_CONFIG_PATH);
  const filepath = userConfigPath ?? defaultPath;
  return path.isAbsolute(filepath)
    ? filepath
    : path.resolve(process.cwd(), filepath);
};

export async function readConfig(userConfigPath?: string) {
  const configPath = getConfigPath(userConfigPath);
  const preBundlePath = await bundle(configPath);
  const mfConfig = (await import(pathToFileURL(preBundlePath).href)).default
    .default as unknown as moduleFederationPlugin.ModuleFederationPluginOptions;
  return mfConfig;
}
