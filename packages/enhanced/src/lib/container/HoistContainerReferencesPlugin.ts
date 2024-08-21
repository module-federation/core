import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
} from 'webpack';
import ContainerEntryModule from './ContainerEntryModule';

export class HoistContainerReferences implements WebpackPluginInstance {
  private readonly containerName: string;

  constructor(name?: string) {
    this.containerName = name || 'no known chunk name';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterChunks.tap('HoistContainerReferences', () => {
          const runtimeChunks = this.getRuntimeChunks(compilation);
          this.hoistModulesInChunks(compilation, runtimeChunks);
        });
      },
    );
  }

  private hoistModulesInChunks(
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
  ): void {
    const { chunkGraph } = compilation;
    const partialChunk = this.containerName
      ? compilation.namedChunks.get(this.containerName)
      : undefined;

    if (!partialChunk) return;

    const modulesToHoist = new Set<Module>();

    for (const chunk of runtimeChunks) {
      if (chunkGraph.getNumberOfEntryModules(chunk) === 0) {
        for (const module of chunkGraph.getChunkModulesIterable(partialChunk)) {
          if (!chunkGraph.isModuleInChunk(module, chunk)) {
            chunkGraph.connectChunkAndModule(chunk, module);
            modulesToHoist.add(module);
          }
        }
        for (const module of modulesToHoist) {
          chunkGraph.disconnectChunkAndModule(partialChunk, module);
        }
      }
    }

    this.cleanUpChunks(chunkGraph, modulesToHoist);
  }

  private cleanUpChunks(
    chunkGraph: Compilation['chunkGraph'],
    modules: Set<Module>,
  ): void {
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (!chunk.hasRuntime()) {
          chunkGraph.disconnectChunkAndModule(chunk, module);
        }
      }
    }
    modules.clear();
  }

  private getRuntimeChunks(compilation: Compilation): Set<Chunk> {
    const runtimeChunks = new Set<Chunk>();
    for (const chunk of compilation.chunks) {
      if (chunk.hasRuntime()) {
        runtimeChunks.add(chunk);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
