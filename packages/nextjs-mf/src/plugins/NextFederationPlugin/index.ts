/**
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Zackary Jackson @ScriptedAlchemy
 * This module contains the NextFederationPlugin class which is a webpack plugin that handles Next.js application federation using Module Federation.
 */
'use strict';

import type {
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from './next-fragments';
import type { Compilation, Compiler, WebpackPluginInstance } from 'webpack';
import path from 'path';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type EnhancedWebpackModule =
  typeof import('@module-federation/enhanced/webpack');
type CopyFederationPluginCtor =
  typeof import('../CopyFederationPlugin').default;
type EnhancedFederationRuntimePluginCtor = new (
  options?: moduleFederationPlugin.ModuleFederationPluginOptions,
) => {
  entryFilePath: string;
  getFilePath(compiler: Compiler): string;
  ensureFile(compiler: Compiler): void;
};
type ContainerEntryDependencyLike = {
  injectRuntimeEntry?: string;
};
type EnhancedRuntimeSupport = {
  FederationModulesPlugin: {
    getCompilationHooks: (compilation: Compilation) => {
      addContainerEntryDependency: {
        tap: (
          pluginName: string,
          handler: (dependency: ContainerEntryDependencyLike) => void,
        ) => void;
      };
    };
  };
  FederationRuntimePlugin: EnhancedFederationRuntimePluginCtor;
};

const runtimeRequireFromModule = new Function(
  'moduleRef',
  'id',
  'return moduleRef && moduleRef.require ? moduleRef.require(id) : undefined',
) as (moduleRef: { require(id: string): any } | undefined, id: string) => any;

const runtimeRequire = (id: string) =>
  runtimeRequireFromModule(
    typeof module !== 'undefined' ? module : undefined,
    id,
  );

const loadModule = <T>(id: string): T => {
  const loadedModule = runtimeRequire(id) as T | { default: T };

  if (!loadedModule) {
    throw new Error(`Unable to require module at runtime: ${id}`);
  }

  return (loadedModule as { default?: T }).default
    ? (loadedModule as { default: T }).default
    : (loadedModule as T);
};

const loadSdk = () =>
  runtimeRequire(
    '@module-federation/sdk',
  ) as typeof import('@module-federation/sdk');
const loadNormalizeWebpackPath = () =>
  runtimeRequire(
    '@module-federation/sdk/normalize-webpack-path',
  ) as typeof import('@module-federation/sdk/normalize-webpack-path');
const loadCopyFederationPlugin = (): CopyFederationPluginCtor =>
  loadModule<CopyFederationPluginCtor>('../CopyFederationPlugin');
const loadNextPageMapLoader = () =>
  runtimeRequire(
    '../../loaders/nextPageMapLoader',
  ) as typeof import('../../loaders/nextPageMapLoader');
const loadNextFragments = () =>
  runtimeRequire('./next-fragments') as typeof import('./next-fragments');
const loadSetOptions = () =>
  runtimeRequire('./set-options') as typeof import('./set-options');
const loadValidateOptions = () =>
  runtimeRequire('./validate-options') as typeof import('./validate-options');
const loadApplyServerPlugins = () =>
  runtimeRequire(
    './apply-server-plugins',
  ) as typeof import('./apply-server-plugins');
const loadApplyClientPlugins = () =>
  runtimeRequire(
    './apply-client-plugins',
  ) as typeof import('./apply-client-plugins');
const loadLogger = () =>
  loadModule<typeof import('../../logger').default>('../../logger');
const loadNextRequireHook = () =>
  require('next/dist/server/require-hook') as typeof import('next/dist/server/require-hook');
const resolveEnhancedRuntimeCoreModulePath = (moduleName: string) => {
  const enhancedEntryDir = path.dirname(
    require.resolve('@module-federation/enhanced'),
  );

  return path.join(
    enhancedEntryDir,
    process.env['IS_ESM_BUILD'] === 'true'
      ? `lib/container/runtime/${moduleName}.mjs`
      : `lib/container/runtime/${moduleName}.js`,
  );
};
const loadEnhancedRuntimeSupport = (): EnhancedRuntimeSupport => {
  const enhancedModule = runtimeRequire('@module-federation/enhanced') as
    | EnhancedRuntimeSupport
    | { default?: EnhancedRuntimeSupport };

  if (
    enhancedModule &&
    typeof enhancedModule === 'object' &&
    'FederationModulesPlugin' in enhancedModule &&
    'FederationRuntimePlugin' in enhancedModule
  ) {
    return enhancedModule as EnhancedRuntimeSupport;
  }

  const defaultExport = (enhancedModule as { default?: EnhancedRuntimeSupport })
    .default;
  if (
    defaultExport &&
    typeof defaultExport === 'object' &&
    'FederationModulesPlugin' in defaultExport &&
    'FederationRuntimePlugin' in defaultExport
  ) {
    return defaultExport;
  }

  return enhancedModule as EnhancedRuntimeSupport;
};
const loadFederationRuntimePluginCtor =
  (): EnhancedFederationRuntimePluginCtor => {
    try {
      const runtimePluginModule = runtimeRequire(
        resolveEnhancedRuntimeCoreModulePath('FederationRuntimePlugin'),
      ) as
        | EnhancedFederationRuntimePluginCtor
        | { default?: EnhancedFederationRuntimePluginCtor };

      if (
        runtimePluginModule &&
        typeof runtimePluginModule === 'object' &&
        'default' in runtimePluginModule &&
        runtimePluginModule.default
      ) {
        return runtimePluginModule.default;
      }

      return runtimePluginModule as EnhancedFederationRuntimePluginCtor;
    } catch {
      return loadEnhancedRuntimeSupport().FederationRuntimePlugin;
    }
  };
const loadFederationModulesPlugin =
  (): EnhancedRuntimeSupport['FederationModulesPlugin'] => {
    try {
      const modulesPluginModule = runtimeRequire(
        resolveEnhancedRuntimeCoreModulePath('FederationModulesPlugin'),
      ) as
        | EnhancedRuntimeSupport['FederationModulesPlugin']
        | { default?: EnhancedRuntimeSupport['FederationModulesPlugin'] };

      if (
        modulesPluginModule &&
        typeof modulesPluginModule === 'object' &&
        'default' in modulesPluginModule &&
        modulesPluginModule.default
      ) {
        return modulesPluginModule.default;
      }

      return modulesPluginModule as EnhancedRuntimeSupport['FederationModulesPlugin'];
    } catch {
      return loadEnhancedRuntimeSupport().FederationModulesPlugin;
    }
  };

const localWebpackPathEnvKey = 'NEXT_MF_LOCAL_WEBPACK_PATH';
let patchedWebpackSourcesAlias: string | undefined;

const patchNextWebpackSourcesAlias = (compiler: Compiler) => {
  try {
    const nextRequireHook = loadNextRequireHook();
    const addHookAliases = nextRequireHook?.addHookAliases;
    if (typeof addHookAliases !== 'function') {
      return;
    }
    const localWebpack = compiler.webpack;
    const localWebpackSources = localWebpack.sources;

    if (!localWebpackSources) {
      return;
    }

    const localWebpackEntry = Object.keys(require.cache).find((cacheKey) => {
      const cacheExports = require.cache[cacheKey]?.exports as
        | undefined
        | {
            sources?: unknown;
            webpack?: { sources?: unknown };
          };

      return (
        cacheExports === localWebpack ||
        cacheExports?.sources === localWebpackSources ||
        cacheExports?.webpack?.sources === localWebpackSources
      );
    });
    if (localWebpackEntry) {
      process.env[localWebpackPathEnvKey] = localWebpackEntry;
    } else if (
      process.env['FEDERATION_WEBPACK_PATH'] &&
      !process.env[localWebpackPathEnvKey]
    ) {
      process.env[localWebpackPathEnvKey] =
        process.env['FEDERATION_WEBPACK_PATH'];
    }
    const webpackSourcesShimPath =
      require.resolve('@module-federation/nextjs-mf/dist/src/plugins/NextFederationPlugin/webpack-sources-shim.js');

    if (patchedWebpackSourcesAlias === webpackSourcesShimPath) {
      return;
    }

    patchedWebpackSourcesAlias = webpackSourcesShimPath;
    addHookAliases([
      ['webpack-sources', webpackSourcesShimPath],
      ['webpack-sources/lib', webpackSourcesShimPath],
      ['webpack-sources/lib/index', webpackSourcesShimPath],
      ['webpack-sources/lib/index.js', webpackSourcesShimPath],
    ]);
  } catch {
    // The hook only exists inside Next's config/bootstrap flow.
  }
};

const resolveRuntimePluginPath = (): string =>
  process.env['IS_ESM_BUILD'] === 'true'
    ? require.resolve('@module-federation/nextjs-mf/dist/src/plugins/container/runtimePlugin.mjs')
    : require.resolve('@module-federation/nextjs-mf/dist/src/plugins/container/runtimePlugin.js');
const ensureContainerRuntimeEntry = (
  compiler: Compiler,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
) => {
  try {
    const FederationModulesPlugin = loadFederationModulesPlugin();
    const FederationRuntimePlugin = loadFederationRuntimePluginCtor();
    const federationRuntimePlugin = new FederationRuntimePlugin(options);
    const runtimeEntryPath = federationRuntimePlugin.getFilePath(compiler);
    federationRuntimePlugin.entryFilePath = runtimeEntryPath;
    federationRuntimePlugin.ensureFile(compiler);

    compiler.hooks.thisCompilation.tap(
      'NextFederationPlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        hooks.addContainerEntryDependency.tap(
          'NextFederationPlugin',
          (dependency: ContainerEntryDependencyLike) => {
            if (
              typeof dependency.injectRuntimeEntry !== 'string' ||
              dependency.injectRuntimeEntry.trim().length === 0
            ) {
              dependency.injectRuntimeEntry =
                runtimeEntryPath || resolveRuntimePluginPath();
            }
          },
        );
      },
    );
    return runtimeEntryPath;
  } catch {
    // Keep Next bootstrap resilient if enhanced runtime internals are unavailable.
    return undefined;
  }
};

const resolveNoopPath = (): string =>
  process.env['IS_ESM_BUILD'] === 'true'
    ? require.resolve('@module-federation/nextjs-mf/dist/src/federation-noop.mjs')
    : require.resolve('@module-federation/nextjs-mf/dist/src/federation-noop.js');

const resolveNodeRuntimePluginPath = (): string => {
  const nodePackageRoot = path.dirname(
    require.resolve('@module-federation/node/package.json'),
  );

  return require.resolve(
    path.join(
      nodePackageRoot,
      process.env['IS_ESM_BUILD'] === 'true'
        ? 'dist/src/runtimePlugin.mjs'
        : 'dist/src/runtimePlugin.js',
    ),
  );
};
/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application federation using Module Federation.
 */
export class NextFederationPlugin {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;
  public name: string;
  /**
   * Constructs the NextFederationPlugin with the provided options.
   *
   * @param options The options to configure the plugin.
   */
  constructor(options: NextFederationPluginOptions) {
    const { setOptions } = loadSetOptions();
    const { mainOptions, extraOptions } = setOptions(options);
    this._options = mainOptions;
    this._extraOptions = extraOptions;
    this.name = 'ModuleFederationPlugin';
  }

  /**
   * The apply method is called by the webpack compiler and allows the plugin to hook into the webpack process.
   * @param compiler The webpack compiler object.
   */
  apply(compiler: Compiler) {
    const { bindLoggerToCompiler } = loadSdk();
    const logger = loadLogger();
    const { getWebpackPath } = loadNormalizeWebpackPath();
    const CopyFederationPlugin = loadCopyFederationPlugin();
    let preparedRuntimeEntryPath: string | undefined;

    bindLoggerToCompiler(logger, compiler, 'NextFederationPlugin');
    compiler.hooks.normalModuleFactory.tap(
      'NextFederationPlugin',
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tap(
          'NextFederationPlugin',
          (resolveData) => {
            if (
              !resolveData ||
              typeof resolveData.request !== 'string' ||
              resolveData.request.trim().length > 0
            ) {
              return;
            }

            const hasFederationRuntimeDependency = (
              resolveData.dependencies || []
            ).some((dependency) => {
              return (
                (dependency as { type?: string } | undefined)?.type ===
                'federation runtime dependency'
              );
            });
            const hasEntryDependency = (resolveData.dependencies || []).some(
              (dependency) => {
                const typedDependency = dependency as
                  | { type?: string; constructor?: { name?: string } }
                  | undefined;
                return (
                  typedDependency?.type === 'entry' ||
                  typedDependency?.constructor?.name === 'EntryDependency'
                );
              },
            );

            if (hasFederationRuntimeDependency || hasEntryDependency) {
              resolveData.request =
                preparedRuntimeEntryPath || resolveRuntimePluginPath();
            }
          },
        );
      },
    );
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] ||
      getWebpackPath(compiler, { framework: 'nextjs' });
    patchNextWebpackSourcesAlias(compiler);
    if (!this.validateOptions(compiler)) return;
    const isServer = this.isServerCompiler(compiler);
    const isAppDirectory = this.isAppDirectory(compiler);
    new CopyFederationPlugin(isServer).apply(compiler);
    const normalFederationPluginOptions = this.getNormalFederationPluginOptions(
      compiler,
      isServer,
      isAppDirectory,
    );
    this._options = normalFederationPluginOptions;
    this.applyConditionalPlugins(compiler, isServer, isAppDirectory);

    const { ModuleFederationPlugin } =
      require('@module-federation/enhanced/webpack') as EnhancedWebpackModule;

    preparedRuntimeEntryPath = ensureContainerRuntimeEntry(
      compiler,
      normalFederationPluginOptions,
    );
    new ModuleFederationPlugin(normalFederationPluginOptions).apply(compiler);

    const noop = this.getNoopPath();

    if (!this._extraOptions.skipSharingNextInternals && !isAppDirectory) {
      compiler.hooks.make.tapAsync(
        'NextFederationPlugin',
        (compilation, callback) => {
          const dep = compiler.webpack.EntryPlugin.createDependency(
            noop,
            'noop',
          );
          compilation.addEntry(
            compiler.context,
            dep,
            { name: 'noop' },
            (err, module) => {
              if (err) {
                return callback(err);
              }
              callback();
            },
          );
        },
      );
    }

    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [
        //@ts-ignore
        (message) => /your target environment does not appear/.test(message),
      ];
    }
  }

  private validateOptions(compiler: Compiler): boolean {
    const { validateCompilerOptions, validatePluginOptions } =
      loadValidateOptions();
    const logger = loadLogger();

    const compilerValid = validateCompilerOptions(compiler);
    const pluginValid = validatePluginOptions(this._options);
    const envValid = process.env['NEXT_PRIVATE_LOCAL_WEBPACK'];
    if (compilerValid === undefined) logger.error('Compiler validation failed');
    if (pluginValid === undefined) logger.error('Plugin validation failed');
    const validCompilerTarget =
      compiler.options.name === 'server' || compiler.options.name === 'client';
    if (!envValid)
      throw new Error(
        'process.env.NEXT_PRIVATE_LOCAL_WEBPACK is not set to true, please set it to true, and "npm install webpack"',
      );
    return (
      compilerValid !== undefined &&
      pluginValid !== undefined &&
      validCompilerTarget
    );
  }

  private isServerCompiler(compiler: Compiler): boolean {
    return compiler.options.name === 'server';
  }

  private isAppDirectory(compiler: Compiler): boolean {
    const pluginNames = (compiler.options.plugins || []).map((plugin) => {
      const candidate = plugin as
        | { constructor?: { name?: string }; name?: string }
        | undefined;
      return candidate?.constructor?.name || candidate?.name || '';
    });

    if (
      pluginNames.includes('FlightClientEntryPlugin') ||
      pluginNames.includes('ClientReferenceManifestPlugin')
    ) {
      return true;
    }

    const manifestPlugin = compiler.options.plugins.find(
      (plugin): plugin is WebpackPluginInstance =>
        plugin?.constructor?.name === 'BuildManifestPlugin',
    ) as
      | (WebpackPluginInstance & {
          appDirEnabled?: boolean;
        })
      | undefined;

    return Boolean(manifestPlugin?.appDirEnabled);
  }

  private applyConditionalPlugins(
    compiler: Compiler,
    isServer: boolean,
    isAppDirectory: boolean,
  ) {
    const { applyPathFixes, retrieveDefaultShared } = loadNextFragments();
    compiler.options.output.uniqueName = this._options.name;
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      asyncFunction: true,
    };

    // Add layer rules for resource queries
    if (!compiler.options.module.rules) {
      compiler.options.module.rules = [];
    }

    // Add layer rules for RSC, client and SSR
    compiler.options.module.rules.push({
      resourceQuery: /\?rsc/,
      layer: 'rsc',
    });

    compiler.options.module.rules.push({
      resourceQuery: /\?client/,
      layer: 'client',
    });

    compiler.options.module.rules.push({
      resourceQuery: /\?ssr/,
      layer: 'ssr',
    });

    applyPathFixes(compiler, this._options, this._extraOptions);
    if (this._extraOptions.debug) {
      compiler.options.devtool = false;
    }

    if (isServer) {
      const {
        applyServerPlugins,
        configureServerCompilerOptions,
        configureServerLibraryAndFilename,
        handleServerExternals,
      } = loadApplyServerPlugins();
      configureServerCompilerOptions(compiler);
      configureServerLibraryAndFilename(this._options);
      applyServerPlugins(compiler, this._options);
      handleServerExternals(compiler, {
        ...this._options,
        shared: {
          ...retrieveDefaultShared(isServer, isAppDirectory),
          ...this._options.shared,
        },
      });
    } else {
      const { applyClientPlugins } = loadApplyClientPlugins();
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }
  }

  private getNormalFederationPluginOptions(
    compiler: Compiler,
    isServer: boolean,
    isAppDirectory: boolean,
  ): moduleFederationPlugin.ModuleFederationPluginOptions {
    const { retrieveDefaultShared } = loadNextFragments();
    const { exposeNextjsPages } = loadNextPageMapLoader();
    const defaultShared = this._extraOptions.skipSharingNextInternals
      ? {}
      : retrieveDefaultShared(isServer, isAppDirectory);

    return {
      ...this._options,
      runtime: false,
      remoteType: 'script',
      runtimePlugins: [
        ...(isServer ? [resolveNodeRuntimePluginPath()] : []),
        resolveRuntimePluginPath(),
        ...(this._options.runtimePlugins || []),
      ].map((plugin) => plugin + '?runtimePlugin'),
      //@ts-ignore
      exposes: {
        ...this._options.exposes,
        ...(this._extraOptions.exposePages
          ? exposeNextjsPages(compiler.options.context as string)
          : {}),
      },
      remotes: {
        ...this._options.remotes,
      },
      shared: {
        ...defaultShared,
        ...this._options.shared,
      },
      manifest: {
        ...((this._options.manifest as Record<string, unknown> | undefined) ??
          {}),
        filePath: isServer ? '' : '/static/chunks',
      },
      // nextjs project needs to add config.watchOptions = ['**/node_modules/**', '**/@mf-types/**'] to prevent loop types update
      dts: this._options.dts ?? false,
      shareStrategy: this._options.shareStrategy ?? 'loaded-first',
      experiments: {
        asyncStartup: true,
      },
    };
  }

  private getNoopPath(): string {
    return resolveNoopPath();
  }
}

export default NextFederationPlugin;
