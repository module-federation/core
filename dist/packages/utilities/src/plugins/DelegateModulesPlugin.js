"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class DelegateModulesPlugin
 */
class DelegateModulesPlugin {
    constructor(options) {
        this.options = Object.assign({ debug: false }, options);
        this._delegateModules = new Set();
    }
    getChunkByName(chunks, name) {
        for (const chunk of chunks) {
            if (chunk.name == name) {
                return chunk;
            }
        }
        return undefined;
    }
    addDelegatesToChunks(compilation, chunks) {
        for (const chunk of chunks) {
            this._delegateModules.forEach((module) => {
                if (!compilation.chunkGraph.isModuleInChunk(module, chunk)) {
                    this.options.debug &&
                        console.log('adding ', module.identifier(), ' to chunk', chunk.name);
                    compilation.chunkGraph.connectChunkAndModule(chunk, module);
                }
            });
        }
    }
    removeDelegatesNonRuntimeChunks(compilation, chunks) {
        for (const chunk of chunks) {
            if (!chunk.hasRuntime()) {
                this.options.debug &&
                    console.log('non-runtime chunk:', chunk.debugId, chunk.id, chunk.name);
                this._delegateModules.forEach((module) => {
                    compilation.chunkGraph.disconnectChunkAndModule(chunk, module);
                });
            }
        }
    }
    /**
     * Applies the plugin to the webpack compiler.
     * @param {Compiler} compiler - The webpack compiler instance.
     */
    apply(compiler) {
        // Tap into compilation hooks
        compiler.hooks.compilation.tap('DelegateModulesPlugin', (compilation) => {
            // fills this._delegateModules set
            this.resolveDelegateModules(compilation);
            compilation.hooks.optimizeChunks.tap('DelegateModulesPlugin', (chunks) => {
                // Change this line
                const { runtime, container } = this.options;
                const runtimeChunk = this.getChunkByName(chunks, runtime);
                if (!runtimeChunk || !runtimeChunk.hasRuntime())
                    return;
                // Get the container chunk if specified
                const remoteContainer = container
                    ? this.getChunkByName(chunks, container)
                    : null;
                this.options.debug &&
                    console.log(remoteContainer === null || remoteContainer === void 0 ? void 0 : remoteContainer.name, runtimeChunk.name, this._delegateModules.size);
                this.addDelegatesToChunks(compilation, [remoteContainer, runtimeChunk].filter(Boolean));
                this.removeDelegatesNonRuntimeChunks(compilation, chunks);
            });
        });
    }
    resolveDelegateModules(compilation) {
        // Tap into the 'finish-modules' hook to access the module list after they are all processed
        compilation.hooks.finishModules.tapAsync('ModuleIDFinderPlugin', (modules, callback) => {
            const { remotes } = this.options;
            // Get the delegate module names for remote chunks if specified
            const knownDelegates = new Set(remotes
                ? Object.values(remotes).map((remote) => remote.replace('internal ', ''))
                : []);
            for (const module of modules) {
                // @ts-ignore
                if (module.resource && knownDelegates.has(module.resource)) {
                    this._delegateModules.add(module);
                }
            }
            // Continue the process
            callback();
        });
    }
}
exports.default = DelegateModulesPlugin;
//# sourceMappingURL=DelegateModulesPlugin.js.map