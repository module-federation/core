export = MinChunkSizePlugin;
declare class MinChunkSizePlugin {
    /**
     * Creates an instance of MinChunkSizePlugin.
     * @param {MinChunkSizePluginOptions} options options object
     */
    constructor(options: MinChunkSizePluginOptions);
    /** @type {MinChunkSizePluginOptions} */
    options: MinChunkSizePluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MinChunkSizePlugin {
    export { MinChunkSizePluginOptions };
}
import type Compiler from "../Compiler";
type MinChunkSizePluginOptions = {
    /**
     * Constant overhead for a chunk.
     */
    chunkOverhead?: number | undefined;
    /**
     * Multiplicator for initial chunks.
     */
    entryChunkMultiplicator?: number | undefined;
    /**
     * Minimum number of characters.
     */
    minChunkSize: number;
};
