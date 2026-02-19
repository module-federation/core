import type { Configuration } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

function getChunkCorrelationPluginCtor(): typeof import('@module-federation/node').ChunkCorrelationPlugin {
  const mfNode =
    require('@module-federation/node') as typeof import('@module-federation/node');
  return mfNode.ChunkCorrelationPlugin;
}

function getInvertedContainerPluginCtor(): typeof import('../container/InvertedContainerPlugin').default {
  return require('../container/InvertedContainerPlugin')
    .default as typeof import('../container/InvertedContainerPlugin').default;
}

export function configureClientCompiler(
  config: Configuration,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void {
  const output = config.output || (config.output = {});

  output.uniqueName = options.name;
  if (output.publicPath === '/_next/') {
    output.publicPath = 'auto';
  }
  output.environment = {
    ...output.environment,
    asyncFunction: true,
  };

  options.library = {
    type: 'window',
    name: options.name,
  };

  const plugins = config.plugins || [];
  const ChunkCorrelationPlugin = getChunkCorrelationPluginCtor();
  const InvertedContainerPlugin = getInvertedContainerPluginCtor();
  plugins.push(
    new ChunkCorrelationPlugin({
      filename: [
        'static/chunks/federated-stats.json',
        'server/federated-stats.json',
      ],
    }),
    new InvertedContainerPlugin(),
  );
  config.plugins = plugins;
}
