import {
  Compiler,
  ModuleFederationPluginOptions,
  RspackPluginInstance,
} from '@rspack/core';
import { getIdentifier } from './utils';
import {
  moduleFederationPlugin,
  normalizeOptions,
} from '@module-federation/sdk';
import { StatsPlugin } from '@module-federation/manifest';
import { ContainerManager } from '@module-federation/managers';
import { DevPlugin } from '@module-federation/dev-plugin';
import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from '@module-federation/native-federation-typescript/rspack';

type ExcludeFalse<T> = T extends undefined | false ? never : T;
type SplitChunks = Compiler['options']['optimization']['splitChunks'];
type NonUndefined<T = SplitChunks> = ExcludeFalse<T>;
type NonFalseSplitChunks = NonUndefined<SplitChunks>;
type CacheGroups = NonUndefined<NonFalseSplitChunks['cacheGroups']>;
type CacheGroup = CacheGroups[string];

declare const __VERSION__: string;

const RuntimeToolsPath = require.resolve('@module-federation/runtime-tools');

export class ModuleFederationPlugin implements RspackPluginInstance {
  readonly name = 'RspackModuleFederationPlugin';
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  private _patchBundlerConfig(compiler: Compiler): void {
    const { name } = this._options;
    new compiler.webpack.DefinePlugin({
      FEDERATION_BUILD_IDENTIFIER: JSON.stringify(getIdentifier(name!)),
    }).apply(compiler);
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
    this._patchChunkSplit(compiler, options.name);

    options.implementation = options.implementation || RuntimeToolsPath;
    let disableManifest = options.manifest === false;

    if (!disableManifest && options.exposes) {
      try {
        const containerManager = new ContainerManager();
        containerManager.init(options);
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
      '@module-federation/runtime/dist/index.esm.js',
      { paths: [options.implementation] },
    );

    compiler.hooks.afterPlugins.tap('PatchAliasWebpackPlugin', () => {
      compiler.options.resolve.alias = {
        ...compiler.options.resolve.alias,
        '@module-federation/runtime$': runtimeESMPath,
      };
    });

    // @ts-ignore
    new DevPlugin(options).apply(compiler);

    const normalizedDtsOptions =
      normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
        true,
        {
          disableGenerateTypes: false,
          remote: {
            generateAPITypes: true,
            compileInChildProcess: true,
            abortOnError: false,
          },
          host: { abortOnError: false },
          extraOptions: {},
        },
        'mfOptions.dts',
      )(options.dts);
    if (
      typeof normalizedDtsOptions === 'object' &&
      !normalizedDtsOptions.disableGenerateTypes
    ) {
      NativeFederationTypeScriptRemote({
        remote: {
          implementation: normalizedDtsOptions.implementation,
          context: compiler.context,
          moduleFederationConfig: options,
          ...normalizedDtsOptions.remote,
        },
        extraOptions: normalizedDtsOptions.extraOptions || {},
        // @ts-ignore
      }).apply(compiler);
      NativeFederationTypeScriptHost({
        host: {
          implementation: normalizedDtsOptions.implementation,
          context: compiler.context,
          moduleFederationConfig: options,
          ...normalizedDtsOptions.host,
        },
        extraOptions: normalizedDtsOptions.extraOptions || {},
        // @ts-ignore
      }).apply(compiler);
    }

    if (!disableManifest) {
      new StatsPlugin(options, {
        pluginVersion: __VERSION__,
        bundler: 'rspack',
        // @ts-ignore
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
              if (chunk.name && chunk.name === name) {
                return false;
              }
              return prevChunks(chunk);
            };
            break;
          }

          if (cacheGroup.chunks === 'all') {
            cacheGroup.chunks = new RegExp(`^(?!.*${name}).*$`, 'g');
            break;
          }
          if (cacheGroup.chunks === 'initial') {
            cacheGroup.chunks = (chunk) => {
              if (chunk.name && chunk.name === name) {
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
