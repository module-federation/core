import fs from 'node:fs';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { TEMP_DIR } from '@module-federation/sdk';

import { correctImportPath } from './correctImportPath';

import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const tempDirPath = path.resolve(process.cwd(), `node_modules/${TEMP_DIR}`);
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
export const withModuleFederation = async (
  rsbuildConfig: RsbuildConfig,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
) => {
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
          tools: {
            rspack: (config) => {
              config.output ??= {};
              config.output.chunkLoadingGlobal =
                'module-federation-storybook-addon';
              config.plugins?.push(
                new ModuleFederationPlugin({
                  name: options.name || 'module-federation-storybook-addon',
                  shared: {
                    react: {
                      singleton: true,
                    },
                    'react-dom': {
                      singleton: true,
                    },
                    ...options.shared,
                  },
                  remotes: {
                    ...options.remotes,
                  },
                  shareStrategy: options.shareStrategy,
                }),
              );
              return config;
            },
          },
        };

        return mergeRsbuildConfig(config, mfConfig);
      });
    },
  };

  rsbuildConfig.plugins.push(rsbuildPlugin);
  return rsbuildConfig;
};

export default withModuleFederation;
