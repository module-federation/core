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
import ContainerEntryDependency from './ContainerEntryDependency';
import FederationRuntimeDependency from './runtime/FederationRuntimeDependency';
import RemoteToExternalDependency from './RemoteToExternalDependency';
import RemoteModule from './RemoteModule';

const { NormalModule, AsyncDependenciesBlock, ExternalModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const PLUGIN_NAME = 'HoistContainerReferences';

/**
 * This class is used to hoist container references in the code.
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
        hooks.addContainerEntryModule.tap(
          'HoistContainerReferences',
          (dep: ContainerEntryDependency) => {
            containerEntryDependencies.add(dep);
          },
        );
        hooks.addFederationRuntimeModule.tap(
          'HoistContainerReferences',
          (dep: FederationRuntimeDependency) => {
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
      },
    );
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

      const allRemoteReferences = getAllReferencedModules(
        compilation,
        containerEntryModule,
        'external',
      );

      for (const remote of allRemoteReferences) {
        allReferencedModules.add(remote);
      }

      const containerRuntimes =
        chunkGraph.getModuleRuntimes(containerEntryModule);
      const runtimes = new Set<string>();

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
          for (const chunk of chunkGraph.getModuleChunks(module)) {
            chunkGraph.disconnectChunkAndModule(chunk, module);
          }
          chunkGraph.connectChunkAndModule(runtimeChunk, module);
        }
      }

      this.cleanUpChunks(compilation, allReferencedModules);
    }
  }

  // Method to clean up chunks by disconnecting unused modules
  private cleanUpChunks(compilation: Compilation, modules: Set<Module>): void {
    const { chunkGraph } = compilation;
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (!chunk.hasRuntime()) {
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
  type?: 'all' | 'initial' | 'external',
): Set<Module> {
  const collectedModules = new Set<Module>([module]);
  const visitedModules = new WeakSet<Module>([module]);
  const stack = [module];

  while (stack.length > 0) {
    const currentModule = stack.pop();
    if (!currentModule) continue;

    const mgm = compilation.moduleGraph._getModuleGraphModule(currentModule);
    if (!mgm?.outgoingConnections) continue;
    for (const connection of mgm.outgoingConnections) {
      const connectedModule = connection.module;

      // Skip if module has already been visited
      if (!connectedModule || visitedModules.has(connectedModule)) {
        continue;
      }

      // Handle 'initial' type (skipping async blocks)
      if (type === 'initial') {
        const parentBlock = compilation.moduleGraph.getParentBlock(
          connection.dependency,
        );
        if (parentBlock instanceof AsyncDependenciesBlock) {
          continue;
        }
      }

      // Handle 'external' type (collecting only external modules)
      if (type === 'external') {
        if (connection.module instanceof ExternalModule) {
          collectedModules.add(connectedModule);
        }
      } else {
        // Handle 'all' or unspecified types
        collectedModules.add(connectedModule);
      }

      // Add connected module to the stack and mark it as visited
      visitedModules.add(connectedModule);
      stack.push(connectedModule);
    }
  }

  return collectedModules;
}

export default HoistContainerReferences;
