import type { Compiler, Compilation, Chunk, Module } from 'webpack';
/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class DelegateModulesPlugin
 */
declare class DelegateModulesPlugin {
    options: {
        debug: boolean;
        [key: string]: any;
    };
    _delegateModules: Set<Module>;
    constructor(options: {
        debug?: boolean;
        [key: string]: any;
    });
    getChunkByName(chunks: Iterable<Chunk>, name: string): Chunk | undefined;
    addDelegatesToChunks(compilation: Compilation, chunks: Chunk[]): void;
    removeDelegatesNonRuntimeChunks(compilation: Compilation, chunks: Iterable<Chunk>): void;
    /**
     * Applies the plugin to the webpack compiler.
     * @param {Compiler} compiler - The webpack compiler instance.
     */
    apply(compiler: Compiler): void;
    resolveDelegateModules(compilation: Compilation): void;
}
export default DelegateModulesPlugin;
