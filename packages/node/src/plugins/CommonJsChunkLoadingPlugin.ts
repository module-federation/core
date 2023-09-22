import type { Chunk, Compiler, Compilation } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import StartupChunkDependenciesPlugin from 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
import ChunkLoadingRuntimeModule from './LoadFileChunkLoadingRuntimeModule';

interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  debug?: boolean;
}

class CommonJsChunkLoadingPlugin {
  private options: CommonJsChunkLoadingOptions;
  private _asyncChunkLoading: boolean;

  constructor(options: CommonJsChunkLoadingOptions) {
    this.options = options || ({} as CommonJsChunkLoadingOptions);
    this._asyncChunkLoading = this.options.asyncChunkLoading;
  }

  apply(compiler: Compiler) {
    const chunkLoadingValue = this._asyncChunkLoading
      ? 'async-node'
      : 'require';

    new StartupChunkDependenciesPlugin({
      chunkLoading: chunkLoadingValue,
      asyncChunkLoading: this._asyncChunkLoading,
      //@ts-ignore
    }).apply(compiler);

    compiler.hooks.thisCompilation.tap(
      'CommonJsChunkLoadingPlugin',
      (compilation: Compilation) => {
        // Always enabled
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isEnabledForChunk = (_: Chunk) => true;
        const onceForChunkSet = new WeakSet();

        const handler = (chunk: Chunk, set: Set<string>) => {
          if (onceForChunkSet.has(chunk)) {
            return;
          }

          onceForChunkSet.add(chunk);
          if (!isEnabledForChunk(chunk)) {
            return;
          }
          set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          set.add(RuntimeGlobals.hasOwnProperty);

          compilation.addRuntimeModule(
            chunk,
            new ChunkLoadingRuntimeModule(set, this.options, {
              webpack: compiler.webpack,
            })
          );
        };
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.baseURI)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.externalInstallChunk)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.onChunksLoaded)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) {
              return;
            }
            set.add(RuntimeGlobals.getChunkScriptFilename);
          });

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) {
              return;
            }
            set.add(RuntimeGlobals.getChunkUpdateScriptFilename);
            set.add(RuntimeGlobals.moduleCache);
            set.add(RuntimeGlobals.hmrModuleData);
            set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          });

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) {
              return;
            }
            set.add(RuntimeGlobals.getUpdateManifestFilename);
          });
      }
    );
  }
}

export default CommonJsChunkLoadingPlugin;
