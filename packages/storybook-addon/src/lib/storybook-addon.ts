import fs from 'fs';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { container, Configuration } from 'webpack';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { logger } from '@storybook/node-logger';
import { correctImportPath } from '../utils';
import * as process from 'process';

const { ModuleFederationPlugin } = container;

export type Preset = string | { name: string };

type Options = {
  moduleFederationConfig: ModuleFederationPluginOptions;
  presets: {
    apply<T>(preset: Preset): Promise<T>;
  };
};

export const webpack = async (
  webpackConfig: Configuration,
  options: Options
): Promise<Configuration> => {
  const { plugins = [], context: webpackContext } = webpackConfig;
  const { moduleFederationConfig, presets } = options;
  const context = webpackContext || process.cwd();

  // Detect webpack version. More about storybook webpack config https://storybook.js.org/docs/react/addons/writing-presets#webpack
  const webpackVersion = await presets.apply('webpackVersion');
  logger.info(`=> [MF] Webpack ${webpackVersion} version detected`);

  if (webpackVersion !== '5') {
    throw new Error(
      'Webpack 5 required: Configure Storybook to use the webpack5 builder'
    );
  }

  logger.info(`=> [MF] Push Module Federation plugin`);
  plugins.push(new ModuleFederationPlugin(moduleFederationConfig));

  const entries = await presets.apply<string[]>('entries');
  const bootstrap: string[] = entries.map(
    (entryFile: string) => `import '${correctImportPath(context, entryFile)}';`
  );

  const index = plugins.findIndex(
    (plugin) => plugin.constructor.name === 'VirtualModulesPlugin'
  );

  if (index !== -1) {
    logger.info(`=> [MF] Detected plugin VirtualModulesPlugin`);

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const plugin = plugins[index] as any;

    const virtualEntries = plugin._staticModules; // TODO: Exist another way to get virtual modules? Or maybe it's good idea to open a PR adding a method to get modules?
    const virtualEntriesPaths: string[] = Object.keys(virtualEntries);

    logger.info(`=> [MF] Write files from VirtualModulesPlugin`);
    virtualEntriesPaths.forEach((virtualEntryPath) => {
      fs.writeFileSync(virtualEntryPath, virtualEntries[virtualEntryPath]);
      bootstrap.push(
        `import '${correctImportPath(context, virtualEntryPath)}';`
      );
    });
  }

  /**
   * Create a new VirtualModulesPlugin plugin to fix error "Shared module is not available for eager consumption"
   * Entry file content is moved in bootstrap file. More details in the webpack documentation:
   * https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption
   * */
  const virtualModulePlugin = new VirtualModulesPlugin({
    './__entry.js': `import('./__bootstrap.js');`,
    './__bootstrap.js': bootstrap.join('\n'),
  });

  let action = 'Push';
  if (index === -1) {
    plugins.push(virtualModulePlugin);
  } else {
    plugins[index] = virtualModulePlugin;
    action = 'Replace';
  }
  logger.info(
    `=> [MF] ${action} plugin VirtualModulesPlugin to bootstrap entry point`
  );

  return {
    ...webpackConfig,
    entry: ['./__entry.js'],
    plugins,
  };
};
