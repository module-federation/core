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
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import CopyFederationPlugin from '../CopyFederationPlugin';
import { exposeNextjsPages } from '../../loaders/nextPageMapLoader';
import {
  getNextInternalsShareScope,
  getNextVersion,
  isNextJs15Plus,
} from '../../internal';
import { setOptions } from './set-options';
import {
  validateCompilerOptions,
  validatePluginOptions,
} from './validate-options';
import {
  applyServerPlugins,
  configureServerCompilerOptions,
  configureServerLibraryAndFilename,
  handleServerExternals,
} from './apply-server-plugins';
import { applyClientPlugins } from './apply-client-plugins';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { applyPathFixes } from './next-fragments';

import path from 'path';
import { WEBPACK_LAYERS_NAMES } from '../../constants';
/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application federation using Module Federation.
 */
export class NextFederationPlugin {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;
  public name: string;
  // Store the original public path for use by other plugins
  public static originalPublicPath = '';

  /**
   * Constructs the NextFederationPlugin with the provided options.
   *
   * @param options The options to configure the plugin.
   */
  constructor(options: NextFederationPluginOptions) {
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
    // Check Next.js version and conditionally apply flight loader override
    const nextVersion = getNextVersion(compiler);
    const isNext15Plus = isNextJs15Plus(nextVersion);

    if (isNext15Plus) {
      // Override next-flight-loader with local loader for Next.js 15+
      compiler.options.resolveLoader = compiler.options.resolveLoader || {};
      compiler.options.resolveLoader.alias =
        compiler.options.resolveLoader.alias || {};
      // @ts-ignore
      compiler.options.resolveLoader.alias['next-flight-loader'] =
        require.resolve('../../loaders/next-flight-loader');
    }

    this.applyReactAliasOverrides(compiler);

    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] ||
      getWebpackPath(compiler, { framework: 'nextjs' });
    if (!this.validateOptions(compiler)) return;

    const isServer = this.isServerCompiler(compiler);

    // Capture the original public path before any modifications
    const publicPath = compiler.options.output.publicPath;
    NextFederationPlugin.originalPublicPath =
      typeof publicPath === 'string' ? publicPath : '';

    new CopyFederationPlugin(isServer).apply(compiler);
    const normalFederationPluginOptions = this.getNormalFederationPluginOptions(
      compiler,
      isServer,
    );

    this._options = normalFederationPluginOptions;
    this.applyConditionalPlugins(compiler, isServer);

    new ModuleFederationPlugin(normalFederationPluginOptions).apply(compiler);

    const noopAppDirClient = this.getNoopAppDirClientPath();
    const noopAppDirServer = this.getNoopAppDirServerPath();

    if (!this._extraOptions.skipSharingNextInternals) {
      // Adds 'noop' entry (unlayered)
      // compiler.hooks.make.tapAsync(
      //   'NextFederationPlugin',
      //   (compilation, callback) => {
      //     const dep = compiler.webpack.EntryPlugin.createDependency(
      //       noop,
      //       'noop',
      //     );
      //     compilation.addEntry(
      //       compiler.context,
      //       dep,
      //       { name: 'noop' },
      //       (err) => {
      //         if (err) {
      //           return callback(err);
      //         }
      //         callback();
      //       },
      //     );
      //   },
      // );
      // Add entry for app directory client components
      // compiler.hooks.make.tapAsync(
      //   'NextFederationPlugin',
      //   (compilation, callback) => {
      //     if (compiler.name === 'client') {
      //       const dep = compiler.webpack.EntryPlugin.createDependency(
      //         noopAppDirClient,
      //         {
      //           name: 'noop-appdir-client',
      //           layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      //         },
      //       );
      //       compilation.addEntry(
      //         compiler.context,
      //         dep,
      //         {
      //           name: 'noop-appdir-client',
      //           layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      //         },
      //         (err) => {
      //           if (err) {
      //             return callback(err);
      //           }
      //           callback();
      //         },
      //       );
      //     } else {
      //       callback();
      //     }
      //   },
      // );
      // Add entry for app directory server components
      // compiler.hooks.make.tapAsync(
      //   'NextFederationPlugin',
      //   (compilation, callback) => {
      //     if (compiler.name === 'server') {
      //       const dep = compiler.webpack.EntryPlugin.createDependency(
      //         noopAppDirServer,
      //         {
      //           name: 'noop-appdir-server',
      //           layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      //         },
      //       );
      //       compilation.addEntry(
      //         compiler.context,
      //         dep,
      //         {
      //           name: 'noop-appdir-server',
      //           layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      //         },
      //         (err) => {
      //           if (err) {
      //             return callback(err);
      //           }
      //           callback();
      //         },
      //       );
      //     } else {
      //       callback();
      //     }
      //   },
      // );
    }

    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [
        //@ts-ignore
        (message) => /your target environment does not appear/.test(message),
      ];
    }

    // Add a module rule for /rsc/ directory to use nextRscMapLoader
    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];
    if (compiler.options.name === 'client') {
      // Find or create a top-level oneOf rule
      let oneOfRule = compiler.options.module.rules.find(
        (rule) =>
          rule &&
          typeof rule === 'object' &&
          'oneOf' in rule &&
          Array.isArray((rule as any).oneOf),
      ) as { oneOf: any[] } | undefined;
      if (!oneOfRule) {
        oneOfRule = { oneOf: [] };
        compiler.options.module.rules.unshift(oneOfRule);
      }
      oneOfRule.oneOf.unshift({
        test: /[\\/]rsc[\\/].*\.(js|jsx|ts|tsx)$/,
        layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      });
    } else if (compiler.options.name === 'server') {
      compiler.options.module.rules.unshift({
        test: /[\\/]rsc[\\/].*\.(js|jsx|ts|tsx)$/,
        layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      });
    }
  }

  private validateOptions(compiler: Compiler): boolean {
    const manifestPlugin = compiler.options.plugins.find(
      (p): p is WebpackPluginInstance =>
        p?.constructor?.name === 'BuildManifestPlugin',
    );

    // if (manifestPlugin) {
    //   //@ts-ignore
    //   if (manifestPlugin?.appDirEnabled) {
    //     throw new Error(
    //       'App Directory is not supported by nextjs-mf. Use only pages directory, do not open git issues about this',
    //     );
    //   }
    // }

    const compilerValid = validateCompilerOptions(compiler);
    const pluginValid = validatePluginOptions(this._options);
    const envValid = process.env['NEXT_PRIVATE_LOCAL_WEBPACK'];
    if (compilerValid === undefined)
      console.error('Compiler validation failed');
    if (pluginValid === undefined) console.error('Plugin validation failed');
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
    compiler.options.output.uniqueName = this._options.name;
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      asyncFunction: true,
    };

    applyPathFixes(compiler, this._options, this._extraOptions);
    if (this._extraOptions.debug) {
      compiler.options.devtool = false;
    }

    if (isServer) {
      configureServerCompilerOptions(compiler);
      configureServerLibraryAndFilename(this._options);
      applyServerPlugins(compiler, this._options);
      handleServerExternals(compiler, {
        ...this._options,
        shared: {
          ...getNextInternalsShareScope(compiler),
          ...this._options.shared,
        },
      });
    } else {
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }
  }

  private getNormalFederationPluginOptions(
    compiler: Compiler,
    isServer: boolean,
  ): moduleFederationPlugin.ModuleFederationPluginOptions {
    const defaultShared = this._extraOptions.skipSharingNextInternals
      ? {}
      : getNextInternalsShareScope(compiler);

    return {
      ...this._options,
      runtime: false,
      remoteType: 'script',
      runtimePlugins: [
        ...(isServer
          ? [require.resolve('@module-federation/node/runtimePlugin')]
          : []),
        require.resolve(path.join(__dirname, '../container/runtimePlugin.cjs')),
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
      shareScope: Object.values({
        default: 'default',
      }),
      shared: {
        ...defaultShared,
        ...this._options.shared,
      },
      ...(isServer
        ? { manifest: { filePath: '' } }
        : { manifest: { filePath: '/static/chunks' } }),
      // nextjs project needs to add config.watchOptions = ['**/node_modules/**', '**/@mf-types/**'] to prevent loop types update
      dts: this._options.dts ?? false,
      shareStrategy: this._options.shareStrategy ?? 'loaded-first',
      experiments: {
        ...(this._options.experiments || {}),
        asyncStartup: true,
        aliasConsumption: true,
      },
    };
  }

  // private getNoopPath(): string {
  //   return require.resolve('../../federation-noop.cjs');
  // }

  private getNoopAppDirClientPath(): string {
    return require.resolve('../../federation-noop-appdir-client.cjs');
  }

  private getNoopAppDirServerPath(): string {
    return require.resolve('../../federation-noop-appdir-server.cjs');
  }

  private applyReactAliasOverrides(compiler: Compiler) {
    const context = compiler.context;
    const resolveFromApp = (request: string) => {
      try {
        return require.resolve(request, { paths: [context] });
      } catch (error) {
        return undefined;
      }
    };

    const possibleAliases: Array<[string, string | undefined]> = [
      ['next/dist/compiled/react', resolveFromApp('react')],
      [
        'next/dist/compiled/react/jsx-runtime',
        resolveFromApp('react/jsx-runtime'),
      ],
      [
        'next/dist/compiled/react/jsx-dev-runtime',
        resolveFromApp('react/jsx-dev-runtime'),
      ],
      ['next/dist/compiled/react-dom', resolveFromApp('react-dom')],
      [
        'next/dist/compiled/react-dom/client',
        resolveFromApp('react-dom/client'),
      ],
    ];

    const resolvedEntries = possibleAliases.filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    );

    if (!resolvedEntries.length) {
      return;
    }

    compiler.options.resolve = compiler.options.resolve || {};
    const existingAlias = compiler.options.resolve.alias;

    if (Array.isArray(existingAlias)) {
      const aliasArray = existingAlias.filter(
        (item) =>
          !resolvedEntries.some(([name]) => (item as any)?.name === name),
      );

      for (const [name, alias] of resolvedEntries) {
        aliasArray.push({ name, alias });
      }

      compiler.options.resolve.alias = aliasArray;
    } else {
      compiler.options.resolve.alias = {
        ...(existingAlias || {}),
        ...Object.fromEntries(resolvedEntries),
      };
    }
  }
}

export default NextFederationPlugin;
