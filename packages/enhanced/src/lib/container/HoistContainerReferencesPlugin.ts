import type {
  Chunk,
  Compiler,
  Compilation,
  WebpackPluginInstance,
  Module,
  Dependency,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationModulesPlugin from './runtime/FederationModulesPlugin';
import ContainerEntryDependency from './ContainerEntryDependency';
import FederationRuntimeDependency from './runtime/FederationRuntimeDependency';
import RemoteToExternalDependency from './RemoteToExternalDependency';
import FallbackDependency from './FallbackDependency';

const { AsyncDependenciesBlock, ExternalModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const PLUGIN_NAME = 'HoistContainerReferences';

/**
 * This plugin hoists container-related modules into runtime chunks when using runtimeChunk: single configuration.
 */
class HoistContainerReferences implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        const logger = compilation.getLogger(PLUGIN_NAME);
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntryDependencies = new Set<Dependency>();
        const federationRuntimeDependencies = new Set<Dependency>();
        const remoteDependencies = new Set<Dependency>();

        hooks.addContainerEntryDependency.tap(
          'HoistContainerReferences',
          (dep: ContainerEntryDependency) => {
            containerEntryDependencies.add(dep);
          },
        );
        hooks.addFederationRuntimeDependency.tap(
          'HoistContainerReferences',
          (dep: FederationRuntimeDependency) => {
            federationRuntimeDependencies.add(dep);
          },
        );
        hooks.addRemoteDependency.tap(
          'HoistContainerReferences',
          (dep: RemoteToExternalDependency | FallbackDependency) => {
            remoteDependencies.add(dep);
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
              logger,
              containerEntryDependencies,
              federationRuntimeDependencies,
              remoteDependencies,
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
    logger: ReturnType<Compilation['getLogger']>,
    containerEntryDependencies: Set<Dependency>,
    federationRuntimeDependencies: Set<Dependency>,
    remoteDependencies: Set<Dependency>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    const { forEachRuntime } = compilation.compiler.webpack.util.runtime;
    const allModulesToHoist = new Set<Module>();

    const runtimeChunkByKey = new Map<string, Chunk>();
    for (const chunk of runtimeChunks) {
      forEachRuntime(chunk.runtime, (runtimeKey) => {
        if (runtimeKey) runtimeChunkByKey.set(runtimeKey, chunk);
      });
    }

    const runtimeChunksOf = (module: Module): Set<Chunk> => {
      const chunks = new Set<Chunk>();
      for (const runtimeSpec of chunkGraph.getModuleRuntimes(module)) {
        forEachRuntime(runtimeSpec, (runtimeKey) => {
          const runtimeChunk = runtimeKey && runtimeChunkByKey.get(runtimeKey);
          if (runtimeChunk) chunks.add(runtimeChunk);
        });
      }
      return chunks;
    };

    for (const dep of [
      ...containerEntryDependencies,
      ...federationRuntimeDependencies,
      ...remoteDependencies,
    ]) {
      const module = moduleGraph.getModule(dep);
      if (!module) continue;
      const referencedModules = getAllReferencedModules(
        compilation,
        module,
        'initial',
      );
      referencedModules.forEach((m: Module) => allModulesToHoist.add(m));
      for (const runtimeChunk of runtimeChunksOf(module)) {
        for (const referenced of referencedModules) {
          if (!chunkGraph.isModuleInChunk(referenced, runtimeChunk)) {
            chunkGraph.connectChunkAndModule(runtimeChunk, referenced);
          }
        }
      }
    }

    this.cleanUpChunks(compilation, allModulesToHoist, runtimeChunkByKey);
  }

  // Method to clean up chunks by disconnecting unused modules
  private cleanUpChunks(
    compilation: Compilation,
    modules: Set<Module>,
    runtimeChunkByKey: Map<string, Chunk>,
  ): void {
    const { chunkGraph } = compilation;
    const { forEachRuntime } = compilation.compiler.webpack.util.runtime;
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (chunk.hasRuntime()) continue;
        let hoistedToAllRuntimes = true;
        forEachRuntime(chunk.runtime, (runtimeKey) => {
          const runtimeChunk = runtimeKey && runtimeChunkByKey.get(runtimeKey);
          if (
            !runtimeChunk ||
            !chunkGraph.isModuleInChunk(module, runtimeChunk)
          ) {
            hoistedToAllRuntimes = false;
          }
        });
        if (hoistedToAllRuntimes) {
          chunkGraph.disconnectChunkAndModule(chunk, module);
        }
      }
    }
  }

  // Method to get runtime chunks
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
