import type {
  Compiler,
  Falsy,
  ModuleFederationPluginOptions,
  RspackPluginFunction,
  RspackPluginInstance,
} from '@rspack/core';
import {
  bindLoggerToCompiler,
  composeKeyWithSeparator,
  moduleFederationPlugin,
} from '@module-federation/sdk';

import { StatsPlugin } from '@module-federation/manifest';
import { ContainerManager, utils } from '@module-federation/managers';
import { DtsPlugin } from '@module-federation/dts-plugin';
import ReactBridgePlugin from '@module-federation/bridge-react-webpack-plugin';
import path from 'node:path';
import fs from 'node:fs';
import { RemoteEntryPlugin } from './RemoteEntryPlugin';
import logger from './logger';

type ExcludeFalse<T> = T extends undefined | false ? never : T;
type SplitChunks = Compiler['options']['optimization']['splitChunks'];
type NonUndefined<T = SplitChunks> = ExcludeFalse<T>;
type NonFalseSplitChunks = NonUndefined<SplitChunks>;
type CacheGroups = NonUndefined<NonFalseSplitChunks['cacheGroups']>;
type CacheGroup = CacheGroups[string];

declare const __VERSION__: string;

const RuntimeToolsPath = require.resolve('@module-federation/runtime-tools');

function resolveModule(
  candidates: string[],
  options?: NodeJS.RequireResolveOptions,
): string {
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return require.resolve(candidate, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ??
    new Error(`Unable to resolve any module from: ${candidates.join(', ')}`)
  );
}

export const PLUGIN_NAME = 'RspackModuleFederationPlugin';
export class ModuleFederationPlugin implements RspackPluginInstance {
  readonly name = PLUGIN_NAME;
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _statsPlugin?: StatsPlugin;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  private _patchBundlerConfig(compiler: Compiler): void {
    const { name, experiments } = this._options;
    const definePluginOptions: Record<string, string | boolean> = {};
    if (name) {
      definePluginOptions['FEDERATION_BUILD_IDENTIFIER'] = JSON.stringify(
        composeKeyWithSeparator(name, utils.getBuildVersion()),
      );
    }
    // Add FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN
    const disableSnapshot = experiments?.optimization?.disableSnapshot ?? false;
    definePluginOptions['FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN'] =
      disableSnapshot;

    // Determine ENV_TARGET: only if manually specified in experiments.optimization.target
    if (
      experiments?.optimization &&
      typeof experiments.optimization === 'object' &&
      experiments.optimization !== null &&
      'target' in experiments.optimization
    ) {
      const manualTarget = experiments.optimization.target as
        | 'web'
        | 'node'
        | undefined;
      // Ensure the target is one of the expected values before setting
      if (manualTarget === 'web' || manualTarget === 'node') {
        definePluginOptions['ENV_TARGET'] = JSON.stringify(manualTarget);
      }
    }
    // No inference for ENV_TARGET. If not manually set and valid, it's not defined.

    new compiler.webpack.DefinePlugin(definePluginOptions).apply(compiler);
  }

  private _checkSingleton(compiler: Compiler): void {
    let count = 0;
    compiler.options.plugins.forEach(
      (p: Falsy | RspackPluginInstance | RspackPluginFunction) => {
        if (typeof p !== 'object' || !p) {
          return;
        }

        if (p['name'] === this.name) {
          count++;
          if (count > 1) {
            throw new Error(
              `Detect duplicate register ${this.name},please ensure ${this.name} is singleton!`,
            );
          }
        }
      },
    );
  }

  apply(compiler: Compiler): void {
    bindLoggerToCompiler(logger, compiler, PLUGIN_NAME);
    const { _options: options } = this;

    if (!options.name) {
      throw new Error('[ ModuleFederationPlugin ]: name is required');
    }
    this._checkSingleton(compiler);
    this._patchBundlerConfig(compiler);
    const containerManager = new ContainerManager();
    containerManager.init(options);

    if (containerManager.enable) {
      this._patchChunkSplit(compiler, options.name);
    }

    // must before ModuleFederationPlugin
    new RemoteEntryPlugin(options).apply(compiler);

    if (options.experiments?.provideExternalRuntime) {
      if (options.exposes) {
        throw new Error(
          'You can only set provideExternalRuntime: true in pure consumer which not expose modules.',
        );
      }

      const runtimePlugins = options.runtimePlugins || [];
      options.runtimePlugins = runtimePlugins.concat(
        require.resolve(
          '@module-federation/inject-external-runtime-core-plugin',
        ),
      );
    }

    if (options.experiments?.externalRuntime === true) {
      const Externals = compiler.webpack.ExternalsPlugin;
      new Externals(compiler.options.externalsType || 'global', {
        '@module-federation/runtime-core': '_FEDERATION_RUNTIME_CORE',
      }).apply(compiler);
    }

    const implementationPath = options.implementation || RuntimeToolsPath;
    options.implementation = implementationPath;
    let disableManifest = options.manifest === false;
    let disableDts = options.dts === false;

    if (!disableDts) {
      const dtsPlugin = new DtsPlugin(options);
      // @ts-ignore
      dtsPlugin.apply(compiler);
      dtsPlugin.addRuntimePlugins();
    }
    if (!disableManifest && options.exposes) {
      try {
        options.exposes = containerManager.containerPluginExposesOptions;
      } catch (err) {
        if (err instanceof Error) {
          err.message = `[ ModuleFederationPlugin ]: Manifest will not generate, because: ${err.message}`;
        }
        logger.warn(err);
        disableManifest = true;
      }
    }

    new compiler.webpack.container.ModuleFederationPlugin(
      options as unknown as ModuleFederationPluginOptions,
    ).apply(compiler);

    const runtimeESMPath = resolveModule(
      [
        '@module-federation/runtime/dist/index.esm.js',
        '@module-federation/runtime/dist/index.js',
        '@module-federation/runtime/dist/index.mjs',
        '@module-federation/runtime/dist/index.cjs.cjs',
        '@module-federation/runtime/dist/index.cjs',
      ],
      { paths: [options.implementation] },
    );

    compiler.hooks.afterPlugins.tap('PatchAliasWebpackPlugin', () => {
      compiler.options.resolve.alias = {
        ...compiler.options.resolve.alias,
        '@module-federation/runtime$': runtimeESMPath,
      };
    });

    if (!disableManifest) {
      this._statsPlugin = new StatsPlugin(options, {
        pluginVersion: __VERSION__,
        bundler: 'rspack',
      });
      // @ts-ignore
      this._statsPlugin.apply(compiler);
    }

    const checkBridgeReactInstalled = () => {
      try {
        const userPackageJsonPath = path.resolve(
          compiler.context,
          'package.json',
        );
        if (fs.existsSync(userPackageJsonPath)) {
          const userPackageJson = JSON.parse(
            fs.readFileSync(userPackageJsonPath, 'utf-8'),
          );
          const userDependencies = {
            ...userPackageJson.dependencies,
            ...userPackageJson.devDependencies,
          };
          return !!userDependencies['@module-federation/bridge-react'];
        }
        return false;
      } catch (error) {
        return false;
      }
    };

    const hasBridgeReact = checkBridgeReactInstalled();

    // react bridge plugin
    const shouldEnableBridgePlugin = (): boolean => {
      // Priority 1: Explicit enableBridgeRouter configuration
      if (options?.bridge?.enableBridgeRouter === true) {
        return true;
      }

      // Priority 2: Explicit disable via enableBridgeRouter:false or disableAlias:true
      if (
        options?.bridge?.enableBridgeRouter === false ||
        options?.bridge?.disableAlias === true
      ) {
        if (options?.bridge?.disableAlias === true) {
          logger.warn(
            '⚠️  [ModuleFederationPlugin] The `disableAlias` option is deprecated and will be removed in a future version.\n' +
              '   Please use `enableBridgeRouter: false` instead:\n' +
              '   {\n' +
              '     bridge: {\n' +
              '       enableBridgeRouter: false  // Use this instead of disableAlias: true\n' +
              '     }\n' +
              '   }',
          );
        }
        return false;
      }

      // Priority 3: Automatic detection based on bridge-react installation
      if (hasBridgeReact) {
        logger.info(
          '💡 [ModuleFederationPlugin] Detected @module-federation/bridge-react in your dependencies.\n' +
            '   For better control and to avoid future breaking changes, please explicitly set:\n' +
            '   {\n' +
            '     bridge: {\n' +
            '       enableBridgeRouter: true  // Explicitly enable bridge router\n' +
            '     }\n' +
            '   }',
        );
        return true;
      }

      return false;
    };

    const enableBridgePlugin = shouldEnableBridgePlugin();

    // When bridge plugin is disabled (router disabled), alias to /base entry
    if (!enableBridgePlugin && hasBridgeReact) {
      compiler.hooks.afterPlugins.tap('BridgeReactBaseAliasPlugin', () => {
        try {
          const bridgeReactBasePath = path.resolve(
            compiler.context,
            'node_modules/@module-federation/bridge-react/dist/base.es.js',
          );

          if (!fs.existsSync(bridgeReactBasePath)) {
            logger.warn(
              '⚠️  [ModuleFederationPlugin] bridge-react /base entry not found, falling back to default entry',
            );
            return;
          }

          compiler.options.resolve.alias = {
            ...compiler.options.resolve.alias,
            '@module-federation/bridge-react$': bridgeReactBasePath,
          };

          logger.info(
            '✅ [ModuleFederationPlugin] Router disabled - using /base entry (no react-router-dom)',
          );
        } catch (error) {
          logger.warn(
            '⚠️  [ModuleFederationPlugin] Failed to set /base alias, using default entry',
          );
        }
      });
    }

    if (enableBridgePlugin) {
      new ReactBridgePlugin({
        moduleFederationOptions: this._options,
      }).apply(compiler);
    }
  }

  private _patchChunkSplit(compiler: Compiler, name: string): void {
    const { splitChunks } = compiler.options.optimization;
    const patchChunkSplit = (cacheGroup: CacheGroup) => {
      switch (typeof cacheGroup) {
        case 'boolean':
        case 'string':
        case 'function':
          break;
        //  cacheGroup.chunks will inherit splitChunks.chunks, so you only need to modify the chunks that are set separately
        case 'object': {
          if (cacheGroup instanceof RegExp) {
            break;
          }
          if (!cacheGroup.chunks) {
            break;
          }

          if (typeof cacheGroup.chunks === 'function') {
            const prevChunks = cacheGroup.chunks;
            cacheGroup.chunks = (chunk) => {
              if (
                chunk.name &&
                (chunk.name === name || chunk.name === name + '_partial')
              ) {
                return false;
              }
              return prevChunks(chunk);
            };
            break;
          }

          if (cacheGroup.chunks === 'all') {
            cacheGroup.chunks = (chunk) => {
              if (
                chunk.name &&
                (chunk.name === name || chunk.name === name + '_partial')
              ) {
                return false;
              }
              return true;
            };
            break;
          }
          if (cacheGroup.chunks === 'initial') {
            cacheGroup.chunks = (chunk) => {
              if (
                chunk.name &&
                (chunk.name === name || chunk.name === name + '_partial')
              ) {
                return false;
              }
              return chunk.isOnlyInitial();
            };
            break;
          }
          break;
        }
        default:
          break;
      }
    };

    if (!splitChunks) {
      return;
    }
    // 修改 splitChunk.chunks
    patchChunkSplit(splitChunks);

    const { cacheGroups } = splitChunks;

    if (!cacheGroups) {
      return;
    }

    // 修改 splitChunk.cacheGroups[key].chunks
    Object.keys(cacheGroups).forEach((cacheGroupKey) => {
      patchChunkSplit(cacheGroups[cacheGroupKey]);
    });
  }
}

export const GetPublicPathPlugin = RemoteEntryPlugin;

export {
  TreeShakingSharedPlugin,
  type TreeShakingSharedPluginOptions,
} from './TreeShakingSharedPlugin';
