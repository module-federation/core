import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryModule from './ContainerEntryModule';

const runtime = require(
  normalizeWebpackPath('webpack/lib/util/runtime'),
) as typeof import('webpack/lib/util/runtime');

export class HoistContainerReferencesPlugin implements WebpackPluginInstance {
  private integratedChunks: Set<Chunk> = new Set();
  integrateChunks(
    chunkA: Chunk,
    chunkB: Chunk,
    compilation: Compilation,
  ): void {
    const { chunkGraph, compiler } = compilation;
    // Merge id name hints
    for (const hint of chunkB.idNameHints) {
      chunkA.idNameHints.add(hint);
    }
    this.integratedChunks.add(chunkB);
    // Merge runtime
    //@ts-ignore
    chunkB.runtime = runtime.mergeRuntime(chunkA.runtime, chunkB.runtime);
    // getChunkModules is used here to create a clone, because disconnectChunkAndModule modifies
    for (const module of chunkGraph.getChunkModules(chunkB)) {
      // chunkGraph.disconnectChunkAndModule(chunkB, module);
      chunkGraph.connectChunkAndModule(chunkA, module);
    }

    for (const [module, chunkGroup] of Array.from(
      chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunkB),
    )) {
      // dont disconnect as module may need to be copied into multiple chunks
      // chunkGraph.disconnectChunkAndEntryModule(chunkB, module);
      //connect as normal module not entry module to preserve existing entrypoint modules
      chunkGraph.connectChunkAndModule(chunkA, module);
      // chunkGraph.connectChunkAndEntryModule(chunkA, module,chunkGroup);
    }

    for (const chunkGroup of chunkB.groupsIterable) {
      chunkGroup.replaceChunk(chunkB, chunkA);
      chunkA.addGroup(chunkGroup);
      chunkB.removeGroup(chunkGroup);
    }
    compiler.webpack.ChunkGraph.clearChunkGraphForChunk(chunkB);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'HoistContainerReferencesPlugin',
      (compilation: Compilation) => {
        const runtimes: Set<string> = new Set();

        compilation.hooks.afterOptimizeChunks.tap(
          {
            name: 'HoistContainerReferencesPlugin',
            stage: 10, // Advanced stage chunk optimization.
          },
          (chunks: Iterable<Chunk>) => this.processChunks(chunks, compilation),
        );

        // compilation.hooks.beforeChunkAssets.tap(
        //   'HoistContainerReferencesPlugin',
        //   () => {
        //     // the federation-runtime chunk is integrated into multiple other runtime chunks, like main, or runtime.js
        //     // because this entrypoint is integrated using chunk group updates - this chunk cannot be emitted without causing multiple writes to same runtime
        //     // the federation-runtime serves no output process, it is used as a reference to hoist federation runtime once into all runtime chunks for eager consumption
        //     // this plugin serves
        //     // const federationRuntimeChunk =
        //     //   compilation.namedChunks.get('federation-runtime');
        //     //
        //     // const federationRuntimePluginsChunk = compilation.namedChunks.get(
        //     //   'mfp-runtime-plugins',
        //     // );
        //     // if (federationRuntimeChunk) {
        //     //   compilation.chunks.delete(federationRuntimeChunk);
        //     //   this.integratedChunks.delete(federationRuntimeChunk);
        //     // }
        //     // if (federationRuntimePluginsChunk) {
        //     //   compilation.chunks.delete(federationRuntimePluginsChunk);
        //     //   this.integratedChunks.delete(federationRuntimePluginsChunk);
        //     // }
        //     //@ts-ignore
        //     //             compilation.chunks.delete(compilation.namedChunks.get('backup'))
        //     //             compilation.namedChunks.delete('backup');
        //     // compilation.namedChunks.delete('federation-runtime');
        //     // compilation.namedChunks.delete('mfp-runtime-plugins');
        //     // for (const chunk of this.integratedChunks) {
        //     //   compilation.chunks.delete(chunk);
        //     //   if (chunk.name) compilation.namedChunks.delete(chunk.name);
        //     // }
        //   },
        // );
      },
    );
  }

  processChunks(chunks: Iterable<Chunk>, compilation: Compilation) {
    const { chunkGraph, compiler } = compilation;
    const runtimes = new Set<string>();
    this.collectRuntimes(chunks, runtimes);

    if (!compiler.options.optimization.runtimeChunk) {
      this.optimizeWithoutRuntimeChunk(chunks, compilation);
    } else {
      this.optimizeWithRuntimeChunk(compilation, runtimes);
    }
  }

  collectRuntimes(chunks: Iterable<Chunk>, runtimes: Set<string>) {
    for (const chunk of chunks) {
      if (!chunk.runtime) continue;
      if (typeof chunk.runtime === 'string') {
        runtimes.add(chunk.runtime);
      } else {
        for (const runtime of chunk.runtime) {
          runtimes.add(runtime);
        }
      }
    }
  }

  optimizeWithoutRuntimeChunk(
    chunks: Iterable<Chunk>,
    compilation: Compilation,
  ) {
    const federationRuntimeChunk =
      compilation.namedChunks.get('federation-runtime');

    if (federationRuntimeChunk) {
      this.integrateRuntimeChunks(chunks, federationRuntimeChunk, compilation);
      this.disconnectModulesFromChunk(compilation, federationRuntimeChunk);
    }
  }

  integrateRuntimeChunks(
    chunks: Iterable<Chunk>,
    federationRuntimeChunk: Chunk,
    compilation: Compilation,
  ) {
    for (const chunk of chunks) {
      if (
        chunk.hasRuntime() &&
        !this.chunkContainsContainerEntryModule(chunk, compilation)
      ) {
        if (chunk !== federationRuntimeChunk) {
          this.integrateChunks(chunk, federationRuntimeChunk, compilation);
        }
      }
    }
  }

  disconnectModulesFromChunk(compilation: Compilation, chunk: Chunk) {
    const { chunkGraph } = compilation;
    for (const module of chunkGraph.getChunkModules(chunk)) {
      chunkGraph.disconnectChunkAndModule(chunk, module);
    }
  }

  optimizeWithRuntimeChunk(compilation: Compilation, runtimes: Set<string>) {
    const baseRuntimeName = 'federation-runtime';

    for (const runtime of runtimes) {
      this.handleRuntimeChunks(compilation, runtime, baseRuntimeName);
    }
  }

  handleRuntimeChunks(
    compilation: Compilation,
    runtime: string,
    baseRuntimeName: string,
  ) {
    const runtimeChunk = compilation.namedChunks.get(runtime);
    if (
      !runtimeChunk ||
      this.chunkContainsContainerEntryModule(runtimeChunk, compilation)
    )
      return;

    const federationRuntimeChunk = this.getNamedChunk(
      compilation,
      `${baseRuntimeName}-${runtime}`,
      baseRuntimeName,
    );

    if (federationRuntimeChunk) {
      this.integrateChunks(runtimeChunk, federationRuntimeChunk, compilation);
      compilation.chunks.delete(federationRuntimeChunk);
    }
  }

  getNamedChunk(
    compilation: Compilation,
    newChunkName: string,
    defaultChunkName: string,
  ): Chunk | undefined {
    if (compilation.namedChunks.has(newChunkName))
      return compilation.namedChunks.get(newChunkName);
    return compilation.namedChunks.get(defaultChunkName);
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): boolean {
    let hasContainerEntryModule = false;
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module instanceof ContainerEntryModule) {
        hasContainerEntryModule = true;
        break;
      }
    }
    return hasContainerEntryModule;
  }
}

export default HoistContainerReferencesPlugin;
