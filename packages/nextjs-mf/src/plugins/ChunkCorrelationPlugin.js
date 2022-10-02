const getExposedModules = (stats, exposedFile) => {
  return stats.modules.filter((mod) => mod.name.startsWith(exposedFile));
}

const getFederationStats = (stats, options) => {
  const exposedModules = Object.entries(
    options.exposes || {}
  ).reduce((exposedModules, [exposedAs, exposedFile]) => {
    return Object.assign(exposedModules, {
      [exposedAs]: getExposedModules(stats, exposedFile),
    });
  }, {});

  return  exposedModules;
}
const PLUGIN_NAME = 'ChunkCorrelationPlugin'
class ChunkCorrelationPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise({
        name: PLUGIN_NAME,
        stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT
      }, () => {
        const stats = compilation.getStats().toJson({});
        console.log(getFederationStats(stats, this.options))
      });
    });

    return;
    compiler.hooks.compilation.tap('ChunkCorrolationPlugin', (compilation) => {
      compilation.hooks.chunkAsset.tap('ChunkCorrolationPlugin', (chunk, filename) => {
        // console.log('chunkAsset', chunk, filename)
        const modulesInChunk = chunk.getModules();
        const remoteModules = modulesInChunk.filter((m) => {
          return m.type === 'remote-module';
        });
        if (filename.includes('shared-nav')) {
          modulesInChunk.forEach((m) => {
            console.log('m', m.issuer)
          })
        }
        // console.log(modulesInChunk);
        // chunk.files.forEach((file) => {
        //   console.log(file);
        // });
        // console.log(compiler.options.name, filename);
        // chunk.files.push(filename)
      })
    })
  }
}


export default ChunkCorrelationPlugin
