import { Compiler } from 'webpack';
import { ModuleFederationPluginOptions, NextFederationPluginExtraOptions } from '@module-federation/utilities';
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
 * - AddModulesPlugin: Adds modules to the webpack container runtime that can be streamed to other runtimes.
 * - EntryPlugin: Creates an entry point for the application that delegates module loading to the container runtime.
 * - ChunkCorrelationPlugin: Collects metadata on chunks to enable proper module loading across different runtimes.
 * - InvertedContainerPlugin: Adds custom runtime modules to the container runtime to allow a host to expose its
 *   own remote interface at startup.
 *
 * If automatic page stitching is enabled, a loader is added to process the `next/dist/client/page-loader.js`
 * file. If a custom library is specified in the options, an error is thrown. The options.library property is
 * also set to `{ type: 'window', name: options.name }`.
 */
export declare function applyClientPlugins(compiler: Compiler, options: ModuleFederationPluginOptions, extraOptions: NextFederationPluginExtraOptions): void;
