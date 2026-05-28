import fs from 'node:fs';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { TEMP_DIR } from '@module-federation/sdk';

import { correctImportPath } from './correctImportPath.js';

import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type StorybookRsbuildOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions &
    Record<string, unknown>;

// Storybook passes its full `Options` object (configDir, configType, presets,
// presetsList, cache, features, packageJson, port, ...) as the second argument
// to the `rsbuildFinal` hook. The enhanced `ModuleFederationPlugin` schema is
// strict (`additionalProperties: false`) and rejects any unknown key, so we
// must keep only valid Module Federation options and drop Storybook metadata.
// An allowlist is used (rather than stripping known Storybook keys) so the
// addon stays robust as Storybook adds new metadata fields.
const MODULE_FEDERATION_OPTION_KEYS = [
  'async',
  'bridge',
  'dev',
  'dts',
  'experiments',
  'exposes',
  'filename',
  'getPublicPath',
  'implementation',
  'injectTreeShakingUsedExports',
  'library',
  'manifest',
  'name',
  'remoteType',
  'remotes',
  'runtime',
  'runtimePlugins',
  'shareScope',
  'shareStrategy',
  'shared',
  'treeShakingDir',
  'treeShakingSharedExcludePlugins',
  'treeShakingSharedPlugins',
  'virtualRuntimeEntry',
] as const satisfies ReadonlyArray<
  keyof moduleFederationPlugin.ModuleFederationPluginOptions
>;

const getModuleFederationOptions = (
  options: StorybookRsbuildOptions,
): moduleFederationPlugin.ModuleFederationPluginOptions => {
  const moduleFederationOptions: moduleFederationPlugin.ModuleFederationPluginOptions =
    {};

  for (const key of MODULE_FEDERATION_OPTION_KEYS) {
    if (options[key] !== undefined) {
      (moduleFederationOptions as Record<string, unknown>)[key] = options[key];
    }
  }

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
