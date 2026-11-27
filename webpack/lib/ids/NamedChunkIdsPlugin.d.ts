export = NamedChunkIdsPlugin;
declare class NamedChunkIdsPlugin {
    /**
     * Creates an instance of NamedChunkIdsPlugin.
     * @param {NamedChunkIdsPluginOptions=} options options
     */
    constructor(options?: NamedChunkIdsPluginOptions | undefined);
    /** @type {NamedChunkIdsPluginOptions} */
    options: NamedChunkIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NamedChunkIdsPlugin {
    export { NamedChunkIdsPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the named chunk ids plugin options type used by this module.
 */
type NamedChunkIdsPluginOptions = {
    /**
     * context
     */
    context?: string | undefined;
    /**
     * delimiter
     */
    delimiter?: string | undefined;
};
