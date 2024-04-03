import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
} from 'webpack';
import ContainerEntryModule from './ContainerEntryModule';

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>) => {
            for (const chunk of chunks) {
              if (this.chunkContainsContainerEntryModule(chunk, compilation)) {
                this.hoistModulesInChunk(chunk, compilation);
              }
            }
          },
        );
      },
    );
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): boolean {
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module instanceof ContainerEntryModule) {
        return true;
      }
    }
    return false;
  }

  private hoistModulesInChunk(chunk: Chunk, compilation: Compilation): void {
    const chunkGraph = compilation.chunkGraph;
    const runtimeChunks = this.getRuntimeChunks(chunk, compilation);

    for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
      for (const runtimeChunk of runtimeChunks) {
        chunkGraph.connectChunkAndModule(runtimeChunk, module);
        chunkGraph.disconnectChunkAndModule(chunk, module);
      }
    }
  }

  private getRuntimeChunks(chunk: Chunk, compilation: Compilation): Chunk[] {
    const runtimeChunks = [];
    for (const c of compilation.chunks) {
      if (c.hasRuntime() && c !== chunk) {
        runtimeChunks.push(c);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
