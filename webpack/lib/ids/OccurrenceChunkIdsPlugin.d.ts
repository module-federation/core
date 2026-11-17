export = OccurrenceChunkIdsPlugin;
declare class OccurrenceChunkIdsPlugin {
    /**
     * Creates an instance of OccurrenceChunkIdsPlugin.
     * @param {OccurrenceChunkIdsPluginOptions=} options options object
     */
    constructor(options?: OccurrenceChunkIdsPluginOptions | undefined);
    /** @type {OccurrenceChunkIdsPluginOptions} */
    options: OccurrenceChunkIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace OccurrenceChunkIdsPlugin {
    export { OccurrenceChunkIdsPluginOptions };
}
import type Compiler from "../Compiler";
type OccurrenceChunkIdsPluginOptions = {
    /**
     * Prioritise initial size over total size.
     */
    prioritiseInitial?: boolean | undefined;
};
