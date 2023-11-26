import type { Compiler } from 'webpack';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { HoistContainerReferences } from '@module-federation/enhanced/src/lib/container/HoistContainerReferencesPlugin';
import path from 'path';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import {
  ModuleFederationPlugin,
  ModuleInfoRuntimePlugin,
} from '@module-federation/enhanced';
/**
 * This function applies server-specific plugins to the webpack compiler.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 *
 * @returns {void}
 */
export function applyServerPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
): void {
  // Import the StreamingTargetPlugin from @module-federation/node
  const { StreamingTargetPlugin } = require('@module-federation/node');
  const chunkFileName = compiler.options?.output?.chunkFilename;
  const uniqueName = compiler?.options?.output?.uniqueName || options.name;
  if (
    typeof chunkFileName === 'string' &&
    uniqueName &&
    !chunkFileName.includes(uniqueName)
  ) {
    const suffix = `-[chunkhash].js`;
    compiler.options.output.chunkFilename = chunkFileName.replace(
      '.js',
      suffix,
    );
  }
  new ModuleInfoRuntimePlugin().apply(compiler);
  // Hoist container references into runtime chunks
  //@ts-ignore
  new HoistContainerReferences().apply(compiler);

  // Add the StreamingTargetPlugin with the ModuleFederationPlugin from the webpack container
  new StreamingTargetPlugin(options, {
    ModuleFederationPlugin: ModuleFederationPlugin,
  }).apply(compiler);

  // Add a new commonjs chunk loading plugin to the compiler
  new InvertedContainerPlugin({
    runtime: 'webpack-runtime',
    container: options.name,
    chunkToEmbed: 'host_inner_ctn',
    remotes: options.remotes as Record<string, string>,
    shared: options.shared as any,
    shareScope: 'default',
    exposes: options.exposes as any,
    debug: false,
    //@ts-ignore
  }).apply(compiler);
}

/**
 * This function configures server-specific library and filename options.
 *
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 *
 * @returns {void}
 *
 * @remarks
 * This function configures the library and filename options for server builds. The library option is
 * set to the commonjs-module format for chunks and the container, which allows them to be streamed over
 * to hosts with the NodeFederationPlugin. The filename option is set to the basename of the current
 * filename.
 */
export function configureServerLibraryAndFilename(
  options: ModuleFederationPluginOptions,
): void {
  // Configure the library option with type "commonjs-module" and the name from the options
  options.library = {
    type: 'commonjs-module',
    name: options.name,
  };

  // Set the filename option to the basename of the current filename
  options.filename = path.basename(options.filename as string);
}

/**
 * This function patches Next.js' default externals function to make sure shared modules are bundled and not treated as external.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 *
 * @returns {void}
 *
 * @remarks
 * In server builds, all node modules are treated as external, which prevents them from being shared
 * via module federation. To work around this limitation, we mark shared modules as internalizable
 * modules that webpack puts into chunks that can be streamed to other runtimes as needed.
 *
 * This function replaces Next.js' default externals function with a new asynchronous function that
 * checks whether a module should be treated as external. If the module should not be treated as
 * external, the function returns without calling the original externals function. Otherwise, the
 * function calls the original externals function and retrieves the result. If the result is null,
 * the function returns without further processing. If the module is from Next.js or React, the
 * function returns the original result. Otherwise, the function returns null.
 */
export function handleServerExternals(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
): void {
  // Use a regex to match the required external modules
  // const crittersRegex = 'critters';
  // const reactRegex = /^react$/;
  // const reactDomRegex = /^react-dom$/;
  // const nextCompiledRegex = /next\/dist\/compiled\/(?!server|client|shared).*/;
  if (
    Array.isArray(compiler.options.externals) &&
    compiler.options.externals[0]
  ) {
    // Retrieve the original externals function
    const originalExternals = compiler.options.externals[0];

    // Replace the original externals function with a new asynchronous function
    compiler.options.externals[0] = async function (ctx: any, callback: any) {
      //@ts-ignore
      const fromNext = await originalExternals(ctx, callback);
      // If the result is null, return without further processing
      if (!fromNext) {
        return;
      }
      // If the module is from Next.js or React, return the original result
      const req = fromNext.split(' ')[1];
      // Check if the module should not be treated as external
      if (
        ctx.request &&
        (ctx.request.includes('@module-federation/utilities') ||
          ctx.request.includes('internal-delegate-hoist') ||
          Object.keys(options.shared || {}).some((key) => {
            return (
              //@ts-ignore
              options.shared?.[key]?.import !== false &&
              (key.endsWith('/') ? req.includes(key) : req === key)
            );
          }) ||
          ctx.request.includes('@module-federation/dashboard-plugin'))
      ) {
        // If the module should not be treated as external, return without calling the original externals function
        return;
      }

      if (
        req.startsWith('next') ||
        // make sure we dont screw up package names that start with react
        // like react-carousel or react-spring
        req.startsWith('react/') ||
        req.startsWith('react-dom/') ||
        req === 'react' ||
        req === 'styled-jsx/style' ||
        req === 'react-dom'
      ) {
        return fromNext;
      }
      // Otherwise, return (null) to treat the module as internalizable
      return;
    };
    // compiler.options.externals.push(crittersRegex)
    // compiler.options.externals.push(reactRegex)
    // compiler.options.externals.push(reactDomRegex)
    // compiler.options.externals.push(nextCompiledRegex)
  }
}

/**
 * This function configures server-specific compiler options.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 *
 * @returns {void}
 *
 * @remarks
 * This function configures the compiler options for server builds. It turns off the compiler target on node
 * builds because it adds its own chunk loading runtime module with NodeFederationPlugin and StreamingTargetPlugin.
 * It also disables split chunks to prevent conflicts from occurring in the graph.
 *
 */
export function configureServerCompilerOptions(compiler: Compiler): void {
  // Turn off the compiler target on node builds because we add our own chunk loading runtime module
  // with NodeFederationPlugin and StreamingTargetPlugin
  compiler.options.node = {
    ...compiler.options.node,
    global: false,
  };
  // no custom chunk rules
  compiler.options.optimization.splitChunks = undefined;

  // solves strange issues where next doesnt create a runtime chunk
  // might be related to if an api route exists or not
  compiler.options.optimization.runtimeChunk = {
    name: 'webpack-runtime',
  };
}
