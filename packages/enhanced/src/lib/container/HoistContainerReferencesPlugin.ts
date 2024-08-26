import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
  ExternalModule,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const { NormalModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const PLUGIN_NAME = 'HoistContainerReferences';

export class HoistContainerReferences implements WebpackPluginInstance {
  private readonly containerName: string;
  private readonly bundlerRuntimePath?: string;
  private readonly explanation: string;

  constructor(name?: string, bundlerRuntimePath?: string) {
    this.containerName = name || 'no known chunk name';
    this.bundlerRuntimePath = bundlerRuntimePath;
    this.explanation =
      'Bundler runtime path module is required for proper functioning';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        const logger = compilation.getLogger(PLUGIN_NAME);
        const { chunkGraph, moduleGraph } = compilation;
        compilation.hooks.optimizeChunks.tap(
          {
            name: PLUGIN_NAME,
            stage: 11, // advanced + 1
          },
          (chunks: Iterable<Chunk>) => {
            const runtimeChunks = this.getRuntimeChunks(compilation);
            this.hoistModulesInChunks(
              compilation,
              runtimeChunks,
              chunks,
              logger,
            );
          },
        );

        compilation.hooks.optimizeDependencies.tap(
          PLUGIN_NAME,
          (modules: Iterable<Module>) => {
            if (this.bundlerRuntimePath) {
              let runtime;
              compiler.webpack.util.runtime.mergeRuntimeOwned;
              for (const [name, { options }] of compilation.entries) {
                runtime = compiler.webpack.util.runtime.mergeRuntimeOwned(
                  runtime,
                  compiler.webpack.util.runtime.getEntryRuntime(
                    compilation,
                    name,
                    options,
                  ),
                );
              }
              for (const module of modules) {
                if (
                  module instanceof NormalModule &&
                  module.resource === this.bundlerRuntimePath
                ) {
                  const exportsInfo = moduleGraph.getExportsInfo(module);
                  exportsInfo.setUsedInUnknownWay(runtime);
                  moduleGraph.addExtraReason(module, this.explanation);
                  if (module.factoryMeta === undefined) {
                    module.factoryMeta = {};
                  }
                  module.factoryMeta.sideEffectFree = false;
                }
              }
            }
          },
        );
      },
    );
  }

  private getAllReferencedModules(compilation: Compilation, module: Module) {
    const collectedModules = new Set<Module>([module]);
    const collectOutgoingConnections = (module: Module) => {
      const mgm = compilation.moduleGraph._getModuleGraphModule(module);
      if (mgm && mgm.outgoingConnections) {
        for (const connection of mgm.outgoingConnections) {
          if (connection?.module && !collectedModules.has(connection.module)) {
            collectedModules.add(connection.module);
            collectOutgoingConnections(connection.module);
          }
        }
      }
    };

    if (module) {
      collectOutgoingConnections(module);
    }
    return collectedModules;
  }

  private findModule(
    compilation: Compilation,
    chunk: Chunk,
    bundlerRuntimePath: string,
  ): Module | null {
    const { chunkGraph } = compilation;
    for (const mod of chunkGraph.getChunkModulesIterable(chunk)) {
      if (mod instanceof NormalModule && mod.resource === bundlerRuntimePath) {
        return mod;
      }

      if (mod instanceof ConcatenatedModule) {
        for (const m of mod.modules) {
          if (m instanceof NormalModule && m.resource === bundlerRuntimePath) {
            return mod;
          }
        }
      }
    }
    return null;
  }

  private hoistModulesInChunks(
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
    chunks: Iterable<Chunk>,
    logger: ReturnType<Compilation['getLogger']>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    const partialChunk = this.containerName
      ? compilation.namedChunks.get(this.containerName)
      : undefined;
    let runtimeModule;
    if (!partialChunk) {
      for (const chunk of chunks) {
        if (
          chunkGraph.getNumberOfEntryModules(chunk) > 0 &&
          this.bundlerRuntimePath
        ) {
          runtimeModule = this.findModule(
            compilation,
            chunk,
            this.bundlerRuntimePath,
          );

          if (runtimeModule) break;
        }
      }
    } else {
      runtimeModule = moduleGraph.getModule(
        partialChunk.entryModule.dependencies[1],
      );
    }

    if (!runtimeModule) {
      logger.error('unable to find runtime module');
      return;
    }

    const allReferencedModules = this.getAllReferencedModules(
      compilation,
      runtimeModule,
    );

    // if is single runtime chunk, copy the remoteEntry into the runtime chunk to allow for embed container
    if (partialChunk) {
      for (const module of chunkGraph.getChunkModulesIterable(partialChunk)) {
        allReferencedModules.add(module);
      }
    }

    for (const chunk of runtimeChunks) {
      for (const module of allReferencedModules) {
        if (!chunkGraph.isModuleInChunk(module, chunk)) {
          chunkGraph.connectChunkAndModule(chunk, module);
        }
      }
    }

    // Set used exports for the runtime module

    this.cleanUpChunks(compilation, allReferencedModules);
  }

  private cleanUpChunks(compilation: Compilation, modules: Set<Module>): void {
    const { chunkGraph } = compilation;
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (!chunk.hasRuntime()) {
          chunkGraph.disconnectChunkAndModule(chunk, module);
          if (
            chunkGraph.getNumberOfChunkModules(chunk) === 0 &&
            chunkGraph.getNumberOfEntryModules(chunk) === 0
          ) {
            chunkGraph.disconnectChunk(chunk);
            compilation.chunks.delete(chunk);
          }
        }
      }
    }
    modules.clear();
  }

  private getRuntimeChunks(compilation: Compilation): Set<Chunk> {
    const runtimeChunks = new Set<Chunk>();
    const entries = compilation.entrypoints;

    for (const entrypoint of entries.values()) {
      const runtimeChunk = entrypoint.getRuntimeChunk();
      if (runtimeChunk) {
        runtimeChunks.add(runtimeChunk);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
