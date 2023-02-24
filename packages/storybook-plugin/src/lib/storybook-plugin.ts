import { container, Configuration } from 'webpack';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { logger } from '@storybook/node-logger';

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
  const { plugins = [] } = webpackConfig;
  const { moduleFederationConfig, presets } = options;

  // Detect webpack version. More about storybook webpack config https://storybook.js.org/docs/react/addons/writing-presets#webpack
  const webpackVersion = await presets.apply('webpackVersion');
  logger.info(`=> Webpack ${webpackVersion} version detected`);

  if (webpackVersion !== '5') {
    throw new Error(
      'Webpack 5 required: Configure Storybook to use the webpack5 builder'
    );
  }

  logger.info(`=> Push Module Federation plugin`);

  plugins.push(
    new ModuleFederationPlugin({
      ...moduleFederationConfig,
      shared: {}, // TODO: Fix error shared dependencies
    })
  );

  return {
    ...webpackConfig,
    plugins,
  };
};
