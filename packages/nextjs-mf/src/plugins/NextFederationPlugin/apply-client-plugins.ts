import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { NextFederationPluginExtraOptions } from './next-fragments';
import logger from '../../logger';

type ChunkCorrelationPluginCtor =
  typeof import('@module-federation/node/src/plugins/ChunkCorrelationPlugin').default;
type InvertedContainerPluginCtor =
  typeof import('../container/InvertedContainerPlugin').default;

const runtimeRequireFromModule = new Function(
  'moduleRef',
  'id',
  'return moduleRef && moduleRef.require ? moduleRef.require(id) : undefined',
) as (moduleRef: { require(id: string): any } | undefined, id: string) => any;

const runtimeRequire = (id: string) =>
  runtimeRequireFromModule(
    typeof module !== 'undefined' ? module : undefined,
    id,
  );

const loadChunkCorrelationPlugin = (): ChunkCorrelationPluginCtor => {
  const pluginModule = runtimeRequire(
    '@module-federation/node/src/plugins/ChunkCorrelationPlugin',
  ) as ChunkCorrelationPluginCtor | { default: ChunkCorrelationPluginCtor };

  return (pluginModule as { default?: ChunkCorrelationPluginCtor }).default
    ? (pluginModule as { default: ChunkCorrelationPluginCtor }).default
    : (pluginModule as ChunkCorrelationPluginCtor);
};

const loadInvertedContainerPlugin = (): InvertedContainerPluginCtor => {
  const pluginModule = runtimeRequire(
    '../container/InvertedContainerPlugin',
  ) as InvertedContainerPluginCtor | { default: InvertedContainerPluginCtor };

  return (pluginModule as { default?: InvertedContainerPluginCtor }).default
    ? (pluginModule as { default: InvertedContainerPluginCtor }).default
    : (pluginModule as InvertedContainerPluginCtor);
};

/**
 * Applies client-specific plugins.
 *
 * @param compiler - The Webpack compiler instance.
 * @param options - The ModuleFederationPluginOptions instance.
 * @param extraOptions - The NextFederationPluginExtraOptions instance.
 *
 * @remarks
 * This function applies plugins to the Webpack compiler instance that are specific to the client build of
 * a Next.js application with Module Federation enabled. These plugins include the following:
 *
 * - ChunkCorrelationPlugin: Collects metadata on chunks to enable proper module loading across different runtimes.
 * - InvertedContainerPlugin: Adds custom runtime modules to the container runtime to allow a host to expose its
 *   own remote interface at startup.

 * If automatic page stitching is enabled, a warning is logged indicating that it is disabled in v7.
 * If a custom library is specified in the options, an error is logged. The options.library property is
 * also set to `{ type: 'window', name: options.name }`.
 */
export function applyClientPlugins(
  compiler: Compiler,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions,
): void {
  const ChunkCorrelationPlugin = loadChunkCorrelationPlugin();
  const InvertedContainerPlugin = loadInvertedContainerPlugin();
  const { name } = options;

  // Adjust the public path if it is set to the default Next.js path
  if (compiler.options.output.publicPath === '/_next/') {
    compiler.options.output.publicPath = 'auto';
  }

  // Log a warning if automatic page stitching is enabled, as it is disabled in v7
  if (extraOptions.automaticPageStitching) {
    logger.warn('automatic page stitching is disabled in v7');
  }

  // Log an error if a custom library is set, as it is not allowed
  if (options.library) {
    logger.error('you cannot set custom library');
  }

  // Set the library option to be a window object with the name of the module federation plugin
  options.library = {
    type: 'window',
    name,
  };

  // Apply the ChunkCorrelationPlugin to collect metadata on chunks
  new ChunkCorrelationPlugin({
    filename: [
      'static/chunks/federated-stats.json',
      'server/federated-stats.json',
    ],
  }).apply(compiler);

  // Apply the InvertedContainerPlugin to add custom runtime modules to the container runtime
  new InvertedContainerPlugin().apply(compiler);
}
