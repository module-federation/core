import type Compiler from 'webpack/lib/Compiler';
import {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
} from '@bruno-module-federation/utilities';
import DelegateModulesPlugin from '@bruno-module-federation/utilities/src/plugins/DelegateModulesPlugin';
import { ChunkCorrelationPlugin } from '@bruno-module-federation/node';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
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
 * - DelegateModulesPlugin: Delegates modules to the webpack container runtime that can be streamed to other runtimes.
 * - ChunkCorrelationPlugin: Collects metadata on chunks to enable proper module loading across different runtimes.
 * - InvertedContainerPlugin: Adds custom runtime modules to the container runtime to allow a host to expose its
 *   own remote interface at startup.
 *
 * If automatic page stitching is enabled, a loader is added to process the `next/dist/client/page-loader.js`
 * file. If a custom library is specified in the options, an error is thrown. The options.library property is
 * also set to `{ type: 'window', name: options.name }`.
 */
export function applyClientPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions,
): void {
  const { webpack } = compiler;
  const { remotes, name } = options;
  //@ts-ignore
  compiler.options.output.publicPath = 'auto';
  // Build will hang without this. Likely something in my plugin
  compiler.options.optimization.splitChunks = undefined;

  new DelegateModulesPlugin({
    container: name,
    runtime: 'webpack',
    remotes,
    debug: extraOptions.debug,
    //@ts-ignore
  }).apply(compiler);

  // If automatic page stitching is enabled, add a new rule to the compiler's module rules
  if (extraOptions.automaticPageStitching) {
    console.warn('[nextjs-mf]', 'automatic page stitching is disabled in v7');
    // compiler.options.module.rules.push({
    //   test: /next[\\/]dist[\\/]client[\\/]page-loader\.js$/,
    //   loader: path.resolve(
    //     __dirname,
    //     '../../loaders/patchNextClientPageLoader'
    //   ),
    // });
  }

  // If a custom library is set, log an error message
  if (options.library) {
    console.error('[nextjs-mf] you cannot set custom library');
  }

  // Set the library option to be a window object with the name of the module federation plugin
  options.library = {
    type: 'window',
    name,
  };

  // Add a new chunk correlation plugin to the compiler
  new ChunkCorrelationPlugin({
    filename: [
      'static/chunks/federated-stats.json',
      'server/federated-stats.json',
    ],
    //@ts-ignore
  }).apply(compiler);

  // Add a new commonjs chunk loading plugin to the compiler
  new InvertedContainerPlugin({
    runtime: 'webpack',
    chunkToEmbed: 'host_inner_ctn',
    container: options.name,
    remotes: options.remotes as Record<string, string>,
    shared: options.shared as any,
    shareScope: 'default',
    exposes: options.exposes as any,
    debug: extraOptions.debug,
    //@ts-ignore
  }).apply(compiler);
}
