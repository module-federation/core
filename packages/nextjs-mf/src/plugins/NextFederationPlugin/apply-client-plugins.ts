import type { Compiler } from 'webpack';
import {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
} from '@module-federation/utilities';
import { ChunkCorrelationPlugin } from '@module-federation/node';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import { HoistContainerReferencesPlugin } from '@module-federation/enhanced';

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
 *
 * If automatic page stitching is enabled, a warning is logged indicating that it is disabled in v7.
 * If a custom library is specified in the options, an error is logged. The options.library property is
 * also set to `{ type: 'window', name: options.name }`.
 */
export function applyClientPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions,
): void {
  const { remotes, name } = options;

  if (compiler.options.output.publicPath === '/_next/') {
    compiler.options.output.publicPath = 'auto';
  }

  if (extraOptions.automaticPageStitching) {
    console.warn('[nextjs-mf]', 'automatic page stitching is disabled in v7');
  }

  if (options.library) {
    console.error('[nextjs-mf] you cannot set custom library');
  }

  options.library = {
    type: 'window',
    name,
  };

  new ChunkCorrelationPlugin({
    filename: [
      'static/chunks/federated-stats.json',
      'server/federated-stats.json',
    ],
  }).apply(compiler);

  new InvertedContainerPlugin({
    runtime: 'webpack',
    container: options.name,
    remotes: options.remotes as Record<string, string>,
    debug: extraOptions.debug,
  }).apply(compiler);
}
