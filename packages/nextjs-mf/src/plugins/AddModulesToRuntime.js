// AddModulesToRuntimeChunkPlugin.js

const modulesToHoist = [/\/react\//];

class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'AddModulesToRuntimeChunkPlugin',
      (compilation) => {
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            const runtimeChunk = Array.from(chunks).find((chunk) => {
              return chunk.name === this.options.runtime && chunk.hasRuntime();
            });
            if (!runtimeChunk) return;

            const knownDelegates =
              this.options.remotes &&
              Object.entries(this.options.remotes).map(([name, remote]) => {
                const delegate = remote.replace('internal ', '').split('?')[1];
                return delegate;
              });

            const internalSharedModules = this.options.shared
              ? Object.entries(this.options.shared).map(
                  ([k, v]) => v.import || k
                )
              : false;

            for (const chunk of chunks) {
              if (chunk === runtimeChunk) continue;
              const modulesToMove = [];
              const containers = [];
              const modulesIterable =
                compilation.chunkGraph.getOrderedChunkModulesIterable(
                  chunk,
                  undefined
                );
              for (const module of modulesIterable) {
                //TODO: get this from config, not hardcoded
                if (
                  knownDelegates &&
                  knownDelegates.some((delegate) =>
                    module?.rawRequest?.includes(delegate)
                  )
                ) {
                  containers.push(module);
                } else if (
                  internalSharedModules &&
                  internalSharedModules.some(
                    (share) =>
                      module?.rawRequest === share ||
                      modulesToHoist.some((regex) =>
                        module?.request?.match(regex)
                      )
                  )
                ) {
                  modulesToMove.push(module);
                } else if (
                  module?.userRequest?.includes('internal-delegate-hoist')
                ) {
                  modulesToMove.push(module);
                }
              }

              for (const module of modulesToMove) {
                if (
                  !compilation.chunkGraph.isModuleInChunk(module, runtimeChunk)
                ) {
                  compilation.chunkGraph.connectChunkAndModule(
                    runtimeChunk,
                    module
                  );
                }
                if (this.options.eager) {
                  compilation.chunkGraph.disconnectChunkAndModule(
                    chunk,
                    module
                  );
                }
              }
              for (const module of containers) {
                if (
                  !compilation.chunkGraph.isModuleInChunk(module, runtimeChunk)
                ) {
                  compilation.chunkGraph.connectChunkAndModule(
                    runtimeChunk,
                    module
                  );
                }
              }
            }
          }
        );
      }
    );
  }
}

export default AddModulesToRuntimeChunkPlugin;
