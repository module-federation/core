export = MemoryWithGcCachePlugin;
declare class MemoryWithGcCachePlugin {
    /**
     * Creates an instance of MemoryWithGcCachePlugin.
     * @param {MemoryWithGcCachePluginOptions} options options
     */
    constructor({ maxGenerations }: MemoryWithGcCachePluginOptions);
    /** @type {number} */
    _maxGenerations: number;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MemoryWithGcCachePlugin {
    export { MemoryWithGcCachePluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the memory with gc cache plugin options type used by this module.
 */
type MemoryWithGcCachePluginOptions = {
    /**
     * max generations
     */
    maxGenerations: number;
};
