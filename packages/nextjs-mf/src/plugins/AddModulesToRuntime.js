// AddModulesToRuntimeChunkPlugin.js

const modulesToHoist = [/\/react\//];

class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = { debug: false, ...options };
  }

  apply(compiler) {
    compiler.options.optimization.minimize = false;
    const isServer = compiler.options.name === 'server';

    compiler.hooks.compilation.tap(
      'AddModulesToRuntimeChunkPlugin',
      (compilation) => {
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            const {
              runtime,
              container,
              remotes,
              shared,
              eager,
              applicationName,
            } = this.options;

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
              }
              for (const module of [...modulesToMove, ...containers]) {
                if (
                  !compilation.chunkGraph.isModuleInChunk(module, runtimeChunk)
                ) {
                  compilation.chunkGraph.connectChunkAndModule(
                    runtimeChunk,
                    module
                  );
                }
                if (eager && modulesToMove.includes(module)) {
                  if (!isServer && this.options.debug) {
                    console.log(
                      'removing',
                      module.id || module.identifier(),
                      'from',
                      chunk.name,
                      'to',
                      runtimeChunk.name
                    );
                  }
                  compilation.chunkGraph.disconnectChunkAndModule(
                    chunk,
                    module
                  );
                }
              }

              if (
                !isServer &&
                (chunk.name || chunk.id) &&
                applicationName &&
                (chunk.name || chunk.id).startsWith(applicationName)
              ) {
                const { chunkGraph } = compilation;
                const runtimeChunkModules =
                  chunkGraph.getOrderedChunkModulesIterable(runtimeChunk);
                const delegates = knownDelegates || [];

                for (const module of runtimeChunkModules) {
                  const { rawRequest } = module || {};
                  if (!compilation.chunkGraph.isModuleInChunk(module, chunk)) {
                    if (
                      rawRequest &&
                      delegates.some((delegate) =>
                        rawRequest.includes(delegate)
                      )
                    ) {
                      compilation.chunkGraph.connectChunkAndModule(
                        chunk,
                        module
                      );
                      if (this.options.debug) {
                        console.log(
                          `adding ${module.rawRequest} to ${chunk.name} from ${runtimeChunk.name} not removing it`
                        );
                      }
                    }
                  }
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
