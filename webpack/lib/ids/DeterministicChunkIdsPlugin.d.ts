export = DeterministicChunkIdsPlugin;
declare class DeterministicChunkIdsPlugin {
    /**
     * Creates an instance of DeterministicChunkIdsPlugin.
     * @param {DeterministicChunkIdsPluginOptions=} options options
     */
    constructor(options?: DeterministicChunkIdsPluginOptions | undefined);
    /** @type {DeterministicChunkIdsPluginOptions} */
    options: DeterministicChunkIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DeterministicChunkIdsPlugin {
    export { DeterministicChunkIdsPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the deterministic chunk ids plugin options type used by this module.
 */
type DeterministicChunkIdsPluginOptions = {
    /**
     * context for ids
     */
    context?: string | undefined;
    /**
     * maximum length of ids
     */
    maxLength?: number | undefined;
};
