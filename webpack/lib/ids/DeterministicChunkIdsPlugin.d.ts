export = DeterministicChunkIdsPlugin;
declare class DeterministicChunkIdsPlugin {
    /**
     * @param {DeterministicChunkIdsPluginOptions=} options options
     */
    constructor(options?: DeterministicChunkIdsPluginOptions | undefined);
    options: DeterministicChunkIdsPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DeterministicChunkIdsPlugin {
    export { Compiler, DeterministicChunkIdsPluginOptions };
}
type Compiler = import("../Compiler");
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
