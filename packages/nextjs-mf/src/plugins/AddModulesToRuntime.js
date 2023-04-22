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
            const { runtime, container, remotes, shared, eager } = this.options;

            const getChunkByName = (name) =>
              chunks.find((chunk) => chunk.name === name);

            const runtimeChunk = getChunkByName(runtime);
            if (!runtimeChunk?.hasRuntime()) return;

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
                compilation.chunkGraph.getOrderedChunkModulesIterable(chunk);

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
                    (share) => module?.rawRequest === share
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
                containers.push(...partialContainerModules);
              }

              for (const module of [].concat(modulesToMove, containers)) {
                if (
                  !compilation.chunkGraph.isModuleInChunk(module, runtimeChunk)
                ) {
                  compilation.chunkGraph.connectChunkAndModule(
                    runtimeChunk,
                    module
                  );
                }
                if (eager && modulesToMove.includes(module)) {
                  compilation.chunkGraph.disconnectChunkAndModule(
                    chunk,
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
