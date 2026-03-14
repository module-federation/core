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
import type { Compiler, WebpackPluginInstance } from 'webpack';
import path from 'path';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type EnhancedWebpackModule =
  typeof import('@module-federation/enhanced/webpack');
type CopyFederationPluginCtor =
  typeof import('../CopyFederationPlugin').default;

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
  runtimeRequire(
    'next/dist/server/require-hook',
  ) as typeof import('next/dist/server/require-hook');

let patchedWebpackSourcesAlias: string | undefined;

const patchNextWebpackSourcesAlias = (compiler: Compiler) => {
  try {
    const { addHookAliases } = loadNextRequireHook();
    const localWebpack =
      (
        compiler.webpack as typeof import('webpack') & {
          webpack?: typeof import('webpack');
        }
      ).webpack ?? compiler.webpack;
    const localWebpackSources = localWebpack.sources;

    if (!localWebpackSources) {
      return;
    }

    (
      globalThis as typeof globalThis & {
        __NEXT_MF_WEBPACK_SOURCES__?: typeof import('webpack').sources;
      }
    ).__NEXT_MF_WEBPACK_SOURCES__ = localWebpackSources;

    const { createRequire } = runtimeRequire(
      'module',
    ) as typeof import('module');
    const localWebpackEntry = Object.keys(require.cache).find(
      (cacheKey) => require.cache[cacheKey]?.exports === localWebpack,
    );
    const webpackSourcesShimPath = localWebpackEntry
      ? createRequire(localWebpackEntry).resolve('webpack-sources')
      : require.resolve('@module-federation/nextjs-mf/dist/src/plugins/NextFederationPlugin/webpack-sources-shim.js');

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

    bindLoggerToCompiler(logger, compiler, 'NextFederationPlugin');
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] ||
      getWebpackPath(compiler, { framework: 'nextjs' });
    patchNextWebpackSourcesAlias(compiler);
    if (!this.validateOptions(compiler)) return;
    const isServer = this.isServerCompiler(compiler);
    new CopyFederationPlugin(isServer).apply(compiler);
    const normalFederationPluginOptions = this.getNormalFederationPluginOptions(
      compiler,
      isServer,
    );
    this._options = normalFederationPluginOptions;
    this.applyConditionalPlugins(compiler, isServer);

    const { ModuleFederationPlugin } =
      require('@module-federation/enhanced/webpack') as EnhancedWebpackModule;

    // Temporary experiment to isolate whether the remaining Next 16 dev crash
    // happens inside the enhanced ModuleFederationPlugin apply path.
    // new ModuleFederationPlugin(normalFederationPluginOptions).apply(compiler);

    const noop = this.getNoopPath();

    if (!this._extraOptions.skipSharingNextInternals) {
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
    const manifestPlugin = compiler.options.plugins.find(
      (p): p is WebpackPluginInstance =>
        p?.constructor?.name === 'BuildManifestPlugin',
    );

    if (manifestPlugin) {
      //@ts-ignore
      if (manifestPlugin?.appDirEnabled) {
        throw new Error(
          'App Directory is not supported by nextjs-mf. Use only pages directory, do not open git issues about this',
        );
      }
    }

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

  private applyConditionalPlugins(compiler: Compiler, isServer: boolean) {
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
        shared: { ...retrieveDefaultShared(isServer), ...this._options.shared },
      });
    } else {
      const { applyClientPlugins } = loadApplyClientPlugins();
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }
  }

  private getNormalFederationPluginOptions(
    compiler: Compiler,
    isServer: boolean,
  ): moduleFederationPlugin.ModuleFederationPluginOptions {
    const { retrieveDefaultShared } = loadNextFragments();
    const { exposeNextjsPages } = loadNextPageMapLoader();
    const defaultShared = this._extraOptions.skipSharingNextInternals
      ? {}
      : retrieveDefaultShared(isServer);

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
