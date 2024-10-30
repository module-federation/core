import fs from 'node:fs';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { TEMP_DIR } from '@module-federation/sdk';

import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

// add bootstrap for host project
const bootstrapPath = path.resolve(
  process.cwd(),
  `node_modules/${TEMP_DIR}/storybook-bootstrap.js`,
);
const generateBootstrap = (entryPath: string) => {
  return `import('${entryPath}')`;
};
const writeBootstrap = (entryPath: string) => {
  if (fs.existsSync(bootstrapPath)) {
    fs.unlinkSync(bootstrapPath);
  }
  fs.writeFileSync(bootstrapPath, generateBootstrap(entryPath));
};
export const withModuleFederation = async (
  rsbuildConfig: RsbuildConfig,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
) => {
  rsbuildConfig.plugins ??= [];
  rsbuildConfig.source ??= {};
  rsbuildConfig.source.entry ??= {};
  const entry = rsbuildConfig.source.entry;
  for (const entryName in entry) {
    if (Array.isArray(entry[entryName])) {
      writeBootstrap(entry[entryName][0]);
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
