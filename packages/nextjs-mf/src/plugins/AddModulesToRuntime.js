import path from 'path';
class AddModulesToRuntimeChunkPlugin {
constructor(options) {
  this.options = options;
}
  apply(compiler) {
    compiler.hooks.compilation.tap('AddModulesToRuntimeChunkPlugin', (compilation) => {
      compilation.hooks.optimizeChunks.tap('AddModulesToRuntimeChunkPlugin', (chunks) => {
        const runtimeChunk = chunks.find((chunk) => chunk.name === this.options.runtime && chunk.hasRuntime());
        if (!runtimeChunk) return;

        const knownDelegates = Object.entries(this.options.remotes).map(([name, remote]) => {
          const delegate = remote.replace('internal ','').split('?')[1]
          return delegate;
        })

        for (const chunk of chunks) {
          if (chunk === runtimeChunk) continue;

          const modulesToMove = [];

          // add delegates last to graph
          for (const module of chunk.modulesIterable) {
            if (knownDelegates.some((delegate) => module?.rawRequest?.includes(delegate))) {
              modulesToMove.push(module);
            }
          }

          for (const module of chunk.modulesIterable) {
             if(this.options.eager && module?.userRequest?.includes('next') && module?.userRequest?.includes('dynamic')) {
              console.log(module.request,module.userRequest);
              modulesToMove.push(module);
            } else if(module?.userRequest?.includes('internal-delegate-hoist')) {
              modulesToMove.push(module);
            }
          }



          for (const module of modulesToMove) {
            runtimeChunk.addModule(module);
            if(this.options.eager) {
              chunk.removeModule(module);
            }
          }
        }
      });
    });
  }
}

export default AddModulesToRuntimeChunkPlugin;
