import type { Compiler } from 'webpack';
import { ChunkCorrelationPlugin } from '@module-federation/node';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { NextFederationPluginExtraOptions } from './next-fragments';

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
  const { name } = options;

  // Adjust the public path if it is set to the default Next.js path
  if (compiler.options.output.publicPath === '/_next/') {
    compiler.options.output.publicPath = 'auto';
  }

  // Log a warning if automatic page stitching is enabled, as it is disabled in v7
  if (extraOptions.automaticPageStitching) {
    console.warn('[nextjs-mf]', 'automatic page stitching is disabled in v7');
  }

  // Log an error if a custom library is set, as it is not allowed
  if (options.library) {
    console.error('[nextjs-mf] you cannot set custom library');
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
