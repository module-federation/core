/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
'use strict';

import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
  SharedObject,
} from '@module-federation/utilities';
import { createRuntimeVariables } from '@module-federation/utilities';
import CopyFederationPlugin from './CopyFederationPlugin';
import AddModulesPlugin from './AddModulesToRuntime';
import { ChunkCorrelationPlugin } from '@module-federation/node';
import CommonJsChunkLoadingPlugin from './container/CommonJsChunkLoadingPlugin';
import type { Compiler, container } from 'webpack';
import { RuleSetConditionAbsolute } from 'webpack';
import path from 'path';

import {
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
  getDelegates,
  parseRemotes,
} from '../internal';
import AddRuntimeRequirementToPromiseExternal from './AddRuntimeRequirementToPromiseExternalPlugin';
import { exposeNextjsPages } from '../loaders/nextPageMapLoader';

type ConstructableModuleFederationPlugin = new (
  options: ModuleFederationPluginOptions
) => container.ModuleFederationPlugin;

const regexEqual = (
  x:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
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

// Utility function to set the main and extra options
function setOptions(options: NextFederationPluginOptions): {
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

// Utility function to validate compiler options
function validateCompilerOptions(compiler: Compiler): boolean {
  if (!compiler.options.name) {
    throw new Error('name is not defined in Compiler options');
  }

  if (!['server', 'client'].includes(compiler.options.name)) {
    return false;
  }
  return true;
}

// Utility function to validate NextFederationPlugin options
function validatePluginOptions(options: ModuleFederationPluginOptions): void {
  if (!options.filename) {
    throw new Error('filename is not defined in NextFederation options');
  }
}

/**
 * Configures server-specific compiler options.
 * @param {Compiler} compiler - The Webpack compiler instance.
 */
function configureServerCompilerOptions(compiler: Compiler): void {
  compiler.options.target = false;
  compiler.options.optimization.chunkIds = 'named';
  compiler.options.optimization.splitChunks = false;
}

/**
 * Applies server-specific plugins.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param options
 */
function applyServerPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions
): void {
  const { StreamingTargetPlugin } = require('@module-federation/node');

  new AddModulesPlugin({
    runtime: 'webpack-runtime',
    eager: true,
    remotes: options.remotes,
  }).apply(compiler);

  new AddModulesPlugin({
    runtime: options.name,
    eager: false,
    remotes: options.remotes,
  }).apply(compiler);

  new StreamingTargetPlugin(options, {
    ModuleFederationPlugin: compiler.webpack.container.ModuleFederationPlugin,
  }).apply(compiler);
}

/**
 * Configures server-specific library and filename options.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
function configureServerLibraryAndFilename(
  options: ModuleFederationPluginOptions
): void {
  options.library = {
    type: 'commonjs-module',
    name: options.name,
  };
  options.filename = path.basename(options.filename as string);
}

/**
 * Handles server-specific externals.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
function handleServerExternals(
  compiler: Compiler,
  options: ModuleFederationPluginOptions
): void {
  if (Array.isArray(compiler.options.externals)) {
    const originalExternals = compiler.options.externals[0];

    compiler.options.externals[0] = async function (ctx, callback) {
      if (
        ctx.request &&
        (ctx.request.includes('@module-federation/utilities') ||
          ctx.request.includes('internal-delegate-hoist') ||
          Object.keys(options.shared || {}).some(
            (key) =>
              // @ts-ignore
              options.shared?.[key]?.import !== false &&
              ctx?.request?.includes(key)
          ) ||
          ctx.request.includes('internal-delegate-hoist') ||
          ctx.request.includes('@module-federation/dashboard-plugin'))
      ) {
        return;
      }

      // @ts-ignore
      const fromNext = await originalExternals(ctx, callback);
      if (!fromNext) {
        return;
      }
      const req = fromNext.split(' ')[1];
      if (req.startsWith('next') || req.startsWith('react')) {
        return fromNext;
      }
      return;
    };
  }
}

// Utility function to remove unnecessary shared keys from the default share scope
function removeUnnecessarySharedKeys(shared: Record<string, unknown>): void {
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
 * Applies client-specific plugins.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param options
 * @param extraOptions
 */
function applyClientPlugins(
  compiler: Compiler,
  options: ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions
): void {
  const { webpack } = compiler;
  const { remotes, name } = options;

  new AddModulesPlugin({
    runtime: name,
    eager: false,
    remotes,
  }).apply(compiler);

  new AddModulesPlugin({
    runtime: 'webpack',
    eager: true,
    remotes,
    shared: DEFAULT_SHARE_SCOPE_BROWSER,
    container: name + '_single',
  }).apply(compiler);

  if (extraOptions.automaticPageStitching) {
    compiler.options.module.rules.push({
      test: /next[\\/]dist[\\/]client[\\/]page-loader\.js$/,
      loader: path.resolve(__dirname, '../loaders/patchNextClientPageLoader'),
    });
  }

  if (options.library) {
    console.error('[nextjs-mf] you cannot set custom library');
  }

  options.library = {
    type: 'window',
    name,
  };

  new webpack.EntryPlugin(
    compiler.context,
    require.resolve('../internal-delegate-hoist'),
    'main'
  ).apply(compiler);

  new ChunkCorrelationPlugin({
    filename: 'static/chunks/federated-stats.json',
  }).apply(compiler);

  new CommonJsChunkLoadingPlugin({
    asyncChunkLoading: true,
    name: options.name,
    remotes: options.remotes as Record<string, string>,
    baseURI: compiler.options.output.publicPath,
    verbose: true,
  }).apply(compiler);
}

/**
 * Gets the appropriate ModuleFederationPlugin based on the environment.
 * @param {boolean} isServer - A flag to indicate if the environment is server-side or not.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @returns {ModuleFederationPlugin | undefined} The ModuleFederationPlugin or undefined if not applicable.
 */
function getModuleFederationPluginConstructor(
  isServer: boolean,
  compiler: Compiler
): ConstructableModuleFederationPlugin {
  if (isServer) {
    return require('@module-federation/node')
      .NodeFederationPlugin as ConstructableModuleFederationPlugin;
  } else {
    return compiler.webpack.container
      .ModuleFederationPlugin as unknown as ConstructableModuleFederationPlugin;
  }
}

/**
 * Set up default shared values based on the environment.
 * @param isServer - Boolean indicating if the code is running on the server.
 */
const setDefaultShared = (isServer: boolean) => {
  return isServer ? DEFAULT_SHARE_SCOPE : DEFAULT_SHARE_SCOPE_BROWSER;
};

/**
 * Inject module hoisting system.
 */
function injectModuleHoistingSystem(isServer: boolean, compiler: Compiler) {
  const defaultShared = setDefaultShared(isServer);
  // Inject hoist dependency into the upper scope of the application
  const injectHoistDependency = {
    enforce: 'pre',
    test: /_document/,
    include: [compiler.context, /next[\\/]dist/],
    loader: path.resolve(__dirname, '../loaders/inject-hoist'),
  };

  // Populate hoist dependency with shared modules
  const populateHoistDependency = {
    test: /internal-delegate-hoist/,
    include: [/internal-delegate-hoist/, compiler.context, /next[\\/]dist/],
    loader: path.resolve(__dirname, '../loaders/share-scope-hoist'),
    options: {
      shared: defaultShared,
      name: !isServer && options.name,
    },
  };

  compiler.options.module.rules.unshift(
    //@ts-ignore
    injectHoistDependency,
    populateHoistDependency
  );

  return {
    applyAutomaticAsyncBoundary: () => {
      // Implementation of applyAutomaticAsyncBoundary
    },
    applyRemoteDelegates: () => {
      // Implementation of applyRemoteDelegates
    },
  };
}

/**
 * Apply automatic async boundary.
 */
function applyAutomaticAsyncBoundary(compiler: Compiler) {
  const allowedPaths = ['pages/', 'app/', 'src/pages/', 'src/app/'];

  const jsRules = compiler.options.module.rules.find((r) => {
    //@ts-ignore
    return r && r.oneOf;
  });

  //@ts-ignore
  if (jsRules && 'oneOf' in jsRules) {
    // @ts-ignore
    const foundJsLayer = jsRules.oneOf.find((r) => {
      return regexEqual(r.test, /\.(tsx|ts|js|cjs|mjs|jsx)$/) && !r.issuerLayer;
    });

    if (foundJsLayer) {
      let loaderChain = [];
      if (Array.isArray(foundJsLayer.use)) {
        loaderChain = [...foundJsLayer.use];
      } else {
        loaderChain = [foundJsLayer.use];
      }
      //@ts-ignore
      // @ts-ignore
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
            loader: path.resolve(__dirname, '../loaders/async-boundary-loader'),
          },
        ],
      });
    }
  }
}

/**
 * Apply remote delegates.
 */
function applyRemoteDelegates(options, compiler) {
  if (options.remotes) {
    const delegates = getDelegates(options.remotes);

    compiler.options.module.rules.push({
      enforce: 'pre',
      test: [/internal-delegate-hoist/, /delegate-hoist-container/],
      include: [
        compiler.context,
        /internal-delegate-hoist/,
        /delegate-hoist-container/,
        /next[\\/]dist/,
      ],
      loader: path.resolve(__dirname, '../loaders/delegateLoader'),
      options: {
        delegates,
      },
    });

    if (delegates && Object.keys(delegates).length > 0) {
      const knownDelegates = Object.entries(delegates).map(([name, remote]) => {
        const delegate = remote.replace('internal ', '').split('?')[0];
        return delegate;
      });

      if (this._options.exposes) {
        compiler.options.module.rules.push({
          enforce: 'pre',
          test(request: string) {
            const found = knownDelegates.some((delegate) => {
              return request.includes(delegate);
            });

            return found;
          },
          loader: path.resolve(__dirname, '../loaders/inject-single-host'),
          options: {
            name: this._options.name,
          },
        });
      }
    }
  }
}

// Create runtime variables.
//@ts-ignore
function createRuntimeVariables(webpack) {
  new webpack.DefinePlugin({
    'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
    'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
  }).apply(compiler);
}

/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application
 * federation using Module Federation.
 */
export class NextFederationPlugin {
  _options: ModuleFederationPluginOptions;
  _extraOptions: NextFederationPluginExtraOptions;

  /**
   * Constructs the NextFederationPlugin with the provided options.
   *
   * @param options The options to configure the plugin.
   */
  constructor(options: NextFederationPluginOptions) {
    const { mainOptions, extraOptions } = setOptions(options);
    this._options = mainOptions;
    this._extraOptions = extraOptions;
  }

  apply(compiler: Compiler) {
    // Validate the compiler options
    const validCompile = validateCompilerOptions(compiler);
    if (!validCompile) return;
    // Validate the NextFederationPlugin options
    validatePluginOptions(this._options);

    // Check if the compiler is for the server or client
    const isServer = compiler.options.name === 'server';
    const { webpack } = compiler;

    // Apply the CopyFederationPlugin
    new CopyFederationPlugin(isServer).apply(compiler);

    // If remotes are provided, parse them
    if (this._options.remotes) {
      this._options.remotes = parseRemotes(this._options.remotes);
    }

    // If shared modules are provided, remove unnecessary shared keys from the default share scope
    if (this._options.shared) {
      removeUnnecessarySharedKeys(this._options.shared as SharedObject);
    }

    const ModuleFederationPlugin: container.ModuleFederationPlugin =
      getModuleFederationPluginConstructor(isServer, compiler);

    // Ignore edge runtime and middleware builds.
    if (!ModuleFederationPlugin) {
      return;
    }

    if (isServer) {
      // Refactored server condition
      configureServerCompilerOptions(compiler);
      applyServerPlugins(compiler, this._options);
      configureServerLibraryAndFilename(this._options);
      handleServerExternals(compiler, this._options);
    } else {
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }

    const defaultShared = setDefaultShared(isServer);

    // @ts-ignore
    const hostFederationPluginOptions: ModuleFederationPluginOptions = {
      ...this._options,
      runtime: false,
      exposes: {
        __hoist: require.resolve('../delegate-hoist-container'),
        ...(this._extraOptions.exposePages
          ? exposeNextjsPages(compiler.options.context as string)
          : {}),
        ...this._options.exposes,
      },
      remotes: {
        //@ts-ignore
        ...this._options.remotes,
      },
      shared: {
        ...defaultShared,
        ...this._options.shared,
      },
    };

    compiler.options.devtool = 'source-map';

    //@ts-ignore
    compiler.options.output.publicPath = 'auto';
    compiler.options.output.uniqueName = this._options.name;

    // inject module hoisting system
    applyRemoteDelegates(this._options, compiler);

    if (this._extraOptions.automaticAsyncBoundary) {
      applyAutomaticAsyncBoundary(this._options, compiler);
    }

    //todo runtime variable creation needs to be applied for server as well. this is just for client
    // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
    new webpack.DefinePlugin({
      'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);

    if (ModuleFederationPlugin) {
      // @ts-ignore
      new ModuleFederationPlugin(hostFederationPluginOptions).apply(compiler);

      if (
        !isServer &&
        this._options.remotes &&
        Object.keys(this._options.remotes).length > 0
      ) {
        // single runtime chunk if host or circular remote uses remote of current host.
        // @ts-ignore
        new ModuleFederationPlugin({
          ...hostFederationPluginOptions,
          filename: undefined,
          runtime: undefined,
          name: this._options.name + '_single',
          library: {
            ...hostFederationPluginOptions.library,
            name: this._options.name + '_single',
          },
        }).apply(compiler);
      }
    }

    // new ChildFederationPlugin(this._options, this._extraOptions).apply(
    //   compiler
    // );
    new AddRuntimeRequirementToPromiseExternal().apply(compiler);

    // if (compiler.options.mode === 'development') {
    //   new DevHmrFixInvalidPongPlugin().apply(compiler);
    // }
  }
}

export default NextFederationPlugin;
