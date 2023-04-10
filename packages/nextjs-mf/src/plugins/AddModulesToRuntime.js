// AddModulesToRuntimeChunkPlugin.js
class AddModulesToRuntimeChunkPlugin {
constructor(options) {
  this.options = options;
}
  apply(compiler) {
    compiler.hooks.compilation.tap('AddModulesToRuntimeChunkPlugin', (compilation) => {
      compilation.hooks.optimizeChunks.tap('AddModulesToRuntimeChunkPlugin', (chunks) => {
        const runtimeChunk = chunks.find((chunk) => chunk.name === this.options.runtime && chunk.hasRuntime());
        if (!runtimeChunk) return;

        for (const chunk of chunks) {
          if (chunk === runtimeChunk) continue;

          const modulesToMove = [];

          for (const module of chunk.modulesIterable) {
            //TODO: get this from config, not hardcoded
            if (module?.rawRequest?.includes('remote-delegate')) {
              console.log('moving module', module.rawRequest, 'to runtime chunk');
              modulesToMove.push(module);
            } else if(this.options.eager && module?.userRequest?.includes('next') && module?.userRequest?.includes('dynamic')) {
              // console.log(module.request,module.userRequest);
              modulesToMove.push(module);
            } else if(module?.userRequest?.includes('internal-delegate-hoist')) {
              modulesToMove.push(module);
            } else if(!this.options.eager) {
              // console.log(module);
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
