import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
  Dependency,
  NormalModule as NormalModuleType,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { RuntimeSpec } from 'webpack/lib/util/runtime';
import type ExportsInfo from 'webpack/lib/ExportsInfo';
import ContainerEntryModule from './ContainerEntryModule';
import { moduleFederationPlugin } from '@module-federation/sdk';
import FederationModulesPlugin from './runtime/FederationModulesPlugin';

const { NormalModule, AsyncDependenciesBlock } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const PLUGIN_NAME = 'HoistContainerReferences';

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  private readonly containerName: string;
  private readonly entryFilePath?: string;
  private readonly bundlerRuntimeDep?: string;
  private readonly explanation: string;
  private readonly experiments: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'];

  constructor(
    name?: string,
    entryFilePath?: string,
    bundlerRuntimeDep?: string,
    experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
  ) {
    this.containerName = name || 'no known chunk name';
    this.entryFilePath = entryFilePath;
    this.bundlerRuntimeDep = bundlerRuntimeDep;
    this.experiments = experiments;
    this.explanation =
      'Bundler runtime path module is required for proper functioning';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        const logger = compilation.getLogger(PLUGIN_NAME);
        const { chunkGraph, moduleGraph } = compilation;
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntryDependencies = new Set<Dependency>();
        hooks.getContainerEntryModules.tap(
          'HoistContainerReferences',
          (dep: Dependency) => {
            containerEntryDependencies.add(dep);
          },
        );
        // Hook into the optimizeChunks phase
        compilation.hooks.optimizeChunks.tap(
          {
            name: PLUGIN_NAME,
            // advanced stage is where SplitChunksPlugin runs.
            stage: 11, // advanced + 1
          },
          (chunks: Iterable<Chunk>) => {
            const runtimeChunks = this.getRuntimeChunks(compilation);
            this.hoistModulesInChunks(
              compilation,
              runtimeChunks,
              chunks,
              logger,
              containerEntryDependencies,
            );
          },
        );

        // Hook into the optimizeDependencies phase
        compilation.hooks.optimizeDependencies.tap(
          {
            name: PLUGIN_NAME,
            // basic optimization stage - it runs first
            stage: -10,
          },
          (modules: Iterable<Module>) => {
            if (this.entryFilePath) {
              let runtime: RuntimeSpec | undefined;
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
                  module.resource === this.bundlerRuntimeDep
                ) {
                  const allRefs = getAllReferencedModules(
                    compilation,
                    module,
                    'initial',
                  );
                  for (const module of allRefs) {
                    const exportsInfo: ExportsInfo =
                      moduleGraph.getExportsInfo(module);
                    // Since i dont use the import federation var, tree shake will eliminate it.
                    // also because currently the runtime is copied into all runtime chunks
                    // some might not have the runtime import in the tree to begin with
                    exportsInfo.setUsedInUnknownWay(runtime);
                    moduleGraph.addExtraReason(module, this.explanation);
                    if (module.factoryMeta === undefined) {
                      module.factoryMeta = {};
                    }
                    module.factoryMeta.sideEffectFree = false;
                  }
                }
              }
            }
          },
        );
      },
    );
  }

  // Helper method to find a specific module in a chunk
  private findModule(
    compilation: Compilation,
    chunk: Chunk,
    entryFilePath: string,
  ): Module | null {
    const { chunkGraph } = compilation;
    let module: Module | null = null;
    for (const mod of chunkGraph.getChunkEntryModulesIterable(chunk)) {
      if (mod instanceof NormalModule && mod.resource === entryFilePath) {
        module = mod;
        break;
      }

      if (mod instanceof ConcatenatedModule) {
        for (const m of mod.modules) {
          if (m instanceof NormalModule && m.resource === entryFilePath) {
            module = mod;
            break;
          }
        }
      }
    }
    return module;
  }

  // Method to hoist modules in chunks
  private hoistModulesInChunks(
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
    chunks: Iterable<Chunk>,
    logger: ReturnType<Compilation['getLogger']>,
    containerEntryDependencies: Set<Dependency>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    // when runtimeChunk: single is set - ContainerPlugin will create a "partial" chunk we can use to
    // move modules into the runtime chunk
    for (const dep of containerEntryDependencies) {
      const containerEntryModule = moduleGraph.getModule(dep);
      if (!containerEntryModule) continue;
      const allReferencedModules = getAllReferencedModules(
        compilation,
        containerEntryModule,
        'initial',
      );
      const containerRuntimes =
        chunkGraph.getModuleRuntimes(containerEntryModule);
      const runtimes = new Set<string>();

      // const moduleChunks = chunkGraph.getModuleChunks(containerEntryModule);

      // for(const chunk of moduleChunks) {
      //   const entryOptions = chunk.getEntryOptions();
      // }

      for (const runtimeSpec of containerRuntimes) {
        compilation.compiler.webpack.util.runtime.forEachRuntime(
          runtimeSpec,
          (runtimeKey) => {
            if (runtimeKey) {
              runtimes.add(runtimeKey);
            }
          },
        );
      }

      for (const runtime of runtimes) {
        const runtimeChunk = compilation.namedChunks.get(runtime);
        if (!runtimeChunk) continue;

        for (const module of allReferencedModules) {
          if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
            chunkGraph.connectChunkAndModule(runtimeChunk, module);
          }
        }
      }

      this.cleanUpChunks(compilation, allReferencedModules);
      // debugger
    }
    //@ts-ignore
    if (!process.env.none) {
      return;
    }

    const partialChunk = this.containerName
      ? compilation.namedChunks.get(this.containerName)
      : undefined;
    let runtimeModule;
    if (!partialChunk) {
      for (const chunk of chunks) {
        if (
          chunkGraph.getNumberOfEntryModules(chunk) > 0 &&
          this.entryFilePath
        ) {
          runtimeModule = this.findModule(
            compilation,
            chunk,
            this.entryFilePath,
          );

          if (runtimeModule) break;
        }
      }
    } else {
      const entryModules = partialChunk
        ? chunkGraph.getChunkEntryModulesIterable(partialChunk)
        : undefined;
      runtimeModule = entryModules
        ? Array.from(entryModules).find(
            (module) => module instanceof ContainerEntryModule,
          )
        : undefined;
    }

    if (!runtimeModule) {
      logger.error(
        '[Federation HoistContainerReferences] unable to find runtime module:',
        this.entryFilePath,
      );
      return;
    }

    const allReferencedModules = getAllReferencedModules(
      compilation,
      runtimeModule,
      'initial',
    );

    // If single runtime chunk, copy the remoteEntry into the runtime chunk to allow for embed container
    // this will not work well if there multiple runtime chunks from entrypoints (like next)
    // need better solution to multi runtime chunk hoisting
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

  // Method to clean up chunks by disconnecting unused modules
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
            if (chunk.name) {
              compilation.namedChunks.delete(chunk.name);
            }
          }
        }
      }
    }
    modules.clear();
  }

  // Helper method to get runtime chunks from the compilation
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

// Helper method to collect all referenced modules recursively
export function getAllReferencedModules(
  compilation: Compilation,
  module: Module,
  type?: 'all' | 'initial',
): Set<Module> {
  const collectedModules = new Set<Module>([module]);
  const stack = [module];

  while (stack.length > 0) {
    const currentModule = stack.pop();
    if (!currentModule) continue;
    const mgm = compilation.moduleGraph._getModuleGraphModule(currentModule);
    if (mgm && mgm.outgoingConnections) {
      for (const connection of mgm.outgoingConnections) {
        if (type === 'initial') {
          const parentBlock = compilation.moduleGraph.getParentBlock(
            connection.dependency,
          );
          if (parentBlock instanceof AsyncDependenciesBlock) {
            continue;
          }
        }
        if (connection.module && !collectedModules.has(connection.module)) {
          collectedModules.add(connection.module);
          stack.push(connection.module);
        }
      }
    }
  }

  return collectedModules;
}

export default HoistContainerReferences;
