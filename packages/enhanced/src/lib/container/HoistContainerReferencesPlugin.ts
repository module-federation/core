import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  ExternalModule,
  Module,
} from 'webpack';
import ContainerEntryModule from './ContainerEntryModule';

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  private containerName?: string | undefined;

  constructor(name: any) {
    this.containerName = name || 'no known chunk name';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterChunks.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>) => {
            const runtimeChunks = this.getRuntimeChunks(compilation);
            this.hoistModulesInChunk(chunks, compilation, runtimeChunks);
          },
        );
      },
    );
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
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

  private hoistModulesInChunk(
    chunks: Iterable<Chunk>,
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    const modulesToRemote = new Set<Module>();
    for (const chunk of chunks) {
      if (chunk.hasRuntime() && this.containerName) {
        const partial = compilation.namedChunks.get(this.containerName);

        if (partial && chunkGraph.getNumberOfEntryModules(chunk) === 0) {
          for (const mod of compilation.chunkGraph.getChunkModulesIterable(
            partial,
          )) {
            if (!chunkGraph.isModuleInChunk(mod, chunk)) {
              chunk.addModule(mod);
              modulesToRemote.add(mod);
            }
            partial.removeModule(mod);
          }
        }
      }
    }
    for (const module of modulesToRemote) {
      const modulechunks = chunkGraph.getModuleChunks(module);
      for (const chunk of modulechunks) {
        if (chunk.hasRuntime()) continue;
        chunk.removeModule(module);
      }
    }
  }

  private getRuntimeChunks(compilation: Compilation): Set<Chunk> {
    const runtimeChunks = new Set<Chunk>();
    for (const c of compilation.chunks) {
      if (c.hasRuntime()) {
        runtimeChunks.add(c);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
