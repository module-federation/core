// AddModulesToRuntimeChunkPlugin.js

const modulesToHoist = [/\/react\//];

class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.options.optimization.minimize = false;
    compiler.hooks.compilation.tap(
      'AddModulesToRuntimeChunkPlugin',
      (compilation) => {
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            const { runtime, container, remotes, shared } = this.options;

            const getChunkByName = (name) =>
              Array.from(chunks).find((chunk) => chunk.name === name);
            const runtimeChunk = getChunkByName(runtime);

            if (!runtimeChunk) return;

            const partialEntry = container ? getChunkByName(container) : null;

            const knownDelegates = remotes
              ? Object.values(remotes).map(
                  (remote) => remote.replace('internal ', '').split('?')[1]
                )
              : null;

            const internalSharedModules = shared
              ? Object.entries(shared).map(
                  ([key, value]) => value.import || key
                )
              : null;

            const partialContainerModules = partialEntry
              ? compilation.chunkGraph.getChunkModulesIterable(partialEntry)
              : null;

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
              if (partialContainerModules) {
                for (const module of partialContainerModules) {
                  containers.push(module);
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
