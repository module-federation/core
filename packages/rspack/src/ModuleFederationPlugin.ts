import type {
  Compiler,
  ModuleFederationPluginOptions,
  RspackPluginInstance,
} from '@rspack/core';
import {
  composeKeyWithSeparator,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { StatsPlugin } from '@module-federation/manifest';
import { ContainerManager, utils } from '@module-federation/managers';
import { DtsPlugin } from '@module-federation/dts-plugin';
import ReactBridgePlugin from '@module-federation/bridge-react-webpack-plugin';
import path from 'node:path';
import fs from 'node:fs';

type ExcludeFalse<T> = T extends undefined | false ? never : T;
type SplitChunks = Compiler['options']['optimization']['splitChunks'];
type NonUndefined<T = SplitChunks> = ExcludeFalse<T>;
type NonFalseSplitChunks = NonUndefined<SplitChunks>;
type CacheGroups = NonUndefined<NonFalseSplitChunks['cacheGroups']>;
type CacheGroup = CacheGroups[string];

declare const __VERSION__: string;

const RuntimeToolsPath = require.resolve('@module-federation/runtime-tools');

export const PLUGIN_NAME = 'RspackModuleFederationPlugin';
export class ModuleFederationPlugin implements RspackPluginInstance {
  readonly name = PLUGIN_NAME;
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _statsPlugin?: StatsPlugin;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  private _patchBundlerConfig(compiler: Compiler): void {
    const { name } = this._options;
    if (name) {
      new compiler.webpack.DefinePlugin({
        FEDERATION_BUILD_IDENTIFIER: JSON.stringify(
          composeKeyWithSeparator(name, utils.getBuildVersion()),
        ),
      }).apply(compiler);
    }
  }

  private _checkSingleton(compiler: Compiler): void {
    let count = 0;
    compiler.options.plugins.forEach((p: any) => {
      if (p.name === this.name) {
        count++;
        if (count > 1) {
          throw new Error(
            `Detect duplicate register ${this.name},please ensure ${this.name} is singleton!`,
          );
        }
      }
    });
  }

  apply(compiler: Compiler): void {
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

    options.implementation = options.implementation || RuntimeToolsPath;
    let disableManifest = options.manifest === false;
    let disableDts = options.dts === false;

    if (!disableDts) {
      // @ts-ignore
      new DtsPlugin(options).apply(compiler);
    }
    if (!disableManifest && options.exposes) {
      try {
        options.exposes = containerManager.containerPluginExposesOptions;
      } catch (err) {
        if (err instanceof Error) {
          err.message = `[ ModuleFederationPlugin ]: Manifest will not generate, because: ${err.message}`;
        }
        console.warn(err);
        disableManifest = true;
      }
    }

    new compiler.webpack.container.ModuleFederationPlugin(
      options as unknown as ModuleFederationPluginOptions,
    ).apply(compiler);

    const runtimeESMPath = require.resolve(
      '@module-federation/runtime/dist/index.esm.mjs',
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

    // react bridge plugin
    const nodeModulesPath = path.resolve(compiler.context, 'node_modules');
    const reactPath = path.join(
      nodeModulesPath,
      '@module-federation/bridge-react',
    );

    // Check whether react exists
    if (
      fs.existsSync(reactPath) &&
      (!options?.bridge || !options.bridge.disableAlias)
    ) {
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

  get statsResourceInfo() {
    return this._statsPlugin?.resourceInfo;
  }
}
