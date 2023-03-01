import fs from 'fs';
import os from 'os';
import path from 'path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { container, Configuration } from 'webpack';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { logger } from '@storybook/node-logger';

const correctImportPath = (context: string, entryFile: string) => {
  if (os.platform() !== 'win32') {
    return entryFile;
  }

  if (entryFile.match(/^\.?\.\\/) || !entryFile.match(/^[A-Z]:\\\\/i)) {
    return entryFile.replace(/\\/g, '/');
  }

  const joint = path.win32.relative(context, entryFile);
  const relative = joint.replace(/\\/g, '/');

  if (relative.includes('node_modules/')) {
    return relative.split('node_modules/')[1];
  }

  return `./${relative}`;
};

const { ModuleFederationPlugin } = container;

type Preset = string | { name: string };

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
  const { plugins = [], entry: webpackEntry, context } = webpackConfig;
  const { moduleFederationConfig, presets } = options;
  let entry = webpackEntry;

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

  const index = plugins.findIndex(
    (plugin) => plugin.constructor.name === 'VirtualModulesPlugin'
  );

  if (index !== -1) {
    logger.info(`=> [MF] Detected plugin VirtualModulesPlugin`);

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const plugin = plugins[index] as any;
    const currenEntryFiles: string[] = Array.isArray(entry) ? entry : []; // TODO: If is not array of strings ????

    const virtualModules = plugin._staticModules; // TODO: Exist another way to get virtual modules? Or maybe it's good idea to open a PR adding a method to get modules?
    const virtualModulePaths: string[] = Object.keys(virtualModules);

    // Get modules that are not virtual
    const filteredEntry = currenEntryFiles.filter(
      (path: string) => !virtualModulePaths.includes(path)
    );
    const bootstrap: string[] = filteredEntry.map(
      (entryFile: string) =>
        `import '${correctImportPath(context || process.cwd(), entryFile)}';`
    );

    logger.info(`=> [MF] Write files from VirtualModulesPlugin`);
    virtualModulePaths.forEach((virtualModulePath) => {
      fs.writeFileSync(virtualModulePath, virtualModules[virtualModulePath]);
      bootstrap.push(
        `import '${correctImportPath(
          context || process.cwd(),
          virtualModulePath
        )}';`
      );
    });

    /**
     * Rewrite VirtualModulesPlugin plugin to fix error "Shared module is not available for eager consumption"
     * Entry file content is moved in bootstrap file. More details in the webpack documentation:
     * https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption
     * */
    logger.info(
      `=> [MF] Rewrite plugin VirtualModulesPlugin to bootstrap entry point`
    );
    plugins[index] = new VirtualModulesPlugin({
      './__entry.js': `import('./__bootstrap.js');`,
      './__bootstrap.js': bootstrap.join('\n'),
    });

    // replace webpack entry file
    entry = ['./__entry.js'];
  }

  return {
    ...webpackConfig,
    entry,
    plugins,
  };
};
