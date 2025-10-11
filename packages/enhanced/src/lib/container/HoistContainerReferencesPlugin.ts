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
    const allModulesToHoist = new Set<Module>();

    // Process container entry dependencies (needed for nextjs-mf exposed modules)
    for (const dep of containerEntryDependencies) {
      const containerEntryModule = moduleGraph.getModule(dep);
      if (!containerEntryModule) continue;
      if (shouldSkipModule(containerEntryModule)) continue;
      const referencedModules = getAllReferencedModules(
        compilation,
        containerEntryModule,
        'initial',
      );
      referencedModules.forEach((m: Module) => allModulesToHoist.add(m));
      const moduleRuntimes = chunkGraph.getModuleRuntimes(containerEntryModule);
      const runtimes = new Set<string>();
      for (const runtimeSpec of moduleRuntimes) {
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
        for (const module of referencedModules) {
          if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
            chunkGraph.connectChunkAndModule(runtimeChunk, module);
          }
        }
      }
    }

    // Federation Runtime Dependencies: use 'initial' (not 'all')
    for (const dep of federationRuntimeDependencies) {
      const runtimeModule = moduleGraph.getModule(dep);
      if (!runtimeModule) continue;
      if (shouldSkipModule(runtimeModule)) continue;
      const referencedModules = getAllReferencedModules(
        compilation,
        runtimeModule,
        'initial',
      );
      referencedModules.forEach((m: Module) => allModulesToHoist.add(m));
      const moduleRuntimes = chunkGraph.getModuleRuntimes(runtimeModule);
      const runtimes = new Set<string>();
      for (const runtimeSpec of moduleRuntimes) {
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
        for (const module of referencedModules) {
          if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
            chunkGraph.connectChunkAndModule(runtimeChunk, module);
          }
        }
      }
    }

    // Process remote dependencies
    for (const remoteDep of remoteDependencies) {
      const remoteModule = moduleGraph.getModule(remoteDep);
      if (!remoteModule) continue;
      if (shouldSkipModule(remoteModule)) continue;
      const referencedRemoteModules = getAllReferencedModules(
        compilation,
        remoteModule,
        'initial',
      );
      referencedRemoteModules.forEach((m: Module) => allModulesToHoist.add(m));
      const remoteModuleRuntimes = chunkGraph.getModuleRuntimes(remoteModule);
      const remoteRuntimes = new Set<string>();
      for (const runtimeSpec of remoteModuleRuntimes) {
        compilation.compiler.webpack.util.runtime.forEachRuntime(
          runtimeSpec,
          (runtimeKey) => {
            if (runtimeKey) remoteRuntimes.add(runtimeKey);
          },
        );
      }
      for (const runtime of remoteRuntimes) {
        const runtimeChunk = compilation.namedChunks.get(runtime);
        if (!runtimeChunk) continue;
        for (const module of referencedRemoteModules) {
          if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
            chunkGraph.connectChunkAndModule(runtimeChunk, module);
          }
        }
      }
    }

    this.cleanUpChunks(compilation, allModulesToHoist);
  }

  // Method to clean up chunks by disconnecting unused modules
  private cleanUpChunks(compilation: Compilation, modules: Set<Module>): void {
    const { chunkGraph } = compilation;
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (!chunk.hasRuntime()) {
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
        if (
          connection.module instanceof ExternalModule &&
          !shouldSkipModule(connection.module)
        ) {
          collectedModules.add(connectedModule);
        }
      } else {
        // Handle 'all' or unspecified types
        if (!shouldSkipModule(connectedModule)) {
          collectedModules.add(connectedModule);
        }
      }

      // Add connected module to the stack and mark it as visited
      visitedModules.add(connectedModule);
      stack.push(connectedModule);
    }
  }

  return collectedModules;
}

function shouldSkipModule(module: Module): boolean {
  if (!module) return true;
  const candidate: any = module as any;
  const request = candidate.request ?? candidate.userRequest;
  if (request === false || request === 'false') {
    return true;
  }
  const resource = candidate.resource;
  if (resource === 'false') {
    return true;
  }
  const identifier =
    typeof candidate.identifier === 'function'
      ? candidate.identifier()
      : undefined;
  if (
    identifier &&
    identifier.includes(' external ') &&
    identifier.endsWith(' false')
  ) {
    return true;
  }

  return false;
}

export default HoistContainerReferences;
