const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');
const StartupChunkDependenciesPlugin = require('webpack/lib/runtime/StartupChunkDependenciesPlugin');
import ChunkLoadingRuntimeModule from './LoadFileChunkLoadingRuntimeModule';
// const ChunkLoadingRuntimeModule = require('webpack/lib/node/ReadFileChunkLoadingRuntimeModule')
class CommonJsChunkLoadingPlugin {
  constructor(options) {
    this.options = options || {};
    this._asyncChunkLoading = this.options.asyncChunkLoading;
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const chunkLoadingValue = this._asyncChunkLoading
      ? 'async-node'
      : 'require';
    new StartupChunkDependenciesPlugin({
      chunkLoading: chunkLoadingValue,
      asyncChunkLoading: this._asyncChunkLoading,
    }).apply(compiler);
    compiler.hooks.thisCompilation.tap(
      'CommonJsChunkLoadingPlugin',
      (compilation) => {
        // Always enabled
        const isEnabledForChunk = () => true;
        const onceForChunkSet = new WeakSet();
        const handler = (chunk, set) => {
          if (onceForChunkSet.has(chunk)) return;
          onceForChunkSet.add(chunk);
          if (!isEnabledForChunk(chunk)) return;
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
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.getChunkScriptFilename);
          });
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.getChunkUpdateScriptFilename);
            set.add(RuntimeGlobals.moduleCache);
            set.add(RuntimeGlobals.hmrModuleData);
            set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          });
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.getUpdateManifestFilename);
          });
      }
    );
  }
}

export default CommonJsChunkLoadingPlugin;
