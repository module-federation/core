import type {
  Compiler,
  Compilation,
  Chunk,
  NormalModule,
  Module,
} from 'webpack';

class DelegateModulesPlugin {
  options: { debug: boolean; [key: string]: any };
  _delegateModules: Map<string, NormalModule>;

  constructor(options: { debug?: boolean; [key: string]: any }) {
    this.options = { debug: false, ...options };
    this._delegateModules = new Map();
  }

  getChunkByName(chunks: Iterable<Chunk>, name: string): Chunk | undefined {
    for (const chunk of chunks) {
      if (chunk.name === name) {
        return chunk;
      }
    }
    return undefined;
  }

  private addDelegatesToChunks(
    compilation: Compilation,
    chunks: Iterable<Chunk>,
  ): void {
    for (const chunk of chunks) {
      this._delegateModules.forEach((module) => {
        this.addModuleAndDependenciesToChunk(module, chunk, compilation);
      });
    }
  }

  private addModuleAndDependenciesToChunk(
    module: NormalModule,
    chunk: Chunk,
    compilation: Compilation,
  ): void {
    if (!compilation.chunkGraph.isModuleInChunk(module, chunk)) {
      if (this.options.debug) {
        console.log('adding ', module.identifier(), ' to chunk', chunk.name);
      }
      compilation.chunkGraph.connectChunkAndModule(chunk, module);
    }
  }

  removeDelegatesNonRuntimeChunks(
    compilation: Compilation,
    chunks: Iterable<Chunk>,
  ): void {
    for (const chunk of chunks) {
      if (!chunk.hasRuntime()) {
        this.options.debug &&
          console.log(
            'non-runtime chunk:',
            chunk.debugId,
            chunk.id,
            chunk.name,
          );

        for (const [id, module] of this._delegateModules) {
          compilation.chunkGraph.disconnectChunkAndModule(chunk, module);
        }
      }
    }
  }
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'DelegateModulesPlugin',
      (compilation: Compilation) => {
        compilation.hooks.finishModules.tapAsync(
          'DelegateModulesPlugin',
          (modules: Iterable<Module>, callback: () => void) => {
            const { remotes } = this.options;
            const knownDelegates = new Set(
              remotes
                ? (Object.values(remotes) as string[]).map((remote: string) =>
                    remote.replace('internal ', ''),
                  )
                : [],
            );
            for (const module of modules) {
              const normalModule = module as NormalModule;
              if (normalModule) {
                const mid = normalModule.identifier();
                if (
                  normalModule?.userRequest?.startsWith(
                    'webpack/container/reference',
                  )
                ) {
                  this._delegateModules.set(mid, normalModule);
                }
              }
              if (
                normalModule.resource &&
                knownDelegates.has(normalModule.resource)
              ) {
                this._delegateModules.set(normalModule.resource, normalModule);
              }
            }
            callback();
          },
        );

        compilation.hooks.optimizeChunks.tap(
          'DelegateModulesPlugin',
          (chunks: Iterable<Chunk>) => {
            const { runtime, container } = this.options;
            const runtimeChunk = this.getChunkByName(chunks, runtime);
            if (!runtimeChunk || !runtimeChunk.hasRuntime()) {
              return;
            }
            // Get the container chunk if specified
            const remoteContainer = container
              ? this.getChunkByName(chunks, container)
              : null;

            this.options.debug &&
              console.log(
                remoteContainer?.name,
                runtimeChunk.name,
                this._delegateModules.size,
              );
            this.addDelegatesToChunks(
              compilation,
              [remoteContainer, runtimeChunk].filter(Boolean) as Chunk[],
            );

            this.removeDelegatesNonRuntimeChunks(compilation, chunks);
          },
        );
      },
    );
  }
}

export default DelegateModulesPlugin;
