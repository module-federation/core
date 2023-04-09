// AddModulesToRuntimeChunkPlugin.js
class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = {
      moduleNames: [
        'remote-delegate'
      ],
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AddModulesToRuntimeChunkPlugin', (compilation) => {
      compilation.hooks.optimizeChunks.tap('AddModulesToRuntimeChunkPlugin', (chunks) => {
        const runtimeChunk = chunks.find((chunk) => chunk.name === 'webpack-runtime' && chunk.hasRuntime());
        if (!runtimeChunk) return;

        const { moduleNames } = this.options;

        for (const chunk of chunks) {
          if (chunk === runtimeChunk) continue;

          const modulesToMove = [];

          for (const module of chunk.modulesIterable) {
            // if(module?.request.includes('delegate')) console.log(module);
            if (moduleNames.includes(module.rawRequest) || module?.rawRequest?.includes('remote-delegate')) {
              console.log('moving module', module.rawRequest, 'to runtime chunk');
              modulesToMove.push(module);
            }
          }

          for (const module of modulesToMove) {
            runtimeChunk.addModule(module);
            chunk.removeModule(module);
          }
          console.log(modulesToMove)
        }
      });
    });
  }
}

export default AddModulesToRuntimeChunkPlugin;
