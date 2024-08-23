import type { Compiler } from 'webpack';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { HoistContainerReferencesPlugin } from '@module-federation/enhanced';
import path from 'path';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';

/**
 * Applies server-specific plugins to the webpack compiler.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
export function applyServerPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
): void {
  const chunkFileName = compiler.options?.output?.chunkFilename;
  const uniqueName = compiler?.options?.output?.uniqueName || options.name;
  const suffix = `-[chunkhash].js`;

  if (
    typeof chunkFileName === 'string' &&
    uniqueName &&
    !chunkFileName.includes(uniqueName)
  ) {
    compiler.options.output.chunkFilename = chunkFileName.replace(
      '.js',
      suffix,
    );
  }

  new HoistContainerReferencesPlugin(`${options.name}_partial`).apply(compiler);
  new InvertedContainerPlugin({
    runtime: 'webpack-runtime',
    container: options.name,
    remotes: options.remotes as Record<string, string>,
    debug: false,
    //@ts-ignore
  }).apply(compiler);
}

/**
 * Configures server-specific library and filename options.
 *
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
export function configureServerLibraryAndFilename(
  options: ModuleFederationPluginOptions,
): void {
  // Set the library option to "commonjs-module" format with the name from the options
  options.library = {
    type: 'commonjs-module',
    name: options.name,
  };

  // Set the filename option to the basename of the current filename
  options.filename = path.basename(options.filename as string);
}

/**
 * Patches Next.js' default externals function to ensure shared modules are bundled and not treated as external.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
export function handleServerExternals(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
): void {
  if (
    Array.isArray(compiler.options.externals) &&
    compiler.options.externals[0]
  ) {
    // Retrieve the original externals function
    const originalExternals = compiler.options.externals[0];

    // Replace the original externals function with a new asynchronous function
    compiler.options.externals[0] = async function (ctx: any, callback: any) {
      // @ts-ignore
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
          Object.keys(options.shared || {}).some((key) => {
            return (
              // @ts-ignore
              options.shared?.[key]?.import !== false &&
              (key.endsWith('/') ? req.includes(key) : req === key)
            );
          }) ||
          ctx.request.includes('@module-federation/'))
      ) {
        // If the module should not be treated as external, return without calling the original externals function
        return;
      }

      if (
        req.startsWith('next') ||
        // Ensure package names starting with "react" are not affected
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
  }
}

/**
 * Configures server-specific compiler options.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 */
export function configureServerCompilerOptions(compiler: Compiler): void {
  // Disable the global option in node builds and set the target to "async-node"
  compiler.options.node = {
    ...compiler.options.node,
    global: false,
  };
  compiler.options.target = 'async-node';
  // Disable custom chunk rules
  compiler.options.optimization.splitChunks = undefined;

  // Ensure a runtime chunk is created
  compiler.options.optimization.runtimeChunk = {
    name: 'webpack-runtime',
  };
}
