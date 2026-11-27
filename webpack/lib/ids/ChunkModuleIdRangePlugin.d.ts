export = ChunkModuleIdRangePlugin;
declare class ChunkModuleIdRangePlugin {
    /**
     * Creates an instance of ChunkModuleIdRangePlugin.
     * @param {ChunkModuleIdRangePluginOptions} options options object
     */
    constructor(options: ChunkModuleIdRangePluginOptions);
    /** @type {ChunkModuleIdRangePluginOptions} */
    options: ChunkModuleIdRangePluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ChunkModuleIdRangePlugin {
    export { ChunkModuleIdRangePluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the chunk module id range plugin options type used by this module.
 */
type ChunkModuleIdRangePluginOptions = {
    /**
     * the chunk name
     */
    name: string;
    /**
     * order
     */
    order?: ("index" | "index2" | "preOrderIndex" | "postOrderIndex") | undefined;
    /**
     * start id
     */
    start?: number | undefined;
    /**
     * end id
     */
    end?: number | undefined;
};
