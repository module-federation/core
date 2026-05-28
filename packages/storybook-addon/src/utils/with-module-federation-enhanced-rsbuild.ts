import fs from 'node:fs';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { TEMP_DIR } from '@module-federation/sdk';

import { correctImportPath } from './correctImportPath.js';

import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type StorybookRsbuildOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions & {
    cacheKey?: string;
    configDir?: string;
    configType?: string;
    presets?: unknown;
  } & Record<string, unknown>;

const getModuleFederationOptions = ({
  cacheKey,
  configDir,
  configType,
  presets,
  ...moduleFederationOptions
}: StorybookRsbuildOptions): moduleFederationPlugin.ModuleFederationPluginOptions => {
  return moduleFederationOptions;
};

const tempDirPath = path.resolve(process.cwd(), `node_modules/${TEMP_DIR}`);
export const PLUGIN_NAME = 'module-federation-storybook-addon';
// add bootstrap for host project
const bootstrapPath = path.resolve(
  process.cwd(),
  `node_modules/${TEMP_DIR}/storybook-bootstrap.js`,
);
const generateBootstrap = (context: string, entryPath: string) => {
  return `import('${correctImportPath(context, entryPath)}');`;
};
const writeBootstrap = (context: string, entryPath: string) => {
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
  }

  if (fs.existsSync(bootstrapPath)) {
    fs.unlinkSync(bootstrapPath);
  }
  fs.writeFileSync(bootstrapPath, generateBootstrap(context, entryPath));
};
export const withModuleFederation = (
  rsbuildConfig: RsbuildConfig,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
) => {
  const moduleFederationOptions = getModuleFederationOptions(
    options as StorybookRsbuildOptions,
  );

  rsbuildConfig.plugins ??= [];
  rsbuildConfig.source ??= {};
  rsbuildConfig.source.entry ??= {};
  const entry = rsbuildConfig.source.entry;
  const context = rsbuildConfig.root || process.cwd();
  for (const entryName in entry) {
    if (Array.isArray(entry[entryName])) {
      writeBootstrap(context, entry[entryName][0]);
      entry[entryName] = [bootstrapPath];
    }
  }

  const rsbuildPlugin: RsbuildPlugin = {
    name: 'module-federation-storybook-plugin',
    setup: function (api) {
      api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
        const mfConfig: RsbuildConfig = {
          dev: {
            // remoteEntry already includes one hmr runtime, and an additional one is not necessary.
            hmr: false,
          },
        };
        return mergeRsbuildConfig(config, mfConfig);
      });

      api.modifyBundlerChain(async (chain) => {
        chain.plugin(PLUGIN_NAME).use(ModuleFederationPlugin, [
          {
            ...moduleFederationOptions,
            name: moduleFederationOptions.name || PLUGIN_NAME,
            shared: {
              react: {
                singleton: true,
              },
              'react-dom': {
                singleton: true,
              },
              ...moduleFederationOptions.shared,
            },
            remotes: {
              ...moduleFederationOptions.remotes,
            },
            shareStrategy: moduleFederationOptions.shareStrategy,
          },
        ]);
      });
    },
  };

  rsbuildConfig.plugins.push(rsbuildPlugin);
  return rsbuildConfig;
};

export default withModuleFederation;
