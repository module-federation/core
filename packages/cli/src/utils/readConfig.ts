import path from 'path';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const { createJiti } = require('jiti');
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
  const jit = createJiti(__filename, {
    interopDefault: true,
    esmResolve: true,
  });
  const configModule = await jit(configPath);
  const resolvedConfig = (
    configModule &&
    typeof configModule === 'object' &&
    'default' in configModule
      ? (configModule as { default: unknown }).default
      : configModule
  ) as moduleFederationPlugin.ModuleFederationPluginOptions;

  return resolvedConfig;
}
