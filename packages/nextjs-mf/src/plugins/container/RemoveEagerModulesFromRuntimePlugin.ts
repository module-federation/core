import { Compiler, Compilation, Chunk, Module } from 'webpack';

class RemoveEagerModulesFromRuntimePlugin {
  private container: string | undefined;
  private debug: boolean;
  private dependentModules: Set<Module>;
  private visitedModules: Set<Module>;

  constructor(options: { container?: string; debug?: boolean }) {
    this.container = options.container;
    this.debug = options.debug || false;
    this.dependentModules = new Set<Module>();
    this.visitedModules = new Set<Module>();
  }

  apply(compiler: Compiler) {
    if (!this.container) {
      console.warn(
        '[nextjs-mf]:',
        'RemoveEagerModulesFromRuntimePlugin container is not defined:',
        this.container
      );
      return;
    }
    compiler.hooks.thisCompilation.tap(
      'RemoveEagerModulesFromRuntimePlugin',
      (compilation: Compilation) => {
        compilation.hooks.optimizeChunkModules.tap(
          'RemoveEagerModulesFromRuntimePlugin',
          (chunks: Iterable<Chunk>, modules: Iterable<Module>) => {
            for (const chunk of chunks) {
              if (chunk.hasRuntime() && chunk.name === this.container) {
                const eagerModulesInRemote = this.getEagerModulesInRemote(
                  compilation,
                  chunk
                );
                this.processModules(
                  compilation,
                  chunk,
                  modules,
                  eagerModulesInRemote
                );
                this.removeDependentModules(compilation, chunk);
              }
            }
          }
        );
      }
    );
  }

  private traverseModuleGraph(module: Module, compilation: Compilation) {
    // Check if module has been visited before
    if (this.visitedModules.has(module)) {
      return; // Skip traversal if module has been visited
    }

    this.visitedModules.add(module); // Mark module as visited

    // Skip traversal for certain module types
    if (
      module.type === 'provide-module' ||
      module.type === 'consume-shared-module'
    ) {
      return;
    }

    this.dependentModules.add(module); // Add module to dependent modules set

    module.dependencies.forEach((dependency) => {
      // Get the dependent module using moduleGraph
      const dependentModule = compilation.moduleGraph.getModule(dependency);

      // If dependent module exists and is not already in dependentModules set, traverse it
      if (dependentModule && !this.dependentModules.has(dependentModule)) {
        this.traverseModuleGraph(dependentModule, compilation);
      }
    });
  }

  private getEagerModulesInRemote(compilation: Compilation, chunk: Chunk) {
    const eagerModulesInRemote: Set<string> = new Set();
    const iterableModules =
      compilation.chunkGraph.getChunkModulesIterableBySourceType(
        chunk,
        'share-init'
      ) || [];

    for (const module of iterableModules) {
      if ((module as any)._eager) {
        eagerModulesInRemote.add((module as any)._request);
      }

      if (
        (module as any)?._eager ||
        (module as any)?._name?.startsWith('next')
      ) {
        compilation.chunkGraph.disconnectChunkAndModule(chunk, module);
      }
    }
    return eagerModulesInRemote;
  }

  private processModules(
    compilation: Compilation,
    chunk: Chunk,
    modules: Iterable<Module>,
    eagerModulesInRemote: Set<string>
  ) {
    for (const module of modules) {
      if (!compilation.chunkGraph.isModuleInChunk(module, chunk)) {
        continue;
      }

      if (
        module.constructor.name === 'NormalModule' &&
        eagerModulesInRemote.has((module as any).resource)
      ) {
        this.traverseModuleGraph(module, compilation);
      }
    }
  }

  private removeDependentModules(compilation: Compilation, chunk: Chunk) {
    for (const moduleToRemove of this.dependentModules) {
      if (this.debug) {
        console.log('removing', (moduleToRemove as any)?.resource);
      }

      if (compilation.chunkGraph.isModuleInChunk(moduleToRemove, chunk)) {
        compilation.chunkGraph.disconnectChunkAndModule(chunk, moduleToRemove);
      }
    }
  }
}

export default RemoveEagerModulesFromRuntimePlugin;
