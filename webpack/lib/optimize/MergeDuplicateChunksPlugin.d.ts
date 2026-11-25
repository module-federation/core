export = MergeDuplicateChunksPlugin;
declare class MergeDuplicateChunksPlugin {
    /**
     * Creates an instance of MergeDuplicateChunksPlugin.
     * @param {MergeDuplicateChunksPluginOptions=} options options object
     */
    constructor(options?: MergeDuplicateChunksPluginOptions | undefined);
    /** @type {MergeDuplicateChunksPluginOptions} */
    options: MergeDuplicateChunksPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MergeDuplicateChunksPlugin {
    export { MergeDuplicateChunksPluginOptions };
}
import type Compiler from "../Compiler";
type MergeDuplicateChunksPluginOptions = {
    /**
     * Specifies the stage for merging duplicate chunks.
     */
    stage?: number | undefined;
};
