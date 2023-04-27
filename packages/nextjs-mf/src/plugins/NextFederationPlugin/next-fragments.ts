import type { Compiler } from 'webpack';
import { container } from 'webpack';
import path from 'path';
import type {
  ModuleFederationPluginOptions,
  SharedObject,
} from '@module-federation/utilities';
import {
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
  getDelegates,
} from '../../internal';

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
