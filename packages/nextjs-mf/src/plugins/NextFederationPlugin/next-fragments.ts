import type { Compiler } from 'webpack';
import { container } from 'webpack';
import path from 'path';
import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  SharedObject,
} from '@module-federation/utilities';
import { ChunkCorrelationPlugin } from '@module-federation/node';

import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import {
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
  getDelegates,
} from '../../internal';
import AddModulesPlugin from '../AddModulesToRuntime';

/**
 * Configures server-specific compiler options.
 *
 * @param compiler - The Webpack compiler instance.
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
  compiler.options.target = false;

  // Set chunkIds optimization to 'named'
  compiler.options.optimization.chunkIds = 'named'; // for debugging

  // Disable split chunks to prevent conflicts from occurring in the graph
  // TODO on the `compiler.options.optimization.splitChunks` line would be to find a way to only opt out chunks/modules related to module federation from chunk splitting logic.
  compiler.options.optimization.splitChunks = false;
}

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
export function applyClientPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions
): void {
  const { webpack } = compiler;
  const { remotes, name } = options;
  //@ts-ignore
  compiler.options.output.publicPath = 'auto';

  // Add a new plugin to hoist modules into remote runtime
  new AddModulesPlugin({
    debug: false,
    runtime: 'webpack',
    eager: true,
    remotes,
    // @ts-ignore
    shared: DEFAULT_SHARE_SCOPE_BROWSER,
    container: name + '_single',
    // @ts-ignore
    applicationName: name,
  }).apply(compiler);

  // If automatic page stitching is enabled, add a new rule to the compiler's module rules
  if (extraOptions.automaticPageStitching) {
    compiler.options.module.rules.push({
      test: /next[\\/]dist[\\/]client[\\/]page-loader\.js$/,
      loader: path.resolve(
        __dirname,
        '../../loaders/patchNextClientPageLoader'
      ),
    });
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

  // Add a new entry plugin to the compiler to delegate hoisting
  new webpack.EntryPlugin(
    compiler.context,
    require.resolve('../../internal-delegate-hoist'),
    'main'
  ).apply(compiler);

  // Add a new chunk correlation plugin to the compiler
  new ChunkCorrelationPlugin({
    filename: 'static/chunks/federated-stats.json',
  }).apply(compiler);

  // Add a new commonjs chunk loading plugin to the compiler
  new InvertedContainerPlugin({
    name: options.name,
    remotes: options.remotes as Record<string, string>,
    verbose: false,
  }).apply(compiler);
}

type ConstructableModuleFederationPlugin = new (
  options: ModuleFederationPluginOptions
) => container.ModuleFederationPlugin;

/**
 * Gets the appropriate ModuleFederationPlugin based on the environment.
 * @param {boolean} isServer - A flag to indicate if the environment is server-side or not.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @returns {ModuleFederationPlugin | undefined} The ModuleFederationPlugin or undefined if not applicable.
 */
export function getModuleFederationPluginConstructor(
  isServer: boolean,
  compiler: Compiler
): ConstructableModuleFederationPlugin {
  if (isServer) {
    return require('@module-federation/node')
      .NodeFederationPlugin as ConstructableModuleFederationPlugin;
  }
  return compiler.webpack.container
    .ModuleFederationPlugin as unknown as ConstructableModuleFederationPlugin;
}

/**

 Set up default shared values based on the environment.
 @param isServer - Boolean indicating if the code is running on the server.
 @returns The default share scope based on the environment.
 */
export const retrieveDefaultShared = (isServer: boolean): SharedObject => {
  // If the code is running on the server, treat some Next.js internals as import false to make them external
  // This is because they will be provided by the server environment and not by the remote container
  if (isServer) {
    return DEFAULT_SHARE_SCOPE;
  }
  // If the code is running on the client/browser, always bundle Next.js internals
  return DEFAULT_SHARE_SCOPE_BROWSER;
};

/**

 Inject module hoisting system.
 This function injects the module hoisting system into the webpack build process. The module hoisting system is a way to
 optimize the build process by hoisting dependencies into specific files that are hoisted into the webpack runtimes. This
 function is used by the NextFederationPlugin to optimize the build process when using module federation with Next.js.
 @param {boolean} isServer - A boolean indicating whether the code is running on the server.
 @param {ModuleFederationPluginOptions} options - The options for the ModuleFederationPlugin.
 @param {Compiler} compiler - The webpack compiler instance.
 */
export function injectModuleHoistingSystem(
  isServer: boolean,
  options: ModuleFederationPluginOptions,
  compiler: Compiler
) {
  // Set the default shared values based on the environment
  const defaultShared = retrieveDefaultShared(isServer);
  // Inject hoist dependency into the upper scope of the application
  const injectHoistDependency = {
    enforce: 'pre',
    test: /_document/,
    include: [compiler.context, /next\/dist/],
    loader: path.resolve(__dirname, '../../loaders/inject-hoist'),
  };

  // Populate hoist dependency with shared modules
  const populateHoistDependency = {
    test: /internal-delegate-hoist/,
    include: [/internal-delegate-hoist/, compiler.context, /next\/dist/],
    loader: path.resolve(__dirname, '../../loaders/share-scope-hoist'),
    options: {
      shared: defaultShared,
      name: !isServer && options.name,
    },
  };

  // Unshift the injectHoistDependency and populateHoistDependency to the front of the module.rules array
  compiler.options.module.rules.unshift(
    //@ts-ignore
    injectHoistDependency,
    populateHoistDependency
  );

  // The module hoisting system is a way to optimize the build process by hoisting dependencies into specific files that
  // are hoisted into the webpack runtimes. This function is used by the NextFederationPlugin to optimize the build process
  // when using module federation with Next.js. The function takes a boolean isServer, which is used to set the default
  // shared values based on the environment. The options argument is an object with options for the ModuleFederationPlugin.
  // The compiler argument is the webpack compiler instance.
}

/**

 Apply remote delegates.

 This function adds the remote delegates feature by configuring and injecting the appropriate loader that will look
 for internal delegate hoist or delegate hoist container and load it using a custom delegateLoader.
 Once loaded, it will then look for the available delegates that will be used to configure the remote
 that the hoisted module will be dependent upon.

 @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.

 @param {Compiler} compiler - The Webpack compiler instance.
 */
export function applyRemoteDelegates(
  options: ModuleFederationPluginOptions,
  compiler: Compiler
) {
  if (options.remotes) {
    // Get the available delegates
    const delegates = getDelegates(options.remotes);

    // Add the delegate loader for hoist and container to the module rules
    compiler.options.module.rules.push({
      enforce: 'pre',
      test: [/internal-delegate-hoist/, /delegate-hoist-container/],
      include: [
        compiler.context,
        /internal-delegate-hoist/,
        /delegate-hoist-container/,
        //eslint-disable-next-line
        /next[\/]dist/,
      ],
      loader: path.resolve(__dirname, '../../loaders/delegateLoader'),
      options: {
        delegates,
      },
    });
  }
}
