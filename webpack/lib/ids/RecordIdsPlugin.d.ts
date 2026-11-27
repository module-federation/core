export = RecordIdsPlugin;
declare class RecordIdsPlugin {
    /**
     * Creates an instance of RecordIdsPlugin.
     * @param {RecordIdsPluginOptions=} options object
     */
    constructor(options?: RecordIdsPluginOptions | undefined);
    /** @type {RecordIdsPluginOptions} */
    options: RecordIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the Compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace RecordIdsPlugin {
    export { RecordsChunks, RecordsModules, Records, RecordIdsPluginOptions, UsedIds };
}
import type Compiler from "../Compiler";
/**
 * Defines the records chunks type used by this module.
 */
type RecordsChunks = {
    byName?: Record<string, number> | undefined;
    bySource?: Record<string, number> | undefined;
    usedIds?: number[] | undefined;
};
/**
 * Defines the records modules type used by this module.
 */
type RecordsModules = {
    byIdentifier?: Record<string, number> | undefined;
    usedIds?: number[] | undefined;
};
/**
 * Defines the records type used by this module.
 */
type Records = {
    chunks?: RecordsChunks | undefined;
    modules?: RecordsModules | undefined;
};
/**
 * Defines the record ids plugin options type used by this module.
 */
type RecordIdsPluginOptions = {
    /**
     * true, when ids need to be portable
     */
    portableIds?: boolean | undefined;
};
type UsedIds = Set<number>;
