"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RemoveEagerModulesFromRuntimePlugin {
    constructor(options) {
        this.container = options.container;
        this.debug = options.debug || false;
        this.dependentModules = new Set();
        this.visitedModules = new Set();
    }
    apply(compiler) {
        if (!this.container) {
            console.warn('[nextjs-mf]:', 'RemoveEagerModulesFromRuntimePlugin container is not defined:', this.container);
            return;
        }
        //return 
        compiler.hooks.thisCompilation.tap('RemoveEagerModulesFromRuntimePlugin', (compilation) => {
            compilation.hooks.optimizeChunkModules.tap('RemoveEagerModulesFromRuntimePlugin', (chunks, modules) => {
                for (const chunk of chunks) {
                    if (chunk.hasRuntime() && chunk.name === this.container) {
                        const eagerModulesInRemote = this.getEagerModulesInRemote(compilation, chunk);
                        this.processModules(compilation, chunk, modules, eagerModulesInRemote);
                        this.removeDependentModules(compilation, chunk);
                    }
                }
            });
        });
    }
    traverseModuleGraph(module, compilation) {
        // Check if module has been visited before
        if (this.visitedModules.has(module)) {
            return; // Skip traversal if module has been visited
        }
        this.visitedModules.add(module); // Mark module as visited
        // Skip traversal for certain module types
        if (module.constructor.name === 'ExternalModule' ||
            module.type === 'provide-module' ||
            module.type === 'consume-shared-module') {
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
    getEagerModulesInRemote(compilation, chunk) {
        const eagerModulesInRemote = new Set();
        const iterableModules = compilation.chunkGraph.getChunkModulesIterableBySourceType(chunk, 'share-init') || [];
        for (const module of iterableModules) {
            if (module._eager) {
                //@ts-ignore
                eagerModulesInRemote.add(module._request);
            }
            if (module?._eager ||
                module?._name?.startsWith('next')) {
                compilation.chunkGraph.disconnectChunkAndModule(chunk, module);
            }
        }
        return eagerModulesInRemote;
    }
    processModules(compilation, chunk, modules, eagerModulesInRemote) {
        for (const module of modules) {
            if (!compilation.chunkGraph.isModuleInChunk(module, chunk)) {
                continue;
            }
            if (module.constructor.name === 'NormalModule' &&
                eagerModulesInRemote.has(module.resource)) {
                this.traverseModuleGraph(module, compilation);
            }
        }
    }
    removeDependentModules(compilation, chunk) {
        for (const moduleToRemove of this.dependentModules) {
            if (this.debug) {
                //@ts-ignore
                console.log('removing', moduleToRemove?.resource, 
                //@ts-ignore
                moduleToRemove?.request, chunk.name, moduleToRemove.constructor.name);
            }
            if (compilation.chunkGraph.isModuleInChunk(moduleToRemove, chunk)) {
                compilation.chunkGraph.disconnectChunkAndModule(chunk, moduleToRemove);
            }
        }
    }
}
exports.default = RemoveEagerModulesFromRuntimePlugin;
//# sourceMappingURL=RemoveEagerModulesFromRuntimePlugin.js.map