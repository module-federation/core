export = OccurrenceModuleIdsPlugin;
declare class OccurrenceModuleIdsPlugin {
    /**
     * Creates an instance of OccurrenceModuleIdsPlugin.
     * @param {OccurrenceModuleIdsPluginOptions=} options options object
     */
    constructor(options?: OccurrenceModuleIdsPluginOptions | undefined);
    /** @type {OccurrenceModuleIdsPluginOptions} */
    options: OccurrenceModuleIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace OccurrenceModuleIdsPlugin {
    export { OccurrenceModuleIdsPluginOptions };
}
import type Compiler from "../Compiler";
type OccurrenceModuleIdsPluginOptions = {
    /**
     * Prioritise initial size over total size.
     */
    prioritiseInitial?: boolean | undefined;
};
