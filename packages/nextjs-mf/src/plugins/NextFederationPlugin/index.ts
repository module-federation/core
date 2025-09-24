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
import type { Compiler } from 'webpack';
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

    // Ensure container entry modules default to pages-dir-browser layer on client
    compiler.hooks.thisCompilation.tap(
      this.name + ':normalize-expose-layer',
      (compilation) => {
        if (compiler.options.name !== 'client') return;
        compilation.hooks.finishModules.tap(
          this.name + ':set-container-entry-layer',
          () => {
            const mods = Array.from((compilation as any).modules as Set<any>);
            for (const m of mods) {
              if (
                m &&
                (m.constructor?.name === 'ContainerEntryModule' ||
                  // safety: match by identifier text
                  (typeof m.identifier === 'function' &&
                    String(m.identifier()).startsWith('container entry '))) &&
                !m.layer
              ) {
                m.layer = WEBPACK_LAYERS_NAMES.pagesDirBrowser;
              }
            }
          },
        );
      },
    );

    if (!this._extraOptions.skipSharingNextInternals) {
      // Intentionally left as no-ops; preserved for future use.
      // See commented "make" hooks in original source if needed.
    }

    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [
        //@ts-ignore
        (message) => /your target environment does not appear/.test(message),
      ];
    }

    // Add module rules for layer handling without short-circuiting Next's oneOf.
    // Do NOT use `enforce` here; Webpack schema rejects it on rules that don't declare loaders.
    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];

    if (compiler.options.name === 'client') {
      // Top-level rules that only set the module layer.
      // These do not consume/bail and allow subsequent Next oneOf rules to apply loaders.
      compiler.options.module.rules.unshift(
        {
          resourceQuery: /pages-dir-browser/,
          layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
        },
        {
          test: /[\\/]rsc[\\/].*\.(js|jsx|ts|tsx)$/,
          layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
        },
      );
    } else if (compiler.options.name === 'server') {
      compiler.options.module.rules.unshift(
        {
          resourceQuery: /pages-dir-node/,
          layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
        },
        {
          test: /[\\/]rsc[\\/].*\.(js|jsx|ts|tsx)$/,
          layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
        },
      );
    }
  }

  private validateOptions(compiler: Compiler): boolean {
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

    // Merge user exposes + optionally generated Next pages
    const rawExposes = {
      ...this._options.exposes,
      ...(this._extraOptions.exposePages
        ? exposeNextjsPages(compiler.options.context as string)
        : {}),
    } as Record<string, any>;

    // Helper to append a query token safely
    const withQueryToken = (imp: string, token: string) => {
      // Skip adding layer query for loader chains (contains '!')
      // Loader chains handle their own query parameters and shouldn't be modified
      if (imp.includes('!')) {
        return imp;
      }
      // For regular imports, append the query parameter
      return imp.includes('?') ? `${imp}&${token}` : `${imp}?${token}`;
    };

    // Add layer query parameters to exposed modules
    const addLayerQueryToExposes = (
      exposes: Record<string, any>,
      layer: string,
    ): Record<string, any> => {
      const out: Record<string, any> = {};
      for (const [key, val] of Object.entries(exposes)) {
        if (typeof val === 'string') {
          // Only add layer query if it's not a loader chain
          out[key] = withQueryToken(val, layer);
        } else if (val && typeof val === 'object' && 'import' in val) {
          const imports = Array.isArray(val.import) ? val.import : [val.import];
          const layeredImports = imports.map((imp: string) =>
            withQueryToken(imp, layer),
          );
          // Strip unsupported fields if present on expose objects
          const { layer: _omitLayer, ...validProps } = val as Record<
            string,
            any
          >;
          out[key] = {
            ...validProps,
            import: Array.isArray(val.import)
              ? layeredImports
              : layeredImports[0],
          };
        } else {
          out[key] = val;
        }
      }
      return out;
    };

    // Apply appropriate layer query based on compiler target
    const targetLayer = isServer ? 'pages-dir-node' : 'pages-dir-browser';
    const finalExposes = addLayerQueryToExposes(rawExposes, targetLayer);

    // Add layer and issuerLayer to user-provided shared modules for proper Next.js layering
    const addLayerToShared = (
      shared: Record<string, any>,
      layer: string,
    ): Record<string, any> => {
      const out: Record<string, any> = {};
      for (const [key, val] of Object.entries(shared)) {
        if (typeof val === 'string' || val === true || val === false) {
          // Simple shared config – force pages-dir layer on the client/server compiler
          out[key] =
            val === false
              ? false
              : {
                  layer,
                  issuerLayer: layer,
                  allowNodeModulesSuffixMatch: true,
                };
        } else if (val && typeof val === 'object') {
          // Object config – force layer/issuerLayer; preserve other fields
          out[key] = {
            ...val,
            layer,
            issuerLayer: layer,
            allowNodeModulesSuffixMatch:
              'allowNodeModulesSuffixMatch' in val
                ? val.allowNodeModulesSuffixMatch
                : true,
          };
        } else {
          out[key] = val;
        }
      }
      return out;
    };

    // Apply layers to user-provided shared modules
    const userSharedWithLayers = this._options.shared
      ? addLayerToShared(this._options.shared, targetLayer)
      : {};

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
      exposes: finalExposes,
      remotes: {
        ...this._options.remotes,
      },
      shareScope: Object.values({
        default: 'default',
      }),
      shared: {
        ...defaultShared,
        ...userSharedWithLayers,
      },
      ...(isServer
        ? { manifest: { filePath: '' } }
        : { manifest: { filePath: '/static/chunks' } }),
      // nextjs project needs to add config.watchOptions = ['**/node_modules/**', '**/@mf-types/**'] to prevent loop types update
      dts: this._options.dts ?? false,
      shareStrategy: this._options.shareStrategy ?? 'loaded-first',
      // Ensure required experiments are enabled while preserving user-specified ones
      experiments: {
        ...(this._options.experiments || {}),
        asyncStartup: true,
        // Enable alias-aware consuming by default for Next.js, which heavily relies on aliases
        aliasConsumption: true,
      },
    };
  }

  private getNoopAppDirClientPath(): string {
    return require.resolve('../../federation-noop-appdir-client.cjs');
  }

  private getNoopAppDirServerPath(): string {
    return require.resolve('../../federation-noop-appdir-server.cjs');
  }
}

export default NextFederationPlugin;
