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
import FederationWorkerRuntimeDependency from './runtime/FederationWorkerRuntimeDependency';
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
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntryDependencies = new Set<Dependency>();
        const federationRuntimeDependencies = new Set<Dependency>();
        const workerRuntimeDependencies = new Set<Dependency>();
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
            if (dep instanceof FederationWorkerRuntimeDependency) {
              workerRuntimeDependencies.add(dep);
            } else {
              federationRuntimeDependencies.add(dep);
            }
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
            const debugLogger = compilation.getLogger(`${PLUGIN_NAME}:debug`);
            debugLogger.warn(
              `container=${containerEntryDependencies.size} runtime=${federationRuntimeDependencies.size} worker=${workerRuntimeDependencies.size} remote=${remoteDependencies.size}`,
            );
            this.hoistModulesInChunks(
              compilation,
              runtimeChunks,
              containerEntryDependencies,
              federationRuntimeDependencies,
              workerRuntimeDependencies,
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
    containerEntryDependencies: Set<Dependency>,
    federationRuntimeDependencies: Set<Dependency>,
    workerRuntimeDependencies: Set<Dependency>,
    remoteDependencies: Set<Dependency>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    const allModulesToHoist = new Set<Module>();
    const runtimeDependencyChunks = new Set<Chunk>();
    const debugLogger = compilation.getLogger(`${PLUGIN_NAME}:hoist`);

    const runtimeChunkByName = new Map<string, Chunk>();
    for (const chunk of runtimeChunks) {
      const registerName = (name?: string) => {
        if (name && !runtimeChunkByName.has(name)) {
          runtimeChunkByName.set(name, chunk);
        }
      };

      registerName(chunk.name);

      const runtime = (chunk as unknown as { runtime?: Iterable<string> })
        .runtime;
      if (runtime && typeof (runtime as any)[Symbol.iterator] === 'function') {
        for (const name of runtime as Iterable<string>) {
          registerName(name);
        }
      }
    }

    const addRuntimeChunksByName = (
      targetChunks: Set<Chunk>,
      runtimeKey: string,
    ) => {
      const direct = runtimeChunkByName.get(runtimeKey);
      if (direct) {
        targetChunks.add(direct);
      }

      if (runtimeKey.includes('\n')) {
        for (const fragment of runtimeKey.split(/\n/)) {
          const chunk = runtimeChunkByName.get(fragment);
          if (chunk) {
            targetChunks.add(chunk);
          }
        }
      }

      const namedChunk = compilation.namedChunks.get(runtimeKey);
      if (namedChunk) {
        targetChunks.add(namedChunk);
      }
    };

    const collectTargetChunks = (
      targetModule: Module,
      dependency?: Dependency,
    ): Set<Chunk> => {
      const targetChunks = new Set<Chunk>();

      for (const chunk of chunkGraph.getModuleChunks(targetModule)) {
        targetChunks.add(chunk);
      }

      const moduleRuntimes = chunkGraph.getModuleRuntimes(targetModule);
      for (const runtimeSpec of moduleRuntimes) {
        compilation.compiler.webpack.util.runtime.forEachRuntime(
          runtimeSpec,
          (runtimeKey) => {
            if (!runtimeKey) {
              return;
            }
            addRuntimeChunksByName(targetChunks, runtimeKey);
          },
        );
      }

      if (dependency) {
        const parentBlock = moduleGraph.getParentBlock(dependency);
        if (parentBlock instanceof AsyncDependenciesBlock) {
          const chunkGroup = chunkGraph.getBlockChunkGroup(parentBlock);
          if (chunkGroup) {
            for (const chunk of chunkGroup.chunks) {
              targetChunks.add(chunk);
            }
          }
        }
      }

      return targetChunks;
    };

    const connectModulesToChunks = (
      targetChunks: Iterable<Chunk>,
      modules: Iterable<Module>,
    ) => {
      for (const chunk of targetChunks) {
        for (const module of modules) {
          if (!chunkGraph.isModuleInChunk(module, chunk)) {
            chunkGraph.connectChunkAndModule(chunk, module);
          }
        }
      }
    };

    // Process container entry dependencies (needed for nextjs-mf exposed modules)
    for (const dep of containerEntryDependencies) {
      const containerEntryModule = moduleGraph.getModule(dep);
      if (!containerEntryModule) continue;
      const referencedModules = getAllReferencedModules(
        compilation,
        containerEntryModule,
        'initial',
      );
      referencedModules.forEach((m: Module) => allModulesToHoist.add(m));
      const targetChunks = collectTargetChunks(containerEntryModule, dep);
      if (targetChunks.size === 0) {
        continue;
      }

      debugLogger.warn(
        `container entry modules -> [${Array.from(referencedModules)
          .map((module: Module) =>
            typeof (module as any)?.identifier === 'function'
              ? (module as any).identifier()
              : (module?.toString?.() ?? '[unknown]'),
          )
          .join(', ')}]`,
      );

      connectModulesToChunks(targetChunks, referencedModules);
    }

    // Worker federation runtime dependencies may originate from async blocks
    // (e.g. web workers). Hoist the full dependency graph to keep worker
    // runtimes self-contained.
    for (const dep of workerRuntimeDependencies) {
      const runtimeModule = moduleGraph.getModule(dep);
      if (!runtimeModule) continue;

      const referencedModules = getAllReferencedModules(
        compilation,
        runtimeModule,
        'all',
      );
      referencedModules.forEach((module) => allModulesToHoist.add(module));

      const targetChunks = collectTargetChunks(runtimeModule, dep);
      if (targetChunks.size === 0) {
        continue;
      }

      for (const chunk of targetChunks) {
        runtimeDependencyChunks.add(chunk);
      }

      debugLogger.warn(
        `worker runtime modules -> [${Array.from(targetChunks)
          .map((chunk) => chunk.name ?? String(chunk.id ?? ''))
          .join(', ')}]`,
      );

      connectModulesToChunks(targetChunks, referencedModules);
    }

    // Federation Runtime Dependencies: use 'initial' (not 'all')
    for (const dep of federationRuntimeDependencies) {
      const runtimeModule = moduleGraph.getModule(dep);
      if (!runtimeModule) continue;
      const referencedModules = getAllReferencedModules(
        compilation,
        runtimeModule,
        'initial',
      );
      referencedModules.forEach((m: Module) => allModulesToHoist.add(m));
      const targetChunks = collectTargetChunks(runtimeModule, dep);
      if (targetChunks.size === 0) {
        continue;
      }

      for (const chunk of targetChunks) {
        runtimeDependencyChunks.add(chunk);
      }

      debugLogger.warn(
        `runtime modules -> [${Array.from(targetChunks)
          .map((chunk) => chunk.name ?? String(chunk.id ?? ''))
          .join(', ')}]`,
      );

      connectModulesToChunks(targetChunks, referencedModules);
    }

    // Process remote dependencies
    for (const remoteDep of remoteDependencies) {
      const remoteModule = moduleGraph.getModule(remoteDep);
      if (!remoteModule) continue;
      const referencedRemoteModules = getAllReferencedModules(
        compilation,
        remoteModule,
        'initial',
      );
      referencedRemoteModules.forEach((m: Module) => allModulesToHoist.add(m));
      const targetChunks = collectTargetChunks(remoteModule, remoteDep);
      for (const chunk of runtimeDependencyChunks) {
        targetChunks.add(chunk);
      }
      if (targetChunks.size === 0) {
        continue;
      }

      debugLogger.warn(
        `remote modules -> [${Array.from(targetChunks)
          .map((chunk) => chunk.name ?? String(chunk.id ?? ''))
          .join(', ')}]`,
      );
      debugLogger.warn(
        `remote module ids -> [${Array.from(referencedRemoteModules)
          .map((module: Module) =>
            typeof (module as any)?.identifier === 'function'
              ? (module as any).identifier()
              : (module?.toString?.() ?? '[unknown]'),
          )
          .join(', ')}]`,
      );

      connectModulesToChunks(targetChunks, referencedRemoteModules);
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
