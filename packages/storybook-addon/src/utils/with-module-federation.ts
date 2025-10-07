import { getModuleFederationConfig } from '@nx/module-federation/src/with-module-federation/webpack/utils';
import { container, Configuration } from 'webpack';

// Define ModuleFederationConfig type locally since it's not exported from @nx/webpack
interface ModuleFederationConfig {
  name: string;
  filename?: string;
  remotes?: Record<string, string>;
  exposes?: Record<string, string>;
  shared?: Record<string, any>;
}

const { ModuleFederationPlugin } = container;

const updateMappedRemotes = (remotes: Record<string, string>) => {
  const newRemotes: Record<string, string> = {};

  Object.keys(remotes).forEach((key) => {
    newRemotes[key] = `${key}@${remotes[key]}`;
  });

  return newRemotes;
};

const withModuleFederation = async (options: ModuleFederationConfig) => {
  const { mappedRemotes, sharedDependencies } = await getModuleFederationConfig(
    options as any,
  );

  return (config: Configuration) => {
    config.experiments = { outputModule: false };

    config.optimization = {
      runtimeChunk: false,
    };

    config.output = {
      publicPath: 'auto',
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new ModuleFederationPlugin({
        name: options.name,
        filename: 'remoteEntry.js',
        shared: sharedDependencies,
        exposes: options.exposes,
        remotes: updateMappedRemotes(mappedRemotes),
      }),
    );

    return config;
  };
};

export default withModuleFederation;
