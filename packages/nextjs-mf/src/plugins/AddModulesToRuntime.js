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
            const { runtime, container, remotes, shared, eager } = this.options;

            const getChunkByName = (name) =>
              chunks.find((chunk) => chunk.name === name);

            const runtimeChunk = getChunkByName(runtime);
            if (!runtimeChunk || !runtimeChunk.hasRuntime()) return;

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
              ? compilation.chunkGraph.getOrderedChunkModulesIterable(
                  partialEntry
                )
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
                for (const module of partialContainerModules) {
                  if (module.rawRequest) {
                    modulesToMove.push(module);
                  } else {
                    containers.push(module);
                  }
                }
                //
              }
              for (const module of [...modulesToMove, ...containers]) {
                // if (
                //   !compilation.chunkGraph.isModuleInChunk(module, runtimeChunk)
                // ) {
                compilation.chunkGraph.connectChunkAndModule(
                  runtimeChunk,
                  module
                );
                // }
                if (eager && modulesToMove.includes(module)) {
                  // if (runtime !== 'webpack-runtime') {
                  //   console.log(
                  //     'removing',
                  //     module.id || module.identifier(),
                  //     'from',
                  //     chunk.name,
                  //     'to',
                  //     runtimeChunk.name
                  //   );
                  // }
                  compilation.chunkGraph.disconnectChunkAndModule(
                    chunk,
                    module
                  );
                }
              }

              if (runtime !== 'webpack-runtime') {
                if (chunk.name || chunk.id) {
                  if (
                    !(chunk.name || chunk.id).startsWith('pages') &&
                    !(chunk.name || chunk.id).startsWith('main')
                  ) {
                    runtimeChunk.getModules().forEach((module) => {
                      if (
                        knownDelegates &&
                        knownDelegates.some((delegate) =>
                          module?.rawRequest?.includes(delegate)
                        )
                      ) {
                        compilation.chunkGraph.connectChunkAndModule(
                          chunk,
                          module
                        );

                        console.log(
                          'adding',
                          module.rawRequest,
                          'to',
                          chunk.name,
                          'from',
                          runtimeChunk.name,
                          'not removing it'
                        );
                        // console.log(
                        //   module.id || module.identifier(),
                        //   module.type,
                        //   module.moduleType,
                        //   module
                        // );
                      }
                    });
                  }
                }
              }
            }

            // console.log(chunks);
          }
        );
      }
    );
  }
}

export default AddModulesToRuntimeChunkPlugin;
