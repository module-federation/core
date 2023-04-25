import { getModuleFederationConfig } from '@nrwl/react/src/module-federation/utils';
import { readCachedProjectConfiguration } from 'nx/src/project-graph/project-graph';
import { container, Configuration } from 'webpack';
import type { ModuleFederationConfig } from '@nrwl/devkit';

const { ModuleFederationPlugin } = container;

function determineRemoteUrl(remote: string) {
  const remoteConfiguration = readCachedProjectConfiguration(remote);
  const serveTarget = remoteConfiguration?.targets?.['serve'];

  if (!serveTarget) {
    throw new Error(
      `Cannot automatically determine URL of remote (${remote}). Looked for property "host" in the project's "serve" target.\n
      You can also use the tuple syntax in your webpack config to configure your remotes. e.g. \`remotes: [['remote1', 'http://localhost:4201']]\``
    );
  }

  const host = serveTarget.options?.host ?? 'http://localhost';
  const port = serveTarget.options?.port ?? 4201;
  return `${
    host.endsWith('/') ? host.slice(0, -1) : host
  }:${port}/remoteEntry.js`;
}

const updateMappedRemotes = (remotes: Record<string, string>) => {
  const newRemotes: Record<string, string> = {};

  Object.keys(remotes).forEach((key) => {
    newRemotes[key] = `${key}@${remotes[key]}`;
  });

  return newRemotes;
};

const withModuleFederation = async (options: ModuleFederationConfig) => {
  const { mappedRemotes, sharedDependencies } = await getModuleFederationConfig(
    options,
    determineRemoteUrl
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
      })
    );

    return config;
  };
};

export default withModuleFederation;
