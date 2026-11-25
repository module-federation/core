export = AggressiveMergingPlugin;
declare class AggressiveMergingPlugin {
    /**
     * Creates an instance of AggressiveMergingPlugin.
     * @param {AggressiveMergingPluginOptions=} options options object
     */
    constructor(options?: AggressiveMergingPluginOptions | undefined);
    /** @type {AggressiveMergingPluginOptions} */
    options: AggressiveMergingPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AggressiveMergingPlugin {
    export { AggressiveMergingPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the aggressive merging plugin options type used by this module.
 */
type AggressiveMergingPluginOptions = {
    /**
     * minimal size reduction to trigger merging
     */
    minSizeReduce?: number | undefined;
};
