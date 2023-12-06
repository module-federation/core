import fs from 'fs';
import { dirname, join } from 'path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { container, Configuration } from 'webpack';
import { logger } from '@storybook/node-logger';
import { normalizeStories } from '@storybook/core-common';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';

import { ModuleFederationConfig } from '@nx/webpack';
import withModuleFederation from '../utils/with-module-federation';
import { correctImportPath } from '../utils/correctImportPath';

const { ModuleFederationPlugin } = container;

export type Preset = string | { name: string };

type Options = {
  moduleFederationConfig?: ModuleFederationPluginOptions;
  nxModuleFederationConfig?: ModuleFederationConfig;
  presets: {
    apply<T>(preset: Preset): Promise<T>;
  };
  configDir: string;
};

export { withModuleFederation };

export const webpack = async (
  webpackConfig: Configuration,
  options: Options,
): Promise<Configuration> => {
  const { plugins = [], context: webpackContext } = webpackConfig;
  const { moduleFederationConfig, presets, nxModuleFederationConfig } = options;
  const context = webpackContext || process.cwd();

  // Detect webpack version. More about storybook webpack config https://storybook.js.org/docs/react/addons/writing-presets#webpack
  const webpackVersion = await presets.apply('webpackVersion');
  logger.info(`=> [MF] Webpack ${webpackVersion} version detected`);

  if (webpackVersion !== '5') {
    throw new Error(
      'Webpack 5 required: Configure Storybook to use the webpack5 builder',
    );
  }

  if (nxModuleFederationConfig) {
    logger.info(`=> [MF] Detect NX configuration`);

    const wmf = await withModuleFederation(nxModuleFederationConfig);

    webpackConfig = {
      ...webpackConfig,
      ...wmf(webpackConfig),
    };
  }

  if (moduleFederationConfig) {
    logger.info(`=> [MF] Push Module Federation plugin`);
    plugins.push(new ModuleFederationPlugin(moduleFederationConfig));
  }

  const entries = await presets.apply<string[]>('entries');
  const bootstrap: string[] = entries.map(
    (entryFile: string) => `import '${correctImportPath(context, entryFile)}';`,
  );

  const index = plugins.findIndex(
    //@ts-ignore
    (plugin) => plugin.constructor.name === 'VirtualModulesPlugin',
  );

  if (index !== -1) {
    logger.info(`=> [MF] Detected plugin VirtualModulesPlugin`);

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const plugin = plugins[index] as any;

    const virtualEntries = plugin._staticModules; // TODO: Exist another way to get virtual modules? Or maybe it's good idea to open a PR adding a method to get modules?
    const virtualEntriesPaths: string[] = Object.keys(virtualEntries);

    logger.info(`=> [MF] Write files from VirtualModulesPlugin`);
    for (const virtualEntryPath of virtualEntriesPaths) {
      const nodeModulesPath = '/node_modules/';
      const filePathFromProjectRootDir = virtualEntryPath.replace(context, '');
      let sourceCode = virtualEntries[virtualEntryPath];
      let finalPath = virtualEntryPath;
      let finalDir = dirname(virtualEntryPath);

      // If virtual file is not in directory node_modules, move file in directory node_modules/.cache/storybook
      if (!filePathFromProjectRootDir.startsWith(nodeModulesPath)) {
        finalPath = join(
          context,
          nodeModulesPath,
          '.cache',
          'storybook',
          filePathFromProjectRootDir,
        );
        finalDir = dirname(finalPath);

        // Fix storybook stories' path in virtual module
        if (
          // For storybook version before 7
          filePathFromProjectRootDir === '/generated-stories-entry.cjs' ||
          // For storybook version 7
          filePathFromProjectRootDir === '/storybook-stories.js'
        ) {
          const isStorybookVersion7 =
            filePathFromProjectRootDir === '/storybook-stories.js';
          const nonNormalizedStories = await presets.apply<string[]>('stories');
          const stories = normalizeStories(nonNormalizedStories, {
            configDir: options.configDir,
            workingDir: context,
          });

          // For each story fix the import path
          stories.forEach((story) => {
            // Go up 3 times because the file was moved in /node_modules/.cache/storybook
            const newDirectory = join('..', '..', '..', story.directory);
            // Adding trailing slash for story directory in storybook v7
            const oldSrc = isStorybookVersion7
              ? `'${story.directory}/'`
              : `'${story.directory}'`;
            const newSrc = isStorybookVersion7
              ? `'${newDirectory}/'`
              : `'${newDirectory}'`;

            // Fix story directory
            sourceCode = sourceCode.replace(oldSrc, newSrc);
          });
        }
      }

      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      fs.writeFileSync(finalPath, sourceCode);
      bootstrap.push(`import '${correctImportPath(context, finalPath)}';`);
    }
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
    `=> [MF] ${action} plugin VirtualModulesPlugin to bootstrap entry point`,
  );

  return {
    ...webpackConfig,
    entry: ['./__entry.js'],
    plugins,
  };
};
