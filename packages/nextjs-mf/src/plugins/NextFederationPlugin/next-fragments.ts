import type { Compiler, RuleSetConditionAbsolute } from "webpack";
import { container } from "webpack";
import path from "path";
import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
  SharedObject
} from "@module-federation/utilities";
import { ChunkCorrelationPlugin } from "@module-federation/node";

import CommonJsChunkLoadingPlugin from "../container/CommonJsChunkLoadingPlugin";
import { DEFAULT_SHARE_SCOPE, DEFAULT_SHARE_SCOPE_BROWSER, getDelegates } from "../../internal";
import AddModulesPlugin from "../AddModulesToRuntime";

/**
 * Compares two regular expressions to see if they are equal.
 *
 * @param x - The first regular expression to compare.
 * @param y - The second regular expression to compare.
 * @returns True if the regular expressions are equal, false otherwise.
 *
 * @remarks
 * This function compares two regular expressions to see if they are equal in terms of their source,
 * global, ignoreCase, and multiline properties. It is used to check if two regular expressions match
 * the same pattern.
 */
export const regexEqual = (
  x:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetConditionAbsolute[]
    | undefined,
  y: RegExp
): boolean => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

// Utility function to remove unnecessary shared keys from the default share scope
export function removeUnnecessarySharedKeys(
  shared: Record<string, unknown>
): void {
  const warnings: string[] = Object.keys(shared).reduce(
    (acc: string[], key: string) => {
      if (DEFAULT_SHARE_SCOPE[key]) {
        acc.push(
          `[nextjs-mf] You are sharing ${key} from the default share scope. This is not necessary and can be removed.`
        );
        // Use a type assertion to inform TypeScript that 'key' can be used as an index for the 'shared' object
        delete (shared as { [key: string]: unknown })[key];
      }
      return acc;
    },
    []
  );

  if (warnings.length > 0) {
    console.warn('%c' + warnings.join('\n'), 'color: red');
  }
}

/**
 * Utility function to set the main and extra options.
 *
 * @param options - The NextFederationPluginOptions instance.
 * @returns An object containing the main options and extra options.
 *
 * @remarks
 * This function sets the main and extra options for NextFederationPlugin. It splits the options object into
 * the main options and extra options, and sets default values for any options that are not defined. The default
 * extra options are:
 * - automaticPageStitching: false
 * - enableImageLoaderFix: false
 * - enableUrlLoaderFix: false
 * - skipSharingNextInternals: false
 * - automaticAsyncBoundary: false
 */
export function setOptions(options: NextFederationPluginOptions): {
  mainOptions: ModuleFederationPluginOptions;
  extraOptions: NextFederationPluginExtraOptions;
} {
  const { extraOptions, ...mainOpts } = options;

  const defaultExtraOptions: NextFederationPluginExtraOptions = {
    automaticPageStitching: false,
    enableImageLoaderFix: false,
    enableUrlLoaderFix: false,
    skipSharingNextInternals: false,
    automaticAsyncBoundary: false,
  };

  return {
    mainOptions: mainOpts,
    extraOptions: { ...defaultExtraOptions, ...extraOptions },
  };
}

/**
 * Utility function to validate compiler options.
 *
 * @param compiler - The Webpack compiler instance.
 * @returns True if the compiler options are valid, false otherwise.
 *
 * @remarks
 * This function validates the options passed to the Webpack compiler. It throws an error if the name
 * option is not defined in the options. It also checks if the name option is set to either "server" or
 * "client", as Module Federation is only applied to the main server and client builds in Next.js.
 */
export function validateCompilerOptions(compiler: Compiler): boolean {
  // Throw an error if the name option is not defined in the options
  if (!compiler.options.name) {
    throw new Error('name is not defined in Compiler options');
  }

  // Only apply Module Federation to the main server and client builds in Next.js
  return ['server', 'client'].includes(compiler.options.name);
}

/**
 * Utility function to validate NextFederationPlugin options.
 *
 * @param options - The ModuleFederationPluginOptions instance.
 *
 * @remarks
 * This function validates the options passed to NextFederationPlugin. It throws an error if the filename
 * option is not defined in the options.
 *
 * A requirement for using Module Federation is that a name must be specified.
 */
export function validatePluginOptions(
  options: ModuleFederationPluginOptions
): void {
  // Throw an error if the filename option is not defined in the options
  if (!options.filename) {
    throw new Error('filename is not defined in NextFederation options');
  }

  // A requirement for using Module Federation is that a name must be specified
  if (!options.name) {
    throw new Error('Module federation "name" option must be specified');
  }
}

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
 * Applies server-specific plugins.
 *
 * @param compiler - The Webpack compiler instance.
 * @param options - The ModuleFederationPluginOptions instance.
 *
 * @remarks
 * The AddModulesPlugin lets us move modules between webpack chunks. In this case,
 * we are moving modules into the runtime chunks of the host and removing eager shared
 * modules from the remote container runtimes. This works around Next.js' lack of async
 * boundary, allowing us to execute the code more efficiently and with better performance.
 * By removing eager shared modules from the remote container runtimes, we can also improve
 * the load time of the application by reducing the amount of unnecessary code that needs
 * to be loaded.
 */
export function applyServerPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions
): void {
  // Import the StreamingTargetPlugin from @module-federation/node
  const { StreamingTargetPlugin } = require('@module-federation/node');

  // Add the AddModulesPlugin for the webpack runtime with eager loading and remote configuration
  new AddModulesPlugin({
    runtime: 'webpack-runtime',
    eager: true,
    remotes: options.remotes,
  }).apply(compiler);

  // Add the AddModulesPlugin for the server with lazy loading and remote configuration
  new AddModulesPlugin({
    runtime: options.name,
    eager: false,
    remotes: options.remotes,
  }).apply(compiler);

  // Add the StreamingTargetPlugin with the ModuleFederationPlugin from the webpack container
  new StreamingTargetPlugin(options, {
    ModuleFederationPlugin: compiler.webpack.container.ModuleFederationPlugin,
  }).apply(compiler);
}

/**
 * Configures server-specific library and filename options.
 *
 * @param options - The ModuleFederationPluginOptions instance.
 *
 * @remarks
 * This function configures the library and filename options for server builds. The library option is
 * set to the commonjs-module format for chunks and the container, which allows them to be streamed over
 * to hosts with the NodeFederationPlugin. The filename option is set to the basename of the current
 * filename.
 */
export function configureServerLibraryAndFilename(
  options: ModuleFederationPluginOptions
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
 * Patches Next.js' default externals function to make sure shared modules are bundled and not treated as external.
 *
 * @param compiler - The Webpack compiler instance.
 * @param options - The ModuleFederationPluginOptions instance.
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
  options: ModuleFederationPluginOptions
): void {
  // Check if the compiler has an `externals` array
  if (
    Array.isArray(compiler.options.externals) &&
    compiler.options.externals[0]
  ) {
    // Retrieve the original externals function
    const originalExternals = compiler.options.externals[0];

    // Replace the original externals function with a new asynchronous function
    compiler.options.externals[0] = async function (ctx, callback) {
      // Check if the module should not be treated as external
      if (
        ctx.request &&
        (ctx.request.includes('@module-federation/utilities') ||
          ctx.request.includes('internal-delegate-hoist') ||
          Object.keys(options.shared || {}).some((key) => {
            return (
              //@ts-ignore
              options.shared?.[key]?.import !== false &&
              ctx?.request?.includes(key)
            );
          }) ||
          ctx.request.includes('@module-federation/dashboard-plugin'))
      ) {
        // If the module should not be treated as external, return without calling the original externals function
        return;
      }

      // Call the original externals function and retrieve the result
      // @ts-ignore
      const fromNext = await originalExternals(ctx, callback);

      // If the result is null, return without further processing
      if (!fromNext) {
        return;
      }

      // If the module is from Next.js or React, return the original result
      const req = fromNext.split(' ')[1];
      if (req.startsWith('next') || req.startsWith('react')) {
        return fromNext;
      }

      // Otherwise, return null
      return;
    };
  }
}

/**

 Apply automatic async boundary.
 @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 @param {NextFederationPluginExtraOptions} extraOptions - The NextFederationPluginExtraOptions instance.
 @param {Compiler} compiler - The Webpack compiler instance.
 */
export function applyAutomaticAsyncBoundary(
  options: ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions,
  compiler: Compiler
) {
  const allowedPaths = ['pages/', 'app/', 'src/pages/', 'src/app/'];

  const jsRules = compiler.options.module.rules.find((r) => {
    //@ts-ignore
    return r && r.oneOf;
  });

  //@ts-ignore
  if (jsRules && 'oneOf' in jsRules) {
    // @ts-ignore
    const foundJsLayer = jsRules.oneOf.find((r) => {
      //@ts-ignore
      return regexEqual(r.test, /\.(tsx|ts|js|cjs|mjs|jsx)$/) && !r.issuerLayer;
    });

    if (foundJsLayer) {
      const loaderChain = Array.isArray(foundJsLayer.use)
        ? foundJsLayer.use
        : [foundJsLayer.use];

      // Add a new rule for pages that need async boundaries
      //@ts-ignore
      jsRules.oneOf.unshift({
        test: (request: string) => {
          if (
            allowedPaths.some((p) =>
              request.includes(path.join(compiler.context, p))
            )
          ) {
            return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(request);
          }
          return false;
        },
        exclude: [
          /node_modules/,
          /_document/,
          /_middleware/,
          /pages[\\/]middleware/,
          /pages[\\/]api/,
        ],
        resourceQuery: (query: string) => !query.includes('hasBoundary'),
        use: [
          //@ts-ignore
          ...loaderChain,
          //@ts-ignore
          {
            // This loader auto-wraps page entrypoints
            // and re-exports them as a dynamic import so module sharing works without eager issues.
            loader: path.resolve(
              __dirname,
              '../../loaders/async-boundary-loader'
            ),
          },
        ],
      });
    }
  }
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
 * - CommonJsChunkLoadingPlugin: Adds custom runtime modules to the container runtime to allow a host to expose its
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

  // Add a new plugin to hoist modules into remote runtime
  new AddModulesPlugin({
    runtime: 'webpack',
    eager: true,
    remotes,
    shared: DEFAULT_SHARE_SCOPE_BROWSER,
    container: name + '_single',
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
  new CommonJsChunkLoadingPlugin({
    asyncChunkLoading: true,
    name: options.name,
    remotes: options.remotes as Record<string, string>,
    baseURI: compiler.options.output.publicPath,
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

 This function adds the remote delegates feature by configuring and injecting the appropriate loader that will look for internal delegate hoist or delegate hoist container and load it using a custom delegateLoader. Once loaded, it will then look for the available delegates that will be used to configure the remote that the hoisted module will be dependent upon.

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
        /next[\/]dist/,
      ],
      loader: path.resolve(__dirname, '../../loaders/delegateLoader'),
      options: {
        delegates,
      },
    });

    // If there are available delegates, add the inject-single-host loader
    if (delegates && Object.keys(delegates).length > 0) {
      // Get the names of the available delegates
      const knownDelegates = Object.entries(delegates).map(([name, remote]) => {
        return remote.replace('internal ', '').split('?')[0];
      });

      if (options.exposes) {
        // Add the inject-single-host loader to the module rules
        compiler.options.module.rules.push({
          enforce: 'pre',
          test(request: string) {
            return knownDelegates.some(request.includes.bind(request));
          },
          loader: path.resolve(__dirname, '../../loaders/inject-single-host'),
          options: {
            name: options.name,
          },
        });
      }
    }
  }
}
